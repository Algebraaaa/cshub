// ─────────────────────────────────────────────────────────────
// 全局错误可观测 · 轻量上报管道
//
// 设计目标:
//   1. 兜住三类未捕获错误:window error / unhandledrejection / React
//      ErrorBoundary(componentDidCatch 手动接入 reportError)。
//   2. 可插拔 reporter:默认 console + Vercel Analytics 自定义事件;
//      将来接 Sentry 等 APM 只需在应用入口 addReporter() 一处接线。
//   3. 自我保护:去重(同 message 60s 窗口)+ 会话限额(20 条),
//      防止渲染循环类错误打爆 Vercel 自定义事件配额;上报管道内部
//      任何异常都被吞掉,绝不因监控本身把应用搞崩。
//
// 使用:main.jsx 在 createRoot 之前调 initMonitoring()(这样才兜得住
// AppProviders / 首屏 lazy chunk 的加载失败)。
// ─────────────────────────────────────────────────────────────
import { track } from '@vercel/analytics'

const DEDUPE_WINDOW_MS = 60_000
const SESSION_LIMIT = 20

const seenAt = new Map() // message → 上次上报时间戳
let reportedCount = 0

function truncate(str, max) {
  if (typeof str !== 'string') return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}

/** 识别典型错误来源,便于在面板里按类聚合(chunk-load 是部署后旧 chunk 404 的典型症状)。
    chunk-load 按 message 判定且优先于 context.source——动态 import 失败通常
    以 unhandledrejection 形式冒泡,不能被 'unhandled-rejection' 标签掩盖。 */
function classify(message, context) {
  if (/Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(message)) {
    return 'chunk-load'
  }
  return context.source || 'unknown'
}

function consoleReporter(payload) {
  // eslint-disable-next-line no-console
  console.error('[monitoring]', payload)
}

function vercelReporter(payload) {
  if (import.meta.env.DEV) return // dev 环境不打配额;track 在非 Vercel 环境本身也是 no-op
  // Vercel track 属性只接受原始类型且有长度限制,payload 构造时已截断
  track('client_error', payload)
}

const reporters = [consoleReporter, vercelReporter]

/** 将来接 Sentry:import 后在入口 addReporter(sentryReporter) 即可,业务代码零改动 */
export function addReporter(fn) {
  reporters.push(fn)
}

/**
 * 统一上报入口。error 可以是 Error、字符串或任意值(unhandledrejection
 * 的 reason 不保证是 Error);context 支持 { source, componentStack, ... }。
 */
export function reportError(error, context = {}) {
  try {
    const err = error instanceof Error ? error : new Error(String(error ?? 'unknown'))
    const message = err.message || 'unknown'

    // 会话限额 + 同 message 时间窗去重
    if (reportedCount >= SESSION_LIMIT) return
    const last = seenAt.get(message)
    const now = Date.now()
    if (last && now - last < DEDUPE_WINDOW_MS) return
    seenAt.set(message, now)
    reportedCount++

    const payload = {
      name: truncate(err.name || 'Error', 50),
      message: truncate(message, 200),
      stack: truncate(err.stack || '', 500),
      pathname: truncate(window.location?.pathname || '', 100),
      source: classify(message, context),
    }
    if (context.componentStack) payload.componentStack = truncate(context.componentStack, 500)

    for (const report of reporters) {
      try { report(payload) } catch { /* reporter 自身异常不外溢 */ }
    }
  } catch { /* 监控管道绝不抛错 */ }
}

/** 挂全局监听。须在 React render 之前调用,兜住首屏 chunk 加载失败。 */
export function initMonitoring() {
  window.addEventListener('error', (e) => {
    // 资源加载错误(img/script 标签等)的 target 不是 window,噪声大且无 stack,忽略
    if (e.target && e.target !== window) return
    reportError(e.error || e.message, { source: undefined })
  }, true)

  window.addEventListener('unhandledrejection', (e) => {
    reportError(e.reason, { source: 'unhandled-rejection' })
  })
}
