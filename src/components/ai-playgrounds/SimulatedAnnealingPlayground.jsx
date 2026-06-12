import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'
import { OptVizCanvas, Axes, PathLine, CurrentDot, contourPaths } from './OptViz2D'

// 多峰函数
const fn = (x, y) => {
  return 3 * (1 - x) ** 2 * Math.exp(-x * x - (y + 1) ** 2)
    - 10 * (x / 5 - x ** 3 - y ** 5) * Math.exp(-x * x - y * y)
    - 1 / 3 * Math.exp(-Math.pow(x + 1, 2) - y * y)
}

const X_RANGE = [-3, 3]
const Y_RANGE = [-3, 3]
const LEVELS = [-2, -1, 0, 1, 2, 3, 4]

function computeSteps(T0, alpha) {
  const steps = []
  let x = -2, y = 2
  let bestX = x, bestY = y
  let bestVal = fn(x, y)
  let T = T0
  const path = [{ x, y }]
  const maxSteps = 40

  for (let i = 0; i < maxSteps; i++) {
    const val = fn(x, y)

    steps.push({
      description: `步骤 ${i + 1}: x=(${x.toFixed(2)}, ${y.toFixed(2)}), f=${val.toFixed(3)}, T=${T.toFixed(2)}`,
      x, y, val, T, bestX, bestY, bestVal,
      path: path.map(p => ({ ...p })),
    })

    // 邻域扰动
    const nx = x + (Math.random() - 0.5) * (0.5 + T * 0.1)
    const ny = y + (Math.random() - 0.5) * (0.5 + T * 0.1)
    const clampedNx = Math.max(-3, Math.min(3, nx))
    const clampedNy = Math.max(-3, Math.min(3, ny))
    const newVal = fn(clampedNx, clampedNy)
    const delta = newVal - val

    // Metropolis 准则
    if (delta > 0 || Math.random() < Math.exp(delta / Math.max(T, 0.01))) {
      x = clampedNx
      y = clampedNy
      path.push({ x, y })
    }

    // 更新全局最优
    if (fn(x, y) > bestVal) {
      bestX = x
      bestY = y
      bestVal = fn(x, y)
    }

    // 降温
    T *= alpha
  }

  steps.push({
    description: `最终: 最优=(${bestX.toFixed(3)}, ${bestY.toFixed(3)}), f=${bestVal.toFixed(3)}`,
    x: bestX, y: bestY, val: bestVal, T, bestX, bestY, bestVal,
    path: path.map(p => ({ ...p })),
  })

  return steps
}

export default function SimulatedAnnealingPlayground() {
  const presets = useMemo(() => [
    { id: 'slow', label: '慢降温 (α=0.98)', state: { T0: 5, alpha: 0.98 } },
    { id: 'fast', label: '快降温 (α=0.9)', state: { T0: 5, alpha: 0.9 } },
    { id: 'hot', label: '高温 (T0=20)', state: { T0: 20, alpha: 0.95 } },
  ], [])

  const contours = useMemo(() => contourPaths(fn, X_RANGE, Y_RANGE, LEVELS), [])

  const computeStepsFn = useCallback((state) => {
    return computeSteps(state.T0, state.alpha)
  }, [])

  return (
    <PlaygroundShell
      initialState={{ T0: 5, alpha: 0.95 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#f97316', label: '搜索路径' },
        { color: '#ef4444', label: '当前位置' },
        { color: '#10b981', label: '全局最优' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <OptVizCanvas>
              <Axes xRange={X_RANGE} yRange={Y_RANGE} />
              {contours.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="var(--border)" strokeWidth="0.8" opacity="0.4" />
              ))}
              <PathLine points={current.path} xRange={X_RANGE} yRange={Y_RANGE} color="#f97316" dashed />
              {/* 当前位置 */}
              <CurrentDot x={current.x} y={current.y} xRange={X_RANGE} yRange={Y_RANGE} />
              {/* 全局最优标记 */}
              <circle
                cx={(current.bestX + 3) / 6 * 410 + 35}
                cy={(3 - current.bestY) / 6 * 250 + 35}
                r="6" fill="#10b981" stroke="white" strokeWidth="2"
              />
            </OptVizCanvas>

            {/* 温度计 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 300 }}>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>温度 T</span>
              <div style={{ flex: 1, height: 8, background: 'var(--surface)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (current.T / 5) * 100)}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, #3b82f6, #ef4444)`,
                  borderRadius: 4,
                  transition: 'width 0.3s',
                }} />
              </div>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                {current.T.toFixed(2)}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>当前: <b>{current.val.toFixed(3)}</b></span>
              <span>最优: <b style={{ color: '#10b981' }}>{current.bestVal.toFixed(3)}</b></span>
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
