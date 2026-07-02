import PlaygroundShell from './PlaygroundShell'
import VizCard from './VizCard'
import SvgCanvas from '../svg/SvgCanvas'

const LEGEND = [
  { color: '#10b981', label: '已使用的边' },
  { color: 'rgba(255,255,255,0.15)', label: '未使用的边' },
  { color: '#f59e0b', label: '当前节点' },
  { color: '#a855f7', label: '当前遍历的边' },
  { color: '#3b82f6', label: '栈中节点' },
]

const DEFAULT_GRAPH = {
  nodes: [
    { id: 'A', x: 300, y: 60 },
    { id: 'B', x: 150, y: 160 },
    { id: 'C', x: 450, y: 160 },
    { id: 'D', x: 150, y: 280 },
    { id: 'E', x: 450, y: 280 },
  ],
  edges: [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'C' },
    { from: 'B', to: 'C' },
    { from: 'B', to: 'D' },
    { from: 'C', to: 'E' },
    { from: 'D', to: 'E' },
    { from: 'A', to: 'D' },
    { from: 'A', to: 'E' },
  ],
}

export default function EulerPathPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      computeSteps={() => algoFn(DEFAULT_GRAPH)}
      renderViz={({ current }) => (
        <VizCard borderRadius={10} padding="12px 0" minHeight={380} noInner>
          <EulerViz step={current} />
        </VizCard>
      )}
      legend={LEGEND}
    />
  )
}

function EulerViz({ step }) {
  if (!step) return null
  const { nodes, edges, current, stack, circuit, usedEdges, highlightEdges } = step

  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))
  const usedSet = new Set(usedEdges)
  const highlightSet = new Set(highlightEdges)

  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 16px', flexWrap: 'wrap' }}>
      {/* Graph SVG */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <SvgCanvas viewBox="0 0 600 360" minH={360}>
          {/* Edges */}
          {edges.map((e, idx) => {
            const a = nodeMap[e.from]
            const b = nodeMap[e.to]
            const isUsed = usedSet.has(idx)
            const isHighlight = highlightSet.has(idx)

            let stroke = 'rgba(255,255,255,0.15)'
            let strokeWidth = 2
            if (isHighlight) { stroke = '#a855f7'; strokeWidth = 3 }
            else if (isUsed) { stroke = '#10b981'; strokeWidth = 2.5 }

            return (
              <line key={idx}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={stroke} strokeWidth={strokeWidth}
                style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map(n => {
            const isCurrent = n.id === current
            const inCircuit = circuit.includes(n.id)

            let fill = 'var(--surface-2, #1e1e2e)'
            let stroke = 'rgba(255,255,255,0.15)'
            if (isCurrent) { fill = '#f59e0b'; stroke = '#f59e0b' }
            else if (inCircuit) { fill = '#10b98144'; stroke = '#10b981' }

            return (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={28}
                  fill={fill} stroke={stroke} strokeWidth={2}
                  style={{ transition: 'fill 0.3s, stroke 0.3s' }}
                />
                <text x={n.x} y={n.y + 5} textAnchor="middle"
                  fill="white" fontSize={14} fontWeight={700}
                >
                  {n.id}
                </text>
              </g>
            )
          })}
        </SvgCanvas>
      </div>

      {/* Side panel: stack + circuit */}
      <div style={{ width: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Panel label="栈 (Stack)" color="#3b82f6">
          {stack.length === 0
            ? <Empty />
            : stack.map((id, i) => (
              <Tag key={`${id}-${i}`} color="#3b82f6">{id}</Tag>
            ))}
        </Panel>
        <Panel label="回路 (Circuit)" color="#10b981">
          {circuit.length === 0
            ? <Empty />
            : circuit.map((id, i) => (
              <Tag key={`${id}-${i}`} color="#10b981">{id}</Tag>
            ))}
        </Panel>
        <Panel label="已用边" color="#f59e0b">
          <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>
            {usedEdges.length} / {edges.length}
          </span>
        </Panel>
      </div>
    </div>
  )
}

function Panel({ label, color, children }) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 8,
      background: 'var(--surface)', border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 1, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {children}
      </div>
    </div>
  )
}

function Tag({ color, children }) {
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 4, fontSize: 12,
      background: `${color}22`, color, border: `1px solid ${color}44`,
      fontFamily: 'var(--font-mono)', fontWeight: 600,
    }}>
      {children}
    </span>
  )
}

function Empty() {
  return <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>（空）</span>
}
