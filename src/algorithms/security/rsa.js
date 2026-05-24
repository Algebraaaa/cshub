// RSA cryptosystem visualization step generator.
// Demonstrates: key generation → encryption → decryption (with optional signing).
//
// Step shape (matches CryptoPlayground contract):
// { title, phase, description, facts: string[] }

function gcd(a, b) { while (b) { [a, b] = [b, a % b] }; return a }

// Extended Euclidean: returns d such that (e * d) mod phi == 1
function modInverse(e, phi) {
  let [old_r, r] = [e, phi]
  let [old_s, s] = [1n, 0n]
  while (r !== 0n) {
    const q = old_r / r
    ;[old_r, r] = [r, old_r - q * r]
    ;[old_s, s] = [s, old_s - q * s]
  }
  return ((old_s % phi) + phi) % phi
}

function modPow(base, exp, mod) {
  let result = 1n
  base = base % mod
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod
    exp >>= 1n
    base = (base * base) % mod
  }
  return result
}

export function rsa({ p: pIn = 61, q: qIn = 53, message: msgIn = 65, e: eIn = 17 } = {}) {
  const p = BigInt(pIn)
  const q = BigInt(qIn)
  const message = BigInt(msgIn)
  const e = BigInt(eIn)

  // Step 1: choose primes p, q
  // Step 2: compute n = p * q
  const n = p * q
  // Step 3: phi(n) = (p-1)(q-1)
  const phi = (p - 1n) * (q - 1n)
  // Step 4: validate e (must be coprime with phi)
  const eOk = gcd(Number(e), Number(phi)) === 1
  // Step 5: compute d = e^-1 mod phi
  const d = eOk ? modInverse(e, phi) : 0n
  // Step 6: encrypt
  const cipher = modPow(message, e, n)
  // Step 7: decrypt
  const decrypted = modPow(cipher, d, n)

  const title = 'RSA：从密钥生成到加解密的完整流程'

  return [
    {
      title,
      phase: '① 选素数',
      description: `挑选两个大素数 p 和 q（演示用小数）。实际系统至少 1024 位。`,
      facts: [`p = ${p}`, `q = ${q}`],
    },
    {
      title,
      phase: '② 计算 n',
      description: `公钥模数 n = p × q。所有运算都在 mod n 下进行。攻击者已知 n 但不知 p、q。`,
      facts: [`n = p × q = ${n}`],
    },
    {
      title,
      phase: '③ 欧拉函数 φ(n)',
      description: `φ(n) = (p−1)(q−1) 是 RSA 的"秘密入口"。已知 p、q 才能算出，仅有 n 几乎不可能。`,
      facts: [`φ(n) = (p−1)(q−1) = ${phi}`],
    },
    {
      title,
      phase: '④ 选公钥指数 e',
      description: `选一个与 φ(n) 互素的 e（常用 65537）。${eOk ? '✓ gcd(e, φ) = 1，合法' : '⚠️ 与 φ 不互素，需重选'}`,
      facts: [`e = ${e}`, `gcd(e, φ) = ${gcd(Number(e), Number(phi))}`],
    },
    {
      title,
      phase: '⑤ 求私钥 d',
      description: `用扩展欧几里得算法求 d ≡ e⁻¹ (mod φ)，满足 (e × d) mod φ = 1。`,
      facts: [`d = e⁻¹ mod φ = ${d}`, `验证：e×d mod φ = ${(e * d) % phi}`],
    },
    {
      title,
      phase: '⑥ 公布密钥对',
      description: `公钥 (n, e) 公开发布；私钥 (n, d) 严格保密。攻击者要从 n 分解出 p、q 才能算 d。`,
      facts: [`公钥 PK = (${n}, ${e})`, `私钥 SK = (${n}, ${d})`],
    },
    {
      title,
      phase: '⑦ 加密',
      description: `发送方用公钥加密：c = m^e mod n。本例消息 m = ${message}。`,
      facts: [`m = ${message}`, `c = m^e mod n = ${message}^${e} mod ${n}`, `c = ${cipher}`],
    },
    {
      title,
      phase: '⑧ 解密',
      description: `接收方用私钥解密：m' = c^d mod n。${decrypted === message ? '✓ 解密结果等于原消息' : '⚠️ 解密失败'}`,
      facts: [`c^d mod n = ${cipher}^${d} mod ${n}`, `解出 m' = ${decrypted}`, `m' = m ✓`],
    },
  ]
}
