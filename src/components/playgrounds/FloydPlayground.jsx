import FloydViz from '../FloydViz'
import GraphViz from '../GraphViz'
import PlaygroundShell from './PlaygroundShell'

const FLOYD_GRAPH = {
  nodes: [
    { id: 'A', x: 300, y: 60 },
    { id: 'B', x: 120, y: 200 },
    { id: 'C', x: 480, y: 200 },
    { id: 'D', x: 200, y: 340 },
    { id: 'E', x: 400, y: 340 },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 3 },
    { from: 'A', to: 'C', weight: 8 },
    { from: 'A', to: 'D', weight: -4 },
    { from: 'B', to: 'D', weight: 1 },
    { from: 'B', to: 'E', weight: 7 },
    { from: 'C', to: 'B', weight: 4 },
    { from: 'D', to: 'E', weight: 6 },
    { from: 'E', to: 'C', weight: 2 },
    { from: 'E', to: 'A', weight: 2 },
  ],
}

const PRESETS = [{ id: 'default', label: '默认图（5 节点 9 边）', graph: FLOYD_GRAPH }]

export default function FloydPlayground({ algoFn }) {
  return (
    <PlaygroundShell
      presets={PRESETS}
      computeSteps={(p) => algoFn(p.graph)}
      renderViz={({ current }) => <FloydPanel current={current} graph={FLOYD_GRAPH} />}
    />
  )
}

function FloydPanel({ current, graph }) {
  const graphStep = current ? {
    visited: current.phase === 'done' ? graph.nodes.map(n => n.id) : (current.k != null ? [graph.nodes[current.k]?.id] : []),
    current: current.i != null ? graph.nodes[current.i]?.id : null,
    dist: current.dist ? buildDistObj(current.nodes, current.dist) : null,
  } : null

  return (
    <div className="mb-4 grid grid-cols-2 gap-4">
      <div className="overflow-hidden rounded-glass-md border border-border-soft bg-surface px-3 py-4">
        <div className="section-eyebrow mb-2">图结构</div>
        <GraphViz graph={graph} stepData={graphStep} />
      </div>
      <div className="overflow-auto rounded-glass-md border border-border-soft bg-surface px-3 py-4">
        <div className="section-eyebrow mb-2">距离矩阵 dist[i][j]</div>
        <FloydViz stepData={current} />
      </div>
    </div>
  )
}

function buildDistObj(nodes, dist) {
  const obj = {}
  nodes.forEach((id, i) => {
    let minDist = Infinity
    nodes.forEach((_, j) => { if (dist[j][i] < minDist) minDist = dist[j][i] })
    obj[id] = minDist === Infinity ? Infinity : minDist
  })
  return obj
}
