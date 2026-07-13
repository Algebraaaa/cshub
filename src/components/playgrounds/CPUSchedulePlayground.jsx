import { useMemo } from 'react'
import StepController, { useStepController } from '../StepController'
import VizCard from './VizCard'
import { Legend } from './shared'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#a855f7', '#06b6d4', '#ef4444', '#84cc16']

const LEGEND = [
  { color: '#10b981', label: '运行中 (Running)' },
  { color: '#f59e0b', label: '就绪 (Ready)' },
  { color: '#94a3b8', label: '已完成 (Completed)' },
  { color: '#6366f1', label: '甘特图段' },
]

export default function CPUSchedulePlayground({ algoFn }) {
  const steps = useMemo(() => algoFn(), [algoFn])
  const ctrl = useStepController(steps)
  const current = steps[ctrl.step]

  return (
    <div>
      <VizCard borderRadius={10} padding={20} minHeight={380} noInner>
        <CPUViz step={current} />
      </VizCard>

      <Legend items={LEGEND} />

      <StepController total={steps.length} ctrl={ctrl}
        description={current?.description} />
    </div>
  )
}

function CPUViz({ step }) {
  if (!step) return null
  const { time, running, runningRemaining, ready, completed, gantt, stats } = step
  const procIds = Array.from(new Set([
    ...stats.map(s => s.id),
    ...gantt.map(g => g.id),
  ]))
  const colorFor = (id) => COLORS[procIds.indexOf(id) % COLORS.length]

  const totalTime = Math.max(time, ...gantt.map(g => g.end), 1)

  return (
    <div>
      {/* Top bar */}
      <div style={{
        display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 18,
        padding: '10px 16px', borderRadius: 10,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)', fontSize: 13,
      }}>
        <Pill label="t" value={time} color="#3b82f6" />
        <Pill label="running" value={running || '—'} color={running ? '#10b981' : '#94a3b8'} />
      </div>

      {/* Queues */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 18 }}>
        <QueueBox title="🟢 运行中" items={running ? [{ id: running, remaining: runningRemaining }] : []} color="#10b981" colorFor={colorFor} />
        <QueueBox title="🟡 就绪队列" items={ready} color="#f59e0b" colorFor={colorFor} />
        <QueueBox title="⚪ 已完成" items={completed.map(id => ({ id }))} color="#94a3b8" colorFor={colorFor} />
      </div>

      {/* Gantt chart */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 8 }}>甘特图</div>
        <div style={{ display: 'flex', height: 36, borderRadius: 8, overflow: 'hidden', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          {gantt.map((g, i) => {
            const width = ((g.end - g.start) / totalTime) * 100
            return (
              <div key={i} style={{
                width: `${width}%`,
                background: colorFor(g.id),
                color: 'white',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRight: '1px solid rgba(0,0,0,0.15)',
              }}>
                {g.id}
              </div>
            )
          })}
        </div>
        {/* Time axis */}
        <div style={{ position: 'relative', height: 18, marginTop: 4 }}>
          {gantt.map((g, i) => (
            <span key={i} style={{
              position: 'absolute',
              left: `${(g.start / totalTime) * 100}%`,
              fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)',
            }}>{g.start}</span>
          ))}
          {gantt.length > 0 && (
            <span style={{ position: 'absolute', right: 0, fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {gantt[gantt.length - 1].end}
            </span>
          )}
        </div>
      </div>

      {/* Stats table */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1, marginBottom: 8 }}>进程统计</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              {['进程', '到达', 'burst', '完成', '周转', '等待'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map(s => (
              <tr key={s.id}>
                <td style={{ padding: '6px 8px', color: colorFor(s.id), fontWeight: 700 }}>{s.id}</td>
                <td style={{ padding: '6px 8px' }}>{s.arrival}</td>
                <td style={{ padding: '6px 8px' }}>{s.burst}</td>
                <td style={{ padding: '6px 8px' }}>{s.finish >= 0 ? s.finish : '—'}</td>
                <td style={{ padding: '6px 8px' }}>{s.turnaround >= 0 ? s.turnaround : '—'}</td>
                <td style={{ padding: '6px 8px' }}>{s.waiting >= 0 ? s.waiting : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function QueueBox({ title, items, color, colorFor }) {
  return (
    <div style={{ padding: '10px 14px', borderRadius: 10, background: `${color}10`, border: `1px solid ${color}33` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 28 }}>
        {items.length === 0 && <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>—</span>}
        {items.map((item, i) => (
          <span key={i} style={{
            padding: '3px 9px', borderRadius: 6,
            background: colorFor(item.id),
            color: 'white', fontSize: 11.5, fontWeight: 700,
            fontFamily: 'var(--font-mono)',
          }}>
            {item.id}{item.remaining !== undefined ? `(${item.remaining})` : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

function Pill({ label, value, color }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <strong style={{ color, fontWeight: 700, fontSize: 13.5 }}>{value}</strong>
    </span>
  )
}
