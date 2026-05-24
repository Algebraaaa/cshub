// Returns steps for BST insert sequence
// Each step: { nodes, edges, highlight, description }
// nodes: [{id, value, x, y}], edges: [{from, to}]

let nodeId = 0

function newNode(val) {
  return { id: nodeId++, value: val, left: null, right: null }
}

function layout(node, x, y, spread) {
  if (!node) return {}
  const result = { [node.id]: { x, y } }
  if (node.left) Object.assign(result, layout(node.left, x - spread, y + 80, spread / 2))
  if (node.right) Object.assign(result, layout(node.right, x + spread, y + 80, spread / 2))
  return result
}

function collect(node, positions) {
  if (!node) return { nodes: [], edges: [] }
  const pos = positions[node.id] || { x: 0, y: 0 }
  const result = { nodes: [{ id: node.id, value: node.value, ...pos }], edges: [] }
  if (node.left) {
    result.edges.push({ from: node.id, to: node.left.id })
    const sub = collect(node.left, positions)
    result.nodes.push(...sub.nodes)
    result.edges.push(...sub.edges)
  }
  if (node.right) {
    result.edges.push({ from: node.id, to: node.right.id })
    const sub = collect(node.right, positions)
    result.nodes.push(...sub.nodes)
    result.edges.push(...sub.edges)
  }
  return result
}

function snapshot(root, highlight, description, cppLine, pythonLine) {
  const positions = layout(root, 400, 40, 160)
  const { nodes, edges } = collect(root, positions)
  return { nodes, edges, highlight, description, cppLine, pythonLine }
}

export function bstInsertSequence(values) {
  nodeId = 0
  const steps = []
  let root = null

  // 边界情况：空数组
  if (values.length === 0) {
    steps.push({
      nodes: [],
      edges: [],
      highlight: null,
      description: '空输入序列，无需构建 BST',
      cppLine: 1,
      pythonLine: 1,
    })
    return steps
  }

  function insert(root, val) {
    if (!root) return newNode(val)
    if (val < root.value) {
      steps.push(snapshot(root, root.id, `${val} < ${root.value}，向左走`, 9, 10))
      root.left = insert(root.left, val)
    } else {
      steps.push(snapshot(root, root.id, `${val} >= ${root.value}，向右走`, 11, 12))
      root.right = insert(root.right, val)
    }
    return root
  }

  for (const val of values) {
    steps.push(snapshot(root, null, `插入 ${val}`, 7, 7))
    root = insert(root, val)
    steps.push(snapshot(root, null, `${val} 插入完成`, 13, 14))
  }
  return steps
}
