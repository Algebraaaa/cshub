// 霍夫曼编码
export function huffmanSteps({ symbols } = {}) {
  const syms = symbols || [
    { s: 'A', f: 0.4 },
    { s: 'B', f: 0.3 },
    { s: 'C', f: 0.15 },
    { s: 'D', f: 0.10 },
    { s: 'E', f: 0.05 },
  ]
  // 建树
  let nodes = syms.map((x, i) => ({ id: i, symbol: x.s, freq: x.f, left: null, right: null, parent: null, code: '' }))
  const mergeTrace = []
  let nextId = nodes.length
  const initialNodes = nodes.map(n => ({ ...n }))
  while (nodes.length > 1) {
    // 按频率升序，稳定
    nodes.sort((a, b) => a.freq - b.freq || a.id - b.id)
    const a = nodes.shift()
    const b = nodes.shift()
    const parent = { id: nextId++, symbol: null, freq: a.freq + b.freq, left: a.id, right: b.id, parent: null, code: '' }
    a.parent = parent.id
    b.parent = parent.id
    nodes.push(parent)
    mergeTrace.push({
      left: { id: a.id, symbol: a.symbol, freq: a.freq },
      right: { id: b.id, symbol: b.symbol, freq: b.freq },
      parent: { id: parent.id, freq: parent.freq },
    })
  }
  const root = nodes[0]
  // 生成编码：BFS 从根开始
  const codes = {}
  const codeTrace = []
  const queue = [{ id: root.id, code: '' }]
  const nodeMap = {}
  // 重建所有节点
  initialNodes.forEach(n => nodeMap[n.id] = n)
  mergeTrace.forEach(m => {
    nodeMap[m.parent.id] = { id: m.parent.id, symbol: null, freq: m.parent.freq, left: m.left.id, right: m.right.id }
  })
  while (queue.length > 0) {
    const cur = queue.shift()
    const node = nodeMap[cur.id]
    if (!node) continue
    if (node.symbol != null) {
      codes[node.symbol] = cur.code
      codeTrace.push({ symbol: node.symbol, code: cur.code, freq: node.freq })
    } else {
      if (node.left != null) queue.push({ id: node.left, code: cur.code + '0' })
      if (node.right != null) queue.push({ id: node.right, code: cur.code + '1' })
    }
  }
  // 平均码长
  let avgLen = 0
  for (const s of syms) {
    avgLen += s.f * codes[s.s].length
  }
  const H = -syms.reduce((a, s) => a + (s.f > 0 ? s.f * Math.log2(s.f) : 0), 0)
  const efficiency = H / avgLen

  const steps = []
  steps.push({
    phase: 'freq',
    description: `符号与频率：${syms.map(s => `${s.s}(${s.f.toFixed(2)})`).join(', ')}。`,
    syms, mergeTrace, codeTrace, codes, currentMerge: -1, currentCode: -1, avgLen, H, efficiency, nodeMap,
    highlightLine: 1,
  })
  for (let i = 0; i < mergeTrace.length; i++) {
    const m = mergeTrace[i]
    steps.push({
      phase: 'merge',
      description: `第 ${i + 1} 次合并：${m.left.symbol || `N${m.left.id}`}(${m.left.freq.toFixed(2)}) + ${m.right.symbol || `N${m.right.id}`}(${m.right.freq.toFixed(2)}) → N${m.parent.id}(${m.parent.freq.toFixed(2)})。左分支记 0，右分支记 1。`,
      syms, mergeTrace, codeTrace, codes, currentMerge: i, currentCode: -1, avgLen, H, efficiency, nodeMap,
      highlightLine: 6,
    })
  }
  for (let i = 0; i < codeTrace.length; i++) {
    const c = codeTrace[i]
    steps.push({
      phase: 'code',
      description: `生成码字：${c.symbol} → "${c.code}"（码长 ${c.code.length}，频率 ${c.freq.toFixed(2)}）。`,
      syms, mergeTrace, codeTrace, codes, currentMerge: mergeTrace.length, currentCode: i, avgLen, H, efficiency, nodeMap,
      highlightLine: 8,
    })
  }
  steps.push({
    phase: 'done',
    description: `平均码长 L = ${avgLen.toFixed(4)} 比特，熵 H = ${H.toFixed(4)} 比特，编码效率 η = ${(efficiency * 100).toFixed(2)}%。霍夫曼编码达到前缀码的最优平均码长。`,
    syms, mergeTrace, codeTrace, codes, currentMerge: mergeTrace.length, currentCode: codeTrace.length, avgLen, H, efficiency, nodeMap,
    highlightLine: 9,
  })
  return steps
}
