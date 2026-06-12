import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'
import { OptVizCanvas, Axes, PathLine, CurrentDot, contourPaths } from './OptViz2D'

// 窄长山谷函数（Momentum 优势明显）
const fn = (x, y) => 0.1 * x * x + 5 * y * y
const grad = (x, y) => [0.2 * x, 10 * y]

const X_RANGE = [-5, 5]
const Y_RANGE = [-2, 2]
const LEVELS = [0.5, 2, 5, 10, 20, 40, 80]

function computeSteps(lr, beta) {
  const steps = []
  let x = 4, y = 1.5
  let vx = 0, vy = 0
  const maxSteps = 60
  const path = [{ x, y }]

  for (let i = 0; i < maxSteps; i++) {
    const [gx, gy] = grad(x, y)
    const loss = fn(x, y)

    steps.push({
      description: `步骤 ${i + 1}: x=(${x.toFixed(2)}, ${y.toFixed(2)}), v=(${vx.toFixed(2)}, ${vy.toFixed(2)}), loss=${loss.toFixed(3)}`,
      x, y, vx, vy, gx, gy, loss, beta,
      path: path.map(p => ({ ...p })),
    })

    vx = beta * vx + gx
    vy = beta * vy + gy
    x -= lr * vx
    y -= lr * vy
    path.push({ x, y })

    if (loss < 0.001) break
  }

  steps.push({
    description: `收敛: (${x.toFixed(3)}, ${y.toFixed(3)}), loss=${fn(x, y).toFixed(4)}`,
    x, y, vx: 0, vy: 0, gx: 0, gy: 0, loss: fn(x, y), beta,
    path: path.map(p => ({ ...p })),
  })

  return steps
}

export default function MomentumPlayground() {
  const presets = useMemo(() => [
    { id: 'no-mom', label: '无动量 (β=0)', state: { lr: 0.05, beta: 0 } },
    { id: 'mom09', label: 'β=0.9', state: { lr: 0.02, beta: 0.9 } },
    { id: 'mom05', label: 'β=0.5', state: { lr: 0.04, beta: 0.5 } },
  ], [])

  const contours = useMemo(() => contourPaths(fn, X_RANGE, Y_RANGE, LEVELS), [])

  const computeStepsFn = useCallback((state) => {
    return computeSteps(state.lr, state.beta)
  }, [])

  return (
    <PlaygroundShell
      initialState={{ lr: 0.02, beta: 0.9 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#f97316', label: '优化路径' },
        { color: '#ef4444', label: '当前位置' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <OptVizCanvas>
              <Axes xRange={X_RANGE} yRange={Y_RANGE} />
              {contours.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="var(--border)" strokeWidth="0.8" opacity="0.5" />
              ))}
              <PathLine points={current.path} xRange={X_RANGE} yRange={Y_RANGE} />
              <CurrentDot x={current.x} y={current.y} xRange={X_RANGE} yRange={Y_RANGE} />
            </OptVizCanvas>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>loss: <b>{current.loss.toFixed(3)}</b></span>
              <span>β: <b>{current.beta}</b></span>
              <span>v: ({current.vx.toFixed(2)}, {current.vy.toFixed(2)})</span>
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
