import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'
import { OptVizCanvas, Axes, PathLine, CurrentDot, contourPaths, toSvgX, toSvgY } from './OptViz2D'

// 二次函数 + 可选 L1 正则
const A = [[4, 1], [1, 3]]
const bVec = [2, 1]
const fnQuad = (x, y) => 0.5 * (A[0][0] * x * x + 2 * A[0][1] * x * y + A[1][1] * y * y) - bVec[0] * x - bVec[1] * y
const gradQuad = (x, y) => [A[0][0] * x + A[0][1] * y - bVec[0], A[0][1] * x + A[1][1] * y - bVec[1]]

// L1 正则化版本 f + λ(|x| + |y|)
const lambda = 0.8
const fnL1 = (x, y) => fnQuad(x, y) + lambda * (Math.abs(x) + Math.abs(y))
const gradL1 = (x, y) => {
  const [gx, gy] = gradQuad(x, y)
  return [gx + lambda * Math.sign(x), gy + lambda * Math.sign(y)]
}

const X_RANGE = [-2, 3]
const Y_RANGE = [-1, 3]
const LEVELS_Q = [-1, 0, 0.5, 1, 2, 4, 7, 12]
const LEVELS_L1 = [0, 0.5, 1, 2, 4, 7, 12, 20]

function computeSteps(mode) {
  const steps = []
  let x = -1, y = 2.5
  const useL1 = mode === 'l1'
  const useFullGrad = mode === 'full'
  const fn = useL1 ? fnL1 : fnQuad
  const gradFn = useL1 ? gradL1 : gradQuad
  const lr = useFullGrad ? 0.15 : 0.2
  const maxSteps = 28
  const path = [{ x, y }]

  let coord = 0 // 0=x, 1=y 交替

  for (let i = 0; i < maxSteps; i++) {
    const g = gradFn(x, y)
    const loss = fn(x, y)

    let activeCoord, gradActive, stepSize
    if (useFullGrad) {
      // 全梯度下降对照
      activeCoord = -1
      gradActive = Math.sqrt(g[0] * g[0] + g[1] * g[1])
      stepSize = lr

      steps.push({
        description: `全梯度 步骤 ${i + 1}: (${x.toFixed(3)}, ${y.toFixed(3)}), loss=${loss.toFixed(4)}`,
        x, y, loss,
        active_coord: activeCoord,
        grad_active: gradActive,
        step_size: stepSize,
        path: path.map(p => ({ ...p })),
      })

      x -= lr * g[0]
      y -= lr * g[1]
    } else {
      // 坐标下降：每步只更新一个坐标
      activeCoord = coord % 2
      gradActive = activeCoord === 0 ? g[0] : g[1]
      stepSize = lr * Math.abs(gradActive)

      steps.push({
        description: `坐标下降 步骤 ${i + 1}: 更新 ${activeCoord === 0 ? 'x' : 'y'}, (${x.toFixed(3)}, ${y.toFixed(3)}), grad=${gradActive.toFixed(3)}, loss=${loss.toFixed(4)}`,
        x, y, loss,
        active_coord: activeCoord,
        grad_active: gradActive,
        step_size: stepSize,
        path: path.map(p => ({ ...p })),
      })

      if (activeCoord === 0) {
        // 精确线搜索 x 方向
        const gx = g[0]
        const exactLr = Math.abs(gx) > 1e-8 ? gx / A[0][0] : 0
        if (useL1) {
          // 软阈值
          const u = x - gx / A[0][0]
          x = Math.sign(u) * Math.max(0, Math.abs(u) - lambda / A[0][0])
        } else {
          x -= exactLr
        }
      } else {
        const gy = g[1]
        const exactLr = Math.abs(gy) > 1e-8 ? gy / A[1][1] : 0
        if (useL1) {
          const u = y - gy / A[1][1]
          y = Math.sign(u) * Math.max(0, Math.abs(u) - lambda / A[1][1])
        } else {
          y -= exactLr
        }
      }
      coord++
    }

    path.push({ x, y })
    if (loss < -1.5 && i > 5) break
  }

  const finalLoss = fn(x, y)
  steps.push({
    description: `结束: (${x.toFixed(4)}, ${y.toFixed(4)}), loss=${finalLoss.toFixed(5)}`,
    x, y, loss: finalLoss,
    active_coord: -1,
    grad_active: 0,
    step_size: 0,
    path: path.map(p => ({ ...p })),
  })

  return steps
}

export default function CoordinateDescentPlayground() {
  const presets = useMemo(() => [
    { id: 'quad', label: '二次函数', state: { mode: 'quad' } },
    { id: 'l1', label: 'L1 正则 (Lasso)', state: { mode: 'l1' } },
    { id: 'full', label: '全梯度对照', state: { mode: 'full' } },
  ], [])

  const contoursQuad = useMemo(() => contourPaths(fnQuad, X_RANGE, Y_RANGE, LEVELS_Q), [])
  const contoursL1 = useMemo(() => contourPaths(fnL1, X_RANGE, Y_RANGE, LEVELS_L1), [])

  const computeStepsFn = useCallback((state) => {
    return computeSteps(state.mode)
  }, [])

  return (
    <PlaygroundShell
      initialState={{ mode: 'quad' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#f97316', label: '优化路径' },
        { color: '#ef4444', label: '当前位置' },
        { color: '#38bdf8', label: '活跃坐标轴' },
      ]}
      renderViz={({ current, state }) => {
        const contours = state?.mode === 'l1' ? contoursL1 : contoursQuad

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <OptVizCanvas>
                <Axes xRange={X_RANGE} yRange={Y_RANGE} />
                {contours.map((d, i) => (
                  <path key={i} d={d} fill="none" stroke="#8b5cf6" strokeWidth="0.8" opacity="0.35" />
                ))}
                <PathLine points={current.path} xRange={X_RANGE} yRange={Y_RANGE} />
                {/* 高亮活跃坐标方向的线 */}
                {current.active_coord === 0 && (
                  <line
                    x1={toSvgX(current.x - 0.5, X_RANGE)} y1={toSvgY(current.y, Y_RANGE)}
                    x2={toSvgX(current.x + 0.5, X_RANGE)} y2={toSvgY(current.y, Y_RANGE)}
                    stroke="#38bdf8" strokeWidth="3" opacity="0.6" strokeLinecap="round"
                  />
                )}
                {current.active_coord === 1 && (
                  <line
                    x1={toSvgX(current.x, X_RANGE)} y1={toSvgY(current.y - 0.5, Y_RANGE)}
                    x2={toSvgX(current.x, X_RANGE)} y2={toSvgY(current.y + 0.5, Y_RANGE)}
                    stroke="#38bdf8" strokeWidth="3" opacity="0.6" strokeLinecap="round"
                  />
                )}
                <CurrentDot x={current.x} y={current.y} xRange={X_RANGE} yRange={Y_RANGE} />
              </OptVizCanvas>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span>x: <b>{current.x.toFixed(3)}</b></span>
                <span>y: <b>{current.y.toFixed(3)}</b></span>
                <span>loss: <b>{current.loss.toFixed(4)}</b></span>
                <span>活跃坐标: <b>{current.active_coord === 0 ? 'x' : current.active_coord === 1 ? 'y' : '—'}</b></span>
                <span>步长: <b>{current.step_size.toFixed(4)}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
