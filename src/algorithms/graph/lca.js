export function lca(treeData) {
  const steps = []
  const { nodes, edges, queries } = treeData
  const LOG = Math.max(1, Math.ceil(Math.log2(nodes.length + 1)))

  const adj = {}
  nodes.forEach(n => (adj[n.id] = []))
  edges.forEach(e => {
    adj[e.from].push(e.to)
    adj[e.to].push(e.from)
  })

  // Find root (node with no parent field, or first node)
  const root = nodes[0].id
  const depth = {}
  const up = {}  // up[node][k] = 2^k-th ancestor
  nodes.forEach(n => { up[n.id] = new Array(LOG).fill(null) })

  function snap(desc, cppLine, pythonLine, extra = {}) {
    steps.push({
      nodes: nodes.map(n => n.id),
      edges: edges.map(e => [e.from, e.to]),
      depth: { ...depth },
      up: Object.fromEntries(Object.entries(up).map(([k, v]) => [k, [...v]])),
      current: extra.current ?? null,
      queryPair: extra.queryPair ?? null,
      liftingPath: extra.liftingPath ?? [],
      highlightNodes: extra.highlightNodes ?? [],
      phase: extra.phase ?? 'init',
      cppLine,
      pythonLine,
      description: desc,
    })
  }

  snap('LCA 初始化，准备 DFS 计算深度和父节点', 1, 1)

  // Phase 1: DFS to compute depth and parent (up[][0])
  const visited = new Set()
  function dfs(u, p, d) {
    visited.add(u)
    depth[u] = d
    up[u][0] = p
    snap(`DFS(${u})：depth=${d}，parent=${p ?? 'null'}`, 5, 4, {
      current: u,
      phase: 'dfs',
      highlightNodes: [u],
    })
    for (const v of adj[u]) {
      if (!visited.has(v)) {
        dfs(v, u, d + 1)
      }
    }
  }
  dfs(root, null, 0)
  snap('DFS 完成，depth 和 up[][0] 已计算', 8, 7, { phase: 'dfs_done' })

  // Phase 2: Build binary lifting table
  for (let k = 1; k < LOG; k++) {
    for (const n of nodes) {
      const anc = up[n.id][k - 1]
      up[n.id][k] = anc != null ? up[anc][k - 1] : null
    }
    snap(`填充 up[][${k}]：up[node][${k}] = up[up[node][${k - 1}]][${k - 1}]`, 12, 10, {
      phase: 'build_table',
    })
  }
  snap('Binary Lifting 表构建完成', 14, 12, { phase: 'table_done' })

  // Phase 3: Answer queries
  for (let qi = 0; qi < queries.length; qi++) {
    let [u, v] = queries[qi]
    snap(`查询 LCA(${u}, ${v})`, 17, 15, {
      phase: 'query',
      queryPair: [u, v],
      highlightNodes: [u, v],
    })

    // Ensure depth[u] >= depth[v]
    if (depth[u] < depth[v]) {
      ;[u, v] = [v, u]
      snap(`交换：depth[${u}]=${depth[u]} >= depth[${v}]=${depth[v]}`, 19, 17, {
        phase: 'query',
        queryPair: [u, v],
        highlightNodes: [u, v],
      })
    }

    // Lift u to same depth as v
    const path = [u]
    let diff = depth[u] - depth[v]
    for (let k = LOG - 1; k >= 0; k--) {
      if ((diff >> k) & 1) {
        u = up[u][k]
        path.push(u)
        snap(`提升 u：up[][${k}] → u=${u}（剩余差=${depth[u] - depth[v]}）`, 22, 20, {
          phase: 'query',
          queryPair: [u, v],
          liftingPath: [...path],
          highlightNodes: [u, v],
        })
      }
    }

    if (u === v) {
      snap(`u == v == ${u}，LCA = ${u}`, 25, 23, {
        phase: 'query_done',
        queryPair: [u, v],
        highlightNodes: [u],
        liftingPath: [...path],
      })
      continue
    }

    // Lift both up together
    for (let k = LOG - 1; k >= 0; k--) {
      if (up[u][k] !== up[v][k]) {
        snap(`同时提升：up[${u}][${k}]=${up[u][k]} != up[${v}][${k}]=${up[v][k]}`, 29, 26, {
          phase: 'query',
          queryPair: [queries[qi][0], queries[qi][1]],
          highlightNodes: [u, v, up[u][k], up[v][k]],
        })
        u = up[u][k]
        v = up[v][k]
        path.push(u, v)
      }
    }

    const result = up[u][0]
    snap(`LCA = up[${u}][0] = ${result}`, 32, 29, {
      phase: 'query_done',
      queryPair: [queries[qi][0], queries[qi][1]],
      highlightNodes: [result],
      liftingPath: [...path, result],
    })
  }

  snap('所有 LCA 查询完成', 34, 31, { phase: 'done' })
  return steps
}
