export function kruskal(graph) {
  const steps = [];
  const nodes = graph.nodes.map(n => n.id);
  const edges = graph.edges.map(e => ({ from: e.from, to: e.to, weight: e.weight ?? 1 }));

  // union-find
  const parent = {};
  nodes.forEach(n => parent[n] = n);
  function find(x) { return parent[x] === x ? x : (parent[x] = find(parent[x])); }
  function union(a, b) { parent[find(a)] = find(b); }

  steps.push({ visited: [], current: null, highlightEdges: [], cppLine: 5, pythonLine: 2, description: 'Kruskal 初始化：按权重排序所有边' });

  edges.sort((a, b) => a.weight - b.weight);

  const mst = [];
  let total = 0;

  for (const e of edges) {
    steps.push({ 
      visited: [...new Set(mst.flat())], current: null, highlightEdges: [[e.from, e.to]], 
      cppLine: 8, pythonLine: 5,
      description: `考虑边 ${e.from} - ${e.to}（权重 ${e.weight}）` 
    });
    
    const ra = find(e.from), rb = find(e.to);
    if (ra !== rb) {
      union(ra, rb);
      mst.push([e.from, e.to]);
      total += e.weight;
      steps.push({ 
        visited: [...new Set(mst.flat())], current: null, highlightEdges: [[e.from, e.to]], 
        cppLine: 10, pythonLine: 7,
        description: `根节点不同（${ra} != ${rb}），将边加入 MST，当前总权重 ${total}` 
      });
    } else {
      steps.push({ 
        visited: [...new Set(mst.flat())], current: null, highlightEdges: [[e.from, e.to]], 
        cppLine: 9, pythonLine: 6,
        description: `根节点相同（均为 ${ra}），跳过此边以防形成环` 
      });
    }
    if (mst.length === nodes.length - 1) break;
  }
  steps.push({ 
    visited: [...new Set(mst.flat())], current: null, highlightEdges: mst.slice(), 
    cppLine: 13, pythonLine: 10,
    description: `Kruskal 完成，最小生成树构建完毕，总权重 ${total}`, 
    mstEdges: mst.slice(), totalWeight: total 
  });
  return steps;
}
