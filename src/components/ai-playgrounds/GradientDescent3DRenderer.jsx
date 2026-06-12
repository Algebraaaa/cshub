// Lightweight 3D loss surface renderer using plain Canvas 2D.
// Custom projection; no Three.js / Plotly dependency to keep the build light.

import { useEffect, useRef } from 'react'

const DEFAULT_VIEW = { rotX: 0.55, rotY: 0.55, scale: 1.0, scaleZ: 1.0 }

function rotate3D(x, y, z, view) {
  const { rotX, rotY } = view
  const cx = Math.cos(rotX), sx = Math.sin(rotX)
  const cy = Math.cos(rotY), sy = Math.sin(rotY)
  // X-axis pitch
  const y1 = y * cx - z * sx
  const z1 = y * sx + z * cx
  // Y-axis yaw
  const x1 = x * cy + z1 * sy
  const z2 = -x * sy + z1 * cy
  return { x: x1, y: y1, z: z2 }
}

function project({ x, y, z }, view, cx, cy, unit) {
  const r = rotate3D(x, y, z, view)
  return {
    sx: cx + r.x * unit * view.scale,
    sy: cy - r.y * unit * view.scale,
    depth: r.z,
  }
}

const LOSS_SURFACE_PRESETS = {
  bowl: {
    label: '二次碗状',
    fn: (x, y) => x * x + 2 * y * y,
    grad: (x, y) => [2 * x, 4 * y],
    xRange: [-3, 3], yRange: [-3, 3], start: [-2.5, 2],
  },
  saddle: {
    label: '马鞍面',
    fn: (x, y) => 0.3 * x * x - 0.5 * y * y + 0.08 * x * x * y * y,
    grad: (x, y) => [0.6 * x + 0.16 * x * y * y, -y + 0.16 * x * x * y],
    xRange: [-3, 3], yRange: [-3, 3], start: [-1.8, 1.5],
  },
  rosenbrock: {
    label: 'Rosenbrock 香蕉谷',
    fn: (x, y) => (1 - x) ** 2 + 10 * (y - x * x) ** 2,
    grad: (x, y) => [
      -2 * (1 - x) - 40 * x * (y - x * x),
      20 * (y - x * x),
    ],
    xRange: [-2, 2], yRange: [-1, 3], start: [-1.5, 1.5],
  },
  bumps: {
    label: '多局部极小',
    fn: (x, y) =>
      Math.sin(x * 1.2) * Math.cos(y * 1.2) * 1.2 + 0.3 * (x * x + y * y),
    grad: (x, y) => [
      1.2 * Math.cos(x * 1.2) * Math.cos(y * 1.2) + 0.6 * x,
      -1.2 * Math.sin(x * 1.2) * Math.sin(y * 1.2) + 0.6 * y,
    ],
    xRange: [-3.5, 3.5], yRange: [-3.5, 3.5], start: [2.3, 2.3],
  },
}

export { LOSS_SURFACE_PRESETS }

export function LossSurface3D({
  fn,
  xRange = [-3, 3],
  yRange = [-3, 3],
  resolution = 26,
  path = [],
  current = null,
  view = DEFAULT_VIEW,
  width = 480,
  height = 320,
  zRange,
  title,
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw()

    // Pulsing halo animation when a current point is present.
    if (current) {
      const tick = () => {
        draw()
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(rafRef.current)
    }

    function draw() {
      ctx.clearRect(0, 0, width, height)
      const cx = width / 2
      const cy = height / 2 + 30
      const unit = Math.min(width, height) / 12

      // Build sampling grid
      const stepX = (xRange[1] - xRange[0]) / resolution
      const stepY = (yRange[1] - yRange[0]) / resolution
      const grid = []
      let zMin = Infinity, zMax = -Infinity
      for (let j = 0; j <= resolution; j++) {
        const row = []
        for (let i = 0; i <= resolution; i++) {
          const x = xRange[0] + i * stepX
          const y = yRange[0] + j * stepY
          const z = fn(x, y)
          if (z < zMin) zMin = z
          if (z > zMax) zMax = z
          row.push({ x, y, z })
        }
        grid.push(row)
      }
      if (zRange) {
        zMin = Math.min(zMin, zRange[0])
        zMax = Math.max(zMax, zRange[1])
      }
      const zSpan = Math.max(zMax - zMin, 1e-6)
      // World Y: higher loss -> lower Y (further down)
      const toWorldY = (z) => ((z - zMin) / zSpan) * 1.6 + 0.1
      // World Z: y-axis of function maps into depth (Z) for spatial layout
      const toWorldZ = (y) => y

      const colorFor = (z) => {
        const t = Math.max(0, Math.min(1, (z - zMin) / zSpan))
        // purple (low loss) → pink → orange (high loss)
        const r = Math.round(139 + (249 - 139) * t)
        const g = Math.round(92 + (115 - 92) * (1 - t) * 0.5 - 50 * t)
        const b = Math.round(246 - 224 * t)
        return `rgba(${r},${Math.max(40, g)},${Math.max(22, b)},0.92)`
      }

      // --- Floor grid
      ctx.save()
      ctx.strokeStyle = 'rgba(139,92,246,0.12)'
      ctx.lineWidth = 0.6
      for (let j = 0; j <= resolution; j += 3) {
        ctx.beginPath()
        for (let i = 0; i <= resolution; i++) {
          const x = xRange[0] + i * stepX
          const y = yRange[0] + j * stepY
          const p = project({ x, y: 0, z: toWorldZ(y) }, view, cx, cy, unit)
          if (i === 0) ctx.moveTo(p.sx, p.sy)
          else ctx.lineTo(p.sx, p.sy)
        }
        ctx.stroke()
      }
      for (let i = 0; i <= resolution; i += 3) {
        ctx.beginPath()
        for (let j = 0; j <= resolution; j++) {
          const x = xRange[0] + i * stepX
          const y = yRange[0] + j * stepY
          const p = project({ x, y: 0, z: toWorldZ(y) }, view, cx, cy, unit)
          if (j === 0) ctx.moveTo(p.sx, p.sy)
          else ctx.lineTo(p.sx, p.sy)
        }
        ctx.stroke()
      }
      ctx.restore()

      // --- Surface quads, painter's algorithm (far first)
      const quads = []
      for (let j = 0; j < resolution; j++) {
        for (let i = 0; i < resolution; i++) {
          const p1 = grid[j][i]
          const p2 = grid[j][i + 1]
          const p3 = grid[j + 1][i + 1]
          const p4 = grid[j + 1][i]
          const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4
          const avgX = (p1.x + p2.x + p3.x + p4.x) / 4
          const avgY = (p1.y + p2.y + p3.y + p4.y) / 4
          const depth = project({ x: avgX, y: toWorldY(avgZ), z: toWorldZ(avgY) }, view, cx, cy, unit).depth
          quads.push({ pts: [p1, p2, p3, p4], avgZ, depth })
        }
      }
      quads.sort((a, b) => a.depth - b.depth)

      for (const q of quads) {
        const pts = q.pts.map((p) =>
          project({ x: p.x, y: toWorldY(p.z), z: toWorldZ(p.y) }, view, cx, cy, unit)
        )
        ctx.fillStyle = colorFor(q.avgZ)
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'
        ctx.lineWidth = 0.4
        ctx.beginPath()
        ctx.moveTo(pts[0].sx, pts[0].sy)
        pts.slice(1).forEach((p) => ctx.lineTo(p.sx, p.sy))
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      }

      // --- Path trajectory (project to surface)
      if (path && path.length > 1) {
        const projPath = path.map((p) =>
          project({ x: p.x, y: toWorldY(fn(p.x, p.y)), z: toWorldZ(p.y) }, view, cx, cy, unit)
        )
        ctx.strokeStyle = '#f97316'
        ctx.lineWidth = 2.2
        ctx.setLineDash([5, 4])
        ctx.beginPath()
        ctx.moveTo(projPath[0].sx, projPath[0].sy)
        projPath.slice(1).forEach((p) => ctx.lineTo(p.sx, p.sy))
        ctx.stroke()
        ctx.setLineDash([])
        // trail dots
        for (let i = 0; i < projPath.length; i += 2) {
          ctx.fillStyle = 'rgba(249,115,22,0.65)'
          ctx.beginPath()
          ctx.arc(projPath[i].sx, projPath[i].sy, 1.6, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // --- Current point
      if (current) {
        const surfZ = fn(current.x, current.y)
        const cur = project({ x: current.x, y: toWorldY(surfZ), z: toWorldZ(current.y) }, view, cx, cy, unit)
        const floor = project({ x: current.x, y: 0, z: toWorldZ(current.y) }, view, cx, cy, unit)
        // shadow on floor
        ctx.fillStyle = 'rgba(239,68,68,0.25)'
        ctx.beginPath()
        ctx.arc(floor.sx, floor.sy, 6, 0, Math.PI * 2)
        ctx.fill()
        // vertical drop
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(cur.sx, cur.sy)
        ctx.lineTo(floor.sx, floor.sy)
        ctx.stroke()
        ctx.setLineDash([])
        // pulsing halo
        const t = ((Date.now() % 1200) / 1200)
        ctx.strokeStyle = `rgba(239,68,68,${0.55 * (1 - t)})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(cur.sx, cur.sy, 6 + t * 9, 0, Math.PI * 2)
        ctx.stroke()
        // solid dot
        ctx.fillStyle = '#ef4444'
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(cur.sx, cur.sy, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }

      // --- Axes labels
      ctx.fillStyle = 'var(--text-tertiary, #999)'
      ctx.font = '11px monospace'
      const xL = project({ x: xRange[1], y: 0, z: toWorldZ(yRange[0]) }, view, cx, cy, unit)
      ctx.fillText('w1', xL.sx + 4, xL.sy + 4)
      const yL = project({ x: xRange[0], y: 0, z: toWorldZ(yRange[1]) }, view, cx, cy, unit)
      ctx.fillText('w2', yL.sx - 20, yL.sy + 4)
      const zL = project({ x: xRange[0], y: toWorldY(zMax), z: toWorldZ(yRange[0]) }, view, cx, cy, unit)
      ctx.fillText('L(w)', zL.sx - 18, zL.sy - 4)

      if (title) {
        ctx.fillStyle = 'var(--text-secondary, #bbb)'
        ctx.font = '12px 600 sans-serif'
        ctx.fillText(title, 12, 20)
      }
    }
  }, [fn, path, current, view, width, height, xRange, yRange, zRange, resolution, title])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: '100%', maxWidth: width, display: 'block' }}
    />
  )
}
