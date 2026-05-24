// Edit Distance (Levenshtein Distance) visualization step generator
// Step: { dp[][], i, j, s1, s2, phase, description, cppLine, pythonLine }

export function editDistance(s1 = 'SUNDAY', s2 = 'SATURDAY') {
  const steps = []
  const m = s1.length
  const n = s2.length

  // Initialize DP table
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )

  steps.push({
    dp: dp.map(r => [...r]),
    i: 0, j: 0,
    s1, s2,
    phase: 'init',
    description: `初始化 DP 表：第0行 = 0..${n}（空串→s2前缀），第0列 = 0..${m}（空串→s1前缀）`,
    cppLine: 3,
    pythonLine: 3,
  })

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = s1[i - 1] === s2[j - 1]
      if (match) {
        dp[i][j] = dp[i - 1][j - 1]
        steps.push({
          dp: dp.map(r => [...r]),
          i, j,
          s1, s2,
          phase: 'match',
          description: `s1[${i-1}]='${s1[i-1]}' == s2[${j-1}]='${s2[j-1]}'，无需操作，dp[${i}][${j}] = dp[${i-1}][${j-1}] = ${dp[i][j]}`,
          cppLine: 9,
          pythonLine: 9,
        })
      } else {
        const ins = dp[i][j - 1]     // insert
        const del = dp[i - 1][j]     // delete
        const rep = dp[i - 1][j - 1] // replace
        dp[i][j] = 1 + Math.min(ins, del, rep)
        const opName = Math.min(ins, del, rep) === ins ? '插入' : Math.min(ins, del, rep) === del ? '删除' : '替换'
        steps.push({
          dp: dp.map(r => [...r]),
          i, j,
          s1, s2,
          phase: 'calc',
          opName,
          description: `s1[${i-1}]='${s1[i-1]}' ≠ s2[${j-1}]='${s2[j-1]}'，取 min(插入${ins}, 删除${del}, 替换${rep})+1 = ${dp[i][j]}（${opName}）`,
          cppLine: 10,
          pythonLine: 11,
        })
      }
    }
  }

  steps.push({
    dp: dp.map(r => [...r]),
    i: m, j: n,
    s1, s2,
    phase: 'done',
    description: `完成！"${s1}" → "${s2}" 的最小编辑距离 = ${dp[m][n]}`,
    cppLine: 11,
    pythonLine: 12,
  })

  return steps
}
