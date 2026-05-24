import { lazy, Suspense, useEffect, useState, useCallback } from 'react'
import { Prose } from './Section'
import CodeBlock from './CodeBlock'
import ComplexityCards from './ComplexityCards'
import ComplexityAnalysis from './ComplexityAnalysis'
import CategoryComparison from './CategoryComparison'
import Quiz from './Quiz'
import { QUIZZES } from '../../data/quizzes'

const Notes = lazy(() => import('./Notes'))

// ─────────────────────────────────────────────────────────────
// AlgorithmTabs：把详情页 8 个垂直 section 压成 1 个 Tab 区。
// 永远可见的 Header + Viz 由 AlgorithmPage 自己渲染。
// URL hash 同步：#tab=quiz 可分享到具体 tab。
// ─────────────────────────────────────────────────────────────

const TAB_DEFS = [
  { id: 'intuition',  label: '原理',   icon: '💡', short: 'Why' },
  { id: 'pseudocode', label: '伪代码', icon: '🧩', short: 'PseudoCode' },
  { id: 'complexity', label: '复杂度', icon: '📈', short: 'Big-O' },
  { id: 'compare',    label: '对比',   icon: '⚖️', short: 'Compare' },
  { id: 'quiz',       label: '测验',   icon: '📝', short: 'Quiz' },
  { id: 'notes',      label: '笔记',   icon: '📓', short: 'Notes' },
]

function readHashTab() {
  if (typeof window === 'undefined') return TAB_DEFS[0].id
  const m = window.location.hash.match(/tab=([\w-]+)/)
  if (m && TAB_DEFS.some(t => t.id === m[1])) return m[1]
  return TAB_DEFS[0].id
}

export default function AlgorithmTabs({ algo }) {
  const [active, setActive] = useState(readHashTab)
  const hasQuiz = !!QUIZZES[algo.slug]

  const select = useCallback((id) => {
    setActive(id)
    try {
      const newHash = `#tab=${id}`
      if (window.location.hash !== newHash) {
        history.replaceState(null, '', window.location.pathname + window.location.search + newHash)
      }
    } catch { /* ignore */ }
  }, [])

  // 同一标签内切算法时回到默认 tab
  useEffect(() => {
    const fromHash = readHashTab()
    setActive(fromHash)
  }, [algo.slug])

  // 监听 popstate（用户手动改 hash）
  useEffect(() => {
    const onHashChange = () => setActive(readHashTab())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <section className="mt-6">
      {/* Tab bar */}
      <div role="tablist" aria-label="算法详情"
        className="sticky top-14 z-10 -mx-4 mb-4 flex flex-wrap items-center gap-1 overflow-x-auto px-4 py-2
                   border-b border-[var(--glass-border)]
                   bg-[var(--header-bg)]
                   backdrop-blur-xl
                   sm:mx-0 sm:rounded-xl sm:border sm:border-[var(--glass-border-strong)] sm:bg-[var(--glass-bg-mid)] sm:px-2 sm:py-1.5"
      >
        {TAB_DEFS.map(t => {
          if (t.id === 'quiz' && !hasQuiz) return null
          const isActive = active === t.id
          return (
            <button key={t.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${t.id}`}
              id={`tab-${t.id}`}
              onClick={() => select(t.id)}
              className={[
                'group inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-150 outline-none',
                isActive
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-light)] shadow-[inset_0_0_0_1px_var(--accent-border)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--glass-bg-strong)] hover:text-[var(--text-primary)]',
                'focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]',
              ].join(' ')}
            >
              <span className="text-[15px] leading-none">{t.icon}</span>
              <span>{t.label}</span>
              <span className="hidden text-[10px] font-mono uppercase tracking-wider text-[var(--text-tertiary)] sm:inline">
                {t.short}
              </span>
            </button>
          )
        })}
      </div>

      {/* Panels */}
      <div className="rounded-2xl border border-[var(--glass-border-strong)] bg-[var(--glass-bg-mid)] p-5 backdrop-blur-2xl
                      shadow-[0_12px_40px_rgba(0,0,0,0.10),inset_0_1px_1px_rgba(255,255,255,0.16)]">
        {active === 'intuition' && (
          <Panel id="intuition" title="算法原理">
            <Prose text={algo.intuition} />
            {algo.applications?.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                  应用场景
                </div>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {algo.applications.map((app, i) => (
                    <li key={i} className="flex items-start gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-sm text-[var(--text-secondary)]">
                      <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded bg-[var(--accent-soft)] text-[11px] font-bold text-[var(--accent-light)]">
                        {i + 1}
                      </span>
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Panel>
        )}

        {active === 'pseudocode' && (
          <Panel id="pseudocode" title="伪代码">
            <CodeBlock code={algo.pseudocode} lang="pseudo" title="pseudocode.txt" highlightLine={null} noAutoScroll={true} />
          </Panel>
        )}

        {active === 'complexity' && (
          <Panel id="complexity" title="复杂度推导">
            <ComplexityCards algo={algo} compact />
            <div className="mt-4">
              <ComplexityAnalysis algo={algo} />
            </div>
          </Panel>
        )}

        {active === 'compare' && (
          <Panel id="compare" title="同类算法对比">
            <CategoryComparison algo={algo} />
          </Panel>
        )}

        {active === 'quiz' && hasQuiz && (
          <Panel id="quiz" title="课后测验">
            <Quiz questions={QUIZZES[algo.slug]} slug={algo.slug} />
          </Panel>
        )}

        {active === 'notes' && (
          <Panel id="notes" title={null}>
            <Suspense fallback={<div className="text-sm text-[var(--text-tertiary)]">正在加载笔记...</div>}>
              <Notes slug={algo.slug} />
            </Suspense>
          </Panel>
        )}
      </div>
    </section>
  )
}

function Panel({ id, title, children }) {
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`}>
      {title && (
        <h2 className="mb-4 text-base font-bold tracking-tight text-[var(--text-primary)]">
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}
