import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 6]
const Y_RANGE = [0, 6]

const DATA = [
  { x: 0.6, y: 1.0 }, { x: 1.1, y: 1.4 }, { x: 1.7, y: 1.9 },
  { x: 2.3, y: 2.5 }, { x: 3.0, y: 3.2 }, { x: 3.7, y: 3.6 },
  { x: 4.4, y: 4.5 }, { x: 5.1, y: 5.0 },
]

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }

function computeSteps({ lr, w0, b0 }) {
  const steps = []
  let w = w0
  let b = b0
  const n = DATA.length

  for (let step = 0; step < 28; step++) {
    let mse = 0
    let gradW = 0
    let gradB = 0
    for (const p of DATA) {
      const pred = w * p.x + b
      const err = pred - p.y
      mse += err * err
      gradW += err * p.x
      gradB += err
    }
    mse /= n
    gradW = (2 / n) * gradW
    gradB = (2 / n) * gradB

    steps.push({
      description: `步骤 ${step + 1}: w=${w.toFixed(3)}, b=${b.toFixed(3)}, MSE=${mse.toFixed(4)}`,
      w, b, mse, gradW, gradB, lr, points: DATA,
    })

    w -= lr * gradW
    b -= lr * gradB
  }

  return steps
}

export default function LinearRegressionPlayground() {
  const presets = useMemo(() => [
    { id: 'standard', label: '标准训练', state: { lr: 0.035, w0: 0.1, b0: 0.2 } },
    { id: 'slow', label: '小学习率', state: { lr: 0.012, w0: 0.1, b0: 0.2 } },
    { id: 'biased', label: '高截距初始', state: { lr: 0.03, w0: -0.2, b0: 3.5 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ lr: 0.035, w0: 0.1, b0: 0.2 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '样本点' },
        { color: '#f97316', label: '当前拟合直线' },
      ]}
      renderViz={({ current }) => {
        const y0 = current.b
        const y1 = current.w * X_RANGE[1] + current.b
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
                <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" />
                {current.points.map((p, i) => (
                  <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="5" fill="#8b5cf6" opacity="0.9" />
                ))}
                <line
                  x1={sx(X_RANGE[0])}
                  y1={sy(y0)}
                  x2={sx(X_RANGE[1])}
                  y2={sy(y1)}
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>w: <b>{current.w.toFixed(3)}</b></span>
                <span>b: <b>{current.b.toFixed(3)}</b></span>
                <span>MSE: <b>{current.mse.toFixed(4)}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
