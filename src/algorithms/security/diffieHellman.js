// Diffie-Hellman key exchange visualization step generator.
// Uses CryptoPlayground's step shape: { title, phase, description, facts }.

function modPow(base, exp, mod) {
  let r = 1n
  base = base % mod
  while (exp > 0n) {
    if (exp & 1n) r = (r * base) % mod
    exp >>= 1n
    base = (base * base) % mod
  }
  return r
}

export function diffieHellman({ p: pIn = 23, g: gIn = 5, a: aIn = 6, b: bIn = 15 } = {}) {
  const p = BigInt(pIn)
  const g = BigInt(gIn)
  const a = BigInt(aIn)
  const b = BigInt(bIn)

  const A = modPow(g, a, p)
  const B = modPow(g, b, p)
  const sA = modPow(B, a, p)
  const sB = modPow(A, b, p)

  const title = 'Diffie-Hellman 密钥交换'

  return [
    {
      title,
      phase: '① 公开参数',
      description: `Alice 和 Bob 公开协商一个大素数 p 和原根 g。这两个值任何人（包括窃听者 Eve）都能看到。`,
      facts: [`p = ${p}（大素数）`, `g = ${g}（mod p 的原根）`],
    },
    {
      title,
      phase: '② Alice 选秘密 a',
      description: `Alice 在 [2, p−2] 中随机选一个秘密整数 a，永远不公开。`,
      facts: [`a = ${a}（Alice 私密）`],
    },
    {
      title,
      phase: '③ Bob 选秘密 b',
      description: `Bob 同样随机选一个秘密整数 b，永远不公开。`,
      facts: [`b = ${b}（Bob 私密）`],
    },
    {
      title,
      phase: '④ 计算公开值',
      description: `各自算出公开值并发送给对方：A = g^a mod p，B = g^b mod p。Eve 即使截获 A、B、g、p，也无法反推出 a、b（离散对数难题）。`,
      facts: [`A = g^a mod p = ${g}^${a} mod ${p} = ${A}`, `B = g^b mod p = ${g}^${b} mod ${p} = ${B}`],
    },
    {
      title,
      phase: '⑤ Alice 算共享密钥',
      description: `Alice 用 Bob 发来的 B 和自己的私密 a，算出共享密钥 s = B^a mod p。`,
      facts: [`s_A = B^a mod p = ${B}^${a} mod ${p}`, `s_A = ${sA}`],
    },
    {
      title,
      phase: '⑥ Bob 算共享密钥',
      description: `Bob 用 Alice 发来的 A 和自己的私密 b，算出共享密钥 s = A^b mod p。`,
      facts: [`s_B = A^b mod p = ${A}^${b} mod ${p}`, `s_B = ${sB}`],
    },
    {
      title,
      phase: '⑦ 双方密钥相等',
      description: `数学证明：s_A = (g^b)^a = g^(ab) = (g^a)^b = s_B mod p。${sA === sB ? '✓ 两人现在拥有相同的共享密钥，可以用对称加密通信。' : '⚠️ 计算失败'}`,
      facts: [`s_A = ${sA}`, `s_B = ${sB}`, `s_A === s_B：${sA === sB ? '✓' : '✗'}`],
    },
    {
      title,
      phase: '⑧ Eve 为什么破不了',
      description: `Eve 只能看到 g、p、A、B。要恢复 s 必须先从 A 反求 a（离散对数问题，至今没有多项式算法）。在 2048 位 p 下，需要超算运行数千年。`,
      facts: [`Eve 已知：g, p, A=${A}, B=${B}`, `要破解需要：a 或 b（离散对数难题）`, `经典攻击复杂度：O(√p)，对 2048 位 p 实际不可行`],
    },
  ]
}
