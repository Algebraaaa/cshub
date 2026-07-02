// 马尔可夫信源：状态图 + 状态转移矩阵 + 平稳分布
export function markovSourceSteps() {
  // 3 状态：好(G=0) 中(M=1) 坏(B=2)
  const states = ['G', 'M', 'B']
  const P = [
    [0.6, 0.3, 0.1],
    [0.2, 0.5, 0.3],
    [0.1, 0.3, 0.6],
  ]
  const n = states.length
  // 初始分布
  let pi = [0.6, 0.3, 0.1]
  const piTrace = [[...pi]]
  const iterCount = 8
  for (let t = 0; t < iterCount; t++) {
    const next = new Array(n).fill(0)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        next[j] += pi[i] * P[i][j]
      }
    }
    pi = next
    piTrace.push([...pi])
  }
  // 状态游走演示
  const walk = [0]
  let current = 0
  const walkTransitions = []
  for (let t = 0; t < 8; t++) {
    const row = P[current]
    const r = Math.random()
    let acc = 0
    let next = current
    for (let j = 0; j < n; j++) {
      acc += row[j]
      if (r <= acc) { next = j; break }
    }
    walkTransitions.push({ from: current, to: next })
    walk.push(next)
    current = next
  }

  const steps = []
  steps.push({
    phase: 'intro',
    description: `马尔可夫信源：${n} 个状态 {${states.join(', ')}}，满足无后效性 P(X_t | X_{t-1},...) = P(X_t | X_{t-1})。`,
    P, states, piTrace, walk, walkTransitions,
    iter: -1, walkStep: -1, currentState: -1,
    highlightLine: 1,
  })
  steps.push({
    phase: 'matrix',
    description: '状态转移矩阵 P[i][j] = P(X_t=j | X_{t-1}=i)。每一行之和为 1。',
    P, states, piTrace, walk, walkTransitions,
    iter: -1, walkStep: -1, currentState: -1,
    highlightLine: 2,
  })
  for (let t = 1; t < piTrace.length; t++) {
    steps.push({
      phase: 'stationary',
      description: `第 ${t} 步分布 π^T P = [${piTrace[t].map(v => v.toFixed(4)).join(', ')}]，逐渐收敛到平稳分布。`,
      P, states, piTrace, walk, walkTransitions,
      iter: t, walkStep: -1, currentState: -1,
      highlightLine: 4,
    })
  }
  const stationary = piTrace[piTrace.length - 1]
  steps.push({
    phase: 'steady',
    description: `平稳分布 π ≈ [${stationary.map(v => v.toFixed(4)).join(', ')}]。满足 π P = π 且 Σ π_i = 1。`,
    P, states, piTrace, walk, walkTransitions,
    iter: piTrace.length, walkStep: -1, currentState: 0,
    highlightLine: 3,
  })
  for (let t = 0; t < walkTransitions.length; t++) {
    const tr = walkTransitions[t]
    steps.push({
      phase: 'walk',
      description: `状态游走第 ${t + 1} 步：${states[tr.from]} → ${states[tr.to]}（转移概率 P[${tr.from}][${tr.to}] = ${P[tr.from][tr.to]}）。`,
      P, states, piTrace, walk, walkTransitions,
      iter: piTrace.length + 1 + t, walkStep: t, currentState: tr.to,
      highlightLine: 8,
    })
  }
  steps.push({
    phase: 'done',
    description: `状态序列：${walk.map(s => states[s]).join(' → ')}。长期访问频率应与平稳分布 π 一致（大数定律）。`,
    P, states, piTrace, walk, walkTransitions,
    iter: piTrace.length + walkTransitions.length + 1, walkStep: walkTransitions.length, currentState: walk[walk.length - 1],
    highlightLine: 8,
  })
  return steps
}
