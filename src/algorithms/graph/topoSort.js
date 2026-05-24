// Kahn's BFS-based topological sort
// Step shape:
// {
//   visited: string[],      // nodes removed from graph (finalized)
//   queue: string[],        // current zero-in-degree queue
//   current: string|null,   // node being processed this step
//   topoOrder: string[],    // result so far
//   inDegree: {[id]: number}, // remaining in-degree
//   relaxedEdges: string[], // neighbor nodes whose in-degree just decremented
//   description,
// }
export function topoSort(graph) {
  const steps = []
  const nodeIds = graph.nodes.map(n => n.id)

  // Build adjacency list and in-degree map
  const adj = Object.fromEntries(nodeIds.map(id => [id, []]))
  const inDeg = Object.fromEntries(nodeIds.map(id => [id, 0]))

  for (const e of graph.edges) {
    adj[e.from].push(e.to)
    inDeg[e.to]++
  }

  const topoOrder = []
  const visited = []
  const queue = nodeIds.filter(id => inDeg[id] === 0).sort()

  const snap = (extra) => ({
    visited: [...visited],
    queue: [...queue],
    current: null,
    topoOrder: [...topoOrder],
    inDegree: { ...inDeg },
    relaxedEdges: [],
    ...extra,
  })

  steps.push(snap({
    description: `Kahn 算法：找到所有入度为 0 的节点入队：[${queue.join(', ')}]`,
    cppLine: 8,
    pythonLine: 9
  }))

  while (queue.length > 0) {
    const u = queue.shift()
    visited.push(u)
    topoOrder.push(u)

    steps.push(snap({
      current: u,
      cppLine: 13,
      pythonLine: 13,
      description: `出队 ${u}，加入拓扑序列：[${topoOrder.join(' → ')}]`,
    }))

    const relaxed = []
    for (const v of adj[u]) {
      inDeg[v]--
      relaxed.push(v)
      if (inDeg[v] === 0) {
        queue.push(v)
        queue.sort()
      }
    }

    if (relaxed.length > 0) {
      steps.push(snap({
        current: u,
        relaxedEdges: relaxed,
        cppLine: 15,
        pythonLine: 15,
        description: `移除 ${u} 的出边，邻居 [${relaxed.join(', ')}] 入度各 -1${queue.length ? `，新入队：[${queue.join(', ')}]` : ''}`,
      }))
    }
  }

  const hasCycle = topoOrder.length < nodeIds.length
  steps.push(snap({
    cppLine: hasCycle ? 18 : 19,
    pythonLine: hasCycle ? 20 : 21,
    description: hasCycle
      ? `检测到环！只处理了 ${topoOrder.length}/${nodeIds.length} 个节点`
      : `拓扑排序完成：${topoOrder.join(' → ')}`,
  }))

  return steps
}
