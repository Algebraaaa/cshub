import PlaygroundShell from './PlaygroundShell'
import SvgCanvas from '../svg/SvgCanvas'

const DEFAULT_TREE = {
  nodes: [
    { id: 'A', x: 300, y: 40 },
    { id: 'B', x: 150, y: 110 }, { id: 'C', x: 450, y: 110 },
    { id: 'D', x: 80, y: 190 }, { id: 'E', x: 220, y: 190 },
    { id: 'F', x: 380, y: 190 }, { id: 'G', x: 520, y: 190 },
    { id: 'H', x: 150, y: 270 },
  ],
  edges: [
    { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
    { from: 'B', to: 'D' }, { from: 'B', to: 'E' },
    { from: 'C', to: 'F' }, { from: 'C', to: 'G' },
    { from: 'D', to: 'H' },
  ],
  queries: [['H', 'E'], ['H', 'G'], ['F', 'G'], ['D', 'G']],
}

export default function LCAPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={[{ id: 'default', label: '默认树 + 4 组查询' }]}
      computeSteps={() => algoFn(DEFAULT_TREE)}
      renderViz={({ current }) => <LCAViz stepData={current} tree={DEFAULT_TREE} />}
    />
  )
}

function LCAViz({ stepData, tree }) {
  if (!stepData) return null
  const { depth, up, current, queryPair, liftingPath, highlightNodes, phase } = stepData
  const nodeMap = {}
  tree.nodes.forEach(n => (nodeMap[n.id] = n))
  const hlSet = new Set(highlightNodes || [])
  const pathSet = new Set(liftingPath || [])

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 300 }}>
        <SvgCanvas viewBox="0 0 600 320">
          {tree.edges.map((e, i) => {
            const a = nodeMap[e.from], b = nodeMap[e.to]
            if (!a || !b) return null
            const onPath = pathSet.has(e.from) && pathSet.has(e.to)
            return (
              <line key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={onPath ? 'var(--yellow)' : 'var(--border)'}
                strokeWidth={onPath ? 3 : 1.5}
                opacity={onPath ? 1 : 0.6}
                style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
              />
            )
          })}
          {tree.nodes.map(n => {
            const isCurrent = current === n.id
            const isHL = hlSet.has(n.id)
            const isQuery = queryPair?.includes(n.id)
            const d = depth?.[n.id]
            return (
              <g key={n.id} style={{ transition: 'all 0.3s' }}>
                {isCurrent && (
                  <circle cx={n.x} cy={n.y} r={26} fill="none" stroke="var(--yellow)" strokeWidth={2} opacity={0.5}>
                    <animate attributeName="r" values="20;28;20" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={n.x} cy={n.y} r={20}
                  fill={isQuery ? 'var(--accent)' : isCurrent ? 'var(--yellow)' : isHL ? 'var(--green)' : 'var(--surface)'}
                  stroke={isQuery ? 'var(--accent)' : isCurrent ? 'var(--yellow)' : isHL ? 'var(--green)' : 'var(--border)'}
                  strokeWidth={2}
                  style={{ transition: 'fill 0.3s, stroke 0.3s' }}
                />
                <text x={n.x} y={n.y + 5} textAnchor="middle" fill="white" fontSize={12} fontWeight="bold">{n.id}</text>
                {d != null && (
                  <text x={n.x} y={n.y + 34} textAnchor="middle" fill="var(--text-secondary)" fontSize={10}>
                    d={d}
                  </text>
                )}
              </g>
            )
          })}
        </SvgCanvas>
      </div>
      <div style={{
        width: 200, padding: 12, borderRadius: 8,
        background: 'var(--surface)', border: '1px solid var(--border)',
        fontSize: 12, flexShrink: 0, overflow: 'auto', maxHeight: 320,
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>查询信息</div>
        {queryPair && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
              LCA({queryPair[0]}, {queryPair[1]})
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
              阶段: {phase === 'query_done' ? '已找到' : phase === 'query' ? '查询中' : phase}
            </div>
          </div>
        )}
        {up && Object.keys(up).length > 0 && (
          <>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              up 表 (前 3 列)
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ color: 'var(--text-tertiary)' }}>
                  <th style={{ textAlign: 'left', padding: '2px 4px' }}>节点</th>
                  <th style={{ textAlign: 'center', padding: '2px 4px' }}>2^0</th>
                  <th style={{ textAlign: 'center', padding: '2px 4px' }}>2^1</th>
                  <th style={{ textAlign: 'center', padding: '2px 4px' }}>2^2</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(up).map(([node, ancestors]) => (
                  <tr key={node} style={{ color: hlSet.has(node) ? 'var(--accent)' : 'var(--text-secondary)' }}>
                    <td style={{ padding: '2px 4px', fontWeight: 600 }}>{node}</td>
                    {[0, 1, 2].map(k => (
                      <td key={k} style={{ textAlign: 'center', padding: '2px 4px' }}>
                        {ancestors[k] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <div style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>图例</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <LegendItem color="var(--yellow)" label="当前处理节点" />
            <LegendItem color="var(--accent)" label="查询节点" />
            <LegendItem color="var(--green)" label="提升路径节点" />
          </div>
        </div>
      </div>
    </div>
  )
}

function LegendItem({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      {label}
    </span>
  )
}
