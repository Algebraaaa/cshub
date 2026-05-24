function heuristic(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])
}

export function aStar(grid, startPos, endPos) {
  const rows = grid.length
  const cols = grid[0].length
  const [sr, sc] = startPos
  const [er, ec] = endPos
  const steps = []

  const g = Array.from({ length: rows }, () => Array(cols).fill(Infinity))
  const f = Array.from({ length: rows }, () => Array(cols).fill(Infinity))
  const cameFrom = Array.from({ length: rows }, () => Array(cols).fill(null))
  const open = new Map()
  const closed = new Set()

  g[sr][sc] = 0
  f[sr][sc] = heuristic([sr, sc], [er, ec])
  open.set(`${sr},${sc}`, { r: sr, c: sc })

  function key(r, c) { return `${r},${c}` }

  function snapshot(current, desc, cppLine, pythonLine) {
    steps.push({
      grid: grid.map(r => [...r]),
      g: g.map(r => [...r]),
      f: f.map(r => [...r]),
      open: [...open.keys()].map(k => { const [r, c] = k.split(',').map(Number); return { r, c } }),
      closed: [...closed].map(k => { const [r, c] = k.split(',').map(Number); return { r, c } }),
      current,
      start: [sr, sc],
      end: [er, ec],
      path: null,
      cppLine,
      pythonLine,
      description: desc,
    })
  }

  snapshot(null, `A* 搜索开始：起点 (${sr},${sc})，终点 (${er},${ec})。h(n) 使用曼哈顿距离，f(n)=g(n)+h(n)。`, 11, 9)

  const DIRS = [[-1,0],[1,0],[0,-1],[0,1]]

  while (open.size > 0) {
    let bestKey = null, bestF = Infinity
    for (const [k, node] of open) {
      if (f[node.r][node.c] < bestF) { bestF = f[node.r][node.c]; bestKey = k }
    }
    const cur = open.get(bestKey)
    open.delete(bestKey)

    snapshot(cur, `从 open 集取出 f 值最小节点 (${cur.r},${cur.c})：g=${g[cur.r][cur.c]}，h=${heuristic([cur.r,cur.c],[er,ec])}，f=${f[cur.r][cur.c].toFixed(1)}。`, 14, 12)

    if (cur.r === er && cur.c === ec) {
      const path = []
      let r = er, c = ec
      while (r !== null) {
        path.unshift([r, c])
        const p = cameFrom[r][c]
        if (!p) break
        ;[r, c] = p
      }
      const last = steps[steps.length - 1]
      last.path = path
      last.cppLine = 15
      last.pythonLine = 13
      last.description = `到达终点！最短路径长度 ${g[er][ec]}，路径共 ${path.length} 个节点。`
      return steps
    }

    closed.add(key(cur.r, cur.c))

    for (const [dr, dc] of DIRS) {
      const nr = cur.r + dr, nc = cur.c + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
      if (grid[nr][nc] === 1) continue
      if (closed.has(key(nr, nc))) continue

      const newG = g[cur.r][cur.c] + 1
      if (newG < g[nr][nc]) {
        cameFrom[nr][nc] = [cur.r, cur.c]
        g[nr][nc] = newG
        f[nr][nc] = newG + heuristic([nr, nc], [er, ec])
        open.set(key(nr, nc), { r: nr, c: nc })
        snapshot(cur, `更新邻居 (${nr},${nc})：新 g=${newG}，h=${heuristic([nr,nc],[er,ec])}，f=${f[nr][nc]}，加入 open 集。`, 29, 30)
      }
    }
  }

  steps.push({
    ...steps[steps.length - 1],
    cppLine: 33,
    pythonLine: 31,
    description: `open 集为空，无法到达终点 (${er},${ec})。`,
  })
  return steps
}
