// Bucket Sort visualization step generator
// Step: { arr, buckets, phase, description, cppLine, pythonLine }

export function bucketSort(arr) {
  const steps = []
  const a = [...arr]
  const n = a.length
  if (n === 0) return [{ arr: [], buckets: null, phase: 'done', description: '数组为空' }]

  const maxVal = Math.max(...a)
  const minVal = Math.min(...a)
  const bucketCount = Math.max(2, Math.floor(Math.sqrt(n)))
  const range = maxVal - minVal || 1

  steps.push({
    arr: [...a],
    buckets: null,
    phase: 'init',
    bucketCount,
    minVal,
    maxVal,
    description: `桶排序开始，范围 [${minVal}, ${maxVal}]，创建 ${bucketCount} 个桶`,
    cppLine: 1,
    pythonLine: 1,
  })

  // Distribute
  const buckets = Array.from({ length: bucketCount }, () => [])
  for (const v of a) {
    const bi = Math.min(bucketCount - 1, Math.floor(((v - minVal) / range) * bucketCount))
    buckets[bi].push(v)
  }

  steps.push({
    arr: [...a],
    buckets: buckets.map(b => [...b]),
    phase: 'distribute',
    bucketCount,
    minVal,
    maxVal,
    description: `将 ${n} 个元素均匀分配到 ${bucketCount} 个桶中`,
    cppLine: 6,
    pythonLine: 6,
  })

  // Sort each bucket
  const sortedBuckets = buckets.map(b => [...b].sort((x, y) => x - y))
  steps.push({
    arr: [...a],
    buckets: sortedBuckets.map(b => [...b]),
    phase: 'sort_buckets',
    bucketCount,
    minVal,
    maxVal,
    description: `对每个桶内部进行插入排序（桶内元素少，接近 O(1)）`,
    cppLine: 9,
    pythonLine: 11,
  })

  // Collect
  let idx = 0
  for (const b of sortedBuckets) {
    for (const v of b) {
      a[idx++] = v
    }
  }

  steps.push({
    arr: [...a],
    buckets: null,
    phase: 'done',
    bucketCount,
    minVal,
    maxVal,
    description: `将所有桶按序拼接，排序完成！`,
    cppLine: 13,
    pythonLine: 13,
  })

  return steps
}
