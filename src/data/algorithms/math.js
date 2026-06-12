import { fastPower } from '../../algorithms/math/fastPower'
import { eulerSieve } from '../../algorithms/math/eulerSieve'
import { matrixPow } from '../../algorithms/math/matrixPow'

export const MATH_ALGORITHMS = {
  fastpow: {
    slug: 'fastpow',
    name: '快速幂',
    nameEn: 'Fast Exponentiation',
    category: 'math',
    difficulty: '基础',
    fn: fastPower,
    viz: 'fastpow',
    timeComplexity: { best: 'O(log b)', average: 'O(log b)', worst: 'O(log b)' },
    spaceComplexity: 'O(1)',
    stable: null,
    description: '利用指数的二进制分解，将 a^b mod m 的计算从 O(b) 降到 O(log b)。',
    intuition: `快速幂（Binary Exponentiation）的核心思想是利用指数的**二进制分解**来减少乘法次数。

计算 a^b，朴素做法是连乘 b 次，O(b)。但当 b 很大时（如 10^9），这不可行。

**关键观察：** 任何整数 b 都可以写成二进制：b = 2^k1 + 2^k2 + ...
因此 a^b = a^(2^k1) × a^(2^k2) × ...

而 a^(2^k) 可以通过反复平方快速得到：
- a^1 = a
- a^2 = a × a
- a^4 = a^2 × a^2
- a^8 = a^4 × a^4
- ...

**算法流程：**
1. 从低位到高位扫描 b 的二进制位
2. 维护 base = a^(2^i)，每轮 base = base × base
3. 若当前位为 1，把 base 乘入结果

总共只需 O(log b) 次乘法。配合取模运算（大数幂取模），这是密码学（RSA）和竞赛中的基础操作。`,
    pseudocode: `procedure FastPower(a, b, mod):
    result ← 1
    a ← a mod mod
    while b > 0:
        if b is odd:        // b & 1
            result ← result × a mod mod
        a ← a × a mod mod   // 平方
        b ← b >> 1           // 右移一位
    return result`,
    code: {
      cpp: `typedef long long ll;

ll qpow(ll a, ll b, ll mod) {
    ll res = 1;
    a %= mod;
    while (b > 0) {
        if (b & 1) res = res * a % mod;  // 当前位为1，乘入结果
        a = a * a % mod;                  // 底数平方
        b >>= 1;                           // 指数右移
    }
    return res;
}`,
      python: `def fast_power(a, b, mod):
    res = 1
    a %= mod
    while b > 0:
        if b & 1:              # 当前位为1，乘入结果
            res = res * a % mod
        a = a * a % mod        # 底数平方
        b >>= 1                # 指数右移
    return res`,
    },
    applications: [
      'RSA 加密 / 解密中的大数幂取模',
      '求乘法逆元：a^(p-2) mod p（费马小定理）',
      '矩阵快速幂的基础组件',
      '组合数 C(n,k) mod p 的计算',
    ],
  },

  sieve: {
    slug: 'sieve',
    name: '欧拉筛（线性筛）',
    nameEn: 'Euler Sieve (Linear Sieve)',
    category: 'math',
    difficulty: '中等',
    fn: eulerSieve,
    viz: 'sieve',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    stable: null,
    description: '每个合数只被其最小质因子筛掉一次，O(n) 线性时间求出所有素数。',
    intuition: `欧拉筛（Euler Sieve / Linear Sieve）是求 1~n 内所有素数的高效算法，时间复杂度 **O(n)**。

**与埃氏筛的区别：**
- 埃氏筛（Eratosthenes）：每个素数 p 标记 p², p²+p, p²+2p, ...，但一个合数可能被多个素数标记，时间 O(n log log n)。
- 欧拉筛：保证每个合数**只被其最小质因子标记一次**，严格 O(n)。

**核心规则：** 对于当前数 i，用已找到的素数 p 去标记 i×p 为合数。**如果 i % p == 0，立即停止**——这保证 i×p 是由其最小质因子 p 标记的。

**证明：** 若 i % p == 0，则 p 是 i 的最小质因子。对更大的素数 q > p，数 i×q 的最小质因子是 p（不是 q），所以应该留到后面由 p 来标记。

这个算法还能同时求出积性函数（如欧拉函数 φ(n)），是 OI / 竞赛的必备工具。`,
    pseudocode: `procedure EulerSieve(n):
    isPrime ← array of true, size n+1
    primes ← []
    isPrime[0] ← isPrime[1] ← false
    for i from 2 to n:
        if isPrime[i]:
            primes.append(i)
        for p in primes:
            if i × p > n: break
            isPrime[i × p] ← false
            if i mod p = 0: break    // 关键！保证最小质因子筛
    return primes`,
    code: {
      cpp: `vector<int> eulerSieve(int n) {
    vector<bool> is_prime(n + 1, true);
    vector<int> primes;
    is_prime[0] = is_prime[1] = false;

    for (int i = 2; i <= n; i++) {
        if (is_prime[i]) primes.push_back(i);
        for (int p : primes) {
            if ((long long)i * p > n) break;
            is_prime[i * p] = false;
            if (i % p == 0) break;  // 核心：最小质因子筛
        }
    }
    return primes;
}`,
      python: `def euler_sieve(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    primes = []

    for i in range(2, n + 1):
        if is_prime[i]:
            primes.append(i)
        for p in primes:
            if i * p > n:
                break
            is_prime[i * p] = False
            if i % p == 0:      # 核心：最小质因子筛
                break
    return primes`,
    },
    applications: [
      '求 1~n 内所有素数（O(n) 最优）',
      '同时计算欧拉函数 φ(n)、莫比乌斯函数 μ(n)',
      '大数分解的预处理',
      'OI/ICPC 竞赛基础数论工具',
    ],
  },

  matrixpow: {
    slug: 'matrixpow',
    name: '矩阵快速幂',
    nameEn: 'Matrix Fast Exponentiation',
    category: 'math',
    difficulty: '进阶',
    fn: matrixPow,
    viz: 'matrixpow',
    timeComplexity: { best: 'O(k³ log n)', average: 'O(k³ log n)', worst: 'O(k³ log n)' },
    spaceComplexity: 'O(k²)',
    stable: null,
    description: '将快速幂推广到矩阵乘法，O(k³ log n) 求解线性递推（如 Fibonacci 第 n 项）。',
    intuition: `矩阵快速幂是**快速幂思想**在矩阵乘法上的推广。

**核心思想：** 如果一个递推关系可以写成矩阵形式：

  [f(n)]     [a b]   [f(n-1)]
  [f(n-1)] = [c d] × [f(n-2)]

那么：

  [f(n)]     [a b]^(n-1)   [f(1)]
  [f(n-1)] = [c d]       × [f(0)]

通过矩阵快速幂在 O(k³ log n) 时间内求出转移矩阵的幂次，就能直接算出 f(n)。

**经典应用 — Fibonacci：**
- f(n) = f(n-1) + f(n-2)
- 转移矩阵 = [[1,1],[1,0]]
- 初始向量 = [1,0]^T
- f(n) = (M^(n-1))[0][0]

k×k 矩阵乘法 O(k³)，快速幂 O(log n)，总计 O(k³ log n)。当 k 很小（如 k=2,3）而 n 极大（如 10^18）时，这比 O(n) DP 快得多。`,
    pseudocode: `// 矩阵乘法 C = A × B (mod m)
procedure MatMul(A, B, m):
    k ← A.rows
    C ← zero matrix k×k
    for i from 0 to k-1:
        for j from 0 to k-1:
            for p from 0 to k-1:
                C[i][j] ← (C[i][j] + A[i][p] × B[p][j]) mod m
    return C

// 矩阵快速幂
procedure MatPow(M, n, m):
    result ← identity matrix
    base ← M
    while n > 0:
        if n is odd: result ← MatMul(result, base, m)
        base ← MatMul(base, base, m)
        n ← n >> 1
    return result`,
    code: {
      cpp: `typedef long long ll;
typedef vector<vector<ll>> Matrix;

Matrix matMul(const Matrix& A, const Matrix& B, ll mod) {
    int k = A.size();
    Matrix C(k, vector<ll>(k, 0));
    for (int i = 0; i < k; i++)
        for (int j = 0; j < k; j++)
            for (int p = 0; p < k; p++)
                C[i][j] = (C[i][j] + A[i][p] * B[p][j]) % mod;
    return C;
}

Matrix matPow(Matrix M, ll n, ll mod) {
    int k = M.size();
    Matrix res(k, vector<ll>(k, 0));
    for (int i = 0; i < k; i++) res[i][i] = 1; // 单位矩阵
    while (n > 0) {
        if (n & 1) res = matMul(res, M, mod);
        M = matMul(M, M, mod);
        n >>= 1;
    }
    return res;
}

// Fibonacci: f(n) = matPow({{1,1},{1,0}}, n-1, mod)[0][0]`,
      python: `def mat_mul(A, B, mod):
    k = len(A)
    C = [[0]*k for _ in range(k)]
    for i in range(k):
        for j in range(k):
            for p in range(k):
                C[i][j] = (C[i][j] + A[i][p] * B[p][j]) % mod
    return C

def mat_pow(M, n, mod):
    k = len(M)
    res = [[int(i==j) for j in range(k)] for i in range(k)]
    base = [row[:] for row in M]
    while n > 0:
        if n & 1:
            res = mat_mul(res, base, mod)
        base = mat_mul(base, base, mod)
        n >>= 1
    return res

# Fibonacci: f(n) = mat_pow([[1,1],[1,0]], n-1, mod)[0][0]`,
    },
    applications: [
      'Fibonacci 第 n 项（n ≤ 10^18）',
      '线性递推的通项计算',
      '图上长度为 k 的路径计数（邻接矩阵的 k 次幂）',
      '状态压缩 DP 的加速（如铺砖问题）',
    ],
  },
}

export default MATH_ALGORITHMS
