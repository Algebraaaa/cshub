export default function TreeViz({ stepData }) {
  if (!stepData || !stepData.nodes.length) return (
    <svg width="100%" height={300} style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
      <text x="50%" y="50%" textAnchor="middle" fill="var(--text-tertiary)" fontSize={14}>空树</text>
    </svg>
  )

  const { nodes, edges, highlight } = stepData
  const minX = Math.min(...nodes.map(n => n.x))
  const maxX = Math.max(...nodes.map(n => n.x))
  const maxY = Math.max(...nodes.map(n => n.y))
  const PAD = 40
  const W = Math.max(maxX - minX + PAD * 2, 400)
  const H = maxY + PAD * 2
  const offsetX = -minX + PAD
  const offsetY = PAD

  const nodeMap = {}
  nodes.forEach(n => (nodeMap[n.id] = n))

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', minHeight: 200 }}>
      {edges.map((e) => {
        const a = nodeMap[e.from], b = nodeMap[e.to]
        if (!a || !b) return null
        return <line key={`${e.from}-${e.to}`}
          x1={a.x + offsetX} y1={a.y + offsetY}
          x2={b.x + offsetX} y2={b.y + offsetY}
          stroke="var(--border)" strokeWidth={1.5}
          style={{ transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)' }} />
      })}
      {nodes.map(n => (
        <g key={n.id}
          style={{
            transform: `translate(${n.x + offsetX}px, ${n.y + offsetY}px)`,
            transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
          }}>
          {highlight === n.id && (
            <circle r={26} fill="none" stroke="var(--yellow)" strokeWidth={2.5} opacity={0.7}>
              <animate attributeName="r" values="22;28;22" dur="1.2s" repeatCount="indefinite" />
            </circle>
          )}
          <circle r={20}
            fill={highlight === n.id ? 'var(--yellow)' : 'var(--accent)'}
            stroke="var(--border)" strokeWidth={1.5}
            style={{ transition: 'fill 0.3s' }} />
          <text textAnchor="middle" y={5} fill="white" fontSize={12} fontWeight="bold">
            {n.value}
          </text>
        </g>
      ))}
    </svg>
  )
}
