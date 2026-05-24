// Red-Black tree with stable node IDs so renderer can animate transforms.
// Step shape: { nodes: [{id, value, color, x, y}], edges: [{from, to}], highlight, description }

const RED = 'R', BLACK = 'B'

class Node {
  constructor(id, value) {
    this.id = id
    this.value = value
    this.color = RED
    this.left = null
    this.right = null
    this.parent = null
  }
}

export function rbInsertSequence(values) {
  const tree = { root: null, nextId: 0 }
  const steps = []

  function snap(highlight, description, cppLine = null, pythonLine = null) {
    const positions = layout(tree.root)
    const nodes = []
    const edges = []
    walk(tree.root, n => {
      const p = positions.get(n.id) || { x: 0, y: 0 }
      nodes.push({ id: n.id, value: n.value, color: n.color, x: p.x, y: p.y })
      if (n.left) edges.push({ from: n.id, to: n.left.id })
      if (n.right) edges.push({ from: n.id, to: n.right.id })
    })
    const step = { nodes, edges, highlight: highlight ?? null, description }
    if (cppLine !== null) step.cppLine = cppLine
    if (pythonLine !== null) step.pythonLine = pythonLine
    steps.push(step)
  }

  for (const v of values) {
    snap(null, `准备插入 ${v}`)
    insert(tree, v, snap)
    snap(null, `${v} 插入完成`)
  }
  return steps
}

function insert(tree, value, snap) {
  const z = new Node(tree.nextId++, value)
  // standard BST insert
  let y = null
  let x = tree.root
  while (x) {
    y = x
    x = value < x.value ? x.left : x.right
  }
  z.parent = y
  if (!y) tree.root = z
  else if (value < y.value) y.left = z
  else y.right = z

  snap(z.id, `按 BST 插入新节点 ${value}（红色）`)
  fixup(tree, z, snap)
}

function fixup(tree, z, snap) {
  while (z.parent && z.parent.color === RED) {
    const grandparent = z.parent.parent
    if (!grandparent) break

    if (z.parent === grandparent.left) {
      const uncle = grandparent.right
        if (uncle && uncle.color === RED) {
          // case 1
          z.parent.color = BLACK
          uncle.color = BLACK
          grandparent.color = RED
          snap(grandparent.id, `Case 1: 叔叔 ${uncle.value} 是红色，父叔变黑、祖父变红`, 29, 32)
          z = grandparent
        } else {
          if (z === z.parent.right) {
            // case 2
            z = z.parent
            snap(z.id, `Case 2: z 是父的右孩子，对父 ${z.value} 左旋`, 36, 39)
            rotateLeft(tree, z)
            snap(z.id, `左旋完成`, 36, 39)
          }
          // case 3
          z.parent.color = BLACK
          grandparent.color = RED
          snap(grandparent.id, `Case 3: 父变黑、祖父 ${grandparent.value} 变红，对祖父右旋`, 40, 42)
          rotateRight(tree, grandparent)
          snap(z.parent ? z.parent.id : null, `右旋完成`, 40, 42)
        }
    } else {
      // mirror
      const uncle = grandparent.left
      if (uncle && uncle.color === RED) {
        z.parent.color = BLACK
        uncle.color = BLACK
        grandparent.color = RED
        snap(grandparent.id, `Case 1（镜像）: 叔叔 ${uncle.value} 是红色，父叔变黑、祖父变红`)
        z = grandparent
      } else {
        if (z === z.parent.left) {
          z = z.parent
          snap(z.id, `Case 2（镜像）: z 是父的左孩子，对父 ${z.value} 右旋`)
          rotateRight(tree, z)
          snap(z.id, `右旋完成`)
        }
        z.parent.color = BLACK
        grandparent.color = RED
        snap(grandparent.id, `Case 3（镜像）: 父变黑、祖父 ${grandparent.value} 变红，对祖父左旋`)
        rotateLeft(tree, grandparent)
        snap(z.parent ? z.parent.id : null, `左旋完成`)
      }
    }
  }
  if (tree.root.color !== BLACK) {
    tree.root.color = BLACK
    snap(tree.root.id, `根节点染黑`)
  }
}

function rotateLeft(tree, x) {
  const y = x.right
  x.right = y.left
  if (y.left) y.left.parent = x
  y.parent = x.parent
  if (!x.parent) tree.root = y
  else if (x === x.parent.left) x.parent.left = y
  else x.parent.right = y
  y.left = x
  x.parent = y
}

function rotateRight(tree, x) {
  const y = x.left
  x.left = y.right
  if (y.right) y.right.parent = x
  y.parent = x.parent
  if (!x.parent) tree.root = y
  else if (x === x.parent.right) x.parent.right = y
  else x.parent.left = y
  y.right = x
  x.parent = y
}

function walk(node, fn) {
  if (!node) return
  fn(node)
  walk(node.left, fn)
  walk(node.right, fn)
}

// In-order x-positioning, depth y-positioning
function layout(root) {
  const positions = new Map()
  let counter = 0
  const X_STEP = 50
  const Y_STEP = 70
  function inorder(node, depth) {
    if (!node) return
    inorder(node.left, depth + 1)
    positions.set(node.id, { x: counter * X_STEP, y: depth * Y_STEP })
    counter++
    inorder(node.right, depth + 1)
  }
  inorder(root, 0)
  return positions
}
