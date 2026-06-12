// 联合熵 H(X,Y) 与 条件熵 H(Y|X)
// 默认 2×3 联合概率表
export function jointEntropySteps({ table } = {}) {
  // 行 = X 取值，列 = Y 取值
  const P = table || [
    [1 / 8, 1 / 8, 0],
    [1 / 8, 1 / 4, 1 / 8],
  ]
  const m = P.length
  const n = P[0].length
  // 边缘
  const px = P.map(row => row.reduce((a, b) => a + b, 0))
  const py = Array.from({ length: n }, (_, j) => P.reduce((s, row) => s + row[j], 0))
  // 条件 p(y|x) = P[i][j] / px[i]
  // 联合熵 H(X,Y) = -ΣΣ P[i][j] log P[i][j]
  // 条件熵 H(Y|X) = Σ px[i] H(Y|X=i) = -ΣΣ P[i][j] log(P[i][j]/px[i])
  let Hxy = 0
  let Hygx = 0
  const cells = []
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const pxy = P[i][j]
      let hxyTerm = 0
      let hygxTerm = 0
      if (pxy > 1e-12) {
        hxyTerm = -pxy * Math.log2(pxy)
        const pyGx = pxy / px[i]
        if (pyGx > 1e-12) hygxTerm = -pxy * Math.log2(pyGx)
      }
      Hxy += hxyTerm
      Hygx += hygxTerm
      cells.push({ i, j, pxy, hxyTerm, hygxTerm })
    }
  }
  const Hx = -px.reduce((s, p) => s + (p > 1e-12 ? p * Math.log2(p) : 0), 0)
  const Hy = -py.reduce((s, p) => s + (p > 1e-12 ? p * Math.log2(p) : 0), 0)

  const steps = []
  steps.push({
    phase: 'table',
    description: '给出联合概率分布 P(X,Y)，X 有 ' + m + ' 个取值，Y 有 ' + n + ' 个取值。',
    P, px, py, cells, cellIdx: -1, Hxy, Hygx, Hx, Hy,
    highlightLine: 1,
  })
  steps.push({
    phase: 'margin',
    description: `计算边缘分布：p(X) = [${px.map(v => v.toFixed(3)).join(', ')}]，p(Y) = [${py.map(v => v.toFixed(3)).join(', ')}]。H(X)=${Hx.toFixed(3)}, H(Y)=${Hy.toFixed(3)}。`,
    P, px, py, cells, cellIdx: -1, Hxy, Hygx, Hx, Hy,
    highlightLine: 2,
  })
  for (let k = 0; k < cells.length; k++) {
    const c = cells[k]
    steps.push({
      phase: 'hxy-term',
      description: `单元格 (X=${c.i + 1}, Y=${c.j + 1})：p=${c.pxy.toFixed(3)}，联合熵项 = -p·log p = ${c.hxyTerm.toFixed(4)}。条件熵项 = -p·log(p/px[${c.i}]) = ${c.hygxTerm.toFixed(4)}。`,
      P, px, py, cells, cellIdx: k, Hxy, Hygx, Hx, Hy,
      highlightLine: 4,
    })
  }
  steps.push({
    phase: 'result',
    description: `最终 H(X,Y) ≈ ${Hxy.toFixed(4)} 比特；H(Y|X) ≈ ${Hygx.toFixed(4)} 比特。验证链法则：H(X) + H(Y|X) = ${(Hx + Hygx).toFixed(4)} ≈ H(X,Y) ✓`,
    P, px, py, cells, cellIdx: cells.length, Hxy, Hygx, Hx, Hy,
    highlightLine: 7,
  })
  return steps
}
