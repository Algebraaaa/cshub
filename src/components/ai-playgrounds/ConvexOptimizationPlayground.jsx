import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520, H = 320, PAD = 36
const RANGE = [-4, 4]
const sx = (v) => PAD + ((v - RANGE[0]) / (RANGE[1] - RANGE[0])) * (W - 2 * PAD)
const sy = (v) => H - PAD - ((v - RANGE[0]) / (RANGE[1] - RANGE[0])) * (H - 2 * PAD)

// Convex: f(x,y) = x² + 2y²
const convexFn = (x, y) => x * x + 2 * y * y
const convexGrad = (x, y) => [2 * x, 4 * y]
// Non-convex: f(x,y) = (x²-1)² + (y²-1)²
const nonConvexFn = (x, y) => { const a = x * x - 1; const b = y * y - 1; return a * a + b * b }
const nonConvexGrad = (x, y) => [4 * x * (x * x - 1), 4 * y * (y * y - 1)]

const START_POINTS = [
  { x: 3, y: 3, color: '#ef4444' },
  { x: -3, y: 2, color: '#38bdf8' },
  { x: 2, y: -3, color: '#fbbf24' },
  { x: -2, y: -2, color: '#f472b6' },
]

function gd(fn, grad, start, lr, maxIter) {
  const path = [{ x: start.x, y: start.y }]
  let { x, y } = start
  for (let i = 0; i < maxIter; i++) {
    const [gx, gy] = grad(x, y)
    x -= lr * gx
    y -= lr * gy
    path.push({ x, y })
    if (Math.abs(gx) + Math.abs(gy) < 1e-5) break
  }
  return path
}

function contourPath(fn, level) {
  const pts = []
  const N = 80
  for (let i = 0; i <= N; i++) {
    const theta = (i / N) * 2 * Math.PI
    // approximate level set via binary search along ray
    let lo = 0, hi = 5
    for (let j = 0; j < 20; j++) {
      const mid = (lo + hi) / 2
      const val = fn(mid * Math.cos(theta), mid * Math.sin(theta))
      if (val < level) lo = mid; else hi = mid
    }
    const r = (lo + hi) / 2
    pts.push(`${sx(r * Math.cos(theta))},${sy(r * Math.sin(theta))}`)
  }
  return `M${pts.join('L')}Z`
}

function computeSteps(preset) {
  const isConvex = preset.id !== 'nonconvex'
  const fn = isConvex ? convexFn : nonConvexFn
  const grad = isConvex ? convexGrad : nonConvexGrad
  const lr = isConvex ? 0.08 : 0.03
  const maxIter = 60

  const allPaths = START_POINTS.map(s => gd(fn, grad, s, lr, maxIter))
  const maxLen = Math.max(...allPaths.map(p => p.length))
  const levels = isConvex ? [1, 4, 9, 16, 25] : [0.1, 0.5, 1, 2, 4]

  const steps = []
  // Step 1: show contours
  steps.push({
    description: isConvex
      ? '凸函数 f(x,y) = x² + 2y² 的等高线。任何局部最小值都是全局最小值。'
      : '非凸函数 f(x,y) = (x²-1)² + (y²-1)² 的等高线。存在多个局部最小值。',
    paths: START_POINTS.map(s => [{ x: s.x, y: s.y, color: s.color }]),
    levels, fn, isConvex, converged: false,
  })

  // Animation steps: advance all trajectories
  const stepSize = Math.max(1, Math.floor(maxLen / 15))
  for (let k = stepSize; k < maxLen; k += stepSize) {
    const paths = START_POINTS.map((s, i) =>
      allPaths[i].slice(0, Math.min(k + 1, allPaths[i].length)).map(p => ({ ...p, color: s.color }))
    )
    steps.push({
      description: `梯度下降第 ${k} 步：${isConvex ? '所有轨迹向同一最小值收敛' : '各轨迹可能陷入不同局部最小值'}。`,
      paths, levels, fn, isConvex, converged: false,
    })
  }

  // Final: all converged
  const finalPaths = START_POINTS.map((s, i) =>
    allPaths[i].map(p => ({ ...p, color: s.color }))
  )
  steps.push({
    description: isConvex
      ? '收敛！所有起点到达同一全局最小值 (0, 0)。凸优化的核心性质。'
      : '收敛！不同起点到达不同局部最小值 (±1, ±1)。非凸问题的挑战。',
    paths: finalPaths, levels, fn, isConvex, converged: true,
  })

  return steps
}

export default function ConvexOptimizationPlayground() {
  const presets = useMemo(() => [
    { id: 'convex', label: '凸二次函数' },
    { id: 'nonconvex', label: '非凸 (多极小值)' },
    { id: 'constrained', label: '凸+约束' },
  ], [])

  const computeStepsFn = useCallback((preset) => computeSteps(preset), [])

  const legend = useMemo(() => [
    { color: '#8b5cf6', label: '等高线' },
    { color: '#ef4444', label: '轨迹 1' },
    { color: '#38bdf8', label: '轨迹 2' },
    { color: '#fbbf24', label: '轨迹 3' },
    { color: '#f472b6', label: '轨迹 4' },
  ], [])

  return (
    <PlaygroundShell
      presets={presets}
      computeSteps={computeStepsFn}
      legend={legend}
      renderViz={({ current }) => {
        const contourLevels = current.levels || [1, 4, 9, 16]
        const fn = current.fn || convexFn
        const contourD = contourLevels.map(l => contourPath(fn, l))

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 520 }}>
                {/* axes */}
                <line x1={sx(RANGE[0])} y1={sy(0)} x2={sx(RANGE[1])} y2={sy(0)} stroke="var(--border)" strokeWidth="1" />
                <line x1={sx(0)} y1={sy(RANGE[0])} x2={sx(0)} y2={sy(RANGE[1])} stroke="var(--border)" strokeWidth="1" />
                {/* contours */}
                {contourD.map((d, i) => (
                  <path key={i} d={d} fill="none" stroke="#8b5cf6" strokeWidth="1" opacity={0.2 + i * 0.12} />
                ))}
                {/* paths */}
                {current.paths.map((path, pi) => {
                  if (path.length < 2) return null
                  const color = path[0].color || START_POINTS[pi].color
                  return (
                    <g key={pi}>
                      <polyline
                        points={path.map(p => `${sx(p.x)},${sy(p.y)}`).join(' ')}
                        fill="none" stroke={color} strokeWidth="2" opacity="0.7"
                      />
                      {/* start point */}
                      <circle cx={sx(path[0].x)} cy={sy(path[0].y)} r="5" fill={color} stroke="white" strokeWidth="1.5" />
                      {/* current/end point */}
                      {path.length > 1 && (
                        <circle cx={sx(path[path.length - 1].x)} cy={sy(path[path.length - 1].y)}
                          r={current.converged ? 7 : 5}
                          fill={current.converged ? '#22c55e' : color}
                          stroke="white" strokeWidth="2">
                          {current.converged && <animate attributeName="r" values="7;9;7" dur="1s" repeatCount="indefinite" />}
                        </circle>
                      )}
                    </g>
                  )
                })}
                <text x={W / 2} y={H - 6} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11">x</text>
                <text x={12} y={H / 2} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11" transform={`rotate(-90, 12, ${H / 2})`}>y</text>
              </svg>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, width: '100%', maxWidth: 440 }}>
                <InfoBox label="函数类型" value={current.isConvex ? '凸函数' : '非凸函数'} />
                <InfoBox label="起点数" value={current.paths.length} />
                <InfoBox label="全局最优" value={current.converged ? '是' : '搜索中'} />
                <InfoBox label="步数" value={current.paths[0] ? current.paths[0].length - 1 : 0} />
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
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}
