import { useMemo } from 'react'

function getWeekStartMs() {
  const now = new Date()
  const day = now.getDay()
  const diffToMon = (day === 0 ? -6 : 1 - day)
  const mon = new Date(now)
  mon.setDate(now.getDate() + diffToMon)
  mon.setHours(0, 0, 0, 0)
  return mon.getTime()
}

export default function WeeklyReport({ quizScores, streak, completed }) {
  const weekStart = useMemo(() => getWeekStartMs(), [])

  const weekEntries = useMemo(() =>
    Object.entries(quizScores).filter(([, s]) => (s.lastAt || 0) >= weekStart),
    [quizScores, weekStart]
  )

  const weekCorrect = weekEntries.reduce((sum, [, s]) => sum + (s.correct || 0), 0)
  const weekTotal   = weekEntries.reduce((sum, [, s]) => sum + (s.total || 0), 0)
  const accuracy    = weekTotal > 0 ? Math.round((weekCorrect / weekTotal) * 100) : null

  // 本周每天做题数（0=周一 … 6=周日）
  const dayBuckets = useMemo(() => {
    const arr = [0, 0, 0, 0, 0, 0, 0]
    for (const [, s] of weekEntries) {
      if (!s.lastAt) continue
      const d = new Date(s.lastAt)
      const idx = (d.getDay() + 6) % 7  // 转成周一=0
      arr[idx]++
    }
    return arr
  }, [weekEntries])

  const maxBar = Math.max(...dayBuckets, 1)
  const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const todayIdx = (new Date().getDay() + 6) % 7

  return (
    <div style={{
      padding: '20px 22px', borderRadius: 16,
      background: 'linear-gradient(135deg, rgba(168,85,247,0.07), rgba(56,189,248,0.07))',
      border: '1px solid rgba(168,85,247,0.18)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 16 }}>📅</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>本周学习周报</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          Mon – Sun
        </span>
      </div>

      {/* 统计数字 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        <Metric label="测验场次" value={weekEntries.length} unit="次" color="#a855f7" />
        <Metric label="正确率"   value={accuracy !== null ? accuracy : '—'} unit={accuracy !== null ? '%' : ''} color="#22c55e" />
        <Metric label="连续打卡" value={streak.currentStreak} unit="天" color="#f97316" />
        <Metric label="累计学完" value={completed.size} unit="个" color="#38bdf8" />
      </div>

      {/* 活跃柱状图 */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
        {dayBuckets.map((cnt, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: '100%', borderRadius: 4,
              height: Math.max(4, Math.round((cnt / maxBar) * 48)),
              background: i === todayIdx
                ? 'linear-gradient(180deg, #a855f7, #ec4899)'
                : cnt > 0 ? 'rgba(168,85,247,0.35)' : 'var(--surface-3)',
              transition: 'height 0.3s',
            }} />
            <div style={{ fontSize: 9, color: i === todayIdx ? 'var(--accent-light)' : 'var(--text-tertiary)', fontWeight: i === todayIdx ? 800 : 400 }}>
              {DAY_LABELS[i]}
            </div>
          </div>
        ))}
      </div>

      {weekEntries.length === 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center' }}>
          本周还没有学习记录，去做几道测验吧 💪
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, unit, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '10px 4px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)', color }}>
        {value}
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 2 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>{label}</div>
    </div>
  )
}
