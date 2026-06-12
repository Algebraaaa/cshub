// 香农-费诺编码
export function shannonFanoSteps({ symbols } = {}) {
  let syms = (symbols || [
    { s: 'A', f: 0.4 },
    { s: 'B', f: 0.3 },
    { s: 'C', f: 0.15 },
    { s: 'D', f: 0.10 },
    { s: 'E', f: 0.05 },
  ]).slice().sort((a, b) => b.f - a.f)
  // 递归分配
  const codes = Object.fromEntries(syms.map(s => [s.s, '']))
  const trace = []
  function recurse(indices, prefix) {
    if (indices.length <= 1) return
    let total = 0
    for (const i of indices) total += syms[i].f
    // 找到上下半分的切分点
    let acc = 0
    let split = 0
    let minDiff = Infinity
    for (let k = 0; k < indices.length - 1; k++) {
      acc += syms[indices[k]].f
      const diff = Math.abs((total - acc) - acc)
      if (diff <= minDiff) { minDiff = diff; split = k + 1 }
    }
    const left = indices.slice(0, split)
    const right = indices.slice(split)
    const leftSum = left.reduce((a, i) => a + syms[i].f, 0)
    const rightSum = total - leftSum
    for (const i of left) codes[syms[i].s] = prefix + '0'
    for (const i of right) codes[syms[i].s] = prefix + '1'
    trace.push({
      prefix,
      left: left.map(i => ({ s: syms[i].s, f: syms[i].f, code: prefix + '0' })),
      right: right.map(i => ({ s: syms[i].s, f: syms[i].f, code: prefix + '1' })),
      leftSum, rightSum,
    })
    recurse(left, prefix + '0')
    recurse(right, prefix + '1')
  }
  recurse(syms.map((_, i) => i), '')
  let avgLen = 0
  for (const s of syms) avgLen += s.f * codes[s.s].length
  const H = -syms.reduce((a, s) => a + (s.f > 0 ? s.f * Math.log2(s.f) : 0), 0)
  const efficiency = H / avgLen

  const steps = []
  steps.push({
    phase: 'sort',
    description: `符号按频率降序排列：${syms.map(s => `${s.s}(${s.f.toFixed(2)})`).join(', ')}。`,
    syms, trace, codes, step: -1, avgLen, H, efficiency,
    highlightLine: 1,
  })
  for (let i = 0; i < trace.length; i++) {
    const t = trace[i]
    steps.push({
      phase: 'split',
      description: `第 ${i + 1} 次分组 [前缀"${t.prefix}"]：左半 ${t.left.map(x => x.s).join(',')}（Σf=${t.leftSum.toFixed(3)}，赋 0）| 右半 ${t.right.map(x => x.s).join(',')}（Σf=${t.rightSum.toFixed(3)}，赋 1）。`,
      syms, trace, codes, step: i, avgLen, H, efficiency,
      highlightLine: 2 + i,
    })
  }
  steps.push({
    phase: 'done',
    description: `完成编码：${syms.map(s => `${s.s}→"${codes[s.s]}"(${codes[s.s].length}b)`).join(', ')}。平均码长 L = ${avgLen.toFixed(4)}，熵 H = ${H.toFixed(4)}，效率 η = ${(efficiency * 100).toFixed(2)}%。香农-费诺为次优前缀码，霍夫曼更优。`,
    syms, trace, codes, step: trace.length, avgLen, H, efficiency,
    highlightLine: 2 + trace.length,
  })
  return steps
}
