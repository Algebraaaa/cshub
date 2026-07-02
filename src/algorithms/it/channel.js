// 信道模型：BSC (Binary Symmetric Channel) 与 BEC (Binary Erasure Channel)
export function channelSteps({ type = 'bsc', p = 0.1 } = {}) {
  const isBSC = type !== 'bec'
  const flipProb = p
  const erasureProb = p
  const steps = []
  let P
  if (isBSC) {
    P = [
      [1 - flipProb, flipProb],
      [flipProb, 1 - flipProb],
    ]
  } else {
    // BEC: 输出 {0, e, 1}
    P = [
      [1 - erasureProb, erasureProb, 0],
      [0, erasureProb, 1 - erasureProb],
    ]
  }
  const demoSeq = [0, 1, 0, 0, 1]
  const outputs = []
  const noises = []
  for (let t = 0; t < demoSeq.length; t++) {
    const x = demoSeq[t]
    const r = Math.random()
    let y
    let flipped = false
    if (isBSC) {
      if (r < flipProb) { y = 1 - x; flipped = true } else y = x
    } else {
      if (r < erasureProb) { y = 'e'; flipped = true } else { y = x }
    }
    outputs.push(y)
    noises.push(flipped)
  }
  const bscCap = (flipProb > 0 && flipProb < 1) ? (1 + flipProb * Math.log2(flipProb) + (1 - flipProb) * Math.log2(1 - flipProb)) : (flipProb === 0 ? 1 : 0)
  steps.push({
    phase: 'intro',
    description: isBSC
      ? `二元对称信道 BSC(p=${flipProb})：输入比特以概率 1-p 原样输出，以概率 p 翻转。`
      : `二元擦除信道 BEC(p=${erasureProb})：输入比特以概率 1-p 原样输出，以概率 p 被擦除为 e。`,
    type: isBSC ? 'bsc' : 'bec', P, flipProb, erasureProb, t: -1, demoSeq, outputs, noises, capacity: isBSC ? bscCap : (1 - erasureProb),
    highlightLine: 1,
  })
  steps.push({
    phase: 'matrix',
    description: `转移矩阵 P(Y|X)（行=输入 X∈{0,1}，列=输出 Y）。每一行之和为 1。`,
    type: isBSC ? 'bsc' : 'bec', P, flipProb, erasureProb, t: -1, demoSeq, outputs, noises, capacity: isBSC ? bscCap : (1 - erasureProb),
    highlightLine: 2,
  })
  for (let t = 0; t < demoSeq.length; t++) {
    const noiseText = noises[t] ? (isBSC ? '被噪声翻转' : '被擦除') : '正确接收'
    steps.push({
      phase: 'transmit',
      description: `第 ${t + 1} 比特：输入 X=${demoSeq[t]} ${noiseText}，输出 Y=${outputs[t]}。`,
      type: isBSC ? 'bsc' : 'bec', P, flipProb, erasureProb, t, demoSeq, outputs, noises, capacity: isBSC ? bscCap : (1 - erasureProb),
      highlightLine: 5,
    })
  }
  const successCount = outputs.filter((_, i) => !noises[i]).length
  steps.push({
    phase: 'summary',
    description: `共传输 ${demoSeq.length} 比特，正确接收 ${successCount} 个。${isBSC ? `BSC 容量 C = 1 - H(p) = ${bscCap.toFixed(4)} 比特/信道使用。` : `BEC 容量 C = 1 - p = ${1 - erasureProb} 比特/信道使用。`}`,
    type: isBSC ? 'bsc' : 'bec', P, flipProb, erasureProb, t: demoSeq.length, demoSeq, outputs, noises, capacity: isBSC ? bscCap : (1 - erasureProb),
    highlightLine: 6,
  })
  return steps
}
