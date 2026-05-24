export function prim(graph, startId) {
  const steps = [];
  const nodes = graph.nodes.map(n => n.id);
  const adj = {};
  graph.nodes.forEach(n => (adj[n.id] = []));
  graph.edges.forEach(e => {
    const w = e.weight ?? 1;
    adj[e.from].push({ id: e.to, weight: w });
    adj[e.to].push({ id: e.from, weight: w });
  });

  const visited = new Set();
  const mstEdges = [];
  let totalWeight = 0;

  steps.push({ visited: [], current: null, highlightEdges: [], cppLine: 6, pythonLine: 4, description: `Prim 初始化：min_edge[] = ∞，pq = {0, 起点}` });

  visited.add(startId);
  steps.push({ visited: [...visited], current: startId, highlightEdges: [], cppLine: 6, pythonLine: 4, description: `选择起点 ${startId}` });

  while (visited.size < nodes.length) {
    // Note: The visualization implementation below uses a slightly different logic (find best crossing cut)
    // than the typical PQ-based implementation for easier animation. 
    // We will map it as closely as possible to the provided code.
    
    let best = null;
    for (const u of visited) {
      for (const { id: v, weight } of adj[u]) {
        if (visited.has(v)) continue;
        
        steps.push({ 
          visited: [...visited], current: u, highlightEdges: [[u, v]], 
          cppLine: 12, pythonLine: 13,
          description: `尝试松弛邻居 ${v}：边 ${u}-${v} (w=${weight}) ${best && weight >= best.weight ? '（不是当前最优边，跳过）' : '（当前最优边）'}` 
        });

        if (!best || weight < best.weight) {
          best = { u, v, weight };
        }
      }
    }
    if (!best) break; // disconnected
    
    mstEdges.push([best.u, best.v]);
    totalWeight += best.weight;
    visited.add(best.v);
    steps.push({ 
      visited: [...visited], current: best.v, highlightEdges: [[best.u, best.v]], 
      cppLine: 10, pythonLine: 11,
      description: `找到本轮最小边 ${best.u}-${best.v}，将节点 ${best.v} 加入 MST` 
    });
  }
  steps.push({ 
    visited: [...visited], current: null, highlightEdges: [], 
    cppLine: 18, pythonLine: 15,
    description: `Prim 完成，生成树构建完毕，总权重 ${totalWeight}`, 
    mstEdges: mstEdges.slice(), totalWeight 
  });
  return steps;
}
