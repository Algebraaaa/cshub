// 字符串哈希（Polynomial Rolling Hash）
// BASE=131, MOD=2^64（unsigned long long 自然溢出）
// H[i] = H[i-1]*BASE + text[i-1]
// hash(l,r) = H[r+1] - H[l]*P[r-l+1]

const BASE = 131n
const MOD = 1n << 64n // 2^64

function mod(v) {
  return ((v % MOD) + MOD) % MOD
}

function snap(text, H, P, query, phase, highlightIdx, hashValues, cppLine, pythonLine, description) {
  return {
    text,
    hashArr: H.map(v => Number(v % 10000000000n)),
    powArr: P.map(v => Number(v % 1000000007n)),
    base: Number(BASE), mod: '2^64',
    query, phase, highlightIdx, hashValues,
    cppLine, pythonLine, description,
  }
}

export function stringHash({ text = 'abcdef', queries } = {}) {
  const steps = []
  const n = text.length

  if (!queries) {
    queries = [
      { type: 'compare', l1: 0, r1: 2, l2: 3, r2: 5 },
      { type: 'compare', l1: 1, r1: 3, l2: 2, r2: 4 },
      { type: 'compare', l1: 0, r1: 1, l2: 4, r2: 5 },
    ]
  }

  const H = new Array(n + 1).fill(0n)
  const P = new Array(n + 1).fill(0n)
  P[0] = 1n

  // ── init ──
  steps.push(snap(text, H, P, null, 'init', -1, {}, 3, 3,
    '初始化：创建长度为 ' + n + ' 的文本 "' + text + '"，选择 BASE=131, MOD=2^64'))

  steps.push(snap(text, H, P, null, 'init', -1, {}, 4, 4,
    '初始化哈希数组 H[0..n] 和幂次数组 P[0..n]，H[0]=0, P[0]=1'))

  // ── build step by step ──
  for (let i = 1; i <= n; i++) {
    const ch = text.charCodeAt(i - 1)

    steps.push(snap(text, H, P, null, 'build', i, {}, 7, 6,
      `准备计算 H[${i}]：读取字符 text[${i - 1}]='${text[i - 1]}'，ASCII=${ch}`))

    H[i] = mod(H[i - 1] * BASE + BigInt(ch))
    P[i] = mod(P[i - 1] * BASE)

    steps.push(snap(text, H, P, null, 'build', i, {}, 8, 7,
      `计算得到 H[${i}] = H[${i - 1}]×131 + ${ch}，P[${i}] = P[${i - 1}]×131`))

    steps.push(snap(text, H, P, null, 'build', i, {}, 9, 8,
      `H[${i}] 和 P[${i}] 计算完毕，继续下一个字符`))
  }

  steps.push(snap(text, H, P, null, 'build', -1, {}, 10, 9,
    `前缀哈希数组构建完成，共 ${n + 1} 项。现在可以 O(1) 查询任意子串哈希`))

  // ── process queries ──
  let qIdx = 0
  for (const q of queries) {
    if (q.type === 'compare') {
      qIdx++
      const { l1, r1, l2, r2 } = q
      const len1 = r1 - l1 + 1
      const len2 = r2 - l2 + 1

      steps.push(snap(text, H, P, q, 'query', -1, {}, 13, 12,
        `查询 #${qIdx}：比较子串 [${l1}..${r1}]="${text.slice(l1, r1 + 1)}" 与 [${l2}..${r2}]="${text.slice(l2, r2 + 1)}"`))

      const h1 = mod(H[r1 + 1] - H[l1] * P[len1])

      steps.push(snap(text, H, P, q, 'query', r1 + 1, { h1: Number(h1 % 1000000007n) }, 14, 13,
        `计算 hash("${text.slice(l1, r1 + 1)}")：H[${r1 + 1}] - H[${l1}]×P[${len1}]`))

      const h2 = mod(H[r2 + 1] - H[l2] * P[len2])

      steps.push(snap(text, H, P, q, 'query', r2 + 1,
        { h1: Number(h1 % 1000000007n), h2: Number(h2 % 1000000007n) }, 15, 14,
        `计算 hash("${text.slice(l2, r2 + 1)}")：H[${r2 + 1}] - H[${l2}]×P[${len2}]`))

      const equal = h1 === h2 && len1 === len2
      steps.push(snap(text, H, P, q, 'query', -1,
        { h1: Number(h1 % 1000000007n), h2: Number(h2 % 1000000007n), equal }, 17, 16,
        equal
          ? `哈希相等 → "${text.slice(l1, r1 + 1)}" == "${text.slice(l2, r2 + 1)}"（大概率相同）`
          : `哈希不等 → "${text.slice(l1, r1 + 1)}" != "${text.slice(l2, r2 + 1)}"`))
    }
  }

  steps.push(snap(text, H, P, null, 'done', -1, {}, 19, 18,
    `所有 ${qIdx} 个查询处理完毕`))

  return steps
}
