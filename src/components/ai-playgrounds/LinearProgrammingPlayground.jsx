import { useMemo, useCallback } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 500
const H = 350
const PAD = 40

// Colors
const PURPLE = '#8b5cf6'
const ORANGE = '#f97316'
const RED = '#ef4444'
const BLUE = '#3b82f6'
const GREEN = '#10b981'

// Coordinate ranges for standard problem
function getRange(presetId) {
  if (presetId === 'unbounded') return { xMin: 0, xMax: 8, yMin: 0, yMax: 8 }
  if (presetId === 'infeasible') return { xMin: 0, xMax: 6, yMin: 0, yMax: 6 }
  return { xMin: 0, xMax: 6, yMin: 0, yMax: 6 }
}

function sx(x, range) { return PAD + (x - range.xMin) / (range.xMax - range.xMin) * (W - PAD * 2) }
function sy(y, range) { return H - PAD - (y - range.yMin) / (range.yMax - range.yMin) * (H - PAD * 2) }

// Standard LP: max 3x + 2y s.t. x + y <= 4, x + 3y <= 6, x >= 0, y >= 0
// Vertices: (0,0), (4,0), (3,1), (0,2)
// Optimal at (4,0) with obj=12, or (3,1) with obj=11
// Actually: x+y<=4 => y=4-x; x+3y<=6 => x+3(4-x)<=6 => x+12-3x<=6 => -2x<=-6 => x>=3
// At x=3: y=1, obj=11. At x=4: y=0, obj=12. So optimal is (4,0) with obj=12.
// Wait let me recalculate. Feasible region: x+y<=4 and x+3y<=6 with x>=0, y>=0.
// Vertices: (0,0), (4,0), intersection of x+y=4 and x+3y=6 => y=1, x=3 => (3,1), (0,2)
// Objective: max 3x+2y. At (4,0)=12, at (3,1)=11, at (0,2)=4, at (0,0)=0. Optimal: (4,0) with value 12.

function computeStandardSteps() {
  return [
    { description: '线性规划问题: max 3x + 2y，约束条件: x + y ≤ 4, x + 3y ≤ 6, x ≥ 0, y ≥ 0', phase: 'intro', constraints: [], feasible: null, objLine: null, optimal: null },
    { description: '绘制第一个约束: x + y ≤ 4（红色线及其下方区域）', phase: 'constraint', constraints: [0], feasible: null, objLine: null, optimal: null },
    { description: 'x + y = 4 与坐标轴交点为 (4, 0) 和 (0, 4)', phase: 'constraint', constraints: [0], feasible: null, objLine: null, optimal: null },
    { description: '绘制第二个约束: x + 3y ≤ 6（蓝色线及其下方区域）', phase: 'constraint', constraints: [0, 1], feasible: null, objLine: null, optimal: null },
    { description: 'x + 3y = 6 与坐标轴交点为 (6, 0) 和 (0, 2)', phase: 'constraint', constraints: [0, 1], feasible: null, objLine: null, optimal: null },
    { description: '非负约束 x ≥ 0, y ≥ 0 将可行域限制在第一象限', phase: 'constraint', constraints: [0, 1], feasible: null, objLine: null, optimal: null },
    { description: '确定可行域: 所有约束同时满足的凸多边形', phase: 'feasible', constraints: [0, 1], feasible: 'show', objLine: null, optimal: null },
    { description: '可行域顶点: (0,0), (4,0), (3,1), (0,2)', phase: 'vertices', constraints: [0, 1], feasible: 'show', objLine: null, optimal: null, vertices: [[0,0],[4,0],[3,1],[0,2]] },
    { description: '绘制目标函数等值线: 3x + 2y = c，c 取不同值', phase: 'obj', constraints: [0, 1], feasible: 'show', objLine: 2, optimal: null, vertices: [[0,0],[4,0],[3,1],[0,2]] },
    { description: '等值线向右上方移动，c 值增大', phase: 'obj', constraints: [0, 1], feasible: 'show', objLine: 5, optimal: null, vertices: [[0,0],[4,0],[3,1],[0,2]] },
    { description: '等值线继续移动: 3x + 2y = 8', phase: 'obj', constraints: [0, 1], feasible: 'show', objLine: 8, optimal: null, vertices: [[0,0],[4,0],[3,1],[0,2]] },
    { description: '等值线到达可行域边界', phase: 'obj', constraints: [0, 1], feasible: 'show', objLine: 11, optimal: null, vertices: [[0,0],[4,0],[3,1],[0,2]] },
    { description: '等值线到达最远顶点 (3, 1)，目标值 = 11', phase: 'near', constraints: [0, 1], feasible: 'show', objLine: 11, optimal: null, vertices: [[0,0],[4,0],[3,1],[0,2]] },
    { description: '继续移动等值线至顶点 (4, 0)，目标值 = 12', phase: 'optimal', constraints: [0, 1], feasible: 'show', objLine: 12, optimal: [4, 0], vertices: [[0,0],[4,0],[3,1],[0,2]] },
    { description: '最优解: x = 4, y = 0，最大目标函数值 = 12', phase: 'final', constraints: [0, 1], feasible: 'show', objLine: 12, optimal: [4, 0], vertices: [[0,0],[4,0],[3,1],[0,2]] },
    { description: '线性规划最优解一定在可行域顶点上取得（凸集基本定理）', phase: 'final', constraints: [0, 1], feasible: 'show', objLine: 12, optimal: [4, 0], vertices: [[0,0],[4,0],[3,1],[0,2]] },
    { description: '各顶点目标值: (0,0)→0, (4,0)→12, (3,1)→11, (0,2)→4，最优为 (4,0)', phase: 'compare', constraints: [0, 1], feasible: 'show', objLine: 12, optimal: [4, 0], vertices: [[0,0],[4,0],[3,1],[0,2]], showAllValues: true },
  ]
}

// Unbounded LP: max x + y s.t. x - y <= 2, x >= 0
function computeUnboundedSteps() {
  return [
    { description: '无界线性规划: max x + y，约束: x - y ≤ 2, x ≥ 0', phase: 'intro', constraints: [0], feasible: null, objLine: null, optimal: null },
    { description: '绘制约束 x - y ≤ 2: 线下方为半可行域', phase: 'constraint', constraints: [0], feasible: null, objLine: null, optimal: null },
    { description: '约束线 x - y = 2 经过 (0,-2) 和 (2,0)', phase: 'constraint', constraints: [0], feasible: null, objLine: null, optimal: null },
    { description: '非负约束 x ≥ 0 限制在右半平面', phase: 'constraint', constraints: [0], feasible: null, objLine: null, optimal: null },
    { description: '可行域: x ≥ 0 且 x - y ≤ 2', phase: 'feasible-outline', constraints: [0], feasible: null, objLine: null, optimal: null },
    { description: '可行域向右上方无限延伸，无上界', phase: 'feasible', constraints: [0], feasible: 'unbounded', objLine: null, optimal: null },
    { description: '绘制目标等值线 x + y = 2', phase: 'obj', constraints: [0], feasible: 'unbounded', objLine: 2, optimal: null },
    { description: '绘制目标等值线 x + y = 4', phase: 'obj', constraints: [0], feasible: 'unbounded', objLine: 4, optimal: null },
    { description: '等值线向右上方移动，c 不断增大', phase: 'obj', constraints: [0], feasible: 'unbounded', objLine: 6, optimal: null },
    { description: '等值线继续外移: x + y = 8', phase: 'obj', constraints: [0], feasible: 'unbounded', objLine: 8, optimal: null },
    { description: '由于可行域无界，等值线可以无限外移', phase: 'obj', constraints: [0], feasible: 'unbounded', objLine: 10, optimal: null },
    { description: '可行域中不存在使目标函数有限最大的点', phase: 'unbounded-proof', constraints: [0], feasible: 'unbounded', objLine: 10, optimal: null },
    { description: '单纯形法检测: 存在入基变量但无出基变量', phase: 'simplex', constraints: [0], feasible: 'unbounded', objLine: 10, optimal: null },
    { description: '结论: 此问题无有限最优解（无界解）', phase: 'final', constraints: [0], feasible: 'unbounded', objLine: 10, optimal: null, infeasible: false, unbounded: true },
    { description: '无界解意味着模型可能缺少约束条件', phase: 'implication', constraints: [0], feasible: 'unbounded', objLine: 10, optimal: null, infeasible: false, unbounded: true },
  ]
}

// Infeasible LP: min x s.t. x >= 5, x <= 3
function computeInfeasibleSteps() {
  return [
    { description: '无可行解问题: min x，约束: x ≥ 5, x ≤ 3', phase: 'intro', constraints: [0, 1], feasible: null, objLine: null, optimal: null },
    { description: '问题看似简单，但约束存在根本矛盾', phase: 'analyze', constraints: [0, 1], feasible: null, objLine: null, optimal: null },
    { description: '绘制约束 x ≥ 5: 数轴上 5 的右侧区域（红色）', phase: 'constraint', constraints: [0], feasible: null, objLine: null, optimal: null },
    { description: '约束 x ≥ 5 的可行点: {5, 6, 7, ...}', phase: 'constraint-detail', constraints: [0], feasible: null, objLine: null, optimal: null },
    { description: '绘制约束 x ≤ 3: 数轴上 3 的左侧区域（蓝色）', phase: 'constraint2', constraints: [0, 1], feasible: null, objLine: null, optimal: null },
    { description: '约束 x ≤ 3 的可行点: {..., 1, 2, 3}', phase: 'constraint-detail2', constraints: [0, 1], feasible: null, objLine: null, optimal: null },
    { description: '寻找交集: 需要同时 x ≥ 5 且 x ≤ 3', phase: 'intersection', constraints: [0, 1], feasible: null, objLine: null, optimal: null },
    { description: '两个约束区域不重叠，无公共可行点!', phase: 'feasible', constraints: [0, 1], feasible: 'empty', objLine: null, optimal: null },
    { description: '数学证明: 5 > 3，不存在 x 使得 x ≥ 5 且 x ≤ 3', phase: 'proof', constraints: [0, 1], feasible: 'empty', objLine: null, optimal: null },
    { description: '反证法: 若存在 x 满足，则 5 ≤ x ≤ 3，矛盾', phase: 'contradiction', constraints: [0, 1], feasible: 'empty', objLine: null, optimal: null },
    { description: '单纯形法中: 两阶段法第一阶段无法找到基本可行解', phase: 'simplex', constraints: [0, 1], feasible: 'empty', objLine: null, optimal: null },
    { description: '人工变量无法全部出基 → 判定无可行解', phase: 'simplex-detail', constraints: [0, 1], feasible: 'empty', objLine: null, optimal: null },
    { description: '结论: 可行域为空集，此问题无可行解', phase: 'final', constraints: [0, 1], feasible: 'empty', objLine: null, optimal: null, infeasible: true },
    { description: '无可行解意味着约束条件存在矛盾，需修改模型', phase: 'implication', constraints: [0, 1], feasible: 'empty', objLine: null, optimal: null, infeasible: true },
    { description: 'LP问题三种情况: 有最优解、无界解、无可行解', phase: 'summary', constraints: [0, 1], feasible: 'empty', objLine: null, optimal: null, infeasible: true },
  ]
}

function computeSteps(preset) {
  if (preset.id === 'unbounded') return computeUnboundedSteps()
  if (preset.id === 'infeasible') return computeInfeasibleSteps()
  return computeStandardSteps()
}

export default function LinearProgrammingPlayground() {
  const presets = useMemo(() => [
    { id: 'standard', label: '标准问题' },
    { id: 'unbounded', label: '无界解' },
    { id: 'infeasible', label: '无可行解' },
  ], [])

  const computeStepsFn = useCallback((payload) => computeSteps(payload), [])

  return (
    <PlaygroundShell
      presets={presets}
      initialPresetId="standard"
      computeSteps={computeStepsFn}
      legend={[
        { color: RED, label: '约束 1' },
        { color: BLUE, label: '约束 2' },
        { color: GREEN, label: '可行域' },
        { color: ORANGE, label: '等值线' },
        { color: PURPLE, label: '最优点' },
      ]}
      renderViz={({ current, presetId }) => {
        const range = getRange(presetId)
        const isStandard = presetId === 'standard'
        const isUnbounded = presetId === 'unbounded'

        // Standard feasible polygon: (0,0)-(4,0)-(3,1)-(0,2)
        const feasibleStandard = [
          [sx(0, range), sy(0, range)],
          [sx(4, range), sy(0, range)],
          [sx(3, range), sy(1, range)],
          [sx(0, range), sy(2, range)],
        ].map(p => `${p[0]},${p[1]}`).join(' ')

        // Objective line for standard: 3x + 2y = c => y = (c - 3x)/2
        const objY = (x, c) => (c - 3 * x) / 2

        const showConstraint = (idx) => current.constraints && current.constraints.includes(idx)
        const showFeasible = current.feasible === 'show' || current.feasible === 'unbounded'

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
              {[1, 2, 3, 4, 5, 6].map(v => (
                <g key={`tick-${v}`}>
                  <line x1={sx(v, range)} y1={H - PAD} x2={sx(v, range)} y2={H - PAD + 4} stroke="var(--border)" strokeWidth="1" />
                  <text x={sx(v, range)} y={H - PAD + 16} textAnchor="middle" fill="var(--text-tertiary)" fontSize="9">{v}</text>
                  <line x1={PAD - 4} y1={sy(v, range)} x2={PAD} y2={sy(v, range)} stroke="var(--border)" strokeWidth="1" />
                  <text x={PAD - 8} y={sy(v, range) + 3} textAnchor="end" fill="var(--text-tertiary)" fontSize="9">{v}</text>
                </g>
              ))}

              {/* Constraint 1: x + y = 4 (standard) or x - y = 2 (unbounded) */}
              {showConstraint(0) && isStandard && (
                <line x1={sx(0, range)} y1={sy(4, range)} x2={sx(4, range)} y2={sy(0, range)} stroke={RED} strokeWidth="2.5" opacity="0.9" />
              )}
              {showConstraint(0) && isUnbounded && (
                <line x1={sx(0, range)} y1={sy(-2, range)} x2={sx(range.xMax, range)} y2={sy(range.xMax - 2, range)} stroke={RED} strokeWidth="2.5" opacity="0.9" />
              )}
              {showConstraint(0) && presetId === 'infeasible' && (
                <line x1={sx(5, range)} y1={PAD} x2={sx(5, range)} y2={H - PAD} stroke={RED} strokeWidth="2.5" opacity="0.9" />
              )}

              {/* Constraint 2: x + 3y = 6 (standard) or x <= 3 (infeasible) */}
              {showConstraint(1) && isStandard && (
                <line x1={sx(0, range)} y1={sy(2, range)} x2={sx(6, range)} y2={sy(0, range)} stroke={BLUE} strokeWidth="2.5" opacity="0.9" />
              )}
              {showConstraint(1) && presetId === 'infeasible' && (
                <line x1={sx(3, range)} y1={PAD} x2={sx(3, range)} y2={H - PAD} stroke={BLUE} strokeWidth="2.5" opacity="0.9" />
              )}

              {/* Feasible region (standard) */}
              {showFeasible && isStandard && current.feasible === 'show' && (
                <polygon points={feasibleStandard} fill={GREEN} opacity="0.15" stroke={GREEN} strokeWidth="1" strokeOpacity="0.4" />
              )}

              {/* Feasible region (unbounded) - show arrow hints */}
              {current.feasible === 'unbounded' && (
                <g>
                  <polygon
                    points={`${sx(0, range)},${sy(0, range)} ${sx(range.xMax, range)},${sy(0, range)} ${sx(range.xMax, range)},${sy(Math.max(0, range.xMax - 2), range)} ${sx(4, range)},${sy(2, range)} ${sx(0, range)},${sy(0, range)}`}
                    fill={GREEN} opacity="0.1" stroke={GREEN} strokeWidth="1" strokeDasharray="6 4" strokeOpacity="0.3"
                  />
                  <text x={sx(6, range) - 20} y={sy(3, range)} fill={GREEN} fontSize="11" opacity="0.7">→ 无界</text>
                </g>
              )}

              {/* Empty feasible region indicator (infeasible) */}
              {current.feasible === 'empty' && (
                <g>
                  <rect x={sx(3, range) + 2} y={PAD} width={sx(5, range) - sx(3, range) - 4} height={H - PAD * 2} fill={RED} opacity="0.06" />
                  <text x={W / 2} y={H / 2} textAnchor="middle" fill={RED} fontSize="13" opacity="0.8">可行域为空</text>
                </g>
              )}

              {/* Vertices */}
              {current.vertices && current.vertices.map((v, i) => (
                <circle key={i} cx={sx(v[0], range)} cy={sy(v[1], range)} r="5" fill={GREEN} stroke="var(--surface)" strokeWidth="2" />
              ))}

              {/* Objective line */}
              {current.objLine != null && isStandard && (() => {
                const c = current.objLine
                const yAt0 = objY(0, c)
                const yAt6 = objY(6, c)
                if (yAt0 < -2 || yAt6 < -2) return null
                return (
                  <line
                    x1={sx(0, range)} y1={sy(Math.min(yAt0, 6), range)}
                    x2={sx(Math.min(6, (c) / 3), range)} y2={sy(Math.max(0, yAt6), range)}
                    stroke={ORANGE} strokeWidth="2" strokeDasharray="8 5" opacity="0.85"
                  />
                )
              })()}

              {current.objLine != null && isUnbounded && (() => {
                const c = current.objLine
                const yAt0 = c
                const xAt0 = 0
                if (yAt0 > range.yMax + 2) return null
                return (
                  <line
                    x1={sx(xAt0, range)} y1={sy(Math.min(yAt0, range.yMax), range)}
                    x2={sx(Math.min(c, range.xMax), range)} y2={sy(0, range)}
                    stroke={ORANGE} strokeWidth="2" strokeDasharray="8 5" opacity="0.85"
                  />
                )
              })()}

              {/* Objective line label */}
              {current.objLine != null && (
                <text x={sx(isStandard ? 0.3 : 0.3, range)} y={sy(Math.min(isStandard ? objY(0, current.objLine) : current.objLine, range.yMax - 0.5), range) - 6} fill={ORANGE} fontSize="10" opacity="0.9">
                  c = {current.objLine}
                </text>
              )}

              {/* Optimal point */}
              {current.optimal && (
                <g>
                  <circle cx={sx(current.optimal[0], range)} cy={sy(current.optimal[1], range)} r="9" fill="none" stroke={PURPLE} strokeWidth="3">
                    <animate attributeName="r" values="9;12;9" dur="1s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={sx(current.optimal[0], range)} cy={sy(current.optimal[1], range)} r="5" fill={PURPLE} />
                  <text x={sx(current.optimal[0], range) + 14} y={sy(current.optimal[1], range) - 6} fill={PURPLE} fontSize="11" fontWeight="bold">
                    最优 ({current.optimal[0]}, {current.optimal[1]})
                  </text>
                </g>
              )}

              {/* Show all vertex values */}
              {current.showAllValues && current.vertices && (
                <g>
                  {[[0,0,0],[4,0,12],[3,1,11],[0,2,4]].map((v, i) => (
                    <text key={i} x={sx(v[0], range) + 8} y={sy(v[1], range) + 16} fill="var(--text-secondary)" fontSize="9">
                      f={v[2]}
                    </text>
                  ))}
                </g>
              )}

              {/* Infeasible/unbounded banner */}
              {current.infeasible && (
                <rect x={W / 2 - 70} y={H / 2 - 14} width={140} height={28} rx="6" fill={RED} opacity="0.15" />
              )}
              {current.unbounded && (
                <g>
                  <rect x={W / 2 - 70} y={H / 2 - 14} width={140} height={28} rx="6" fill={ORANGE} opacity="0.12" />
                  <text x={W / 2} y={H / 2 + 4} textAnchor="middle" fill={ORANGE} fontSize="12" fontWeight="bold">无界解</text>
                </g>
              )}
            </svg>
          </VizCard>
        )
      }}
    />
  )
}
