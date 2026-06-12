// 差分数组 (Difference Array)
//
// 演示如何利用差分数组将区间加法从 O(n) 降到 O(1)，
// 最后用前缀和恢复结果数组。

export function diffArray({
  arr = [1, 2, 3, 4, 5, 6, 7, 8],
  operations = [
    { l: 2, r: 5, val: 3 },
    { l: 0, r: 3, val: -2 },
    { l: 4, r: 7, val: 5 },
  ],
} = {}) {
  const n = arr.length
  const steps = []

  // working copies
  const a = [...arr]
  const d = Array(n + 1).fill(0)   // diff array (length n+1 for d[r+1] safety)
  const restored = Array(n).fill(0)

  function snap(phase, extra = {}) {
    steps.push({
      arr: [...a],
      diff: [...d],
      prefixSum: [...restored],
      op: extra.op ?? null,
      current: extra.current ?? -1,
      phase,
      highlightRange: extra.highlightRange ?? null,
      cppLine: extra.cppLine ?? 0,
      pythonLine: extra.pythonLine ?? 0,
      description: extra.description ?? '',
    })
  }

  // ── Phase 0: show original ─────────────────────────────
  snap('init', {
    cppLine: 4, pythonLine: 3,
    description: `原始数组 a = [${a.join(', ')}]，共 ${n} 个元素。`,
  })

  // ── Phase 1: build diff array ──────────────────────────
  d[0] = a[0]
  snap('build', {
    current: 0,
    cppLine: 8, pythonLine: 7,
    description: `构建差分数组：d[0] = a[0] = ${a[0]}`,
  })

  for (let i = 1; i < n; i++) {
    d[i] = a[i] - a[i - 1]
    snap('build', {
      current: i,
      cppLine: 10, pythonLine: 9,
      description: `d[${i}] = a[${i}] − a[${i - 1}] = ${a[i]} − ${a[i - 1]} = ${d[i]}`,
    })
  }

  snap('build-done', {
    cppLine: 11, pythonLine: 10,
    description: `差分数组构建完成：d = [${d.slice(0, n).join(', ')}]`,
  })

  // ── Phase 2: apply each range update ───────────────────
  for (let oi = 0; oi < operations.length; oi++) {
    const { l, r, val } = operations[oi]
    const op = { l, r, val }

    snap('update-start', {
      op,
      highlightRange: [l, r],
      cppLine: 15, pythonLine: 14,
      description: `第 ${oi + 1} 次区间加法：a[${l}..${r}] += ${val}（O(1) 操作）`,
    })

    // d[l] += val
    d[l] += val
    snap('update', {
      op,
      current: l,
      highlightRange: [l, r],
      cppLine: 17, pythonLine: 16,
      description: `d[${l}] += ${val} → d[${l}] = ${d[l]}`,
    })

    // d[r+1] -= val
    if (r + 1 < n) {
      d[r + 1] -= val
      snap('update', {
        op,
        current: r + 1,
        highlightRange: [l, r],
        cppLine: 18, pythonLine: 17,
        description: `d[${r + 1}] -= ${val} → d[${r + 1}] = ${d[r + 1]}（右边界 +1 处抵消）`,
      })
    } else {
      snap('update', {
        op,
        current: -1,
        highlightRange: [l, r],
        cppLine: 19, pythonLine: 18,
        description: `r+1 = ${r + 1} 超出数组长度，无需写 d[r+1]`,
      })
    }

    snap('update-done', {
      op,
      highlightRange: [l, r],
      cppLine: 20, pythonLine: 19,
      description: `区间加法 [${l},${r}]+=${val} 完成，差分数组：[${d.slice(0, n).join(', ')}]`,
    })
  }

  // ── Phase 3: restore via prefix sum ────────────────────
  snap('restore-start', {
    cppLine: 24, pythonLine: 23,
    description: `所有区间加法完成，开始用前缀和恢复最终数组。`,
  })

  restored[0] = d[0]
  snap('restore', {
    current: 0,
    cppLine: 26, pythonLine: 25,
    description: `restored[0] = d[0] = ${d[0]}`,
  })

  for (let i = 1; i < n; i++) {
    restored[i] = restored[i - 1] + d[i]
    snap('restore', {
      current: i,
      cppLine: 28, pythonLine: 27,
      description: `restored[${i}] = restored[${i - 1}](${restored[i - 1]}) + d[${i}](${d[i]}) = ${restored[i]}`,
    })
  }

  snap('done', {
    cppLine: 30, pythonLine: 29,
    description: `最终数组 = [${restored.join(', ')}]。验证：原数组 [${a.join(', ')}] 经过 ${operations.length} 次区间加法得到此结果。`,
  })

  return steps
}
