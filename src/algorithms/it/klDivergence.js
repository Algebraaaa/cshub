// KL 散度 D(P||Q) = Σ P(x) log(P(x)/Q(x))
// 交叉熵 H(P,Q) = -Σ P(x) log Q(x) = H(P) + D(P||Q)
export function klDivergenceSteps({ P, Q } = {}) {
  const p = P || [0.4, 0.35, 0.15, 0.1]
  const q = Q || [0.25, 0.25, 0.25, 0.25]
  const n = p.length
  const Hp = -p.reduce((s, v) => s + (v > 1e-12 ? v * Math.log2(v) : 0), 0)
  let ce = 0
  let kl = 0
  const cells = []
  for (let i = 0; i < n; i++) {
    const piterm = p[i] > 1e-12 && q[i] > 1e-12 ? p[i] * Math.log2(p[i] / q[i]) : (p[i] > 1e-12 ? Infinity : 0)
    const ceTerm = p[i] > 1e-12 && q[i] > 1e-12 ? -p[i] * Math.log2(q[i]) : 0
    kl += piterm
    ce += ceTerm
    cells.push({ i, p: p[i], q: q[i], kl: piterm, ce: ceTerm })
  }

  const steps = []
  steps.push({
    phase: 'intro',
    description: `计算 KL 散度 D(P||Q) = Σ P log(P/Q) 与交叉熵 H(P,Q) = -Σ P log Q。P 是真实分布，Q 是模型分布。`,
    P: p, Q: q, cells, cellIdx: -1, kl, ce, Hp,
    highlightLine: 1,
  })
  for (let i = 0; i < n; i++) {
    const c = cells[i]
    steps.push({
      phase: 'term',
      description: `第 ${i + 1} 项：P=${c.p.toFixed(3)}, Q=${c.q.toFixed(3)}。KL 项 = ${c.kl.toFixed(4)}。CE 项 = ${c.ce.toFixed(4)}。`,
      P: p, Q: q, cells, cellIdx: i, kl, ce, Hp,
      highlightLine: 2 + i,
    })
  }
  steps.push({
    phase: 'sum',
    description: `求和：H(P) = ${Hp.toFixed(4)}，D(P||Q) ≈ ${kl.toFixed(4)}，H(P,Q) ≈ ${ce.toFixed(4)}。验证：H(P) + D(P||Q) = ${(Hp + kl).toFixed(4)} ≈ H(P,Q) ✓。在分类问题中，优化交叉熵损失等价于最小化 KL 散度。`,
    P: p, Q: q, cells, cellIdx: n, kl, ce, Hp,
    highlightLine: 2 + n,
  })
  return steps
}
