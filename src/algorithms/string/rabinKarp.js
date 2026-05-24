// Rabin-Karp string matching visualization step generator.
// Step shape (compatible with StringViz):
// { text, pattern, shift, textIdx, patternIdx, status,
//   windowHash, patHash, matches, description, cppLine, pythonLine }

const BASE = 31
const MOD = 1_000_000_007

function code(c) {
  return c.charCodeAt(0)
}

function modPow(b, e, m) {
  let r = 1n
  let base = BigInt(b) % BigInt(m)
  let exp = BigInt(e)
  const mod = BigInt(m)
  while (exp > 0n) {
    if (exp & 1n) r = (r * base) % mod
    base = (base * base) % mod
    exp >>= 1n
  }
  return Number(r)
}

export function rabinKarp({ text = 'ababcababc', pattern = 'ababc' } = {}) {
  const steps = []
  const n = text.length
  const m = pattern.length

  if (m === 0 || m > n) {
    steps.push({
      text, pattern, shift: -1, textIdx: -1, patternIdx: -1,
      status: 'done', windowHash: null, patHash: null, matches: [],
      description: m === 0 ? '模式串为空' : '模式串比文本串长，无法匹配',
    })
    return steps
  }

  // Precompute pattern hash and initial window hash
  let patHash = 0
  let winHash = 0
  let pow = 1
  for (let i = 0; i < m; i++) {
    patHash = (patHash * BASE + code(pattern[i])) % MOD
    winHash = (winHash * BASE + code(text[i])) % MOD
    if (i < m - 1) pow = (pow * BASE) % MOD
  }

  steps.push({
    text, pattern, shift: 0, textIdx: -1, patternIdx: -1,
    status: 'init', windowHash: null, patHash, matches: [],
    description: `预计算：模式串 "${pattern}" 的哈希值 = ${patHash}`,
    cppLine: 4, pythonLine: 4,
  })

  steps.push({
    text, pattern, shift: 0, textIdx: m - 1, patternIdx: m - 1,
    status: 'window_init', windowHash: winHash, patHash, matches: [],
    description: `初始窗口 "${text.slice(0, m)}" 哈希 = ${winHash}`,
    cppLine: 6, pythonLine: 6,
  })

  const matches = []

  for (let i = 0; i <= n - m; i++) {
    if (winHash === patHash) {
      // Hash hit — verify char by char (visualize each comparison)
      let mismatchedAt = -1
      for (let j = 0; j < m; j++) {
        if (text[i + j] !== pattern[j]) { mismatchedAt = j; break }
        steps.push({
          text, pattern, shift: i, textIdx: i + j, patternIdx: j,
          status: 'verifying', windowHash: winHash, patHash, matches: [...matches],
          description: `位置 ${i}：哈希相等，逐字符验证 text[${i + j}]='${text[i + j]}' = pattern[${j}]='${pattern[j]}'`,
          cppLine: 11, pythonLine: 10,
        })
      }
      if (mismatchedAt === -1) {
        matches.push(i)
        steps.push({
          text, pattern, shift: i, textIdx: -1, patternIdx: -1,
          status: 'match', windowHash: winHash, patHash, matches: [...matches],
          description: `✅ 位置 ${i} 完整匹配："${text.slice(i, i + m)}"`,
          cppLine: 11, pythonLine: 10,
        })
      } else {
        steps.push({
          text, pattern, shift: i, textIdx: i + mismatchedAt, patternIdx: mismatchedAt,
          status: 'hash_collision', windowHash: winHash, patHash, matches: [...matches],
          description: `⚠️ 哈希碰撞！位置 ${i} 哈希相等但 text[${i + mismatchedAt}]='${text[i + mismatchedAt]}' ≠ pattern[${mismatchedAt}]='${pattern[mismatchedAt]}'`,
          cppLine: 11, pythonLine: 10,
        })
      }
    } else {
      steps.push({
        text, pattern, shift: i, textIdx: -1, patternIdx: -1,
        status: 'hash_miss', windowHash: winHash, patHash, matches: [...matches],
        description: `位置 ${i}：窗口哈希 ${winHash} ≠ 模式哈希 ${patHash}，O(1) 跳过`,
        cppLine: 11, pythonLine: 9,
      })
    }

    // Roll hash to next window: remove leftmost, shift, add rightmost
    if (i < n - m) {
      const leftContribution = (code(text[i]) * pow) % MOD
      winHash = ((winHash - leftContribution + MOD) * BASE + code(text[i + m])) % MOD
      steps.push({
        text, pattern, shift: i + 1, textIdx: i + m, patternIdx: -1,
        status: 'rolling', windowHash: winHash, patHash, matches: [...matches],
        description: `滚动哈希：移出 '${text[i]}'，加入 '${text[i + m]}'，新窗口 "${text.slice(i + 1, i + 1 + m)}" 哈希 = ${winHash}`,
        cppLine: 12, pythonLine: 11,
      })
    }
  }

  steps.push({
    text, pattern, shift: n - m + 1, textIdx: -1, patternIdx: -1,
    status: 'done', windowHash: null, patHash, matches: [...matches],
    description: matches.length > 0
      ? `搜索完成：在位置 [${matches.join(', ')}] 共找到 ${matches.length} 处匹配`
      : `搜索完成：未找到匹配`,
    cppLine: 15, pythonLine: 13,
  })

  // Silence "unused" warnings if any tooling complains (modPow reserved for future precomputation)
  void modPow

  return steps
}
