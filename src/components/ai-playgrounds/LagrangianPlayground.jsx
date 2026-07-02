import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520, H = 320, PAD = 36
const sx = (v) => PAD + ((v + 0.5) / 2) * (W - 2 * PAD)  // range [-0.5, 1.5]
const sy = (v) => H - PAD - ((v + 0.5) / 2) * (H - 2 * PAD)

// f(x,y) = x²+y², constraint g(x,y) = x+y-1 = 0
// Optimal: x=0.5, y=0.5, λ=1, f=0.5
// ∇f = (2x, 2y), ∇g = (1, 1)
// ∇f = λ∇g → 2x=λ, 2y=λ → x=y, x+y=1 → x=y=0.5, λ=1

function contourPath(level) {
  // circle x²+y²=level → radius = sqrt(level)
  const r = Math.sqrt(level)
  const cx = sx(0), cy = sy(0)
  const rxPx = (r / 2) * (W - 2 * PAD)
  const ryPx = (r / 2) * (H - 2 * PAD)
  return `M${cx - rxPx},${cy} A${rxPx},${ryPx} 0 1,1 ${cx + rxPx},${cy} A${rxPx},${ryPx} 0 1,1 ${cx - rxPx},${cy}`
}

function computeSteps() {
  const steps = []
  const lambdas = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.5]

  // Step 1: show contours
  steps.push({
    description: '目标函数 f(x,y) = x² + y² 的等高线。圆心在原点，半径越大值越大。',
    phase: 'contours', lambda: null, point: null, gradF: null, gradG: null, align: false,
  })
  // Step 2: show constraint
  steps.push({
    description: '约束 g(x,y) = x + y - 1 = 0，即直线 x + y = 1。最优解在此直线上。',
    phase: 'constraint', lambda: null, point: null, gradF: null, gradG: null, align: false,
  })

  // Steps 3-8: try different λ
  for (const lam of lambdas) {
    const x = lam / 2, y = lam / 2
    const violation = Math.abs(x + y - 1)
    const aligned = violation < 0.01
    steps.push({
      description: aligned
        ? `λ = ${lam.toFixed(1)}：梯度对齐！∇f = (${(2*x).toFixed(2)}, ${(2*y).toFixed(2)})，λ∇g = (${lam.toFixed(2)}, ${lam.toFixed(2)})。找到最优解！`
        : `λ = ${lam.toFixed(1)}：∇f = (${(2*x).toFixed(2)}, ${(2*y).toFixed(2)})，λ∇g = (${lam.toFixed(2)}, ${lam.toFixed(2)})，约束违反 = ${violation.toFixed(3)}`,
      phase: 'search', lambda: lam, point: [x, y],
      gradF: [2 * x, 2 * y], gradG: [lam, lam],
      align: aligned,
    })
  }

  // Final: optimal
  steps.push({
    description: '最优解 x=0.5, y=0.5, λ*=1。f(0.5, 0.5) = 0.5。梯度完全对齐，KKT 条件满足。',
    phase: 'optimal', lambda: 1, point: [0.5, 0.5],
    gradF: [1, 1], gradG: [1, 1], align: true,
  })

  return steps
}

export default function LagrangianPlayground() {
  const presets = useMemo(() => [
    { id: 'equality', label: '等式约束' },
    { id: 'inequality', label: '不等式约束 (KKT)' },
    { id: 'multi', label: '多约束' },
  ], [])

  const computeStepsFn = useCallback((preset) => computeSteps(preset), [])

  const legend = useMemo(() => [
    { color: '#8b5cf6', label: 'f 等高线' },
    { color: '#38bdf8', label: '约束 g=0' },
    { color: '#ef4444', label: '∇f' },
    { color: '#38bdf8', label: 'λ∇g' },
    { color: '#f97316', label: '最优点' },
  ], [])

  const levels = [0.1, 0.25, 0.5, 1.0, 1.5]

  return (
    <PlaygroundShell
      presets={presets}
      computeSteps={computeStepsFn}
      legend={legend}
      renderViz={({ current }) => {
        const arrowScale = 40
        const px = current.point ? sx(current.point[0]) : 0
        const py = current.point ? sy(current.point[1]) : 0

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 520 }}>
                <defs>
                  <marker id="arr-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
                  </marker>
                  <marker id="arr-blue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
                  </marker>
                </defs>
                {/* axes */}
                <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
                <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
                {/* contours */}
                {levels.map((l, i) => (
                  <path key={i} d={contourPath(l)} fill="none" stroke="#8b5cf6" strokeWidth="1.2" opacity={0.3 + i * 0.1} />
                ))}
                {/* constraint line x+y=1 */}
                {(current.phase !== 'contours') && (
                  <line
                    x1={sx(0)} y1={sy(1)} x2={sx(1)} y2={sy(0)}
                    stroke="#38bdf8" strokeWidth="2" strokeDasharray="6,3"
                  />
                )}
                {/* gradient arrows */}
                {current.gradF && current.point && (
                  <>
                    <line x1={px} y1={py}
                      x2={px + current.gradF[0] * arrowScale} y2={py - current.gradF[1] * arrowScale}
                      stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#arr-red)" />
                    <line x1={px} y1={py}
                      x2={px + current.gradG[0] * arrowScale} y2={py - current.gradG[1] * arrowScale}
                      stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arr-blue)" />
                  </>
                )}
                {/* current point */}
                {current.point && (
                  <circle cx={px} cy={py} r={current.align ? 9 : 6}
                    fill={current.align ? '#f97316' : '#8b5cf6'} stroke="white" strokeWidth="2">
                    {current.align && <animate attributeName="r" values="9;11;9" dur="1s" repeatCount="indefinite" />}
                  </circle>
                )}
                <text x={W / 2} y={H - 6} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11">x</text>
                <text x={12} y={H / 2} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11" transform={`rotate(-90, 12, ${H / 2})`}>y</text>
              </svg>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, width: '100%', maxWidth: 440 }}>
                <InfoBox label="λ" value={current.lambda !== null ? current.lambda.toFixed(2) : '—'} />
                <InfoBox label="f(x,y)" value={current.point ? (current.point[0] ** 2 + current.point[1] ** 2).toFixed(4) : '—'} />
                <InfoBox label="约束违反" value={current.point ? Math.abs(current.point[0] + current.point[1] - 1).toFixed(4) : '—'} />
                <InfoBox label="梯度对齐" value={current.align ? '是' : '否'} />
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}
