// 欧拉回路（Hierholzer 算法）
// 在无向多重图上找一条欧拉回路
// 每条边恰好经过一次

export function eulerPath(graph) {
  const steps = []

  const DEFAULT_GRAPH = {
    nodes: [
      { id: 'A', x: 300, y: 60 },
      { id: 'B', x: 150, y: 160 },
      { id: 'C', x: 450, y: 160 },
      { id: 'D', x: 150, y: 280 },
      { id: 'E', x: 450, y: 280 },
    ],
    edges: [
      { from: 'A', to: 'B' },
      { from: 'A', to: 'C' },
      { from: 'B', to: 'C' },
      { from: 'B', to: 'D' },
      { from: 'C', to: 'E' },
      { from: 'D', to: 'E' },
      { from: 'A', to: 'D' },
      { from: 'A', to: 'E' },
    ],
  }

  const g = graph || DEFAULT_GRAPH
  const nodes = g.nodes
  const edges = g.edges.map((e, i) => ({ ...e, idx: i }))

  // Build adjacency list
  const adj = {}
  nodes.forEach(n => { adj[n.id] = [] })
  edges.forEach((e, i) => {
    adj[e.from].push({ to: e.to, edgeIdx: i })
    adj[e.to].push({ to: e.from, edgeIdx: i })
  })

  // Show degree info
  steps.push({
    nodes: nodes.map(n => ({ ...n })),
    edges: edges.map(e => ({ from: e.from, to: e.to })),
    current: -1, stack: [], circuit: [],
    usedEdges: [], highlightEdges: [],
    phase: 'init', cppLine: 3, pythonLine: 2,
    description: `Hierholzer 算法：图有 ${nodes.length} 个节点和 ${edges.length} 条边`,
  })

  // Check degrees
  for (const n of nodes) {
    const deg = adj[n.id].length
    steps.push({
      nodes: nodes.map(nd => ({ ...nd })),
      edges: edges.map(e => ({ from: e.from, to: e.to })),
      current: n.id, stack: [], circuit: [],
      usedEdges: [], highlightEdges: [],
      phase: 'init', cppLine: 4, pythonLine: 3,
      description: `检查节点 ${n.id} 的度数 = ${deg}（${deg % 2 === 0 ? '偶数' : '奇数'}）`,
    })
  }

  const startNode = nodes[0].id
  const usedEdges = new Set()
  const stack = []
  const circuit = []

  steps.push({
    nodes: nodes.map(n => ({ ...n })),
    edges: edges.map(e => ({ from: e.from, to: e.to })),
    current: startNode, stack: [], circuit: [],
    usedEdges: [], highlightEdges: [],
    phase: 'init', cppLine: 7, pythonLine: 6,
    description: `所有节点度数为偶数 → 存在欧拉回路。从节点 ${startNode} 出发`,
  })

  stack.push(startNode)

  steps.push({
    nodes: nodes.map(n => ({ ...n })),
    edges: edges.map(e => ({ from: e.from, to: e.to })),
    current: startNode, stack: [startNode], circuit: [],
    usedEdges: [], highlightEdges: [],
    phase: 'init', cppLine: 8, pythonLine: 7,
    description: `将起始节点 ${startNode} 压入栈`,
  })

  while (stack.length > 0) {
    const u = stack[stack.length - 1]

    // Find an unused edge from u
    let foundEdge = null
    for (const { to, edgeIdx } of adj[u]) {
      if (!usedEdges.has(edgeIdx)) {
        foundEdge = { to, edgeIdx }
        break
      }
    }

    if (foundEdge) {
      // Show scanning adjacency
      steps.push({
        nodes: nodes.map(n => ({ ...n })),
        edges: edges.map(e => ({ from: e.from, to: e.to })),
        current: u, stack: [...stack], circuit: [...circuit],
        usedEdges: [...usedEdges], highlightEdges: [foundEdge.edgeIdx],
        phase: 'walk', cppLine: 11, pythonLine: 10,
        description: `从栈顶 ${u} 查找未使用边 → 找到边 ${u}-${foundEdge.to}`,
      })

      usedEdges.add(foundEdge.edgeIdx)
      stack.push(foundEdge.to)

      steps.push({
        nodes: nodes.map(n => ({ ...n })),
        edges: edges.map(e => ({ from: e.from, to: e.to })),
        current: foundEdge.to, stack: [...stack], circuit: [...circuit],
        usedEdges: [...usedEdges], highlightEdges: [foundEdge.edgeIdx],
        phase: 'walk', cppLine: 12, pythonLine: 11,
        description: `沿边 ${u}-${foundEdge.to} 前进到 ${foundEdge.to}，压入栈（栈大小=${stack.length}）`,
      })
    } else {
      steps.push({
        nodes: nodes.map(n => ({ ...n })),
        edges: edges.map(e => ({ from: e.from, to: e.to })),
        current: u, stack: [...stack], circuit: [...circuit],
        usedEdges: [...usedEdges], highlightEdges: [],
        phase: 'backtrack', cppLine: 14, pythonLine: 13,
        description: `节点 ${u} 无未使用边 → 回溯`,
      })

      const popped = stack.pop()
      circuit.push(popped)

      steps.push({
        nodes: nodes.map(n => ({ ...n })),
        edges: edges.map(e => ({ from: e.from, to: e.to })),
        current: stack.length > 0 ? stack[stack.length - 1] : popped,
        stack: [...stack], circuit: [...circuit],
        usedEdges: [...usedEdges], highlightEdges: [],
        phase: 'backtrack', cppLine: 15, pythonLine: 14,
        description: `弹出 ${popped} 加入回路（circuit 长度=${circuit.length}）`,
      })
    }
  }

  steps.push({
    nodes: nodes.map(n => ({ ...n })),
    edges: edges.map(e => ({ from: e.from, to: e.to })),
    current: -1, stack: [], circuit: [...circuit],
    usedEdges: [...usedEdges], highlightEdges: [],
    phase: 'done', cppLine: 18, pythonLine: 17,
    description: `欧拉回路完成：${circuit.join(' → ')}（共 ${usedEdges.size} 条边）`,
  })

  return steps
}
