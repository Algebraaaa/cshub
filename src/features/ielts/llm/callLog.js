// 模型调用本地脱敏日志：只记录“发生了什么质量信号”，不记录任何用户内容。
// 明确不落库：apiKey、system/user 全文、模型返回正文；只留模板 id/版本、
// 状态、字段名、长度与输出的非可逆短哈希，用于复现与质量回归。
import { readJSON, writeJSON } from '../../../services/storage/LocalStore.js'

export const CALL_LOG_KEY = 'cshub-ielts-llm-calls-v1'
const MAX_ENTRIES = 400

// 32 位 FNV-1a：仅用于判断“两次输出是否同一份”，不可逆推内容。
export function fnv1a(str) {
  let h = 0x811c9dc5
  const s = String(str)
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

// 从 runner 结果里抽取可记录的元数据（纯结构信息，不含正文）。
export function buildLogEntry({ templateId, version, result, variables = {}, provider = '', ms = 0, ts = Date.now() }) {
  const data = result?.data || null
  const outputKeys = data && typeof data === 'object' ? Object.keys(data) : []
  const evidenceFields = result?.evidenceFields || []
  return {
    ts,
    templateId,
    version,
    provider: provider ? String(provider).slice(0, 24) : '',
    status: result?.status || 'unknown',
    simulated: Boolean(result?.simulated),
    evidenceOk: result?.evidenceOk !== false,
    validationErrors: Array.isArray(result?.validationErrors) ? result.validationErrors.slice(0, 5) : [],
    inputVarNames: Object.keys(variables || {}),
    inputChars: Object.values(variables || {}).reduce((n, v) => n + (typeof v === 'string' ? v.length : 0), 0),
    outputKeys,
    outputHash: data ? fnv1a(JSON.stringify(data)) : '',
    evidenceFields,
    ms: Math.max(0, Math.round(ms)),
  }
}

export function getCallLogs() {
  const v = readJSON(CALL_LOG_KEY, [])
  return Array.isArray(v) ? v : []
}

export function recordCall(entry) {
  const list = getCallLogs()
  list.push(entry)
  if (list.length > MAX_ENTRIES) list.splice(0, list.length - MAX_ENTRIES)
  writeJSON(CALL_LOG_KEY, list)
  return entry
}

export function clearCallLogs() {
  writeJSON(CALL_LOG_KEY, [])
}

// 复现包：日志 + 当前模板注册表（含变量与输出结构），仍不含任何正文与 key。
export function buildReproPack(templates) {
  const tpls = templates.map((t) => ({
    id: t.id,
    version: t.version,
    variables: t.variables,
    evidenceSourceVar: t.evidenceSourceVar,
    evidenceFields: t.evidenceFields,
    outputKeys: Object.keys(t.outputSchema || {}),
  }))
  return {
    kind: 'cshub-ielts-llm-repro-pack',
    generatedAt: new Date().toISOString(),
    note: '脱敏复现包：无 API key、无原文/文稿/题目正文、无模型输出全文；outputHash 为 FNV-1a 短哈希。',
    templates: tpls,
    logs: getCallLogs(),
  }
}
