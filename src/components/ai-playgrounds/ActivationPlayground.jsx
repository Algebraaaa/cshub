import { useMemo, useState } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 560
const H = 220
const PAD = 36
const XR = [-5, 5]
const YR = [-1.2, 1.5]

function sx(x) { return PAD + (x - XR[0]) / (XR[1] - XR[0]) * (W - 2 * PAD) }
function sy(y) { return H - PAD - (y - YR[0]) / (YR[1] - YR[0]) * (H - 2 * PAD) }

const ACTIVATIONS = {
  sigmoid: {
    name: 'Sigmoid',
    color: '#8b5cf6',
    fn: x => 1 / (1 + Math.exp(-x)),
    deriv: x => { const s = 1 / (1 + Math.exp(-x)); return s * (1 - s) },
  },
  tanh: {
    name: 'Tanh',
    color: '#38bdf8',
    fn: x => Math.tanh(x),
    deriv: x => { const t = Math.tanh(x); return 1 - t * t },
  },
  relu: {
    name: 'ReLU',
    color: '#ef4444',
    fn: x => Math.max(0, x),
    deriv: x => x > 0 ? 1 : 0,
  },
  leakyrelu: {
    name: 'LeakyReLU',
    color: '#f97316',
    fn: x => x > 0 ? x : 0.1 * x,
    deriv: x => x > 0 ? 1 : 0.1,
  },
  gelu: {
    name: 'GELU',
    color: '#10b981',
    fn: x => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3))),
    deriv: x => {
      const a = Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)
      const t = Math.tanh(a)
      const da = Math.sqrt(2 / Math.PI) * (1 + 3 * 0.044715 * x * x)
      return 0.5 * (1 + t) + 0.5 * x * (1 - t * t) * da
    },
  },
}

// Steps: walk through x values, show dying ReLU scenario
function computeSteps({ mode }) {
  const steps = []
  if (mode === 'walk') {
    const xs = [-4, -3, -2, -1, 0, 0.5, 1, 2, 3, 4]
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i]
      const values = {}
      Object.entries(ACTIVATIONS).forEach(([k, a]) => {
        values[k] = { y: a.fn(x), dy: a.deriv(x) }
      })
      steps.push({
        description: `输入 x = ${x.toFixed(1)}: 展示各激活函数值与导数(梯度)。`,
        x, values, mode: 'walk', line: i + 1,
      })
    }
  } else if (mode === 'dying') {
    // Dying ReLU: when x is always negative, gradient = 0 forever
    const xs = [-4, -3.5, -3, -2.5, -2, -1.5, -1, -0.5, -0.1, 0]
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i]
      const values = {}
      Object.entries(ACTIVATIONS).forEach(([k, a]) => {
        values[k] = { y: a.fn(x), dy: a.deriv(x) }
      })
      steps.push({
        description: `Dying ReLU 场景: x = ${x.toFixed(1)} < 0。ReLU 输出=0, 梯度=0, 权重不再更新 (神经元"死亡")。LeakyReLU 仍有微弱梯度。`,
        x, values, mode: 'dying', line: i + 1,
      })
    }
    steps.push({
      description: '总结: ReLU 在 x<0 时梯度为 0, 一旦输入持续为负, 神经元永久失活。LeakyReLU/GELU 通过保留负侧梯度缓解此问题。',
      x: -1, values: Object.fromEntries(Object.entries(ACTIVATIONS).map(([k, a]) => [k, { y: a.fn(-1), dy: a.deriv(-1) }])),
      mode: 'dying-sum', line: 9,
    })
  }
  return steps
}

function Plot({ x, actKey, showDeriv }) {
  const a = ACTIVATIONS[actKey]
  const pts = []
  for (let xv = XR[0]; xv <= XR[1]; xv += 0.05) pts.push(`${sx(xv)},${sy(a.fn(xv))}`)
  const y = a.fn(x)
  const dy = a.deriv(x)
  // Tangent line: passes through (x,y) with slope dy
  const tx1 = x - 1.5, ty1 = y + dy * (tx1 - x)
  const tx2 = x + 1.5, ty2 = y + dy * (tx2 - x)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: a.color }} />
        {a.name}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W / 2.5 }}>
        {/* Axes */}
        <line x1={PAD} y1={sy(0)} x2={W - PAD} y2={sy(0)} stroke="var(--border)" />
        <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={H - PAD} stroke="var(--border)" />

        {/* Function curve */}
        <polyline points={pts.join(' ')} fill="none" stroke={a.color} strokeWidth="2" opacity="0.8" />

        {/* Tangent line for derivative */}
        {showDeriv && (
          <line x1={sx(tx1)} y1={sy(ty1)} x2={sx(tx2)} y2={sy(ty2)}
            stroke="#fbbf24" strokeWidth="1.8" strokeDasharray="4,3" opacity="0.9" />
        )}

        {/* Current point */}
        <circle cx={sx(x)} cy={sy(y)} r="5" fill={a.color} stroke="white" strokeWidth="1.5" />

        {/* Labels */}
        <text x={sx(x) + 6} y={sy(y) - 6} fontSize="9" fill={a.color} fontFamily="monospace">
          {y.toFixed(2)}
        </text>
      </svg>
      <div style={{ display: 'flex', gap: 8, fontSize: 10, fontFamily: 'monospace' }}>
        <span style={{ color: 'var(--text-secondary)' }}>f={y.toFixed(3)}</span>
        <span style={{ color: '#fbbf24' }}>f'={dy.toFixed(3)}</span>
      </div>
    </div>
  )
}

function renderViz({ current, state }) {
  const { x, values, mode } = current
  const isDying = mode === 'dying' || mode === 'dying-sum'
  const showDeriv = state?.showDeriv !== false

  return (
    <VizCard>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        {/* Slider display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: W }}>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace', minWidth: 60 }}>
            输入 x = <b style={{ color: '#fbbf24' }}>{x.toFixed(2)}</b>
          </span>
          <input type="range" min={isDying ? -4 : -5} max={isDying ? 0 : 5} step="0.1"
            value={x} readOnly
            style={{ flex: 1 }} />
          {isDying && (
            <span style={{ fontSize: 10, color: '#ef4444', fontFamily: 'monospace' }}>
              x ≤ 0 区域 (Dying ReLU)
            </span>
          )}
        </div>

        {/* 5 activation plots in a grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: '100%' }}>
          {Object.keys(ACTIVATIONS).map(k => (
            <Plot key={k} x={x} actKey={k} showDeriv={showDeriv} />
          ))}
        </div>

        {/* Derivative comparison table */}
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${Object.keys(ACTIVATIONS).length + 1}, 1fr)`,
          gap: 4, width: '100%', maxWidth: 560, fontSize: 11, fontFamily: 'monospace',
        }}>
          <div style={{ textAlign: 'center', padding: '6px 4px', color: 'var(--text-tertiary)' }}>度量</div>
          {Object.keys(ACTIVATIONS).map(k => (
            <div key={k} style={{ textAlign: 'center', padding: '6px 4px', color: ACTIVATIONS[k].color, fontWeight: 600 }}>
              {ACTIVATIONS[k].name}
            </div>
          ))}
          <div style={{ textAlign: 'center', padding: '4px', background: 'var(--surface)', borderRadius: 4, color: 'var(--text-tertiary)' }}>f(x)</div>
          {Object.keys(ACTIVATIONS).map(k => (
            <div key={`fv-${k}`} style={{ textAlign: 'center', padding: '4px', background: 'var(--surface)', borderRadius: 4, color: 'var(--text-primary)' }}>
              {values[k].y.toFixed(3)}
            </div>
          ))}
          <div style={{ textAlign: 'center', padding: '4px', background: 'var(--surface)', borderRadius: 4, color: 'var(--text-tertiary)' }}>f'(x)</div>
          {Object.keys(ACTIVATIONS).map(k => {
            const dy = values[k].dy
            const isDead = Math.abs(dy) < 0.01 && k === 'relu'
            return (
              <div key={`dv-${k}`} style={{
                textAlign: 'center', padding: '4px', borderRadius: 4,
                background: isDead ? 'rgba(239,68,68,0.2)' : 'var(--surface)',
                color: isDead ? '#ef4444' : (Math.abs(dy) < 0.01 ? '#ef4444' : '#fbbf24'),
                fontWeight: Math.abs(dy) < 0.01 ? 700 : 500,
              }}>
                {dy.toFixed(3)}{isDead && ' 死!'}
              </div>
            )
          })}
        </div>
      </div>
    </VizCard>
  )
}

export default function ActivationPlayground() {
  const [showDeriv, setShowDeriv] = useState(true)
  const presets = useMemo(() => [
    { id: 'walk', label: '全区间 x∈[-4,4]', state: { mode: 'walk', showDeriv: true } },
    { id: 'dying', label: 'Dying ReLU (x≤0)', state: { mode: 'dying', showDeriv: true } },
    { id: 'positive', label: '正区间 x∈[0,4]', state: { mode: 'walk', showDeriv: true } },
  ], [])

  return (
    <PlaygroundShell
      initialState={{ mode: 'walk', showDeriv: true }}
      presets={presets}
      computeSteps={computeSteps}
      extraToolbar={({ state, setState }) => (
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={state.showDeriv ?? showDeriv}
            onChange={(e) => { setShowDeriv(e.target.checked); setState(p => ({ ...p, showDeriv: e.target.checked })) }} />
          显示切线(导数)
        </label>
      )}
      legend={[
        { color: '#8b5cf6', label: 'Sigmoid' },
        { color: '#38bdf8', label: 'Tanh' },
        { color: '#ef4444', label: 'ReLU' },
        { color: '#f97316', label: 'LeakyReLU' },
        { color: '#10b981', label: 'GELU' },
        { color: '#fbbf24', label: '导数切线' },
      ]}
      renderViz={renderViz}
    />
  )
}
