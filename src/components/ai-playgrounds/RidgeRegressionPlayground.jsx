import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 6]
const Y_RANGE = [0, 6]

const DATA = [
  { x: 0.8, y: 1.2 }, { x: 1.4, y: 2.0 }, { x: 2.1, y: 2.4 },
  { x: 2.8, y: 3.5 }, { x: 3.5, y: 3.1 }, { x: 4.2, y: 4.6 },
  { x: 4.9, y: 4.8 }, { x: 5.5, y: 5.2 },
]

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }

function computeSteps({ alpha }) {
  const steps = []
  let w = 0.1
  let b = 0.1
  const n = DATA.length
  const lr = 0.02

  for (let step = 0; step < 30; step++) {
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
    gradW = (2 / n) * gradW + 2 * alpha * w
    gradB = (2 / n) * gradB

    const penalty = alpha * w * w
    const totalLoss = mse + penalty

    steps.push({
      description: `步骤 ${step + 1}: w=${w.toFixed(3)}, b=${b.toFixed(3)}, MSE=${mse.toFixed(3)}, L2惩罚=${penalty.toFixed(3)}`,
      w, b, mse, penalty, totalLoss, alpha, points: DATA,
    })

    w -= lr * gradW
    b -= lr * gradB
  }

  return steps
}

export default function RidgeRegressionPlayground() {
  const presets = useMemo(() => [
    { id: 'ols', label: 'α=0 (OLS)', state: { alpha: 0 } },
    { id: 'mild', label: 'α=1', state: { alpha: 1 } },
    { id: 'strong', label: 'α=10', state: { alpha: 10 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  const barW = 60
  const barH = 14

  return (
    <PlaygroundShell
      initialState={{ alpha: 0 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '数据点' },
        { color: '#f97316', label: '回归直线' },
      ]}
      renderViz={({ current }) => {
        const y0 = current.b
        const y1 = current.w * X_RANGE[1] + current.b
        const wMag = Math.min(Math.abs(current.w) / 2, 1)
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
                  x1={sx(X_RANGE[0])} y1={sy(y0)}
                  x2={sx(X_RANGE[1])} y2={sy(y1)}
                  stroke="#f97316" strokeWidth="3" strokeLinecap="round"
                />
                {/* Weight magnitude bar */}
                <text x={W - PAD - 80} y={PAD + 16} fontSize="10" fill="var(--text-secondary)">|w| 大小</text>
                <rect x={W - PAD - 80} y={PAD + 22} width={barW} height={barH} fill="var(--surface-2)" rx="3" />
                <rect x={W - PAD - 80} y={PAD + 22} width={barW * wMag} height={barH} fill="#f97316" rx="3" />
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>w: <b>{current.w.toFixed(3)}</b></span>
                <span>b: <b>{current.b.toFixed(3)}</b></span>
                <span>MSE: <b>{current.mse.toFixed(3)}</b></span>
                <span>L2: <b>{current.penalty.toFixed(3)}</b></span>
                <span>总损失: <b>{current.totalLoss.toFixed(3)}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
