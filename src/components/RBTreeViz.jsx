// Smooth red-black tree viz: stable node IDs + transform transitions
export default function RBTreeViz({ stepData }) {
  if (!stepData || !stepData.nodes.length) {
    return (
      <svg width="100%" height={300} style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
        <text x="50%" y="50%" textAnchor="middle" fill="var(--text-tertiary)" fontSize={14}>空树</text>
      </svg>
    )
  }
  const { nodes, edges, highlight } = stepData
  const minX = Math.min(...nodes.map(n => n.x))
  const maxX = Math.max(...nodes.map(n => n.x))
  const maxY = Math.max(...nodes.map(n => n.y))
  const PAD = 50
  const W = Math.max(maxX - minX + PAD * 2, 400)
  const H = maxY + PAD * 2
  const offsetX = -minX + PAD
  const offsetY = PAD

  const nodeMap = {}
  nodes.forEach(n => (nodeMap[n.id] = n))

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}
      style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', minHeight: 240 }}>
      {edges.map((e) => {
        const a = nodeMap[e.from]
        const b = nodeMap[e.to]
        if (!a || !b) return null
        return (
          <line key={`e-${e.from}-${e.to}`}
            x1={a.x + offsetX} y1={a.y + offsetY}
            x2={b.x + offsetX} y2={b.y + offsetY}
            stroke="var(--border)" strokeWidth={1.5}
            style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
        )
      })}
      {nodes.map(n => {
        const isHL = highlight === n.id
        const fill = n.color === 'R' ? '#ef4444' : '#1f2937'
        return (
          <g key={n.id}
            style={{
              transform: `translate(${n.x + offsetX}px, ${n.y + offsetY}px)`,
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
            {isHL && (
              <circle r={26}
                fill="none"
                stroke="var(--yellow)"
                strokeWidth={3}
                style={{ transition: 'all 0.3s' }} />
            )}
            <circle r={20}
              fill={fill}
              stroke={n.color === 'R' ? '#fca5a5' : '#6b7280'}
              strokeWidth={2}
              style={{ transition: 'fill 0.4s, stroke 0.4s' }} />
            <text textAnchor="middle" y={5} fill="white" fontSize={13} fontWeight="bold">
              {n.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
