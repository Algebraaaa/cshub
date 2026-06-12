import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'
import { OptVizCanvas, Axes, PathLine, CurrentDot, contourPaths, toSvgX, toSvgY } from './OptViz2D'

// Rosenbrock 函数：f(x,y) = (1-x)^2 + 100*(y-x^2)^2
const fn = (x, y) => (1 - x) ** 2 + 100 * (y - x * x) ** 2
const grad = (x, y) => [
  -2 * (1 - x) + 100 * 2 * (y - x * x) * (-2 * x),
  100 * 2 * (y - x * x),
]

const X_RANGE = [-3, 3]
const Y_RANGE = [-3, 3]
const LEVELS = [0.1, 1, 5, 20, 50, 100, 500, 1000]

function computeSteps(mode) {
  const steps = []
  let x = -1.5, y = 2.0
  let vx = 0, vy = 0
  const lr = 0.002
  const beta = mode === 'momentum' ? 0.9 : mode === 'nesterov05' ? 0.5 : 0.9
  const useNesterov = mode !== 'momentum'
  const maxSteps = 30
  const path = [{ x, y }]

  for (let i = 0; i < maxSteps; i++) {
    const loss = fn(x, y)
    const [gx, gy] = grad(x, y)

    let lookaheadX = x, lookaheadY = y
    let gxUsed = gx, gyUsed = gy

    if (useNesterov) {
      // look-ahead 位置：θ_lookahead = θ - β*v
      lookaheadX = x - beta * vx
      lookaheadY = y - beta * vy
      const [glx, gly] = grad(lookaheadX, lookaheadY)
      gxUsed = glx
      gyUsed = gly
    }

    steps.push({
      description: `步骤 ${i + 1}: (${x.toFixed(3)}, ${y.toFixed(3)}), loss=${loss.toFixed(2)}, ` +
        (useNesterov ? `前瞻→(${lookaheadX.toFixed(3)}, ${lookaheadY.toFixed(3)})` : `动量 v=(${vx.toFixed(3)}, ${vy.toFixed(3)})`),
      x, y, loss,
      grad_x: gxUsed, grad_y: gyUsed,
      velocity_x: vx, velocity_y: vy,
      lookahead_x: lookaheadX, lookahead_y: lookaheadY,
      vMag: Math.sqrt(vx * vx + vy * vy),
      useNesterov, beta,
      path: path.map(p => ({ ...p })),
    })

    // 更新速度：v = β*v + g
    vx = beta * vx + gxUsed
    vy = beta * vy + gyUsed
    x -= lr * vx
    y -= lr * vy

    // 限制范围防止发散
    x = Math.max(-3, Math.min(3, x))
    y = Math.max(-3, Math.min(3, y))
    path.push({ x, y })

    if (loss < 0.01) break
  }

  const finalLoss = fn(x, y)
  steps.push({
    description: `结束: (${x.toFixed(3)}, ${y.toFixed(3)}), loss=${finalLoss.toFixed(3)}`,
    x, y, loss: finalLoss,
    grad_x: 0, grad_y: 0,
    velocity_x: 0, velocity_y: 0,
    lookahead_x: x, lookahead_y: y,
    vMag: 0, useNesterov, beta,
    path: path.map(p => ({ ...p })),
  })

  return steps
}

export default function NesterovPlayground() {
  const presets = useMemo(() => [
    { id: 'nesterov09', label: 'Nesterov β=0.9', state: { mode: 'nesterov09' } },
    { id: 'nesterov05', label: 'Nesterov β=0.5', state: { mode: 'nesterov05' } },
    { id: 'momentum', label: '普通 Momentum', state: { mode: 'momentum' } },
  ], [])

  const contours = useMemo(() => contourPaths(fn, X_RANGE, Y_RANGE, LEVELS), [])

  const computeStepsFn = useCallback((state) => {
    return computeSteps(state.mode)
  }, [])

  return (
    <PlaygroundShell
      initialState={{ mode: 'nesterov09' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#f97316', label: '优化路径' },
        { color: '#ef4444', label: '当前位置' },
        { color: '#38bdf8', label: '前瞻点' },
        { color: '#8b5cf6', label: '速度方向' },
      ]}
      renderViz={({ current }) => {
        const svgX = toSvgX(current.x, X_RANGE)
        const svgY = toSvgY(current.y, Y_RANGE)
        const laX = toSvgX(current.lookahead_x, X_RANGE)
        const laY = toSvgY(current.lookahead_y, Y_RANGE)
        const vScale = 12
        const vEndX = svgX - current.velocity_x * vScale
        const vEndY = svgY + current.velocity_y * vScale

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <OptVizCanvas>
                <Axes xRange={X_RANGE} yRange={Y_RANGE} />
                {contours.map((d, i) => (
                  <path key={i} d={d} fill="none" stroke="#8b5cf6" strokeWidth="0.8" opacity="0.35" />
                ))}
                <PathLine points={current.path} xRange={X_RANGE} yRange={Y_RANGE} />
                {/* 速度箭头 */}
                <line x1={svgX} y1={svgY} x2={vEndX} y2={vEndY}
                  stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrowNest)" opacity="0.8" />
                <defs>
                  <marker id="arrowNest" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#8b5cf6" />
                  </marker>
                </defs>
                {/* 前瞻点 ghost */}
                {current.useNesterov && (
                  <circle cx={laX} cy={laY} r={5} fill="none" stroke="#38bdf8"
                    strokeWidth="2" strokeDasharray="3,2" opacity="0.7" />
                )}
                <CurrentDot x={current.x} y={current.y} xRange={X_RANGE} yRange={Y_RANGE} />
              </OptVizCanvas>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span>x: <b>{current.x.toFixed(3)}</b></span>
                <span>y: <b>{current.y.toFixed(3)}</b></span>
                <span>loss: <b>{current.loss.toFixed(2)}</b></span>
                <span>|v|: <b>{current.vMag.toFixed(3)}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
