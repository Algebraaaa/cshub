import { useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 380
const PAD = 44
const XR = [0, 6]
const YR = [0, 6]

function sx(x) { return PAD + (x - XR[0]) / (XR[1] - XR[0]) * (W - 2 * PAD) }
function sy(y) { return H - PAD - (y - YR[0]) / (YR[1] - YR[0]) * (H - 2 * PAD) }

// Constraints: ax + by <= c, all x,y >= 0
const PRESETS = {
  profit: {
    label: '最大化利润',
    objective: { cx: 3, cy: 2, maximize: true }, // z = 3x + 2y
    constraints: [
      { a: 2, b: 1, c: 10, label: '2x+y ≤ 10' },
      { a: 1, b: 1, c: 7, label: 'x+y ≤ 7' },
      { a: 1, b: 2, c: 12, label: 'x+2y ≤ 12' },
    ],
  },
  mix: {
    label: '混合生产',
    objective: { cx: 5, cy: 4, maximize: true }, // z = 5x + 4y
    constraints: [
      { a: 6, b: 4, c: 24, label: '6x+4y ≤ 24' },
      { a: 1, b: 2, c: 6, label: 'x+2y ≤ 6' },
      { a: 0, b: 1, c: 2, label: 'y ≤ 2' },
    ],
  },
  min: {
    label: '最小化成本',
    objective: { cx: 2, cy: 3, maximize: false }, // z = 2x + 3y
    constraints: [
      { a: 1, b: 1, c: 4, label: 'x+y ≤ 4' },
      { a: 2, b: 1, c: 6, label: '2x+y ≤ 6' },
      { a: 1, b: 3, c: 9, label: 'x+3y ≤ 9' },
    ],
  },
}

// Compute vertices of feasible region (polygon intersection of half-planes in first quadrant)
function computeVertices(constraints) {
  const pts = [{ x: 0, y: 0 }]
  // Add x-intercepts and y-intercepts of each constraint
  constraints.forEach(con => {
    if (con.b > 0) pts.push({ x: 0, y: con.c / con.b })
    if (con.a > 0) pts.push({ x: con.c / con.a, y: 0 })
  })
  // Intersections of constraint pairs
  for (let i = 0; i < constraints.length; i++) {
    for (let j = i + 1; j < constraints.length; j++) {
      const c1 = constraints[i], c2 = constraints[j]
      const det = c1.a * c2.b - c1.b * c2.a
      if (Math.abs(det) < 1e-9) continue
      const x = (c1.c * c2.b - c1.b * c2.c) / det
      const y = (c1.a * c2.c - c1.c * c2.a) / det
      if (x >= -1e-9 && y >= -1e-9) pts.push({ x: Math.max(0, x), y: Math.max(0, y) })
    }
  }
  // Filter feasible
  const feasible = pts.filter(p =>
    p.x >= -1e-6 && p.y >= -1e-6 &&
    constraints.every(c => c.a * p.x + c.b * p.y <= c.c + 1e-6)
  )
  // Sort by angle from centroid to get polygon
  const cx = feasible.reduce((s, p) => s + p.x, 0) / feasible.length
  const cy = feasible.reduce((s, p) => s + p.y, 0) / feasible.length
  feasible.sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx))
  // De-dup
  const uniq = []
  for (const p of feasible) {
    if (!uniq.some(q => Math.abs(q.x - p.x) < 1e-4 && Math.abs(q.y - p.y) < 1e-4)) uniq.push(p)
  }
  return uniq
}

function objValue(preset, p) {
  return preset.objective.cx * p.x + preset.objective.cy * p.y
}

function computeSteps({ presetKey }) {
  const preset = PRESETS[presetKey]
  const vertices = computeVertices(preset.constraints)
  const { cx, cy, maximize } = preset.objective

  // Simplex: start at origin, walk to best adjacent vertex
  const steps = []
  steps.push({
    description: '初始化: 可行域为阴影多边形。从原点 (0,0) 开始。',
    preset, vertices, current: { x: 0, y: 0 }, path: [{ x: 0, y: 0 }],
    visited: [{ x: 0, y: 0 }], showGradient: false, line: 1,
  })
  steps.push({
    description: `目标函数 z = ${cx}x + ${cy}y，梯度方向 (${cx}, ${cy})。沿梯度方向提升 z。`,
    preset, vertices, current: { x: 0, y: 0 }, path: [{ x: 0, y: 0 }],
    visited: [{ x: 0, y: 0 }], showGradient: true, line: 2,
  })

  // Sort vertices by objective value (simplex walks the hull)
  const visited = [{ x: 0, y: 0 }]
  const path = [{ x: 0, y: 0 }]
  // find vertex closest to origin (excluding origin itself) to start walk
  let order = vertices.slice().sort((a, b) => {
    const va = maximize ? -objValue(preset, a) : objValue(preset, a)
    const vb = maximize ? -objValue(preset, b) : objValue(preset, b)
    return va - vb
  })
  // Remove origin duplicates
  order = order.filter(v => !(Math.abs(v.x) < 1e-6 && Math.abs(v.y) < 1e-6))
  // Put origin first
  order = [{ x: 0, y: 0 }, ...order]

  for (let i = 1; i < order.length; i++) {
    const v = order[i]
    path.push(v)
    visited.push(v)
    const zv = objValue(preset, v)
    const prev = order[i - 1]
    const zp = objValue(preset, prev)
    const better = maximize ? zv > zp : zv < zp
    steps.push({
      description: `移动到顶点 (${v.x.toFixed(2)}, ${v.y.toFixed(2)})，z = ${zv.toFixed(2)}。${better ? '目标值改善，继续。' : '目标值未改善，回退。'}`,
      preset, vertices, current: v, path: path.slice(), visited: visited.slice(),
      showGradient: true, line: 2 + i,
    })
  }

  // Final optimum
  const best = maximize
    ? vertices.reduce((a, b) => objValue(preset, a) > objValue(preset, b) ? a : b)
    : vertices.reduce((a, b) => objValue(preset, a) < objValue(preset, b) ? a : b)
  const bestZ = objValue(preset, best)
  steps.push({
    description: `最优解: x* = (${best.x.toFixed(2)}, ${best.y.toFixed(2)}), z* = ${bestZ.toFixed(2)}`,
    preset, vertices, current: best, path: path.concat([best]), visited: visited.concat([best]),
    showGradient: true, optimum: best, line: 9,
  })

  return steps
}

function ConstraintLine({ con, xMax, yMax }) {
  // ax + by = c
  let x1, y1, x2, y2
  if (Math.abs(con.b) < 1e-6) {
    x1 = x2 = con.c / con.a
    y1 = 0; y2 = yMax
  } else if (Math.abs(con.a) < 1e-6) {
    y1 = y2 = con.c / con.b
    x1 = 0; x2 = xMax
  } else {
    x1 = 0; y1 = con.c / con.b
    x2 = con.c / con.a; y2 = 0
    if (y1 > yMax) { y1 = yMax; x1 = (con.c - con.b * yMax) / con.a }
    if (x2 > xMax) { x2 = xMax; y2 = (con.c - con.a * xMax) / con.b }
  }
  return (
    <g>
      <line x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)}
        stroke="#64748b" strokeWidth="2" />
      <text x={sx((x1 + x2) / 2) + 4} y={sy((y1 + y2) / 2) - 6}
        fontSize="10" fill="#94a3b8" fontFamily="monospace">{con.label}</text>
    </g>
  )
}

function renderViz({ current }) {
  const { preset, vertices, current: cur, path, showGradient, optimum } = current
  const { cx, cy, maximize } = preset.objective

  // Feasible region polygon points
  const polyPts = vertices.map(v => `${sx(v.x)},${sy(v.y)}`).join(' ')

  // Half-plane shading: draw grid of points inside feasible region as stippled
  const gridPts = []
  for (let gx = 0; gx <= XR[1]; gx += 0.25) {
    for (let gy = 0; gy <= YR[1]; gy += 0.25) {
      if (preset.constraints.every(c => c.a * gx + c.b * gy <= c.c + 1e-6)) {
        gridPts.push(<circle key={`${gx}-${gy}`} cx={sx(gx)} cy={sy(gy)} r="1.2" fill="#8b5cf6" opacity="0.18" />)
      }
    }
  }

  // Gradient arrow from current point
  const gn = Math.hypot(cx, cy) || 1
  const gx = cx / gn * 1.4, gy = cy / gn * 1.4
  const sign = maximize ? 1 : -1
  const ax = sx(cur.x + sign * gx), ay = sy(cur.y + sign * gy)

  return (
    <VizCard>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
          <defs>
            <marker id="lp-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#f97316" />
            </marker>
            <marker id="lp-grad" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
            </marker>
          </defs>

          {/* Axes */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" />
          {[1, 2, 3, 4, 5, 6].map(v => (
            <g key={v}>
              <line x1={sx(v)} y1={H - PAD} x2={sx(v)} y2={H - PAD + 4} stroke="var(--border)" />
              <text x={sx(v)} y={H - PAD + 16} fontSize="10" fill="var(--text-tertiary)" textAnchor="middle">{v}</text>
              <line x1={PAD - 4} y1={sy(v)} x2={PAD} y2={sy(v)} stroke="var(--border)" />
              <text x={PAD - 8} y={sy(v) + 3} fontSize="10" fill="var(--text-tertiary)" textAnchor="end">{v}</text>
            </g>
          ))}
          <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)">x</text>
          <text x={10} y={H / 2} fontSize="11" fill="var(--text-tertiary)"
            transform={`rotate(-90, 10, ${H / 2})`}>y</text>

          {/* Half-plane stipple */}
          {gridPts}

          {/* Feasible polygon */}
          <polygon points={polyPts} fill="#8b5cf6" fillOpacity="0.18" stroke="#8b5cf6" strokeWidth="2" />

          {/* Constraint lines */}
          {preset.constraints.map((c, i) => (
            <ConstraintLine key={i} con={c} xMax={XR[1]} yMax={YR[1]} />
          ))}

          {/* All vertices as dots */}
          {vertices.map((v, i) => (
            <circle key={i} cx={sx(v.x)} cy={sy(v.y)} r="4" fill="#8b5cf6" stroke="white" strokeWidth="1.5" />
          ))}

          {/* Path of simplex walk */}
          {path.length > 1 && (
            <polyline
              points={path.map(p => `${sx(p.x)},${sy(p.y)}`).join(' ')}
              fill="none" stroke="#f97316" strokeWidth="2.5" strokeDasharray="5,3" />
          )}

          {/* Gradient arrow */}
          {showGradient && (
            <line x1={sx(cur.x)} y1={sy(cur.y)} x2={ax} y2={ay}
              stroke="#10b981" strokeWidth="2.5" markerEnd="url(#lp-grad)" />
          )}

          {/* Current point */}
          <circle cx={sx(cur.x)} cy={sy(cur.y)} r="8" fill="#ef4444" stroke="white" strokeWidth="2" />
          <text x={sx(cur.x) + 12} y={sy(cur.y) - 8} fontSize="10" fill="var(--text-primary)" fontFamily="monospace">
            ({cur.x.toFixed(1)}, {cur.y.toFixed(1)})
          </text>

          {/* Optimum star */}
          {optimum && (
            <g>
              <circle cx={sx(optimum.x)} cy={sy(optimum.y)} r="14" fill="none" stroke="#fbbf24" strokeWidth="2" />
              <text x={sx(optimum.x)} y={sy(optimum.y) - 18} fontSize="11" fill="#fbbf24" textAnchor="middle" fontWeight="700">★ 最优</text>
            </g>
          )}
        </svg>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
          width: '100%', maxWidth: 440,
        }}>
          <InfoBox label="当前 x" value={cur.x.toFixed(2)} />
          <InfoBox label="当前 y" value={cur.y.toFixed(2)} />
          <InfoBox label={`z = ${cx}x+${cy}y`} value={(cx * cur.x + cy * cur.y).toFixed(2)} />
        </div>
      </div>
    </VizCard>
  )
}

function InfoBox({ label, value }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
      padding: '6px 8px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600 }}>{value}</div>
    </div>
  )
}

export default function LPSimplexPlayground() {
  const presets = useMemo(() => Object.entries(PRESETS).map(([id, p]) => ({ id, label: p.label, state: { presetKey: id } })), [])
  return (
    <PlaygroundShell
      initialState={{ presetKey: 'profit' }}
      presets={presets}
      computeSteps={computeSteps}
      legend={[
        { color: '#8b5cf6', label: '可行域' },
        { color: '#64748b', label: '约束边界' },
        { color: '#10b981', label: '目标梯度 ∇z' },
        { color: '#f97316', label: '单纯形路径' },
        { color: '#ef4444', label: '当前顶点' },
      ]}
      renderViz={renderViz}
    />
  )
}
