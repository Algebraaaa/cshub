export function mcmf(flowGraph) {
  const steps = []
  const { nodes, edges: rawEdges, source, sink } = flowGraph

  const edgeList = []  // {from, to, cap, flow, cost, rev}
  const adj = {}
  nodes.forEach(n => (adj[n.id] = []))

  rawEdges.forEach(e => {
    const fwd = { from: e.from, to: e.to, cap: e.cap, flow: 0, cost: e.cost, rev: edgeList.length + 1 }
    const bwd = { from: e.to, to: e.from, cap: 0, flow: 0, cost: -e.cost, rev: edgeList.length }
    edgeList.push(fwd, bwd)
    adj[e.from].push(edgeList.length - 2)
    adj[e.to].push(edgeList.length - 1)
  })

  function getEdgeState() {
    const result = []
    for (let i = 0; i < edgeList.length; i += 2) {
      result.push({
        from: edgeList[i].from,
        to: edgeList[i].to,
        cap: edgeList[i].cap,
        flow: edgeList[i].flow,
        cost: edgeList[i].cost,
      })
    }
    return result
  }

  let totalFlow = 0, totalCost = 0

  function snap(desc, cppLine, pythonLine, extra = {}) {
    steps.push({
      nodes: nodes.map(n => n.id),
      edges: getEdgeState(),
      dist: extra.dist ? { ...extra.dist } : {},
      current: extra.current ?? null,
      augmentPath: extra.augmentPath ?? [],
      maxFlow: totalFlow,
      minCost: totalCost,
      phase: extra.phase ?? 'init',
      highlightEdges: extra.highlightEdges ?? [],
      cppLine,
      pythonLine,
      description: desc,
    })
  }

  snap('MCMF 初始化，准备 SPFA 寻找最小费用增广路', 1, 1, { phase: 'init' })

  function spfa() {
    const dist = {}, inQueue = {}, prevEdge = {}, prevNode = {}
    nodes.forEach(n => { dist[n.id] = Infinity; inQueue[n.id] = false })
    dist[source] = 0
    const queue = [source]
    inQueue[source] = true

    snap(`SPFA 开始：从 ${source} 寻找最短路`, 5, 4, { phase: 'spfa', dist, current: source })

    while (queue.length > 0) {
      const u = queue.shift()
      inQueue[u] = false

      for (const idx of adj[u]) {
        const e = edgeList[idx]
        if (e.flow < e.cap && dist[e.to] > dist[u] + e.cost) {
          dist[e.to] = dist[u] + e.cost
          prevNode[e.to] = u
          prevEdge[e.to] = idx
          if (!inQueue[e.to]) {
            queue.push(e.to)
            inQueue[e.to] = true
          }
          snap(`SPFA 松弛：${u}→${e.to}，dist[${e.to}]=${dist[e.to]}（费用=${e.cost}）`, 11, 9, {
            phase: 'spfa', dist, current: e.to,
            highlightEdges: [[e.from, e.to]],
          })
        }
      }
    }

    if (dist[sink] === Infinity) {
      snap(`SPFA 完成：汇点 ${sink} 不可达，算法终止`, 15, 13, { phase: 'spfa_done', dist })
      return null
    }

    // Trace augmenting path
    const path = []
    let bottleneck = Infinity
    let cur = sink
    while (cur !== source) {
      const idx = prevEdge[cur]
      const e = edgeList[idx]
      path.push([e.from, e.to])
      bottleneck = Math.min(bottleneck, e.cap - e.flow)
      cur = prevNode[cur]
    }
    path.reverse()

    snap(`SPFA 找到增广路，瓶颈流量=${bottleneck}，单位费用=${dist[sink]}`, 18, 16, {
      phase: 'spfa_done', dist, augmentPath: path,
    })

    // Augment flow along path
    cur = sink
    while (cur !== source) {
      const idx = prevEdge[cur]
      edgeList[idx].flow += bottleneck
      edgeList[edgeList[idx].rev].flow -= bottleneck
      cur = prevNode[cur]
    }

    totalFlow += bottleneck
    totalCost += bottleneck * dist[sink]

    snap(`增广完成：推送流量 ${bottleneck}，增加费用 ${bottleneck * dist[sink]}`, 22, 20, {
      phase: 'augment', dist, augmentPath: path,
    })

    return { bottleneck, pathCost: dist[sink] }
  }

  let round = 0
  while (true) {
    round++
    snap(`第 ${round} 轮 SPFA`, 25, 22, { phase: 'round_start' })
    const result = spfa()
    if (!result) break

    snap(`第 ${round} 轮完成：总流量=${totalFlow}，总费用=${totalCost}`, 27, 24, {
      phase: 'round_done',
    })
  }

  snap(`MCMF 完成：最大流=${totalFlow}，最小费用=${totalCost}`, 29, 26, {
    phase: 'done',
  })

  return steps
}
