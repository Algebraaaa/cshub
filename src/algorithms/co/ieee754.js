// IEEE 754 single-precision (32-bit) floating point encoding visualizer.
//
// Step shape:
// { value, sign, exponentBits, mantissaBits, biasedExp, unbiasedExp,
//   normalizedSig, special, phase, description }

const EXP_BITS = 8
const MANTISSA_BITS = 23
const BIAS = 127

function toBinary(num, width) {
  let s = num.toString(2)
  while (s.length < width) s = '0' + s
  return s
}

function classifyValue(v) {
  if (Number.isNaN(v)) return 'nan'
  if (v === Infinity) return '+inf'
  if (v === -Infinity) return '-inf'
  if (v === 0) return 'zero'
  return null
}

export function ieee754({ value = 13.625 } = {}) {
  const steps = []
  const special = classifyValue(value)

  function push(extra) {
    steps.push({
      value, special,
      sign: 0,
      exponentBits: '00000000',
      mantissaBits: '0'.repeat(MANTISSA_BITS),
      biasedExp: 0,
      unbiasedExp: 0,
      normalizedSig: '',
      ...extra,
    })
  }

  push({ phase: 'init', description: `输入十进制数：${value}`, })

  if (special === 'zero') {
    push({ phase: 'special',
      description: '⚠️ 特殊值：零（+0 / −0）。符号位 = 0/1，阶码全 0，尾数全 0',
    })
    return steps
  }
  if (special === '+inf' || special === '-inf') {
    push({ phase: 'special',
      sign: special === '-inf' ? 1 : 0,
      exponentBits: '1'.repeat(EXP_BITS),
      mantissaBits: '0'.repeat(MANTISSA_BITS),
      biasedExp: 255,
      description: `⚠️ 特殊值：${special === '-inf' ? '−' : '+'}∞。阶码全 1，尾数全 0`,
    })
    return steps
  }
  if (special === 'nan') {
    push({ phase: 'special',
      exponentBits: '1'.repeat(EXP_BITS),
      mantissaBits: '1' + '0'.repeat(MANTISSA_BITS - 1),
      biasedExp: 255,
      description: `⚠️ 特殊值：NaN（Not a Number）。阶码全 1，尾数非 0`,
    })
    return steps
  }

  // Step 1: sign
  const sign = value < 0 ? 1 : 0
  const absVal = Math.abs(value)
  push({ phase: 'sign', sign,
    description: `① 提取符号位：${value < 0 ? '负数' : '非负数'} → s = ${sign}`,
  })

  // Step 2: convert to binary (integer part + fractional part)
  const intPart = Math.floor(absVal)
  let fracPart = absVal - intPart
  const intBinary = intPart.toString(2)
  let fracBinary = ''
  let tempFrac = fracPart
  for (let i = 0; i < 32 && tempFrac !== 0; i++) {
    tempFrac *= 2
    if (tempFrac >= 1) {
      fracBinary += '1'
      tempFrac -= 1
    } else {
      fracBinary += '0'
    }
  }
  const fullBinary = `${intBinary}.${fracBinary || '0'}`
  push({ phase: 'binary', sign,
    binaryRep: fullBinary,
    description: `② 转二进制：|${absVal}| = ${fullBinary}₂`,
  })

  // Step 3: normalize to 1.xxx × 2^E
  const firstOnePos = fullBinary.indexOf('1')
  const cleanedBin = fullBinary.replace('.', '')
  let exponent
  let mantissaStr
  if (intPart > 0) {
    // First 1 is in integer part. shift right by (intBinary.length - 1)
    exponent = intBinary.length - 1
    mantissaStr = cleanedBin.slice(firstOnePos + 1)
  } else {
    // intPart is 0, first 1 is in fractional part
    const fracFirstOne = fracBinary.indexOf('1')
    exponent = -(fracFirstOne + 1)
    mantissaStr = fracBinary.slice(fracFirstOne + 1)
  }
  push({ phase: 'normalize', sign,
    normalizedSig: `1.${mantissaStr.slice(0, 24) || '0'} × 2^${exponent}`,
    unbiasedExp: exponent,
    description: `③ 规格化：1.${mantissaStr.slice(0, 8)}${mantissaStr.length > 8 ? '…' : ''} × 2^${exponent}（保留前导隐含位"1"）`,
  })

  // Step 4: bias
  const biasedExp = exponent + BIAS
  const expBits = toBinary(biasedExp, EXP_BITS)
  push({ phase: 'bias', sign,
    biasedExp,
    unbiasedExp: exponent,
    exponentBits: expBits,
    normalizedSig: `1.${mantissaStr.slice(0, 24)}`,
    description: `④ 阶码加偏移：E = ${exponent} + ${BIAS} = ${biasedExp}（二进制 ${expBits}）`,
  })

  // Step 5: truncate/round mantissa to 23 bits
  const mantissa23 = (mantissaStr + '0'.repeat(MANTISSA_BITS)).slice(0, MANTISSA_BITS)
  push({ phase: 'mantissa', sign,
    biasedExp,
    unbiasedExp: exponent,
    exponentBits: expBits,
    mantissaBits: mantissa23,
    normalizedSig: `1.${mantissaStr.slice(0, 24)}`,
    description: `⑤ 截取尾数前 ${MANTISSA_BITS} 位（去掉隐含的"1."）：${mantissa23.slice(0, 12)}${mantissa23.length > 12 ? '…' : ''}`,
  })

  // Final: assemble
  push({ phase: 'final', sign,
    biasedExp,
    unbiasedExp: exponent,
    exponentBits: expBits,
    mantissaBits: mantissa23,
    normalizedSig: `1.${mantissaStr.slice(0, 24)}`,
    description: `🎉 IEEE 754 单精度（32 位）编码完成：1 + 8 + 23 = 32 bits`,
  })

  return steps
}
