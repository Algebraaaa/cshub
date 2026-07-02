// ─────────────────────────────────────────────────────────────
// 路由级 Suspense fallback 骨架屏
//   - min-h 与旧 PageFallback 的 55vh 一致,避免布局跳动
//   - glass-card 形状的 pulse 占位,CSS 变量自动适配明暗主题
//   - 整体延迟 ~150ms 才显现(skeleton-fade-in):秒开的 chunk 切换
//     不闪骨架,只有真正慢的加载才看到
//   - compact 变体给页面内局部 Suspense 用(如 AI 课节正文)
// ─────────────────────────────────────────────────────────────
export default function PageSkeleton({ compact = false }) {
  if (compact) {
    return (
      <div className="skeleton-fade-in flex flex-col gap-3 py-4" aria-hidden>
        <div className="glass-card-sm h-8 w-2/5 animate-pulse" />
        <div className="glass-card h-40 animate-pulse" />
        <div className="glass-card h-24 animate-pulse" />
      </div>
    )
  }
  return (
    <div className="skeleton-fade-in mx-auto flex min-h-[55vh] w-full max-w-5xl flex-col gap-4 px-4 py-8" aria-hidden>
      <div className="glass-card-sm h-10 w-1/3 animate-pulse" />
      <div className="glass-card h-48 animate-pulse" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="glass-card h-32 animate-pulse" />
        <div className="glass-card h-32 animate-pulse" />
      </div>
    </div>
  )
}
