export function segTree(arr, ops) {
  const n = arr.length
  const tree = Array(4 * n).fill(0)
  const steps = []

  function snapshotBuild(node, start, end, desc, cppLine, pythonLine) {
    steps.push({
      arr: [...arr],
      tree: [...tree],
      n,
      highlighted: [node],
      queryRange: null,
      updateIdx: null,
      action: 'build',
      result: null,
      cppLine,
      pythonLine,
      description: desc,
    })
  }

  function buildWithSteps(node, start, end) {
    if (start === end) {
      tree[node] = arr[start]
      snapshotBuild(node, start, end, `叶节点 tree[${node}] = arr[${start}] = ${arr[start]}。`, 9, 9)
      return
    }
    const mid = Math.floor((start + end) / 2)
    buildWithSteps(2 * node, start, mid)
    buildWithSteps(2 * node + 1, mid + 1, end)
    tree[node] = tree[2 * node] + tree[2 * node + 1]
    snapshotBuild(node, start, end,
      `内部节点 tree[${node}]（范围[${start},${end}]）= tree[${2*node}](${tree[2*node]}) + tree[${2*node+1}](${tree[2*node+1]}) = ${tree[node]}。`, 13, 14)
  }

  steps.push({
    arr: [...arr], tree: Array(4 * n).fill(0), n,
    highlighted: [], queryRange: null, updateIdx: null,
    action: 'init', result: null,
    cppLine: 5,
    pythonLine: 4,
    description: `原始数组：[${arr.join(', ')}]，共 ${n} 个元素。线段树用于快速区间查询与单点更新。`,
  })

  buildWithSteps(1, 0, n - 1)

  steps.push({
    arr: [...arr], tree: [...tree], n,
    highlighted: [1], queryRange: null, updateIdx: null,
    action: 'build-done', result: tree[1],
    cppLine: 6, pythonLine: 5,
    description: `建树完成。根节点 tree[1]=${tree[1]} 代表数组全局和，节点 tree[k] 的子节点为 tree[2k] 和 tree[2k+1]。`,
  })

  function querySum(node, start, end, l, r, highlighted) {
    highlighted.push(node)
    if (r < start || end < l) return 0
    if (l <= start && end <= r) return tree[node]
    const mid = Math.floor((start + end) / 2)
    return querySum(2 * node, start, mid, l, r, highlighted) +
           querySum(2 * node + 1, mid + 1, end, l, r, highlighted)
  }

  function update(node, start, end, idx, val) {
    if (start === end) {
      arr[idx] = val; tree[node] = val
      steps.push({
        arr: [...arr], tree: [...tree], n,
        highlighted: [node], queryRange: null, updateIdx: idx,
        action: 'update-leaf', result: val,
        cppLine: 22, pythonLine: 31,
        description: `更新叶节点 tree[${node}]（arr[${idx}]）= ${val}。`,
      })
      return
    }
    const mid = Math.floor((start + end) / 2)
    if (idx <= mid) update(2 * node, start, mid, idx, val)
    else update(2 * node + 1, mid + 1, end, idx, val)
    tree[node] = tree[2 * node] + tree[2 * node + 1]
    steps.push({
      arr: [...arr], tree: [...tree], n,
      highlighted: [node], queryRange: null, updateIdx: idx,
      action: 'update-internal', result: tree[node],
      cppLine: 26, pythonLine: 36,
      description: `回溯更新内部节点 tree[${node}]（范围包含 arr[${idx}]）= ${tree[node]}。`,
    })
  }

  for (const op of ops) {
    if (op.type === 'query') {
      const { l, r } = op
      const highlighted = []
      const result = querySum(1, 0, n - 1, l, r, highlighted)
      steps.push({
        arr: [...arr], tree: [...tree], n,
        highlighted, queryRange: [l, r], updateIdx: null,
        action: 'query', result,
        cppLine: 19, pythonLine: 23,
        description: `区间查询 sum[${l},${r}]：只访问覆盖该区间的 ${highlighted.length} 个节点，结果 = ${result}，时间复杂度 O(log n)。`,
      })
    } else if (op.type === 'update') {
      const { idx, val } = op
      steps.push({
        arr: [...arr], tree: [...tree], n,
        highlighted: [], queryRange: null, updateIdx: idx,
        action: 'update-start', result: null,
        cppLine: 21, pythonLine: 29,
        description: `单点更新：将 arr[${idx}] 从 ${arr[idx]} 更新为 ${val}，需沿路径向上更新祖先节点。`,
      })
      update(1, 0, n - 1, idx, val)
    }
  }

  return steps
}
