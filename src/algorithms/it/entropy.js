// 信息熵 H(X) = -Σ p(x) log₂ p(x)
export function entropySteps({ probs } = {}) {
  const p = probs || [0.5, 0.25, 0.125, 0.125]
  const n = p.length
  const terms = p.map(pi => -pi * Math.log2(pi || 1e-12))
  const prefix = []
  let acc = 0
  for (let i = 0; i < n; i++) {
    acc += terms[i]
    prefix.push(acc)
  }
  const H = acc
  const steps = []
  steps.push({
    phase: 'intro',
    description: `计算分布 X = [${p.map(v => v.toFixed(3)).join(', ')}] 的信息熵 H(X) = -Σ p(x) log₂ p(x)。`,
    p, terms, prefix, H, n, activeIdx: -1,
    highlightLine: 1,
  })
  for (let i = 0; i < n; i++) {
    steps.push({
      phase: 'term',
      description: `第 ${i + 1} 项：-p(x_${i + 1})·log₂ p(x_${i + 1}) = -${p[i].toFixed(3)} × log₂(${p[i].toFixed(3)}) ≈ ${terms[i].toFixed(4)}。累计和 S = ${prefix[i].toFixed(4)}`,
      p, terms, prefix, H, n, activeIdx: i,
      highlightLine: 2 + i,
    })
  }
  steps.push({
    phase: 'sum',
    description: `所有项求和得到 H(X) ≈ ${H.toFixed(4)} 比特。均匀分布时熵最大 = ${Math.log2(n).toFixed(4)} 比特。`,
    p, terms, prefix, H, n, activeIdx: n,
    highlightLine: 2 + n,
  })
  return steps
}
