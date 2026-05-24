// Steps: { dist, visited, current, highlightEdges, description, round }
export function bellmanFord(graph, startId) {
  const steps = []
  const dist = {}
  const prev = {}

  graph.nodes.forEach(n => { dist[n.id] = Infinity })
  dist[startId] = 0

  // 把无向边展开为两个方向，与 Dijkstra 行为保持一致
  const directedEdges = []
  graph.edges.forEach(e => {
    const w = e.weight ?? 1
    directedEdges.push({ from: e.from, to: e.to, weight: w })
    directedEdges.push({ from: e.to, to: e.from, weight: w })
  })

  const reachable = (d) => Object.entries(d).filter(([, v]) => v < Infinity).map(([k]) => k)

  steps.push({
    dist: { ...dist },
    visited: reachable(dist),
    current: startId,
    highlightEdges: [],
    round: 0,
    cppLine: 6,
    pythonLine: 4,
    description: `初始化：dist[${startId}]=0，其余=∞。将进行 V-1=${graph.nodes.length - 1} 轮松弛`,
  })

  const V = graph.nodes.length
  for (let i = 1; i < V; i++) {
    let updatedThisRound = false
    steps.push({
      dist: { ...dist },
      visited: reachable(dist),
      current: null,
      highlightEdges: [],
      round: i,
      cppLine: 8, pythonLine: 6,
      description: `第 ${i} 轮：依次尝试松弛所有 ${directedEdges.length} 条有向边`,
    })

    for (const e of directedEdges) {
      if (dist[e.from] === Infinity) continue
      const newDist = dist[e.from] + e.weight
      steps.push({
        dist: { ...dist },
        visited: reachable(dist),
        current: e.to,
        highlightEdges: [[e.from, e.to]],
        round: i,
        cppLine: 11, pythonLine: 9,
        description: `松弛 ${e.from}→${e.to}：dist[${e.from}]+${e.weight}=${newDist} vs dist[${e.to}]=${dist[e.to] === Infinity ? '∞' : dist[e.to]}`,
      })
      if (newDist < dist[e.to]) {
        dist[e.to] = newDist
        prev[e.to] = e.from
        updatedThisRound = true
        steps.push({
          dist: { ...dist },
          visited: reachable(dist),
          current: e.to,
          highlightEdges: [[e.from, e.to]],
          round: i,
          cppLine: 12, pythonLine: 10,
          description: `更新 dist[${e.to}] = ${newDist}`,
        })
      }
    }

    if (!updatedThisRound) {
      steps.push({
        dist: { ...dist },
        visited: reachable(dist),
        current: null,
        highlightEdges: [],
        round: i,
        cppLine: 16, pythonLine: 12,
        description: `第 ${i} 轮无更新，提前收敛`,
      })
      break
    }
  }

  // 第 V 轮再扫一遍以检测负环
  let hasNegativeCycle = false
  for (const e of directedEdges) {
    if (dist[e.from] !== Infinity && dist[e.from] + e.weight < dist[e.to]) {
      hasNegativeCycle = true
      break
    }
  }

  steps.push({
    dist: { ...dist },
    visited: [],
    current: null,
    highlightEdges: [],
    round: V,
    cppLine: 25, pythonLine: 19,
    description: hasNegativeCycle
      ? '检测到负权环！此图存在权重总和为负的环路'
      : 'Bellman-Ford 完成，未检测到负环',
  })
  return steps
}
