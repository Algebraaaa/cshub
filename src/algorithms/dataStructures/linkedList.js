export function linkedListOps(ops) {
  let head = null
  let nextId = 0
  const steps = []

  function makeNode(val) { return { id: nextId++, val, next: null } }

  function getNodes() {
    const arr = []
    let cur = head
    while (cur) { arr.push({ id: cur.id, val: cur.val, nextId: cur.next ? cur.next.id : null }); cur = cur.next }
    return arr
  }

  function snapshot(action, highlighted, pointers, desc, cppLine, pythonLine) {
    steps.push({ nodes: getNodes(), action, highlighted: [...highlighted], pointers: { ...pointers }, description: desc, cppLine, pythonLine })
  }

  snapshot('init', [], {}, `空链表。链表由节点组成，每个节点存储值和指向下一个节点的指针。`, 1, 1)

  for (const op of ops) {
    if (op.type === 'append') {
      const node = makeNode(op.val)
      if (!head) {
        head = node
        snapshot('append', [node.id], {}, `追加 ${op.val}：链表为空，新节点成为头节点。`, 9, 7)
      } else {
        let cur = head
        snapshot('append-traverse', [head.id], { current: head.id }, `追加 ${op.val}：遍历到链表末尾。`, 19, 14)
        while (cur.next) {
          cur = cur.next
          snapshot('append-traverse', [cur.id], { current: cur.id }, `继续遍历，当前节点 ${cur.val}。`, 24, 18)
        }
        cur.next = node
        snapshot('append', [node.id], { prev: cur.id, current: node.id }, `在末尾插入节点 ${op.val}，前一节点 ${cur.val} 的 next 指向新节点。`, 21, 16)
      }
    } else if (op.type === 'prepend') {
      const node = makeNode(op.val)
      node.next = head
      head = node
      snapshot('prepend', [node.id], { current: node.id }, `头插 ${op.val}：新节点成为头节点，next 指向原头节点。`, 10, 8)
    } else if (op.type === 'insertAt') {
      const { pos, val } = op
      const node = makeNode(val)
      if (pos === 0) {
        node.next = head; head = node
        snapshot('insertAt', [node.id], {}, `在位置 0 插入 ${val}（头插）。`, 10, 8)
      } else {
        let cur = head; let i = 0
        while (cur && i < pos - 1) {
          snapshot('insertAt-traverse', [cur.id], { current: cur.id },
            `查找位置 ${pos} 的前驱，当前位置 ${i}，节点值 ${cur.val}。`, 19, 14)
          cur = cur.next; i++
        }
        if (cur) {
          node.next = cur.next; cur.next = node
          snapshot('insertAt', [node.id, cur.id], { prev: cur.id, current: node.id },
            `在节点 ${cur.val} 后插入 ${val}，调整 next 指针。`, 21, 16)
        }
      }
    } else if (op.type === 'delete') {
      const { val } = op
      if (!head) {
        snapshot('delete-miss', [], {}, `删除 ${val}：链表为空。`, 19, 14); continue
      }
      if (head.val === val) {
        const old = head
        head = head.next
        snapshot('delete', [old.id], {}, `删除头节点 ${val}，头指针移向下一节点。`, 21, 16)
      } else {
        let prev = head; let cur = head.next
        let found = false
        while (cur) {
          snapshot('delete-traverse', [cur.id], { prev: prev.id, current: cur.id },
            `查找 ${val}，当前节点 ${cur.val}。`, 20, 15)
          if (cur.val === val) {
            prev.next = cur.next
            snapshot('delete', [cur.id, prev.id], { prev: prev.id },
              `找到 ${val}，将前驱节点 ${prev.val} 的 next 跳过当前节点。`, 21, 16)
            found = true; break
          }
          prev = cur; cur = cur.next
        }
        if (!found) snapshot('delete-miss', [], {}, `未找到值 ${val}。`, 26, 19)
      }
    } else if (op.type === 'search') {
      const { val } = op
      let cur = head; let found = false; let idx = 0
      while (cur) {
        snapshot('search', [cur.id], { current: cur.id },
          `搜索 ${val}，检查位置 ${idx}：节点值 ${cur.val}。`, 20, 15)
        if (cur.val === val) {
          snapshot('search-found', [cur.id], { current: cur.id },
            `找到 ${val}，位于位置 ${idx}！`, 21, 16)
          found = true; break
        }
        cur = cur.next; idx++
      }
      if (!found) snapshot('search-miss', [], {}, `搜索 ${val}：遍历完整个链表，未找到。`, 26, 19)
    } else if (op.type === 'reverse') {
      let prev = null; let cur = head
      snapshot('reverse-start', [], {}, `反转链表：初始化 prev=null，cur=头节点。`, 31, 22)
      while (cur) {
        const nxt = cur.next
        snapshot('reverse-step', [cur.id], { prev: prev?.id ?? -1, current: cur.id },
          `将节点 ${cur.val} 的 next 指向 prev（${prev ? prev.val : 'null'}），然后前进。`, 35, 25)
        cur.next = prev; prev = cur; cur = nxt
      }
      head = prev
      snapshot('reverse-done', prev ? [prev.id] : [], {},
        `反转完成，新头节点为 ${prev ? prev.val : '(空)'}。`, 39, 28)
    }
  }

  return steps
}
