// 信道容量：通过 Blahut-Arimoto 风格演示
export function channelCapacitySteps() {
  // BSC p=0.1 为例
  const flipProb = 0.1
  const P = [
    [1 - flipProb, flipProb],
    [flipProb, 1 - flipProb],
  ]
  const n = 2  // 输入
  const m = 2  // 输出
  // 迭代：从均匀输入开始
  let q = [0.5, 0.5]
  const trace = []
  const iterCount = 6
  for (let it = 0; it < iterCount; it++) {
    // 计算输出分布 r_j = Σ_i q_i P_{i,j}
    const r = new Array(m).fill(0)
    for (let j = 0; j < m; j++) {
      for (let i = 0; i < n; i++) r[j] += q[i] * P[i][j]
    }
    // 互信息 I = Σ_{i,j} q_i P_{i,j} log(P_{i,j} / r_j)
    let I = 0
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (q[i] > 1e-12 && P[i][j] > 1e-12 && r[j] > 1e-12) {
          I += q[i] * P[i][j] * Math.log2(P[i][j] / r[j])
        }
      }
    }
    trace.push({ q: [...q], r: [...r], I })
    // 更新 q（乘子更新 q_i' ∝ exp(Σ_j P_{ij} log(P_{ij} / r_j)) (BA step)
    const qNew = new Array(n).fill(0)
    for (let i = 0; i < n; i++) {
      let s = 0
      for (let j = 0; j < m; j++) {
        if (P[i][j] > 1e-12 && r[j] > 1e-12) {
          s += P[i][j] * Math.log2(P[i][j] / r[j])
        }
      }
      qNew[i] = Math.pow(2, s)
    }
    const sumQ = qNew.reduce((a, b) => a + b, 0)
    for (let i = 0; i < n; i++) qNew[i] /= sumQ
    q = qNew
  }
  let h = 0
  if (flipProb > 0 && flipProb < 1) {
    h = flipProb * Math.log2(flipProb) + (1 - flipProb) * Math.log2(1 - flipProb)
  }
  const capacity = 1 + h
  const steps = []
  steps.push({
    phase: 'intro',
    description: `BSC(p=${flipProb}) 信道容量。香农第二定理：存在编码使速率任意接近 C 且任意小错误。C = max_{p(x)} I(X;Y)。`,
    P, flipProb, iter: 0, trace, capacity, q: trace[0].q, r: trace[0].r, I: trace[0].I,
    highlightLine: 1,
  })
  for (let it = 0; it < trace.length; it++) {
    steps.push({
      phase: 'iter',
      description: `迭代 ${it + 1}：输入分布 q=[${trace[it].q.map(v => v.toFixed(4)).join(', ')}]，输出分布 r=[${trace[it].r.map(v => v.toFixed(4)).join(', ')}]，互信息 I=${trace[it].I.toFixed(6)} 比特。`,
      P, flipProb, iter: it + 1, trace, capacity, q: trace[it].q, r: trace[it].r, I: trace[it].I,
      highlightLine: 2 + it,
    })
  }
  steps.push({
    phase: 'capacity',
    description: `BSC 容量 C = 1 - H(p) = 1 - H(${flipProb}) = ${capacity.toFixed(6)} 比特/信道使用。当输入分布接近均匀 ${trace[trace.length - 1].q.map(v => v.toFixed(4)).join(', ')}] 时 I 达到最大值。`,
    P, flipProb, iter: trace.length + 1, trace, capacity, q: trace[trace.length - 1].q, r: trace[trace.length - 1].r, I: trace[trace.length - 1].I,
    highlightLine: 2 + trace.length,
  })
  return steps
}
