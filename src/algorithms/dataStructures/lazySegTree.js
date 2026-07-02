// 懒标记线段树 (Lazy Segment Tree)
//
// 支持区间加法 (rangeAdd) 与区间求和查询 (query)。
// 每个步骤记录 tree / lazy 数组快照，供可视化逐帧播放。

export function lazySegTree(
  arr = [1, 3, 5, 7, 9, 11],
  ops = [
    { type: 'rangeAdd', l: 1, r: 4, val: 3 },
    { type: 'query', l: 2, r: 5 },
    { type: 'rangeAdd', l: 0, r: 2, val: 5 },
    { type: 'query', l: 1, r: 3 },
  ],
) {
  const n = arr.length
  const sz = 4 * n
  const tree = Array(sz).fill(0)
  const lazy = Array(sz).fill(0)
  const steps = []

  function snap(action, highlighted, extra = {}) {
    steps.push({
      arr: [...arr],
      tree: [...tree],
      lazy: [...lazy],
      n,
      highlighted,
      queryRange: extra.queryRange ?? null,
      action,
      result: extra.result ?? null,
      cppLine: extra.cppLine ?? 0,
      pythonLine: extra.pythonLine ?? 0,
      description: extra.description ?? '',
    })
  }

  // ── Build ──────────────────────────────────────────────
  function build(node, l, r) {
    if (l === r) {
      tree[node] = arr[l]
      snap('build', [node], {
        cppLine: 12, pythonLine: 10,
        description: `叶节点 tree[${node}] = arr[${l}] = ${arr[l]}`,
      })
      return
    }
    const mid = (l + r) >> 1
    build(2 * node, l, mid)
    build(2 * node + 1, mid + 1, r)
    tree[node] = tree[2 * node] + tree[2 * node + 1]
    snap('build', [node], {
      cppLine: 16, pythonLine: 14,
      description: `内部节点 tree[${node}] = tree[${2 * node}](${tree[2 * node]}) + tree[${2 * node + 1}](${tree[2 * node + 1]}) = ${tree[node]}，区间 [${l},${r}]`,
    })
  }

  snap('init', [], {
    cppLine: 5, pythonLine: 4,
    description: `原始数组 [${arr.join(', ')}]，共 ${n} 个元素。准备构建懒标记线段树。`,
  })

  build(1, 0, n - 1)

  snap('build-done', [1], {
    cppLine: 8, pythonLine: 7,
    description: `建树完成。根 tree[1]=${tree[1]}，lazy 全为 0。`,
  })

  // ── PushDown ───────────────────────────────────────────
  function pushDown(node, l, r) {
    if (lazy[node] === 0) return
    const mid = (l + r) >> 1
    const left = 2 * node, right = 2 * node + 1
    const lzVal = lazy[node]

    tree[left] += lzVal * (mid - l + 1)
    lazy[left] += lzVal
    tree[right] += lzVal * (r - mid)
    lazy[right] += lzVal

    snap('pushdown', [node, left, right], {
      cppLine: 22, pythonLine: 20,
      description: `下推 lazy[${node}]=${lzVal}：左子 tree[${left}]+=${lzVal}*${mid - l + 1}=${lzVal * (mid - l + 1)}，右子 tree[${right}]+=${lzVal}*${r - mid}=${lzVal * (r - mid)}`,
    })

    lazy[node] = 0
  }

  // ── Range Add ──────────────────────────────────────────
  function rangeAdd(node, l, r, ql, qr, val) {
    if (ql <= l && r <= qr) {
      tree[node] += val * (r - l + 1)
      lazy[node] += val
      snap('rangeAdd', [node], {
        queryRange: [ql, qr],
        cppLine: 30, pythonLine: 28,
        description: `区间 [${l},${r}] 完全包含于 [${ql},${qr}]，tree[${node}]+=${val}*${r - l + 1}=${val * (r - l + 1)}，lazy[${node}]+=${val}`,
      })
      return
    }
    pushDown(node, l, r)
    const mid = (l + r) >> 1
    if (ql <= mid) rangeAdd(2 * node, l, mid, ql, qr, val)
    if (qr > mid) rangeAdd(2 * node + 1, mid + 1, r, ql, qr, val)
    tree[node] = tree[2 * node] + tree[2 * node + 1]
    snap('rangeAdd', [node], {
      queryRange: [ql, qr],
      cppLine: 37, pythonLine: 35,
      description: `回溯更新 tree[${node}] = tree[${2 * node}](${tree[2 * node]}) + tree[${2 * node + 1}](${tree[2 * node + 1]}) = ${tree[node]}，区间 [${l},${r}]`,
    })
  }

  // ── Query ──────────────────────────────────────────────
  function query(node, l, r, ql, qr) {
    if (ql <= l && r <= qr) {
      snap('query', [node], {
        queryRange: [ql, qr],
        cppLine: 44, pythonLine: 42,
        description: `区间 [${l},${r}] 完全包含于查询 [${ql},${qr}]，返回 tree[${node}]=${tree[node]}`,
      })
      return tree[node]
    }
    pushDown(node, l, r)
    const mid = (l + r) >> 1
    let res = 0
    if (ql <= mid) res += query(2 * node, l, mid, ql, qr)
    if (qr > mid) res += query(2 * node + 1, mid + 1, r, ql, qr)
    snap('query', [node], {
      queryRange: [ql, qr],
      cppLine: 50, pythonLine: 48,
      description: `区间 [${l},${r}] 部分重叠查询 [${ql},${qr}]，子树合计 = ${res}`,
    })
    return res
  }

  // ── Execute ops ────────────────────────────────────────
  for (const op of ops) {
    if (op.type === 'rangeAdd') {
      snap('rangeAdd-start', [], {
        queryRange: [op.l, op.r],
        cppLine: 28, pythonLine: 26,
        description: `开始区间加法：[${op.l},${op.r}] += ${op.val}`,
      })
      rangeAdd(1, 0, n - 1, op.l, op.r, op.val)
      snap('rangeAdd-done', [1], {
        queryRange: [op.l, op.r],
        cppLine: 38, pythonLine: 36,
        description: `区间加法 [${op.l},${op.r}]+=${op.val} 完成，根 tree[1]=${tree[1]}`,
      })
    } else if (op.type === 'query') {
      snap('query-start', [], {
        queryRange: [op.l, op.r],
        cppLine: 42, pythonLine: 40,
        description: `开始区间查询：sum[${op.l},${op.r}]`,
      })
      const result = query(1, 0, n - 1, op.l, op.r)
      snap('query-done', [1], {
        queryRange: [op.l, op.r],
        result,
        cppLine: 51, pythonLine: 49,
        description: `查询完成：sum[${op.l},${op.r}] = ${result}`,
      })
    }
  }

  return steps
}
