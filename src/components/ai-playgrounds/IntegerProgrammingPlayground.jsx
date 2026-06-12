import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520, H = 320, PAD = 36
// coordinate range [0, 6]
const sx = (v) => PAD + (v / 6) * (W - 2 * PAD)
const sy = (v) => H - PAD - (v / 6) * (H - 2 * PAD)

// Standard: max x+y, 2x+3y<=12, x+y<=5, x,y>=0
// LP optimal: (3,2), obj=5
// IP optimal: (3,2), obj=5 (happens to be integer)
// Feasible integer points in region
const STANDARD = {
  constraints: '2x+3y≤12, x+y≤5',
  feasibleRegion: [[0,0],[5,0],[3,2],[0,4]],
  lpOpt: [3, 2], lpVal: 5,
  ipOpt: [3, 2], ipVal: 5,
  intPoints: [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[0,1],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2],[0,3],[1,3],[2,3],[0,4]],
}
// Knapsack-like: max 3x+2y, x+y<=4, x<=3, y<=3
const KNAPSACK = {
  constraints: 'x+y≤4, x≤3, y≤3',
  feasibleRegion: [[0,0],[3,0],[3,1],[1,3],[0,3]],
  lpOpt: [3, 1], lpVal: 11,
  ipOpt: [3, 1], ipVal: 11,
  intPoints: [[0,0],[1,0],[2,0],[3,0],[0,1],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[0,3],[1,3]],
}
// Assignment-like: max x+y, x+2y<=7, 2x+y<=8
const ASSIGN = {
  constraints: 'x+2y≤7, 2x+y≤8',
  feasibleRegion: [[0,0],[4,0],[3,2],[0,3.5]],
  lpOpt: [3, 2], lpVal: 5,
  ipOpt: [3, 2], ipVal: 5,
  intPoints: [[0,0],[1,0],[2,0],[3,0],[4,0],[0,1],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[3,2],[0,3],[1,3],[2,3]],
}

const PRESETS_DATA = { standard: STANDARD, knapsack: KNAPSACK, assignment: ASSIGN }

function isFeasible(x, y, preset) {
  if (preset.id === 'standard') return 2*x + 3*y <= 12.01 && x + y <= 5.01 && x >= -0.01 && y >= -0.01
  if (preset.id === 'knapsack') return x + y <= 4.01 && x <= 3.01 && y <= 3.01 && x >= -0.01 && y >= -0.01
  return x + 2*y <= 7.01 && 2*x + y <= 8.01 && x >= -0.01 && y >= -0.01
}

function computeSteps(preset) {
  const data = PRESETS_DATA[preset.id] || STANDARD
  const steps = []

  // Step 1: feasible region
  steps.push({
    description: `连续可行域：由约束 ${data.constraints}, x,y≥0 围成的区域。`,
    phase: 'region', showLattice: false, showFeasibleInt: false, showLP: false, showIP: false, data,
  })
  // Step 2: integer lattice
  steps.push({
    description: '整数格点：所有整数坐标点。需要找出其中满足约束的点。',
    phase: 'lattice', showLattice: true, showFeasibleInt: false, showLP: false, showIP: false, data,
  })
  // Step 3: feasible integer points
  steps.push({
    description: `可行整数点（绿色）：共 ${data.intPoints.length} 个整数点满足所有约束。`,
    phase: 'feasible-int', showLattice: true, showFeasibleInt: true, showLP: false, showIP: false, data,
  })
  // Step 4: LP relaxation optimum
  steps.push({
    description: `LP 松弛最优解（红色星）：(${data.lpOpt[0]}, ${data.lpOpt[1]})，目标值 = ${data.lpVal}。`,
    phase: 'lp-opt', showLattice: true, showFeasibleInt: true, showLP: true, showIP: false, data,
  })
  // Step 5: IP optimum
  const gap = data.lpVal - data.ipVal
  steps.push({
    description: `IP 最优解（绿色星）：(${data.ipOpt[0]}, ${data.ipOpt[1]})，目标值 = ${data.ipVal}。整数间隙 = ${gap.toFixed(2)}。`,
    phase: 'ip-opt', showLattice: true, showFeasibleInt: true, showLP: true, showIP: true, data,
  })
  // Step 6: gap summary
  steps.push({
    description: gap < 0.01
      ? 'LP 松弛与 IP 最优解重合，整数间隙为零。这是理想情况。'
      : `整数间隙 = ${gap.toFixed(2)}。LP 松弛提供了 IP 目标值的上界。`,
    phase: 'done', showLattice: true, showFeasibleInt: true, showLP: true, showIP: true, data,
  })

  return steps
}

export default function IntegerProgrammingPlayground() {
  const presets = useMemo(() => [
    { id: 'standard', label: '标准 IP' },
    { id: 'knapsack', label: '背包型' },
    { id: 'assignment', label: '指派型' },
  ], [])

  const computeStepsFn = useCallback((preset) => computeSteps(preset), [])

  const legend = useMemo(() => [
    { color: '#fbbf24', label: '连续可行域' },
    { color: '#22c55e', label: '可行整数点' },
    { color: '#94a3b8', label: '不可行格点' },
    { color: '#ef4444', label: 'LP 最优' },
    { color: '#22c55e', label: 'IP 最优' },
  ], [])

  // Generate all integer grid points in [0,6]x[0,6]
  const gridPoints = useMemo(() => {
    const pts = []
    for (let x = 0; x <= 6; x++) for (let y = 0; y <= 6; y++) pts.push([x, y])
    return pts
  }, [])

  return (
    <PlaygroundShell
      presets={presets}
      computeSteps={computeStepsFn}
      legend={legend}
      renderViz={({ current }) => {
        const { data } = current
        const starPath = (cx, cy, r) => {
          let d = ''
          for (let i = 0; i < 5; i++) {
            const a1 = (i * 72 - 90) * Math.PI / 180
            const a2 = ((i * 72) + 36 - 90) * Math.PI / 180
            d += `${i === 0 ? 'M' : 'L'}${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} `
            d += `L${cx + r * 0.4 * Math.cos(a2)},${cy + r * 0.4 * Math.sin(a2)} `
          }
          return d + 'Z'
        }

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 520 }}>
                {/* axes */}
                <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
                <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
                {[1,2,3,4,5].map(v => (
                  <g key={v}>
                    <text x={sx(v)} y={H - PAD + 14} textAnchor="middle" fill="var(--text-tertiary)" fontSize="10">{v}</text>
                    <text x={PAD - 10} y={sy(v) + 4} textAnchor="end" fill="var(--text-tertiary)" fontSize="10">{v}</text>
                  </g>
                ))}
                {/* feasible region */}
                {data.feasibleRegion.length > 0 && (
                  <polygon
                    points={data.feasibleRegion.map(v => `${sx(v[0])},${sy(v[1])}`).join(' ')}
                    fill="#fbbf24" fillOpacity="0.15" stroke="#fbbf24" strokeWidth="1.5"
                  />
                )}
                {/* integer lattice */}
                {current.showLattice && gridPoints.map(([x, y]) => {
                  const feas = isFeasible(x, y, current)
                  const show = current.showFeasibleInt
                  return (
                    <circle key={`${x}-${y}`} cx={sx(x)} cy={sy(y)} r="3"
                      fill={show ? (feas ? '#22c55e' : '#94a3b8') : 'var(--border)'}
                      opacity={show ? (feas ? 0.8 : 0.3) : 0.4}
                    />
                  )
                })}
                {/* LP optimal star */}
                {current.showLP && (
                  <path d={starPath(sx(data.lpOpt[0]), sy(data.lpOpt[1]), 12)}
                    fill="#ef4444" stroke="white" strokeWidth="1.5" />
                )}
                {/* IP optimal star */}
                {current.showIP && (
                  <path d={starPath(sx(data.ipOpt[0]), sy(data.ipOpt[1]), 12)}
                    fill="#22c55e" stroke="white" strokeWidth="1.5">
                    {current.phase === 'done' && <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" />}
                  </path>
                )}
                {/* objective contour hint */}
                {current.showLP && (
                  <line
                    x1={sx(0)} y1={sy(data.lpVal)}
                    x2={sx(data.lpVal)} y2={sy(0)}
                    stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4,3" opacity="0.4"
                  />
                )}
                <text x={W / 2} y={H - 6} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11">x</text>
                <text x={12} y={H / 2} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11" transform={`rotate(-90, 12, ${H / 2})`}>y</text>
              </svg>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, width: '100%', maxWidth: 440 }}>
                <InfoBox label="LP 最优" value={`(${data.lpOpt[0]},${data.lpOpt[1]}) = ${data.lpVal}`} />
                <InfoBox label="IP 最优" value={`(${data.ipOpt[0]},${data.ipOpt[1]}) = ${data.ipVal}`} />
                <InfoBox label="整数间隙" value={(data.lpVal - data.ipVal).toFixed(2)} />
                <InfoBox label="可行整数点" value={data.intPoints.length} />
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
