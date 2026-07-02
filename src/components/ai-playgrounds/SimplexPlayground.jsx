import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520, H = 320, PAD = 36
const sx = (v) => PAD + (v / 5) * (W - 2 * PAD)
const sy = (v) => H - PAD - (v / 5) * (H - 2 * PAD)

// Standard: max 3x+2y, x+y<=4, x<=3, y<=3, x,y>=0
// Vertices: (0,0),(3,0),(3,1),(1,3),(0,3)
// Optimal at (3,1) = 11
const STANDARD = {
  vertices: [[0,0],[3,0],[3,1],[1,3],[0,3]],
  optimal: [3,1], objVal: 11,
  c: [3,2], constraints: 'x+y≤4, x≤3, y≤3',
}
// Degenerate: extra constraint makes vertex degenerate
const DEGENERATE = {
  vertices: [[0,0],[3,0],[3,1],[1,3],[0,3]],
  optimal: [3,1], objVal: 11,
  c: [3,2], constraints: 'x+y≤4, x≤3, y≤3 (退化)',
}
// Infeasible: x+y≥10 added
const INFEASIBLE = {
  vertices: [], optimal: null, objVal: null,
  c: [3,2], constraints: 'x+y≤4, x+y≥10 (不可行)',
}

function computeSteps(preset) {
  if (preset.id === 'infeasible') {
    return [
      { description: '问题不可行：约束 x+y≤4 与 x+y≥10 矛盾，无可行域。', type: 'infeasible', vertex: null, objVal: null, path: [], phase: 'done' },
    ]
  }
  const verts = preset.vertices
  const obj = (v) => preset.c[0] * v[0] + preset.c[1] * v[1]
  const steps = []
  // Step 1: show feasible region
  steps.push({ description: '可行域：由约束 x+y≤4, x≤3, y≤3, x,y≥0 围成的多边形区域。', type: 'region', vertex: null, objVal: null, path: [], phase: 'region' })
  // Step 2: start at origin
  steps.push({ description: '单纯形法从原点 (0,0) 出发，目标值 = 0。', type: 'start', vertex: [0,0], objVal: 0, path: [[0,0]], phase: 'start' })
  // Steps 3-5: pivot along vertices
  for (let i = 1; i < verts.length; i++) {
    const v = verts[i]
    const val = obj(v)
    const prev = verts[i - 1]
    const improved = val > obj(prev)
    steps.push({
      description: `转轴到顶点 (${v[0]},${v[1]})，目标值 = ${val}${improved ? '（改善）' : '（不改善）'}。`,
      type: improved ? 'pivot' : 'no-improve',
      vertex: v, objVal: val,
      path: verts.slice(0, i + 1).map(p => [...p]),
      phase: 'pivot',
    })
  }
  // Final: optimal
  steps.push({
    description: `最优解 (${preset.optimal[0]},${preset.optimal[1]})，目标值 = ${preset.objVal}。单纯形法终止。`,
    type: 'optimal', vertex: preset.optimal, objVal: preset.objVal,
    path: verts.map(p => [...p]), phase: 'done',
  })
  return steps
}

const PRESETS_DATA = { standard: STANDARD, degenerate: DEGENERATE, infeasible: INFEASIBLE }

export default function SimplexPlayground() {
  const presets = useMemo(() => [
    { id: 'standard', label: '标准问题', ...STANDARD },
    { id: 'degenerate', label: '退化情形', ...DEGENERATE },
    { id: 'infeasible', label: '不可行', ...INFEASIBLE },
  ], [])

  const computeStepsFn = useCallback((preset) => {
    const data = PRESETS_DATA[preset.id] || STANDARD
    return computeSteps({ ...data, id: preset.id })
  }, [])

  const legend = useMemo(() => [
    { color: '#fbbf24', label: '可行域' },
    { color: '#8b5cf6', label: '顶点' },
    { color: '#f97316', label: '当前顶点' },
    { color: '#22c55e', label: '最优解' },
  ], [])

  return (
    <PlaygroundShell
      presets={presets}
      computeSteps={computeStepsFn}
      legend={legend}
      renderViz={({ current }) => {
        const verts = current.path || []
        const feasiblePoly = STANDARD.vertices
        const isOptimal = current.phase === 'done' && current.type !== 'infeasible'

        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 520 }}>
                {/* axes */}
                <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
                <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
                {[1,2,3,4].map(v => (
                  <g key={v}>
                    <text x={sx(v)} y={H - PAD + 14} textAnchor="middle" fill="var(--text-tertiary)" fontSize="10">{v}</text>
                    <text x={PAD - 10} y={sy(v) + 4} textAnchor="end" fill="var(--text-tertiary)" fontSize="10">{v}</text>
                  </g>
                ))}
                {/* feasible region polygon */}
                {feasiblePoly.length > 0 && (
                  <polygon
                    points={feasiblePoly.map(v => `${sx(v[0])},${sy(v[1])}`).join(' ')}
                    fill="#fbbf24" fillOpacity="0.18" stroke="#fbbf24" strokeWidth="1.5"
                  />
                )}
                {/* objective line through current vertex */}
                {current.vertex && (
                  <line
                    x1={sx(0)} y1={sy(current.objVal / 2)}
                    x2={sx(current.objVal / 3)} y2={sy(0)}
                    stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4,3" opacity="0.5"
                  />
                )}
                {/* all feasible vertices as dots */}
                {feasiblePoly.map((v, i) => (
                  <circle key={i} cx={sx(v[0])} cy={sy(v[1])} r="5" fill="#8b5cf6" opacity="0.6" />
                ))}
                {/* movement path */}
                {verts.length > 1 && (
                  <polyline
                    points={verts.map(v => `${sx(v[0])},${sy(v[1])}`).join(' ')}
                    fill="none" stroke="#f97316" strokeWidth="2.5" strokeDasharray="6,3"
                  />
                )}
                {/* current vertex highlight */}
                {current.vertex && (
                  <circle
                    cx={sx(current.vertex[0])} cy={sy(current.vertex[1])}
                    r={isOptimal ? 9 : 7} fill={isOptimal ? '#22c55e' : '#f97316'}
                    stroke="white" strokeWidth="2"
                  >
                    {!isOptimal && <animate attributeName="r" values="7;9;7" dur="1s" repeatCount="indefinite" />}
                  </circle>
                )}
                {/* infeasible marker */}
                {current.type === 'infeasible' && (
                  <text x={W / 2} y={H / 2} textAnchor="middle" fill="#ef4444" fontSize="18" fontWeight="bold">无可行域</text>
                )}
                <text x={W / 2} y={H - 6} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11">x</text>
                <text x={12} y={H / 2} textAnchor="middle" fill="var(--text-tertiary)" fontSize="11" transform={`rotate(-90, 12, ${H / 2})`}>y</text>
              </svg>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, width: '100%', maxWidth: 440 }}>
                <InfoBox label="当前顶点" value={current.vertex ? `(${current.vertex[0]},${current.vertex[1]})` : '—'} />
                <InfoBox label="目标值" value={current.objVal !== null ? current.objVal : '—'} />
                <InfoBox label="阶段" value={current.phase === 'done' ? '完成' : current.phase === 'pivot' ? '转轴' : '初始化'} />
                <InfoBox label="步数" value={Math.max(0, verts.length - 1)} />
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
