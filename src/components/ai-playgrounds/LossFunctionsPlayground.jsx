import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520, H = 320, PAD = 36
const COLORS = { mse: '#8b5cf6', mae: '#38bdf8', huber: '#f97316', ce: '#f472b6', hinge: '#fbbf24', focal: '#22c55e' }

function mse(y, t) { return (y - t) ** 2 }
function mae(y, t) { return Math.abs(y - t) }
function huber(y, t, d = 1) { const r = Math.abs(y - t); return r <= d ? 0.5 * r * r : d * (r - 0.5 * d) }
function bce(y, t) { const p = Math.max(1e-7, Math.min(1 - 1e-7, y)); return -(t * Math.log(p) + (1 - t) * Math.log(1 - p)) }
function hinge(y, t) { return Math.max(0, 1 - t * y) }
function focal(y, t, g = 2) { const p = Math.max(1e-7, Math.min(1 - 1e-7, y)); return -((1 - p) ** g) * Math.log(p) * t - (p ** g) * Math.log(1 - p) * (1 - t) }

const REGRESSION = [
  { key: 'mse', fn: (y) => mse(y, 0), label: 'MSE', color: COLORS.mse, formula: '(y-t)²', robust: '低' },
  { key: 'mae', fn: (y) => mae(y, 0), label: 'MAE', color: COLORS.mae, formula: '|y-t|', robust: '高' },
  { key: 'huber', fn: (y) => huber(y, 0), label: 'Huber', color: COLORS.huber, formula: 'δ·|r|-½δ²', robust: '中' },
]

const CLASSIFICATION = [
  { key: 'ce', fn: (y) => bce(y, 1), label: '交叉熵', color: COLORS.ce, formula: '-log(p)', robust: '中', xRange: [0.01, 0.99] },
  { key: 'hinge', fn: (y) => hinge(y, 1), label: 'Hinge', color: COLORS.hinge, formula: 'max(0,1-ty)', robust: '中', xRange: [-1, 2] },
  { key: 'focal', fn: (y) => focal(y, 1, 2), label: 'Focal (γ=2)', color: COLORS.focal, formula: '-(1-p)ᵞlog(p)', robust: '高', xRange: [0.01, 0.99] },
]

function buildCurve(fn, xMin, xMax, n = 100) {
  const pts = []
  let yMin = Infinity, yMax = -Infinity
  const step = (xMax - xMin) / n
  for (let x = xMin; x <= xMax; x += step) {
    const y = fn(x)
    if (isFinite(y)) { pts.push({ x, y }); if (y < yMin) yMin = y; if (y > yMax) yMax = y }
  }
  return { pts, yRange: [Math.min(yMin, 0) - 0.1, yMax + 0.2] }
}

function sx(x, range) { return PAD + (x - range[0]) / (range[1] - range[0]) * (W - PAD * 2) }
function sy(y, range) { return H - PAD - (y - range[0]) / (range[1] - range[0]) * (H - PAD * 2) }

function computeSteps({ group }) {
  const funcs = group === 'regression' ? REGRESSION : group === 'classification' ? CLASSIFICATION : [...REGRESSION, ...CLASSIFICATION]
  const steps = []
  funcs.forEach((f, idx) => {
    const xR = f.xRange || [-3, 3]
    const curve = buildCurve(f.fn, xR[0], xR[1])
    steps.push({ description: `${idx + 1}. ${f.label}: ${f.formula}`, key: f.key, curve, info: f, xRange: xR, phase: 'single' })
  })
  // Overlay step
  const xR = group === 'classification' ? [0.01, 0.99] : [-3, 3]
  const curves = funcs.map(f => ({ ...f, curve: buildCurve(f.fn, (f.xRange || xR)[0], (f.xRange || xR)[1]) }))
  steps.push({ description: '所有损失函数叠加对比', curves, xRange: xR, phase: 'compare' })
  return steps
}

export default function LossFunctionsPlayground() {
  const presets = useMemo(() => [
    { id: 'regression', label: '回归损失', state: { group: 'regression' } },
    { id: 'classification', label: '分类损失', state: { group: 'classification' } },
    { id: 'robust', label: '鲁棒损失', state: { group: 'all' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ group: 'regression' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: COLORS.mse, label: 'MSE' },
        { color: COLORS.mae, label: 'MAE' },
        { color: COLORS.huber, label: 'Huber' },
        { color: COLORS.ce, label: '交叉熵' },
        { color: COLORS.hinge, label: 'Hinge' },
        { color: COLORS.focal, label: 'Focal' },
      ]}
      renderViz={({ current }) => {
        if (current.phase === 'compare') {
          const { curves, xRange } = current
          // Normalize all to same y range for overlay
          let gYMin = Infinity, gYMax = -Infinity
          curves.forEach(c => { if (c.curve.yRange[0] < gYMin) gYMin = c.curve.yRange[0]; if (c.curve.yRange[1] > gYMax) gYMax = c.curve.yRange[1] })
          const gYRange = [gYMin, Math.min(gYMax, 10)]
          return (
            <VizCard>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                  <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
                  <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
                  {curves.map(c => {
                    const d = c.curve.pts.filter(p => p.y <= gYRange[1]).map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x, xRange)},${sy(p.y, gYRange)}`).join('')
                    return <path key={c.key} d={d} fill="none" stroke={c.color} strokeWidth="2.5" opacity="0.8" />
                  })}
                  <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)">预测值</text>
                  <text x={12} y={H / 2} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)" transform={`rotate(-90, 12, ${H / 2})`}>损失</text>
                </svg>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {curves.map(c => (
                    <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, display: 'inline-block' }} />{c.label}
                    </div>
                  ))}
                </div>
              </div>
            </VizCard>
          )
        }
        // Single
        const { curve, info, xRange } = current
        const pathD = curve.pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x, xRange)},${sy(p.y, curve.yRange)}`).join('')
        // Gradient at midpoint
        const midIdx = Math.floor(curve.pts.length / 2)
        const gradApprox = midIdx > 0 ? (curve.pts[midIdx].y - curve.pts[midIdx - 1].y) / (curve.pts[midIdx].x - curve.pts[midIdx - 1].x) : 0
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
                <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
                {/* Zero line for regression */}
                {xRange[0] < 0 && <line x1={sx(0, xRange)} y1={PAD} x2={sx(0, xRange)} y2={H - PAD} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4,4" />}
                <path d={pathD} fill="none" stroke={info.color} strokeWidth="3" />
                <text x={W / 2} y={PAD - 8} textAnchor="middle" fontSize="13" fill={info.color} fontWeight="700">{info.label}</text>
                <text x={W / 2 + 60} y={PAD - 8} textAnchor="start" fontSize="11" fill="var(--text-tertiary)">{info.formula}</text>
                <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)">预测 - 目标</text>
              </svg>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, width: '100%', maxWidth: 440 }}>
                <InfoBox label="函数" value={info.label} />
                <InfoBox label="公式" value={info.formula} />
                <InfoBox label="中点梯度" value={gradApprox.toFixed(3)} />
                <InfoBox label="抗离群值" value={info.robust} />
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
