// 熵率：对马尔可夫信源 H = Σ π_i H(Y|X=i)，其中 π 是平稳分布
export function entropyRateSteps({ transition, initial } = {}) {
  // 默认 2 状态马尔可夫
  const P = transition || [
    [0.7, 0.3],
    [0.4, 0.6],
  ]
  const n = P.length
  // 求平稳分布：π P = π 且 Σ π = 1
  // 解：π0 + π1 = 1, π0 P[0][0] + π1 P[1][0] = π0
  // => π0 (1-P[0][0]-1) + π1 P[1][0] = 0... 手动解：直接迭代几次
  let pi = initial || [0.5, 0.5]
  const piTrace = [[...pi]]
  for (let t = 0; t < 8; t++) {
    const next = new Array(n).fill(0)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        next[j] += pi[i] * P[i][j]
      }
    }
    pi = next
    piTrace.push([...pi])
  }
  // 平稳分布 π
  // 熵率 H = Σ_i π_i * H(Y|X=i)
  let Hrate = 0
  for (let i = 0; i < n; i++) {
    let hCond = 0
    for (let j = 0; j < n; j++) {
      if (P[i][j] > 1e-12) hCond += -P[i][j] * Math.log2(P[i][j])
    }
    Hrate += pi[i] * hCond
  }
  // i.i.d. 熵 = H(π)
  let Hsingle = 0
  for (let i = 0; i < n; i++) {
    if (pi[i] > 1e-12) Hsingle += -pi[i] * Math.log2(pi[i])
  }
  const steps = []
  steps.push({
    phase: 'intro',
    description: `熵率：随机过程单位时间的平均不确定性 H = lim H(X_n | X_1..X_{n-1})。对平稳马尔可夫链：H = Σ π_i H(Y|X=i)。`,
    P, pi, piTrace, stepIdx: 0, Hrate, Hsingle,
    highlightLine: 1,
  })
  for (let t = 1; t < piTrace.length; t++) {
    steps.push({
      phase: 'iterate',
      description: `第 ${t} 步分布迭代 π^T P = [${piTrace[t].map(v => v.toFixed(4)).join(', ')}]，逐渐收敛到平稳分布。`,
      P, pi: piTrace[t], piTrace, stepIdx: t, Hrate, Hsingle,
      highlightLine: t === 1 ? 4 : t === 2 ? 5 : 6,
    })
  }
  steps.push({
    phase: 'stationary',
    description: `平稳分布 π ≈ [${pi.map(v => v.toFixed(4)).join(', ')}]。单个符号熵 H(π) = ${Hsingle.toFixed(4)} 比特。`,
    P, pi, piTrace, stepIdx: piTrace.length, Hrate, Hsingle,
    highlightLine: 7,
  })
  steps.push({
    phase: 'rate',
    description: `熵率 H = Σ π_i H(Y|X=i) ≈ ${Hrate.toFixed(4)} 比特/符号。因为有记忆的信源的熵率 ≤ 单符号熵（马尔可夫约束减少不确定度）。`,
    P, pi, piTrace, stepIdx: piTrace.length + 1, Hrate, Hsingle,
    highlightLine: 8,
  })
  return steps
}
