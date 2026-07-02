import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 6]
const Y_RANGE = [0, 6]
const FEATURES = ['x1', 'x2', 'x3', 'x4', 'x5']
const TRUE_W = [1.5, 0.8, 0, -0.6, 0]

const DATA = Array.from({ length: 10 }, (_, i) => {
  const x = 0.5 + i * 0.55
  const noise = (Math.sin(i * 3.7) * 0.3)
  const y = TRUE_W[0] * x + TRUE_W[1] * (x * 0.6) + TRUE_W[3] * (x * 0.3) + 0.5 + noise
  return { x, y: Math.min(Math.max(y, 0.2), 5.8) }
})

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }

function softThreshold(rho, lam) {
  if (rho > lam) return rho - lam
  if (rho < -lam) return rho + lam
  return 0
}

function computeSteps({ alpha }) {
  const steps = []
  const n = DATA.length
  const featureMatrix = DATA.map(p => [p.x, p.x * 0.6, p.x * 0.2, p.x * 0.3, p.x * 0.1])
  const ys = DATA.map(p => p.y)
  let weights = [0.01, 0.01, 0.01, 0.01, 0.01]
  const bias = ys.reduce((s, v) => s + v, 0) / n

  for (let iter = 0; iter < 20; iter++) {
    for (let j = 0; j < 5; j++) {
      let rho = 0
      for (let i = 0; i < n; i++) {
        let residual = ys[i] - bias
        for (let k = 0; k < 5; k++) {
          if (k !== j) residual -= featureMatrix[i][k] * weights[k]
        }
        rho += featureMatrix[i][j] * residual
      }
      rho /= n
      const colNorm = featureMatrix.reduce((s, row) => s + row[j] * row[j], 0) / n
      weights[j] = colNorm > 0 ? softThreshold(rho, alpha / 2) / colNorm : 0
    }

    let mse = 0
    for (let i = 0; i < n; i++) {
      let pred = bias
      for (let j = 0; j < 5; j++) pred += featureMatrix[i][j] * weights[j]
      mse += (pred - ys[i]) ** 2
    }
    mse /= n
    const l1Penalty = alpha * weights.reduce((s, w) => s + Math.abs(w), 0)
    const activeCount = weights.filter(w => Math.abs(w) > 1e-4).length

    steps.push({
      description: `迭代 ${iter + 1}: 坐标下降更新权重，活跃特征 ${activeCount}/5`,
      weights: [...weights], mse, l1Penalty, activeCount, alpha, points: DATA,
    })
  }

  return steps
}

export default function LassoRegressionPlayground() {
  const presets = useMemo(() => [
    { id: 'weak', label: 'α=0.01', state: { alpha: 0.01 } },
    { id: 'medium', label: 'α=0.1', state: { alpha: 0.1 } },
    { id: 'strong', label: 'α=1.0', state: { alpha: 1.0 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  const BAR_MAX_H = 80
  const BAR_W = 32
  const BAR_GAP = 12

  return (
    <PlaygroundShell
      initialState={{ alpha: 0.1 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '数据点' },
        { color: '#f97316', label: '拟合直线' },
        { color: '#38bdf8', label: '特征权重' },
      ]}
      renderViz={({ current }) => {
        const totalW = current.weights[0] + current.weights[1] * 0.6 + current.weights[3] * 0.3
        const bias = current.points.reduce((s, p) => s + p.y, 0) / current.points.length - totalW * current.points.reduce((s, p) => s + p.x, 0) / current.points.length
        const y0 = bias
        const y1 = totalW * X_RANGE[1] + bias
        const maxAbsW = Math.max(...current.weights.map(Math.abs), 0.01)
        const barStartX = W - PAD - (FEATURES.length * (BAR_W + BAR_GAP))
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
                <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" />
                {current.points.map((p, i) => (
                  <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="5" fill="#8b5cf6" opacity="0.9" />
                ))}
                <line x1={sx(X_RANGE[0])} y1={sy(y0)} x2={sx(X_RANGE[1])} y2={sy(y1)} stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                {/* Weight bars */}
                {FEATURES.map((f, j) => {
                  const bh = (Math.abs(current.weights[j]) / maxAbsW) * BAR_MAX_H
                  const bx = barStartX + j * (BAR_W + BAR_GAP)
                  const by = H - PAD - bh
                  const isZero = Math.abs(current.weights[j]) < 1e-4
                  return (
                    <g key={f}>
                      <rect x={bx} y={by} width={BAR_W} height={Math.max(bh, 1)} fill={isZero ? 'var(--surface-3)' : '#38bdf8'} rx="3" />
                      <text x={bx + BAR_W / 2} y={H - PAD + 12} textAnchor="middle" fontSize="9" fill="var(--text-secondary)">{f}</text>
                      <text x={bx + BAR_W / 2} y={by - 4} textAnchor="middle" fontSize="8" fill={isZero ? '#ef4444' : 'var(--text-secondary)'}>
                        {current.weights[j].toFixed(2)}
                      </text>
                    </g>
                  )
                })}
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>活跃特征: <b>{current.activeCount}/5</b></span>
                <span>MSE: <b>{current.mse.toFixed(3)}</b></span>
                <span>L1: <b>{current.l1Penalty.toFixed(3)}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
