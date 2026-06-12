// 矩阵快速幂（Matrix Binary Exponentiation）
// 用快速幂思想计算矩阵的 n 次方
// 典型应用：O(log n) 计算 Fibonacci 数列

function matMul(A, B, mod, size) {
  const C = Array.from({ length: size }, () => new Array(size).fill(0))
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      let sum = 0n
      for (let k = 0; k < size; k++) {
        sum = (sum + BigInt(A[i][k]) * BigInt(B[k][j])) % BigInt(mod)
      }
      C[i][j] = Number(sum)
    }
  }
  return C
}

function matCopy(M) {
  return M.map(row => [...row])
}

function identityMatrix(size) {
  const I = Array.from({ length: size }, () => new Array(size).fill(0))
  for (let i = 0; i < size; i++) I[i][i] = 1
  return I
}

function snap(matrix, exp, mod, result, currentBase, phase, binaryBits, highlightBit, stepDesc, cppLine, pythonLine, description) {
  return {
    matrix: matCopy(matrix), exp, mod,
    result: matCopy(result), currentBase: matCopy(currentBase),
    phase, binaryBits, highlightBit, stepDesc,
    cppLine, pythonLine, description,
  }
}

export function matrixPow({ matrix, exp = 10, mod = 1000000007 } = {}) {
  const steps = []
  const size = matrix ? matrix.length : 2
  if (!matrix) matrix = [[1, 1], [1, 0]]

  const binaryBits = exp.toString(2).split('').map(Number)
  let result = identityMatrix(size)
  let base = matCopy(matrix)

  // Init steps
  steps.push(snap(matrix, exp, mod, result, base, 'init', binaryBits, -1, 'init', 4, 3,
    `矩阵快速幂：计算 [[1,1],[1,0]]^${exp} mod ${mod}`))

  steps.push(snap(matrix, exp, mod, result, base, 'init', binaryBits, -1, 'init', 5, 4,
    `指数 ${exp} 的二进制为 ${binaryBits.join('')}（共 ${binaryBits.length} 位）`))

  steps.push(snap(matrix, exp, mod, result, base, 'init', binaryBits, -1, 'init', 6, 5,
    `初始化：result = 单位矩阵 I，base = 原始矩阵`))

  let e = exp
  let bitIdx = binaryBits.length - 1
  let iter = 0

  while (e > 0) {
    iter++
    const bit = e & 1

    steps.push(snap(matrix, exp, mod, result, base, 'multiply', binaryBits, bitIdx, 'check', 10, 8,
      `第 ${iter} 轮：exp=${e}，检查最低位 bit=${bit}`))

    if (bit === 1) {
      // Show intermediate: about to multiply
      steps.push(snap(matrix, exp, mod, result, base, 'multiply', binaryBits, bitIdx, 'multiply', 11, 9,
        `bit=1：执行 result = result × base mod ${mod}`))

      result = matMul(result, base, mod, size)

      steps.push(snap(matrix, exp, mod, result, base, 'multiply', binaryBits, bitIdx, 'multiply_done', 11, 9,
        `矩阵乘法完成：result 已更新`))
    } else {
      steps.push(snap(matrix, exp, mod, result, base, 'multiply', binaryBits, bitIdx, 'skip', 11, 9,
        `bit=0：result 保持不变`))
    }

    if (e > 1) {
      steps.push(snap(matrix, exp, mod, result, base, 'square', binaryBits, bitIdx, 'square', 12, 10,
        `底数矩阵平方：base = base × base mod ${mod}`))

      base = matMul(base, base, mod, size)

      steps.push(snap(matrix, exp, mod, result, base, 'square', binaryBits, bitIdx, 'square_done', 12, 10,
        `矩阵平方完成：base 已更新`))
    }

    e >>= 1
    bitIdx--

    if (e > 0) {
      steps.push(snap(matrix, exp, mod, result, base, 'multiply', binaryBits, bitIdx, 'shift', 13, 11,
        `指数右移一位：exp = ${e}，继续下一轮`))
    }
  }

  steps.push(snap(matrix, exp, mod, result, base, 'done', binaryBits, -1, 'done', 15, 13,
    `矩阵快速幂完成，共 ${iter} 轮循环`))

  const fibN = result[0][0]
  const fibNm1 = result[0][1]

  steps.push(snap(matrix, exp, mod, result, base, 'done', binaryBits, -1, 'done', 16, 14,
    `Fibonacci 应用：[[1,1],[1,0]]^${exp} → F(${exp + 1})=${fibN}, F(${exp})=${fibNm1}`))

  return steps
}
