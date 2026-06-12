import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'
import { OptVizCanvas, Axes, PathLine, CurrentDot, contourPaths, toSvgX, toSvgY } from './OptViz2D'

// 二维二次函数 f(x,y) = 0.5*(ax^2 + 2bxy + cy^2) - dx - ey
const A = [[6, 2], [2, 4]]
const bVec = [2, 1]
const fn = (x, y) => 0.5 * (A[0][0] * x * x + 2 * A[0][1] * x * y + A[1][1] * y * y) - bVec[0] * x - bVec[1] * y
const grad = (x, y) => [A[0][0] * x + A[0][1] * y - bVec[0], A[0][1] * x + A[1][1] * y - bVec[1]]
const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1]
const matVec = (M, v) => [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]]
const outerProd = (u, v) => [[u[0] * v[0], u[0] * v[1]], [u[1] * v[0], u[1] * v[1]]]
const matSub = (A, B) => [[A[0][0] - B[0][0], A[0][1] - B[0][1]], [A[1][0] - B[1][0], A[1][1] - B[1][1]]]
const matAdd = (A, B) => [[A[0][0] + B[0][0], A[0][1] + B[0][1]], [A[1][0] + B[1][0], A[1][1] + B[1][1]]]
const matScale = (M, s) => [[M[0][0] * s, M[0][1] * s], [M[1][0] * s, M[1][1] * s]]

const X_RANGE = [-2, 3]
const Y_RANGE = [-1, 3]
const LEVELS = [-1, 0, 0.5, 1, 2, 4, 7, 12]

// 真实 Hessian 的逆
const detA = A[0][0] * A[1][1] - A[0][1] * A[1][0]
const Hinv = [[A[1][1] / detA, -A[0][1] / detA], [-A[1][0] / detA, A[0][0] / detA]]

function computeSteps(mode) {
  const steps = []
  let x = -1, y = 2.5
  let H = [[1, 0], [0, 1]] // 近似逆 Hessian
  const lr = 0.1
  const maxSteps = 25
  const path = [{ x, y }]

  for (let i = 0; i < maxSteps; i++) {
    const g = grad(x, y)
    const loss = fn(x, y)

    let dirX, dirY
    if (mode === 'bfgs') {
      const d = matVec(H, g)
      dirX = -d[0]; dirY = -d[1]
    } else if (mode === 'newton') {
      const d = matVec(Hinv, g)
      dirX = -d[0]; dirY = -d[1]
    } else {
      dirX = -g[0]; dirY = -g[1]
    }

    const condH = Math.sqrt(H[0][0] * H[0][0] + H[0][1] * H[0][1] + H[1][0] * H[1][0] + H[1][1] * H[1][1])

    steps.push({
      description: `步骤 ${i + 1}: (${x.toFixed(3)}, ${y.toFixed(3)}), loss=${loss.toFixed(4)}, 方向=(${dirX.toFixed(3)}, ${dirY.toFixed(3)})`,
      x, y, loss,
      grad_x: g[0], grad_y: g[1],
      direction_x: dirX, direction_y: dirY,
      hessian_condition: condH,
      mode,
      path: path.map(p => ({ ...p })),
    })

    // 线搜索步长（简化：固定小步长或精确步长）
    let alpha
    if (mode === 'gd') {
      const Ag = matVec(A, g)
      alpha = dot2(g, g) / dot2(g, Ag)
    } else if (mode === 'newton') {
      alpha = 1.0
    } else {
      alpha = Math.min(lr, 1.0 / (condH + 1))
      alpha = Math.max(alpha, 0.01)
    }

    const xNew = x + alpha * dirX
    const yNew = y + alpha * dirY

    // BFGS 更新逆 Hessian 近似
    if (mode === 'bfgs') {
      const s = [xNew - x, yNew - y]
      const gNew = grad(xNew, yNew)
      const yVec = [gNew[0] - g[0], gNew[1] - g[1]]
      const sy = dot2(s, yVec)
      if (sy > 1e-10) {
        const rho = 1 / sy
        const Hy = matVec(H, yVec)
        const yHy = dot2(yVec, Hy)
        const ssT = outerProd(s, s)
        const HysT = outerProd(Hy, s)
        const syT = outerProd(s, yVec)
        const term1 = matScale(ssT, rho * (1 + rho * yHy))
        const term2 = matScale(matAdd(HysT, syT), rho)
        H = matAdd(matSub(H, term2), term1)
      }
    }

    x = xNew; y = yNew
    path.push({ x, y })
    if (Math.abs(loss - fn(x, y)) < 1e-8 && i > 3) break
  }

  const finalLoss = fn(x, y)
  steps.push({
    description: `结束: (${x.toFixed(4)}, ${y.toFixed(4)}), loss=${finalLoss.toFixed(6)}`,
    x, y, loss: finalLoss,
    grad_x: 0, grad_y: 0,
    direction_x: 0, direction_y: 0,
    hessian_condition: 0, mode,
    path: path.map(p => ({ ...p })),
  })

  return steps
}

export default function BFGSPlayground() {
  const presets = useMemo(() => [
    { id: 'bfgs', label: 'BFGS', state: { mode: 'bfgs' } },
    { id: 'newton', label: 'Newton 法', state: { mode: 'newton' } },
    { id: 'gd', label: '梯度下降', state: { mode: 'gd' } },
  ], [])

  const contours = useMemo(() => contourPaths(fn, X_RANGE, Y_RANGE, LEVELS), [])

  const computeStepsFn = useCallback((state) => {
    return computeSteps(state.mode)
  }, [])

  return (
    <PlaygroundShell
      initialState={{ mode: 'bfgs' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#f97316', label: '优化路径' },
        { color: '#ef4444', label: '当前位置' },
        { color: '#38bdf8', label: '搜索方向' },
        { color: '#8b5cf6', label: '等高线' },
      ]}
      renderViz={({ current }) => {
        const cx = toSvgX(current.x, X_RANGE)
        const cy = toSvgY(current.y, Y_RANGE)
        const dScale = 20
        const dEndX = cx + current.direction_x * dScale
        const dEndY = cy - current.direction_y * dScale
        // Hessian 椭圆：用条件数控制长短轴比
        const cond = current.hessian_condition
        const rx = Math.min(30, Math.max(8, cond * 6))
        const ry = Math.min(30, Math.max(8, 30 / (cond + 0.1)))

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <OptVizCanvas>
                <Axes xRange={X_RANGE} yRange={Y_RANGE} />
                {contours.map((d, i) => (
                  <path key={i} d={d} fill="none" stroke="#8b5cf6" strokeWidth="0.8" opacity="0.35" />
                ))}
                <PathLine points={current.path} xRange={X_RANGE} yRange={Y_RANGE} />
                {/* 近似 Hessian 椭圆 */}
                <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
                  fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.5" />
                {/* 搜索方向箭头 */}
                <line x1={cx} y1={cy} x2={dEndX} y2={dEndY}
                  stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrowBFGS)" opacity="0.9" />
                <defs>
                  <marker id="arrowBFGS" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
                  </marker>
                </defs>
                <CurrentDot x={current.x} y={current.y} xRange={X_RANGE} yRange={Y_RANGE} />
              </OptVizCanvas>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span>x: <b>{current.x.toFixed(3)}</b></span>
                <span>y: <b>{current.y.toFixed(3)}</b></span>
                <span>loss: <b>{current.loss.toFixed(5)}</b></span>
                <span>|d|: <b>{Math.sqrt(current.direction_x ** 2 + current.direction_y ** 2).toFixed(3)}</b></span>
                <span>κ(H): <b>{current.hessian_condition.toFixed(2)}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
