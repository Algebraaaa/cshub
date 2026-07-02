// 自信息 / 信息量
// I(x) = -log2 p(x)
export function selfInfoSteps({ prob = 0.25 } = {}) {
  const p = Math.max(1e-6, Math.min(1 - 1e-6, prob))
  const info = -Math.log2(p)
  const steps = []
  steps.push({
    phase: 'define',
    description: '自信息定义：事件 x 发生的概率越小，它携带的信息量越大。',
    p, info,
    highlightLine: 1,
  })
  steps.push({
    phase: 'formula',
    description: `代入概率 p(x) = ${p.toFixed(4)} 到公式 I(x) = -log₂ p(x)`,
    p, info,
    highlightLine: 2,
  })
  steps.push({
    phase: 'compute',
    description: `计算：log₂(${p.toFixed(4)}) ≈ ${Math.log2(p).toFixed(4)}，取负得 I(x) ≈ ${info.toFixed(4)} 比特`,
    p, info,
    highlightLine: 3,
  })
  steps.push({
    phase: 'intuition',
    description: `直观理解：p=${p.toFixed(2)} 对应"需要抛出 ${info.toFixed(2)} 次公平硬币"才能确定该事件。概率越小，信息越多。`,
    p, info,
    highlightLine: 4,
  })
  return steps
}
