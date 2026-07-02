// 纠错编码：汉明码 (7,4)
export function errorCorrectSteps({ data } = {}) {
  // 4-bit 数据
  const d = data || [1, 0, 1, 1] // d1 d2 d3 d4
  // 校验位：r1 r2 r4（位置 1,2,4 是校验位，位置 3,5,6,7 是数据位）
  // 经典 (7,4) 编码：
  // 位置: 1(r1) 2(r2) 3(d1) 4(r4) 5(d2) 6(d3) 7(d4)
  // r1 = d1 ^ d2 ^ d4
  // r2 = d1 ^ d3 ^ d4
  // r4 = d2 ^ d3 ^ d4
  const [d1, d2, d3, d4] = d
  const r1 = d1 ^ d2 ^ d4
  const r2 = d1 ^ d3 ^ d4
  const r4 = d2 ^ d3 ^ d4
  const encoded = [r1, r2, d1, r4, d2, d3, d4]
  // 模拟一位错误
  const errorPos = 6  // 0-indexed, 位置 6 即 d3
  const received = encoded.slice()
  received[errorPos] ^= 1
  // 计算 syndrome：s1 s2 s3
  const s1 = received[0] ^ received[2] ^ received[4] ^ received[6]  // 奇位
  const s2 = received[1] ^ received[2] ^ received[5] ^ received[6]  // 2-3,6-7
  const s3 = received[3] ^ received[4] ^ received[5] ^ received[6]  // 4-7 上半
  const syndrome = s3 * 4 + s2 * 2 + s1

  const steps = []
  steps.push({
    phase: 'data',
    description: `输入 4 位数据 d1 d2 d3 d4 = [${d.join(', ')}]`,
    d, encoded, received, errorPos: -1, s1, s2, s3, syndrome, corrected: null,
    highlightLine: 1,
  })
  steps.push({
    phase: 'r1',
    description: `计算 r1 = d1 ⊕ d2 ⊕ d4 = ${d1} ⊕ ${d2} ⊕ ${d4} = ${r1}`,
    d, encoded, received, errorPos: -1, s1, s2, s3, syndrome, corrected: null,
    highlightLine: 3,
  })
  steps.push({
    phase: 'r2',
    description: `计算 r2 = d1 ⊕ d3 ⊕ d4 = ${d1} ⊕ ${d3} ⊕ ${d4} = ${r2}`,
    d, encoded, received, errorPos: -1, s1, s2, s3, syndrome, corrected: null,
    highlightLine: 4,
  })
  steps.push({
    phase: 'r4',
    description: `计算 r4 = d2 ⊕ d3 ⊕ d4 = ${d2} ⊕ ${d3} ⊕ ${d4} = ${r4}`,
    d, encoded, received, errorPos: -1, s1, s2, s3, syndrome, corrected: null,
    highlightLine: 5,
  })
  steps.push({
    phase: 'encode',
    description: `编码完成 7 位码字：位置 [1(r1), 2(r2), 3(d1), 4(r4), 5(d2), 6(d3), 7(d4)] = [${encoded.join(', ')}]`,
    d, encoded, received, errorPos: -1, s1, s2, s3, syndrome, corrected: null,
    highlightLine: 6,
  })
  steps.push({
    phase: 'error',
    description: `经信道传输，第 ${errorPos + 1} 位（d3）发生翻转：收到 = [${received.join(', ')}]。`,
    d, encoded, received, errorPos, s1, s2, s3, syndrome, corrected: null,
    highlightLine: 7,
  })
  steps.push({
    phase: 's1',
    description: `计算校验子 s1 = r1 ⊕ d1 ⊕ d2 ⊕ d4 = ${received[0]} ⊕ ${received[2]} ⊕ ${received[4]} ⊕ ${received[6]} = ${s1}`,
    d, encoded, received, errorPos, s1, s2, s3, syndrome, corrected: null,
    highlightLine: 8,
  })
  steps.push({
    phase: 's2',
    description: `计算校验子 s2 = r2 ⊕ d1 ⊕ d3 ⊕ d4 = ${received[1]} ⊕ ${received[2]} ⊕ ${received[5]} ⊕ ${received[6]} = ${s2}`,
    d, encoded, received, errorPos, s1, s2, s3, syndrome, corrected: null,
    highlightLine: 8,
  })
  steps.push({
    phase: 's3',
    description: `计算校验子 s3 = r4 ⊕ d2 ⊕ d3 ⊕ d4 = ${received[3]} ⊕ ${received[4]} ⊕ ${received[5]} ⊕ ${received[6]} = ${s3}`,
    d, encoded, received, errorPos, s1, s2, s3, syndrome, corrected: null,
    highlightLine: 8,
  })
  const corrected = received.slice()
  if (syndrome > 0) corrected[syndrome - 1] ^= 1
  steps.push({
    phase: 'syndrome',
    description: `校验子 S = s3 s2 s1 = ${s3}${s2}${s1} = ${syndrome}（十进制），指向第 ${syndrome} 位出错。翻转该位纠正：纠正后 = [${corrected.join(', ')}]。`,
    d, encoded, received, errorPos, s1, s2, s3, syndrome, corrected,
    highlightLine: 9,
  })
  steps.push({
    phase: 'done',
    description: `恢复 4 位数据：d1 d2 d3 d4 = [${corrected[2]}, ${corrected[4]}, ${corrected[5]}, ${corrected[6]}]。汉明 (7,4) 码可纠正 1 位错、检测 2 位错，码率 4/7 ≈ 0.57。`,
    d, encoded, received, errorPos, s1, s2, s3, syndrome, corrected,
    highlightLine: 10,
  })
  return steps
}
