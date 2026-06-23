// Surface3D · Canvas-based 3D surface renderer
// Lightweight 3D visualization for loss surfaces and optimization trajectories

import { useRef, useEffect, useCallback, useState } from 'react'

// ── 3D projection math ──

function rotateY(x, y, z, yaw) {
  const c = Math.cos(yaw), s = Math.sin(yaw)
  return [x * c - z * s, y, x * s + z * c]
}

function rotateX(x, y, z, pitch) {
  const c = Math.cos(pitch), s = Math.sin(pitch)
  return [x, y * c - z * s, y * s + z * c]
}

function project(x, y, z, pitch, yaw, w, h) {
  const [x1, y1, z1] = rotateY(x, y, z, yaw)
  const [x2, y2, z2] = rotateX(x1, y1, z1, pitch)
  const fov = 600
  const d = fov / (fov + z2 + 4)
  return { sx: w / 2 + x2 * d * w * 0.18, sy: h / 2 - y2 * d * h * 0.25, z: z2, d }
}

// ── Component ──

export default function Surface3D({
  surfaceFn,
  xRange = [-3, 3],
  yRange = [-3, 3],
  trajectory = [],
  currentPoint = null,
  contourData = null,
  width = 480,
  height = 380,
  gridRes = 35,
  initialPitch = 0.7,
  initialYaw = -0.6,
}) {
  const canvasRef = useRef(null)
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 })
  const [pitch, setPitch] = useState(initialPitch)
  const [yaw, setYaw] = useState(initialYaw)

  // Generate mesh
  const mesh = useRef(null)
  if (!mesh.current) {
    const xs = [], ys = [], zs = []
    const step = (xRange[1] - xRange[0]) / gridRes
    for (let i = 0; i <= gridRes; i++) {
      xs.push(xRange[0] + i * step)
      for (let j = 0; j <= gridRes; j++) {
        const x = xRange[0] + i * step
        const y = yRange[0] + j * step
        const z = surfaceFn(x, y)
        ys.push(y)
        zs.push(z)
      }
    }
    const zMin = Math.min(...zs.map(v => isFinite(v) ? v : 0))
    const zMax = Math.max(...zs.map(v => isFinite(v) ? v : 1))
    mesh.current = { xs, ys, zs, zMin, zMax, gridRes, step }
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return  // 上下文获取失败（无头/丢失/jsdom）时静默跳过，不崩溃
    const W = canvas.width, H = canvas.height
    const m = mesh.current
    if (!m) return

    ctx.clearRect(0, 0, W, H)

    const { gridRes: G, zMin, zMax } = m
    const zClip = zMin + (zMax - zMin) * 0.85 // clip very high peaks

    // Collect and sort faces
    const faces = []
    for (let i = 0; i < G; i++) {
      for (let j = 0; j < G; j++) {
        // re-derive y properly
        const x0 = xRange[0] + i * m.step, x1_ = xRange[0] + (i + 1) * m.step
        const y0 = yRange[0] + j * m.step, y1_ = yRange[0] + (j + 1) * m.step
        const z0 = Math.min(surfaceFn(x0, y0), zClip)
        const z1 = Math.min(surfaceFn(x1_, y0), zClip)
        const z2 = Math.min(surfaceFn(x1_, y1_), zClip)
        const z3 = Math.min(surfaceFn(x0, y1_), zClip)

        const pts3d = [
          { x: x0, y: z0, z: y0 },
          { x: x1_, y: z1, z: y0 },
          { x: x1_, y: z2, z: y1_ },
          { x: x0, y: z3, z: y1_ },
        ]

        const projected = pts3d.map(p => project(p.x, p.y, p.z, pitch, yaw, W, H))
        const avgZ = projected.reduce((s, p) => s + p.z, 0) / 4
        const avgVal = (z0 + z1 + z2 + z3) / 4

        faces.push({ projected, avgZ, avgVal })
      }
    }

    // Painter's algorithm: sort far to near
    faces.sort((a, b) => b.avgZ - a.avgZ)

    // Normalize z for coloring
    const normMin = zMin
    const normMax = zClip

    // Draw faces
    for (const face of faces) {
      const { projected, avgVal } = face
      ctx.beginPath()
      ctx.moveTo(projected[0].sx, projected[0].sy)
      for (let k = 1; k < projected.length; k++) {
        ctx.lineTo(projected[k].sx, projected[k].sy)
      }
      ctx.closePath()

      const t = normMax === normMin ? 0.5 : Math.max(0, Math.min(1, (avgVal - normMin) / (normMax - normMin)))
      const r = Math.round(40 + t * 160)
      const g = Math.round(50 + (1 - t) * 80)
      const b = Math.round(190 - t * 130)

      ctx.fillStyle = `rgba(${r},${g},${b},0.85)`
      ctx.fill()
      ctx.strokeStyle = `rgba(${r},${g},${b},0.4)`
      ctx.lineWidth = 0.3
      ctx.stroke()
    }

    // Draw trajectory
    if (trajectory.length > 1) {
      ctx.beginPath()
      const p0 = project(trajectory[0].x, Math.min(surfaceFn(trajectory[0].x, trajectory[0].y), zClip), trajectory[0].y, pitch, yaw, W, H)
      ctx.moveTo(p0.sx, p0.sy)
      for (let i = 1; i < trajectory.length; i++) {
        const pt = trajectory[i]
        const p = project(pt.x, Math.min(surfaceFn(pt.x, pt.y), zClip), pt.y, pitch, yaw, W, H)
        ctx.lineTo(p.sx, p.sy)
      }
      ctx.strokeStyle = '#f97316'
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Trajectory dots
      for (let i = 0; i < trajectory.length - 1; i++) {
        const pt = trajectory[i]
        const p = project(pt.x, Math.min(surfaceFn(pt.x, pt.y), zClip), pt.y, pitch, yaw, W, H)
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, 2, 0, Math.PI * 2)
        ctx.fillStyle = '#f97316'
        ctx.fill()
      }
    }

    // Draw current point
    if (currentPoint) {
      const cp = project(
        currentPoint.x,
        Math.min(surfaceFn(currentPoint.x, currentPoint.y), zClip),
        currentPoint.y,
        pitch, yaw, W, H
      )
      // Outer glow
      ctx.beginPath()
      ctx.arc(cp.sx, cp.sy, 10, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(239,68,68,0.3)'
      ctx.fill()
      // Inner dot
      ctx.beginPath()
      ctx.arc(cp.sx, cp.sy, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#ef4444'
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Draw contour projection at bottom
    if (contourData && contourData.length > 0) {
      const bottomY = zMin - 0.5
      ctx.globalAlpha = 0.25
      for (const contour of contourData) {
        ctx.beginPath()
        for (let i = 0; i < contour.length; i++) {
          const p = project(contour[i].x, bottomY, contour[i].y, pitch, yaw, W, H)
          if (i === 0) ctx.moveTo(p.sx, p.sy)
          else ctx.lineTo(p.sx, p.sy)
        }
        ctx.strokeStyle = 'var(--border, #555)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
  }, [pitch, yaw, trajectory, currentPoint, surfaceFn, xRange, yRange, contourData])

  useEffect(() => {
    draw()
  }, [draw])

  // Mouse drag for rotation
  const onMouseDown = useCallback((e) => {
    dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY }
  }, [])

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current.dragging) return
    const dx = e.clientX - dragRef.current.lastX
    const dy = e.clientY - dragRef.current.lastY
    dragRef.current.lastX = e.clientX
    dragRef.current.lastY = e.clientY
    setYaw(y => y + dx * 0.008)
    setPitch(p => Math.max(0.1, Math.min(1.4, p + dy * 0.008)))
  }, [])

  const onMouseUp = useCallback(() => {
    dragRef.current.dragging = false
  }, [])

  // Touch support
  const onTouchStart = useCallback((e) => {
    const t = e.touches[0]
    dragRef.current = { dragging: true, lastX: t.clientX, lastY: t.clientY }
  }, [])

  const onTouchMove = useCallback((e) => {
    if (!dragRef.current.dragging) return
    const t = e.touches[0]
    const dx = t.clientX - dragRef.current.lastX
    const dy = t.clientY - dragRef.current.lastY
    dragRef.current.lastX = t.clientX
    dragRef.current.lastY = t.clientY
    setYaw(y => y + dx * 0.008)
    setPitch(p => Math.max(0.1, Math.min(1.4, p + dy * 0.008)))
    e.preventDefault()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: '100%',
        maxWidth: width,
        cursor: 'grab',
        borderRadius: 8,
        background: 'var(--bg, #0f0f14)',
        touchAction: 'none',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
    />
  )
}
