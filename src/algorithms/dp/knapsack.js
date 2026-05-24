// 0-1 背包，返回步骤数组
// items: [{weight, value}], capacity: number
export function knapsack01(items, capacity) {
  const n = items.length
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0))
  const steps = []

  // 边界情况：空物品或容量为 0
  if (n === 0 || capacity === 0) {
    steps.push({
      dp: dp.map(r => [...r]),
      highlight: null,
      items,
      capacity,
      cppLine: 1,
      pythonLine: 1,
      description: n === 0 ? '没有物品，最大价值为 0' : '背包容量为 0，最大价值为 0',
    })
    return steps
  }

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      const item = items[i - 1]
      if (item.weight > w) {
        dp[i][w] = dp[i - 1][w]
        steps.push({
          dp: dp.map(r => [...r]),
          highlight: [i, w],
          items,
          capacity,
          cppLine: 6,
          pythonLine: 6,
          description: `物品${i}(w=${item.weight})放不下，dp[${i}][${w}]=dp[${i-1}][${w}]=${dp[i][w]}`,
        })
      } else {
        const skip = dp[i - 1][w]
        const take = dp[i - 1][w - item.weight] + item.value
        dp[i][w] = Math.max(skip, take)
        steps.push({
          dp: dp.map(r => [...r]),
          highlight: [i, w],
          cppLine: 8,
          pythonLine: 8,
          items,
          capacity,
          description: `物品${i}: 不取=${skip}, 取=${take} → dp[${i}][${w}]=${dp[i][w]}`,
        })
      }
    }
  }
  steps.push({
    dp: dp.map(r => [...r]),
    highlight: [n, capacity],
    cppLine: 13,
    pythonLine: 12,
    items,
    capacity,
    description: `最优解 = dp[${n}][${capacity}] = ${dp[n][capacity]}`,
  })
  return steps
}
