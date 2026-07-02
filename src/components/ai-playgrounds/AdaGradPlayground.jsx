import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'
import { OptVizCanvas, Axes, PathLine, CurrentDot, contourPaths } from './OptViz2D'

// 非对称函数：x 方向曲率小、y 方向曲率大（AdaGrad 能自适应调节）
const fn = (x, y) => 0.1 * x * x + 5 * y * y
const grad = (x, y) => [0.2 * x, 10 * y]

const X_RANGE = [-5, 5]
const Y_RANGE = [-2, 2]
const LEVELS = [0.3, 1, 3, 8, 16, 30, 60]

function computeSteps(mode) {
  const steps = []
  let x = 4, y = 1.5
  const lr = mode === 'fixed' ? 0.02 : 0.5
  const eps = mode === 'eps4' ? 1e-4 : 1e-8
  const useAdaGrad = mode !== 'fixed'
  let cacheX = 0, cacheY = 0
  const maxSteps = 30
  const path = [{ x, y }]

  for (let i = 0; i < maxSteps; i++) {
    const [gx, gy] = grad(x, y)
    const loss = fn(x, y)
    let effLrX, effLrY

    if (useAdaGrad) {
      cacheX += gx * gx
      cacheY += gy * gy
      effLrX = lr / (Math.sqrt(cacheX) + eps)
      effLrY = lr / (Math.sqrt(cacheY) + eps)
      x -= effLrX * gx
      y -= effLrY * gy
    } else {
      effLrX = lr
      effLrY = lr
      x -= lr * gx
      y -= lr * gy
    }

    steps.push({
      description: `步骤 ${i + 1}: (${x.toFixed(3)}, ${y.toFixed(3)}), loss=${loss.toFixed(4)}, ` +
        `有效lr: x=${effLrX.toFixed(4)}, y=${effLrY.toFixed(4)}`,
      x, y, loss,
      cache_x: cacheX, cache_y: cacheY,
      effective_lr_x: effLrX, effective_lr_y: effLrY,
      useAdaGrad,
      path: path.map(p => ({ ...p })),
    })

    path.push({ x, y })
    if (loss < 0.001) break
  }

  const finalLoss = fn(x, y)
  steps.push({
    description: `结束: (${x.toFixed(4)}, ${y.toFixed(4)}), loss=${finalLoss.toFixed(5)}`,
    x, y, loss: finalLoss,
    cache_x: cacheX, cache_y: cacheY,
    effective_lr_x: useAdaGrad ? lr / (Math.sqrt(cacheX) + eps) : lr,
    effective_lr_y: useAdaGrad ? lr / (Math.sqrt(cacheY) + eps) : lr,
    useAdaGrad,
    path: path.map(p => ({ ...p })),
  })

  return steps
}

export default function AdaGradPlayground() {
  const presets = useMemo(() => [
    { id: 'ada8', label: 'AdaGrad ε=1e-8', state: { mode: 'ada8' } },
    { id: 'ada4', label: 'AdaGrad ε=1e-4', state: { mode: 'ada4' } },
    { id: 'fixed', label: '固定学习率', state: { mode: 'fixed' } },
  ], [])

  const contours = useMemo(() => contourPaths(fn, X_RANGE, Y_RANGE, LEVELS), [])

  const computeStepsFn = useCallback((state) => {
    return computeSteps(state.mode)
  }, [])

  return (
    <PlaygroundShell
      initialState={{ mode: 'ada8' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#f97316', label: '优化路径' },
        { color: '#ef4444', label: '当前位置' },
        { color: '#38bdf8', label: '有效学习率' },
      ]}
      renderViz={({ current }) => {
        const maxBarW = 80
        const maxLr = Math.max(current.effective_lr_x, current.effective_lr_y, 0.001)
        const barX = (current.effective_lr_x / maxLr) * maxBarW
        const barY = (current.effective_lr_y / maxLr) * maxBarW

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <OptVizCanvas>
                <Axes xRange={X_RANGE} yRange={Y_RANGE} />
                {contours.map((d, i) => (
                  <path key={i} d={d} fill="none" stroke="#8b5cf6" strokeWidth="0.8" opacity="0.35" />
                ))}
                <PathLine points={current.path} xRange={X_RANGE} yRange={Y_RANGE} />
                <CurrentDot x={current.x} y={current.y} xRange={X_RANGE} yRange={Y_RANGE} />
              </OptVizCanvas>
              {/* 有效学习率条形图 */}
              <div style={{ display: 'flex', gap: 20, fontSize: 12, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--text-secondary)', minWidth: 56 }}>lr_x:</span>
                  <div style={{ width: maxBarW, height: 10, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: barX, height: '100%', background: '#38bdf8', borderRadius: 4, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{current.effective_lr_x.toFixed(4)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--text-secondary)', minWidth: 56 }}>lr_y:</span>
                  <div style={{ width: maxBarW, height: 10, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: barY, height: '100%', background: '#38bdf8', borderRadius: 4, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{current.effective_lr_y.toFixed(4)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>x: <b>{current.x.toFixed(3)}</b></span>
                <span>y: <b>{current.y.toFixed(3)}</b></span>
                <span>loss: <b>{current.loss.toFixed(4)}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
