import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 6]
const Y_RANGE = [0, 5]

const DATA = [
  { x: 0.9, y: 1.0, label: 0 }, { x: 1.4, y: 1.6, label: 0 }, { x: 2.0, y: 1.1, label: 0 },
  { x: 2.3, y: 2.0, label: 0 }, { x: 3.4, y: 3.3, label: 1 }, { x: 3.9, y: 2.8, label: 1 },
  { x: 4.5, y: 3.9, label: 1 }, { x: 5.0, y: 3.2, label: 1 },
]

const PROBE = { x: 3.0, y: 2.4 }

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }
function sigmoid(z) { return 1 / (1 + Math.exp(-z)) }

function computeSteps({ lr, lambda }) {
  const steps = []
  let w1 = -0.6
  let w2 = 0.3
  let b = 0.1
  const n = DATA.length

  for (let step = 0; step < 32; step++) {
    let loss = 0
    let gw1 = lambda * w1
    let gw2 = lambda * w2
    let gb = 0
    let correct = 0
    for (const p of DATA) {
      const prob = sigmoid(w1 * p.x + w2 * p.y + b)
      const err = prob - p.label
      loss += -(p.label * Math.log(prob + 1e-9) + (1 - p.label) * Math.log(1 - prob + 1e-9))
      gw1 += err * p.x
      gw2 += err * p.y
      gb += err
      if ((prob >= 0.5 ? 1 : 0) === p.label) correct++
    }
    gw1 /= n
    gw2 /= n
    gb /= n
    loss = loss / n + 0.5 * lambda * (w1 * w1 + w2 * w2)

    steps.push({
      description: `步骤 ${step + 1}: loss=${loss.toFixed(3)}, acc=${correct}/${n}`,
      w1, w2, b, loss, accuracy: correct / n, probability: sigmoid(w1 * PROBE.x + w2 * PROBE.y + b), lambda, lr,
      points: DATA,
    })

    w1 -= lr * gw1
    w2 -= lr * gw2
    b -= lr * gb
  }

  return steps
}

export default function LogisticRegressionPlayground() {
  const presets = useMemo(() => [
    { id: 'standard', label: '标准训练', state: { lr: 0.45, lambda: 0.0 } },
    { id: 'regularized', label: 'L2 正则', state: { lr: 0.35, lambda: 0.08 } },
    { id: 'fast', label: '大步长', state: { lr: 0.75, lambda: 0.0 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ lr: 0.45, lambda: 0 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#38bdf8', label: '类别 0' },
        { color: '#f472b6', label: '类别 1' },
        { color: '#f97316', label: '决策边界' },
      ]}
      renderViz={({ current }) => {
        const yLeft = -(current.w1 * X_RANGE[0] + current.b) / current.w2
        const yRight = -(current.w1 * X_RANGE[1] + current.b) / current.w2
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.06)" rx="8" />
                <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
                <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" />
                {current.points.map((p, i) => (
                  <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="6" fill={p.label ? '#f472b6' : '#38bdf8'} opacity="0.92" />
                ))}
                <line x1={sx(X_RANGE[0])} y1={sy(yLeft)} x2={sx(X_RANGE[1])} y2={sy(yRight)} stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                <circle cx={sx(PROBE.x)} cy={sy(PROBE.y)} r="7" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>loss: <b>{current.loss.toFixed(3)}</b></span>
                <span>acc: <b>{Math.round(current.accuracy * 100)}%</b></span>
                <span>P(y=1): <b>{current.probability.toFixed(2)}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
