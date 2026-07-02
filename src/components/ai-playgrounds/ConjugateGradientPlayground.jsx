import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'
import { OptVizCanvas, Axes, PathLine, CurrentDot, contourPaths } from './OptViz2D'

// 二次函数 f(x) = 0.5 * x^T A x - b^T x
const A = [[4, 1], [1, 3]]
const b = [1, 2]
const fn = (x, y) => 0.5 * (A[0][0] * x * x + 2 * A[0][1] * x * y + A[1][1] * y * y) - b[0] * x - b[1] * y
const grad = (x, y) => [A[0][0] * x + A[0][1] * y - b[0], A[0][1] * x + A[1][1] * y - b[1]]
const matVec = (M, v) => [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]]
const dot = (a, b) => a[0] * b[0] + a[1] * b[1]

const X_RANGE = [-2, 3]
const Y_RANGE = [-1, 3]
const LEVELS = [0.5, 1, 2, 3, 5, 8, 12]

function computeSteps(useCG) {
  const steps = []
  let x = -1, y = 2.5
  const path = [{ x, y }]

  if (useCG) {
    // 共轭梯度法
    let r = grad(x, y).map(g => -g) // r = b - Ax = -grad
    let d = [...r]
    let rsOld = dot(r, r)

    for (let i = 0; i < 5; i++) {
      const loss = fn(x, y)

      steps.push({
        description: `CG 步骤 ${i + 1}: x=(${x.toFixed(3)}, ${y.toFixed(3)}), loss=${loss.toFixed(4)}`,
        x, y, loss, useCG: true,
        path: path.map(p => ({ ...p })),
      })

      const Ad = matVec(A, d)
      const alpha = rsOld / dot(d, Ad)
      x += alpha * d[0]
      y += alpha * d[1]
      path.push({ x, y })

      r = [r[0] - alpha * Ad[0], r[1] - alpha * Ad[1]]
      const rsNew = dot(r, r)
      const beta = rsNew / rsOld
      d = [r[0] + beta * d[0], r[1] + beta * d[1]]
      rsOld = rsNew

      if (rsNew < 1e-10) break
    }
  } else {
    // 最速下降法对比
    for (let i = 0; i < 30; i++) {
      const loss = fn(x, y)
      const g = grad(x, y)

      steps.push({
        description: `最速下降 步骤 ${i + 1}: x=(${x.toFixed(3)}, ${y.toFixed(3)}), loss=${loss.toFixed(4)}`,
        x, y, loss, useCG: false,
        path: path.map(p => ({ ...p })),
      })

      // 精确线搜索步长
      const Ad = matVec(A, g)
      const alpha = dot(g, g) / dot(g, Ad)
      x -= alpha * g[0]
      y -= alpha * g[1]
      path.push({ x, y })

      if (loss < 0.0001) break
    }
  }

  const loss = fn(x, y)
  steps.push({
    description: `收敛: (${x.toFixed(4)}, ${y.toFixed(4)}), loss=${loss.toFixed(6)}`,
    x, y, loss, useCG,
    path: path.map(p => ({ ...p })),
  })

  return steps
}

export default function ConjugateGradientPlayground() {
  const presets = useMemo(() => [
    { id: 'cg', label: '共轭梯度法', state: { useCG: true } },
    { id: 'sd', label: '最速下降法', state: { useCG: false } },
  ], [])

  const contours = useMemo(() => contourPaths(fn, X_RANGE, Y_RANGE, LEVELS), [])

  const computeStepsFn = useCallback((state) => {
    return computeSteps(state.useCG)
  }, [])

  return (
    <PlaygroundShell
      initialState={{ useCG: true }}
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
              <span>{current.useCG ? '共轭梯度法' : '最速下降法'}</span>
              <span>loss: <b>{current.loss.toFixed(5)}</b></span>
              <span>步数: {current.path.length - 1}</span>
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
