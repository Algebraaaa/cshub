export function dijkstra(graph, startId) {
  const steps = []
  const dist = {}
  const visited = new Set()
  const prev = {}

  graph.nodes.forEach(n => { dist[n.id] = Infinity })
  dist[startId] = 0

  const adjList = {}
  graph.nodes.forEach(n => (adjList[n.id] = []))
  graph.edges.forEach(e => {
    adjList[e.from].push({ id: e.to, weight: e.weight ?? 1 })
    adjList[e.to].push({ id: e.from, weight: e.weight ?? 1 })
  })

  steps.push({
    dist: { ...dist },
    visited: [],
    current: null,
    highlightEdges: [],
    cppLine: 5,
    pythonLine: 5,
    description: `初始化，起点 ${startId} 距离=0，其余=∞`,
  })

  while (visited.size < graph.nodes.length) {
    // pick min dist unvisited
    let u = null
    let minD = Infinity
    for (const n of graph.nodes) {
      if (!visited.has(n.id) && dist[n.id] < minD) {
        minD = dist[n.id]
        u = n.id
      }
    }
    if (u === null) break
    visited.add(u)
    steps.push({
      dist: { ...dist },
      visited: [...visited],
      current: u,
      highlightEdges: [],
      cppLine: 14,
      pythonLine: 9,
      description: `选择距离最小的未访问节点 ${u}（距离=${dist[u]}）`,
    })

    for (const { id: v, weight } of adjList[u]) {
      if (visited.has(v)) continue
      const newDist = dist[u] + weight
      steps.push({
        dist: { ...dist },
        visited: [...visited],
        cppLine: 18,
        pythonLine: 13,
        current: u,
        highlightEdges: [[u, v]],
        description: `松弛边 ${u}→${v}：${dist[u]}+${weight}=${newDist} vs 当前=${dist[v]}`,
      })
      if (newDist < dist[v]) {
        dist[v] = newDist
        prev[v] = u
        steps.push({
          dist: { ...dist },
          visited: [...visited],
          cppLine: 19,
          pythonLine: 14,
          current: u,
          highlightEdges: [[u, v]],
          description: `更新 dist[${v}] = ${newDist}`,
        })
      }
    }
  }
  steps.push({
    dist: { ...dist },
    visited: [...visited],
    cppLine: 24,
    pythonLine: 16,
    current: null,
    highlightEdges: [],
    description: 'Dijkstra 完成',
  })
  return steps
}
