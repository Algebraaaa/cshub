// Step shape: { array, comparing[], swapped[], sorted[], gap, description }
export function shellSort(input) {
  const arr = [...input]
  const n = arr.length
  const steps = []

  // 边界情况：空数组或单元素
  if (n <= 1) {
    if (n === 1) {
      steps.push({
        array: arr,
        comparing: [],
        swapped: [],
        sorted: [0],
        gap: 1,
        cppLine: 1,
        pythonLine: 1,
        description: n === 0 ? '空数组，无需排序' : '单元素数组，已排序',
      })
    }
    return steps
  }

  // Knuth sequence: 1, 4, 13, 40, …
  let gap = 1
  while (gap < Math.floor(n / 3)) gap = gap * 3 + 1

  const snap = (extra) => ({ array: [...arr], ...extra })

  steps.push(snap({
    comparing: [], swapped: [], sorted: [],
    gap,
    cppLine: 4, pythonLine: 5,
    description: `希尔排序开始，初始 gap = ${gap}（Knuth 序列）`,
  }))

  while (gap >= 1) {
    for (let i = gap; i < n; i++) {
      const key = arr[i]
      let j = i

      steps.push(snap({
        comparing: [i], swapped: [], sorted: [],
        gap,
        cppLine: 8, pythonLine: 9,
        description: `gap=${gap}，取出 arr[${i}]=${key}，向前每隔 ${gap} 步比较`,
      }))

      while (j >= gap && arr[j - gap] > key) {
        steps.push(snap({
          comparing: [j - gap, j], swapped: [], sorted: [],
          gap,
          cppLine: 10, pythonLine: 11,
          description: `arr[${j - gap}]=${arr[j - gap]} > ${key}，后移`,
        }))
        arr[j] = arr[j - gap]
        steps.push(snap({
          comparing: [], swapped: [j], sorted: [],
          gap,
          cppLine: 11, pythonLine: 12,
          description: `arr[${j}] ← ${arr[j]}（后移完成）`,
        }))
        j -= gap
      }

      arr[j] = key
      if (j !== i) {
        steps.push(snap({
          comparing: [], swapped: [j], sorted: [],
          gap,
          cppLine: 14, pythonLine: 14,
          description: `arr[${j}] ← ${key} 插入完成`,
        }))
      }
    }

    const prevGap = gap
    gap = Math.floor(gap / 3)
    if (gap >= 1) {
      steps.push(snap({
        comparing: [], swapped: [], sorted: [],
        gap,
        cppLine: 16, pythonLine: 15,
        description: `gap ${prevGap} → ${gap}，再次全量插入排序`,
      }))
    }
  }

  steps.push(snap({
    comparing: [], swapped: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    gap: 0,
    cppLine: 18, pythonLine: 16,
    description: '排序完成，所有元素就位',
  }))

  return steps
}
