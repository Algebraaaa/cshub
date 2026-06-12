export function tarjanCutpoint(graph) {
  const steps = []
  const adj = {}
  graph.nodes.forEach(n => (adj[n.id] = []))
  graph.edges.forEach(e => {
    adj[e.from].push(e.to)
    adj[e.to].push(e.from)
  })
  Object.keys(adj).forEach(k => adj[k].sort())

  const dfn = {}, low = {}, parent = {}, children = {}
  const visited = new Set()
  const cutPoints = new Set()
  const bridges = []
  let timestamp = 0

  function snap(desc, cppLine, pythonLine, extra = {}) {
    steps.push({
      nodes: graph.nodes.map(n => n.id),
      edges: graph.edges.map(e => [e.from, e.to]),
      dfn: { ...dfn },
      low: { ...low },
      visited: [...visited],
      current: extra.current ?? null,
      stack: [],
      bridges: bridges.map(b => [...b]),
      cutPoints: [...cutPoints],
      highlightEdges: extra.highlightEdges ?? [],
      parent: { ...parent },
      children: { ...children },
      timestamp,
      cppLine,
      pythonLine,
      description: desc,
    })
  }

  snap('Tarjan 算法初始化，准备 DFS 遍历', 1, 1)

  function dfs(u, p) {
    visited.add(u)
    dfn[u] = low[u] = ++timestamp
    parent[u] = p
    children[u] = 0

    snap(`访问节点 ${u}，dfn[${u}]=low[${u}]=${timestamp}`, 5, 4, { current: u })

    for (const v of adj[u]) {
      if (v === p) continue

      if (visited.has(v)) {
        // back edge
        low[u] = Math.min(low[u], dfn[v])
        snap(`回边 ${u}→${v}，low[${u}]=min(low[${u}], dfn[${v}])=${low[u]}`, 10, 8, {
          current: u,
          highlightEdges: [[u, v]],
        })
      } else {
        children[u]++
        snap(`发现树边 ${u}→${v}，递归 DFS(${v})`, 13, 11, {
          current: u,
          highlightEdges: [[u, v]],
        })

        dfs(v, u)

        low[u] = Math.min(low[u], low[v])
        snap(`回溯：low[${u}]=min(low[${u}], low[${v}])=${low[u]}`, 14, 12, {
          current: u,
          highlightEdges: [[u, v]],
        })

        // bridge check
        if (low[v] > dfn[u]) {
          bridges.push([u, v])
          snap(`桥检测：low[${v}]=${low[v]} > dfn[${u}]=${dfn[u]}，边 ${u}-${v} 是桥`, 16, 14, {
            current: u,
            highlightEdges: [[u, v]],
          })
        }

        // cut point check (non-root)
        if (p !== null && low[v] >= dfn[u]) {
          cutPoints.add(u)
          snap(`割点检测（非根）：low[${v}]=${low[v]} >= dfn[${u}]=${dfn[u]}，${u} 是割点`, 19, 17, {
            current: u,
            highlightEdges: [[u, v]],
          })
        }
      }
    }

    // root cut point check
    if (p === null && children[u] > 1) {
      cutPoints.add(u)
      snap(`割点检测（根节点）：${u} 有 ${children[u]} 个子树 > 1，${u} 是割点`, 22, 20, {
        current: u,
      })
    }
  }

  // run DFS from first node (or all components)
  for (const n of graph.nodes) {
    if (!visited.has(n.id)) {
      dfs(n.id, null)
    }
  }

  snap(`Tarjan 算法完成。割点: [${[...cutPoints].join(', ')}]，桥: [${bridges.map(b => b.join('-')).join(', ')}]`, 25, 23)

  return steps
}
