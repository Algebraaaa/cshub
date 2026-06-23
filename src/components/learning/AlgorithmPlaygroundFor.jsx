import { lazy, memo, Suspense } from 'react'
import { PLAYGROUND_LOADERS } from './playgroundRegistry'

// 模块级常量：lazy 对象在模块加载后稳定，不随渲染重建
const PLAYGROUND_COMPONENTS = Object.fromEntries(
  Object.entries(PLAYGROUND_LOADERS).map(([viz, loader]) => [viz, lazy(loader)])
)

function PlaygroundFallback() {
  return <div style={{ minHeight: 260 }} aria-busy="true" />
}

// memo：algo 对象引用稳定（slug 不变时不会重建），主题切换不应重渲染此组件
// Playground 内部使用 CSS 变量处理主题颜色，不读取 React theme context
const PlaygroundFor = memo(function PlaygroundFor({ algo }) {
  const Playground = PLAYGROUND_COMPONENTS[algo.viz]
  const props = { algoFn: algo.fn, algoSlug: algo.slug, viz: algo.viz }

  if (!Playground) {
    // 优雅兜底：未注册的 viz 不再裸露开发者文案，显示"建设中"卡片，
    // 与 AI 课的 AIPlaygroundUnavailable 一致。正常情况下不会触达
    // （vizAcceptance.test 保证每个算法 viz 都有 loader）。
    return (
      <div className="rounded-xl border border-border-soft bg-surface p-6 text-left">
        <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-2">建设中</div>
        <h2 className="text-lg font-bold text-fg mb-2">{algo.name || algo.slug}</h2>
        <p className="text-sm leading-7 text-fg-muted">该算法的交互可视化正在建设中。</p>
        <div className="mt-3 rounded-lg border border-border-soft bg-[var(--bg)] px-3 py-2 text-xs font-mono text-fg-muted">
          viz: <span className="text-accent">{algo.viz || '-'}</span>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<PlaygroundFallback />}>
      <Playground {...props} />
    </Suspense>
  )
})

export default PlaygroundFor
