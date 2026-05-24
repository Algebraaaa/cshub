// Treap (BST + heap) insert sequence for visualization
// Each node: { id, value, priority, left, right }

let nodeId = 0

function newNode(val, prio) {
  return { id: nodeId++, value: val, priority: prio, left: null, right: null }
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
  const result = { nodes: [{ id: node.id, value: `${node.value} (${node.priority})`, ...pos }], edges: [] }
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

function rotateRight(y) {
  const x = y.left
  const T2 = x.right
  x.right = y
  y.left = T2
  return x
}

function rotateLeft(x) {
  const y = x.right
  const T2 = y.left
  y.left = x
  x.right = T2
  return y
}

export function treapInsertSequence(values, priorities) {
  // priorities optional array; if not provided use descending deterministic values
  nodeId = 0
  const steps = []
  let root = null
  let prIndex = 0

  function insert(node, val, prio) {
    if (!node) {
      const nn = newNode(val, prio)
      steps.push(snapshot(root, nn.id, `创建节点 ${val} (prio=${prio})`, 7, 9))
      return nn
    }
    if (val < node.value) {
      steps.push(snapshot(root, node.id, `${val} < ${node.value}，向左`, 8, 10))
      node.left = insert(node.left, val, prio)
      if (node.left.priority < node.priority) {
        steps.push(snapshot(root, node.left.id, `父堆序破坏，右旋 ${node.value}`, 10, 12))
        node = rotateRight(node)
        steps.push(snapshot(node, node.id, `右旋完成`, 10, 12))
      }
    } else {
      steps.push(snapshot(root, node.id, `${val} >= ${node.value}，向右`, 12, 14))
      node.right = insert(node.right, val, prio)
      if (node.right.priority < node.priority) {
        steps.push(snapshot(root, node.right.id, `父堆序破坏，左旋 ${node.value}`, 13, 15))
        node = rotateLeft(node)
        steps.push(snapshot(node, node.id, `左旋完成`, 13, 15))
      }
    }
    return node
  }

  for (const v of values) {
    const prio = (priorities && priorities[prIndex] != null) ? priorities[prIndex++] : (1000 - prIndex)
    steps.push(snapshot(root, null, `插入 ${v} (prio=${prio})`))
    root = insert(root, v, prio)
    steps.push(snapshot(root, null, `${v} 插入完成`))
  }
  steps.push(snapshot(root, null, `Treap 完成`))
  return steps
}
