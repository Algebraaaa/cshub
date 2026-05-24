import { useState } from 'react'
import GraphViz from '../GraphViz'
import PlaygroundShell from './PlaygroundShell'
import { ToolbarBtn } from './shared'

const DEFAULT_GRAPH = {
  nodes: [
    { id: 'A', x: 300, y: 60 },
    { id: 'B', x: 150, y: 160 },
    { id: 'C', x: 450, y: 160 },
    { id: 'D', x: 80, y: 280 },
    { id: 'E', x: 230, y: 280 },
    { id: 'F', x: 380, y: 280 },
    { id: 'G', x: 520, y: 280 },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 3 },
    { from: 'A', to: 'C', weight: 1 },
    { from: 'B', to: 'C', weight: 3 },
    { from: 'B', to: 'D', weight: 4 },
    { from: 'B', to: 'E', weight: 2 },
    { from: 'C', to: 'F', weight: 6 },
    { from: 'C', to: 'G', weight: 5 },
    { from: 'D', to: 'E', weight: 4 },
    { from: 'E', to: 'F', weight: 1 },
    { from: 'F', to: 'G', weight: 2 },
    { from: 'E', to: 'G', weight: 7 },
  ],
}

export default function GraphPlayground({ algoFn, algoSlug }) {
  const [selectedEdge, setSelectedEdge] = useState(null)
  const isWeighted = algoSlug === 'dijkstra' || algoSlug === 'bellmanford'
  const isBfs = algoSlug === 'bfs'

  return (
    <PlaygroundShell
      initialState={{ start: 'A' }}
      derivePayload={s => s.start}
      computeSteps={start => algoFn(DEFAULT_GRAPH, start)}
      extraToolbar={({ state, setState, ctrl }) => (
        <>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginRight: 4 }}>
            起点：
          </span>
          {DEFAULT_GRAPH.nodes.map(n => (
            <ToolbarBtn
              key={n.id}
              active={state.start === n.id}
              onClick={() => { setState(s => ({ ...s, start: n.id })); ctrl.reset() }}
            >
              {n.id}
            </ToolbarBtn>
          ))}
        </>
      )}
      renderViz={({ current }) => (
        <>
          {/* Main viz + MST side panel */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <GraphViz graph={DEFAULT_GRAPH} stepData={current} selectedEdge={selectedEdge} />
            </div>
            {current?.mstEdges && (
              <div style={{ width: 220 }}>
                <MstPanel
                  edges={current.mstEdges}
                  totalWeight={current.totalWeight}
                  graph={DEFAULT_GRAPH}
                  selectedEdge={selectedEdge}
                  setSelectedEdge={setSelectedEdge}
                />
              </div>
            )}
          </div>

          {/* MST summary row */}
          {current?.mstEdges && (
            <div style={{ marginTop: 8, padding: 12, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                最小生成树 (MST) 汇总
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                总权重：<span style={{ fontWeight: 800, color: 'var(--accent)' }}>{current.totalWeight}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                边集：{current.mstEdges.map((e, i) => (
                  <span key={i} style={{ display: 'inline-block', marginRight: 8, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {e[0]}-{e[1]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dijkstra / Bellman-Ford DIST array */}
          {isWeighted && current?.dist && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em' }}>
                DIST 数组
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(current.dist).map(([k, v]) => (
                  <span key={k} style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 12,
                    fontFamily: 'var(--font-mono)', fontWeight: 500,
                    background: current.visited?.includes(k) ? 'var(--accent-soft)' : 'var(--surface)',
                    border: `1px solid ${current.visited?.includes(k) ? 'var(--accent-border)' : 'var(--border)'}`,
                    color: current.visited?.includes(k) ? 'var(--accent-light)' : 'var(--text-secondary)',
                    transition: 'all 0.3s',
                  }}>
                    {k}: {v === Infinity ? '∞' : v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* BFS queue / DFS stack */}
          {(isBfs || algoSlug === 'dfs') && current && (
            <DSBar
              label={isBfs ? '队列 (FIFO，从左出)' : '栈 (LIFO，从右出)'}
              items={isBfs ? (current.queue || []) : (current.stack || [])}
            />
          )}
        </>
      )}
    />
  )
}

// ─── Sub-components ───────────────────────────────────────────

function MstPanel({ edges, totalWeight, graph, selectedEdge, setSelectedEdge }) {
  return (
    <div style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', height: '100%' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>MST 边</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
        总权重：<span style={{ fontWeight: 800, color: 'var(--accent)' }}>{totalWeight}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {edges.map((e, i) => {
          const edgeObj = graph.edges.find(ed =>
            (ed.from === e[0] && ed.to === e[1]) || (ed.from === e[1] && ed.to === e[0])
          )
          const wt = edgeObj ? edgeObj.weight : '-'
          const isSel = selectedEdge &&
            ((selectedEdge[0] === e[0] && selectedEdge[1] === e[1]) ||
             (selectedEdge[0] === e[1] && selectedEdge[1] === e[0]))
          return (
            <button key={i}
              onClick={() => setSelectedEdge(isSel ? null : [e[0], e[1]])}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
                background: isSel ? 'var(--accent-soft)' : 'transparent',
                border: `1px solid ${isSel ? 'var(--accent-border)' : 'var(--border)'}`,
              }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{e[0]} - {e[1]}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>{wt}</span>
            </button>
          )
        })}
        <button
          onClick={() => setSelectedEdge(null)}
          style={{ marginTop: 8, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>
          清除选择
        </button>
      </div>
    </div>
  )
}

function DSBar({ label, items }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em' }}>
        {label}
      </div>
      <div style={{
        display: 'flex', gap: 6,
        padding: '8px 12px',
        minHeight: 40,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        alignItems: 'center',
      }}>
        {items.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>（空）</span>}
        {items.map((it, i) => (
          <span key={`${it}-${i}`} style={{
            padding: '4px 12px',
            borderRadius: 4,
            background: 'var(--accent)',
            color: 'white',
            fontSize: 12,
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            animation: 'pop 0.25s ease-out',
          }}>{it}</span>
        ))}
      </div>
    </div>
  )
}
