import { useMemo } from 'react'
import PlaygroundShell from './PlaygroundShell'
import { ToolbarBtn } from './shared'

const QUERIES = [
  { id: 'select', label: 'SELECT + Filter' },
  { id: 'join',   label: 'JOIN + HashJoin' },
  { id: 'group',  label: 'GROUP BY + LIMIT' },
]

// 颜色映射 by type
function nodeColor(type) {
  if (type === 'SeqScan' || type === 'IndexScan') return '#3b82f6'   // blue
  if (type === 'Filter')                          return '#eab308'   // yellow
  if (type === 'HashJoin' || type === 'NestedLoop') return '#a855f7' // accent/purple
  if (type === 'Sort' || type === 'Limit')         return '#94a3b8'  // text-tertiary
  if (type === 'Aggregate')                        return '#22c55e'  // green
  return '#6b7280'
}

function nodeBg(type) {
  const c = nodeColor(type)
  return `${c}18`
}

function statusBorderColor(type, status) {
  if (status === 'done')   return '#22c55e'
  if (status === 'active') return nodeColor(type)
  return 'var(--border)'
}

// 计算树布局：给定 nodes 和 edges，返回每个节点的 (x, y) 位置
// 策略：从根节点出发，层序遍历，从上到下排列
function computeLayout(nodes, edges) {
  if (!nodes || nodes.length === 0) return {}

  // 找根节点（没有任何节点以它为 from 的子节点，即它没有父节点）
  // edges: { from: child, to: parent }
  // 根节点：在 to 中出现（有子节点）但不在 from 中出现（没有父节点）的节点
  // 简化：建立父子关系
  const childrenOf = {} // nodeId → [childId]
  for (const n of nodes) childrenOf[n.id] = []
  for (const e of edges) {
    if (!childrenOf[e.to]) childrenOf[e.to] = []
    childrenOf[e.to].push(e.from)
  }

  // 根：有子节点或没有父节点的节点中，没有父节点的那个
  let rootId = null
  for (const n of nodes) {
    if (!edges.find(e => e.from === n.id)) {
      // 不是任何边的 from（即不是任何节点的子节点）→ 是根
      rootId = n.id
      break
    }
  }
  if (!rootId && nodes.length > 0) rootId = nodes[0].id

  // BFS 分层
  const levels = {} // nodeId → level
  const queue = [{ id: rootId, level: 0 }]
  while (queue.length > 0) {
    const { id, level } = queue.shift()
    levels[id] = level
    for (const childId of (childrenOf[id] || [])) {
      queue.push({ id: childId, level: level + 1 })
    }
  }

  // 计算每层的节点
  const byLevel = {}
  for (const [id, lv] of Object.entries(levels)) {
    if (!byLevel[lv]) byLevel[lv] = []
    byLevel[lv].push(id)
  }

  const maxLevel = Math.max(...Object.values(levels))
  const nodeW = 150
  const nodeH = 72
  const hGap = 24
  const vGap = 56

  const positions = {}
  for (let lv = 0; lv <= maxLevel; lv++) {
    const row = byLevel[lv] || []
    const totalW = row.length * nodeW + (row.length - 1) * hGap
    row.forEach((id, i) => {
      positions[id] = {
        x: i * (nodeW + hGap) - totalW / 2 + nodeW / 2,
        y: lv * (nodeH + vGap),
      }
    })
  }

  return { positions, nodeW, nodeH, maxLevel, byLevel }
}

// 单个计划节点（SVG foreignObject 内嵌 div）
function PlanNode({ node, x, y, nodeW, nodeH, isActive }) {
  const color = nodeColor(node.type)
  const borderColor = statusBorderColor(node.type, node.status)
  const bg = node.status === 'done'
    ? '#22c55e18'
    : node.status === 'active'
    ? nodeBg(node.type)
    : 'var(--surface)'

  const glowStyle = isActive
    ? { filter: `drop-shadow(0 0 8px ${color}88)` }
    : {}

  return (
    <g
      style={{ transform: `translate(${x - nodeW / 2}px, ${y - nodeH / 2}px)`, transition: 'all 0.3s' }}
      {...glowStyle}
    >
      <foreignObject width={nodeW} height={nodeH}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            width: nodeW,
            height: nodeH,
            boxSizing: 'border-box',
            padding: '7px 10px',
            borderRadius: 10,
            border: `2px solid ${borderColor}`,
            background: bg,
            transition: 'all 0.3s',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
            boxShadow: isActive ? `0 0 16px ${color}55` : 'none',
          }}
        >
          <div style={{
            fontSize: 12, fontWeight: 800,
            color: color,
            letterSpacing: '0.04em',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.2,
          }}>
            {node.type.toUpperCase()}
          </div>
          <div style={{
            fontSize: 10.5,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {node.label}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 2, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 9.5, color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
            }}>
              cost={node.cost}
            </span>
            <span style={{
              fontSize: 9.5, color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
            }}>
              rows={node.rows}
            </span>
            {node.outputCount > 0 && (
              <span style={{
                fontSize: 9.5, fontWeight: 700,
                color: '#22c55e',
                fontFamily: 'var(--font-mono)',
              }}>
                ↑{node.outputCount}
              </span>
            )}
          </div>
        </div>
      </foreignObject>
    </g>
  )
}

export default function QueryPlanPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      initialState={{ queryId: 'select' }}
      derivePayload={state => state.queryId}
      computeSteps={queryId => algoFn(queryId)}
      extraToolbar={({ state, setState, ctrl }) => (
        <>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 700, marginRight: 4 }}>查询</span>
          {QUERIES.map(q => (
            <ToolbarBtn
              key={q.id}
              active={state.queryId === q.id}
              onClick={() => { setState({ queryId: q.id }); ctrl.reset() }}
            >
              {q.label}
            </ToolbarBtn>
          ))}
        </>
      )}
      renderViz={({ current }) => <QueryPlanViz current={current} />}
    />
  )
}

function QueryPlanViz({ current }) {
  const { nodes = [], edges = [], activeNodeId, tupleFlow = [] } = current || {}

  // 计算布局（必须在 early return 前调用，保持 hook 调用顺序稳定）
  const layout = useMemo(() => computeLayout(nodes, edges), [nodes, edges])
  const { positions, nodeW, nodeH, maxLevel } = layout || {}

  if (!current) return null

  const SVG_PADDING = 60
  const SVG_W = 600
  const SVG_H = positions
    ? (maxLevel + 1) * (nodeH + 56) + SVG_PADDING * 2
    : 300

  const centerX = SVG_W / 2

  return (
    <>
      {/* SVG 树主区域 */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        overflowX: 'auto',
      }}>
        <svg
          width="100%"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ display: 'block', minHeight: 200 }}
        >
          {/* 箭头 defs（每次渲染只需要一套） */}
          <defs>
            <marker id="arr-idle" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
              <path d="M0,0 L0,7 L7,3.5 z" fill="var(--border)" />
            </marker>
            <marker id="arr-active" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
              <path d="M0,0 L0,7 L7,3.5 z" fill="#a855f7" />
            </marker>
            <marker id="arr-done" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
              <path d="M0,0 L0,7 L7,3.5 z" fill="#22c55e" />
            </marker>
          </defs>

          <g transform={`translate(${centerX}, ${SVG_PADDING})`}>
            {/* 边（箭头）*/}
            {positions && edges.map((e, i) => {
              const fromPos = positions[e.from]
              const toPos = positions[e.to]
              if (!fromPos || !toPos) return null

              const fromNode = nodes.find(n => n.id === e.from)
              const toNode = nodes.find(n => n.id === e.to)
              const isActiveEdge = activeNodeId === e.from || activeNodeId === e.to
              const isDoneEdge = fromNode?.status === 'done' && toNode?.status !== 'idle'

              const markerColor = isDoneEdge ? 'done' : (isActiveEdge ? 'active' : 'idle')
              const strokeColor = isDoneEdge ? '#22c55e' : (isActiveEdge ? '#a855f7' : 'var(--border)')

              // From: top center of child node, To: bottom center of parent node
              // Since root is at top, child has higher y → arrow goes from bottom of parent area upward
              // Actually: in our tree, root is level 0 (top), leaves are bottom.
              // Data flows from leaves UP to root. Arrow direction: from child (below) to parent (above).
              // So: start = top of child node, end = bottom of parent node
              const x1 = fromPos.x
              const y1 = fromPos.y - nodeH / 2  // top of child
              const x2 = toPos.x
              const y2 = toPos.y + nodeH / 2    // bottom of parent

              return (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={strokeColor}
                  strokeWidth={isActiveEdge ? 2 : 1}
                  markerEnd={`url(#arr-${markerColor})`}
                  strokeDasharray={isActiveEdge ? '5 3' : 'none'}
                  style={{ transition: 'all 0.3s' }}
                />
              )
            })}

            {/* 元组流动标签 */}
            {positions && tupleFlow.map((tf, i) => {
              const fromPos = positions[tf.fromId]
              const toPos = positions[tf.toId]
              if (!fromPos || !toPos) return null
              const mx = (fromPos.x + toPos.x) / 2
              const my = (fromPos.y - nodeH / 2 + toPos.y + nodeH / 2) / 2
              return (
                <g key={i}>
                  <rect
                    x={mx - 38} y={my - 11} width={76} height={22}
                    rx={7} ry={7}
                    fill="#a855f722" stroke="#a855f7aa" strokeWidth={1}
                  />
                  <text
                    x={mx} y={my + 4}
                    textAnchor="middle"
                    style={{
                      fontSize: 9,
                      fill: '#a855f7',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                    }}
                  >
                    {tf.value}
                  </text>
                </g>
              )
            })}

            {/* 节点 */}
            {positions && nodes.map(node => {
              const pos = positions[node.id]
              if (!pos) return null
              const isActive = activeNodeId === node.id
              return (
                <PlanNode
                  key={node.id}
                  node={node}
                  x={pos.x}
                  y={pos.y}
                  nodeW={nodeW}
                  nodeH={nodeH}
                  isActive={isActive}
                />
              )
            })}
          </g>
        </svg>
      </div>

      {/* 节点状态图例 */}
      <div style={{
        display: 'flex', gap: 14, flexWrap: 'wrap',
        padding: '6px 12px', marginBottom: 12,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
      }}>
        {[
          { color: 'var(--border)', label: '空闲 idle' },
          { color: '#a855f7', label: '执行中 active' },
          { color: '#22c55e', label: '完成 done' },
        ].map(({ color, label }) => (
          <span key={label} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, color: 'var(--text-secondary)',
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: 3,
              border: `2px solid ${color}`,
              display: 'inline-block',
            }} />
            {label}
          </span>
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          ↑N = 已输出行数
        </span>
      </div>
    </>
  )
}
