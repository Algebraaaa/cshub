// Step shape (tree-style):
// {
//   arr: [{id, value}, ...],
//   elementLevel: { [id]: level },  // each element's current tree level
//   elementPos:   { [id]: position },
//   level,                           // active level (parent for merge, parent-being-split for split)
//   leftRange:  [a, b],
//   rightRange: [c, d],
//   iPos, jPos, kPos,
//   comparingIds: [idL, idR],
//   chosenId, chosenSide,
//   leafDepths, maxDepth,
//   tree: [{left, right, level}, ...],
//   phase: 'split-enter'|'split'|'enter'|'compare'|'place'|'flush'|'done-range'|'done',
//   description,
// }
export function mergeSort(input) {
  const n = input.length
  
  // 边界情况：空数组或单元素
  if (n <= 1) {
    const elements = n === 0 ? [] : input.map((v, i) => ({ id: i, value: v }))
    const arr = [...elements]
    const steps = []

    if (n === 0) {
      steps.push({
        arr: arr.map(e => ({ id: e.id, value: e.value })),
        elementLevel: {},
        elementPos: {},
        leafDepths: [],
        maxDepth: 0,
        tree: [],
        level: null,
        leftRange: null,
        rightRange: null,
        iPos: null,
        jPos: null,
        kPos: null,
        comparingIds: null,
        chosenId: null,
        chosenSide: null,
        phase: 'done',
        cppLine: 1,
        pythonLine: 1,
        description: '空数组，无需排序',
      })
    } else {
      steps.push({
        arr: arr.map(e => ({ id: e.id, value: e.value })),
        elementLevel: { [elements[0].id]: 0 },
        elementPos: { [elements[0].id]: 0 },
        leafDepths: [0],
        maxDepth: 0,
        tree: [{ left: 0, right: 0, level: 0 }],
        level: 0,
        leftRange: null,
        rightRange: null,
        iPos: null,
        jPos: null,
        kPos: null,
        comparingIds: null,
        chosenId: null,
        chosenSide: null,
        phase: 'done',
        cppLine: 1,
        pythonLine: 1,
        description: '单元素数组，已排序',
      })
    }
    return steps
  }
  const elements = input.map((v, i) => ({ id: i, value: v }))
  const arr = [...elements]
  const steps = []

  // Precompute leaf depths and all slots
  const leafDepths = new Array(n)
  const tree = []
  function walk(left, right, level) {
    tree.push({ left, right, level })
    if (left === right) { leafDepths[left] = level; return }
    const mid = Math.floor((left + right) / 2)
    walk(left, mid, level + 1)
    walk(mid + 1, right, level + 1)
  }
  walk(0, n - 1, 0)
  const maxDepth = Math.max(...leafDepths)

  // All elements start at level 0 (root)
  const elementLevel = {}
  const elementPos = {}
  for (let i = 0; i < n; i++) {
    elementLevel[elements[i].id] = 0
    elementPos[elements[i].id] = i
  }

  const snapshot = (state) => ({
    arr: arr.map(e => ({ id: e.id, value: e.value })),
    elementLevel: { ...elementLevel },
    elementPos: { ...elementPos },
    leafDepths, maxDepth, tree,
    ...state,
  })

  const NULL_PTRS = { iPos: null, jPos: null, kPos: null, comparingIds: null, chosenId: null, chosenSide: null }

  // ── SPLIT PHASE (top-down) ──────────────────────────────────
  steps.push(snapshot({
    level: 0, leftRange: null, rightRange: null,
    ...NULL_PTRS,
    phase: 'split-enter',
    cppLine: 13,
    pythonLine: 4,
    description: `归并排序：${n} 个元素，从根开始自顶向下划分`,
  }))

  function splitPhase(left, right, level) {
    if (left === right) return
    const mid = Math.floor((left + right) / 2)

    // Show which range is about to split (elements still at parent level)
    steps.push(snapshot({
      level,
      leftRange: [left, mid], rightRange: [mid + 1, right],
      ...NULL_PTRS,
      phase: 'split-enter',
      cppLine: 2,
      pythonLine: 2,
      description: `划分 [${left}, ${right}]，mid=${mid} → 左 [${left}, ${mid}]，右 [${mid + 1}, ${right}]`,
    }))

    // Drop all elements in this range one level down
    for (let i = left; i <= right; i++) {
      elementLevel[arr[i].id] = level + 1
    }

    // Show result: two child groups now separated
    steps.push(snapshot({
      level,
      leftRange: [left, mid], rightRange: [mid + 1, right],
      ...NULL_PTRS,
      phase: 'split',
      description: `[${left}, ${mid}] 与 [${mid + 1}, ${right}] 下沉到第 ${level + 1} 层`,
    }))

    splitPhase(left, mid, level + 1)
    splitPhase(mid + 1, right, level + 1)
  }

  splitPhase(0, n - 1, 0)

  // ── Transition: all at leaves, ready to merge ───────────────
  steps.push(snapshot({
    level: maxDepth, leftRange: null, rightRange: null,
    ...NULL_PTRS,
    phase: 'enter',
    description: `划分完成！所有元素已到达第 ${maxDepth} 层（叶子），开始自底向上归并`,
  }))

  // ── MERGE PHASE (bottom-up) ─────────────────────────────────
  function merge(left, mid, right, level) {
    const L = arr.slice(left, mid + 1)
    const R = arr.slice(mid + 1, right + 1)
    let i = 0, j = 0, k = left

    steps.push(snapshot({
      level,
      leftRange: [left, mid], rightRange: [mid + 1, right],
      iPos: left + i, jPos: mid + 1 + j, kPos: k,
      comparingIds: null, chosenId: null, chosenSide: null,
      phase: 'enter',
      description: `合并 [${left}, ${mid}] 与 [${mid + 1}, ${right}] → 上升到第 ${level} 层`,
    }))

    while (i < L.length && j < R.length) {
      steps.push(snapshot({
        level,
        leftRange: [left, mid], rightRange: [mid + 1, right],
        iPos: left + i, jPos: mid + 1 + j, kPos: k,
        comparingIds: [L[i].id, R[j].id],
        chosenId: null, chosenSide: null,
        phase: 'compare',
        cppLine: 6,
        pythonLine: 13,
        description: `比较 ${L[i].value} 与 ${R[j].value}`,
      }))
      let chosen, side
      if (L[i].value <= R[j].value) {
        chosen = L[i]; side = 'L'; arr[k] = L[i]; i++
      } else {
        chosen = R[j]; side = 'R'; arr[k] = R[j]; j++
      }
      elementLevel[chosen.id] = level
      elementPos[chosen.id] = k
      steps.push(snapshot({
        level,
        leftRange: [left, mid], rightRange: [mid + 1, right],
        iPos: left + i, jPos: mid + 1 + j, kPos: k + 1,
        cppLine: 6,
        pythonLine: 14,
        comparingIds: null, chosenId: chosen.id, chosenSide: side,
        phase: 'place',
        description: `${chosen.value} 上升到位置 ${k}`,
      }))
      k++
    }

    while (i < L.length) {
      arr[k] = L[i]
      elementLevel[L[i].id] = level
      elementPos[L[i].id] = k
      steps.push(snapshot({
        level,
        leftRange: [left, mid], rightRange: [mid + 1, right],
        iPos: left + i + 1, jPos: mid + 1 + j, kPos: k + 1,
        comparingIds: null, chosenId: L[i].id, chosenSide: 'L',
        phase: 'flush',
        description: `右半已空，剩余 ${L[i].value} 上升到位置 ${k}`,
      }))
      i++; k++
    }
    while (j < R.length) {
      arr[k] = R[j]
      elementLevel[R[j].id] = level
      elementPos[R[j].id] = k
      steps.push(snapshot({
        level,
        leftRange: [left, mid], rightRange: [mid + 1, right],
        iPos: left + i, jPos: mid + 1 + j + 1, kPos: k + 1,
        comparingIds: null, chosenId: R[j].id, chosenSide: 'R',
        phase: 'flush',
        description: `左半已空，剩余 ${R[j].value} 上升到位置 ${k}`,
      }))
      j++; k++
    }

    steps.push(snapshot({
      level,
      leftRange: [left, mid], rightRange: [mid + 1, right],
      ...NULL_PTRS,
      phase: 'done-range',
      description: `区间 [${left}, ${right}] 在第 ${level} 层完成合并`,
    }))
  }

  function sort(left, right, level) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2)
      sort(left, mid, level + 1)
      sort(mid + 1, right, level + 1)
      merge(left, mid, right, level)
    }
  }

  sort(0, n - 1, 0)

  steps.push(snapshot({
    level: 0, leftRange: null, rightRange: null,
    ...NULL_PTRS,
    phase: 'done',
    description: '排序完成，所有元素汇聚于根',
  }))

  return steps
}
