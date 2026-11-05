// ─────────────────────────────────────────────────────────────
// /api/ielts/llm · 同源中转（Vercel Node Serverless Function）
//
// 用途：服务商不允许浏览器跨域直连时使用。安全约束（产品定稿第九节）：
//   - 只转发、不保存：不写日志、不持久化任何请求内容；
//   - apiKey 只作为向上游转发的 Authorization 头，绝不出现在响应/日志里；
//   - 模板白名单：只接受网页版注册过的 templateId；
//   - 限制输入长度与超时，防止滥用与长连接。
// 同一仓库 Vite 构建不会打包本文件（在 api/ 目录）。
// ─────────────────────────────────────────────────────────────

import { TEMPLATE_IDS, getTemplate } from '../../src/features/ielts/llm/templates.js'

export const config = { maxDuration: 60 }

const MAX_BODY_CHARS = 60000
const UPSTREAM_TIMEOUT_MS = 45000

function error(status, message) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return error(405, 'Method Not Allowed')
  }

  let payload
  try {
    payload = await req.json()
  } catch {
    return error(400, 'invalid json body')
  }

  const { templateId, variables = {}, model, apiKey, baseUrl } = payload || {}
  if (!templateId || !TEMPLATE_IDS.includes(templateId)) {
    return error(400, 'template is not registered')
  }
  if (!apiKey || typeof apiKey !== 'string') return error(401, 'missing api key')
  // The server-side relay is deliberately limited to known upstreams. Custom
  // OpenAI-compatible providers remain available through direct browser calls.
  const allowedUpstreams = new Set([
    'https://api.deepseek.com/chat/completions',
    'https://api.deepseek.com/v1/chat/completions',
    'https://api.openai.com/v1/chat/completions',
  ])
  const upstream = baseUrl || 'https://api.deepseek.com/chat/completions'
  if (typeof upstream !== 'string' || !allowedUpstreams.has(upstream)) {
    return error(400, 'unsupported upstream')
  }

  const serialized = JSON.stringify(variables || {})
  if (serialized.length > MAX_BODY_CHARS) return error(413, 'input too large')

  const template = getTemplate(templateId)
  const messages = [
    { role: 'system', content: template.buildSystem(template) },
    { role: 'user', content: template.buildUser(variables) },
  ]

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)
  try {
    const upstreamRes = await fetch(upstream, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      redirect: 'error',
      signal: controller.signal,
    })
    const text = await upstreamRes.text()
    // 原样透传状态码与上游响应体（OpenAI 兼容 JSON），不做任何字段记录。
    return new Response(text, {
      status: upstreamRes.status,
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    return error(502, err?.name === 'AbortError' ? 'upstream timeout' : 'upstream request failed')
  } finally {
    clearTimeout(timer)
  }
}
