import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520, H = 320, PAD = 36
const X_RANGE = [0, 6], Y_RANGE = [0, 6]

const DATA = [
  { x: 0.6, y: 1.0 }, { x: 1.1, y: 1.4 }, { x: 1.7, y: 1.9 },
  { x: 2.3, y: 2.5 }, { x: 3.0, y: 3.2 }, { x: 3.7, y: 3.6 },
  { x: 4.4, y: 4.5 }, { x: 5.1, y: 5.0 }, { x: 5.6, y: 2.0 }, // outlier
]

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }

function computeSteps({ variant, alpha, lr }) {
  const steps = []
  let w = 0.1, b = 0.2
  const n = DATA.length
  const maxSteps = 40
  const lam = alpha

  for (let i = 0; i < maxSteps; i++) {
    let mse = 0
    let gw = 0, gb = 0
    for (const p of DATA) {
      const pred = w * p.x + b
      const err = pred - p.y
      mse += err * err
      gw += err * p.x
      gb += err
    }
    mse /= n
    gw = (2 / n) * gw
    gb = (2 / n) * gb
    const regPenalty = variant === 'ridge' ? 2 * lam * w : 0
    const l1Penalty = variant === 'lasso' ? lam * Math.sign(w) : 0
    gw += regPenalty + l1Penalty

    steps.push({
      description: `步骤 ${i + 1}: w=${w.toFixed(3)}, b=${b.toFixed(3)}, MSE=${mse.toFixed(3)}, ‖w‖=${Math.abs(w).toFixed(3)}`,
      w, b, mse, lr, variant, alpha,
      regTerm: variant === 'ridge' ? lam * w * w : lam * Math.abs(w),
      points: DATA,
      line: (i % 4) + 2,
    })
    w -= lr * gw
    b -= lr * gb
  }
  steps.push({
    description: `收敛: w=${w.toFixed(3)}, b=${b.toFixed(3)}, MSE=${(() => {
      let m = 0; for (const p of DATA) { const e = w * p.x + b - p.y; m += e * e } return (m / DATA.length).toFixed(3)
    })()}`,
    w, b, mse: DATA.reduce((s, p) => { const e = w * p.x + b - p.y; return s + e * e }, 0) / DATA.length,
    lr, variant, alpha, regTerm: variant === 'ridge' ? lam * w * w : lam * Math.abs(w),
    points: DATA, line: 6,
  })
  return steps
}

export default function RidgeLassoPlayground() {
  const compute = useCallback((s) => computeSteps(s), [])
  const presets = useMemo(() => [
    { id: 'ols', label: 'OLS(无正则)', state: { variant: 'ols', alpha: 0, lr: 0.03 } },
    { id: 'ridge-small', label: 'Ridge λ=0.05', state: { variant: 'ridge', alpha: 0.05, lr: 0.03 } },
    { id: 'ridge-big', label: 'Ridge λ=1.0', state: { variant: 'ridge', alpha: 1.0, lr: 0.02 } },
    { id: 'lasso', label: 'Lasso λ=0.1', state: { variant: 'lasso', alpha: 0.1, lr: 0.03 } },
  ], [])

  return (
    <PlaygroundShell
      initialState={{ variant: 'ridge', alpha: 0.05, lr: 0.03 }}
      presets={presets}
      derivePayload={(s) => s}
      computeSteps={compute}
      extraToolbar={({ state, setState }) => (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
            λ:
            <input type="range" min="0" max="2" step="0.01" value={state.alpha}
              onChange={(e) => setState((p) => ({ ...p, alpha: parseFloat(e.target.value) }))}
              style={{ width: 80 }} />
            <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{state.alpha.toFixed(2)}</span>
          </label>
        </div>
      )}
      legend={[
        { color: '#8b5cf6', label: '数据点' },
        { color: '#f97316', label: '拟合直线' },
        { color: '#ef4444', label: '异常点' },
      ]}
      renderViz={({ current }) => {
        const y0 = current.b, y1 = current.w * X_RANGE[1] + current.b
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
                <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" />
                {current.points.map((p, i) => {
                  const isOutlier = i === current.points.length - 1
                  return (
                    <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={isOutlier ? 7 : 5}
                      fill={isOutlier ? '#ef4444' : '#8b5cf6'} opacity="0.9"
                      stroke="white" strokeWidth="1.5" />
                  )
                })}
                <line x1={sx(X_RANGE[0])} y1={sy(y0)} x2={sx(X_RANGE[1])} y2={sy(y1)}
                  stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span>方法: <b>{current.variant === 'ridge' ? 'Ridge (L2)' : current.variant === 'lasso' ? 'Lasso (L1)' : 'OLS'}</b></span>
                <span>w: <b>{current.w.toFixed(3)}</b></span>
                <span>b: <b>{current.b.toFixed(3)}</b></span>
                <span>MSE: <b>{current.mse.toFixed(3)}</b></span>
                {current.variant !== 'ols' && <span>正则项: <b>{current.regTerm.toFixed(4)}</b></span>}
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
