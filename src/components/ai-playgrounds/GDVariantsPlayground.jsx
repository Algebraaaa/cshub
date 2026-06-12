import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'
import { OptVizCanvas, Axes, PathLine, CurrentDot, contourPaths } from './OptViz2D'

// Rosenbrock 函数: f(x,y) = (a-x)^2 + b(y-x^2)^2
const A = 1, B = 100
const rosenbrock = (x, y) => (A - x) ** 2 + B * (y - x * x) ** 2
const gradRosenbrock = (x, y) => [
  -2 * (A - x) - 4 * B * x * (y - x * x),
  2 * B * (y - x * x),
]

const X_RANGE = [-2, 2]
const Y_RANGE = [-1, 3]
const LEVELS = [0.5, 2, 5, 10, 20, 50, 100, 200, 400, 800]

function computeSteps(variant, lr) {
  const steps = []
  let x = -1.5, y = 2.0
  const maxSteps = 40
  const allPoints = [{ x, y }]

  // 模拟不同 GD 变体的噪声
  for (let i = 0; i < maxSteps; i++) {
    const [gx, gy] = gradRosenbrock(x, y)
    const loss = rosenbrock(x, y)

    let noiseX = 0, noiseY = 0
    if (variant === 'sgd') {
      noiseX = (Math.random() - 0.5) * 0.8
      noiseY = (Math.random() - 0.5) * 0.8
    } else if (variant === 'mini') {
      noiseX = (Math.random() - 0.5) * 0.3
      noiseY = (Math.random() - 0.5) * 0.3
    }

    steps.push({
      description: `步骤 ${i + 1}: (${x.toFixed(2)}, ${y.toFixed(2)}), loss = ${loss.toFixed(2)}`,
      x, y, gx, gy, loss, variant,
      path: allPoints.map(p => ({ ...p })),
    })

    const nx = x - lr * (gx + noiseX)
    const ny = y - lr * (gy + noiseY)
    x = Math.max(-3, Math.min(3, nx))
    y = Math.max(-2, Math.min(4, ny))
    allPoints.push({ x, y })

    if (loss < 0.01) break
  }

  steps.push({
    description: `收敛: (${x.toFixed(3)}, ${y.toFixed(3)}), loss = ${rosenbrock(x, y).toFixed(4)}`,
    x, y, gx: 0, gy: 0, loss: rosenbrock(x, y), variant,
    path: allPoints.map(p => ({ ...p })),
  })

  return steps
}

export default function GDVariantsPlayground() {
  const presets = useMemo(() => [
    { id: 'bgd', label: 'BGD', state: { variant: 'bgd', lr: 0.002 } },
    { id: 'sgd', label: 'SGD', state: { variant: 'sgd', lr: 0.001 } },
    { id: 'mini', label: 'Mini-batch', state: { variant: 'mini', lr: 0.0015 } },
  ], [])

  const contours = useMemo(() => contourPaths(rosenbrock, X_RANGE, Y_RANGE, LEVELS), [])

  const computeStepsFn = useCallback((state) => {
    return computeSteps(state.variant, state.lr)
  }, [])

  return (
    <PlaygroundShell
      initialState={{ variant: 'bgd', lr: 0.002 }}
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
            <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>loss: <b>{current.loss.toFixed(2)}</b></span>
              <span>|</span>
              <span>位置: ({current.x.toFixed(2)}, {current.y.toFixed(2)})</span>
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
