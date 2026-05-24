// Longest Common Subsequence
// Returns steps with dp table snapshots
export function lcs(s1, s2) {
  const m = s1.length, n = s2.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  const dir = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null))
  const steps = []

  // 边界情况：空字符串或单字符
  if (m === 0 || n === 0) {
    steps.push({
      dp: dp.map(r => [...r]),
      s1, s2,
      highlight: null,
      arrows: [],
      matchLine: null,
      backtrack: [],
      result: '',
      cppLine: 1,
      pythonLine: 1,
      description: m === 0 || n === 0 ? '其中一个字符串为空，LCS 长度为 0' : 'LCS 计算',
    })
    return steps
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
        dir[i][j] = 'diag'
        steps.push({
          dp: dp.map(r => [...r]),
          s1, s2,
          highlight: [i, j],
          arrows: [{ from: [i - 1, j - 1], to: [i, j] }],
          matchLine: [i - 1, j - 1],
          backtrack: [],
          result: '',
          cppLine: 7,
          pythonLine: 7,
          description: `s1[${i - 1}]='${s1[i - 1]}' == s2[${j - 1}]='${s2[j - 1]}'，dp[${i}][${j}]=dp[${i - 1}][${j - 1}]+1=${dp[i][j]}`,
        })
      } else {
        if (dp[i - 1][j] >= dp[i][j - 1]) {
          dp[i][j] = dp[i - 1][j]
          dir[i][j] = 'up'
        } else {
          dp[i][j] = dp[i][j - 1]
          dir[i][j] = 'left'
        }
        steps.push({
          dp: dp.map(r => [...r]),
          s1, s2,
          highlight: [i, j],
          arrows: [
            { from: [i - 1, j], to: [i, j] },
            { from: [i, j - 1], to: [i, j] },
          ],
          matchLine: null,
          cppLine: 9,
          pythonLine: 9,
          backtrack: [],
          result: '',
          description: `'${s1[i - 1]}' != '${s2[j - 1]}'，取 max(dp[${i - 1}][${j}]=${dp[i - 1][j]}, dp[${i}][${j - 1}]=${dp[i][j - 1]})=${dp[i][j]}`,
        })
      }
    }
  }

  // backtrack
  let i = m, j = n
  const path = []
  const lcsChars = []
  while (i > 0 && j > 0) {
    path.push([i, j])
    if (dir[i][j] === 'diag') {
      lcsChars.unshift(s1[i - 1])
      i--; j--
    } else if (dir[i][j] === 'up') {
      i--
    } else {
      j--
    }
    steps.push({
      dp: dp.map(r => [...r]),
      s1, s2,
      highlight: null,
      arrows: [],
      matchLine: null,
      cppLine: 16,
      pythonLine: 14,
      backtrack: [...path],
      result: lcsChars.join(''),
      description: `回溯：构建 LCS = "${lcsChars.join('')}"`,
    })
  }

  steps.push({
    dp: dp.map(r => [...r]),
    s1, s2,
    highlight: [m, n],
    arrows: [],
    matchLine: null,
    cppLine: 26,
    pythonLine: 23,
    backtrack: path,
    result: lcsChars.join(''),
    description: `完成！LCS = "${lcsChars.join('')}"，长度 = ${dp[m][n]}`,
  })
  return steps
}
