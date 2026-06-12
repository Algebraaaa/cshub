import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 7]
const Y_RANGE = [0, 5.5]
const COLORS = ['#8b5cf6', '#f472b6', '#38bdf8', '#fbbf24', '#34d399']

const DATA = [
  { x: 1.0, y: 1.2 }, { x: 1.4, y: 1.6 }, { x: 1.2, y: 1.9 }, { x: 1.7, y: 1.3 },
  { x: 4.8, y: 3.8 }, { x: 5.2, y: 4.1 }, { x: 5.5, y: 3.6 }, { x: 5.0, y: 4.4 }, { x: 4.6, y: 3.5 },
  { x: 3.0, y: 2.8 }, { x: 3.3, y: 3.1 }, { x: 2.8, y: 2.5 }, { x: 3.5, y: 2.9 },
  { x: 6.2, y: 1.0 }, { x: 0.5, y: 4.5 },
]

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y) }

function computeSteps({ epsilon, minPts }) {
  const steps = []
  const visited = new Array(DATA.length).fill(false)
  const labels = new Array(DATA.length).fill(-1)
  let clusterId = 0

  steps.push({
    description: '初始状态: 所有点未访问',
    points: DATA, labels: [...labels], visited: [...visited],
    activePoint: -1, neighbors: [], epsilon, minPts,
    clustersFound: 0, noiseCount: 0, coreCount: 0,
  })

  for (let i = 0; i < DATA.length; i++) {
    if (visited[i]) continue
    visited[i] = true
    const neighbors = DATA.reduce((acc, p, j) => {
      if (j !== i && dist(DATA[i], p) <= epsilon) acc.push(j)
      return acc
    }, [])

    steps.push({
      description: `访问点 ${i}，ε-邻域有 ${neighbors.length} 个点`,
      points: DATA, labels: [...labels], visited: [...visited],
      activePoint: i, neighbors: [...neighbors], epsilon, minPts,
      clustersFound: clusterId, noiseCount: labels.filter(l => l === -1 && visited.some((v, vi) => v && labels[vi] === -1)).length,
      coreCount: 0,
    })

    if (neighbors.length < minPts) {
      labels[i] = -2
      steps.push({
        description: `点 ${i} 邻域不足 minPts=${minPts}，标记为噪声`,
        points: DATA, labels: [...labels], visited: [...visited],
        activePoint: i, neighbors: [], epsilon, minPts,
        clustersFound: clusterId, noiseCount: labels.filter(l => l === -2).length, coreCount: 0,
      })
      continue
    }

    labels[i] = clusterId
    const seed = [...neighbors]
    for (let s = 0; s < seed.length; s++) {
      const q = seed[s]
      if (labels[q] === -2) labels[q] = clusterId
      if (visited[q]) continue
      visited[q] = true
      const qNeighbors = DATA.reduce((acc, p, j) => {
        if (j !== q && dist(DATA[q], p) <= epsilon) acc.push(j)
        return acc
      }, [])
      labels[q] = clusterId
      if (qNeighbors.length >= minPts) {
        for (const n of qNeighbors) { if (!seed.includes(n)) seed.push(n) }
      }
    }

    steps.push({
      description: `扩展簇 ${clusterId}，包含 ${labels.filter(l => l === clusterId).length} 个点`,
      points: DATA, labels: [...labels], visited: [...visited],
      activePoint: i, neighbors: [...neighbors], epsilon, minPts,
      clustersFound: clusterId + 1, noiseCount: labels.filter(l => l === -2).length,
      coreCount: labels.filter((l, idx) => {
        if (l < 0) return false
        const cnt = DATA.reduce((s, p, j) => s + (j !== idx && dist(DATA[idx], p) <= epsilon ? 1 : 0), 0)
        return cnt >= minPts
      }).length,
    })
    clusterId++
  }

  return steps
}

export default function DBSCANPlayground() {
  const presets = useMemo(() => [
    { id: 'e08m3', label: 'ε=0.8 minPts=3', state: { epsilon: 0.8, minPts: 3 } },
    { id: 'e15m3', label: 'ε=1.5 minPts=3', state: { epsilon: 1.5, minPts: 3 } },
    { id: 'e15m5', label: 'ε=1.5 minPts=5', state: { epsilon: 1.5, minPts: 5 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ epsilon: 1.5, minPts: 3 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '簇 0' },
        { color: '#f472b6', label: '簇 1' },
        { color: '#ef4444', label: '噪声' },
        { color: '#f97316', label: 'ε-邻域' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
              <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.05)" rx="8" />
              {current.activePoint >= 0 && (
                <circle
                  cx={sx(DATA[current.activePoint].x)} cy={sy(DATA[current.activePoint].y)}
                  r={current.epsilon / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2)}
                  fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6"
                />
              )}
              {current.points.map((p, i) => {
                const label = current.labels[i]
                const fill = label === -2 ? '#ef4444' : label >= 0 ? COLORS[label % COLORS.length] : '#94a3b8'
                const isNoise = label === -2
                return isNoise ? (
                  <g key={i}>
                    <line x1={sx(p.x) - 5} y1={sy(p.y) - 5} x2={sx(p.x) + 5} y2={sy(p.y) + 5} stroke={fill} strokeWidth="2.5" />
                    <line x1={sx(p.x) + 5} y1={sy(p.y) - 5} x2={sx(p.x) - 5} y2={sy(p.y) + 5} stroke={fill} strokeWidth="2.5" />
                  </g>
                ) : (
                  <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={i === current.activePoint ? 8 : 6}
                    fill={fill} opacity="0.9" stroke={i === current.activePoint ? '#fff' : 'transparent'} strokeWidth="2" />
                )
              })}
            </svg>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>ε: <b>{current.epsilon}</b></span>
              <span>minPts: <b>{current.minPts}</b></span>
              <span>簇: <b>{current.clustersFound}</b></span>
              <span>噪声: <b>{current.noiseCount}</b></span>
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
