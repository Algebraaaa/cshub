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

const X_RANGE = [-1, 5]
const Y_RANGE = [-1, 5]

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }

// Problem 1 (equality): min f(x,y) = (x-3)^2 + (y-3)^2 s.t. x + y = 4
// Solution: x = y = 2, λ = -2
// ∇f = (2(x-3), 2(y-3)), ∇g = (1, 1)
// 2(x-3) = -λ, 2(y-3) = -λ => x=y, x+y=4 => x=y=2

// Problem 2 (inequality): min f(x,y) = (x-3)^2 + (y-3)^2 s.t. x + y <= 2
// Solution: x = y = 1 (constraint is active)
// ∇f = (2(1-3), 2(1-3)) = (-4, -4), ∇g = (1, 1)
// λ = 4 >= 0 (KKT satisfied)

// Problem 3 (multi): min f(x,y) = (x-4)^2 + (y-4)^2 s.t. x <= 2, y <= 1
// Solution: x = 2, y = 1 (both active), λ1 = 4, λ2 = 6

function computeEqualitySteps() {
  const solX = 2, solY = 2
  return [
    { description: '拉格朗日乘子法: min (x-3)²+(y-3)² s.t. x+y=4', phase: 'intro', contours: true, constraint: 'equality', gradF: false, gradG: false, solution: null, lambda: null },
    { description: '目标函数 f(x,y) = (x-3)²+(y-3)²: 以 (3,3) 为中心的圆形等值线', phase: 'contours', contours: true, constraint: null, gradF: false, gradG: false, solution: null, lambda: null },
    { description: '绘制等值线: f = 0.5, 1, 2, 4, 6, 8', phase: 'contours-detail', contours: true, constraint: null, gradF: false, gradG: false, solution: null, lambda: null },
    { description: '等值线越靠内层，函数值越小', phase: 'contours-inner', contours: true, constraint: null, gradF: false, gradG: false, solution: null, lambda: null },
    { description: '无约束最优在 (3,3)，但需要满足约束', phase: 'unconstrained', contours: true, constraint: null, gradF: false, gradG: false, solution: null, lambda: null },
    { description: '添加等式约束: x + y = 4（红色直线）', phase: 'constraint', contours: true, constraint: 'equality', gradF: false, gradG: false, solution: null, lambda: null },
    { description: '可行解必须在这条线上', phase: 'constraint-feasible', contours: true, constraint: 'equality', gradF: false, gradG: false, solution: null, lambda: null },
    { description: '最优解: 等值线与约束线的切点', phase: 'tangent', contours: true, constraint: 'equality', gradF: false, gradG: false, solution: null, lambda: null },
    { description: '几何直觉: 最小等值线恰与约束线相切时取最优', phase: 'geometric', contours: true, constraint: 'equality', gradF: false, gradG: false, solution: null, lambda: null },
    { description: '构造拉格朗日函数: L = f + λg = (x-3)²+(y-3)² + λ(x+y-4)', phase: 'lagrangian', contours: true, constraint: 'equality', gradF: false, gradG: false, solution: null, lambda: null },
    { description: '平稳性条件: ∂L/∂x = 2(x-3)+λ = 0', phase: 'kkt1', contours: true, constraint: 'equality', gradF: true, gradG: false, solution: null, lambda: null },
    { description: '平稳性条件: ∂L/∂y = 2(y-3)+λ = 0', phase: 'kkt2', contours: true, constraint: 'equality', gradF: true, gradG: false, solution: null, lambda: null },
    { description: '约束条件: x + y = 4', phase: 'constraint-eq', contours: true, constraint: 'equality', gradF: true, gradG: false, solution: null, lambda: null },
    { description: '由两式得 x = y，代入约束 x+y=4 得 x=y=2', phase: 'solve', contours: true, constraint: 'equality', gradF: true, gradG: true, solution: [solX, solY], lambda: null },
    { description: '∇f = (-2,-2), ∇g = (1,1), ∇f = -λ∇g', phase: 'grad-opposite', contours: true, constraint: 'equality', gradF: true, gradG: true, solution: [solX, solY], lambda: null },
    { description: '拉格朗日乘子 λ = -2（负值，因目标梯度指向约束外）', phase: 'lambda', contours: true, constraint: 'equality', gradF: true, gradG: true, solution: [solX, solY], lambda: -2 },
    { description: '最优解: (2, 2)，f*=2', phase: 'solution', contours: true, constraint: 'equality', gradF: true, gradG: true, solution: [solX, solY], lambda: -2 },
    { description: '几何意义: 等值线与约束线在切点处法向量共线', phase: 'geometric-meaning', contours: true, constraint: 'equality', gradF: true, gradG: true, solution: [solX, solY], lambda: -2 },
    { description: '等式约束下 λ 可正可负，仅要求梯度共线', phase: 'final', contours: true, constraint: 'equality', gradF: true, gradG: true, solution: [solX, solY], lambda: -2 },
  ]
}

function computeInequalitySteps() {
  const solX = 1, solY = 1
  return [
    { description: 'KKT不等式约束: min (x-3)²+(y-3)² s.t. x+y≤2', phase: 'intro', contours: true, constraint: 'inequality', gradF: false, gradG: false, solution: null, lambda: null, feasible: false },
    { description: '目标函数等值线: 以 (3,3) 为中心的同心圆', phase: 'contours', contours: true, constraint: null, gradF: false, gradG: false, solution: null, lambda: null, feasible: false },
    { description: '等值线越靠内层 f 越小，最优在内层', phase: 'contours-inner', contours: true, constraint: null, gradF: false, gradG: false, solution: null, lambda: null, feasible: false },
    { description: '添加约束 x+y≤2: 红色线下方为可行域', phase: 'constraint', contours: true, constraint: 'inequality', gradF: false, gradG: false, solution: null, lambda: null, feasible: true },
    { description: '可行域为半平面（不等式约束比等式约束的可行域更大）', phase: 'feasible-region', contours: true, constraint: 'inequality', gradF: false, gradG: false, solution: null, lambda: null, feasible: true },
    { description: '无约束最优 (3,3) 不在可行域内，约束一定起作用', phase: 'check-unconstrained', contours: true, constraint: 'inequality', gradF: false, gradG: false, solution: null, lambda: null, feasible: true },
    { description: '约束起作用 (active): 在最优点处 x+y=2 严格等号成立', phase: 'active', contours: true, constraint: 'inequality', gradF: false, gradG: false, solution: null, lambda: null, feasible: true },
    { description: '构造拉格朗日函数: L = (x-3)²+(y-3)² + λ(x+y-2)', phase: 'lagrangian', contours: true, constraint: 'inequality', gradF: false, gradG: false, solution: null, lambda: null, feasible: true },
    { description: 'KKT四条件: (1) 平稳性 ∇f+λ∇g=0', phase: 'kkt1', contours: true, constraint: 'inequality', gradF: true, gradG: false, solution: null, lambda: null, feasible: true },
    { description: 'KKT四条件: (2) 原始可行性 g≤0, (3) 对偶可行性 λ≥0', phase: 'kkt2', contours: true, constraint: 'inequality', gradF: true, gradG: false, solution: null, lambda: null, feasible: true },
    { description: 'KKT四条件: (4) 互补松弛 λg=0', phase: 'kkt3', contours: true, constraint: 'inequality', gradF: true, gradG: true, solution: null, lambda: null, feasible: true },
    { description: '∂L/∂x = 2(x-3)+λ = 0, ∂L/∂y = 2(y-3)+λ = 0', phase: 'kkt-deriv', contours: true, constraint: 'inequality', gradF: true, gradG: true, solution: null, lambda: null, feasible: true },
    { description: '由 x=y 及 x+y=2 得 x=y=1, λ=4 ≥ 0', phase: 'solve', contours: true, constraint: 'inequality', gradF: true, gradG: true, solution: [solX, solY], lambda: 4, feasible: true },
    { description: '∇f=(-4,-4), ∇g=(1,1), ∇f=-λ∇g, λ=4>0', phase: 'grad-opposite', contours: true, constraint: 'inequality', gradF: true, gradG: true, solution: [solX, solY], lambda: 4, feasible: true },
    { description: '互补松弛验证: λ=4>0, g(1,1)=0，约束严格起作用', phase: 'complementarity', contours: true, constraint: 'inequality', gradF: true, gradG: true, solution: [solX, solY], lambda: 4, feasible: true },
    { description: 'KKT四条件全部满足: 平稳性 ✓ 原始可行性 ✓ 对偶可行性 ✓ 互补松弛 ✓', phase: 'verify', contours: true, constraint: 'inequality', gradF: true, gradG: true, solution: [solX, solY], lambda: 4, feasible: true },
    { description: '最优解: (1,1), f*=8, λ=4', phase: 'solution', contours: true, constraint: 'inequality', gradF: true, gradG: true, solution: [solX, solY], lambda: 4, feasible: true },
    { description: '不等式约束的 λ 必须非负（对偶可行性），这是与等式约束的关键区别', phase: 'final', contours: true, constraint: 'inequality', gradF: true, gradG: true, solution: [solX, solY], lambda: 4, feasible: true },
  ]
}

function computeMultiSteps() {
  const solX = 2, solY = 1
  return [
    { description: '多约束KKT: min (x-4)²+(y-4)² s.t. x≤2, y≤1', phase: 'intro', contours: true, constraint: 'multi', gradF: false, gradG: false, solution: null, lambda: null, feasible: false },
    { description: '目标函数等值线: 以 (4,4) 为中心的同心圆', phase: 'contours', contours: true, constraint: null, gradF: false, gradG: false, solution: null, lambda: null, feasible: false },
    { description: '无约束最优 (4,4) 在右上方', phase: 'unconstrained', contours: true, constraint: null, gradF: false, gradG: false, solution: null, lambda: null, feasible: false },
    { description: '约束 g₁: x ≤ 2（蓝色竖线左侧）', phase: 'constraint1', contours: true, constraint: 'multi', gradF: false, gradG: false, solution: null, lambda: null, feasible: false, showG1: true },
    { description: '约束 g₂: y ≤ 1（蓝色横线下方）', phase: 'constraint2', contours: true, constraint: 'multi', gradF: false, gradG: false, solution: null, lambda: null, feasible: true, showG1: true, showG2: true },
    { description: '可行域: x≤2 且 y≤1 的矩形区域', phase: 'feasible', contours: true, constraint: 'multi', gradF: false, gradG: false, solution: null, lambda: null, feasible: true, showG1: true, showG2: true },
    { description: '无约束最优 (4,4) 在可行域外，两约束均可能起作用', phase: 'check', contours: true, constraint: 'multi', gradF: false, gradG: false, solution: null, lambda: null, feasible: true, showG1: true, showG2: true },
    { description: '构造拉格朗日函数: L = (x-4)²+(y-4)² + λ₁(x-2) + λ₂(y-1)', phase: 'lagrangian', contours: true, constraint: 'multi', gradF: false, gradG: false, solution: null, lambda: null, feasible: true, showG1: true, showG2: true },
    { description: 'KKT条件: ∇f + λ₁∇g₁ + λ₂∇g₂ = 0', phase: 'kkt', contours: true, constraint: 'multi', gradF: true, gradG: true, solution: null, lambda: null, feasible: true, showG1: true, showG2: true },
    { description: '∂L/∂x = 2(x-4)+λ₁ = 0', phase: 'kkt-x', contours: true, constraint: 'multi', gradF: true, gradG: true, solution: null, lambda: null, feasible: true, showG1: true, showG2: true },
    { description: '∂L/∂y = 2(y-4)+λ₂ = 0', phase: 'kkt-y', contours: true, constraint: 'multi', gradF: true, gradG: true, solution: null, lambda: null, feasible: true, showG1: true, showG2: true },
    { description: '两约束均起作用: x=2, y=1', phase: 'both-active', contours: true, constraint: 'multi', gradF: true, gradG: true, solution: null, lambda: null, feasible: true, showG1: true, showG2: true },
    { description: '求解: λ₁ = 4 ≥ 0, λ₂ = 6 ≥ 0', phase: 'solve', contours: true, constraint: 'multi', gradF: true, gradG: true, solution: [solX, solY], lambda: [4, 6], feasible: true, showG1: true, showG2: true },
    { description: '验证: ∇f=(-4,-6), λ₁∇g₁=(4,0), λ₂∇g₂=(0,6), 和=(0,0) ✓', phase: 'verify', contours: true, constraint: 'multi', gradF: true, gradG: true, solution: [solX, solY], lambda: [4, 6], feasible: true, showG1: true, showG2: true },
    { description: '互补松弛: λ₁>0, λ₂>0，两约束均严格起作用', phase: 'complementarity', contours: true, constraint: 'multi', gradF: true, gradG: true, solution: [solX, solY], lambda: [4, 6], feasible: true, showG1: true, showG2: true },
    { description: '最优解: (2,1), f*=13, λ₁=4, λ₂=6', phase: 'solution', contours: true, constraint: 'multi', gradF: true, gradG: true, solution: [solX, solY], lambda: [4, 6], feasible: true, showG1: true, showG2: true },
    { description: '灵敏度: λ₂=6 > λ₁=4，y约束更紧（松弛 y 约束收益更大）', phase: 'sensitivity', contours: true, constraint: 'multi', gradF: true, gradG: true, solution: [solX, solY], lambda: [4, 6], feasible: true, showG1: true, showG2: true },
    { description: '多约束KKT: 各约束的 λ 独立，需分别验证非负性和互补松弛', phase: 'final', contours: true, constraint: 'multi', gradF: true, gradG: true, solution: [solX, solY], lambda: [4, 6], feasible: true, showG1: true, showG2: true },
  ]
}

function computeSteps(preset) {
  if (preset.id === 'inequality') return computeInequalitySteps()
  if (preset.id === 'multi') return computeMultiSteps()
  return computeEqualitySteps()
}

// Draw contour circles for f(x,y) = (x-cx)^2 + (y-cy)^2
function ContourCircles({ cx, cy }) {
  const levels_eq = [0.5, 1, 2, 4, 6, 8, 13]
  return (
    <g>
      {levels_eq.map((r2, i) => {
        const r = Math.sqrt(r2)
        const rPx = r * (W - PAD * 2) / (X_RANGE[1] - X_RANGE[0])
        const cxPx = sx(cx)
        const cyPx = sy(cy)
        return (
          <circle key={i}
            cx={cxPx} cy={cyPx} r={rPx}
            fill="none" stroke={PURPLE} strokeWidth="1"
            opacity={0.15 + i * 0.05} strokeDasharray={i === 0 ? 'none' : '4 3'}
          />
        )
      })}
    </g>
  )
}

// Draw gradient arrow
function GradArrow({ fromX, fromY, dx, dy, color, label }) {
  const fromSx = sx(fromX)
  const fromSy = sy(fromY)
  const scale = 20
  const toSx = fromSx + dx * scale
  const toSy = fromSy - dy * scale

  return (
    <g>
      <line x1={fromSx} y1={fromSy} x2={toSx} y2={toSy} stroke={color} strokeWidth="2.5" markerEnd="url(#arrowhead)" />
      <text x={toSx + (dx > 0 ? 6 : -6)} y={toSy - 4} fill={color} fontSize="10" fontWeight="bold" textAnchor={dx > 0 ? 'start' : 'end'}>
        {label}
      </text>
    </g>
  )
}

export default function LagrangeKKTPlayground() {
  const presets = useMemo(() => [
    { id: 'equality', label: '等式约束' },
    { id: 'inequality', label: '不等式约束' },
    { id: 'multi', label: '多约束' },
  ], [])

  const computeStepsFn = useCallback((payload) => computeSteps(payload), [])

  return (
    <PlaygroundShell
      presets={presets}
      initialPresetId="equality"
      computeSteps={computeStepsFn}
      legend={[
        { color: PURPLE, label: '等值线' },
        { color: RED, label: '约束' },
        { color: BLUE, label: '可行域' },
        { color: GREEN, label: '最优解' },
        { color: ORANGE, label: '∇f / ∇g' },
      ]}
      renderViz={({ current, presetId }) => {
        const { contours, constraint, gradF, gradG, solution, lambda, feasible, showG1, showG2 } = current
        const isEq = presetId === 'equality'
        const isIneq = presetId === 'inequality'
        const isMulti = presetId === 'multi'
        const objCx = isMulti ? 4 : 3
        const objCy = isMulti ? 4 : 3

        return (
          <VizCard>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill={ORANGE} />
                </marker>
              </defs>

              {/* Background */}
              <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.03)" rx="4" />

              {/* Axes */}
              <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1.5" />
              <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1.5" />
              <text x={W - PAD + 4} y={H - PAD + 14} fill="var(--text-tertiary)" fontSize="11">x</text>
              <text x={PAD - 4} y={PAD - 8} fill="var(--text-tertiary)" fontSize="11">y</text>

              {/* Axis ticks */}
              {[0, 1, 2, 3, 4].map(v => (
                <g key={v}>
                  <text x={sx(v)} y={H - PAD + 16} textAnchor="middle" fill="var(--text-tertiary)" fontSize="9">{v}</text>
                  <text x={PAD - 8} y={sy(v) + 3} textAnchor="end" fill="var(--text-tertiary)" fontSize="9">{v}</text>
                </g>
              ))}

              {/* Feasible region for inequality */}
              {feasible && isIneq && constraint === 'inequality' && (
                <polygon
                  points={`${sx(-1)},${sy(-1)} ${sx(5)},${sy(-1)} ${sx(5)},${sy(-3)} ${sx(-1)},${sy(-3)}`}
                  fill={BLUE} opacity="0.06"
                />
              )}
              {feasible && isMulti && showG1 && showG2 && (
                <rect
                  x={sx(-1)} y={sy(1)}
                  width={sx(2) - sx(-1)} height={sy(-1) - sy(1)}
                  fill={BLUE} opacity="0.08"
                />
              )}

              {/* Contour circles */}
              {contours && <ContourCircles cx={objCx} cy={objCy} />}

              {/* Constraint lines */}
              {constraint === 'equality' && (
                <line x1={sx(-1)} y1={sy(5)} x2={sx(5)} y2={sy(-1)} stroke={RED} strokeWidth="2.5" opacity="0.85" />
              )}
              {constraint === 'inequality' && (
                <g>
                  <line x1={sx(-1)} y1={sy(3)} x2={sx(3)} y2={sy(-1)} stroke={RED} strokeWidth="2.5" opacity="0.85" />
                  <text x={sx(2.5)} y={sy(0.5)} fill={RED} fontSize="9" opacity="0.8">x+y≤2</text>
                </g>
              )}
              {constraint === 'multi' && showG1 && (
                <line x1={sx(2)} y1={PAD} x2={sx(2)} y2={H - PAD} stroke={BLUE} strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
              )}
              {constraint === 'multi' && showG2 && (
                <line x1={PAD} y1={sy(1)} x2={W - PAD} y2={sy(1)} stroke={BLUE} strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
              )}

              {/* Gradient vectors at solution */}
              {gradF && solution && (
                <GradArrow fromX={solution[0]} fromY={solution[1]}
                  dx={isEq ? -2 : -4} dy={isEq ? -2 : -4}
                  color={ORANGE} label="∇f"
                />
              )}
              {gradG && solution && isEq && (
                <GradArrow fromX={solution[0]} fromY={solution[1]}
                  dx={1} dy={1}
                  color={YELLOW} label="∇g"
                />
              )}
              {gradG && solution && isIneq && (
                <GradArrow fromX={solution[0]} fromY={solution[1]}
                  dx={1} dy={1}
                  color={YELLOW} label="∇g"
                />
              )}
              {gradG && solution && isMulti && (
                <g>
                  <GradArrow fromX={solution[0]} fromY={solution[1]} dx={-4} dy={-6} color={ORANGE} label="∇f" />
                  <GradArrow fromX={solution[0]} fromY={solution[1]} dx={1} dy={0} color={YELLOW} label="∇g₁" />
                  <GradArrow fromX={solution[0]} fromY={solution[1]} dx={0} dy={1} color={YELLOW} label="∇g₂" />
                </g>
              )}

              {/* Solution point */}
              {solution && (
                <g>
                  <circle cx={sx(solution[0])} cy={sy(solution[1])} r="8" fill="none" stroke={GREEN} strokeWidth="2.5">
                    <animate attributeName="r" values="8;11;8" dur="1s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={sx(solution[0])} cy={sy(solution[1])} r="4" fill={GREEN} />
                  <text x={sx(solution[0]) + 12} y={sy(solution[1]) - 8} fill={GREEN} fontSize="11" fontWeight="bold">
                    ({solution[0]}, {solution[1]})
                  </text>
                </g>
              )}

              {/* Lambda display */}
              {lambda != null && solution && (
                <text x={W - PAD} y={PAD + 16} textAnchor="end" fill={ORANGE} fontSize="11">
                  {Array.isArray(lambda) ? `λ₁=${lambda[0]}, λ₂=${lambda[1]}` : `λ=${lambda}`}
                </text>
              )}

              {/* Unconstrained optimum marker */}
              {constraint && (
                <circle cx={sx(objCx)} cy={sy(objCy)} r="3" fill={PURPLE} opacity="0.5" />
              )}
            </svg>
          </VizCard>
        )
      }}
    />
  )
}
