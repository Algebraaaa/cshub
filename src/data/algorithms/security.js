// 自动从 algorithms.js 拆分（2 个算法 · security 学科）
import { diffieHellman } from '../../algorithms/security/diffieHellman'
import { rsa } from '../../algorithms/security/rsa'

export const SECURITY_ALGORITHMS = {
  rsa: {
    slug: 'rsa',
    name: 'RSA 加解密',
    nameEn: 'RSA Cryptosystem',
    category: 'security',
    difficulty: '进阶',
    fn: rsa,
    viz: 'crypto',
    timeComplexity: { best: 'O(log³ n)', average: 'O(log³ n)', worst: 'O(log³ n)' },
    spaceComplexity: 'O(log n)',
    description: '基于大数分解困难问题的公钥密码体系，互联网安全的奠基石。',
    intuition: `**RSA** 由 Rivest、Shamir、Adleman 1977 年提出，是第一个广泛使用的非对称加密算法。\n\n**为什么能成立**：核心数学事实是 **大整数因式分解很难**。你可以给所有人看 n = p × q（两个大素数的积），但没人能在合理时间内分解回 p、q。\n\n**完整流程**：\n1. 选两个大素数 p、q（实际 1024+ 位）\n2. 计算 n = p × q，φ(n) = (p−1)(q−1)\n3. 选 e 与 φ(n) 互素（通常用 65537 = 2^16 + 1，二进制只 2 个 1，快速加密）\n4. 求 d ≡ e⁻¹ (mod φ)，用扩展欧几里得算法\n5. **公钥**：(n, e)，公开。**私钥**：(n, d)，保密\n6. **加密**：c = m^e mod n（任何人都能用公钥加密）\n7. **解密**：m = c^d mod n（只有持私钥者能解）\n\n**为什么解密能恢复原文**：基于欧拉定理 m^φ(n) ≡ 1 (mod n)。e × d ≡ 1 (mod φ)，所以 m^(ed) ≡ m (mod n)。\n\n**数字签名**：把加密/解密反过来——用 **私钥** 签名 (s = m^d mod n)，任何人用 **公钥** 验证 (m' = s^e mod n)。\n\n**安全性威胁**：\n- 经典计算机：分解 2048 位 n 需要数千年\n- 量子计算机：Shor 算法可以多项式时间分解，RSA 会被破\n- 后量子加密：NIST 在 2024 年正式标准化了 Kyber / Dilithium 等抗量子算法替代 RSA`,
    pseudocode: `// 密钥生成
1. 选两个大素数 p, q
2. n ← p × q
3. φ(n) ← (p-1)(q-1)
4. 选 e, gcd(e, φ) = 1   // 通常 e = 65537
5. d ← e⁻¹ mod φ          // 扩展欧几里得
6. PK = (n, e), SK = (n, d)

// 加密 / 解密
encrypt(m, PK):  return m^e mod n
decrypt(c, SK):  return c^d mod n

// 签名 / 验证
sign(m, SK):     return m^d mod n
verify(s, PK):   return s^e mod n  // 应等于 m`,
    code: {
      cpp: `// 快速幂（mod n）
long long modPow(long long base, long long exp, long long mod) {
    long long r = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) r = (r * base) % mod;
        exp >>= 1;
        base = (base * base) % mod;
    }
    return r;
}

// 扩展欧几里得求模逆
long long modInverse(long long e, long long phi) {
    long long old_r = e, r = phi;
    long long old_s = 1, s = 0;
    while (r != 0) {
        long long q = old_r / r;
        tie(old_r, r) = make_tuple(r, old_r - q * r);
        tie(old_s, s) = make_tuple(s, old_s - q * s);
    }
    return ((old_s % phi) + phi) % phi;
}

// RSA 加密 / 解密
long long encrypt(long long m, long long e, long long n) { return modPow(m, e, n); }
long long decrypt(long long c, long long d, long long n) { return modPow(c, d, n); }`,
      python: `# 生产环境用 cryptography 库，下面是教学示例
from math import gcd

def modinv(e, phi):
    # 扩展欧几里得
    old_r, r = e, phi
    old_s, s = 1, 0
    while r:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_s, s = s, old_s - q * s
    return old_s % phi

def gen_keys(p, q, e=65537):
    n = p * q
    phi = (p - 1) * (q - 1)
    assert gcd(e, phi) == 1
    d = modinv(e, phi)
    return (n, e), (n, d)

def encrypt(m, pk):
    n, e = pk
    return pow(m, e, n)

def decrypt(c, sk):
    n, d = sk
    return pow(c, d, n)

PK, SK = gen_keys(61, 53)        # 教学用，实际要用 1024+ 位素数
c = encrypt(65, PK)
m = decrypt(c, SK)               # 65`,
    },
    applications: [
      'TLS / HTTPS 握手中的密钥交换（虽然现在更多用 ECDHE）',
      'SSH 公钥认证、PGP/GPG 邮件加密',
      '数字签名：代码签名、电子合同',
      '区块链：早期比特币地址生成（现在用椭圆曲线 ECC，但思想同源）',
      '考研 / 信安专业必考核心算法',
    ],
  },

  dh: {
    slug: 'dh',
    name: 'Diffie-Hellman 密钥交换',
    nameEn: 'Diffie-Hellman Key Exchange',
    category: 'security',
    difficulty: '进阶',
    fn: diffieHellman,
    viz: 'crypto',
    timeComplexity: { best: 'O(log³ p)', average: 'O(log³ p)', worst: 'O(log³ p)' },
    spaceComplexity: 'O(log p)',
    description: '让双方在公开信道上协商出共享密钥，窃听者即使截获全部传输也无法计算出密钥。',
    intuition: `**Diffie-Hellman (DH)** 1976 年提出，是 **公钥密码学** 的开山之作，**早于** RSA。它解决一个看似不可能的问题：**两人通过公开信道协商共享密钥，窃听者听到全部对话却得不到密钥**。\n\n**协议流程**（Alice 和 Bob）：\n1. 公开协商大素数 p 和 p 的原根 g\n2. Alice 选秘密 a（不公开），算 A = g^a mod p，发送 A\n3. Bob 选秘密 b（不公开），算 B = g^b mod p，发送 B\n4. Alice 算 s = B^a mod p\n5. Bob 算 s = A^b mod p\n6. **两人算出相同的 s**：因为 (g^a)^b = (g^b)^a = g^(ab) mod p\n\n**为什么安全**：窃听者 Eve 看得到 g、p、A、B，但要算 s 必须先从 A 反求 a（**离散对数问题**——已知 g、p、A=g^a mod p，求 a）。在合适的群上这是计算困难问题。\n\n**和 RSA 的关系**：\n- DH **只能交换密钥**，不能直接加密大消息；RSA 既能加密也能签名\n- 实际使用：先用 DH 协商对称密钥，再用 AES 等对称加密通信\n- DH 提供 **前向安全 (Perfect Forward Secrecy)**：即使将来私钥泄露，过去的会话仍然安全\n\n**TLS 1.3 默认用 ECDHE**（椭圆曲线版本的 ephemeral DH）——更快、密钥更短、安全等级更高。\n\n**中间人攻击**：DH 本身不验证身份，Mallory 可以分别和 Alice、Bob 做 DH，然后转发解密的消息。所以实际需要 **配合身份认证**（证书、PSK）。`,
    pseudocode: `// 公开参数
prime p (~2048 bits), generator g

// Alice
a ← random in [2, p-2]
A ← g^a mod p
send A to Bob

// Bob
b ← random in [2, p-2]
B ← g^b mod p
send B to Alice

// 各自计算共享密钥
Alice: s ← B^a mod p
Bob:   s ← A^b mod p
// s_Alice == s_Bob == g^(ab) mod p`,
    code: {
      cpp: `// 教学用 DH（实际请用 OpenSSL / libsodium）
long long modPow(long long b, long long e, long long m) {
    long long r = 1; b %= m;
    while (e > 0) {
        if (e & 1) r = (r * b) % m;
        e >>= 1; b = (b * b) % m;
    }
    return r;
}

long long alice_secret_a, bob_secret_b;
long long p = 23, g = 5;

void protocol() {
    long long A = modPow(g, alice_secret_a, p);  // Alice → Bob
    long long B = modPow(g, bob_secret_b, p);    // Bob → Alice
    long long sA = modPow(B, alice_secret_a, p);
    long long sB = modPow(A, bob_secret_b, p);
    // sA == sB ✓
}`,
      python: `# 教学示例。生产代码请用 cryptography.hazmat.primitives.asymmetric.dh
import secrets

def dh_keyexchange(p, g):
    a = secrets.randbelow(p - 2) + 2          # Alice 的私钥
    b = secrets.randbelow(p - 2) + 2          # Bob 的私钥
    A = pow(g, a, p)                          # 公开发送
    B = pow(g, b, p)                          # 公开发送
    s_alice = pow(B, a, p)                    # Alice 算
    s_bob = pow(A, b, p)                      # Bob 算
    assert s_alice == s_bob
    return s_alice

# 教学小素数（实际至少 2048 位）
shared = dh_keyexchange(p=23, g=5)`,
    },
    applications: [
      'TLS / HTTPS 握手协商对称密钥（实际是 ECDHE 变种）',
      'SSH 连接初始化',
      'Signal / WhatsApp 端到端加密的密钥协商',
      '前向安全 (PFS) 的实现基础',
      '信安课 / 408 公钥密码学经典案例',
    ],
  },

}

export default SECURITY_ALGORITHMS
