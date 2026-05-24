// 30 天答题活跃热力图 · Tailwind only
// 从 HomePage 旧版迁移过来，作为 ProfilePage 的板块
export default function LearningHeatmap({ quizScores }) {
  const days = 30
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const countByDay = new Map()
  Object.values(quizScores || {}).forEach(s => {
    if (!s?.lastAt) return
    const d = new Date(s.lastAt)
    d.setHours(0, 0, 0, 0)
    const k = d.getTime()
    countByDay.set(k, (countByDay.get(k) || 0) + (s.attempted || 1))
  })

  const cells = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    cells.push({ date: d, count: countByDay.get(d.getTime()) || 0 })
  }

  const max = Math.max(1, ...cells.map(c => c.count))
  const activeDays = cells.filter(c => c.count > 0).length
  const totalAttempts = cells.reduce((s, c) => s + c.count, 0)

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="section-eyebrow">最近 30 天答题活动</span>
        <span className="font-mono text-[11px] text-fg-faint">
          {activeDays} 活跃日 · {totalAttempts} 次答题
        </span>
      </div>
      <div className="grid grid-cols-30 gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${days}, 1fr)` }}>
        {cells.map((c, i) => {
          const isToday = i === days - 1
          const intensity = c.count === 0 ? 0 : 0.18 + (c.count / max) * 0.82
          const bg = c.count === 0
            ? 'rgba(255,255,255,0.04)'
            : `rgba(168, 85, 247, ${intensity})`
          return (
            <div key={i} title={`${c.date.getMonth() + 1}/${c.date.getDate()}：${c.count} 次答题`}
              className={[
                'aspect-square rounded-[3px] transition-transform hover:scale-125 cursor-help',
                isToday ? 'ring-1 ring-accent-light' : '',
              ].join(' ')}
              style={{ background: bg }} />
          )
        })}
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-fg-faint">
        <span>少</span>
        {[0, 0.3, 0.55, 0.8, 1].map((v, i) => (
          <span key={i} className="h-3 w-3 rounded-[3px]"
            style={{ background: v === 0 ? 'rgba(255,255,255,0.04)' : `rgba(168, 85, 247, ${0.18 + v * 0.82})` }} />
        ))}
        <span>多</span>
      </div>
    </div>
  )
}
