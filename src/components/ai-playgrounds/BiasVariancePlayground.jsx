import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const COLORS = { primary: '#8b5cf6', secondary: '#f472b6', highlight: '#f97316', error: '#ef4444', tertiary: '#38bdf8', quaternary: '#fbbf24', success: '#22c55e' }
const X_RANGE = [0, 6]
const Y_RANGE = [-1.5, 1.5]

const DATA = [
  { x: 0.4, y: 0.38 }, { x: 0.8, y: 0.72 }, { x: 1.3, y: 0.96 }, { x: 1.8, y: 0.98 },
  { x: 2.2, y: 0.79 }, { x: 2.7, y: 0.42 }, { x: 3.1, y: -0.04 }, { x: 3.5, y: -0.47 },
  { x: 3.9, y: -0.75 }, { x: 4.3, y: -0.87 }, { x: 4.7, y: -0.65 }, { x: 5.1, y: -0.24 },
  { x: 5.5, y: 0.25 }, { x: 5.9, y: 0.63 },
]

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W / 2 - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }

function polyfit(data, degree) {
  const n = data.length
  const xs = data.map(d => d.x)
  const ys = data.map(d => d.y)
  // Build Vandermonde-like system and solve with simple gradient descent
  const coeffs = Array(degree + 1).fill(0)
  const lr = 0.001
  for (let iter = 0; iter < 800; iter++) {
    const grads = Array(degree + 1).fill(0)
    for (let i = 0; i < n; i++) {
      let pred = 0
      for (let d = 0; d <= degree; d++) pred += coeffs[d] * Math.pow(xs[i], d)
      const err = pred - ys[i]
      for (let d = 0; d <= degree; d++) grads[d] += (2 / n) * err * Math.pow(xs[i], d)
    }
    for (let d = 0; d <= degree; d++) coeffs[d] -= lr * grads[d]
  }
  return coeffs
}

function evaluate(coeffs, x) {
  return coeffs.reduce((s, c, d) => s + c * Math.pow(x, d), 0)
}

function computeSteps({ maxDegree }) {
  const steps = []
  const degrees = maxDegree === 1 ? [1] : maxDegree === 3 ? [1, 2, 3] : [1, 2, 3, 5, 7, 10]

  const results = []
  for (const deg of degrees) {
    const coeffs = polyfit(DATA, deg)
    const trainErr = DATA.reduce((s, p) => s + (evaluate(coeffs, p.x) - p.y) ** 2, 0) / DATA.length
    const testErr = trainErr * (1 + deg * 0.15 + (deg > 5 ? (deg - 5) * 0.3 : 0))
    const bias2 = Math.max(0.01, 0.5 / (deg + 0.5))
    const variance = Math.max(0.005, (deg * deg * 0.008))
    const irreducible = 0.02
    results.push({ deg, coeffs, trainErr, testErr, bias2, variance, irreducible })
  }

  steps.push({ description: '原始数据：带噪声的正弦曲线采样点', phase: 'data', results: [], activeIdx: -1, currentFit: null })

  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    steps.push({ description: `拟合 ${r.deg} 次多项式: 训练误差=${r.trainErr.toFixed(4)}, 测试误差≈${r.testErr.toFixed(4)}`, phase: 'fit', results: results.slice(0, i + 1), activeIdx: i, currentFit: r })
  }

  steps.push({ description: '偏差-方差分解：展示模型复杂度与误差的关系', phase: 'decomposition', results, activeIdx: -1, currentFit: null })

  return steps
}

export default function BiasVariancePlayground() {
  const presets = useMemo(() => [
    { id: 'linear', label: '线性 (欠拟合)', state: { maxDegree: 1 } },
    { id: 'poly3', label: '3次多项式 (适中)', state: { maxDegree: 3 } },
    { id: 'poly10', label: '10次多项式 (过拟合)', state: { maxDegree: 10 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ maxDegree: 3 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: COLORS.primary, label: '数据点' },
        { color: COLORS.highlight, label: '拟合曲线' },
        { color: COLORS.error, label: '偏差²' },
        { color: COLORS.tertiary, label: '方差' },
      ]}
      renderViz={({ current }) => {
        const halfW = W / 2
        const chartX = halfW + 10
        const chartW = halfW - PAD - 10
        const maxErr = Math.max(...current.results.map(r => r.testErr), 0.5)

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                {/* Left: scatter + fit */}
                <rect x={PAD} y={PAD - 10} width={halfW - PAD * 2 + 10} height={H - PAD * 2 + 10} fill="rgba(139,92,246,0.04)" rx="6" />
                <line x1={PAD} y1={H - PAD} x2={halfW - PAD} y2={H - PAD} stroke="var(--border)" />
                <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" />
                {DATA.map((p, i) => (
                  <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="4" fill={COLORS.primary} opacity="0.85" />
                ))}
                {current.currentFit && (
                  <polyline
                    points={Array.from({ length: 60 }, (_, i) => {
                      const x = X_RANGE[0] + (X_RANGE[1] - X_RANGE[0]) * i / 59
                      const y = evaluate(current.currentFit.coeffs, x)
                      const clampedY = Math.max(Y_RANGE[0], Math.min(Y_RANGE[1], y))
                      return `${sx(x)},${sy(clampedY)}`
                    }).join(' ')}
                    fill="none" stroke={COLORS.highlight} strokeWidth="2.5" strokeLinejoin="round"
                  />
                )}
                {current.currentFit && (
                  <text x={halfW / 2} y={PAD + 6} textAnchor="middle" fontSize="10" fill={COLORS.highlight} fontWeight="600">
                    degree = {current.currentFit.deg}
                  </text>
                )}

                {/* Right: bias-variance chart */}
                {current.phase === 'decomposition' && current.results.length > 1 && (
                  <g>
                    <rect x={chartX} y={PAD - 10} width={chartW} height={H - PAD * 2 + 10} fill="rgba(56,189,248,0.04)" rx="6" />
                    <text x={chartX + chartW / 2} y={PAD + 4} textAnchor="middle" fontSize="10" fill="var(--text-secondary)" fontWeight="600">偏差-方差分解</text>
                    <line x1={chartX + 5} y1={H - PAD} x2={chartX + chartW - 5} y2={H - PAD} stroke="var(--border)" />
                    <text x={chartX + chartW / 2} y={H - PAD + 14} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)">模型复杂度 →</text>
                    {current.results.map((r, i) => {
                      const x = chartX + 20 + i * (chartW - 40) / Math.max(current.results.length - 1, 1)
                      const biasH = r.bias2 / maxErr * (H - PAD * 2 - 30)
                      const varH = r.variance / maxErr * (H - PAD * 2 - 30)
                      const irrH = r.irreducible / maxErr * (H - PAD * 2 - 30)
                      const baseY = H - PAD
                      return (
                        <g key={i}>
                          <rect x={x - 8} y={baseY - irrH} width={16} height={irrH} fill="#6b7280" opacity="0.5" rx="1" />
                          <rect x={x - 8} y={baseY - irrH - biasH} width={16} height={biasH} fill={COLORS.error} opacity="0.7" rx="1" />
                          <rect x={x - 8} y={baseY - irrH - biasH - varH} width={16} height={varH} fill={COLORS.tertiary} opacity="0.7" rx="1" />
                          <text x={x} y={baseY + 12} textAnchor="middle" fontSize="8" fill="var(--text-tertiary)">d={r.deg}</text>
                        </g>
                      )
                    })}
                  </g>
                )}
                {current.phase === 'fit' && current.results.length > 1 && (
                  <g>
                    <text x={chartX + 20} y={PAD + 20} fontSize="10" fill="var(--text-secondary)">训练误差: <tspan fontWeight="700" fill={COLORS.success}>{current.currentFit.trainErr.toFixed(4)}</tspan></text>
                    <text x={chartX + 20} y={PAD + 36} fontSize="10" fill="var(--text-secondary)">测试误差: <tspan fontWeight="700" fill={COLORS.error}>{current.currentFit.testErr.toFixed(4)}</tspan></text>
                    <text x={chartX + 20} y={PAD + 52} fontSize="10" fill="var(--text-secondary)">偏差²: <tspan fontWeight="700" fill={COLORS.error}>{current.currentFit.bias2.toFixed(4)}</tspan></text>
                    <text x={chartX + 20} y={PAD + 68} fontSize="10" fill="var(--text-secondary)">方差: <tspan fontWeight="700" fill={COLORS.tertiary}>{current.currentFit.variance.toFixed(4)}</tspan></text>
                  </g>
                )}
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                {current.currentFit && (
                  <>
                    <span>复杂度: <b>deg={current.currentFit.deg}</b></span>
                    <span>训练误差: <b>{current.currentFit.trainErr.toFixed(4)}</b></span>
                    <span>偏差²: <b>{current.currentFit.bias2.toFixed(4)}</b></span>
                    <span>方差: <b>{current.currentFit.variance.toFixed(4)}</b></span>
                  </>
                )}
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
