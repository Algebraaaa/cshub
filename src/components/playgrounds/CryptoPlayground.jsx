import StaticStepPlayground from './StaticStepPlayground'

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7']
const LEGEND = COLORS.map((color, i) => ({ color, label: `阶段 ${i + 1}` }))

export default function CryptoPlayground({ algoFn }) {
  return (
    <StaticStepPlayground
      algoFn={algoFn}
      legend={LEGEND}
      minHeight={370}
      renderViz={({ current, steps, stepIndex }) => <CryptoViz steps={steps} index={stepIndex} current={current} />}
    />
  )
}

function CryptoViz({ steps, index, current }) {
  if (!current) return null
  return (
    <div style={{ minWidth: 780 }}>
      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 800, letterSpacing: '0.08em' }}>CRYPTO TEACHING FLOW</div>
      <div style={{ fontSize: 19, color: 'var(--text-primary)', fontWeight: 900, marginTop: 4, marginBottom: 18 }}>{current.title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${steps.length}, minmax(120px, 1fr))`, gap: 10, alignItems: 'stretch' }}>
        {steps.map((step, i) => {
          const active = i === index
          const done = i <= index
          const color = COLORS[i % COLORS.length]
          return (
            <div key={i} style={{
              padding: 13,
              borderRadius: 8,
              border: `${active ? 2 : 1}px solid ${done ? color : 'var(--border)'}`,
              background: done ? `${color}18` : 'var(--surface-2)',
              minHeight: 128,
              opacity: done ? 1 : 0.45,
            }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: color, color: '#111827', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>{i + 1}</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 900, marginBottom: 8 }}>{step.phase}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.6 }}>{step.description}</div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 16, padding: 14, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 800, marginBottom: 8 }}>当前关键值</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(current.facts || []).map((fact, i) => (
            <span key={i} style={{ padding: '6px 10px', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, background: `${COLORS[i % COLORS.length]}18`, border: `1px solid ${COLORS[i % COLORS.length]}66`, color: COLORS[i % COLORS.length] }}>{fact}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
