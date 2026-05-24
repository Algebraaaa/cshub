// Fenwick Tree (Binary Indexed Tree) visualization step generator.
//
// Demonstrates two main operations:
//   update(i, delta) — point update
//   prefixSum(i)    — query prefix sum [1..i]
//
// Step shape:
// { arr, tree, op, target, current, delta, sum, lowbit, phase, description }

function lowbit(x) { return x & (-x) }

export function fenwickTree({ initialArray = [3, 2, 4, 1, 5, 7, 2, 6], operations } = {}) {
  const n = initialArray.length
  const tree = new Array(n + 1).fill(0) // 1-indexed
  const steps = []

  // Default scripted operations
  const ops = operations || [
    { type: 'build' },
    { type: 'query', i: 5 },          // prefix sum [1..5]
    { type: 'update', i: 3, delta: 4 },
    { type: 'query', i: 5 },          // prefix sum after update
    { type: 'rangeQuery', l: 3, r: 6 },
  ]

  function record(extra) {
    steps.push({
      arr: initialArray.slice(),
      tree: tree.slice(),
      ...extra,
    })
  }

  record({ op: 'init', current: -1, phase: 'init', description: `初始化 Fenwick 树，n=${n}，所有节点为 0` })

  // Build by calling update for each element
  for (let i = 0; i < n; i++) {
    let pos = i + 1
    const delta = initialArray[i]
    record({ op: 'build', target: pos, current: pos, delta, phase: 'update_start',
      description: `构建：在位置 ${pos} 加入值 ${delta}` })

    while (pos <= n) {
      const before = tree[pos]
      tree[pos] += delta
      record({ op: 'build', target: i + 1, current: pos, delta, lowbit: lowbit(pos), phase: 'update_node',
        description: `更新 tree[${pos}]: ${before} + ${delta} = ${tree[pos]}（lowbit(${pos})=${lowbit(pos)}）` })
      pos += lowbit(pos)
    }
  }

  record({ op: 'build', current: -1, phase: 'build_done', description: `🎉 构建完成，前缀和数组就绪` })

  // Run scripted operations
  for (const op of ops) {
    if (op.type === 'build') continue // already built

    if (op.type === 'query') {
      let pos = op.i
      let sum = 0
      record({ op: 'query', target: op.i, current: pos, sum, phase: 'query_start',
        description: `查询前缀和 sum[1..${op.i}]` })
      while (pos > 0) {
        const before = sum
        sum += tree[pos]
        record({ op: 'query', target: op.i, current: pos, sum, lowbit: lowbit(pos), phase: 'query_accumulate',
          description: `累加 tree[${pos}]=${tree[pos]}: ${before} + ${tree[pos]} = ${sum}（lowbit(${pos})=${lowbit(pos)}，下一跳：${pos - lowbit(pos)}）` })
        pos -= lowbit(pos)
      }
      record({ op: 'query', target: op.i, current: -1, sum, phase: 'query_done',
        description: `✅ sum[1..${op.i}] = ${sum}` })
    }

    if (op.type === 'update') {
      let pos = op.i
      const delta = op.delta
      record({ op: 'update', target: op.i, current: pos, delta, phase: 'update_start',
        description: `单点更新：a[${op.i}] += ${delta}` })
      while (pos <= n) {
        const before = tree[pos]
        tree[pos] += delta
        record({ op: 'update', target: op.i, current: pos, delta, lowbit: lowbit(pos), phase: 'update_node',
          description: `更新 tree[${pos}]: ${before} + ${delta} = ${tree[pos]}（lowbit(${pos})=${lowbit(pos)}，下一跳：${pos + lowbit(pos)}）` })
        pos += lowbit(pos)
      }
      record({ op: 'update', target: op.i, current: -1, delta, phase: 'update_done',
        description: `✅ 更新完成` })
    }

    if (op.type === 'rangeQuery') {
      // sum[l..r] = query(r) - query(l-1)
      record({ op: 'rangeQuery', target: op.l, phase: 'range_start',
        description: `区间和 sum[${op.l}..${op.r}] = query(${op.r}) − query(${op.l - 1})` })
      let posR = op.r, sumR = 0
      while (posR > 0) { sumR += tree[posR]; posR -= lowbit(posR) }
      let posL = op.l - 1, sumL = 0
      while (posL > 0) { sumL += tree[posL]; posL -= lowbit(posL) }
      record({ op: 'rangeQuery', target: op.l, sum: sumR - sumL, phase: 'range_done',
        description: `✅ sum[${op.l}..${op.r}] = ${sumR} − ${sumL} = ${sumR - sumL}` })
    }
  }

  return steps
}
