import PlaygroundShell from './PlaygroundShell'
import SvgCanvas from '../svg/SvgCanvas'

const DEFAULT_GRAPH = {
  nodes: [
    { id: 'A', x: 300, y: 50 }, { id: 'B', x: 150, y: 130 },
    { id: 'C', x: 450, y: 130 }, { id: 'D', x: 80, y: 230 },
    { id: 'E', x: 220, y: 230 }, { id: 'F', x: 380, y: 230 },
    { id: 'G', x: 520, y: 230 }, { id: 'H', x: 150, y: 320 },
  ],
  edges: [
    { from: 'A', to: 'B' }, { from: 'A', to: 'C' },
    { from: 'B', to: 'D' }, { from: 'B', to: 'E' },
    { from: 'C', to: 'F' }, { from: 'C', to: 'G' },
    { from: 'D', to: 'E' }, { from: 'D', to: 'H' },
    { from: 'F', to: 'G' },
  ],
}

export default function TarjanCutpointPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={[{ id: 'default', label: '默认图（8 节点 9 边）' }]}
      computeSteps={() => algoFn(DEFAULT_GRAPH)}
      renderViz={({ current }) => <TarjanViz stepData={current} graph={DEFAULT_GRAPH} />}
    />
  )
}

function TarjanViz({ stepData, graph }) {
  if (!stepData) return null
  const { dfn, low, visited, current, bridges, cutPoints, highlightEdges } = stepData
  const nodeMap = {}
  graph.nodes.forEach(n => (nodeMap[n.id] = n))
  const cutSet = new Set(cutPoints || [])
  const bridgeSet = new Set((bridges || []).map(b => `${b[0]}|${b[1]}`))

  function isBridge(from, to) {
    return bridgeSet.has(`${from}|${to}`) || bridgeSet.has(`${to}|${from}`)
  }
  function isHighlight(from, to) {
    return (highlightEdges || []).some(([a, b]) => (a === from && b === to) || (a === to && b === from))
  }

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 300 }}>
        <SvgCanvas viewBox="0 0 600 380">
          {graph.edges.map((e, i) => {
            const a = nodeMap[e.from], b = nodeMap[e.to]
            if (!a || !b) return null
            const bridge = isBridge(e.from, e.to)
            const hl = isHighlight(e.from, e.to)
            return (
              <line key={i}
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={bridge ? 'var(--red)' : hl ? 'var(--yellow)' : 'var(--border)'}
                strokeWidth={bridge ? 4 : hl ? 3 : 1.5}
                opacity={bridge ? 1 : hl ? 1 : 0.6}
                style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
              />
            )
          })}
          {graph.nodes.map(n => {
            const isCut = cutSet.has(n.id)
            const isCurrent = current === n.id
            const isVisited = (visited || []).includes(n.id)
            return (
              <g key={n.id} style={{ transition: 'all 0.3s' }}>
                {isCurrent && (
                  <circle cx={n.x} cy={n.y} r={28} fill="none" stroke="var(--yellow)" strokeWidth={2} opacity={0.5}>
                    <animate attributeName="r" values="22;30;22" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={n.x} cy={n.y} r={22}
                  fill={isCurrent ? 'var(--yellow)' : isCut ? 'var(--red)' : isVisited ? 'var(--accent)' : 'var(--surface)'}
                  stroke={isCurrent ? 'var(--yellow)' : isCut ? 'var(--red)' : isVisited ? 'var(--accent)' : 'var(--border)'}
                  strokeWidth={2}
                  style={{ transition: 'fill 0.3s, stroke 0.3s' }}
                />
                <text x={n.x} y={n.y + 5} textAnchor="middle" fill="white" fontSize={13} fontWeight="bold">{n.id}</text>
                {dfn?.[n.id] != null && (
                  <>
                    <text x={n.x - 14} y={n.y + 38} textAnchor="middle" fill="var(--blue)" fontSize={10} fontWeight="600">
                      d:{dfn[n.id]}
                    </text>
                    <text x={n.x + 14} y={n.y + 38} textAnchor="middle" fill="var(--green)" fontSize={10} fontWeight="600">
                      l:{low[n.id]}
                    </text>
                  </>
                )}
              </g>
            )
          })}
        </SvgCanvas>
      </div>
      <div style={{
        width: 180, padding: 12, borderRadius: 8,
        background: 'var(--surface)', border: '1px solid var(--border)',
        fontSize: 12, flexShrink: 0,
      }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>检测结果</div>
        <div style={{ marginBottom: 10 }}>
          <div style={{ color: 'var(--red)', fontWeight: 600, marginBottom: 4 }}>割点 ({cutPoints?.length ?? 0})</div>
          <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {cutPoints?.length > 0 ? cutPoints.join(', ') : '—'}
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--red)', fontWeight: 600, marginBottom: 4 }}>桥 ({bridges?.length ?? 0})</div>
          <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            {bridges?.length > 0 ? bridges.map(b => b.join('-')).join(', ') : '—'}
          </div>
        </div>
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>图例</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <LegendItem color="var(--yellow)" label="当前节点" />
            <LegendItem color="var(--red)" label="割点 / 桥" />
            <LegendItem color="var(--accent)" label="已访问" />
            <LegendItem color="var(--blue)" label="dfn 值" />
            <LegendItem color="var(--green)" label="low 值" />
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
