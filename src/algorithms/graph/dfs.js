export function dfs(graph, startId) {
  const steps = []
  const visited = new Set()
  const stack = [startId]

  const adjList = {}
  graph.nodes.forEach(n => (adjList[n.id] = []))
  graph.edges.forEach(e => {
    adjList[e.from].push(e.to)
    adjList[e.to].push(e.from)
  })
  // sort neighbors for deterministic order
  Object.keys(adjList).forEach(k => adjList[k].sort())

  // 边界情况：空图或单节点
  if (graph.nodes.length === 0) {
    steps.push({
      visited: [],
      stack: [],
      current: null,
      highlightEdges: [],
      cppLine: 1,
      pythonLine: 1,
      description: '空图，无需遍历',
    })
    return steps
  }

  if (graph.nodes.length === 1) {
    steps.push({
      visited: [graph.nodes[0].id],
      stack: [],
      current: graph.nodes[0].id,
      highlightEdges: [],
      cppLine: 5,
      pythonLine: 2,
      description: `单节点图，节点 ${graph.nodes[0].id} 已访问`,
    })
    return steps
  }

  steps.push({
    visited: [],
    stack: [startId],
    current: null,
    highlightEdges: [],
    cppLine: 5,
    pythonLine: 2,
    description: `从节点 ${startId} 入栈，准备 DFS`,
  })

  while (stack.length > 0) {
    const node = stack.pop()
    if (visited.has(node)) continue
    visited.add(node)
    steps.push({
      visited: [...visited],
      stack: [...stack],
      current: node,
      highlightEdges: [],
      cppLine: 7,
      pythonLine: 6,
      description: `弹出栈顶 ${node}，标记为已访问`,
    })

    // push neighbors in reverse so smallest is popped first
    const neighbors = [...adjList[node]].reverse()
    for (const nb of neighbors) {
      if (!visited.has(nb)) {
        stack.push(nb)
        steps.push({
          visited: [...visited],
          stack: [...stack],
          cppLine: 14,
          pythonLine: 14,
          current: node,
          highlightEdges: [[node, nb]],
          description: `邻居 ${nb} 未访问，入栈`,
        })
      }
    }
  }
  steps.push({
    visited: [...visited],
    stack: [],
    cppLine: 17,
    pythonLine: 15,
    current: null,
    highlightEdges: [],
    description: 'DFS 完成',
  })
  return steps
}
