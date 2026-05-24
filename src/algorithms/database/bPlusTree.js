// B+ 树插入序列：度数 m → 内部节点最多 m-1 个键，叶子节点最多 m-1 个键
// 简化模型：叶子节点存键即可（不演示数据指针），叶子之间用 next 串联（B+ 特征）

let _id = 0
const nextId = () => `n${++_id}`

function makeNode({ keys = [], children = [], isLeaf = false, next = null } = {}) {
  return { id: nextId(), keys, children, isLeaf, next }
}

function findLeaf(root, key, pathOut) {
  let node = root
  while (!node.isLeaf) {
    pathOut.push(node.id)
    let i = 0
    while (i < node.keys.length && key >= node.keys[i]) i++
    node = node.children[i]
  }
  return node
}

// 拷贝整棵树（结构 + id）→ 用于快照，避免后续修改影响历史
function cloneTree(root) {
  if (!root) return null
  const idMap = new Map()
  function go(node) {
    const copy = { id: node.id, keys: [...node.keys], isLeaf: node.isLeaf, children: [] }
    idMap.set(node.id, copy)
    if (!node.isLeaf) {
      for (const c of node.children) copy.children.push(go(c))
    }
    return copy
  }
  const clone = go(root)
  // 修复 next 指针：扫一遍 leaves
  function fixNext(orig, copy) {
    if (orig.isLeaf) copy.next = orig.next ? idMap.get(orig.next.id) || null : null
    else for (let i = 0; i < orig.children.length; i++) fixNext(orig.children[i], copy.children[i])
  }
  fixNext(root, clone)
  return clone
}

export function bPlusTreeInsert(m, values) {
  _id = 0
  const maxKeys = m - 1
  // 叶子的最大键数也设为 m-1（简化）
  let root = makeNode({ isLeaf: true })
  const steps = []

  function snapshot(action, focusId, key, desc, splitFrom = null, cppLine = null) {
    steps.push({
      tree: cloneTree(root),
      action, focusId, key, splitFrom,
      description: desc,
      cppLine,
    })
  }

  snapshot('init', root.id, null, `初始化一棵 m=${m} 阶 B+ 树（每个节点最多 ${maxKeys} 个键）。`)

  for (const key of values) {
    const path = []
    const leaf = findLeaf(root, key, path)
    snapshot('descend', leaf.id, key,
      path.length === 0
        ? `插入 ${key}：当前只有根叶子，直接定位到它。`
        : `插入 ${key}：从根沿 ${path.length} 层下降到目标叶子节点。`, null, 5)

    if (leaf.keys.includes(key)) {
      snapshot('skip', leaf.id, key, `叶子已有键 ${key}，跳过（B+ 树同样支持唯一索引）。`)
      continue
    }

    // 按序插入
    const idx = leaf.keys.findIndex(k => k > key)
    if (idx < 0) leaf.keys.push(key)
    else leaf.keys.splice(idx, 0, key)
    snapshot('insert', leaf.id, key, `将 ${key} 插入叶子并保持有序：[${leaf.keys.join(', ')}]。`, null, 8)

    // 若超容量则分裂
    let splitNode = leaf.keys.length > maxKeys ? leaf : null
    let parents = findPathToNode(root, leaf.id) // 重新拿父链（避免上面 mutate）

    while (splitNode) {
      const isLeaf = splitNode.isLeaf
      const mid = Math.floor(splitNode.keys.length / 2)
      const promoteKey = isLeaf ? splitNode.keys[mid] : splitNode.keys[mid]
      // 左半 / 右半
      const right = makeNode({ isLeaf })
      if (isLeaf) {
        right.keys = splitNode.keys.slice(mid)         // B+ 叶子：中位也保留在右
        splitNode.keys = splitNode.keys.slice(0, mid)
        // 叶子链
        right.next = splitNode.next
        splitNode.next = right
      } else {
        right.keys = splitNode.keys.slice(mid + 1)    // 内部节点：中位上推
        right.children = splitNode.children.slice(mid + 1)
        splitNode.keys = splitNode.keys.slice(0, mid)
        splitNode.children = splitNode.children.slice(0, mid + 1)
      }
      snapshot('split', splitNode.id, promoteKey,
        `节点已满（${isLeaf ? '叶子' : '内部'}）→ 中位键 ${promoteKey} 上推到父节点；右半部分新建节点 [${right.keys.join(', ')}]。`,
        right.id, 11)

      // 上推
      const parent = parents.length > 0 ? parents[parents.length - 1] : null
      if (!parent) {
        // 新建根
        const newRoot = makeNode({ isLeaf: false, keys: [promoteKey], children: [splitNode, right] })
        root = newRoot
        snapshot('newroot', newRoot.id, promoteKey, `树高 +1：新建根节点，键 = [${promoteKey}]。`)
        break
      }
      // 在父节点插入 promoteKey + right child
      const pIdx = parent.children.indexOf(splitNode)
      parent.keys.splice(pIdx, 0, promoteKey)
      parent.children.splice(pIdx + 1, 0, right)
      snapshot('promote', parent.id, promoteKey, `父节点接收 ${promoteKey} 与新右孩子，父键 = [${parent.keys.join(', ')}]。`)

      if (parent.keys.length > maxKeys) {
        splitNode = parent
        parents = parents.slice(0, -1)
      } else {
        splitNode = null
      }
    }
  }

  snapshot('done', null, null, `插入完成。最终高度 = ${treeHeight(root)}，节点数 = ${countNodes(root)}。`)
  return steps
}

function findPathToNode(root, targetId, acc = []) {
  if (!root) return null
  if (root.id === targetId) return acc.slice()
  if (root.isLeaf) return null
  for (const c of root.children) {
    acc.push(root)
    const r = findPathToNode(c, targetId, acc)
    if (r) return r
    acc.pop()
  }
  return null
}

function treeHeight(node) {
  if (!node) return 0
  if (node.isLeaf) return 1
  return 1 + treeHeight(node.children[0])
}

function countNodes(node) {
  if (!node) return 0
  let n = 1
  if (!node.isLeaf) for (const c of node.children) n += countNodes(c)
  return n
}

export function bplustree(m, values) { return bPlusTreeInsert(m, values) }
