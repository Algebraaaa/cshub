import StaticStepPlayground from './StaticStepPlayground'

const LEGEND = [
  { color: '#3b82f6', label: '请求 / 查询' },
  { color: '#22c55e', label: '响应 / 结果' },
  { color: '#f59e0b', label: '当前阶段' },
]

export default function ProtocolTimelinePlayground({ algoFn }) {
  return (
    <StaticStepPlayground
      algoFn={algoFn}
      legend={LEGEND}
      minHeight={390}
      renderViz={({ current, steps, stepIndex }) => <ProtocolViz steps={steps} index={stepIndex} current={current} />}
    />
  )
}

function ProtocolViz({ steps, index, current }) {
  if (!current) return null
  const W = 860
  const H = 120 + steps.length * 64
  const actors = current.actors || []
  const left = 80
  const right = W - 80
  const gap = actors.length > 1 ? (right - left) / (actors.length - 1) : 0
  const actorX = (i) => left + i * gap

  return (
    <div style={{ minWidth: W }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 800, letterSpacing: '0.08em' }}>PROTOCOL TIMELINE</div>
        <div style={{ fontSize: 19, color: 'var(--text-primary)', fontWeight: 900, marginTop: 4 }}>{current.title}</div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <marker id="proto-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M1,1 L9,5 L1,9 Z" fill="#111827" />
          </marker>
        </defs>
        {actors.map((actor, i) => (
          <g key={actor}>
            <rect x={actorX(i) - 54} y="18" width="108" height="34" rx="8" fill="var(--surface-2)" stroke={i === current.active ? '#f59e0b' : 'var(--border)'} />
            <text x={actorX(i)} y="40" textAnchor="middle" fill="var(--text-primary)" fontSize="12" fontWeight="900">{actor}</text>
            <line x1={actorX(i)} y1="58" x2={actorX(i)} y2={H - 22} stroke="var(--border)" strokeDasharray="5 6" />
          </g>
        ))}
        {steps.map((step, i) => {
          const y = 92 + i * 64
          const done = i <= index
          const color = i === index ? '#f59e0b' : done ? '#22c55e' : '#94a3b8'
          const from = actorX(Math.min(i % Math.max(actors.length, 1), actors.length - 1))
          const to = actorX(Math.min((i + 1) % Math.max(actors.length, 1), actors.length - 1))
          return (
            <g key={i} opacity={done ? 1 : 0.22}>
              <line x1={from} y1={y} x2={to || from + 160} y2={y} stroke={color} strokeWidth="3" markerEnd="url(#proto-arrow)" />
              <rect x={W / 2 - 155} y={y - 16} width="310" height="31" rx="7" fill="var(--surface)" stroke={color} strokeOpacity="0.72" />
              <text x={W / 2} y={y + 4} textAnchor="middle" fill={color} fontSize="12" fontWeight="900">{step.message || step.phase}</text>
              {i === index && <circle cx={from} cy={y} r="6" fill="#f59e0b" />}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
