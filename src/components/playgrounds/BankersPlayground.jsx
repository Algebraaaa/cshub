import { useCallback } from 'react'
import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'

const LEGEND = [
  { color: '#3b82f6', label: 'Available（系统剩余）' },
  { color: '#a855f7', label: 'Need（仍需）' },
  { color: '#10b981', label: 'Allocation（已分配）' },
  { color: '#f59e0b', label: '正在检查的进程' },
  { color: '#22c55e', label: '已完成（加入安全序列）' },
]

export default function BankersPlayground({ algoFn }) {
  const computeSteps = useCallback(() => algoFn(), [algoFn])

  return (
    <PlaygroundShell
      computeSteps={computeSteps}
      legend={LEGEND}
      renderViz={({ current }) => (
        <VizCard borderRadius={10} padding="24px 20px" noInner>
          <BankersViz step={current} />
        </VizCard>
      )}
    />
  )
}

function BankersViz({ step }) {
  if (!step) return null
  const { available, work, max, allocation, need, processes, finished, checking, safeSequence } = step
  const m = available.length
  const resourceLabels = ['A', 'B', 'C', 'D', 'E'].slice(0, m)

  return (
    <div>
      {/* Top bar */}
      <div style={{
        display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20,
        padding: '10px 16px', borderRadius: 10,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)', fontSize: 13,
      }}>
        <Pill label="Work" value={`[${work.join(',')}]`} color="#3b82f6" />
        <Pill label="检查" value={checking >= 0 ? processes[checking] : '—'} color="#f59e0b" />
      </div>

      {/* Safe sequence display */}
      {safeSequence.length > 0 && (
        <div style={{ marginBottom: 18, padding: '10px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1 }}>安全序列：</span>
          <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 13, color: '#22c55e', fontWeight: 700 }}>
            {safeSequence.join(' → ')}
          </span>
        </div>
      )}

      {/* Matrices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <Matrix title="Allocation（已分配）" data={allocation} resourceLabels={resourceLabels} processes={processes} highlight={checking} color="#10b981" finished={finished} />
        <Matrix title="Need（仍需要）" data={need} resourceLabels={resourceLabels} processes={processes} highlight={checking} color="#a855f7" finished={finished} />
        <Matrix title="Max（最大需求）" data={max} resourceLabels={resourceLabels} processes={processes} highlight={-1} color="var(--text-secondary)" finished={[]} />
      </div>
    </div>
  )
}

function Matrix({ title, data, resourceLabels, processes, highlight, color, finished }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 1, marginBottom: 8 }}>{title}</div>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        <thead>
          <tr style={{ background: 'var(--surface-2)' }}>
            <th style={{ padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-tertiary)' }}>P\\R</th>
            {resourceLabels.map(l => (
              <th key={l} style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-tertiary)' }}>{l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const isFinished = finished.includes(processes[i])
            const isCurrent = i === highlight
            const bg = isCurrent ? 'rgba(251, 191, 36, 0.15)' : isFinished ? 'rgba(34, 197, 94, 0.06)' : 'transparent'
            return (
              <tr key={i} style={{ background: bg, borderLeft: isCurrent ? '3px solid #f59e0b' : '3px solid transparent' }}>
                <td style={{ padding: '6px 10px', fontWeight: 700, color: isFinished ? '#22c55e' : isCurrent ? '#f59e0b' : 'var(--text-primary)' }}>
                  {processes[i]}{isFinished ? ' ✓' : ''}
                </td>
                {row.map((v, j) => (
                  <td key={j} style={{ padding: '6px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>{v}</td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
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
