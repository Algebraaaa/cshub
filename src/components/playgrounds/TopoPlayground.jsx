import PlaygroundShell from './PlaygroundShell'

// DAG for topological sort demo
const DAG = {
  nodes: [
    { id: '穿内裤', x: 80,  y: 60  },
    { id: '穿裤子', x: 240, y: 160 },
    { id: '穿袜子', x: 80,  y: 270 },
    { id: '穿鞋子', x: 240, y: 340 },
    { id: '穿衬衫', x: 420, y: 60  },
    { id: '穿领带', x: 420, y: 170 },
    { id: '穿外套', x: 420, y: 290 },
    { id: '系腰带', x: 240, y: 250 },
  ],
  edges: [
    { from: '穿内裤', to: '穿裤子' },
    { from: '穿内裤', to: '系腰带' },
    { from: '穿裤子', to: '穿鞋子' },
    { from: '穿裤子', to: '系腰带' },
    { from: '穿袜子', to: '穿鞋子' },
    { from: '穿衬衫', to: '穿领带' },
    { from: '穿衬衫', to: '穿外套' },
    { from: '穿领带', to: '穿外套' },
    { from: '系腰带', to: '穿外套' },
  ],
}

const W = 540, H = 420
const PRESETS = [{ id: 'dress', label: '穿衣 DAG（8 步）', dag: DAG }]

export default function TopoPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={PRESETS}
      computeSteps={(p) => algoFn(p.dag)}
      renderViz={({ current }) => <TopoPanel current={current} />}
    >
      <Legend />
    </PlaygroundShell>
  )
}

function TopoPanel({ current }) {
  const nodeMap = Object.fromEntries(DAG.nodes.map(n => [n.id, n]))
  const visited = new Set(current?.visited || [])
  const queued = new Set(current?.queue || [])
  const isCurrent = current?.current

  return (
    <div className="mb-4 grid grid-cols-[1fr_auto] gap-4">
      <div className="overflow-hidden rounded-glass-md border border-border-soft bg-surface">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill="rgba(255,255,255,0.2)" />
            </marker>
            <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill="#8b5cf6" />
            </marker>
          </defs>
          {DAG.edges.map((e, idx) => {
            const a = nodeMap[e.from], b = nodeMap[e.to]
            const dx = b.x - a.x, dy = b.y - a.y
            const len = Math.sqrt(dx * dx + dy * dy)
            const ux = dx / len, uy = dy / len, r = 28
            const x1 = a.x + ux * r, y1 = a.y + uy * r
            const x2 = b.x - ux * (r + 8), y2 = b.y - uy * (r + 8)
            const isRelaxed = current?.relaxedEdges?.includes(e.to) && e.from === isCurrent
            return (
              <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isRelaxed ? '#8b5cf6' : 'rgba(255,255,255,0.12)'}
                strokeWidth={isRelaxed ? 2.5 : 1.5}
                markerEnd={isRelaxed ? 'url(#arrow-active)' : 'url(#arrow)'}
                style={{ transition: 'stroke 0.3s' }} />
            )
          })}
          {DAG.nodes.map(n => {
            const isDone = visited.has(n.id)
            const isQ = queued.has(n.id)
            const isCur = n.id === isCurrent
            let fill, stroke
            if (isCur)       { fill = '#f59e0b'; stroke = '#f59e0b' }
            else if (isDone) { fill = '#059669'; stroke = '#10b981' }
            else if (isQ)    { fill = '#7c3aed'; stroke = '#8b5cf6' }
            else             { fill = 'var(--surface-2, #1e1e2e)'; stroke = 'rgba(255,255,255,0.15)' }
            const inDeg = current?.inDegree?.[n.id] ?? 0
            return (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={28} fill={fill} stroke={stroke} strokeWidth={2}
                  style={{ transition: 'fill 0.3s, stroke 0.3s' }} />
                <text x={n.x} y={n.y - 4} textAnchor="middle" fill="white" fontSize={9} fontWeight={700}>{n.id}</text>
                <text x={n.x} y={n.y + 9} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={10}>
                  in:{inDeg}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="flex min-w-[160px] flex-col gap-3">
        <Panel label="队列（入度=0）" color="#8b5cf6">
          {current?.queue?.length > 0
            ? current.queue.map((id, i) => <Tag key={i} color="#8b5cf6">{id}</Tag>)
            : <Empty />}
        </Panel>
        <Panel label="拓扑序列" color="#10b981">
          {current?.topoOrder?.length > 0
            ? current.topoOrder.map((id, i) => <Tag key={i} color="#10b981">{i + 1}. {id}</Tag>)
            : <Empty />}
        </Panel>
      </div>
    </div>
  )
}

function Legend() {
  return (
    <div className="mb-3 flex flex-wrap gap-4 text-[11px] text-fg-muted">
      <Dot color="#f59e0b" label="当前处理" />
      <Dot color="#8b5cf6" label="队列中（入度=0）" />
      <Dot color="#059669" label="已加入拓扑序" />
    </div>
  )
}

function Panel({ label, color, children }) {
  return (
    <div className="flex-1 rounded-lg border border-border-soft bg-surface px-3 py-2.5">
      <div className="mb-2 text-[10px] font-bold tracking-[0.06em]" style={{ color }}>{label}</div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}

function Tag({ color, children }) {
  return (
    <span className="rounded px-2 py-0.5 font-mono text-[11px] font-semibold"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {children}
    </span>
  )
}

function Empty() {
  return <span className="text-[11px] text-fg-faint">（空）</span>
}

function Dot({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}
