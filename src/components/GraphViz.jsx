import SvgCanvas from './svg/SvgCanvas'

// GraphViz — 通用图算法（BFS / DFS / Dijkstra / Prim / Kruskal / Bellman-Ford）可视化
// SVG 容器样式由 SvgCanvas 统一管理，本组件只关注图逻辑。

const W = 600, H = 360

export default function GraphViz({ graph, stepData, selectedEdge }) {
  if (!graph || !stepData) return null
  const { visited = [], current, highlightEdges = [], dist, mstEdges = [] } = stepData

  const nodeMap = {}
  graph.nodes.forEach(n => (nodeMap[n.id] = n))
  const visitedSet = new Set(visited)

  function edgeHighlighted(from, to) {
    return highlightEdges.some(([a, b]) => (a === from && b === to) || (a === to && b === from))
  }

  const mstSet = new Set(mstEdges.map(e => `${e[0]}|${e[1]}`))
  function edgeIsMst(from, to) {
    return mstSet.has(`${from}|${to}`) || mstSet.has(`${to}|${from}`)
  }

  function edgeIsSelected(from, to) {
    if (!selectedEdge) return false
    return (selectedEdge[0] === from && selectedEdge[1] === to) || (selectedEdge[0] === to && selectedEdge[1] === from)
  }

  // 屏幕阅读器摘要：当前节点 + 已访问数
  const ariaLabel = `图算法可视化，共 ${graph.nodes.length} 个节点`
    + (current != null ? `，当前访问节点 ${current}` : '')
    + `，已访问 ${visited.length} 个`

  return (
    <SvgCanvas viewBox={`0 0 ${W} ${H}`} ariaLabel={ariaLabel}>
      {graph.edges.map((e, i) => {
        const a = nodeMap[e.from], b = nodeMap[e.to]
        if (!a || !b) return null
        const hl = edgeHighlighted(e.from, e.to)
        const confirmed = !hl && visitedSet.has(e.from) && visitedSet.has(e.to)
        const isMst = edgeIsMst(e.from, e.to)
        const isSelected = edgeIsSelected(e.from, e.to)
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={isSelected ? 'var(--accent)' : isMst ? 'var(--accent)' : hl ? 'var(--yellow)' : confirmed ? 'var(--accent)' : 'var(--border)'}
              strokeWidth={isSelected ? 4 : isMst ? 3 : hl ? 3 : confirmed ? 2 : 1.5}
              opacity={isMst || isSelected ? 0.95 : confirmed ? 0.55 : 1}
              style={{ transition: 'stroke 0.2s, stroke-width 0.2s, opacity 0.2s' }} />
            {e.weight != null && (
              <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 6}
                fill="var(--text-secondary)" fontSize={11} textAnchor="middle">{e.weight}</text>
            )}
          </g>
        )
      })}
      {graph.nodes.map(n => {
        const isVisited = visited.includes(n.id)
        const isCurrent = current === n.id
        const d = dist?.[n.id]
        return (
          <g key={n.id}>
            {isCurrent && (
              <circle cx={n.x} cy={n.y} r={28} fill="none" stroke="var(--yellow)" strokeWidth={2} opacity={0.6}>
                <animate attributeName="r" values="22;30;22" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.2s" repeatCount="indefinite" />
              </circle>
            )}
            {/* 未访问节点用虚线边框（非颜色线索："待处理"），已访问/当前为实线——
                红绿色盲在灰度下也能区分 visited / unvisited，不再只靠填充色 */}
            <circle cx={n.x} cy={n.y} r={22}
              fill={isCurrent ? 'var(--yellow)' : isVisited ? 'var(--accent)' : 'var(--surface)'}
              stroke={isCurrent ? 'var(--yellow)' : isVisited ? 'var(--accent)' : 'var(--border)'}
              strokeWidth={2}
              strokeDasharray={!isCurrent && !isVisited ? '4 3' : '0'}
              style={{ transition: 'fill 0.3s, stroke 0.3s' }} />
            <text x={n.x} y={n.y + 5} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">{n.id}</text>
            {d != null && (
              <text x={n.x} y={n.y + 38} textAnchor="middle" fill="var(--accent-light)" fontSize={11}>
                {d === Infinity ? '∞' : d}
              </text>
            )}
          </g>
        )
      })}
    </SvgCanvas>
  )
}
