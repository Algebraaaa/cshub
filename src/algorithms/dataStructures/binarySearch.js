// Binary search visualization step generator.
// Supports three variants:
//   'classic' — find any index where arr[i] === target (returns -1 if not found)
//   'lower'   — leftmost index i where arr[i] >= target (lower_bound)
//   'upper'   — leftmost index i where arr[i] >  target (upper_bound)
//
// Step shape:
// { array, target, variant, l, r, mid, found, phase, description, cppLine, pythonLine }

const VARIANT_LABEL = {
  classic: '经典二分（精确匹配）',
  lower: '左边界（lower_bound）',
  upper: '右边界（upper_bound）',
}

export function binarySearch({ array = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19], target = 11, variant = 'classic' } = {}) {
  const steps = []
  const arr = Array.isArray(array) ? array.slice() : []
  const n = arr.length

  // Sort to ensure a valid binary search precondition (the input might be unsorted).
  arr.sort((a, b) => a - b)

  steps.push({
    array: arr.slice(), target, variant,
    l: 0, r: n - 1, mid: -1, found: -1,
    phase: 'init',
    description: `${VARIANT_LABEL[variant]}：在已排序数组中查找 ${target}，初始 l=0, r=${n - 1}`,
    cppLine: 2, pythonLine: 2,
  })

  let l = 0
  let r = variant === 'classic' ? n - 1 : n // for lower/upper_bound, r is exclusive
  let answer = -1

  if (variant === 'classic') {
    while (l <= r) {
      const mid = Math.floor((l + r) / 2)
      steps.push({
        array: arr.slice(), target, variant,
        l, r, mid, found: -1,
        phase: 'check',
        description: `计算 mid = ⌊(${l}+${r})/2⌋ = ${mid}，比较 arr[${mid}]=${arr[mid]} 与 target=${target}`,
        cppLine: 5, pythonLine: 5,
      })

      if (arr[mid] === target) {
        answer = mid
        steps.push({
          array: arr.slice(), target, variant,
          l, r, mid, found: mid,
          phase: 'found',
          description: `✅ arr[${mid}]=${arr[mid]} 等于 target，找到位置 ${mid}`,
          cppLine: 6, pythonLine: 6,
        })
        break
      } else if (arr[mid] < target) {
        steps.push({
          array: arr.slice(), target, variant,
          l, r, mid, found: -1,
          phase: 'go_right',
          description: `arr[${mid}]=${arr[mid]} < ${target}，右半段继续：l = mid + 1 = ${mid + 1}`,
          cppLine: 8, pythonLine: 8,
        })
        l = mid + 1
      } else {
        steps.push({
          array: arr.slice(), target, variant,
          l, r, mid, found: -1,
          phase: 'go_left',
          description: `arr[${mid}]=${arr[mid]} > ${target}，左半段继续：r = mid - 1 = ${mid - 1}`,
          cppLine: 10, pythonLine: 10,
        })
        r = mid - 1
      }
    }

    if (answer === -1) {
      steps.push({
        array: arr.slice(), target, variant,
        l, r, mid: -1, found: -1,
        phase: 'done',
        description: `❌ l > r，区间为空，target=${target} 不在数组中`,
        cppLine: 13, pythonLine: 13,
      })
    } else {
      steps.push({
        array: arr.slice(), target, variant,
        l, r, mid: answer, found: answer,
        phase: 'done',
        description: `搜索完成，返回索引 ${answer}`,
        cppLine: 13, pythonLine: 13,
      })
    }
  } else {
    // lower_bound / upper_bound: half-open [l, r)
    const compare = variant === 'lower'
      ? (val) => val >= target
      : (val) => val > target
    const condDesc = variant === 'lower' ? '≥' : '>'

    while (l < r) {
      const mid = Math.floor((l + r) / 2)
      steps.push({
        array: arr.slice(), target, variant,
        l, r: r - 1, mid, found: -1,
        phase: 'check',
        description: `mid = ⌊(${l}+${r})/2⌋ = ${mid}，判断 arr[${mid}]=${arr[mid]} 是否 ${condDesc} ${target}`,
        cppLine: 5, pythonLine: 5,
      })

      if (compare(arr[mid])) {
        steps.push({
          array: arr.slice(), target, variant,
          l, r: r - 1, mid, found: -1,
          phase: 'go_left',
          description: `arr[${mid}]=${arr[mid]} ${condDesc} ${target}，收紧右边界：r = mid = ${mid}（mid 可能是答案）`,
          cppLine: 7, pythonLine: 7,
        })
        r = mid
      } else {
        steps.push({
          array: arr.slice(), target, variant,
          l, r: r - 1, mid, found: -1,
          phase: 'go_right',
          description: `arr[${mid}]=${arr[mid]} 不满足 ${condDesc} ${target}，l = mid + 1 = ${mid + 1}`,
          cppLine: 9, pythonLine: 9,
        })
        l = mid + 1
      }
    }

    const label = variant === 'lower' ? '第一个 ≥ target 的位置' : '第一个 > target 的位置'
    steps.push({
      array: arr.slice(), target, variant,
      l, r: l, mid: -1, found: l < n ? l : -1,
      phase: 'done',
      description: l < n
        ? `✅ ${label} = ${l}（arr[${l}]=${arr[l]}）`
        : `❌ 数组中没有满足条件的元素，返回 ${n}（数组末尾后一位）`,
      cppLine: 12, pythonLine: 12,
    })
  }

  return steps
}
