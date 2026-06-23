import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'
import { AI_COLORS } from '../../styles/aiVizTokens'

// Architecture: 2 inputs → 3 hidden (sigmoid) → 1 output (sigmoid)
// Train on a single XOR-like sample
const NET = {
  layers: [
    { size: 2, label: 'Input' },
    { size: 3, label: 'Hidden' },
    { size: 1, label: 'Output' },
  ],
}

// Weight initialization (deterministic)
function initWeights() {
  return {
    W1: [
      [0.4, -0.3],
      [0.2, 0.5],
      [-0.5, 0.1],
    ], // 3x2
    b1: [0.1, -0.2, 0.3],
    W2: [[0.3, -0.4, 0.6]], // 1x3
    b2: [0.0],
  }
}

function sigmoid(x) { return 1 / (1 + Math.exp(-x)) }
function sigmoidGrad(x) { const s = sigmoid(x); return s * (1 - s) }

function computeSteps({ sample }) {
  // sample is { x: [x1, x2], y: target }
  const x = sample.x
  const y = sample.y
  const { W1, b1, W2, b2 } = initWeights()

  const steps = []

  steps.push({
    description: `初始化: 输入 x=[${x.map(v => v.toFixed(1))}], 目标 y=${y}, 权重随机初始化`,
    line: 1, phase: 'init',
    x, y, W1, b1, W2, b2,
    z1: [0, 0, 0], a1: [0, 0, 0], z2: [0], a2: [0],
    dW1: W1.map(r => r.map(() => 0)), db1: [0, 0, 0],
    dW2: [[0, 0, 0]], db2: [0],
    loss: 0,
  })

  // FORWARD PASS
  // Layer 1: z1 = W1·x + b1, a1 = sigmoid(z1)
  const z1 = W1.map((row, i) => row[0] * x[0] + row[1] * x[1] + b1[i])
  steps.push({
    description: `前向 #1: 计算隐藏层加权和 z₁ = W₁·x + b₁ = [${z1.map(v => v.toFixed(3)).join(', ')}]`,
    line: 3, phase: 'forward-z1',
    x, y, W1, b1, W2, b2, z1, a1: z1, z2: [0], a2: [0],
    dW1: W1.map(r => r.map(() => 0)), db1: [0, 0, 0],
    dW2: [[0, 0, 0]], db2: [0],
    loss: 0, highlight: { layer: 0, next: 1 },
  })

  const a1 = z1.map(sigmoid)
  steps.push({
    description: `前向 #2: 隐藏层激活 a₁ = σ(z₁) = [${a1.map(v => v.toFixed(3)).join(', ')}]`,
    line: 4, phase: 'forward-a1',
    x, y, W1, b1, W2, b2, z1, a1, z2: [0], a2: [0],
    dW1: W1.map(r => r.map(() => 0)), db1: [0, 0, 0],
    dW2: [[0, 0, 0]], db2: [0],
    loss: 0, highlight: { layer: 1 },
  })

  // Layer 2: z2 = W2·a1 + b2, a2 = sigmoid(z2)
  const z2 = [W2[0][0] * a1[0] + W2[0][1] * a1[1] + W2[0][2] * a1[2] + b2[0]]
  steps.push({
    description: `前向 #3: 输出层加权和 z₂ = W₂·a₁ + b₂ = ${z2[0].toFixed(3)}`,
    line: 5, phase: 'forward-z2',
    x, y, W1, b1, W2, b2, z1, a1, z2, a2: z2,
    dW1: W1.map(r => r.map(() => 0)), db1: [0, 0, 0],
    dW2: [[0, 0, 0]], db2: [0],
    loss: 0, highlight: { layer: 1, next: 2 },
  })

  const a2 = z2.map(sigmoid)
  const loss = 0.5 * (a2[0] - y) ** 2
  steps.push({
    description: `前向 #4: 输出激活 a₂ = σ(z₂) = ${a2[0].toFixed(3)}, MSE Loss = ${loss.toFixed(4)}`,
    line: 6, phase: 'forward-a2',
    x, y, W1, b1, W2, b2, z1, a1, z2, a2,
    dW1: W1.map(r => r.map(() => 0)), db1: [0, 0, 0],
    dW2: [[0, 0, 0]], db2: [0],
    loss, highlight: { layer: 2 },
  })

  // BACKWARD PASS
  // dL/da2 = a2 - y
  const da2 = [a2[0] - y]
  // dz2 = da2 * sigmoid'(z2)
  const dz2 = [da2[0] * sigmoidGrad(z2[0])]
  steps.push({
    description: `反向 #1: δ₂ = dL/da₂ · σ'(z₂) = (a₂ - y)σ'(z₂) = ${dz2[0].toFixed(5)}`,
    line: 8, phase: 'back-dz2',
    x, y, W1, b1, W2, b2, z1, a1, z2, a2, loss,
    dW1: W1.map(r => r.map(() => 0)), db1: [0, 0, 0],
    dW2: [[0, 0, 0]], db2: [0],
    dz2, backHighlight: { layer: 2 },
  })

  // dW2 = dz2 · a1^T, db2 = dz2
  const dW2 = [a1.map(a => dz2[0] * a)]
  const db2 = [dz2[0]]
  steps.push({
    description: `反向 #2: dW₂ = δ₂·a₁ᵀ = [${dW2[0].map(v => v.toFixed(4)).join(', ')}], db₂ = ${db2[0].toFixed(4)}`,
    line: 9, phase: 'back-dW2',
    x, y, W1, b1, W2, b2, z1, a1, z2, a2, loss,
    dW1: W1.map(r => r.map(() => 0)), db1: [0, 0, 0],
    dW2, db2, dz2,
    backHighlight: { layer: 2, prev: 1 },
  })

  // da1 = W2^T · dz2, dz1 = da1 * sigmoid'(z1)
  const da1 = [W2[0][0] * dz2[0], W2[0][1] * dz2[0], W2[0][2] * dz2[0]]
  const dz1 = da1.map((d, i) => d * sigmoidGrad(z1[i]))
  steps.push({
    description: `反向 #3: δ₁ = (W₂ᵀ·δ₂) ⊙ σ'(z₁) = [${dz1.map(v => v.toFixed(5)).join(', ')}]`,
    line: 10, phase: 'back-dz1',
    x, y, W1, b1, W2, b2, z1, a1, z2, a2, loss,
    dW1: W1.map(r => r.map(() => 0)), db1: [0, 0, 0],
    dW2, db2, dz2, da1, dz1,
    backHighlight: { layer: 1 },
  })

  // dW1 = dz1 · x^T, db1 = dz1
  const dW1 = dz1.map(d => [d * x[0], d * x[1]])
  const db1 = dz1.slice()
  steps.push({
    description: `反向 #4: dW₁ = δ₁·xᵀ, db₁ = δ₁。所有梯度已计算完毕`,
    line: 11, phase: 'back-dW1',
    x, y, W1, b1, W2, b2, z1, a1, z2, a2, loss,
    dW1, db1, dW2, db2,
    dz2, da1, dz1,
    backHighlight: { layer: 1, prev: 0 },
  })

  return steps
}

function NetworkDiagram({ current }) {
  const W = 480
  const H = 280
  const layers = NET.layers
  const LX = [80, 240, 400] // x positions for each layer

  function nodePos(layerIdx, nodeIdx, total) {
    const x = LX[layerIdx]
    const spacing = (H - 80) / Math.max(total - 1, 1)
    const startY = 40 + (total < 3 ? 10 : 0)
    const y = startY + nodeIdx * spacing
    return { x, y }
  }

  const a = [current.x, current.a1, current.a2]
  const isForward = current.phase.startsWith('forward')
  const isBack = current.phase.startsWith('back')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
      {/* Edges */}
      {layers.map((layer, li) => {
        if (li === layers.length - 1) return null
        const nextLayer = layers[li + 1]
        return Array.from({ length: layer.size }, (_, ni) => {
          const p1 = nodePos(li, ni, layer.size)
          return Array.from({ length: nextLayer.size }, (_, nni) => {
            const p2 = nodePos(li + 1, nni, nextLayer.size)
            const Wmat = li === 0 ? current.W1 : current.W2
            const w = Wmat[nni][ni]
            const wNorm = Math.min(1, Math.abs(w) * 3)
            const isActive = isForward && current.highlight
              && ((current.highlight.layer === li && current.highlight.next === li + 1)
                || (current.highlight.layer === li + 1))
            const isBackActive = isBack && current.backHighlight
              && ((current.backHighlight.layer === li + 1 && current.backHighlight.prev === li)
                || (current.backHighlight.layer === li))
            return (
              <line key={`e-${li}-${ni}-${nni}`}
                x1={p1.x + 18} y1={p1.y} x2={p2.x - 18} y2={p2.y}
                stroke={w >= 0 ? AI_COLORS.weightPositive : AI_COLORS.weightNegative}
                strokeWidth={0.5 + wNorm * 2.5}
                opacity={(isActive || isBackActive) ? 0.9 : 0.25}
                style={{ transition: 'all 0.4s' }}
              />
            )
          })
        })
      })}

      {/* Nodes */}
      {layers.map((layer, li) => (
        Array.from({ length: layer.size }, (_, ni) => {
          const { x, y } = nodePos(li, ni, layer.size)
          const act = a[li][ni]
          const isHL = isForward && current.highlight?.layer === li
          const isBHL = isBack && current.backHighlight?.layer === li
          const intensity = li === 0 ? Math.min(1, Math.abs(act) * 0.5 + 0.3) : Math.max(0.2, act)
          const fill = li === 0
            ? (act > 0 ? `rgba(139,92,246,${0.3 + Math.abs(act) * 0.5})` : `rgba(239,68,68,${0.3 + Math.abs(act) * 0.5})`)
            : `rgba(139,92,246,${intensity})`
          return (
            <g key={`n-${li}-${ni}`}>
              <circle cx={x} cy={y} r="18"
                fill={fill}
                stroke={isHL || isBHL ? '#f97316' : 'var(--border)'}
                strokeWidth={isHL || isBHL ? 3 : 1.5}
                style={{ transition: 'all 0.4s' }}
              />
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="10" fontFamily="monospace" fontWeight="600"
                fill={li === 0 ? 'var(--text-primary)' : 'var(--text-primary)'}>
                {li === 0 ? `x${ni + 1}=${act.toFixed(1)}` : `a=${act.toFixed(2)}`}
              </text>
              <text x={x} y={y + 34} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)">
                {layer.label} {li > 0 ? ni + 1 : ''}
              </text>
            </g>
          )
        })
      ))}

      {/* Gradient labels on backward */}
      {isBack && current.dW2 && (
        <g>
          {/* W2 gradients */}
          <text x={LX[1] + 10} y={25} textAnchor="start" fontSize="10" fill="#f97316" fontWeight="600">
            dW₂ = [{current.dW2[0].map(v => v.toFixed(3)).join(', ')}]
          </text>
          <text x={LX[1] + 10} y={H - 10} textAnchor="start" fontSize="10" fill="#f97316" fontWeight="600">
            db₂ = {current.db2?.[0]?.toFixed(4) ?? 0}
          </text>
        </g>
      )}
    </svg>
  )
}

function GradientPanel({ current }) {
  const hasBack = current.phase.startsWith('back') || current.phase === 'back-dW1'
  if (!hasBack || !current.dW1) return null

  const rows = []
  for (let i = 0; i < 3; i++) {
    rows.push([
      `dW₁[${i}]`,
      current.dW1[i][0]?.toFixed(4) ?? '0.0000',
      current.dW1[i][1]?.toFixed(4) ?? '0.0000',
      (current.db1?.[i] ?? 0).toFixed(4),
    ])
  }

  return (
    <table style={{ borderCollapse: 'collapse', fontSize: 11, fontFamily: 'monospace', maxWidth: 380 }}>
      <thead>
        <tr style={{ background: 'var(--surface-2)' }}>
          {['', 'x₁', 'x₂', 'db'].map(h => (
            <th key={h} style={{ padding: '4px 10px', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, ci) => (
              <td key={ci} style={{ padding: '3px 10px', borderBottom: '1px solid var(--border)', color: ci === 0 ? '#f97316' : 'var(--text-primary)', textAlign: ci === 0 ? 'right' : 'center' }}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function NeuralNetworkPlayground() {
  const presets = useMemo(() => [
    { id: 'xor-1', label: 'XOR [1,0]→1', state: { sample: { x: [1, 0], y: 1 } } },
    { id: 'xor-0', label: 'XOR [0,0]→0', state: { sample: { x: [0, 0], y: 0 } } },
    { id: 'neg', label: '[−1,1]→1', state: { sample: { x: [-1, 1], y: 1 } } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ sample: { x: [1, 0], y: 1 } }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: AI_COLORS.weightPositive, label: '正权重' },
        { color: AI_COLORS.weightNegative, label: '负权重' },
        { color: '#f97316', label: '当前层' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <NetworkDiagram current={current} />
            <GradientPanel current={current} />
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span>phase: <b style={{ color: 'var(--text-primary)' }}>{current.phase}</b></span>
              <span>target y: <b>{current.y}</b></span>
              <span>output a₂: <b style={{ color: '#8b5cf6' }}>{current.a2[0].toFixed(4)}</b></span>
              <span>loss: <b style={{ color: current.loss > 0.05 ? '#ef4444' : '#10b981' }}>{current.loss.toFixed(4)}</b></span>
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
