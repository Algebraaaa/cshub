// 梯度下降 2D / 3D 双模式可视化
// 2D: SVG 损失曲线 + 梯度箭头 + 优化路径
// 3D: Plotly.js 三维损失曲面 + 参数轨迹 + 收敛路径

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

// ── 损失函数定义（2D 函数族） ───────────────────────────────
const FUNCTIONS = {
  quadratic: {
    label: '二次函数 f(x,y)=x²+y²',
    fn: (x, y) => x * x + y * y,
    grad: (x, y) => [2 * x, 2 * y],
    range: [-4, 4],
    start: [3.5, 3.0],
    levels: [0.5, 2, 5, 10, 18, 28],
  },
  rosenbrock: {
    label: 'Rosenbrock (香蕉谷)',
    fn: (x, y) => (1 - x) ** 2 + 10 * (y - x * x) ** 2,
    grad: (x, y) => [
      -2 * (1 - x) - 40 * x * (y - x * x),
      20 * (y - x * x),
    ],
    range: [-2, 2.5],
    start: [-1.5, 1.5],
    levels: [0.5, 2, 8, 20, 50, 120],
  },
  saddle: {
    label: '鞍点 f(x,y)=x²-y²',
    fn: (x, y) => x * x - y * y + 5,
    grad: (x, y) => [2 * x, -2 * y],
    range: [-3, 3],
    start: [2.5, 2.5],
    levels: [-4, -2, 0, 2, 4, 6, 8],
  },
}

function computeSteps(lr, funcKey, maxIter = 35) {
  const func = FUNCTIONS[funcKey]
  const steps = []
  let [x, y] = func.start
  for (let i = 0; i < maxIter; i++) {
    const loss = func.fn(x, y)
    const [gx, gy] = func.grad(x, y)
    steps.push({
      description: `步骤 ${i + 1}: (${x.toFixed(3)}, ${y.toFixed(3)})  loss=${loss.toFixed(3)}  |∇|=${Math.hypot(gx, gy).toFixed(3)}`,
      x, y, loss, gx, gy, lr,
      path: steps.map(s => ({ x: s.x, y: s.y, loss: s.loss })),
    })
    const nx = x - lr * gx
    const ny = y - lr * gy
    if (Math.hypot(nx - x, ny - y) < 1e-6) break
    x = nx; y = ny
  }
  const finalLoss = func.fn(x, y)
  const [fgx, fgy] = func.grad(x, y)
  steps.push({
    description: `收敛: (${x.toFixed(3)}, ${y.toFixed(3)})  loss=${finalLoss.toFixed(3)}`,
    x, y, loss: finalLoss, gx: fgx, gy: fgy, lr,
    path: steps.map(s => ({ x: s.x, y: s.y, loss: s.loss })),
  })
  return steps
}

// ── SVG 2D 常量 ─────────────────────────────────────────────
const W = 500, H = 320, PAD = 36
function toSvgX(x, range) { return PAD + (x - range[0]) / (range[1] - range[0]) * (W - 2 * PAD) }
function toSvgY(y, range) { return H - PAD - (y - range[0]) / (range[1] - range[0]) * (H - 2 * PAD) }

// 生成等高线路径
function contourPaths(fn, range, levels) {
  const [min, max] = range
  const step = (max - min) / 40
  const paths = []
  for (const level of levels) {
    const pts = []
    for (let x = min; x <= max; x += step) {
      for (let y = min; y <= max; y += step) {
        const v = fn(x, y), vR = fn(x + step, y), vU = fn(x, y + step)
        if ((v - level) * (vR - level) < 0) {
          const t = (level - v) / (vR - v)
          pts.push([toSvgX(x + t * step, range), toSvgY(y, range)])
        }
        if ((v - level) * (vU - level) < 0) {
          const t = (level - v) / (vU - v)
          pts.push([toSvgX(x, range), toSvgY(y + t * step, range)])
        }
      }
    }
    if (pts.length > 3) {
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
      const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
      pts.sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx))
      paths.push(`M${pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L')}Z`)
    }
  }
  return paths
}

// ── 2D 等高线视图 ───────────────────────────────────────────
function ContourView({ current, func }) {
  const { range, fn, levels } = func
  const contours = useMemo(() => contourPaths(fn, range, levels), [fn, range, levels])
  const pathPts = current.path || []
  const cx = toSvgX(current.x, range)
  const cy = toSvgY(current.y, range)
  const gradMag = Math.hypot(current.gx, current.gy)
  const arrowScale = Math.min(gradMag, 6) / 6
  const arrowLen = 35 * arrowScale
  const arrowEndX = cx - (current.gx / (gradMag || 1)) * arrowLen
  const arrowEndY = cy + (current.gy / (gradMag || 1)) * arrowLen

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 500 }}>
      {/* 坐标轴 */}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />

      {/* 等高线 */}
      {contours.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#8b5cf6" strokeWidth="1.2" opacity={0.25 + i * 0.08} />
      ))}

      {/* 优化路径 */}
      {pathPts.length > 1 && (
        <polyline
          points={pathPts.map(p => `${toSvgX(p.x, range)},${toSvgY(p.y, range)}`).join(' ')}
          fill="none" stroke="#f97316" strokeWidth="2.5" strokeDasharray="5,3" opacity="0.85"
        />
      )}
      {/* 路径点 */}
      {pathPts.map((p, i) => (
        <circle key={i} cx={toSvgX(p.x, range)} cy={toSvgY(p.y, range)} r="2.5" fill="#f97316" opacity={0.4 + 0.6 * (i / pathPts.length)} />
      ))}

      {/* 梯度箭头 */}
      {gradMag > 0.01 && (
        <>
          <line x1={cx} y1={cy} x2={arrowEndX} y2={arrowEndY}
            stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#gd-arrow)" />
        </>
      )}
      <defs>
        <marker id="gd-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
        </marker>
      </defs>

      {/* 当前点 */}
      <circle cx={cx} cy={cy} r="8" fill="#ef4444" stroke="white" strokeWidth="2.5">
        <animate attributeName="r" values="8;10;8" dur="1s" repeatCount="indefinite" />
      </circle>

      {/* 标注 */}
      <text x={W / 2} y={H - 6} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11">x</text>
      <text x={12} y={H / 2} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11"
        transform={`rotate(-90, 12, ${H / 2})`}>y</text>
    </svg>
  )
}

// ── 2D 损失曲线视图（侧视） ─────────────────────────────────
function LossCurveView({ current }) {
  // 沿路径方向切一个截面：显示 loss 随 step 的变化
  const pathPts = current.path || []
  const allLosses = pathPts.map(p => p.loss).concat([current.loss])
  const maxLoss = Math.max(...allLosses, 1)
  const minLoss = Math.min(...allLosses, 0)
  const lossRange = maxLoss - minLoss || 1

  const cW = W, cH = 180, cPAD = 36
  const toX = (i) => cPAD + (i / Math.max(allLosses.length - 1, 1)) * (cW - 2 * cPAD)
  const toY = (v) => cH - cPAD - ((v - minLoss) / lossRange) * (cH - 2 * cPAD)

  const linePath = allLosses.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join('')

  return (
    <svg viewBox={`0 0 ${cW} ${cH}`} style={{ width: '100%', maxWidth: 500 }}>
      <line x1={cPAD} y1={cH - cPAD} x2={cW - cPAD} y2={cH - cPAD} stroke="var(--border)" />
      <line x1={cPAD} y1={cPAD} x2={cPAD} y2={cH - cPAD} stroke="var(--border)" />

      {/* Loss 曲线 */}
      {allLosses.length > 1 && (
        <path d={linePath} fill="none" stroke="#8b5cf6" strokeWidth="2.5" opacity="0.8" />
      )}
      {/* 当前点 */}
      {allLosses.length > 0 && (
        <circle cx={toX(allLosses.length - 1)} cy={toY(current.loss)} r="6" fill="#ef4444" stroke="white" strokeWidth="2">
          <animate attributeName="r" values="6;8;6" dur="1s" repeatCount="indefinite" />
        </circle>
      )}
      <text x={cW / 2} y={cH - 6} textAnchor="middle" fill="var(--text-tertiary)" fontSize="10">步骤</text>
      <text x={10} y={cH / 2} textAnchor="middle" fill="var(--text-tertiary)" fontSize="10"
        transform={`rotate(-90, 10, ${cH / 2})`}>Loss</text>
    </svg>
  )
}

// ── 3D Canvas 视图（自定义透视投影） ─────────────────────────
function project3D(x, y, z, cx, cy, az, el, scale) {
  const cosA = Math.cos(az), sinA = Math.sin(az)
  const cosE = Math.cos(el), sinE = Math.sin(el)
  const rx = x * cosA - y * sinA
  const ry = x * sinA + y * cosA
  const rz = z
  const sy2 = ry * cosE - rz * sinE
  const sz = ry * sinE + rz * cosE
  const perspective = 4 / (4 + sz * 0.3)
  return {
    px: cx + rx * scale * perspective,
    py: cy - sy2 * scale * perspective,
    depth: sz,
  }
}

function SurfaceView3D({ func, path, current }) {
  const canvasRef = useRef(null)
  const [azimuth, setAzimuth] = useState(0.6)
  const [elevation, setElevation] = useState(0.55)
  const dragRef = useRef(null)

  const handleMouseDown = useCallback((e) => {
    dragRef.current = { x: e.clientX, y: e.clientY, az: azimuth, el: elevation }
  }, [azimuth, elevation])

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current) return
    const dx = (e.clientX - dragRef.current.x) * 0.008
    const dy = (e.clientY - dragRef.current.y) * 0.008
    setAzimuth(dragRef.current.az + dx)
    setElevation(Math.max(0.1, Math.min(1.4, dragRef.current.el + dy)))
  }, [])

  const handleMouseUp = useCallback(() => { dragRef.current = null }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W2 = canvas.width, H2 = canvas.height
    const cx = W2 / 2, cy = H2 / 2 + 20
    const scale = Math.min(W2, H2) * 0.075

    ctx.clearRect(0, 0, W2, H2)

    const { range, fn } = func
    const [rMin, rMax] = range
    const N = 25
    const step = (rMax - rMin) / (N - 1)

    // 计算网格点并投影
    const grid = []
    let zMax = -Infinity
    for (let i = 0; i < N; i++) {
      grid[i] = []
      for (let j = 0; j < N; j++) {
        const x = rMin + i * step
        const y = rMin + j * step
        let z = fn(x, y)
        z = Math.min(z, 40)
        zMax = Math.max(zMax, z)
        grid[i][j] = { x, y, z }
      }
    }
    const zScale = 4 / (zMax || 1)

    // 收集面片并按深度排序
    const faces = []
    for (let i = 0; i < N - 1; i++) {
      for (let j = 0; j < N - 1; j++) {
        const p00 = grid[i][j], p10 = grid[i + 1][j]
        const p01 = grid[i][j + 1], p11 = grid[i + 1][j + 1]
        const avgZ = (p00.z + p10.z + p01.z + p11.z) / 4
        const corners = [p00, p10, p11, p01].map(p =>
          project3D(p.x - (rMin + rMax) / 2, p.y - (rMin + rMax) / 2, p.z * zScale, cx, cy, azimuth, elevation, scale)
        )
        const avgDepth = corners.reduce((s, c) => s + c.depth, 0) / 4
        faces.push({ corners, avgZ, avgDepth })
      }
    }
    // 从远到近绘制
    faces.sort((a, b) => b.avgDepth - a.avgDepth)

    for (const face of faces) {
      const t = face.avgZ / (zMax || 1)
      const r = Math.round(139 + (76 - 139) * t)
      const g = Math.round(92 + (29 - 92) * t)
      const b = Math.round(246 + (149 - 246) * t)
      ctx.fillStyle = `rgba(${r},${g},${b},0.75)`
      ctx.strokeStyle = `rgba(${r},${g},${b},0.3)`
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(face.corners[0].px, face.corners[0].py)
      for (let k = 1; k < 4; k++) ctx.lineTo(face.corners[k].px, face.corners[k].py)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }

    // 绘制坐标轴
    const o = project3D(0, 0, 0, cx, cy, azimuth, elevation, scale)
    const axLen = 2.5
    const axes = [
      { label: 'x', end: project3D(axLen, 0, 0, cx, cy, azimuth, elevation, scale), color: '#ef4444' },
      { label: 'y', end: project3D(0, axLen, 0, cx, cy, azimuth, elevation, scale), color: '#22c55e' },
      { label: 'z', end: project3D(0, 0, axLen, cx, cy, azimuth, elevation, scale), color: '#38bdf8' },
    ]
    for (const ax of axes) {
      ctx.strokeStyle = ax.color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(o.px, o.py)
      ctx.lineTo(ax.end.px, ax.end.py)
      ctx.stroke()
      ctx.fillStyle = ax.color
      ctx.font = '11px sans-serif'
      ctx.fillText(ax.label, ax.end.px + 3, ax.end.py - 3)
    }

    // 绘制优化路径
    const pathPts = path.concat([{ x: current.x, y: current.y }])
    if (pathPts.length > 1) {
      ctx.strokeStyle = '#f97316'
      ctx.lineWidth = 2.5
      ctx.setLineDash([5, 3])
      ctx.beginPath()
      for (let i = 0; i < pathPts.length; i++) {
        const p = pathPts[i]
        const z = Math.min(fn(p.x, p.y), 40) * zScale
        const pp = project3D(p.x - (rMin + rMax) / 2, p.y - (rMin + rMax) / 2, z + 0.15, cx, cy, azimuth, elevation, scale)
        if (i === 0) ctx.moveTo(pp.px, pp.py)
        else ctx.lineTo(pp.px, pp.py)
      }
      ctx.stroke()
      ctx.setLineDash([])

      // 路径点
      for (let i = 0; i < pathPts.length; i++) {
        const p = pathPts[i]
        const z = Math.min(fn(p.x, p.y), 40) * zScale
        const pp = project3D(p.x - (rMin + rMax) / 2, p.y - (rMin + rMax) / 2, z + 0.15, cx, cy, azimuth, elevation, scale)
        ctx.fillStyle = `rgba(249, 115, 22, ${0.4 + 0.6 * (i / pathPts.length)})`
        ctx.beginPath()
        ctx.arc(pp.px, pp.py, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // 当前点
    const curZ = Math.min(current.loss, 40) * zScale
    const curP = project3D(current.x - (rMin + rMax) / 2, current.y - (rMin + rMax) / 2, curZ + 0.25, cx, cy, azimuth, elevation, scale)
    ctx.fillStyle = '#ef4444'
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(curP.px, curP.py, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // 起始点
    const startZ = Math.min(fn(...func.start), 40) * zScale
    const startP = project3D(func.start[0] - (rMin + rMax) / 2, func.start[1] - (rMin + rMax) / 2, startZ + 0.15, cx, cy, azimuth, elevation, scale)
    ctx.fillStyle = '#38bdf8'
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(startP.px, startP.py, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // 提示文字
    ctx.fillStyle = 'var(--text-tertiary, #888)'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('拖拽旋转', cx, H2 - 8)
  }, [func, path, current, azimuth, elevation])

  return (
    <canvas
      ref={canvasRef}
      width={760}
      height={460}
      style={{ width: '100%', maxWidth: '100%', cursor: 'grab', borderRadius: 12, background: 'var(--bg, #0d1117)' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  )
}

// ── 信息面板 ────────────────────────────────────────────────
function InfoBox({ label, value }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '6px 10px', textAlign: 'center', minWidth: 70,
    }}>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}

// ── 主组件 ──────────────────────────────────────────────────
export default function GradientDescent3DPlayground() {
  const [viewMode, setViewMode] = useState('3d') // 'contour' | 'curve' | '3d'

  const presets = useMemo(() => [
    { id: 'quad', label: '二次函数', state: { func: 'quadratic', lr: 0.12 } },
    { id: 'rosenbrock', label: 'Rosenbrock', state: { func: 'rosenbrock', lr: 0.005 } },
    { id: 'saddle', label: '鞍点', state: { func: 'saddle', lr: 0.1 } },
    { id: 'slow', label: '小学习率', state: { func: 'quadratic', lr: 0.03 } },
    { id: 'fast', label: '大学习率', state: { func: 'quadratic', lr: 0.45 } },
  ], [])

  const computeStepsFn = useCallback((state) => {
    return computeSteps(state.lr, state.func)
  }, [])

  return (
    <PlaygroundShell
      initialState={{ func: 'quadratic', lr: 0.12 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      extraToolbar={({ state, setState }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* 视图切换 */}
          <div style={{ display: 'flex', gap: 2, background: 'var(--surface)', borderRadius: 8, padding: 2 }}>
            {[
              { key: 'contour', label: '等高线' },
              { key: 'curve', label: 'Loss曲线' },
              { key: '3d', label: '3D曲面' },
            ].map(v => (
              <button key={v.key} onClick={() => setViewMode(v.key)} style={{
                padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, transition: 'all 0.2s',
                background: viewMode === v.key ? 'var(--accent, #8b5cf6)' : 'transparent',
                color: viewMode === v.key ? 'white' : 'var(--text-secondary)',
              }}>
                {v.label}
              </button>
            ))}
          </div>
          {/* 学习率滑块 */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
            lr:
            <input type="range" min="0.001" max="0.5" step="0.001"
              value={state.lr}
              onChange={e => setState(prev => ({ ...prev, lr: parseFloat(e.target.value) }))}
              style={{ width: 70 }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: 10, minWidth: 36 }}>{state.lr.toFixed(3)}</span>
          </label>
        </div>
      )}
      legend={[
        { color: '#8b5cf6', label: '等高线/曲面' },
        { color: '#f97316', label: '优化路径' },
        { color: '#ef4444', label: '当前位置/梯度' },
        { color: '#38bdf8', label: '起始点' },
      ]}
      renderViz={({ current, state }) => {
        const func = FUNCTIONS[state.func]

        return (
          <VizCard overflowX="visible" innerStyle={{ overflowX: 'visible' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              {/* 函数标签 */}
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>
                {func.label}
              </div>

              {/* 可视化区域 */}
              {viewMode === 'contour' && <ContourView current={current} func={func} />}
              {viewMode === 'curve' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                  <ContourView current={current} func={func} />
                  <LossCurveView current={current} func={func} />
                </div>
              )}
              {viewMode === '3d' && (
                <SurfaceView3D func={func} path={current.path || []} current={current} />
              )}

              {/* 信息面板 */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 6, width: '100%', maxWidth: 480,
              }}>
                <InfoBox label="x" value={current.x.toFixed(3)} />
                <InfoBox label="y" value={current.y.toFixed(3)} />
                <InfoBox label="Loss" value={current.loss.toFixed(3)} />
                <InfoBox label="∂L/∂x" value={current.gx.toFixed(3)} />
                <InfoBox label="∂L/∂y" value={current.gy.toFixed(3)} />
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
