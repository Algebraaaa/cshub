// Longest Increasing Subsequence — O(n²) DP
// Step shape:
// {
//   arr: number[],
//   dp: number[],        // dp[i] = LIS length ending at index i
//   prev: number[],      // prev[i] = predecessor index (-1 = none)
//   i: number|null,      // current target index
//   j: number|null,      // current comparison index
//   improved: boolean,
//   lisPath: number[],   // indices of the final LIS (filled at end)
//   phase: 'compare'|'update'|'trace'|'done',
//   description,
// }
export function lis(input) {
  const n = input.length
  const arr = [...input]
  const dp = new Array(n).fill(1)
  const prev = new Array(n).fill(-1)
  const steps = []

  // 边界情况：空数组或单元素
  if (n <= 1) {
    const snap = (extra) => ({
      arr: [...arr],
      dp: arr.length > 0 ? [1] : [],
      prev: arr.length > 0 ? [-1] : [],
      lisPath: arr.length > 0 ? [0] : [],
      i: null, j: null,
      improved: false,
      ...extra,
    })

    if (n === 1) {
      steps.push(snap({
        phase: 'done',
        cppLine: 1,
        pythonLine: 1,
        description: '单元素数组，最长递增子序列长度为 1',
      }))
    } else {
      steps.push(snap({
        phase: 'done',
        cppLine: 1,
        pythonLine: 1,
        description: '空数组，无最长递增子序列',
      }))
    }
    return steps
  }

  const snap = (extra) => ({
    arr: [...arr],
    dp: [...dp],
    prev: [...prev],
    lisPath: [],
    i: null, j: null,
    improved: false,
    ...extra,
  })

  steps.push(snap({
    phase: 'compare',
    cppLine: 3,
    pythonLine: 3,
    description: `LCS 动态规划：dp[i] = 以 arr[i] 结尾的最长递增子序列长度，初始全为 1`,
  }))

  for (let i = 1; i < n; i++) {
    steps.push(snap({
      phase: 'compare', i,
      cppLine: 5,
      pythonLine: 6,
      description: `计算 dp[${i}]（arr[${i}]=${arr[i]}），向左扫描所有 j < ${i}`,
    }))

    for (let j = 0; j < i; j++) {
      const improved = arr[j] < arr[i] && dp[j] + 1 > dp[i]
      steps.push(snap({
        phase: 'compare', i, j,
        improved,
        cppLine: 7,
        pythonLine: 8,
        description: improved
          ? `arr[${j}]=${arr[j]} < arr[${i}]=${arr[i]}，dp[${j}]+1=${dp[j] + 1} > dp[${i}]=${dp[i]}，更新！`
          : `arr[${j}]=${arr[j]} ${arr[j] >= arr[i] ? '≥' : '<'} arr[${i}]=${arr[i]}${arr[j] < arr[i] ? `，dp[${j}]+1=${dp[j] + 1} ≤ dp[${i}]=${dp[i]}，跳过` : '，跳过'}`,
      }))

      if (improved) {
        dp[i] = dp[j] + 1
        prev[i] = j
        steps.push(snap({
          cppLine: 8,
          pythonLine: 9,
          phase: 'update', i, j,
          improved: true,
          description: `dp[${i}] ← ${dp[i]}，前驱 = ${j}`,
        }))
      }
    }
  }

  // Find the end of the best LIS
  let best = 0
  for (let i = 1; i < n; i++) {
    if (dp[i] > dp[best]) best = i
  }

  // Trace back
  const lisPath = []
  let cur = best
  while (cur !== -1) {
    lisPath.unshift(cur)
    cur = prev[cur]
  }

  steps.push(snap({
    cppLine: 16,
    pythonLine: 16,
    phase: 'trace',
    lisPath,
    description: `回溯最长递增子序列，长度 = ${dp[best]}，路径：[${lisPath.map(i => arr[i]).join(', ')}]`,
  }))

  steps.push(snap({
    cppLine: 19,
    pythonLine: 19,
    phase: 'done',
    lisPath,
    description: `完成！LIS = [${lisPath.map(i => arr[i]).join(', ')}]，长度 ${dp[best]}`,
  }))

  return steps
}
