// ─────────────────────────────────────────────────────────────
// runner · 模型调用的唯一入口
//
// 流程（第十节）：变量齐套检查 → 取模板构造消息 → 调用（直连或同源中转）
// → 解析 JSON → 模板校验 → verifyEvidence 逐条证据校验 → 不合格带错误
// 重试一次 → 仍失败返回明确 status。无 key 时返回模板自带 mock（标注模拟）。
//
// 本模块只在浏览器/Node18+ 运行，依赖全局 fetch；core 与 templates 保持纯净。
// ─────────────────────────────────────────────────────────────

import { getTemplate, TEMPLATE_IDS } from './templates.js'
import { recordCall, buildLogEntry } from './callLog.js'

/**
 * @typedef {Object} ModelSettings
 * @property {string} provider  provider id（deepseek / openai-compat / proxy）
 * @property {string} baseUrl
 * @property {string} apiKey
 * @property {string} model
 */

/**
 * 调用结果。
 * @typedef {Object} RunResult
 * @property {'ok'|'mock'|'missing-vars'|'bad-template'|'invalid-output'|'http-error'|'network-error'} status
 * @property {boolean} simulated 是否模拟反馈（界面必须醒目标注）
 * @property {object|null} data 解析后的输出
 * @property {string} [reason] 失败原因（给用户看的中文说明）
 * @property {boolean} evidenceOk 证据逐条校验是否通过
 * @property {string[]} missingEvidence 未通过证据校验的引用
 * @property {Array<{role:string, content:string}>} preview 本次实际发送的消息（发送前预览/留档）
 */

const MAX_INPUT_CHARS = 24000
const TIMEOUT_MS = 45000

/**
 * 检查变量是否齐套。
 * @param {object} template
 * @param {Record<string, unknown>} variables
 * @returns {string[]} 缺失变量名
 */
export function checkVariables(template, variables) {
  const v = variables || {}
  return template.variables.filter((name) => {
    const val = v[name]
    if (val === undefined || val === null) return true
    if (typeof val === 'string' && !val.trim()) return true
    return false
  })
}

/**
 * 输入长度上限（中转服务同样强制执行；模板注册白名单见 api/ielts/llm.js）。
 * @param {Record<string, unknown>} variables
 * @returns {boolean}
 */
export function withinInputLimit(variables) {
  const total = Object.values(variables || {})
    .map((v) => (typeof v === 'string' ? v : JSON.stringify(v ?? '')))
    .reduce((a, b) => a + b.length, 0)
  return total <= MAX_INPUT_CHARS
}

/**
 * 构造将发送给模型的完整消息（供界面"发送前让用户知道会发送什么"）。
 * @param {object} template
 * @param {Record<string, unknown>} variables
 * @returns {Array<{role:string, content:string}>}
 */
export function buildMessages(template, variables) {
  return [
    { role: 'system', content: template.buildSystem(template) },
    { role: 'user', content: template.buildUser(variables) },
  ]
}

function hasKey(settings) {
  return Boolean(settings && String(settings.apiKey || '').trim())
}

async function callHttp(settings, template, variables, retryNote = '') {
  const useProxy = settings.provider === 'proxy'
  const endpoint = useProxy ? '/api/ielts/llm' : (settings.baseUrl || '').replace(/\/$/, '')
  const body = useProxy
    ? {
        templateId: template.id,
        version: template.version,
        variables,
        model: settings.model,
        apiKey: settings.apiKey, // 只转发、不落盘（见 api/ielts/llm.js）
      }
    : {
        model: settings.model,
        messages: retryNote
          ? [...buildMessages(template, variables), { role: 'user', content: retryNote }]
          : buildMessages(template, variables),
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }
  const headers = { 'Content-Type': 'application/json' }
  if (!useProxy) headers.Authorization = `Bearer ${settings.apiKey}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (err) {
    return { httpError: err?.name === 'AbortError' ? `请求超时（${TIMEOUT_MS / 1000}s）` : '网络请求失败，请检查服务商地址与网络' }
  } finally {
    clearTimeout(timer)
  }
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    return { httpError: `服务商返回 ${response.status}：${text.slice(0, 200)}` }
  }
  const payload = await response.json().catch(() => null)
  const content = payload?.choices?.[0]?.message?.content
  if (typeof content !== 'string') return { httpError: '服务商响应缺少 choices[0].message.content' }
  return { content }
}

function evaluateOutput(template, parsed, variables) {
  const errors = template.validate(parsed)
  let evidence = { ok: true, missing: [] }
  if (errors.length === 0 && typeof template.verifyOutput === 'function') {
    evidence = template.verifyOutput(parsed, variables)
  }
  return { errors, evidence }
}

/**
 * 执行一次模板调用。
 * @param {string} templateId
 * @param {Record<string, unknown>} variables
 * @param {ModelSettings} [settings]
 * @returns {Promise<RunResult>}
 */
export async function runTemplate(templateId, variables, settings) {
  const template = getTemplate(templateId)
  if (!template || !TEMPLATE_IDS.includes(templateId)) {
    return { status: 'bad-template', simulated: false, data: null, evidenceOk: true, missingEvidence: [], preview: [], reason: `未注册的模板 id：${templateId}` }
  }
  const missing = checkVariables(template, variables)
  if (missing.length) {
    return { status: 'missing-vars', simulated: false, data: null, evidenceOk: true, missingEvidence: [], preview: [], reason: `缺少必填变量：${missing.join(', ')}` }
  }
  if (!withinInputLimit(variables)) {
    return { status: 'invalid-output', simulated: false, data: null, evidenceOk: true, missingEvidence: [], preview: [], reason: `输入超过 ${MAX_INPUT_CHARS} 字符上限，请缩短原文或文稿` }
  }

  // 无 key：确定性模拟反馈（醒目标注由界面按 simulated 渲染）
  if (!hasKey(settings)) {
    const started = Date.now()
    const data = template.mock(variables)
    const { errors, evidence } = evaluateOutput(template, data, variables)
    const result = {
      status: 'mock',
      simulated: true,
      data,
      evidenceOk: evidence.ok,
      missingEvidence: evidence.missing,
      validationErrors: errors,
      evidenceFields: template.evidenceFields,
      preview: buildMessages(template, variables),
    }
    logCall(template, result, variables, settings, started)
    return result
  }

  let lastReason = ''
  let lastErrors = []
  let lastMissing = []
  const started = Date.now()
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const retryNote = attempt === 0
      ? ''
      : `上一次输出不合格：${lastReason}。请只输出合法 JSON，并确保所有引用逐字来自原文。`
    const res = await callHttp(settings, template, variables, retryNote)
    if (res.httpError) {
      const result = {
        status: 'http-error', simulated: false, data: null, evidenceOk: true,
        missingEvidence: [], validationErrors: [], evidenceFields: template.evidenceFields,
        preview: buildMessages(template, variables), reason: res.httpError,
      }
      logCall(template, result, variables, settings, started)
      return result
    }
    let parsed
    try {
      parsed = JSON.parse(extractJson(res.content))
    } catch {
      lastReason = '模型没有返回合法 JSON'
      continue
    }
    const { errors, evidence } = evaluateOutput(template, parsed, variables)
    if (errors.length === 0 && evidence.ok) {
      const result = {
        status: 'ok', simulated: false, data: parsed, evidenceOk: true,
        missingEvidence: [], validationErrors: [], evidenceFields: template.evidenceFields,
        preview: buildMessages(template, variables),
      }
      logCall(template, result, variables, settings, started)
      return result
    }
    lastErrors = errors
    lastMissing = evidence.missing
    lastReason = errors.length ? errors.join('；') : `引用不是原文逐字子串：${evidence.missing.join(' | ')}`
  }

  const result = {
    status: 'invalid-output',
    simulated: false,
    data: null,
    evidenceOk: lastMissing.length === 0,
    missingEvidence: lastMissing,
    validationErrors: lastErrors.length ? lastErrors : ['invalid-json'],
    evidenceFields: template.evidenceFields,
    preview: buildMessages(template, variables),
    reason: `模型输出连续两次不合规：${lastReason}。可重试或改用模拟反馈。`,
  }
  logCall(template, result, variables, settings, started)
  return result
}

function logCall(template, result, variables, settings, started) {
  try {
    recordCall(buildLogEntry({
      templateId: template.id,
      version: template.version,
      result,
      variables,
      provider: settings?.provider || '',
      ms: Date.now() - started,
    }))
  } catch {
    // 日志失败绝不影响主流程
  }
}

/**
 * 容忍模型把 JSON 包在 ```json 代码块里。
 * @param {string} content
 * @returns {string}
 */
export function extractJson(content) {
  const trimmed = String(content || '').trim()
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) return fence[1].trim()
  const first = trimmed.indexOf('{')
  const last = trimmed.lastIndexOf('}')
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1)
  return trimmed
}
