import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 6]
const Y_RANGE = [0, 5]

function makeData(preset) {
  const pts = []
  if (preset === 'elongated') {
    for (let i = 0; i < 18; i++) {
      const t = (i / 17) * 4 + 0.5
      pts.push({ x: t + (Math.sin(i * 2.7) * 0.3), y: 0.7 * t + 0.5 + (Math.cos(i * 3.1) * 0.25) })
    }
  } else if (preset === 'circular') {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2
      const r = 1.5 + Math.sin(i * 4) * 0.2
      pts.push({ x: 3 + Math.cos(a) * r, y: 2.5 + Math.sin(a) * r })
    }
  } else {
    for (let i = 0; i < 16; i++) {
      const t = (i / 15) * 3.5 + 1
      pts.push({ x: t + Math.sin(i * 1.8) * 0.4, y: -0.6 * t + 4 + Math.cos(i * 2.3) * 0.35 })
    }
  }
  return pts
}

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }

function mean(pts) {
  const mx = pts.reduce((s, p) => s + p.x, 0) / pts.length
  const my = pts.reduce((s, p) => s + p.y, 0) / pts.length
  return { x: mx, y: my }
}

function computeSteps({ preset }) {
  const data = makeData(preset)
  const m = mean(data)
  const centered = data.map(p => ({ x: p.x - m.x, y: p.y - m.y }))

  let cxx = 0, cxy = 0, cyy = 0
  centered.forEach(p => { cxx += p.x * p.x; cxy += p.x * p.y; cyy += p.y * p.y })
  const n = centered.length
  cxx /= n; cxy /= n; cyy /= n

  const trace = cxx + cyy
  const det = cxx * cyy - cxy * cxy
  const disc = Math.sqrt(Math.max(0, trace * trace / 4 - det))
  const lambda1 = trace / 2 + disc
  const lambda2 = trace / 2 - disc

  let e1x, e1y, e2x, e2y
  if (Math.abs(cxy) > 1e-9) {
    e1x = lambda1 - cyy; e1y = cxy
    const n1 = Math.hypot(e1x, e1y); e1x /= n1; e1y /= n1
    e2x = -e1y; e2y = e1x
  } else {
    e1x = 1; e1y = 0; e2x = 0; e2y = 1
  }

  const scale1 = Math.sqrt(lambda1) * 2
  const scale2 = Math.sqrt(lambda2) * 2
  const explainedRatio = lambda1 / (lambda1 + lambda2)

  const projected = data.map(p => {
    const dx = p.x - m.x, dy = p.y - m.y
    const t = dx * e1x + dy * e1y
    return { x: m.x + t * e1x, y: m.y + t * e1y, t }
  })

  const reconError = data.reduce((s, p, i) => s + Math.hypot(p.x - projected[i].x, p.y - projected[i].y), 0) / data.length

  return [
    { description: '原始数据分布', phase: 'raw', data, mean: m, centered, e1: { x: e1x, y: e1y }, e2: { x: e2x, y: e2y }, s1: scale1, s2: scale2, lambda1, lambda2, explainedRatio, projected, reconError, preset },
    { description: `数据中心化: 减去均值 (${m.x.toFixed(2)}, ${m.y.toFixed(2)})`, phase: 'center', data, mean: m, centered, e1: { x: e1x, y: e1y }, e2: { x: e2x, y: e2y }, s1: scale1, s2: scale2, lambda1, lambda2, explainedRatio, projected, reconError, preset },
    { description: `协方差矩阵: σxx=${cxx.toFixed(2)}, σxy=${cxy.toFixed(2)}, σyy=${cyy.toFixed(2)}`, phase: 'cov', data, mean: m, centered, e1: { x: e1x, y: e1y }, e2: { x: e2x, y: e2y }, s1: scale1, s2: scale2, lambda1, lambda2, explainedRatio, projected, reconError, preset },
    { description: `特征向量: λ₁=${lambda1.toFixed(2)}, λ₂=${lambda2.toFixed(2)}`, phase: 'eigen', data, mean: m, centered, e1: { x: e1x, y: e1y }, e2: { x: e2x, y: e2y }, s1: scale1, s2: scale2, lambda1, lambda2, explainedRatio, projected, reconError, preset },
    { description: `主成分方向: PC1 解释 ${((explainedRatio) * 100).toFixed(1)}% 方差`, phase: 'arrows', data, mean: m, centered, e1: { x: e1x, y: e1y }, e2: { x: e2x, y: e2y }, s1: scale1, s2: scale2, lambda1, lambda2, explainedRatio, projected, reconError, preset },
    { description: '将数据投影到第一主成分 PC1', phase: 'project', data, mean: m, centered, e1: { x: e1x, y: e1y }, e2: { x: e2x, y: e2y }, s1: scale1, s2: scale2, lambda1, lambda2, explainedRatio, projected, reconError, preset },
    { description: `重构误差: ${reconError.toFixed(3)}`, phase: 'error', data, mean: m, centered, e1: { x: e1x, y: e1y }, e2: { x: e2x, y: e2y }, s1: scale1, s2: scale2, lambda1, lambda2, explainedRatio, projected, reconError, preset },
  ]
}

export default function PCAPlayground() {
  const presets = useMemo(() => [
    { id: 'clear', label: '明显主轴', state: { preset: 'clear' } },
    { id: 'circular', label: '圆形分布', state: { preset: 'circular' } },
    { id: 'elongated', label: ' elongated', state: { preset: 'elongated' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ preset: 'clear' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '数据点' },
        { color: '#f97316', label: 'PC1 (第一主成分)' },
        { color: '#38bdf8', label: 'PC2 (第二主成分)' },
        { color: '#f472b6', label: '投影/重构' },
      ]}
      renderViz={({ current }) => {
        const showCenter = ['center', 'cov', 'eigen', 'arrows', 'project', 'error'].includes(current.phase)
        const showEigen = ['eigen', 'arrows', 'project', 'error'].includes(current.phase)
        const showProj = ['project', 'error'].includes(current.phase)
        const showError = current.phase === 'error'
        const barW = 80, barH = 40, barX = W - PAD - barW - 10, barY = PAD + 10
        const maxL = Math.max(current.lambda1, current.lambda2, 0.01)
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.05)" rx="8" />
                {showProj && current.data.map((p, i) => (
                  <g key={`proj-${i}`}>
                    <line x1={sx(p.x)} y1={sy(p.y)} x2={sx(current.projected[i].x)} y2={sy(current.projected[i].y)}
                      stroke="#f472b6" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
                    <circle cx={sx(current.projected[i].x)} cy={sy(current.projected[i].y)} r="4" fill="#f472b6" opacity="0.8" />
                  </g>
                ))}
                {showError && current.data.map((p, i) => {
                  const err = Math.hypot(p.x - current.projected[i].x, p.y - current.projected[i].y)
                  return err > 0.1 ? (
                    <line key={`err-${i}`} x1={sx(p.x)} y1={sy(p.y)} x2={sx(current.projected[i].x)} y2={sy(current.projected[i].y)}
                      stroke="#ef4444" strokeWidth="2" opacity="0.8" />
                  ) : null
                })}
                {showEigen && (
                  <>
                    <line x1={sx(current.mean.x)} y1={sy(current.mean.y)}
                      x2={sx(current.mean.x + current.e1.x * current.s1)} y2={sy(current.mean.y + current.e1.y * current.s1)}
                      stroke="#f97316" strokeWidth="3" markerEnd="url(#arrowOrange)" />
                    <line x1={sx(current.mean.x)} y1={sy(current.mean.y)}
                      x2={sx(current.mean.x + current.e2.x * current.s2)} y2={sy(current.mean.y + current.e2.y * current.s2)}
                      stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arrowBlue)" />
                  </>
                )}
                {current.data.map((p, i) => (
                  <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="5" fill="#8b5cf6" opacity="0.85" />
                ))}
                {showCenter && (
                  <circle cx={sx(current.mean.x)} cy={sy(current.mean.y)} r="6" fill="#fbbf24" stroke="#111827" strokeWidth="1.5" />
                )}
                <defs>
                  <marker id="arrowOrange" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#f97316" />
                  </marker>
                  <marker id="arrowBlue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
                  </marker>
                </defs>
                {/* Eigenvalue bar chart */}
                <rect x={barX} y={barY} width={barW} height={barH + 16} fill="var(--surface)" stroke="var(--border)" rx="4" opacity="0.9" />
                <text x={barX + barW / 2} y={barY + 10} textAnchor="middle" fontSize="8" fill="var(--text-tertiary)">特征值</text>
                <rect x={barX + 10} y={barY + barH + 8 - (current.lambda1 / maxL) * barH} width="20" height={(current.lambda1 / maxL) * barH} fill="#f97316" rx="2" />
                <rect x={barX + barW - 30} y={barY + barH + 8 - (current.lambda2 / maxL) * barH} width="20" height={(current.lambda2 / maxL) * barH} fill="#38bdf8" rx="2" />
                <text x={barX + 20} y={barY + barH + 16} textAnchor="middle" fontSize="7" fill="var(--text-tertiary)">λ₁</text>
                <text x={barX + barW - 20} y={barY + barH + 16} textAnchor="middle" fontSize="7" fill="var(--text-tertiary)">λ₂</text>
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>均值: <b>({current.mean.x.toFixed(2)}, {current.mean.y.toFixed(2)})</b></span>
                <span>λ₁: <b>{current.lambda1.toFixed(2)}</b></span>
                <span>解释方差: <b>{(current.explainedRatio * 100).toFixed(1)}%</b></span>
                <span>重构误差: <b>{current.reconError.toFixed(3)}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
