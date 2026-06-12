// 共享的 2D 优化可视化组件
// 用于所有最优化 Playground 的 SVG 渲染

const W = 480
const H = 320
const PAD = 35

export function toSvgX(x, xRange) {
  return PAD + (x - xRange[0]) / (xRange[1] - xRange[0]) * (W - 2 * PAD)
}

export function toSvgY(y, yRange) {
  return H - PAD - (y - yRange[0]) / (yRange[1] - yRange[0]) * (H - 2 * PAD)
}

// 生成等高线路径
export function contourPaths(fn, xRange, yRange, levels) {
  const [xMin, xMax] = xRange
  const [yMin, yMax] = yRange
  const step = 0.15
  const paths = []

  for (const level of levels) {
    const points = []
    for (let x = xMin; x <= xMax; x += step) {
      for (let y = yMin; y <= yMax; y += step) {
        const v = fn(x, y)
        const vR = fn(x + step, y)
        const vU = fn(x, y + step)
        // 简化：如果函数值跨越 level，在边界上插值
        if ((v - level) * (vR - level) < 0) {
          const t = (level - v) / (vR - v)
          points.push([toSvgX(x + t * step, xRange), toSvgY(y, yRange)])
        }
        if ((v - level) * (vU - level) < 0) {
          const t = (level - v) / (vU - v)
          points.push([toSvgX(x, xRange), toSvgY(y + t * step, yRange)])
        }
      }
    }
    if (points.length > 2) {
      // 用 convex hull 近似连线（简单排序）
      const cx = points.reduce((s, p) => s + p[0], 0) / points.length
      const cy = points.reduce((s, p) => s + p[1], 0) / points.length
      points.sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx))
      paths.push(`M${points.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}Z`)
    }
  }
  return paths
}

// 优化路径 SVG 元素
export function PathLine({ points, xRange, yRange, color = '#f97316', dashed = false }) {
  if (points.length < 2) return null
  const d = points.map(p => `${toSvgX(p.x, xRange)},${toSvgY(p.y, yRange)}`).join(' ')
  return (
    <polyline
      points={d}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeDasharray={dashed ? '4,3' : undefined}
      opacity="0.85"
    />
  )
}

// 当前位置的脉冲圆点
export function CurrentDot({ x, y, xRange, yRange, color = '#ef4444', r = 7 }) {
  const cx = toSvgX(x, xRange)
  const cy = toSvgY(y, yRange)
  return (
    <circle cx={cx} cy={cy} r={r} fill={color} stroke="white" strokeWidth="2">
      <animate attributeName="r" values={`${r};${r + 2};${r}`} dur="1s" repeatCount="indefinite" />
    </circle>
  )
}

// 多个粒子/个体的点（用于 GA/PSO）
export function PopulationDots({ points, xRange, yRange, color = '#8b5cf6', r = 4 }) {
  return points.map((p, i) => (
    <circle
      key={i}
      cx={toSvgX(p.x, xRange)}
      cy={toSvgY(p.y, yRange)}
      r={r}
      fill={color}
      opacity={0.7}
      stroke="white"
      strokeWidth="1"
    />
  ))
}

// 坐标轴
export function Axes({ xLabel = 'x', yLabel = 'y' }) {
  return (
    <>
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD}
        stroke="var(--border)" strokeWidth="1" />
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD}
        stroke="var(--border)" strokeWidth="1" />
      <text x={W / 2} y={H - 4} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11">{xLabel}</text>
      <text x={10} y={H / 2} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11"
        transform={`rotate(-90, 10, ${H / 2})`}>{yLabel}</text>
    </>
  )
}

// 完整的 2D 优化可视化容器
export function OptVizCanvas({ children, viewBox }) {
  return (
    <svg viewBox={viewBox || `0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 480 }}>
      {children}
    </svg>
  )
}

export { W, H, PAD }
