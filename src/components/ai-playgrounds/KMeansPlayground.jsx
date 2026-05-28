import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 6]
const Y_RANGE = [0, 5]
const COLORS = ['#38bdf8', '#f472b6', '#fbbf24']

const DATA = [
  { x: 1.0, y: 1.0 }, { x: 1.4, y: 1.5 }, { x: 1.9, y: 1.1 },
  { x: 4.2, y: 3.8 }, { x: 4.8, y: 3.2 }, { x: 5.1, y: 4.0 },
  { x: 3.0, y: 1.2 }, { x: 3.4, y: 1.7 },
]

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }
function dist2(a, b) { return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }

function computeSteps({ k }) {
  const steps = []
  let centroids = k === 2
    ? [{ x: 1.2, y: 3.8 }, { x: 5.0, y: 1.0 }]
    : [{ x: 1.2, y: 3.8 }, { x: 5.0, y: 1.0 }, { x: 3.0, y: 2.4 }]
  let assignments = DATA.map(() => 0)

  for (let iter = 0; iter < 5; iter++) {
    assignments = DATA.map(p => {
      let best = 0
      let bestD = Infinity
      centroids.forEach((c, idx) => {
        const d = dist2(p, c)
        if (d < bestD) { bestD = d; best = idx }
      })
      return best
    })

    const inertia = DATA.reduce((sum, p, i) => sum + dist2(p, centroids[assignments[i]]), 0)
    steps.push({ description: `迭代 ${iter + 1}: 分配样本到最近中心`, phase: 'assign', points: DATA, centroids, assignments, inertia, k, centroidShift: 0 })

    const next = centroids.map((c, idx) => {
      const group = DATA.filter((_, i) => assignments[i] === idx)
      if (!group.length) return c
      return {
        x: group.reduce((s, p) => s + p.x, 0) / group.length,
        y: group.reduce((s, p) => s + p.y, 0) / group.length,
      }
    })
    const shift = next.reduce((s, c, i) => s + Math.sqrt(dist2(c, centroids[i])), 0)
    centroids = next
    steps.push({ description: `迭代 ${iter + 1}: 移动中心，shift=${shift.toFixed(3)}`, phase: 'update', points: DATA, centroids, assignments, inertia, k, centroidShift: shift })
  }

  return steps
}

export default function KMeansPlayground() {
  const presets = useMemo(() => [
    { id: 'k2', label: 'k = 2', state: { k: 2 } },
    { id: 'k3', label: 'k = 3', state: { k: 3 } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ k: 2 }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '样本' },
        { color: '#f97316', label: '聚类中心' },
      ]}
      renderViz={({ current }) => (
        <VizCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
              <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2} fill="rgba(139,92,246,0.05)" rx="8" />
              {current.points.map((p, i) => (
                <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="6" fill={COLORS[current.assignments[i] ?? 0]} opacity="0.85" />
              ))}
              {current.centroids.map((c, i) => (
                <g key={i}>
                  <circle cx={sx(c.x)} cy={sy(c.y)} r="10" fill="none" stroke="#f97316" strokeWidth="3" />
                  <text x={sx(c.x)} y={sy(c.y) + 4} textAnchor="middle" fontSize="10" fill="#f97316" fontWeight="700">{i + 1}</text>
                </g>
              ))}
            </svg>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>phase: <b>{current.phase}</b></span>
              <span>inertia: <b>{current.inertia.toFixed(2)}</b></span>
              <span>shift: <b>{current.centroidShift.toFixed(2)}</b></span>
            </div>
          </div>
        </VizCard>
      )}
    />
  )
}
