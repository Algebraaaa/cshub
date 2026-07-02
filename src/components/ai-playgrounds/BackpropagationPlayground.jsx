import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'
import { AI_COLORS } from '../../styles/aiVizTokens'

const LAYERS = [2, 3, 1]

function sigmoid(z) { return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, z)))) }

function computeSteps() {
  const steps = []
  const inputs = [0.5, 0.8]
  const target = 1.0
  const lr = 0.5
  const w = [
    [[0.2, -0.1], [0.4, 0.3], [-0.5, 0.2]],
    [[0.3, -0.2, 0.1]],
  ]
  const b = [[0.1, -0.1, 0.05], [0.1]]

  // Forward
  const a = [inputs], z = [null]
  for (let l = 1; l < LAYERS.length; l++) {
    const zl = [], al = []
    for (let j = 0; j < LAYERS[l]; j++) {
      let sum = b[l - 1][j]
      for (let k = 0; k < LAYERS[l - 1]; k++) sum += w[l - 1][j][k] * a[l - 1][k]
      zl.push(sum); al.push(sigmoid(sum))
    }
    z.push(zl); a.push(al)
  }

  const output = a[2][0]
  const loss = 0.5 * (target - output) ** 2

  steps.push({
    description: `前向传播完成: ŷ=${output.toFixed(4)}, 目标=${target}, 损失=MSE=${loss.toFixed(4)}`,
    phase: 'forward', deltas: [], gradients: [],
    activations: a.map(l => [...l]), output, target, loss,
  })

  // Backward: output layer delta
  const delta2 = [(output - target) * output * (1 - output)]
  steps.push({
    description: `输出层误差信号: δ² = (ŷ-y)×σ'(z) = (${output.toFixed(3)}-${target})×${(output * (1 - output)).toFixed(3)} = ${delta2[0].toFixed(4)}`,
    phase: 'output-delta', deltas: [delta2], gradients: [],
    activations: a.map(l => [...l]), output, target, loss,
  })

  // Hidden layer deltas
  const delta1 = []
  for (let j = 0; j < LAYERS[1]; j++) {
    const d = delta2[0] * w[1][0][j] * a[1][j] * (1 - a[1][j])
    delta1.push(d)
  }
  steps.push({
    description: `隐藏层误差信号: δ¹ⱼ = Σδ²×w²ⱼ×σ'(z¹ⱼ) = [${delta1.map(d => d.toFixed(4)).join(', ')}]`,
    phase: 'hidden-delta', deltas: [delta1, delta2], gradients: [],
    activations: a.map(l => [...l]), output, target, loss,
  })

  // Compute gradients for output layer
  const gradW2 = [[]]
  for (let k = 0; k < LAYERS[1]; k++) gradW2[0].push(delta2[0] * a[1][k])
  steps.push({
    description: `输出层梯度: ∂L/∂w² = δ²×a¹ = [${gradW2[0].map(g => g.toFixed(4)).join(', ')}]`,
    phase: 'output-grad', deltas: [delta1, delta2], gradients: [gradW2],
    activations: a.map(l => [...l]), output, target, loss,
  })

  // Compute gradients for hidden layer
  const gradW1 = []
  for (let j = 0; j < LAYERS[1]; j++) {
    const row = []
    for (let k = 0; k < LAYERS[0]; k++) row.push(delta1[j] * a[0][k])
    gradW1.push(row)
  }
  steps.push({
    description: `隐藏层梯度: ∂L/∂w¹ⱼₖ = δ¹ⱼ×a⁰ₖ (计算中)`,
    phase: 'hidden-grad', deltas: [delta1, delta2], gradients: [gradW1, gradW2],
    activations: a.map(l => [...l]), output, target, loss,
  })

  // Apply updates
  steps.push({
    description: `参数更新: w ← w - lr×∇L (学习率=${lr}), 新损失将减小`,
    phase: 'update', deltas: [delta1, delta2], gradients: [gradW1, gradW2],
    activations: a.map(l => [...l]), output, target, loss, lr,
  })

  return steps
}

function NetworkViz({ current }) {
  if (!current) return null
  const W = 500, H = 300
  const layerX = [80, 250, 420]
  const nodePos = []
  for (let l = 0; l < LAYERS.length; l++) {
    const nodes = []
    for (let n = 0; n < LAYERS[l]; n++) {
      nodes.push({ x: layerX[l], y: H / 2 + (n - (LAYERS[l] - 1) / 2) * 55 })
    }
    nodePos.push(nodes)
  }

  const showDeltas = current.phase === 'output-delta' || current.phase === 'hidden-delta' || current.phase === 'output-grad' || current.phase === 'hidden-grad' || current.phase === 'update'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 500 }}>
      {/* Edges with gradient flow */}
      {[1].map(l => // only hidden→output edges for backprop viz
        Array.from({ length: LAYERS[l] }, (_, j) =>
          Array.from({ length: LAYERS[l - 1] }, (_, k) => {
            const from = nodePos[l - 1][k], to = nodePos[l][j]
            const isActive = showDeltas
            return (
              <line key={`e-${l}-${j}-${k}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={isActive ? '#f97316' : AI_COLORS.edgeInactive}
                strokeWidth={isActive ? 2 : 0.5}
                opacity={isActive ? 0.8 : 0.3}
                markerEnd={isActive ? 'url(#bp-arrow)' : undefined}
              />
            )
          })
        )
      )}
      <defs><marker id="bp-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#f97316" /></marker></defs>

      {/* Nodes */}
      {nodePos.map((nodes, l) =>
        nodes.map((pos, n) => {
          const isDelta = showDeltas && (l >= 1)
          return (
            <g key={`n-${l}-${n}`}>
              <circle cx={pos.x} cy={pos.y} r="18"
                fill={isDelta ? '#f97316' : AI_COLORS.nodeActive}
                stroke={isDelta ? '#fb923c' : '#a78bfa'} strokeWidth="2">
                {isDelta && <animate attributeName="r" values="18;21;18" dur="0.8s" repeatCount="indefinite" />}
              </circle>
              {current.activations?.[l]?.[n] !== undefined && (
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="white" fontSize="9" fontFamily="monospace">
                  {current.activations[l][n].toFixed(2)}
                </text>
              )}
              {isDelta && current.deltas?.[l - 1]?.[n] !== undefined && (
                <text x={pos.x} y={pos.y - 24} textAnchor="middle" fill="#f97316" fontSize="9" fontFamily="monospace">
                  δ={current.deltas[l - 1][n].toFixed(3)}
                </text>
              )}
            </g>
          )
        })
      )}
      <text x={layerX[0]} y={H - 10} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11">输入层</text>
      <text x={layerX[1]} y={H - 10} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11">隐藏层</text>
      <text x={layerX[2]} y={H - 10} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11">输出层</text>
    </svg>
  )
}

export default function BackpropagationPlayground() {
  const presets = useMemo(() => [
    { id: 'bp', label: '反向传播', state: { mode: 'bp' } },
  ], [])
  const computeStepsFn = useCallback(() => computeSteps(), [])

  return (
    <PlaygroundShell
      initialState={{ mode: 'bp' }}
      presets={presets} derivePayload={s => s} computeSteps={computeStepsFn}
      legend={[
        { color: AI_COLORS.nodeActive, label: '前向激活' },
        { color: '#f97316', label: '反向误差信号' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <NetworkViz current={current} />
            <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span>损失: <b style={{ color: '#ef4444' }}>{current.loss?.toFixed(4)}</b></span>
              <span>输出: <b>{current.output?.toFixed(4)}</b></span>
              <span>目标: <b>{current.target}</b></span>
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
