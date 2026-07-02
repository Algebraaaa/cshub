import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520, H = 320, PAD = 36
const COLORS = { primary: '#8b5cf6', secondary: '#f472b6', highlight: '#f97316', negative: '#ef4444', tertiary: '#38bdf8', output: '#22c55e' }

// 3-layer network: 2 inputs → 3 hidden → 1 output
const LAYERS = [2, 3, 1]
const LAYER_X = [100, 260, 420]

function nodeY(layer, idx) {
  const n = LAYERS[layer]
  return PAD + 30 + (idx + 0.5) * ((H - PAD * 2 - 60) / n)
}

function relu(x) { return Math.max(0, x) }
function sigmoid(x) { return 1 / (1 + Math.exp(-x)) }

const PRESETS_DATA = {
  small: {
    W1: [[0.1, 0.2], [0.3, -0.1], [-0.2, 0.4]], b1: [0.05, -0.05, 0.1],
    W2: [[0.3, -0.2, 0.5]], b2: [0.1], inputs: [1, 0.5],
  },
  large: {
    W1: [[1.5, -2.0], [2.0, 1.0], [-1.5, 2.5]], b1: [0.5, -0.5, 1.0],
    W2: [[2.0, -1.5, 1.0]], b2: [-0.5], inputs: [1, 0],
  },
  xor: {
    W1: [[1, 1], [1, 1]], b1: [0, -1],
    W2: [[1, -2]], b2: [0], inputs: [1, 0],
    _layers: [2, 2, 1],
  },
}

function forward(inputs, W1, b1, W2, b2) {
  const a0 = inputs
  const z1 = W1.map((row, i) => row.reduce((s, w, j) => s + w * a0[j], 0) + b1[i])
  const a1 = z1.map(relu)
  const z2 = W2.map((row, i) => row.reduce((s, w, j) => s + w * a1[j], 0) + b2[i])
  const a2 = z2.map(sigmoid)
  return { a0, z1, a1, z2, a2 }
}

function computeSteps({ presetId }) {
  const p = PRESETS_DATA[presetId] || PRESETS_DATA.small
  const layers = p._layers || LAYERS
  const { a0, z1, a1, z2, a2 } = forward(p.inputs, p.W1, p.b1, p.W2, p.b2, layers)
  const base = { inputs: p.inputs, W1: p.W1, b1: p.b1, W2: p.W2, b2: p.b2, layers }
  return [
    { description: '输入层: 展示输入值 x₁, x₂', phase: 'input', ...base, a0, z1, a1, z2, a2, activeLayer: 0, activeNeuron: -1 },
    { description: '计算隐藏层加权和 z⁽¹⁾ = W⁽¹⁾·a⁽⁰⁾ + b⁽¹⁾', phase: 'z1', ...base, a0, z1, a1, z2, a2, activeLayer: 1, activeNeuron: -1, showZ: true },
    { description: '隐藏层激活 a⁽¹⁾ = ReLU(z⁽¹⁾)', phase: 'a1', ...base, a0, z1, a1, z2, a2, activeLayer: 1, activeNeuron: -1, showActivation: true },
    { description: '计算输出层加权和 z⁽²⁾ = W⁽²⁾·a⁽¹⁾ + b⁽²⁾', phase: 'z2', ...base, a0, z1, a1, z2, a2, activeLayer: 2, activeNeuron: 0, showZ: true },
    { description: '输出层激活 a⁽²⁾ = σ(z⁽²⁾)', phase: 'a2', ...base, a0, z1, a1, z2, a2, activeLayer: 2, activeNeuron: 0, showActivation: true },
    { description: `前向传播完成，输出 = ${a2[0].toFixed(4)}`, phase: 'done', ...base, a0, z1, a1, z2, a2, activeLayer: -1, activeNeuron: -1, showAll: true },
  ]
}

export default function ForwardPropagationPlayground() {
  const presets = useMemo(() => [
    { id: 'small', label: '小权重' },
    { id: 'large', label: '大权重' },
    { id: 'xor', label: 'XOR 解' },
  ], [])

  const computeStepsFn = useCallback((state) => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ presetId: 'small' }}
      presets={presets}
      derivePayload={s => ({ presetId: s.presetId })}
      computeSteps={computeStepsFn}
      legend={[
        { color: COLORS.primary, label: '正权重' },
        { color: COLORS.negative, label: '负权重' },
        { color: COLORS.highlight, label: '当前计算' },
        { color: COLORS.output, label: '输出' },
      ]}
      renderViz={({ current }) => {
        const { layers, W1, W2, a0, z1, a1, z2, a2, activeLayer, phase } = current
        const lxs = layers.length === 3 ? LAYER_X : [130, 260, 390]
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                {/* Edges layer 0→1 */}
                {W1.map((row, i) => row.map((w, j) => {
                  const active = activeLayer === 1
                  return (
                    <line key={`e1-${i}-${j}`} x1={lxs[0]} y1={nodeY(0, j)} x2={lxs[1]} y2={nodeY(1, i)}
                      stroke={w >= 0 ? COLORS.primary : COLORS.negative}
                      strokeWidth={Math.min(Math.abs(w) * 2.5 + 0.5, 5)}
                      opacity={active ? 1 : 0.35} />
                  )
                }))}
                {/* Edges layer 1→2 */}
                {W2.map((row, i) => row.map((w, j) => {
                  const active = activeLayer === 2
                  return (
                    <line key={`e2-${i}-${j}`} x1={lxs[1]} y1={nodeY(1, j)} x2={lxs[2]} y2={nodeY(2, i)}
                      stroke={w >= 0 ? COLORS.primary : COLORS.negative}
                      strokeWidth={Math.min(Math.abs(w) * 2.5 + 0.5, 5)}
                      opacity={active ? 1 : 0.35} />
                  )
                }))}
                {/* Nodes */}
                {[0, 1, 2].map(l => {
                  const n = layers[l] || LAYERS[l]
                  return Array.from({ length: n }, (_, i) => {
                    const isActive = activeLayer === l
                    let val
                    if (l === 0) val = a0[i]?.toFixed(2)
                    else if (l === 1) val = (phase === 'a1' || phase === 'z2' || phase === 'a2' || phase === 'done') ? a1[i]?.toFixed(3) : (phase === 'z1' ? `z=${z1[i]?.toFixed(3)}` : '')
                    else val = (phase === 'a2' || phase === 'done') ? a2[i]?.toFixed(4) : (phase === 'z2' ? `z=${z2[i]?.toFixed(3)}` : '')
                    const fill = l === 2 && phase === 'done' ? COLORS.output : isActive ? COLORS.highlight : 'var(--surface)'
                    return (
                      <g key={`n-${l}-${i}`}>
                        <circle cx={lxs[l]} cy={nodeY(l, i)} r={18} fill={fill} stroke={isActive ? COLORS.highlight : 'var(--border)'} strokeWidth={isActive ? 2.5 : 1.5}
                          style={{ transition: 'fill 0.3s, stroke 0.3s' }} />
                        <text x={lxs[l]} y={nodeY(l, i) + 4} textAnchor="middle" fontSize="9" fontWeight="600"
                          fill={isActive || (l === 2 && phase === 'done') ? '#fff' : 'var(--text-primary)'}>{val}</text>
                      </g>
                    )
                  })
                })}
                {/* Layer labels */}
                <text x={lxs[0]} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)">输入层</text>
                <text x={lxs[1]} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)">隐藏层</text>
                <text x={lxs[2]} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)">输出层</text>
              </svg>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, width: '100%', maxWidth: 440 }}>
                <InfoBox label="阶段" value={phase} />
                <InfoBox label="z¹" value={z1.map(v => v.toFixed(3)).join(', ')} />
                <InfoBox label="a¹" value={a1.map(v => v.toFixed(3)).join(', ')} />
                <InfoBox label="输出" value={a2[0]?.toFixed(4)} />
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}
