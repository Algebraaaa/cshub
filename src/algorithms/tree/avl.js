// AVL tree insert sequence for visualization
// Step: { nodes: [{id, value, x, y}], edges: [{from, to}], highlight, description }

let nodeId = 0

function newNode(val) {
  return { id: nodeId++, value: val, left: null, right: null, height: 1 }
}

function height(n) { return n ? n.height : 0 }
function updateHeight(n) { if (n) n.height = 1 + Math.max(height(n.left), height(n.right)) }
function balanceFactor(n) { return n ? height(n.left) - height(n.right) : 0 }

function rotateRight(y) {
  const x = y.left
  const T2 = x.right
  x.right = y
  y.left = T2
  updateHeight(y)
  updateHeight(x)
  return x
}

function rotateLeft(x) {
  const y = x.right
  const T2 = y.left
  y.left = x
  x.right = T2
  updateHeight(x)
  updateHeight(y)
  return y
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

export function avlInsertSequence(values) {
  nodeId = 0
  const steps = []
  let root = null

  function insert(node, val) {
    if (!node) {
      const nn = newNode(val)
      steps.push(snapshot(root, nn.id, `创建节点 ${val}`, 16, 14))
      return nn
    }
    if (val < node.value) {
      steps.push(snapshot(root, node.id, `${val} < ${node.value}，向左`, 17, 15))
      node.left = insert(node.left, val)
    } else {
      steps.push(snapshot(root, node.id, `${val} >= ${node.value}，向右`, 18, 16))
      node.right = insert(node.right, val)
    }

    updateHeight(node)
    const bf = balanceFactor(node)

    // Left Left
    if (bf > 1 && val < node.left.value) {
      steps.push(snapshot(root, node.id, `不平衡（LL），对 ${node.value} 右旋`, 21, 19))
      const res = rotateRight(node)
      steps.push(snapshot(res, res.id, `右旋完成`, 21, 19))
      return res
    }
    // Right Right
    if (bf < -1 && val >= node.right.value) {
      steps.push(snapshot(root, node.id, `不平衡（RR），对 ${node.value} 左旋`, 23, 21))
      const res = rotateLeft(node)
      steps.push(snapshot(res, res.id, `左旋完成`, 23, 21))
      return res
    }
    // Left Right
    if (bf > 1 && val >= node.left.value) {
      steps.push(snapshot(root, node.left.id, `不平衡（LR），先对 ${node.left.value} 左旋`, 22, 20))
      node.left = rotateLeft(node.left)
      steps.push(snapshot(root, node.id, `左旋完成，接着对 ${node.value} 右旋`, 22, 20))
      const res = rotateRight(node)
      steps.push(snapshot(res, res.id, `右旋完成`, 22, 20))
      return res
    }
    // Right Left
    if (bf < -1 && val < node.right.value) {
      steps.push(snapshot(root, node.right.id, `不平衡（RL），先对 ${node.right.value} 右旋`, 24, 22))
      node.right = rotateRight(node.right)
      steps.push(snapshot(root, node.id, `右旋完成，接着对 ${node.value} 左旋`, 24, 22))
      const res = rotateLeft(node)
      steps.push(snapshot(res, res.id, `左旋完成`, 24, 22))
      return res
    }

    return node
  }

  for (const v of values) {
    steps.push(snapshot(root, null, `插入 ${v}`))
    root = insert(root, v)
    steps.push(snapshot(root, null, `${v} 插入完成`))
  }

  steps.push(snapshot(root, null, `AVL 完成`))
  return steps
}
