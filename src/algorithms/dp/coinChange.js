// Coin Change (Minimum Coins) visualization step generator
// Step: { dp[], coins, amount, coin, i, description, cppLine, pythonLine }

export function coinChange(coins = [1, 5, 11], amount = 15) {
  const steps = []
  const INF = amount + 1
  const dp = Array(amount + 1).fill(INF)
  dp[0] = 0

  steps.push({
    dp: [...dp],
    coins,
    amount,
    coin: null,
    i: 0,
    phase: 'init',
    description: `初始化：dp[0]=0（凑0元需0枚），其余=∞。硬币面值: [${coins.join(', ')}]`,
    cppLine: 2,
    pythonLine: 2,
  })

  for (const coin of coins) {
    steps.push({
      dp: [...dp],
      coins,
      amount,
      coin,
      i: null,
      phase: 'new_coin',
      description: `开始用面值 ${coin} 的硬币更新 dp 数组`,
      cppLine: 4,
      pythonLine: 4,
    })

    for (let i = coin; i <= amount; i++) {
      const prev = dp[i]
      if (dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1
        steps.push({
          dp: [...dp],
          coins,
          amount,
          coin,
          i,
          phase: 'update',
          description: `dp[${i}] = min(${prev === INF ? '∞' : prev}, dp[${i}−${coin}]+1=dp[${i-coin}]+1=${dp[i - coin] < INF ? dp[i - coin] : '∞'}+1) → 更新为 ${dp[i]}`,
          cppLine: 6,
          pythonLine: 6,
        })
      } else {
        steps.push({
          dp: [...dp],
          coins,
          amount,
          coin,
          i,
          phase: 'skip',
          description: `dp[${i}] = ${dp[i] === INF ? '∞' : dp[i]} ≤ dp[${i-coin}]+1=${dp[i-coin] < INF ? dp[i-coin]+1 : '∞'}，保持不变`,
          cppLine: 6,
          pythonLine: 6,
        })
      }
    }
  }

  const ans = dp[amount]
  steps.push({
    dp: [...dp],
    coins,
    amount,
    coin: null,
    i: amount,
    phase: 'done',
    description: ans >= INF
      ? `dp[${amount}] = ∞，无法用给定硬币凑出 ${amount}`
      : `完成！凑出 ${amount} 最少需要 ${ans} 枚硬币`,
    cppLine: 7,
    pythonLine: 7,
  })

  return steps
}
