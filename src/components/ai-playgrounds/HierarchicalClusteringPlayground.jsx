import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'

const W = 520
const H = 320
const PAD = 36
const X_RANGE = [0, 6]
const Y_RANGE = [0, 5]
const COLORS = ['#8b5cf6', '#f472b6', '#f97316', '#38bdf8', '#fbbf24', '#ef4444', '#a78bfa', '#fb923c', '#34d399', '#f87171']

const DATA = [
  { x: 1.0, y: 1.0 }, { x: 1.3, y: 1.4 }, { x: 1.7, y: 1.1 },
  { x: 4.5, y: 3.8 }, { x: 4.9, y: 4.1 }, { x: 5.1, y: 3.6 },
  { x: 2.8, y: 2.5 }, { x: 3.1, y: 2.8 }, { x: 3.5, y: 4.2 },
]

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (W - PAD * 2) }
function sy(y) { return H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (H - PAD * 2) }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y) }

function clusterDist(a, b, linkage) {
  const pairs = []
  for (const pa of a) for (const pb of b) pairs.push(dist(pa, pb))
  if (linkage === 'single') return Math.min(...pairs)
  if (linkage === 'complete') return Math.max(...pairs)
  return pairs.reduce((s, d) => s + d, 0) / pairs.length
}

function computeSteps({ linkage }) {
  const steps = []
  let clusters = DATA.map((p, i) => ({ id: i, points: [p], color: COLORS[i] }))
  const merges = []

  steps.push({
    description: '初始状态: 每个点各自为一个簇',
    clusters: clusters.map(c => ({ ...c, points: [...c.points] })),
    merges: [], mergeDist: 0, numClusters: clusters.length, linkage,
  })

  while (clusters.length > 1) {
    let bestI = -1, bestJ = -1, bestD = Infinity
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = clusterDist(clusters[i].points, clusters[j].points, linkage)
        if (d < bestD) { bestD = d; bestI = i; bestJ = j }
      }
    }
    const merged = {
      id: clusters.length + merges.length,
      points: [...clusters[bestI].points, ...clusters[bestJ].points],
      color: clusters[bestI].color,
    }
    merges.push({ from: [clusters[bestI].id, clusters[bestJ].id], dist: bestD, mergedId: merged.id })
    clusters = [...clusters.filter((_, i) => i !== bestI && i !== bestJ), merged]

    steps.push({
      description: `合并距离 ${bestD.toFixed(2)} 的两个簇，剩余 ${clusters.length} 个簇`,
      clusters: clusters.map(c => ({ ...c, points: [...c.points] })),
      merges: [...merges], mergeDist: bestD, numClusters: clusters.length, linkage,
    })
  }

  return steps
}

export default function HierarchicalClusteringPlayground() {
  const presets = useMemo(() => [
    { id: 'single', label: 'Single Linkage', state: { linkage: 'single' } },
    { id: 'complete', label: 'Complete Linkage', state: { linkage: 'complete' } },
    { id: 'average', label: 'Average Linkage', state: { linkage: 'average' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ linkage: 'single' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '簇 A' },
        { color: '#f472b6', label: '簇 B' },
        { color: '#f97316', label: '合并连线' },
      ]}
      renderViz={({ current }) => {
        const clusterOf = {}
        current.clusters.forEach((c, ci) => c.points.forEach(p => { clusterOf[`${p.x},${p.y}`] = ci }))
        const dendH = 60
        return (
          <VizCard>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
                <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2 - dendH - 10} fill="rgba(139,92,246,0.05)" rx="8" />
                {current.merges.map((m, i) => {
                  const allPts = current.clusters.flatMap(c => c.points)
                  const fromPts = allPts.filter((_, idx) => m.from.includes(idx))
                  if (fromPts.length < 2) return null
                  const cx1 = sx(fromPts[0]?.x ?? 0), cy1 = sy(fromPts[0]?.y ?? 0)
                  const cx2 = sx(fromPts[1]?.x ?? 0), cy2 = sy(fromPts[1]?.y ?? 0)
                  return (
                    <line key={i} x1={cx1} y1={cy1} x2={cx2} y2={cy2} stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
                  )
                })}
                {DATA.map((p, i) => {
                  const ci = clusterOf[`${p.x},${p.y}`] ?? 0
                  return (
                    <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="6" fill={COLORS[ci % COLORS.length]} opacity="0.9" stroke="#fff" strokeWidth="1" />
                  )
                })}
                {/* Mini dendrogram */}
                <line x1={PAD} y1={H - PAD - dendH + 5} x2={W - PAD} y2={H - PAD - dendH + 5} stroke="var(--border)" strokeWidth="1" />
                {current.merges.map((m, i) => {
                  const baseY = H - PAD
                  const topY = baseY - (i + 1) * (dendH / Math.max(current.merges.length, 1))
                  const x1 = PAD + 30 + i * 50
                  const x2 = x1 + 40
                  const midX = (x1 + x2) / 2
                  return (
                    <g key={i}>
                      <line x1={x1} y1={baseY - i * 4} x2={x1} y2={topY} stroke="#f97316" strokeWidth="1.5" />
                      <line x1={x2} y1={baseY - i * 4} x2={x2} y2={topY} stroke="#f97316" strokeWidth="1.5" />
                      <line x1={x1} y1={topY} x2={x2} y2={topY} stroke="#f97316" strokeWidth="1.5" />
                      <text x={midX} y={topY - 3} textAnchor="middle" fontSize="8" fill="var(--text-tertiary)">{m.dist.toFixed(1)}</text>
                    </g>
                  )
                })}
              </svg>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>linkage: <b>{current.linkage}</b></span>
                <span>簇数: <b>{current.numClusters}</b></span>
                <span>合并距离: <b>{current.mergeDist.toFixed(2)}</b></span>
              </div>
            </div>
          </VizCard>
        )
      }}
    />
  )
}
