import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'
import { OptVizCanvas, Axes, PathLine, CurrentDot, contourPaths } from './OptViz2D'

const fn = (x, y) => x * x + y * y
const grad = (x, y) => [2 * x, 2 * y]

const X_RANGE = [-5, 5]
const Y_RANGE = [-5, 5]
const LEVELS = [1, 4, 9, 16, 25, 40]

function computeSteps(lr) {
  const steps = []
  let x = 4, y = 3
  const maxSteps = 50
  const path = [{ x, y }]
  let diverged = false

  for (let i = 0; i < maxSteps; i++) {
    const [gx, gy] = grad(x, y)
    const loss = fn(x, y)

    if (loss > 1e6 || isNaN(loss)) {
      diverged = true
      break
    }

    steps.push({
      description: `步骤 ${i + 1}: x=(${x.toFixed(2)}, ${y.toFixed(2)}), loss=${loss.toFixed(3)}, lr=${lr}`,
      x, y, loss, lr, diverged: false,
      path: path.map(p => ({ ...p })),
    })

    x -= lr * gx
    y -= lr * gy
    path.push({ x, y })

    if (loss < 0.001) break
  }

  if (diverged) {
    steps.push({
      description: `发散! lr=${lr} 太大，loss 飞出`,
      x: 0, y: 0, loss: Infinity, lr, diverged: true,
      path: [],
    })
  } else {
    steps.push({
      description: `收敛: (${x.toFixed(3)}, ${y.toFixed(3)}), loss=${fn(x, y).toFixed(4)}`,
      x, y, loss: fn(x, y), lr, diverged: false,
      path: path.map(p => ({ ...p })),
    })
  }

  return steps
}

// 预计算多条路径用于对比
const LR_VALUES = [0.01, 0.1, 0.5, 1.05]
const LR_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
const LR_LABELS = ['lr=0.01 (慢)', 'lr=0.1 (适中)', 'lr=0.5 (快)', 'lr=1.05 (发散)']

const allPaths = LR_VALUES.map(lr => {
  const path = [{ x: 4, y: 3 }]
  let x = 4, y = 3
  for (let i = 0; i < 50; i++) {
    const [gx, gy] = grad(x, y)
    x -= lr * gx
    y -= lr * gy
    path.push({ x, y })
    if (x * x + y * y < 0.001) break
    if (x * x + y * y > 1e6) break
  }
  return { lr, path, color: LR_COLORS[LR_VALUES.indexOf(lr)] }
})

export default function LRComparePlayground() {
  const presets = useMemo(() => [
    { id: 'lr01', label: 'lr=0.01', state: { lr: 0.01 } },
    { id: 'lr1', label: 'lr=0.1', state: { lr: 0.1 } },
    { id: 'lr5', label: 'lr=0.5', state: { lr: 0.5 } },
    { id: 'lr105', label: 'lr=1.05 (发散)', state: { lr: 1.05 } },
  ], [])

  const contours = useMemo(() => contourPaths(fn, X_RANGE, Y_RANGE, LEVELS), [])

  const computeStepsFn = useCallback((state) => {
    return computeSteps(state.lr)
  }, [])

  return (
    <PlaygroundShell
      initialState={{ lr: 0.1 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={LR_LABELS.map((label, i) => ({ color: LR_COLORS[i], label }))}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <OptVizCanvas>
              <Axes xRange={X_RANGE} yRange={Y_RANGE} />
              {contours.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="var(--border)" strokeWidth="0.8" opacity="0.5" />
              ))}
              {/* 所有 lr 的路径对比 */}
              {allPaths.map(({ lr, path, color }) => (
                <PathLine key={lr} points={path} xRange={X_RANGE} yRange={Y_RANGE} color={color} />
              ))}
              {/* 当前选中的点 */}
              {current.path.length > 0 && (
                <CurrentDot x={current.x} y={current.y} xRange={X_RANGE} yRange={Y_RANGE} />
              )}
            </OptVizCanvas>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>当前 lr: <b>{current.lr}</b></span>
              <span>loss: <b>{current.diverged ? '∞' : current.loss.toFixed(3)}</b></span>
              {current.diverged && <span style={{ color: '#ef4444' }}>已发散!</span>}
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
