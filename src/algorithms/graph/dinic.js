export function dinic(flowGraph) {
  const steps = []
  const { nodes, edges: rawEdges, source, sink } = flowGraph

  // Build adjacency with forward/backward edges
  const edgeList = []  // {from, to, cap, flow, rev}
  const adj = {}
  nodes.forEach(n => (adj[n.id] = []))

  rawEdges.forEach(e => {
    const fwd = { from: e.from, to: e.to, cap: e.cap, flow: 0, rev: edgeList.length + 1 }
    const bwd = { from: e.to, to: e.from, cap: 0, flow: 0, rev: edgeList.length }
    edgeList.push(fwd, bwd)
    adj[e.from].push(edgeList.length - 2)
    adj[e.to].push(edgeList.length - 1)
  })

  function getEdgeState() {
    // Return only forward edges (even indices)
    const result = []
    for (let i = 0; i < edgeList.length; i += 2) {
      result.push({
        from: edgeList[i].from,
        to: edgeList[i].to,
        cap: edgeList[i].cap,
        flow: edgeList[i].flow,
      })
    }
    return result
  }

  function snap(desc, cppLine, pythonLine, extra = {}) {
    steps.push({
      nodes: nodes.map(n => n.id),
      edges: getEdgeState(),
      level: extra.level ? { ...extra.level } : {},
      current: extra.current ?? null,
      augmentPath: extra.augmentPath ?? [],
      flow: extra.flow ?? totalFlow,
      phase: extra.phase ?? 'init',
      highlightEdges: extra.highlightEdges ?? [],
      cppLine,
      pythonLine,
      description: desc,
    })
  }

  let totalFlow = 0
  snap('Dinic 初始化，源点 S，汇点 T', 1, 1, { phase: 'init' })

  function bfs() {
    const level = {}
    nodes.forEach(n => (level[n.id] = -1))
    level[source] = 0
    const queue = [source]

    snap(`BFS 构建层次图，从 ${source} 开始`, 5, 4, { phase: 'bfs', level })

    while (queue.length > 0) {
      const u = queue.shift()
      for (const idx of adj[u]) {
        const e = edgeList[idx]
        if (level[e.to] === -1 && e.flow < e.cap) {
          level[e.to] = level[u] + 1
          queue.push(e.to)
          snap(`BFS：${e.to} 入队，level[${e.to}]=${level[e.to]}`, 10, 8, {
            phase: 'bfs', level, current: e.to,
            highlightEdges: [[e.from, e.to]],
          })
        }
      }
    }

    if (level[sink] === -1) {
      snap(`BFS 完成：汇点 ${sink} 不可达，算法终止`, 13, 11, { phase: 'bfs_done', level })
    } else {
      snap(`BFS 完成：level[${sink}]=${level[sink]}`, 14, 12, { phase: 'bfs_done', level })
    }
    return level
  }

  function dfs(u, pushed, level, iter) {
    if (u === sink) return pushed
    for (; iter[u] < adj[u].length; iter[u]++) {
      const idx = adj[u][iter[u]]
      const e = edgeList[idx]
      if (level[e.to] !== level[u] + 1 || e.flow >= e.cap) continue

      const tr = dfs(e.to, Math.min(pushed, e.cap - e.flow), level, iter)
      if (tr === 0) continue

      e.flow += tr
      edgeList[e.rev].flow -= tr

      const path = [[e.from, e.to]]
      snap(`DFS 增广：${e.from}→${e.to}，推送流量 ${tr}`, 20, 17, {
        phase: 'dfs',
        level,
        current: e.to,
        augmentPath: path,
        highlightEdges: [[e.from, e.to]],
      })
      return tr
    }
    return 0
  }

  let phaseCount = 0
  while (true) {
    phaseCount++
    const level = bfs()
    if (level[sink] === -1) break

    const iter = {}
    nodes.forEach(n => (iter[n.id] = 0))

    snap(`第 ${phaseCount} 阶段：开始 DFS 寻找增广路`, 17, 14, {
      phase: 'dfs_start', level,
    })

    let pushed
    while ((pushed = dfs(source, Infinity, level, iter)) > 0) {
      totalFlow += pushed
      snap(`增广完成，本轮推送 ${pushed}，当前总流量 = ${totalFlow}`, 24, 20, {
        phase: 'augment', level, flow: totalFlow,
      })
    }

    snap(`第 ${phaseCount} 阶段结束，当前总流量 = ${totalFlow}`, 26, 22, {
      phase: 'phase_done', level, flow: totalFlow,
    })
  }

  snap(`Dinic 算法完成，最大流 = ${totalFlow}`, 28, 24, {
    phase: 'done', flow: totalFlow,
  })

  return steps
}
