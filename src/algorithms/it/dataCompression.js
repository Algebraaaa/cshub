// 数据压缩与冗余度
export function dataCompressionSteps() {
  const syms = [
    { s: 'A', f: 0.4 },
    { s: 'B', f: 0.3 },
    { s: 'C', f: 0.2 },
    { s: 'D', f: 0.1 },
  ]
  const n = syms.length
  // 定长编码
  const fixedLen = Math.ceil(Math.log2(n))
  const fixedCodes = {}
  syms.forEach((s, i) => { fixedCodes[s.s] = i.toString(2).padStart(fixedLen, '0') })
  let fixedAvg = fixedLen
  // 霍夫曼编码（简易：按频率给码字长度）
  // 直接用手工最优长度对应符号频率
  // A(0.4)→1bit, B(0.3)→2bits, C(0.2)→2bits, D(0.1)→3bits
  const huffCodes = { A: '0', B: '10', C: '110', D: '111' }
  let huffAvg = 0
  for (const s of syms) huffAvg += s.f * huffCodes[s.s].length
  const H = -syms.reduce((a, s) => a + s.f * Math.log2(s.f), 0)
  const fixedEff = H / fixedAvg
  const huffEff = H / huffAvg
  const fixedRed = 1 - fixedEff
  const huffRed = 1 - huffEff

  const steps = []
  steps.push({
    phase: 'intro',
    description: `4 个符号，概率 ${syms.map(s => `${s.s}(${s.f.toFixed(1)})`).join(', ')}。比较定长编码 vs 变长霍夫曼编码的平均码长与冗余度。`,
    syms, fixedCodes, huffCodes, fixedLen, fixedAvg, huffAvg, H, fixedEff, huffEff, fixedRed, huffRed, phaseIdx: 0,
    highlightLine: 1,
  })
  steps.push({
    phase: 'entropy',
    description: `熵 H = -Σ p log p ≈ ${H.toFixed(4)} 比特/符号。这是无损压缩的理论下界（香农第一定理）。`,
    syms, fixedCodes, huffCodes, fixedLen, fixedAvg, huffAvg, H, fixedEff, huffEff, fixedRed, huffRed, phaseIdx: 1,
    highlightLine: 2,
  })
  steps.push({
    phase: 'fixed',
    description: `定长编码：每个符号 ${fixedLen} 比特（A→00, B→01, C→10, D→11），平均码长 L_fixed = ${fixedAvg}。`,
    syms, fixedCodes, huffCodes, fixedLen, fixedAvg, huffAvg, H, fixedEff, huffEff, fixedRed, huffRed, phaseIdx: 2,
    highlightLine: 3,
  })
  steps.push({
    phase: 'huffman',
    description: `霍夫曼编码：A→"0"(1b), B→"10"(2b), C→"110"(3b), D→"111"(3b)。平均码长 L_huff = Σ p_i l_i = ${huffAvg.toFixed(4)}。`,
    syms, fixedCodes, huffCodes, fixedLen, fixedAvg, huffAvg, H, fixedEff, huffEff, fixedRed, huffRed, phaseIdx: 3,
    highlightLine: 4,
  })
  steps.push({
    phase: 'eff',
    description: `编码效率：η_fixed = H/L = ${(fixedEff * 100).toFixed(2)}%，η_huff = ${(huffEff * 100).toFixed(2)}%。冗余度：定长编码冗余 = ${(fixedRed * 100).toFixed(2)}%，霍夫曼冗余 = ${(huffRed * 100).toFixed(2)}%。`,
    syms, fixedCodes, huffCodes, fixedLen, fixedAvg, huffAvg, H, fixedEff, huffEff, fixedRed, huffRed, phaseIdx: 4,
    highlightLine: 5,
  })
  steps.push({
    phase: 'shannon1',
    description: `香农第一定理：任意唯一可译码满足 L ≥ H；存在编码使 L < H + 1。霍夫曼编码达到最优前缀码的最短平均码长。`,
    syms, fixedCodes, huffCodes, fixedLen, fixedAvg, huffAvg, H, fixedEff, huffEff, fixedRed, huffRed, phaseIdx: 5,
    highlightLine: 6,
  })
  return steps
}
