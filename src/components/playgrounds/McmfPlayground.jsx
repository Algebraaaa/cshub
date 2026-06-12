import PlaygroundShell from './PlaygroundShell'
import SvgCanvas from '../svg/SvgCanvas'

const DEFAULT_MCMF = {
  nodes: [
    { id: 'S', x: 60, y: 180 }, { id: 'A', x: 200, y: 80 },
    { id: 'B', x: 200, y: 280 }, { id: 'C', x: 400, y: 80 },
    { id: 'D', x: 400, y: 280 }, { id: 'T', x: 540, y: 180 },
  ],
  edges: [
    { from: 'S', to: 'A', cap: 10, cost: 2 }, { from: 'S', to: 'B', cap: 8, cost: 3 },
    { from: 'A', to: 'C', cap: 5, cost: 1 }, { from: 'A', to: 'D', cap: 7, cost: 4 },
    { from: 'B', to: 'D', cap: 10, cost: 2 }, { from: 'C', to: 'T', cap: 9, cost: 3 },
    { from: 'D', to: 'T', cap: 6, cost: 1 }, { from: 'C', to: 'D', cap: 3, cost: 2 },
  ],
  source: 'S',
  sink: 'T',
}

export default function McmfPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={[{ id: 'default', label: '默认网络（6 节点 8 边）' }]}
      computeSteps={() => algoFn(DEFAULT_MCMF)}
      renderViz={({ current }) => <McmfViz stepData={current} graph={DEFAULT_MCMF} />}
    />
  )
}

function McmfViz({ stepData, graph }) {
  if (!stepData) return null
  const { edges: edgeState, dist, current, augmentPath, maxFlow, minCost, phase, highlightEdges } = stepData
  const nodeMap = {}
  graph.nodes.forEach(n => (nodeMap[n.id] = n))

  const hlSet = new Set((highlightEdges || []).map(e => `${e[0]}|${e[1]}`))
  const pathSet = new Set((augmentPath || []).map(e => `${e[0]}|${e[1]}`))

  function edgeKey(from, to) { return `${from}|${to}` }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <SvgCanvas viewBox="0 0 600 360">
            {(edgeState || []).map((e, i) => {
              const a = nodeMap[e.from], b = nodeMap[e.to]
              if (!a || !b) return null
              const remaining = e.cap - e.flow
              const saturated = remaining <= 0 && e.cap > 0
              const onPath = pathSet.has(edgeKey(e.from, e.to))
              const hl = hlSet.has(edgeKey(e.from, e.to))
              const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
              const dx = b.x - a.x, dy = b.y - a.y
              const len = Math.sqrt(dx * dx + dy * dy) || 1
              const nx = -dy / len * 14, ny = dx / len * 14
              return (
                <g key={i}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={onPath ? 'var(--yellow)' : hl ? 'var(--blue)' : saturated ? 'var(--red)' : 'var(--border)'}
                    strokeWidth={onPath ? 3.5 : hl ? 2.5 : 1.5}
                    opacity={saturated && !hl ? 0.4 : 1}
                    style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
                  />
                  <polygon
                    points={arrowPoints(a.x, a.y, b.x, b.y, 22)}
                    fill={onPath ? 'var(--yellow)' : hl ? 'var(--blue)' : saturated ? 'var(--red)' : 'var(--border)'}
                    opacity={saturated && !hl ? 0.4 : 1}
                  />
                  <text x={mx + nx} y={my + ny} textAnchor="middle" fill="var(--text-secondary)" fontSize={9} fontWeight="600">
                    {e.flow}/{e.cap}
                  </text>
                  <text x={mx + nx} y={my + ny + 11} textAnchor="middle" fill="var(--green)" fontSize={9} fontWeight="500">
                    ${e.cost}
                  </text>
                </g>
              )
            })}
            {graph.nodes.map(n => {
              const isCurrent = current === n.id
              const isSource = n.id === graph.source
              const isSink = n.id === graph.sink
              const d = dist?.[n.id]
              return (
                <g key={n.id} style={{ transition: 'all 0.3s' }}>
                  {isCurrent && (
                    <circle cx={n.x} cy={n.y} r={28} fill="none" stroke="var(--yellow)" strokeWidth={2} opacity={0.5}>
                      <animate attributeName="r" values="22;30;22" dur="1.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={n.x} cy={n.y} r={22}
                    fill={isSource ? 'var(--green)' : isSink ? 'var(--red)' : isCurrent ? 'var(--yellow)' : 'var(--surface)'}
                    stroke={isSource ? 'var(--green)' : isSink ? 'var(--red)' : isCurrent ? 'var(--yellow)' : 'var(--border)'}
                    strokeWidth={2}
                    style={{ transition: 'fill 0.3s, stroke 0.3s' }}
                  />
                  <text x={n.x} y={n.y + 5} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">{n.id}</text>
                  {d != null && d !== Infinity && (
                    <text x={n.x} y={n.y + 38} textAnchor="middle" fill="var(--blue)" fontSize={10} fontWeight="600">
                      d:{d}
                    </text>
                  )}
                  {d === Infinity && (
                    <text x={n.x} y={n.y + 38} textAnchor="middle" fill="var(--text-tertiary)" fontSize={10}>
                      d:∞
                    </text>
                  )}
                </g>
              )
            })}
          </SvgCanvas>
        </div>
        <div style={{
          width: 160, padding: 12, borderRadius: 8,
          background: 'var(--surface)', border: '1px solid var(--border)',
          fontSize: 12, flexShrink: 0,
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>最大流</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--font-mono)', textAlign: 'center', margin: '6px 0' }}>
            {maxFlow ?? 0}
          </div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, marginTop: 8 }}>最小费用</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-mono)', textAlign: 'center', margin: '6px 0' }}>
            {minCost ?? 0}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 8 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>阶段</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
              {phase === 'init' && '初始化'}
              {phase === 'spfa' && 'SPFA 最短路'}
              {phase === 'spfa_done' && 'SPFA 完成'}
              {phase === 'augment' && '增广中'}
              {phase === 'round_start' && '新一轮'}
              {phase === 'round_done' && '轮次完成'}
              {phase === 'done' && '算法完成'}
            </div>
          </div>
          <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>图例</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <LegendItem color="var(--green)" label="源点 S" />
              <LegendItem color="var(--red)" label="汇点 T" />
              <LegendItem color="var(--yellow)" label="增广路径" />
              <LegendItem color="var(--blue)" label="SPFA 松弛" />
              <LegendItem color="var(--green)" label="边费用" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function arrowPoints(x1, y1, x2, y2, offset) {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len, uy = dy / len
  const tipX = x2 - ux * offset, tipY = y2 - uy * offset
  const px = -uy * 5, py = ux * 5
  const bx = tipX - ux * 8, by = tipY - uy * 8
  return `${tipX},${tipY} ${bx + px},${by + py} ${bx - px},${by - py}`
}

function LegendItem({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      {label}
    </span>
  )
}
