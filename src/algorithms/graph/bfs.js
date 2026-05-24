// pseudoLine: 1:procedure  2:queue←[start]  3:visited←{start}
// 4:while queue  5:node←dequeue  6:for neighbor  7:if not visited
// 8:visited.add  9:queue.enqueue  10:return visited
export function bfs(graph, startId) {
  const steps = []
  const visited = new Set()
  const queue = [startId]
  const parent = {}
  visited.add(startId)

  const adjList = {}
  graph.nodes.forEach(n => (adjList[n.id] = []))
  graph.edges.forEach(e => {
    adjList[e.from].push(e.to)
    adjList[e.to].push(e.from)
  })

  // 边界情况：空图或单节点
  if (graph.nodes.length === 0) {
    steps.push({
      visited: [], queue: [], current: null, highlightEdges: [],
      pseudoLine: 1,
      cppLine: 1,
      pythonLine: 1,
      description: '空图，无需遍历',
    })
    return steps
  }

  if (graph.nodes.length === 1) {
    steps.push({
      visited: [graph.nodes[0].id], queue: [], current: graph.nodes[0].id, highlightEdges: [],
      pseudoLine: 2,
      cppLine: 5,
      pythonLine: 4,
      description: `单节点图，节点 ${graph.nodes[0].id} 已访问`,
    })
    return steps
  }

  steps.push({
    visited: [...visited], queue: [...queue], current: null, highlightEdges: [],
    pseudoLine: 2,
    cppLine: 5, pythonLine: 4,
    description: `从节点 ${startId} 开始 BFS，初始化队列和 visited 集合`,
  })

  while (queue.length > 0) {
    const node = queue.shift()
    steps.push({
      visited: [...visited], queue: [...queue], current: node, highlightEdges: [],
      pseudoLine: 5,
      cppLine: 8, pythonLine: 8,
      description: `出队，访问节点 ${node}`,
    })
    for (const neighbor of adjList[node]) {
      steps.push({
        visited: [...visited], queue: [...queue], current: node,
        highlightEdges: [[node, neighbor]],
        pseudoLine: 7,
        cppLine: 11, pythonLine: 10,
        description: `检查邻居 ${neighbor}：${visited.has(neighbor) ? '已访问，跳过' : '未访问'}`,
      })
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        parent[neighbor] = node
        queue.push(neighbor)
        steps.push({
          visited: [...visited], queue: [...queue], current: node,
          highlightEdges: [[node, neighbor]],
          cppLine: 14, pythonLine: 13,
          pseudoLine: 9,
          description: `发现邻居 ${neighbor}，加入队列`,
        })
      }
    }
  }
  steps.push({
    visited: [...visited], queue: [], current: null, highlightEdges: [],
    cppLine: 18, pythonLine: 14,
    pseudoLine: 10,
    description: 'BFS 完成，所有可达节点已访问',
  })
  return steps
}
