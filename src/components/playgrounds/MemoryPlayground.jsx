import PlaygroundShell from './PlaygroundShell'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6']

const LEGEND = [
  { color: '#3b82f6', label: '当前步骤' },
  { color: '#22c55e', label: '已完成' },
  { color: '#94a3b8', label: '等待处理' },
]

export default function MemoryPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      computeSteps={() => algoFn()}
      renderViz={({ current }) => (
        <Panel>
          <ConceptLane step={current} />
        </Panel>
      )}
      legend={LEGEND}
    />
  )
}

function ConceptLane({ step }) {
  if (!step) return null
  const actors = step.actors || []
  return (
    <div style={{ minWidth: 760 }}>
      <Header title={step.title} phase={step.phase} />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(actors.length, 1)}, minmax(120px, 1fr))`, gap: 10, marginBottom: 18 }}>
        {actors.map((actor, i) => (
          <div key={actor} style={{
            minHeight: 70,
            padding: 12,
            borderRadius: 8,
            border: `2px solid ${i === step.active ? '#3b82f6' : 'var(--border)'}`,
            background: i <= step.active ? `${COLORS[i % COLORS.length]}18` : 'var(--surface-2)',
            color: i <= step.active ? 'var(--text-primary)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontWeight: 800,
          }}>
            {actor}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
        <div style={{ padding: 14, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 800, letterSpacing: '0.06em', marginBottom: 10 }}>当前动作</div>
          <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-primary)', fontWeight: 700 }}>{step.description}</div>
        </div>
        <div style={{ padding: 14, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 800, letterSpacing: '0.06em', marginBottom: 10 }}>关键状态</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(step.facts || []).map((fact, i) => (
              <span key={i} style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: `${COLORS[i % COLORS.length]}18`,
                border: `1px solid ${COLORS[i % COLORS.length]}66`,
                color: COLORS[i % COLORS.length],
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 800,
              }}>{fact}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Header({ title, phase }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 800, letterSpacing: '0.08em' }}>OS / CO VISUAL TOPIC</div>
        <div style={{ fontSize: 19, color: 'var(--text-primary)', fontWeight: 900, marginTop: 4 }}>{title}</div>
      </div>
      <span style={{ padding: '6px 12px', borderRadius: 99, color: '#3b82f6', background: '#3b82f61f', border: '1px solid #3b82f666', fontWeight: 900, fontSize: 12 }}>{phase}</span>
    </div>
  )
}

function Panel({ children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16, padding: '24px 20px', overflowX: 'auto', minHeight: 360 }}>
      {children}
    </div>
  )
}
