// ─────────────────────────────────────────────────────────────
// recents · 最近访问的算法 slug（localStorage 单值）
//
// 从 HomePage 抽出来后，AlgorithmPage 与 ProfilePage 都直接依赖本服务而不是
// 互相导入页面组件，消除了"页面 → 页面"的反向依赖。
// ─────────────────────────────────────────────────────────────

const RECENT_KEY = 'cshub-recent-algo'

export function recordRecentAlgo(slug) {
  try {
    localStorage.setItem(RECENT_KEY, slug)
  } catch {
    /* 隐私模式 / 嵌入环境 可能无法访问 localStorage —— 静默失败 */
  }
}

export function getRecentAlgoSlug() {
  try {
    return localStorage.getItem(RECENT_KEY)
  } catch {
    return null
  }
}
