// pseudoLine: 1:MakeSet  2:parent/size init  4:Find proc  5:if parent≠x
// 6:path compress  7:return root  9:Union proc  10:find roots
// 11:if same  12:swap  13:parent[ry]←rx  14:size update
export function unionFind(n, ops) {
  const parent = Array.from({ length: n }, (_, i) => i)
  const size = Array.from({ length: n }, () => 1)
  const steps = []

  function snapshot(active, pathNodes, action, cppLine, pythonLine, desc) {
    steps.push({ parent: [...parent], size: [...size], active, pathNodes, action, cppLine, pythonLine, description: desc })
  }

  function findRoot(x) {
    const path = []
    let curr = x
    while (parent[curr] !== curr) { path.push(curr); curr = parent[curr] }
    path.push(curr)
    for (const node of path.slice(0, -1)) parent[node] = curr
    return { root: curr, path }
  }

  snapshot([], [], 'init', 5, 3, `初始化 ${n} 个独立集合，parent[i] = i，每个节点自成一组。`)

  for (const op of ops) {
    if (op.type === 'union') {
      const { a, b } = op
      const { root: ra, path: pa } = findRoot(a)
      const { root: rb, path: pb } = findRoot(b)
      const allPath = [...new Set([...pa, ...pb])]

      if (ra === rb) {
        snapshot([a, b], allPath, 'same', 14, 13,
          `Union(${a}, ${b})：两者已在同一集合（根 ${ra}），跳过。`)
        continue
      }

      if (size[ra] < size[rb]) {
        parent[ra] = rb; size[rb] += size[ra]
      } else {
        parent[rb] = ra; size[ra] += size[rb]
      }
      const newRoot = size[ra] >= size[rb] ? ra : rb
      snapshot([a, b], allPath, 'union', 16, 17,
        `Union(${a}, ${b})：按大小合并，新集合根 ${newRoot}，大小 ${size[newRoot]}。`)
    } else if (op.type === 'find') {
      const { x } = op
      const { root, path } = findRoot(x)
      snapshot([x], path, 'find', 9, 8,
        `Find(${x})：路径压缩，路径 [${path.join('→')}] 上所有节点直接指向根 ${root}。`)
    }
  }

  return steps
}
