import { Link } from 'react-router-dom'
import { ALGORITHM_LIBRARY_LIST, ALGORITHMS } from '../../data/algorithmMeta'
import { PATH_LIST, getPathProgress } from '../../data/paths'

// ProfilePage 的「下一步推荐」板块 · Tailwind only
// 左：推荐路径（取 3 条进度 < 100% 的）
// 右：弱项复习（quiz 正确率 < 80% 的算法，取 3 条）
export default function Recommendations({ completed, quizScores }) {
  const recommendedPaths = PATH_LIST
    .map(p => ({ p, prog: getPathProgress(p.id, completed) }))
    .filter(({ prog }) => prog.pct < 100)
    .slice(0, 3)

  const weakItems = ALGORITHM_LIBRARY_LIST
    .filter(algo => {
      const s = quizScores?.[algo.slug]
      return s && s.total > 0 && s.correct / s.total < 0.8
    })
    .slice(0, 3)

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="glass-card">
        <div className="section-eyebrow mb-3">推荐路径</div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
          {recommendedPaths.length === 0 && (
            <div className="text-[13px] text-fg-faint">所有路径都已完成 🎉</div>
          )}
          {recommendedPaths.map(({ p, prog }) => {
            const nextSlug = p.slugs.find(s => !completed.has(s)) || p.slugs[0]
            const nextAlgo = ALGORITHMS[nextSlug]
            return (
              <Link key={p.id} to={`/path/${p.id}`}
                className="group relative flex min-h-[148px] flex-col gap-2 overflow-hidden rounded-2xl
                           border border-glass-border bg-surface p-4 transition-all hover:-translate-y-px">
                <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] opacity-80"
                  style={{ background: p.color }} />
                <span className="text-[15px] font-extrabold text-fg">{p.p?.name || p.name}</span>
                <span className="line-clamp-2 flex-1 text-[12px] leading-snug text-fg-faint">{p.desc}</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-extrabold" style={{ color: p.color }}>
                    {nextAlgo?.name || nextSlug}
                  </span>
                  <span className="font-mono text-[11px] text-fg-faint">{prog.done}/{prog.total}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="glass-card">
        <div className="section-eyebrow mb-3">弱项复习</div>
        {weakItems.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {weakItems.map(algo => {
              const s = quizScores[algo.slug]
              const pct = Math.round((s.correct / s.total) * 100)
              return (
                <Link key={algo.slug} to={`/algo/${algo.slug}#tab=quiz`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-glass-border
                             bg-surface px-3 py-2.5 transition-all hover:-translate-y-px">
                  <span className="text-[13px] font-bold text-fg">{algo.name}</span>
                  <span className="font-mono text-[12px] font-extrabold" style={{ color: '#f59e0b' }}>
                    {pct}%
                  </span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-[13px] leading-loose text-fg-faint">
            完成测验后，正确率低于 80% 的算法会自动出现在这里。
          </div>
        )}
      </div>
    </div>
  )
}
