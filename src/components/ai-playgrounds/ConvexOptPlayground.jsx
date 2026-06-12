import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 500
const H = 350
const PAD = 40
const PURPLE = '#8b5cf6'
const ORANGE = '#f97316'
const RED = '#ef4444'
const BLUE = '#3b82f6'
const GREEN = '#10b981'
const YELLOW = '#f59e0b'

const X_RANGE = [-3, 3]
const Y_RANGE = [-3, 3]

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }

// Convex: f(x,y) = x^2 + y^2, minimum at (0,0)
// Non-convex: f(x,y) = x^2 + y^2 - 3*cos(2*pi*x) - 3*cos(2*pi*y), multiple minima

function computeConvexSteps() {
  return [
    { description: '凸函数: f(x,y) = x² + y²，全局最小值在原点', phase: 'intro', showContour: true, showMinimum: false, showGrad: false, showLine: false, contourType: 'convex' },
    { description: '绘制等值线: f = 0.5, 1, 2, 4, 6, 8（同心圆）', phase: 'contour', showContour: true, showMinimum: false, showGrad: false, showLine: false, contourType: 'convex' },
    { description: '凸函数等值线为凸集（圆形），任意等值线内部都是凸的', phase: 'convex-set', showContour: true, showMinimum: false, showGrad: false, showLine: false, contourType: 'convex' },
    { description: '等值线越内层 f 越小，中心即为最小值', phase: 'inner-smaller', showContour: true, showMinimum: false, showGrad: false, showLine: false, contourType: 'convex' },
    { description: '标记全局最小值点 (0,0)，f*=0', phase: 'global-min', showContour: true, showMinimum: true, showGrad: false, showLine: false, contourType: 'convex' },
    { description: '凸函数的局部最小值一定是全局最小值', phase: 'local-is-global', showContour: true, showMinimum: true, showGrad: false, showLine: false, contourType: 'convex' },
    { description: '这是凸优化的核心优势: 不存在"错误"的局部最优', phase: 'advantage', showContour: true, showMinimum: true, showGrad: false, showLine: false, contourType: 'convex' },
    { description: '梯度下降: 从 (2.5, 2.5) 出发', phase: 'gd-start', showContour: true, showMinimum: true, showGrad: true, showLine: false, contourType: 'convex', gdStart: [2.5, 2.5], gdPath: [[2.5, 2.5]] },
    { description: '计算梯度: ∇f = (2x, 2y) = (5, 5)', phase: 'grad1', showContour: true, showMinimum: true, showGrad: true, showLine: false, contourType: 'convex', gdPath: [[2.5, 2.5]] },
    { description: '沿负梯度方向移动一步 → (1.8, 1.8)', phase: 'gd-step1', showContour: true, showMinimum: true, showGrad: true, showLine: false, contourType: 'convex', gdPath: [[2.5, 2.5], [1.8, 1.8]] },
    { description: '继续迭代: (1.8,1.8) → (1.2,1.2)', phase: 'gd-step2', showContour: true, showMinimum: true, showGrad: true, showLine: false, contourType: 'convex', gdPath: [[2.5, 2.5], [1.8, 1.8], [1.2, 1.2]] },
    { description: '继续迭代: (1.2,1.2) → (0.6,0.6) → (0.2,0.2)', phase: 'gd-step3', showContour: true, showMinimum: true, showGrad: true, showLine: false, contourType: 'convex', gdPath: [[2.5, 2.5], [1.8, 1.8], [1.2, 1.2], [0.6, 0.6], [0.2, 0.2]] },
    { description: '梯度下降收敛到全局最优 (0,0)，任何初始点都能到达', phase: 'gd-converge', showContour: true, showMinimum: true, showGrad: true, showLine: false, contourType: 'convex', gdPath: [[2.5, 2.5], [1.8, 1.8], [1.2, 1.2], [0.6, 0.6], [0.2, 0.2]] },
    { description: '凸性验证: 任取两点 (-2,-2) 和 (2,2)，连线在函数上方', phase: 'line-start', showContour: true, showMinimum: true, showGrad: false, showLine: true, contourType: 'convex', linePoints: [[-2, -2], [2, 2]] },
    { description: '线段上的函数值 ≤ 端点函数值的线性插值', phase: 'line-verify', showContour: true, showMinimum: true, showGrad: false, showLine: true, contourType: 'convex', linePoints: [[-2, -2], [2, 2]] },
    { description: 'Jensen不等式: f(θx+(1-θ)y) ≤ θf(x)+(1-θ)f(y)', phase: 'jensen', showContour: true, showMinimum: true, showGrad: false, showLine: true, contourType: 'convex', linePoints: [[-2, -2], [2, 2]] },
    { description: '凸优化优势: 局部最优=全局最优，多项式时间可解', phase: 'final', showContour: true, showMinimum: true, showGrad: false, showLine: false, contourType: 'convex' },
  ]
}

function computeNonConvexSteps() {
  return [
    { description: '非凸函数: f(x,y) = x²+y²-3cos(2πx)-3cos(2πy)', phase: 'intro', showContour: true, showMinimum: false, showGrad: false, showLine: false, contourType: 'nonconvex' },
    { description: '等值线呈不规则形状（Rastrigin 函数变体）', phase: 'contour', showContour: true, showMinimum: false, showGrad: false, showLine: false, contourType: 'nonconvex' },
    { description: '多个"盆地"形成，每个盆地对应一个局部极小值', phase: 'basins', showContour: true, showMinimum: false, showGrad: false, showLine: false, contourType: 'nonconvex' },
    { description: '标记全局最小值: (0,0), f* = -6', phase: 'global', showContour: true, showMinimum: true, showGrad: false, showLine: false, contourType: 'nonconvex', highlightedMin: [0, 0] },
    { description: '标记局部最小值: (1,0), f ≈ -4.2', phase: 'local1', showContour: true, showMinimum: true, showGrad: false, showLine: false, contourType: 'nonconvex', highlightedMin: [1, 0] },
    { description: '标记局部最小值: (-1,1), f ≈ -4.2', phase: 'local2', showContour: true, showMinimum: true, showGrad: false, showLine: false, contourType: 'nonconvex', highlightedMin: [-1, 1] },
    { description: '还有更多局部极小值分布在各处', phase: 'more-local', showContour: true, showMinimum: true, showGrad: false, showLine: false, contourType: 'nonconvex' },
    { description: '局部最小值 ≠ 全局最小值! 这是非凸优化的核心困难', phase: 'local-not-global', showContour: true, showMinimum: true, showGrad: false, showLine: false, contourType: 'nonconvex' },
    { description: '梯度下降从 (2.5, 2.5) 出发', phase: 'gd-start', showContour: true, showMinimum: true, showGrad: true, showLine: false, contourType: 'nonconvex', gdPath: [[2.5, 2.5]] },
    { description: '沿负梯度方向移动: (2.5,2.5) → (2.0,1.5)', phase: 'gd-step1', showContour: true, showMinimum: true, showGrad: true, showLine: false, contourType: 'nonconvex', gdPath: [[2.5, 2.5], [2.0, 1.5]] },
    { description: '继续移动: (2.0,1.5) → (1.4,0.8) → (1.0,0.1)', phase: 'gd-step2', showContour: true, showMinimum: true, showGrad: true, showLine: false, contourType: 'nonconvex', gdPath: [[2.5, 2.5], [2.0, 1.5], [1.4, 0.8], [1.0, 0.1]] },
    { description: '陷入局部最优 (1,0) 而非全局最优 (0,0)!', phase: 'gd-trap', showContour: true, showMinimum: true, showGrad: true, showLine: false, contourType: 'nonconvex', gdPath: [[2.5, 2.5], [2.0, 1.5], [1.4, 0.8], [1.0, 0.1], [1.0, 0.0]] },
    { description: '不同初始点可能收敛到不同局部最优', phase: 'multi-start', showContour: true, showMinimum: true, showGrad: false, showLine: false, contourType: 'nonconvex' },
    { description: '应对策略: 多起点随机重启', phase: 'strategy1', showContour: true, showMinimum: true, showGrad: false, showLine: false, contourType: 'nonconvex' },
    { description: '应对策略: 模拟退火（允许概率性上升移动）', phase: 'strategy2', showContour: true, showMinimum: true, showGrad: false, showLine: false, contourType: 'nonconvex' },
    { description: '应对策略: 遗传算法（种群搜索）', phase: 'strategy3', showContour: true, showMinimum: true, showGrad: false, showLine: false, contourType: 'nonconvex' },
    { description: '凸优化 vs 非凸优化: 前者有保证，后者是 NP-hard', phase: 'compare', showContour: true, showMinimum: true, showGrad: false, showLine: false, contourType: 'nonconvex' },
  ]
}

function computeConvexSetSteps() {
  return [
    { description: '凸集: 集合内任意两点的连线仍在集合内', phase: 'intro', showContour: false, showSet: 'circle' },
    { description: '凸集的数学定义: ∀x,y∈S, θ∈[0,1] → θx+(1-θ)y∈S', phase: 'definition', showContour: false, showSet: 'circle' },
    { description: '直观理解: 在集合内任取两点画线段，线段不穿出集合', phase: 'intuition', showContour: false, showSet: 'circle' },
    { description: '圆形区域: 任取两点连线，线段完全在圆内 → 凸集', phase: 'circle', showContour: false, showSet: 'circle', showLine: true, linePoints: [[-1, -1], [1.5, 1.5]] },
    { description: '换一对点验证: 线段仍在圆内', phase: 'circle-verify2', showContour: false, showSet: 'circle', showLine: true, linePoints: [[1, 0], [-1, 1]] },
    { description: '圆形是典型的凸集', phase: 'circle-verify', showContour: false, showSet: 'circle', showLine: true, linePoints: [[-1, -1], [1.5, 1.5]] },
    { description: '椭圆形也是凸集', phase: 'ellipse', showContour: false, showSet: 'ellipse', showLine: true, linePoints: [[-1.5, 0], [1.5, 0]] },
    { description: '半平面 x+y≤2: 凸集（线性不等式定义的区域都是凸集）', phase: 'halfplane', showContour: false, showSet: 'halfplane', showLine: true, linePoints: [[-2, -1], [1, 1]] },
    { description: '多面体（多个线性约束的交集）也是凸集', phase: 'polyhedron', showContour: false, showSet: 'halfplane', showLine: false },
    { description: 'LP的可行域就是多面体 → 凸集', phase: 'lp-convex', showContour: false, showSet: 'halfplane', showLine: false },
    { description: '凸集的交集仍是凸集（凸集保凸性）', phase: 'intersection', showContour: false, showSet: 'intersection', showLine: false },
    { description: '凸集的并集不一定是凸集!', phase: 'union', showContour: false, showSet: 'circle', showLine: false },
    { description: '非凸集: 月牙形区域', phase: 'nonconvex-intro', showContour: false, showSet: 'nonconvex', showLine: false },
    { description: '两点连线穿出集合外 → 非凸集', phase: 'nonconvex-line', showContour: false, showSet: 'nonconvex', showLine: true, linePoints: [[-1.5, 0], [1.5, 0.5]] },
    { description: '凸优化要求可行域是凸集且目标函数是凸函数', phase: 'final', showContour: false, showSet: 'circle', showLine: false },
    { description: '凸集 + 凸函数 → 局部最优即全局最优', phase: 'conclusion', showContour: false, showSet: 'circle', showLine: false },
  ]
}

function computeSteps(preset) {
  if (preset.id === 'nonconvex') return computeNonConvexSteps()
  if (preset.id === 'convexset') return computeConvexSetSteps()
  return computeConvexSteps()
}

export default function ConvexOptPlayground() {
  const presets = useMemo(() => [
    { id: 'convex', label: '凸函数' },
    { id: 'nonconvex', label: '非凸函数' },
    { id: 'convexset', label: '凸集' },
  ], [])

  const computeStepsFn = useCallback((payload) => computeSteps(payload), [])

  return (
    <PlaygroundShell
      presets={presets}
      initialPresetId="convex"
      computeSteps={computeStepsFn}
      legend={[
        { color: PURPLE, label: '等值线' },
        { color: GREEN, label: '全局最优' },
        { color: RED, label: '局部最优' },
        { color: ORANGE, label: '梯度下降路径' },
        { color: YELLOW, label: '凸性验证线' },
      ]}
      renderViz={({ current, presetId }) => {
        const isConvexSet = presetId === 'convexset'

        return (
          <VizCard>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
              {/* Background */}
              <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.03)" rx="4" />

              {/* Axes */}
              <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1.5" />
              <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1.5" />
              <text x={W - PAD + 4} y={H - PAD + 14} fill="var(--text-tertiary)" fontSize="11">x</text>
              <text x={PAD - 4} y={PAD - 8} fill="var(--text-tertiary)" fontSize="11">y</text>

              {/* Axis ticks */}
              {[-2, -1, 0, 1, 2].map(v => (
                <g key={v}>
                  <text x={sx(v)} y={H - PAD + 16} textAnchor="middle" fill="var(--text-tertiary)" fontSize="9">{v}</text>
                  <text x={PAD - 8} y={sy(v) + 3} textAnchor="end" fill="var(--text-tertiary)" fontSize="9">{v}</text>
                </g>
              ))}

              {/* Convex set visualization */}
              {isConvexSet && current.showSet === 'circle' && (
                <circle cx={sx(0)} cy={sy(0)} r={(2 / 6) * (W - PAD * 2)} fill={BLUE} opacity="0.1" stroke={BLUE} strokeWidth="1.5" />
              )}
              {isConvexSet && current.showSet === 'ellipse' && (
                <ellipse cx={sx(0)} cy={sy(0)} rx={(2.5 / 6) * (W - PAD * 2)} ry={(1.5 / 6) * (H - PAD * 2)} fill={BLUE} opacity="0.1" stroke={BLUE} strokeWidth="1.5" />
              )}
              {isConvexSet && current.showSet === 'halfplane' && (
                <polygon
                  points={`${sx(-3)},${sy(-3)} ${sx(5)},${sy(-3)} ${sx(5)},${sy(-3)} ${sx(-3)},${sy(5)}`}
                  fill={BLUE} opacity="0.06"
                />
              )}
              {isConvexSet && current.showSet === 'nonconvex' && (
                <path
                  d={`M${sx(0)},${sy(2)} Q${sx(2)},${sy(1)} ${sx(1.5)},${sy(-1)} Q${sx(1)},${sy(-2)} ${sx(-1)},${sy(-1.5)} Q${sx(-2)},${sy(-1)} ${sx(-1.5)},${sy(0.5)} Z`}
                  fill={RED} opacity="0.1" stroke={RED} strokeWidth="1.5"
                />
              )}

              {/* Line segment for convexity verification */}
              {current.showLine && current.linePoints && (
                <line
                  x1={sx(current.linePoints[0][0])} y1={sy(current.linePoints[0][1])}
                  x2={sx(current.linePoints[1][0])} y2={sy(current.linePoints[1][1])}
                  stroke={YELLOW} strokeWidth="2.5" strokeDasharray="8 5" opacity="0.9"
                />
              )}

              {/* Convex function contours */}
              {!isConvexSet && current.contourType === 'convex' && current.showContour && (
                <g>
                  {[0.5, 1, 2, 4, 6, 8].map((r2, i) => {
                    const r = Math.sqrt(r2)
                    const rPx = r * (W - PAD * 2) / (X_RANGE[1] - X_RANGE[0])
                    return (
                      <circle key={i} cx={sx(0)} cy={sy(0)} r={rPx}
                        fill="none" stroke={PURPLE} strokeWidth="1"
                        opacity={0.15 + i * 0.06}
                      />
                    )
                  })}
                </g>
              )}

              {/* Non-convex contours - simplified representation */}
              {!isConvexSet && current.contourType === 'nonconvex' && current.showContour && (
                <g>
                  {/* Global minimum contours */}
                  {[1, 2, 4, 7].map((r2, i) => {
                    const r = Math.sqrt(r2) * 0.5
                    const rPx = r * (W - PAD * 2) / (X_RANGE[1] - X_RANGE[0])
                    return (
                      <circle key={`g-${i}`} cx={sx(0)} cy={sy(0)} r={rPx}
                        fill="none" stroke={PURPLE} strokeWidth="1" opacity={0.2 + i * 0.05}
                        strokeDasharray={i < 2 ? 'none' : '4 3'}
                      />
                    )
                  })}
                  {/* Local minimum at (1,0) */}
                  {[0.5, 1.5].map((r2, i) => {
                    const r = Math.sqrt(r2) * 0.35
                    const rPx = r * (W - PAD * 2) / (X_RANGE[1] - X_RANGE[0])
                    return (
                      <circle key={`l1-${i}`} cx={sx(1)} cy={sy(0)} r={rPx}
                        fill="none" stroke={RED} strokeWidth="1" opacity={0.25}
                      />
                    )
                  })}
                  {/* Local minimum at (-1,1) */}
                  {[0.5, 1.5].map((r2, i) => {
                    const r = Math.sqrt(r2) * 0.35
                    const rPx = r * (W - PAD * 2) / (X_RANGE[1] - X_RANGE[0])
                    return (
                      <circle key={`l2-${i}`} cx={sx(-1)} cy={sy(1)} r={rPx}
                        fill="none" stroke={RED} strokeWidth="1" opacity={0.25}
                      />
                    )
                  })}
                </g>
              )}

              {/* Minimum markers */}
              {!isConvexSet && current.showMinimum && current.contourType === 'convex' && (
                <g>
                  <circle cx={sx(0)} cy={sy(0)} r="7" fill="none" stroke={GREEN} strokeWidth="2.5">
                    <animate attributeName="r" values="7;10;7" dur="1s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={sx(0)} cy={sy(0)} r="4" fill={GREEN} />
                  <text x={sx(0) + 10} y={sy(0) - 8} fill={GREEN} fontSize="10" fontWeight="bold">全局最优 (0,0)</text>
                </g>
              )}

              {!isConvexSet && current.showMinimum && current.contourType === 'nonconvex' && (
                <g>
                  {/* Global min */}
                  <circle cx={sx(0)} cy={sy(0)} r="5" fill={GREEN} />
                  <text x={sx(0) - 24} y={sy(0) - 10} fill={GREEN} fontSize="9" fontWeight="bold">全局 f=-6</text>
                  {/* Local minima */}
                  <circle cx={sx(1)} cy={sy(0)} r="5" fill={RED} />
                  <text x={sx(1) + 8} y={sy(0) - 6} fill={RED} fontSize="9">局部 f≈-4</text>
                  <circle cx={sx(-1)} cy={sy(1)} r="5" fill={RED} />
                  <text x={sx(-1) - 30} y={sy(1) - 8} fill={RED} fontSize="9">局部 f≈-4</text>
                  {/* Highlighted min */}
                  {current.highlightedMin && (
                    <circle cx={sx(current.highlightedMin[0])} cy={sy(current.highlightedMin[1])} r="9" fill="none" stroke={YELLOW} strokeWidth="2.5">
                      <animate attributeName="r" values="9;12;9" dur="1s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              )}

              {/* Gradient descent path */}
              {!isConvexSet && current.showGrad && current.gdPath && (
                <g>
                  {current.gdPath.map((p, i) => {
                    if (i === 0) return (
                      <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r="4" fill={ORANGE} opacity="0.8" />
                    )
                    return (
                      <g key={i}>
                        <line
                          x1={sx(current.gdPath[i - 1][0])} y1={sy(current.gdPath[i - 1][1])}
                          x2={sx(p[0])} y2={sy(p[1])}
                          stroke={ORANGE} strokeWidth="2" opacity="0.7"
                        />
                        <circle cx={sx(p[0])} cy={sy(p[1])} r="3" fill={ORANGE} opacity="0.8" />
                      </g>
                    )
                  })}
                </g>
              )}
            </svg>
          </VizCard>
        )
      }}
    />
  )
}
