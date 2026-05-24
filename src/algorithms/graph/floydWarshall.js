// Step shape:
// {
//   dist: number[][],    // n×n distance matrix (Infinity = no path)
//   nodes: string[],     // node labels
//   k: number,           // current intermediate vertex index
//   i: number|null,      // current row being updated
//   j: number|null,      // current column being updated
//   relaxed: boolean,    // was dist[i][j] improved this step?
//   phase: 'init'|'iterate'|'done',
//   description,
// }

const INF = Infinity

export function floydWarshall(graph) {
  const nodeIds = graph.nodes.map(n => n.id)
  const n = nodeIds.length
  const idx = Object.fromEntries(nodeIds.map((id, i) => [id, i]))

  // Build initial dist matrix
  const dist = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : INF))
  )

  for (const e of graph.edges) {
    const u = idx[e.from], v = idx[e.to]
    if (e.weight < dist[u][v]) dist[u][v] = e.weight
    // treat as undirected
    if (e.weight < dist[v][u]) dist[v][u] = e.weight
  }

  const steps = []

  const snap = (extra) => ({
    dist: dist.map(row => [...row]),
    nodes: [...nodeIds],
    k: null, i: null, j: null,
    relaxed: false,
    ...extra,
  })

  steps.push(snap({
    phase: 'init',
    cppLine: 2,
    pythonLine: 2,
    description: `初始化距离矩阵：直接边的权重，自身距离为 0，无边则为 ∞`,
  }))

  for (let k = 0; k < n; k++) {
    steps.push(snap({
      phase: 'iterate',
      k,
      cppLine: 3, pythonLine: 3,
      description: `以 ${nodeIds[k]} 为中间节点，尝试松弛所有 (i, j) 对`,
    }))

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue
        if (dist[i][k] === INF || dist[k][j] === INF) continue

        const newDist = dist[i][k] + dist[k][j]
        const improved = newDist < dist[i][j]

        steps.push(snap({
          phase: 'iterate',
          k, i, j,
          relaxed: improved,
          cppLine: 6, pythonLine: 6,
          description: improved
            ? `dist[${nodeIds[i]}][${nodeIds[j]}]：${dist[i][j] === INF ? '∞' : dist[i][j]} → ${newDist}（经 ${nodeIds[k]}）`
            : `dist[${nodeIds[i]}][${nodeIds[j]}]：${dist[i][j]} ≤ ${newDist}，无需更新`,
        }))

        if (improved) dist[i][j] = newDist
      }
    }
  }

  steps.push(snap({
    phase: 'done',
    cppLine: 13, pythonLine: 9,
    description: '全源最短路径计算完成',
  }))

  return steps
}
