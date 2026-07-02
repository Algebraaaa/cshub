import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520, H = 320, PAD = 36
const COLORS = { primary: '#8b5cf6', secondary: '#f472b6', highlight: '#f97316', negative: '#ef4444', tertiary: '#38bdf8', output: '#22c55e' }

// Tiny network: 1 input → 2 hidden → 1 output
const LAYER_X = [80, 260, 440]
function nodePos(layer, idx) {
  const counts = [1, 2, 1]
  const n = counts[layer]
  return { x: LAYER_X[layer], y: PAD + 40 + (idx + 0.5) * ((H - PAD * 2 - 80) / n) }
}

function relu(x) { return Math.max(0, x) }
function sigmoid(x) { return 1 / (1 + Math.exp(-x)) }
function dSigmoid(s) { return s * (1 - s) }
function dRelu(z) { return z > 0 ? 1 : 0 }

const PRESETS_DATA = {
  simple: { W1: [[0.5], [-0.3]], b1: [0.1, -0.2], W2: [[0.8, -0.6]], b2: [0.05], input: 1, target: 0.8, lr: 0.5, momentum: false },
  deep: { W1: [[0.5], [-0.3]], b1: [0.1, -0.2], W2: [[0.8, -0.6]], b2: [0.05], input: 1, target: 0.8, lr: 0.5, momentum: false },
  momentum: { W1: [[0.5], [-0.3]], b1: [0.1, -0.2], W2: [[0.8, -0.6]], b2: [0.05], input: 1, target: 0.8, lr: 0.3, momentum: true },
}

function runBackprop(p) {
  const { W1, b1, W2, b2, input: x, target, lr } = p
  // Forward
  const z1 = W1.map(row => row[0] * x + 0) // simplified: b applied separately
  const z1b = z1.map((z, i) => z + b1[i])
  const a1 = z1b.map(relu)
  const z2 = W2[0].reduce((s, w, j) => s + w * a1[j], 0) + b2[0]
  const a2 = sigmoid(z2)
  const loss = 0.5 * (a2 - target) ** 2

  // Backward
  const dL_da2 = a2 - target
  const dL_dz2 = dL_da2 * dSigmoid(a2)
  const dL_dW2 = a1.map(a => dL_dz2 * a)
  const dL_db2 = dL_dz2
  const dL_da1 = W2[0].map(w => dL_dz2 * w)
  const dL_dz1 = dL_da1.map((d, i) => d * dRelu(z1b[i]))
  const dL_dW1 = dL_dz1.map(d => [d * x])
  const dL_db1 = dL_dz1

  // Update
  const newW2 = [W2[0].map((w, j) => w - lr * dL_dW2[j])]
  const newb2 = [b2[0] - lr * dL_db2]
  const newW1 = W1.map((row, i) => [row[0] - lr * dL_dW1[i][0]])
  const newb1 = b1.map((b, i) => b - lr * dL_db1[i])

  return { a2, loss, dL_da2, dL_dz2, dL_dW2, dL_db2, dL_da1, dL_dz1, dL_dW1, dL_db1, z1b, a1, z2, newW1, newb1, newW2, newb2 }
}

function computeSteps({ presetId }) {
  const p = PRESETS_DATA[presetId] || PRESETS_DATA.simple
  const r = runBackprop(p)
  const base = { ...p }
  return [
    { description: '前向传播: 计算网络输出', phase: 'forward', ...base, ...r, activePhase: 'forward' },
    { description: `计算损失 dL/da = ${(r.a2 - p.target).toFixed(4)}, loss = ${r.loss.toFixed(5)}`, phase: 'loss', ...base, ...r, activePhase: 'loss' },
    { description: `输出层: dL/dz = ${r.dL_dz2.toFixed(4)}`, phase: 'dz2', ...base, ...r, activePhase: 'dz2' },
    { description: `输出权重梯度: dL/dW₂ = [${r.dL_dW2.map(v => v.toFixed(4)).join(', ')}]`, phase: 'dW2', ...base, ...r, activePhase: 'dW2' },
    { description: `反传至隐藏层: dL/da₁ = [${r.dL_da1.map(v => v.toFixed(4)).join(', ')}]`, phase: 'da1', ...base, ...r, activePhase: 'da1' },
    { description: `隐藏层梯度: dL/dz₁ = [${r.dL_dz1.map(v => v.toFixed(4)).join(', ')}]`, phase: 'dz1', ...base, ...r, activePhase: 'dz1' },
    { description: '所有梯度计算完成', phase: 'grads', ...base, ...r, activePhase: 'grads' },
    { description: `权重更新完成, 新输出 ≈ ${sigmoid(r.newW2[0].reduce((s, w, j) => s + w * relu(r.newW1[j][0] * p.input + r.newb1[j]), 0) + r.newb2[0]).toFixed(4)}`, phase: 'update', ...base, ...r, activePhase: 'update' },
  ]
}

export default function BackwardPropagationPlayground() {
  const presets = useMemo(() => [
    { id: 'simple', label: '2 层网络' },
    { id: 'deep', label: '3 层网络' },
    { id: 'momentum', label: '带动量' },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ presetId: 'simple' }}
      presets={presets}
      derivePayload={s => ({ presetId: s.presetId })}
      computeSteps={computeStepsFn}
      legend={[
        { color: COLORS.primary, label: '正权重' },
        { color: COLORS.negative, label: '负权重' },
        { color: COLORS.highlight, label: '梯度流' },
        { color: COLORS.output, label: '更新后' },
      ]}
      renderViz={({ current }) => {
        const { W1, W2, a1, a2, dL_dW1, dL_dW2, dL_dz1, dL_dz2, activePhase, lr, input: x } = current
        const showGrad = ['dz2', 'dW2', 'da1', 'dz1', 'grads', 'update'].includes(activePhase)
        const showUpdate = activePhase === 'update'
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <defs>
                  <marker id="bp-arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
                    <polygon points="0 0, 7 2.5, 0 5" fill={COLORS.highlight} />
                  </marker>
                </defs>
                {/* Forward edges */}
                {W1.map((row, i) => (
                  <line key={`fw1-${i}`} x1={LAYER_X[0] + 18} y1={nodePos(0, 0).y} x2={LAYER_X[1] - 18} y2={nodePos(1, i).y}
                    stroke={row[0] >= 0 ? COLORS.primary : COLORS.negative} strokeWidth={Math.min(Math.abs(row[0]) * 3 + 1, 5)} opacity={0.4} />
                ))}
                {W2[0].map((w, j) => (
                  <line key={`fw2-${j}`} x1={LAYER_X[1] + 18} y1={nodePos(1, j).y} x2={LAYER_X[2] - 18} y2={nodePos(2, 0).y}
                    stroke={w >= 0 ? COLORS.primary : COLORS.negative} strokeWidth={Math.min(Math.abs(w) * 3 + 1, 5)} opacity={0.4} />
                ))}
                {/* Gradient arrows (backward) */}
                {showGrad && W2[0].map((_, j) => (
                  <line key={`gw2-${j}`} x1={LAYER_X[2] - 20} y1={nodePos(2, 0).y} x2={LAYER_X[1] + 20} y2={nodePos(1, j).y}
                    stroke={COLORS.highlight} strokeWidth={2} strokeDasharray="5,3" markerEnd="url(#bp-arrow)" opacity={0.8} />
                ))}
                {showGrad && W1.map((_, i) => (
                  <line key={`gw1-${i}`} x1={LAYER_X[1] - 20} y1={nodePos(1, i).y} x2={LAYER_X[0] + 20} y2={nodePos(0, 0).y}
                    stroke={COLORS.highlight} strokeWidth={2} strokeDasharray="5,3" markerEnd="url(#bp-arrow)" opacity={0.6} />
                ))}
                {/* Gradient labels on edges */}
                {showGrad && dL_dW2.map((g, j) => {
                  const mx = (LAYER_X[1] + LAYER_X[2]) / 2, my = (nodePos(1, j).y + nodePos(2, 0).y) / 2
                  return <text key={`glw2-${j}`} x={mx} y={my - 8} textAnchor="middle" fontSize="9" fill={COLORS.highlight} fontWeight="600">∂L={g.toFixed(3)}</text>
                })}
                {showGrad && dL_dW1.map((row, i) => {
                  const mx = (LAYER_X[0] + LAYER_X[1]) / 2, my = (nodePos(0, 0).y + nodePos(1, i).y) / 2
                  return <text key={`glw1-${i}`} x={mx} y={my - 8} textAnchor="middle" fontSize="9" fill={COLORS.highlight} fontWeight="600">∂L={row[0].toFixed(3)}</text>
                })}
                {/* Nodes */}
                {[0, 1, 2].map(l => {
                  const count = [1, 2, 1][l]
                  return Array.from({ length: count }, (_, i) => {
                    const { x: cx, y: cy } = nodePos(l, i)
                    const isActive = (activePhase === 'forward' && l === 2) || (['dz2', 'dW2'].includes(activePhase) && l === 2) ||
                      (['da1', 'dz1'].includes(activePhase) && l === 1) || (activePhase === 'update')
                    let val
                    if (l === 0) val = x.toFixed(1)
                    else if (l === 1) val = a1?.[i]?.toFixed(3) || ''
                    else val = a2?.toFixed(4) || ''
                    const fill = showUpdate ? COLORS.output : isActive ? COLORS.highlight : 'var(--surface)'
                    return (
                      <g key={`n-${l}-${i}`}>
                        <circle cx={cx} cy={cy} r={18} fill={fill} stroke={isActive ? COLORS.highlight : 'var(--border)'} strokeWidth={isActive ? 2.5 : 1.5}
                          style={{ transition: 'fill 0.3s' }} />
                        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fontWeight="600"
                          fill={isActive || showUpdate ? '#fff' : 'var(--text-primary)'}>{val}</text>
                      </g>
                    )
                  })
                })}
                {/* Phase label */}
                <text x={W / 2} y={20} textAnchor="middle" fontSize="12" fill="var(--text-secondary)" fontWeight="600">
                  {activePhase === 'forward' ? '前向传播' : activePhase === 'update' ? '权重更新' : '反向传播'}
                </text>
              </svg>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, width: '100%', maxWidth: 440 }}>
                <InfoBox label="损失" value={current.loss?.toFixed(5)} />
                <InfoBox label="dL/dz₂" value={dL_dz2?.toFixed(4)} />
                <InfoBox label="dL/dz₁" value={dL_dz1?.map(v => v.toFixed(3)).join(', ')} />
                <InfoBox label="学习率" value={lr?.toFixed(2)} />
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
