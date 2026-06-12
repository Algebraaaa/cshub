import { useCallback, useMemo } from 'react'
import PlaygroundShell from '../playgrounds/PlaygroundShell'
import VizCard from '../playgrounds/VizCard'
import { AI_COLORS } from '../../styles/aiVizTokens'

const SCATTER_W = 340
const SCATTER_H = 340
const PAD = 36
const X_RANGE = [-2, 8]
const Y_RANGE = [-2, 8]

const COLORS = AI_COLORS.clusterColors.slice(0, 8)

// 8 well-scattered 2D points forming natural groups
const DATA_PRESETS = {
  '2x4': [
    { x: 0.5, y: 0.8, id: 0 },
    { x: 1.2, y: 1.4, id: 1 },
    { x: 0.8, y: 2.0, id: 2 },
    { x: 1.8, y: 1.8, id: 3 },
    { x: 5.0, y: 5.0, id: 4 },
    { x: 5.8, y: 5.5, id: 5 },
    { x: 5.2, y: 6.2, id: 6 },
    { x: 6.5, y: 5.8, id: 7 },
  ],
  'spread': [
    { x: 0.5, y: 6.5, id: 0 },
    { x: 1.5, y: 5.5, id: 1 },
    { x: 2.5, y: 6.0, id: 2 },
    { x: 3.5, y: 3.0, id: 3 },
    { x: 4.5, y: 2.5, id: 4 },
    { x: 5.5, y: 1.5, id: 5 },
    { x: 6.5, y: 5.5, id: 6 },
    { x: 7.0, y: 6.5, id: 7 },
  ],
  'line': [
    { x: 0.5, y: 4.0, id: 0 },
    { x: 1.5, y: 4.2, id: 1 },
    { x: 2.8, y: 3.8, id: 2 },
    { x: 4.0, y: 4.1, id: 3 },
    { x: 5.2, y: 3.9, id: 4 },
    { x: 6.0, y: 4.3, id: 5 },
    { x: 7.0, y: 4.0, id: 6 },
    { x: 7.5, y: 4.2, id: 7 },
  ],
}

function sx(x) { return PAD + (x - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0]) * (SCATTER_W - PAD * 2) }
function sy(y) { return SCATTER_H - PAD - (y - Y_RANGE[0]) / (Y_RANGE[1] - Y_RANGE[0]) * (SCATTER_H - PAD * 2) }
function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) }

// Single-linkage distance between two clusters
function clusterDist(c1, c2, data) {
  let minD = Infinity
  c1.forEach(i1 => {
    c2.forEach(i2 => {
      const d = dist(data[i1], data[i2])
      if (d < minD) minD = d
    })
  })
  return minD
}

function computeSteps({ presetKey }) {
  const data = DATA_PRESETS[presetKey]
  const N = data.length
  const steps = []

  // Start with N singleton clusters
  let clusters = data.map((_, i) => [i])
  const dendroEvents = [] // {merge: [i, j], height, newCluster}

  // Initialize colors: each point its own color
  function getLabels() {
    const labels = new Array(N)
    clusters.forEach((c, ci) => c.forEach(pi => labels[pi] = ci))
    return labels
  }

  steps.push({
    description: `初始化: ${N} 个单点簇,方法=单链接(Single Linkage)`,
    line: 1, phase: 'init',
    data, clusters: JSON.parse(JSON.stringify(clusters)), labels: getLabels(),
    dendroEvents: [], mergeIndices: null, nClusters: N,
  })

  while (clusters.length > 1) {
    // Find closest pair
    let bestI = 0, bestJ = 1, bestD = Infinity
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = clusterDist(clusters[i], clusters[j], data)
        if (d < bestD) { bestD = d; bestI = i; bestJ = j }
      }
    }

    // Highlight the clusters about to merge
    steps.push({
      description: `找到最近簇对: 簇 ${bestI + 1} 和 簇 ${bestJ + 1},单链接距离=${bestD.toFixed(3)}`,
      line: 3, phase: 'find-pair',
      data, clusters: JSON.parse(JSON.stringify(clusters)), labels: getLabels(),
      dendroEvents: [...dendroEvents], mergeIndices: [bestI, bestJ],
      nClusters: clusters.length, minDist: bestD,
    })

    // Merge
    const newCluster = [...clusters[bestI], ...clusters[bestJ]]
    dendroEvents.push({
      left: [...clusters[bestI]],
      right: [...clusters[bestJ]],
      merged: [...newCluster],
      height: bestD,
    })
    clusters = clusters.filter((_, idx) => idx !== bestI && idx !== bestJ)
    clusters.push(newCluster)

    steps.push({
      description: `合并 ${bestI + 1} 与 ${bestJ + 1} → 新簇 (${newCluster.length} 个点),剩余 ${clusters.length} 个簇`,
      line: 5, phase: 'merge',
      data, clusters: JSON.parse(JSON.stringify(clusters)), labels: getLabels(),
      dendroEvents: [...dendroEvents], mergeIndices: null,
      nClusters: clusters.length, minDist: bestD,
    })
  }

  steps.push({
    description: `层次聚类完成: 所有点归入单个簇,共 ${dendroEvents.length} 次合并`,
    line: 7, phase: 'done',
    data, clusters: JSON.parse(JSON.stringify(clusters)), labels: getLabels(),
    dendroEvents: [...dendroEvents], mergeIndices: null,
    nClusters: 1,
  })

  return steps
}

function Dendrogram({ events, data }) {
  const N = data.length
  const W = 200
  const H = SCATTER_H
  const LEFT = 40
  const PAD_D = 20
  const LABEL_H = 18

  const maxH = Math.max(...events.map(e => e.height), 0.1)

  // Compute x position for each leaf
  const leafX = {}
  // Leaves are ordered by the final merge tree; use simple left to right order from merged sequence
  const order = events.length ? events[events.length - 1].merged : data.map((_, i) => i)
  order.forEach((id, i) => { leafX[id] = LEFT + (i + 0.5) * ((W - LEFT - PAD_D) / N) })

  function clusterX(c) {
    // Average of member x positions
    return c.reduce((s, id) => s + leafX[id], 0) / c.length
  }

  const bottomY = H - PAD_D

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: H }}>
      <text x={W / 2} y={14} textAnchor="middle" fontSize="11" fill="var(--text-secondary)">Dendrogram</text>
      {/* Y axis labels */}
      <line x1={LEFT} y1={PAD_D + 8} x2={LEFT} y2={bottomY} stroke="var(--border)" strokeWidth="1" />
      {[0, 0.5, 1].map(frac => {
        const v = maxH * frac
        const y = bottomY - frac * (bottomY - PAD_D - LABEL_H)
        return (
          <g key={frac}>
            <line x1={LEFT - 3} y1={y} x2={LEFT} y2={y} stroke="var(--border)" />
            <text x={LEFT - 5} y={y + 3} textAnchor="end" fontSize="8" fill="var(--text-tertiary)">{v.toFixed(1)}</text>
          </g>
        )
      })}
      <text x={8} y={H / 2} textAnchor="middle" fontSize="8" fill="var(--text-tertiary)" transform={`rotate(-90, 8, ${H / 2})`}>dist</text>

      {/* Draw each dendrogram event */}
      {events.map((ev, idx) => {
        const hFrac = ev.height / maxH
        const y = bottomY - hFrac * (bottomY - PAD_D - LABEL_H)
        const xL = clusterX(ev.left)
        const xR = clusterX(ev.right)
        const yL = bottomY // bottom
        const yR = bottomY
        // We don't have prior heights; approximate: if a side is a leaf it goes to bottom, else mid
        // Simple: each event draws its bracket at height y, connecting xL and xR
        return (
          <g key={`ev-${idx}`}>
            <line x1={xL} y1={yL} x2={xL} y2={y} stroke="#8b5cf6" strokeWidth="1.5" opacity="0.8" />
            <line x1={xR} y1={yR} x2={xR} y2={y} stroke="#8b5cf6" strokeWidth="1.5" opacity="0.8" />
            <line x1={xL} y1={y} x2={xR} y2={y} stroke="#8b5cf6" strokeWidth="1.5" opacity="0.8" />
          </g>
        )
      })}

      {/* Leaf labels */}
      {order.map(id => (
        <g key={`leaf-${id}`}>
          <circle cx={leafX[id]} cy={bottomY} r="3" fill={COLORS[id % COLORS.length]} />
          <text x={leafX[id]} y={bottomY + 12} textAnchor="middle" fontSize="9" fill="var(--text-tertiary)">P{id}</text>
        </g>
      ))}
    </svg>
  )
}

export default function HierarchicalPlayground() {
  const presets = useMemo(() => [
    { id: '2x4', label: '2 × 4 组', state: { presetKey: '2x4' } },
    { id: 'spread', label: '分散布局', state: { presetKey: 'spread' } },
    { id: 'line', label: '线性排列', state: { presetKey: 'line' } },
  ], [])

  const computeStepsFn = useCallback(state => computeSteps(state), [])

  return (
    <PlaygroundShell
      initialState={{ presetKey: '2x4' }}
      presets={presets}
      derivePayload={s => s}
      computeSteps={computeStepsFn}
      legend={[
        { color: '#8b5cf6', label: '合并边' },
        { color: '#f97316', label: '待合并簇' },
      ]}
      renderViz={({ current }) => (
        <VizCard padding="12px 12px">
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Scatter left */}
            <svg viewBox={`0 0 ${SCATTER_W} ${SCATTER_H}`} style={{ width: '100%', maxWidth: SCATTER_W, height: SCATTER_H }}>
              <rect x={PAD} y={PAD} width={SCATTER_W - PAD * 2} height={SCATTER_H - PAD * 2} fill="rgba(139,92,246,0.04)" rx="8" />
              {current.data.map((p, i) => {
                const color = COLORS[current.labels[i] % COLORS.length]
                const inPair = current.mergeIndices && current.clusters
                  && (current.mergeIndices.some(mi => current.clusters[mi]?.includes(i)))
                return (
                  <g key={i}>
                    <circle cx={sx(p.x)} cy={sy(p.y)} r={inPair ? 8 : 6}
                      fill={color}
                      stroke={inPair ? '#f97316' : 'white'}
                      strokeWidth={inPair ? 2.5 : 1}
                      opacity="0.92"
                      style={{ transition: 'all 0.3s' }}
                    />
                    <text x={sx(p.x)} y={sy(p.y) + 3} textAnchor="middle" fontSize="8" fill="white" fontWeight="700"
                      pointerEvents="none">
                      P{i}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Dendrogram right */}
            <Dendrogram events={current.dendroEvents} data={current.data} />
          </div>

          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            <span>phase: <b style={{ color: 'var(--text-primary)' }}>{current.phase}</b></span>
            <span>簇数: <b>{current.nClusters}</b></span>
            {current.minDist !== undefined && (
              <span>min dist: <b>{current.minDist.toFixed(3)}</b></span>
            )}
            <span>合并次数: <b>{current.dendroEvents.length}</b></span>
          </div>
        </VizCard>
      )}
    />
  )
}
