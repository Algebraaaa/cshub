// Step shape:
// {
//   arr: [{id, value}, ...],
//   range: [low, high],
//   pivotId,                     // 当前 pivot 元素的 id（稳定）
//   pivotValue,
//   pivotLifted,                 // 是否将 pivot 视觉抬升
//   i, j,                        // 边界 / 扫描指针的绝对索引
//   fixedPivotIds: [...],       // 已最终归位的 pivot id 集合
//   compareIds: [jId, pivotId],  // 当前比较的两个 id（用于 j 圆的发光）
//   swapIds: [a, b],             // 本步发生交换的两个元素 id
//   phase,                       // 'enter' | 'compare' | 'swap' | 'place-pivot' | 'done-partition' | 'done'
//   description,
// }
export function quickSort(input) {
  // 边界情况：空数组或单元素
  if (input.length <= 1) {
    const elements = input.map((v, i) => ({ id: i, value: v }))
    const arr = [...elements]
    const steps = []
    const fixedPivotIds = new Set()

    const snapshot = (state) => ({
      arr: arr.map(e => ({ id: e.id, value: e.value })),
      fixedPivotIds: [...fixedPivotIds],
      ...state,
    })

    if (input.length === 0) {
      steps.push(snapshot({
        range: null,
        pivotId: null, pivotValue: null, pivotLifted: false,
        i: null, j: null,
        compareIds: null, swapIds: null,
        phase: 'done',
        cppLine: 1,
        pythonLine: 1,
        description: '空数组，无需排序',
      }))
    } else {
      fixedPivotIds.add(0)
      steps.push(snapshot({
        range: [0, 0],
        pivotId: 0, pivotValue: input[0], pivotLifted: false,
        i: null, j: null,
        compareIds: null, swapIds: null,
        phase: 'done',
        cppLine: 1,
        pythonLine: 1,
        description: '单元素数组，已排序',
      }))
    }
    return steps
  }
  const elements = input.map((v, i) => ({ id: i, value: v }))
  const arr = [...elements]
  const steps = []
  const fixedPivotIds = new Set()

  const snapshot = (state) => ({
    arr: arr.map(e => ({ id: e.id, value: e.value })),
    fixedPivotIds: [...fixedPivotIds],
    ...state,
  })

  function partition(low, high) {
    const pivotEl = arr[high]
    let i = low - 1

    steps.push(snapshot({
      range: [low, high],
      pivotId: pivotEl.id, pivotValue: pivotEl.value, pivotLifted: true,
      i, j: low,
      compareIds: null, swapIds: null,
      phase: 'enter',
      cppLine: 2,
      pythonLine: 11,
      description: `分区 [${low}, ${high}]，pivot = ${pivotEl.value}（抬升出主行）`,
    }))

    for (let j = low; j < high; j++) {
      const jEl = arr[j]
      steps.push(snapshot({
        range: [low, high],
        pivotId: pivotEl.id, pivotValue: pivotEl.value, pivotLifted: true,
        i, j,
        compareIds: [jEl.id, pivotEl.id],
        swapIds: null,
        phase: 'compare',
        cppLine: 5,
        pythonLine: 14,
        description: `j=${j}：比较 ${jEl.value} 与 pivot=${pivotEl.value}`,
      }))
      if (jEl.value <= pivotEl.value) {
        i++
        if (i !== j) {
          const aEl = arr[i], bEl = arr[j]
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          steps.push(snapshot({
            range: [low, high],
            pivotId: pivotEl.id, pivotValue: pivotEl.value, pivotLifted: true,
            i, j,
            compareIds: null,
            swapIds: [aEl.id, bEl.id],
            phase: 'swap',
            cppLine: 7,
            pythonLine: 16,
            description: `${jEl.value} ≤ pivot：i 前进到 ${i}，交换 ${aEl.value} ↔ ${bEl.value}`,
          }))
        } else {
          steps.push(snapshot({
            range: [low, high],
            pivotId: pivotEl.id, pivotValue: pivotEl.value, pivotLifted: true,
            i, j,
            compareIds: null, swapIds: null,
            phase: 'swap',
            cppLine: 6,
            pythonLine: 15,
            description: `${jEl.value} ≤ pivot：i 前进到 ${i}（i==j，无需交换）`,
          }))
        }
      } else {
        steps.push(snapshot({
          range: [low, high],
          pivotId: pivotEl.id, pivotValue: pivotEl.value, pivotLifted: true,
          i, j,
          compareIds: null, swapIds: null,
          phase: 'compare',
          cppLine: 5,
          pythonLine: 14,
          description: `${jEl.value} > pivot：i 不动，继续扫描`,
        }))
      }
    }

    // 把 pivot 落回到最终位置 i+1
    const finalPos = i + 1
    if (finalPos !== high) {
      const displaced = arr[finalPos]
      ;[arr[finalPos], arr[high]] = [arr[high], arr[finalPos]]
      fixedPivotIds.add(pivotEl.id)
      steps.push(snapshot({
        range: [low, high],
        pivotId: pivotEl.id, pivotValue: pivotEl.value, pivotLifted: false,
        i, j: high,
        compareIds: null,
        swapIds: [pivotEl.id, displaced.id],
        phase: 'place-pivot',
        cppLine: 10,
        pythonLine: 17,
        description: `pivot 落到位置 ${finalPos}，至此 [${low}, ${finalPos - 1}] 全 ≤ pivot ≤ [${finalPos + 1}, ${high}]`,
      }))
    } else {
      fixedPivotIds.add(pivotEl.id)
      steps.push(snapshot({
        range: [low, high],
        pivotId: pivotEl.id, pivotValue: pivotEl.value, pivotLifted: false,
        i, j: high,
        compareIds: null, swapIds: null,
        phase: 'place-pivot',
        cppLine: 10,
        pythonLine: 17,
        description: `pivot 已在位置 ${finalPos}，分区结束`,
      }))
    }
    return finalPos
  }

  function sort(low, high) {
    if (low >= high) {
      // 边界：区间长度 ≤ 1
      if (low === high) {
        fixedPivotIds.add(arr[low].id)
        steps.push(snapshot({
          range: [low, high],
          pivotId: null, pivotValue: null, pivotLifted: false,
          i: null, j: null,
          compareIds: null, swapIds: null,
          phase: 'done-partition',
          cppLine: 15,
          pythonLine: 4,
          description: `单元素区间 [${low}]，已就位`,
        }))
      }
      return
    }
    const pi = partition(low, high)
    // 优化提示：检查子区间大小
    if (pi - low > 1 || high - pi > 1) {
      steps.push(snapshot({
        range: null,
        pivotId: null, pivotValue: null, pivotLifted: false,
        i: null, j: null,
        compareIds: null, swapIds: null,
        phase: 'compare',
        cppLine: 17,
        pythonLine: 6,
        description: `分区位置 ${pi}，递归排序左 [${low}, ${pi - 1}] 和右 [${pi + 1}, ${high}]`,
      }))
    }
    sort(low, pi - 1)
    sort(pi + 1, high)
  }

  sort(0, arr.length - 1)
  steps.push(snapshot({
    range: null,
    pivotId: null, pivotValue: null, pivotLifted: false,
    i: null, j: null,
    compareIds: null, swapIds: null,
    phase: 'done',
    cppLine: 20,
    pythonLine: 8,
    description: '排序完成',
  }))
  return steps
}
