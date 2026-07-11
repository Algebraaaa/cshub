// Radix Sort (LSD) visualization step generator
// Step: { arr, buckets, phase, digit, description, cppLine, pythonLine }

export function radixSort(arr) {
  const steps = []
  const a = [...arr]
  const n = a.length
  if (n === 0) return [{ arr: [], buckets: null, phase: 'done', description: '数组为空' }]

  // 负数处理：LSD 基数排序只能对非负整数按位分桶。含负数时整体平移 offset
  // 使全部非负（平移是单调的，不改变相对顺序），分桶用平移值、显示仍用原值。
  // offset=0（输入本就非负，含所有预设）时行为与旧版逐字节一致。
  const minVal = Math.min(...a)
  const offset = minVal < 0 ? -minVal : 0
  const shifted = (v) => v + offset

  const maxVal = Math.max(...a)
  const maxShifted = maxVal + offset
  const maxDigits = maxShifted <= 0 ? 1 : Math.floor(Math.log10(maxShifted)) + 1

  steps.push({
    arr: [...a],
    buckets: null,
    phase: 'init',
    digit: 0,
    description: `基数排序开始，最大值 ${maxVal}，共 ${maxDigits} 位数字`,
    cppLine: 15,
    pythonLine: 1,
  })

  for (let d = 0; d < maxDigits; d++) {
    const exp = Math.pow(10, d)
    const digitLabel = d === 0 ? '个位' : d === 1 ? '十位' : d === 2 ? '百位' : `10^${d}位`

    // Show distribution phase
    const buckets = Array.from({ length: 10 }, () => [])
    for (const v of a) {
      const bucket = Math.floor(shifted(v) / exp) % 10  // 按平移值分桶，避免负索引
      buckets[bucket].push(v)                            // 桶内仍存原值
    }

    steps.push({
      arr: [...a],
      buckets: buckets.map(b => [...b]),
      phase: 'distribute',
      digit: d,
      digitLabel,
      description: `第 ${d + 1} 轮：按${digitLabel}分配到桶 0-9`,
      cppLine: 5,
      pythonLine: 13,
    })

    // Collect from buckets
    let idx = 0
    for (let b = 0; b < 10; b++) {
      for (const v of buckets[b]) {
        a[idx++] = v
      }
    }

    steps.push({
      arr: [...a],
      buckets: null,
      phase: 'collect',
      digit: d,
      digitLabel,
      description: `第 ${d + 1} 轮：从桶 0→9 依次收集，按${digitLabel}排序完成`,
      cppLine: 11,
      pythonLine: 19,
    })
  }

  steps.push({
    arr: [...a],
    buckets: null,
    phase: 'done',
    digit: maxDigits,
    description: `排序完成！共进行 ${maxDigits} 轮分配-收集`,
    cppLine: 17,
    pythonLine: 7,
  })

  return steps
}
