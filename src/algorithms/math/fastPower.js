// 快速幂（Binary Exponentiation）
// result = base^exp mod mod
// 将指数转为二进制，逐位处理

export function fastPower({ base = 3, exp = 37, mod = 1000000007 } = {}) {
  const steps = []

  const binaryBits = exp.toString(2).split('').map(Number)

  // Init steps
  steps.push({
    base, exp, mod, result: 1, currentBase: base % mod, currentExp: exp,
    binaryBits, phase: 'init', highlightBit: -1,
    cppLine: 3, pythonLine: 2,
    description: `快速幂：计算 ${base}^${exp} mod ${mod}`,
  })

  steps.push({
    base, exp, mod, result: 1, currentBase: base % mod, currentExp: exp,
    binaryBits, phase: 'init', highlightBit: -1,
    cppLine: 3, pythonLine: 2,
    description: `核心思想：将指数展开为二进制，利用 a^(2k) = (a^k)^2 和 a^(2k+1) = a·(a^k)^2，把 O(n) 乘法降为 O(log n)`,
  })

  steps.push({
    base, exp, mod, result: 1, currentBase: base % mod, currentExp: exp,
    binaryBits, phase: 'init', highlightBit: -1,
    cppLine: 4, pythonLine: 3,
    description: `将指数 ${exp} 转为二进制：${binaryBits.join('')}（共 ${binaryBits.length} 位）`,
  })

  steps.push({
    base, exp, mod, result: 1, currentBase: base % mod, currentExp: exp,
    binaryBits, phase: 'init', highlightBit: -1,
    cppLine: 5, pythonLine: 4,
    description: `初始化 result=1，currentBase=${base % mod}，开始从低位逐位处理`,
  })

  let result = 1
  let b = base % mod
  let e = exp
  let bitIdx = binaryBits.length - 1
  let iter = 0

  while (e > 0) {
    iter++
    const bit = e & 1

    // Step: show current iteration state
    steps.push({
      base, exp, mod, result, currentBase: b, currentExp: e,
      binaryBits, phase: 'loop', highlightBit: bitIdx,
      cppLine: 8, pythonLine: 6,
      description: `第 ${iter} 轮循环：exp=${e}，检查最低位 bit=${bit}`,
    })

    if (bit === 1) {
      const oldResult = result
      result = Number((BigInt(result) * BigInt(b)) % BigInt(mod))

      steps.push({
        base, exp, mod, result, currentBase: b, currentExp: e,
        binaryBits, phase: 'loop', highlightBit: bitIdx,
        cppLine: 9, pythonLine: 7,
        description: `当前位为1，累乘：result = ${oldResult} × ${b} mod ${mod} = ${result}`,
      })
    } else {
      steps.push({
        base, exp, mod, result, currentBase: b, currentExp: e,
        binaryBits, phase: 'loop', highlightBit: bitIdx,
        cppLine: 9, pythonLine: 7,
        description: `当前位为0，跳过累乘：result 保持不变，仍为 ${result}`,
      })
    }

    // Step: square base
    const oldBase = b
    b = Number((BigInt(b) * BigInt(b)) % BigInt(mod))

    steps.push({
      base, exp, mod, result, currentBase: b, currentExp: e,
      binaryBits, phase: 'loop', highlightBit: bitIdx,
      cppLine: 10, pythonLine: 8,
      description: `底数平方：currentBase = ${oldBase}² mod ${mod} = ${b}`,
    })

    // Step: right shift
    e >>= 1
    bitIdx--

    if (e > 0) {
      steps.push({
        base, exp, mod, result, currentBase: b, currentExp: e,
        binaryBits, phase: 'loop', highlightBit: bitIdx,
        cppLine: 11, pythonLine: 9,
        description: `指数右移一位：exp = ${e}，继续下一轮循环`,
      })
    } else {
      steps.push({
        base, exp, mod, result, currentBase: b, currentExp: 0,
        binaryBits, phase: 'loop', highlightBit: -1,
        cppLine: 11, pythonLine: 9,
        description: `指数右移后为 0，循环结束`,
      })
    }
  }

  // Verification step
  steps.push({
    base, exp, mod, result, currentBase: b, currentExp: 0,
    binaryBits, phase: 'done', highlightBit: -1,
    cppLine: 13, pythonLine: 11,
    description: `验证：${base}^${exp} = ${result} (mod ${mod})，共 ${iter} 轮循环`,
  })

  steps.push({
    base, exp, mod, result, currentBase: b, currentExp: 0,
    binaryBits, phase: 'done', highlightBit: -1,
    cppLine: 14, pythonLine: 12,
    description: `快速幂完成：${base}^${exp} mod ${mod} = ${result}，时间复杂度 O(log ${exp})`,
  })

  return steps
}
