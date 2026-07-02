// 马尔可夫信道：信道状态随时间变化
// 好状态(G): 低错误率, 坏状态(B): 高错误率
export function markovChannelSteps() {
  const states = ['G(好)', 'B(坏)']
  const S = [
    [0.9, 0.1],
    [0.2, 0.8],
  ]
  // 每个信道状态下的转移概率（二元输入 → 二元输出）
  // 好状态下 p=0.05, 坏状态下 p=0.5
  const P_given_S = [
    // 状态 G
    [[0.95, 0.05], [0.05, 0.95]],
    // 状态 B
    [[0.5, 0.5], [0.5, 0.5]],
  ]
  // 演示一次传输过程
  const inputs = [0, 1, 0, 0, 1, 1, 0]
  let curS = 0
  const stateSeq = [curS]
  const outputs = []
  const errors = []
  const transitions = []
  for (let t = 0; t < inputs.length; t++) {
    const Pchan = P_given_S[curS]
    const r = Math.random()
    const row = Pchan[inputs[t]]
    let y = inputs[t]
    let acc = 0
    for (let j = 0; j < 2; j++) {
      acc += row[j]
      if (r <= acc) { y = j; break }
    }
    outputs.push(y)
    errors.push(y !== inputs[t])
    // 信道状态转移
    const r2 = Math.random()
    let nextS = curS
    acc = 0
    for (let j = 0; j < 2; j++) {
      acc += S[curS][j]
      if (r2 <= acc) { nextS = j; break }
    }
    transitions.push({ from: curS, to: nextS })
    curS = nextS
    stateSeq.push(curS)
  }
  const steps = []
  steps.push({
    phase: 'intro',
    description: `马尔可夫信道：信道状态 {${states.join(', ')}} 随时间按马尔可夫链演化，输入输出条件概率取决于当前信道状态。`,
    S, states, P_given_S, inputs, outputs, errors, stateSeq, transitions,
    t: -1,
    highlightLine: 1,
  })
  steps.push({
    phase: 'state_matrix',
    description: `信道状态转移矩阵 S = [[${S[0].join(', ')}], [${S[1].join(', ')}]]。好状态错误率 5%，坏状态错误率 50%。`,
    S, states, P_given_S, inputs, outputs, errors, stateSeq, transitions,
    t: -1,
    highlightLine: 2,
  })
  for (let t = 0; t < inputs.length; t++) {
    const st = stateSeq[t]
    steps.push({
      phase: 'transmit',
      description: `第 ${t + 1} 步：信道状态=${states[st]}，输入 X=${inputs[t]}，输出 Y=${outputs[t]}（${errors[t] ? '错误' : '正确'}）。下一信道状态：${states[stateSeq[t + 1]]}。`,
      S, states, P_given_S, inputs, outputs, errors, stateSeq, transitions,
      t,
      highlightLine: 6,
    })
  }
  const err = errors.filter(Boolean).length
  steps.push({
    phase: 'summary',
    description: `共 ${inputs.length} 次传输，错误 ${err} 次（错误率 ${(err / inputs.length).toFixed(2)}）。马尔可夫信道比无记忆 BSC 更容易出现突发错误，编码需考虑 interleaving。`,
    S, states, P_given_S, inputs, outputs, errors, stateSeq, transitions,
    t: inputs.length,
    highlightLine: 8,
  })
  return steps
}
