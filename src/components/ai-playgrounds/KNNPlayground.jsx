import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 6]
const Y_RANGE = [0, 5]
const QUERY = { x: 3.1, y: 2.55 }

const DATA = [
  { x: 1.0, y: 1.1, label: 0 }, { x: 1.5, y: 1.8, label: 0 }, { x: 2.0, y: 1.3, label: 0 },
  { x: 2.6, y: 2.2, label: 0 }, { x: 3.4, y: 2.6, label: 1 }, { x: 3.8, y: 3.3, label: 1 },
  { x: 4.6, y: 3.8, label: 1 }, { x: 5.1, y: 3.1, label: 1 },
]

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y) }

function computeSteps({ k }) {
  const ranked = DATA.map((p, index) => ({ ...p, index, dist: distance(p, QUERY) }))
    .sort((a, b) => a.dist - b.dist)

  return Array.from({ length: k }, (_, i) => {
    const neighbors = ranked.slice(0, i + 1)
    const votes = neighbors.reduce((acc, p) => acc + (p.label ? 1 : -1), 0)
    const prediction = votes >= 0 ? 1 : 0
    return {
      description: `查看第 ${i + 1} 个近邻: distance=${neighbors[i].dist.toFixed(2)}, 当前预测=${prediction}`,
      points: DATA, query: QUERY, ranked, neighbors, k, prediction, radius: neighbors[i].dist,
    }
  })
}

export default function KNNPlayground() {
  const presets = useMemo(() => [
    { id: 'k3', label: 'k = 3', state: { k: 3 } },
    { id: 'k5', label: 'k = 5', state: { k: 5 } },
    { id: 'k7', label: 'k = 7', state: { k: 7 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ k: 3 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#38bdf8', label: '类别 0' },
        { color: '#f472b6', label: '类别 1' },
        { color: '#fbbf24', label: '待分类样本' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
              <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.05)" rx="8" />
              <circle cx={sx(current.query.x)} cy={sy(current.query.y)} r={current.radius * 70} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6 6" opacity="0.7" />
              {current.points.map((p, i) => {
                const active = current.neighbors.some(n => n.index === i)
                return (
                  <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={active ? 8 : 5} fill={p.label ? '#f472b6' : '#38bdf8'} opacity={active ? 1 : 0.55} stroke={active ? '#fff' : 'transparent'} strokeWidth="2" />
                )
              })}
              <circle cx={sx(current.query.x)} cy={sy(current.query.y)} r="8" fill="#fbbf24" stroke="#111827" strokeWidth="2" />
            </svg>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>k: <b>{current.k}</b></span>
              <span>已查看: <b>{current.neighbors.length}</b></span>
              <span>预测: <b>{current.prediction}</b></span>
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
