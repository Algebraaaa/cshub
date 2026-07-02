// 互信息 I(X;Y) = H(X) - H(X|Y) = ΣΣ p(x,y) log(p(x,y)/(p(x)p(y)))
export function mutualInfoSteps({ table } = {}) {
  const P = table || [
    [0.25, 0.0],
    [0.25, 0.5],
  ]
  const m = P.length
  const n = P[0].length
  const px = P.map(row => row.reduce((a, b) => a + b, 0))
  const py = Array.from({ length: n }, (_, j) => P.reduce((s, row) => s + row[j], 0))
  const Hx = -px.reduce((s, p) => s + (p > 1e-12 ? p * Math.log2(p) : 0), 0)
  const Hy = -py.reduce((s, p) => s + (p > 1e-12 ? p * Math.log2(p) : 0), 0)

  const cells = []
  let Ixy = 0
  let Hxy = 0
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const pxy = P[i][j]
      let term = 0
      let hxy = 0
      if (pxy > 1e-12 && px[i] > 1e-12 && py[j] > 1e-12) {
        term = pxy * Math.log2(pxy / (px[i] * py[j]))
        hxy = -pxy * Math.log2(pxy)
      }
      Ixy += term
      Hxy += hxy
      cells.push({ i, j, pxy, px: px[i], py: py[j], term, hxy })
    }
  }
  const HxGy = Hxy - Hy  // H(X|Y) = H(X,Y) - H(Y)
  const HyGx = Hxy - Hx

  const steps = []
  steps.push({
    phase: 'intro',
    description: `互信息衡量两个变量共享的信息量：I(X;Y) = H(X) - H(X|Y) = ΣΣ p(x,y) log(p(x,y)/(p(x)p(y)))。`,
    P, px, py, cells, cellIdx: -1, Ixy, Hx, Hy, Hxy, HxGy, HyGx,
    highlightLine: 1,
  })
  steps.push({
    phase: 'margin',
    description: `边缘分布：p(X)=[${px.map(v => v.toFixed(3)).join(', ')}]，H(X)=${Hx.toFixed(4)}；p(Y)=[${py.map(v => v.toFixed(3)).join(', ')}]，H(Y)=${Hy.toFixed(4)}。`,
    P, px, py, cells, cellIdx: -1, Ixy, Hx, Hy, Hxy, HxGy, HyGx,
    highlightLine: 2,
  })
  for (let k = 0; k < cells.length; k++) {
    const c = cells[k]
    const ratio = c.px > 1e-12 && c.py > 1e-12 ? c.pxy / (c.px * c.py) : 0
    steps.push({
      phase: 'term',
      description: `(X=${c.i + 1},Y=${c.j + 1})：p=(${c.pxy.toFixed(3)}) / (p(x)p(y)=${(c.px * c.py).toFixed(3)}) = ${ratio.toFixed(3)}，项 = ${c.term.toFixed(4)}。`,
      P, px, py, cells, cellIdx: k, Ixy, Hx, Hy, Hxy, HxGy, HyGx,
      highlightLine: 3 + k,
    })
  }
  steps.push({
    phase: 'result',
    description: `I(X;Y) ≈ ${Ixy.toFixed(4)} 比特。验证：H(X)-H(X|Y) = ${Hx.toFixed(4)} - ${HxGy.toFixed(4)} = ${(Hx - HxGy).toFixed(4)}，对称地也等于 H(Y)-H(Y|X)。`,
    P, px, py, cells, cellIdx: cells.length, Ixy, Hx, Hy, Hxy, HxGy, HyGx,
    highlightLine: 3 + cells.length,
  })
  return steps
}
