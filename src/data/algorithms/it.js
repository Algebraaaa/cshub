// 信息论 学科（14 个模块）
import { selfInfoSteps } from '../../algorithms/it/selfInfo'
import { entropySteps } from '../../algorithms/it/entropy'
import { jointEntropySteps } from '../../algorithms/it/jointEntropy'
import { mutualInfoSteps } from '../../algorithms/it/mutualInfo'
import { klDivergenceSteps } from '../../algorithms/it/klDivergence'
import { entropyRateSteps } from '../../algorithms/it/entropyRate'
import { channelSteps } from '../../algorithms/it/channel'
import { channelCapacitySteps } from '../../algorithms/it/channelCapacity'
import { markovSourceSteps } from '../../algorithms/it/markovSource'
import { markovChannelSteps } from '../../algorithms/it/markovChannel'
import { huffmanSteps } from '../../algorithms/it/huffman'
import { shannonFanoSteps } from '../../algorithms/it/shannonFano'
import { errorCorrectSteps } from '../../algorithms/it/errorCorrect'
import { dataCompressionSteps } from '../../algorithms/it/dataCompression'

const selfInfoPseudo = `I(x) ← -log₂ p(x)
// 1. 给定事件概率 p ∈ (0, 1]
// 2. 代入公式 I(x) = -log₂ p(x)
// 3. 单位：比特 (bit)
// 4. 性质：p 越小，I(x) 越大；独立事件 I(x,y)=I(x)+I(y)`

const entropyPseudo = `procedure Entropy(p[1..n]):
    H ← 0
    for i from 1 to n:
        if p[i] > 0:
            H ← H - p[i] · log₂ p[i]
    return H
// H(X) = -Σ p(x) log₂ p(x)`

const jointPseudo = `// 联合熵 H(X,Y) = -ΣΣ p(x,y) log p(x,y)
// 条件熵 H(Y|X) = Σ p(x) H(Y|X=x)
//                 = -ΣΣ p(x,y) log p(y|x)
// 链法则：H(X,Y) = H(X) + H(Y|X)`

const miPseudo = `// 互信息 I(X;Y) = H(X) - H(X|Y)
//                = H(Y) - H(Y|X)
//                = ΣΣ p(x,y) log(p(x,y)/(p(x)p(y)))
// 性质：I(X;Y) ≥ 0；I(X;Y) = I(Y;X)
//       I(X;Y) = H(X) + H(Y) - H(X,Y)`

const klPseudo = `procedure KLDivergence(P, Q):
    D ← 0
    for i:
        if P[i] > 0:
            D ← D + P[i] · log₂(P[i] / Q[i])
    return D
// H(P,Q) = H(P) + D(P||Q)  交叉熵`

const erPseudo = `// 熵率：平稳马尔可夫链
// π 满足 π P = π
// H = Σ_i π_i · H(Y | X=i)
//     = -Σ_i π_i Σ_j P_{i,j} log P_{i,j}`

const channelPseudo = `// 二元对称信道 BSC(p)
// P(Y=0|X=0) = 1-p, P(Y=1|X=0) = p
// P(Y=1|X=1) = 1-p, P(Y=0|X=1) = p
// 容量 C = 1 - H(p) 比特/信道使用`

const capPseudo = `// 信道容量 C = max_{p(x)} I(X;Y)
// Blahut-Arimoto 迭代：
// 1. 初始化 q(x)（输入分布）
// 2. r(y) = Σ_x q(x) P(y|x)
// 3. I = Σ_{x,y} q(x)P(y|x) log(P(y|x)/r(y))
// 4. q'(x) ∝ exp(Σ_y P(y|x) log(P(y|x)/r(y)))
// 5. 归一化 q'，迭代直到收敛`

const markovPseudo = `// 马尔可夫信源（一阶）
// 无后效性：P(X_t | X_{<t}) = P(X_t | X_{t-1})
// 转移矩阵 P[i][j] = P(X_t = j | X_{t-1} = i)
// 平稳分布 π：π P = π, Σ π = 1
// 幂法：π^{(t+1)} = π^{(t)} P`

const markovChanPseudo = `// 马尔可夫信道
// 信道状态 S_t 按马尔可夫链演化
// 输出 Y_t 依赖 (X_t, S_t)
// P(y_t | x_{1:t}, y_{1:t-1}, s_{1:t}) = P(y_t | x_t, s_t)`

const huffmanPseudo = `procedure Huffman(symbols[1..n]):
    Q ← priority_queue of (freq, symbol)
    while |Q| > 1:
        a ← extract_min(Q)
        b ← extract_min(Q)
        parent ← new node(freq = a.freq + b.freq,
                          left = a, right = b)
        insert(Q, parent)
    root ← extract_min(Q)
    // DFS：左 0 / 右 1 分配码字
    return code_table`

const sfPseudo = `procedure ShannonFano(symbols sorted by freq desc):
    if |symbols| ≤ 1: return
    split ← 使上下两部分累计频率最接近的切分点
    上半部分各码字追加 "0"
    下半部分各码字追加 "1"
    递归处理上下两部分`

const eccPseudo = `// 汉明码 (7,4)：4 位数据 → 7 位码字
// 位置: 1 2 3 4 5 6 7
//       r r d r d d d
// r1 = d1 ⊕ d2 ⊕ d4
// r2 = d1 ⊕ d3 ⊕ d4
// r4 = d2 ⊕ d3 ⊕ d4
// 译码：S = s3 s2 s1 指出出错位置（0 表示无错）`

const dcPseudo = `// 数据压缩：信源编码定理
// 对唯一可译码：L ≥ H(X)
// 存在编码满足：H(X) ≤ L < H(X) + 1
// 编码效率 η = H / L
// 冗余度 ρ = 1 - η`

const entApp = ['数据压缩（zip/gzip 等压缩器）', '异常检测（概率偏离基准）', '特征选择（互信息作为相关性指标）', '密码学分析（信息泄漏量化）']

export const IT_ALGORITHMS = {
  'it-selfinfo': {
    slug: 'it-selfinfo',
    name: '自信息与信息量',
    nameEn: 'Self-Information',
    category: 'itFundamental',
    difficulty: '基础',
    fn: selfInfoSteps,
    viz: 'itSelfInfo',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
    spaceComplexity: 'O(1)',
    stable: true,
    inPlace: true,
    description: '事件发生概率越小，携带的信息量越大。I(x) = -log p(x)。',
    intuition: `自信息（Self-Information）衡量单个随机事件发生时所包含的信息量。

**核心直觉**：
- 必然发生的事件 (p=1) 不携带任何信息（I=0）
- 小概率事件一旦发生，带来的"惊喜"更大
- 两个独立事件同时发生的信息量等于各自信息量之和

**公式**：I(x) = -log_b p(x)

- 当 b=2：单位为 **比特 (bit)**（最常用）
- 当 b=e：单位为 **奈特 (nat)**
- 当 b=10：单位为 **哈特利 (hartley)**

信息量 = "需要多少个公平硬币抛掷才能确定此事件发生"。`,
    pseudocode: selfInfoPseudo,
    code: {
      python: `import math

def self_information(p, base=2):
    """计算事件的自信息 I(x) = -log p(x)"""
    if p <= 0 or p > 1:
        raise ValueError("概率必须在 (0, 1]")
    return -math.log(p, base)

# 示例：p=0.25 对应 2 比特信息
print(self_information(0.25))  # 2.0
# p=0.5 对应 1 比特
print(self_information(0.5))   # 1.0
# p=0.01 约 6.64 比特
print(self_information(0.01))  # ~6.64`,
      cpp: `#include <cmath>
#include <iostream>

double selfInformation(double p, int base = 2) {
    if (p <= 0 || p > 1) return NAN;
    return -std::log(p) / std::log(base);
}

int main() {
    std::cout << selfInformation(0.25) << std::endl;  // 2.0
    std::cout << selfInformation(0.5) << std::endl;   // 1.0
    std::cout << selfInformation(0.01) << std::endl;  // ~6.64
}`,
    },
    applications: entApp,
  },
  'it-entropy': {
    slug: 'it-entropy',
    name: '信息熵 Entropy',
    nameEn: 'Shannon Entropy',
    category: 'itFundamental',
    difficulty: '基础',
    fn: entropySteps,
    viz: 'itEntropy',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    stable: true,
    inPlace: true,
    description: '离散概率分布的平均不确定性：H(X) = -Σ p(x) log p(x)。',
    intuition: `信息熵是香农 1948 年提出的核心概念，衡量一个随机变量的**平均不确定性**。

**定义**：H(X) = -Σ_x p(x) log₂ p(x)

**关键性质**：
1. **非负性**：H(X) ≥ 0，当且仅当 X 为确定值时 H=0
2. **最大熵原理**：n 个取值的变量，均匀分布时熵最大 = log₂ n
3. **凹函数**：H 关于概率分布是凹函数
4. **变换不变**：一一对应变换不改变熵

**直观理解**：熵 = "平均需要多少个是/否问题才能确定 X 的取值"。抛一枚公平硬币（H=1 比特）需要 1 个问题。`,
    pseudocode: entropyPseudo,
    code: {
      python: `import math

def entropy(probs):
    """H(X) = -Σ p(x) log₂ p(x)"""
    h = 0.0
    for p in probs:
        if p > 0:
            h -= p * math.log2(p)
    return h

# 公平硬币：最大熵 1 比特
print(entropy([0.5, 0.5]))  # 1.0
# 偏置硬币 0.9/0.1：约 0.47 比特
print(entropy([0.9, 0.1]))  # ~0.469
# 4 值均匀分布：熵 = log₂ 4 = 2 比特
print(entropy([0.25]*4))   # 2.0`,
      cpp: `#include <cmath>
#include <vector>

double entropy(const std::vector<double>& probs) {
    double h = 0.0;
    for (double p : probs) {
        if (p > 0) h -= p * std::log2(p);
    }
    return h;
}`,
    },
    applications: entApp,
  },
  'it-joint-conditional': {
    slug: 'it-joint-conditional',
    name: '联合熵与条件熵',
    nameEn: 'Joint & Conditional Entropy',
    category: 'itFundamental',
    difficulty: '中等',
    fn: jointEntropySteps,
    viz: 'itJointEntropy',
    timeComplexity: { best: 'O(mn)', average: 'O(mn)', worst: 'O(mn)' },
    spaceComplexity: 'O(mn)',
    stable: true,
    inPlace: true,
    description: '基于联合概率表计算 H(X,Y) 与 H(Y|X)。',
    intuition: `**联合熵 H(X,Y)** 衡量 (X,Y) 一对随机变量的整体不确定性。
H(X,Y) = -Σ_x Σ_y p(x,y) log p(x,y)

**条件熵 H(Y|X)** 衡量在已知 X 的条件下 Y 剩余的平均不确定性。
H(Y|X) = Σ_x p(x) H(Y | X=x) = -Σ_x Σ_y p(x,y) log p(y|x)

**链法则 (Chain Rule)**：H(X,Y) = H(X) + H(Y|X) = H(Y) + H(X|Y)

**直观理解**：
- 联合熵 = "确定 X 和 Y 两个值总共需要多少信息"
- 条件熵 = "已经知道 X 后，确定 Y 还需要多少额外信息"
- 如果 X 和 Y 独立：H(Y|X) = H(Y)（知道 X 对了解 Y 毫无帮助）`,
    pseudocode: jointPseudo,
    code: {
      python: `import math

def joint_entropy(P):
    """P 是 m×n 联合概率矩阵"""
    h = 0.0
    for row in P:
        for p in row:
            if p > 0:
                h -= p * math.log2(p)
    return h

def conditional_entropy(P):
    """H(Y|X) = -ΣΣ p(x,y) log p(y|x)"""
    m, n = len(P), len(P[0])
    px = [sum(row) for row in P]
    h = 0.0
    for i in range(m):
        for j in range(n):
            pxy = P[i][j]
            if pxy > 0 and px[i] > 0:
                py_gx = pxy / px[i]
                h -= pxy * math.log2(py_gx)
    return h`,
    },
    applications: ['多变量信息分析', '特征相关性度量', '通信系统建模', '机器学习特征选择'],
  },
  'it-mutual': {
    slug: 'it-mutual',
    name: '互信息 Mutual Information',
    nameEn: 'Mutual Information',
    category: 'itFundamental',
    difficulty: '中等',
    fn: mutualInfoSteps,
    viz: 'itMutualInfo',
    timeComplexity: { best: 'O(mn)', average: 'O(mn)', worst: 'O(mn)' },
    spaceComplexity: 'O(mn)',
    stable: true,
    inPlace: true,
    description: '两个随机变量之间共享的信息量。',
    intuition: `互信息 I(X;Y) 衡量"知道 Y 后，X 的不确定性减少了多少"。

**定义**：
I(X;Y) = H(X) - H(X|Y) = H(Y) - H(Y|X)
       = H(X) + H(Y) - H(X,Y)
       = Σ_x Σ_y p(x,y) log( p(x,y) / (p(x)p(y)) )

**性质**：
1. **对称性**：I(X;Y) = I(Y;X)
2. **非负性**：I(X;Y) ≥ 0，等号当且仅当 X、Y 独立
3. **上界**：I(X;Y) ≤ min(H(X), H(Y))

**文氏图视角**：两个圆分别表示 H(X) 和 H(Y)，相交部分就是互信息。`,
    pseudocode: miPseudo,
    code: {
      python: `import math

def mutual_information(P):
    """P: m×n 联合概率矩阵"""
    m, n = len(P), len(P[0])
    px = [sum(row) for row in P]
    py = [sum(P[i][j] for i in range(m)) for j in range(n)]
    mi = 0.0
    for i in range(m):
        for j in range(n):
            pxy = P[i][j]
            if pxy > 0 and px[i] > 0 and py[j] > 0:
                mi += pxy * math.log2(pxy / (px[i] * py[j]))
    return mi`,
    },
    applications: ['特征选择（评估特征与标签的相关性）', '独立成分分析 ICA', '图像配准', '神经科学中的神经元同步分析'],
  },
  'it-kl-crossentropy': {
    slug: 'it-kl-crossentropy',
    name: 'KL 散度与交叉熵',
    nameEn: 'KL Divergence & Cross Entropy',
    category: 'itFundamental',
    difficulty: '中等',
    fn: klDivergenceSteps,
    viz: 'itKLDivergence',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    stable: true,
    inPlace: true,
    description: '两个概率分布之间差异的量化度量。',
    intuition: `**KL 散度 (Kullback-Leibler Divergence)** D(P||Q) 衡量"用 Q 近似 P 时损失的信息量"。

D(P||Q) = Σ_x P(x) log( P(x) / Q(x) )

**交叉熵** H(P,Q) = -Σ_x P(x) log Q(x) = H(P) + D(P||Q)

**关键性质**：
1. KL 散度**非对称**：D(P||Q) ≠ D(Q||P)
2. **非负**：D(P||Q) ≥ 0，等号当且仅当 P=Q
3. 不满足三角不等式，所以不是真正的距离

**与机器学习的关系**：
- 分类问题中，P 是真实 one-hot 标签分布，Q 是模型预测的 softmax 分布
- 最小化**交叉熵损失**等价于最小化 KL 散度（因为 H(P) 是常数）
- 这就是为什么 softmax + cross-entropy 是分类任务的标准组合`,
    pseudocode: klPseudo,
    code: {
      python: `import math
import torch
import torch.nn.functional as F

def kl_divergence(P, Q):
    """D(P||Q) = Σ P log(P/Q)"""
    d = 0.0
    for p, q in zip(P, Q):
        if p > 0 and q > 0:
            d += p * math.log2(p / q)
    return d

# PyTorch 中交叉熵损失 = -Σ P log Q
# F.cross_entropy 内部已包含 log_softmax
logits = torch.tensor([[2.0, 1.0, 0.1]])
target = torch.tensor([0])
loss = F.cross_entropy(logits, target)
# 等价于手动计算 softmax → 交叉熵`,
    },
    applications: ['深度学习分类损失函数', 'VAE / GAN 中的分布匹配', '贝叶斯推断中的近似后验', '生成模型评估'],
  },
  'it-entropyrate': {
    slug: 'it-entropyrate',
    name: '熵率 Entropy Rate',
    nameEn: 'Entropy Rate',
    category: 'itFundamental',
    difficulty: '进阶',
    fn: entropyRateSteps,
    viz: 'itEntropyRate',
    timeComplexity: { best: 'O(n²)', average: 'O(n²·k)', worst: 'O(n²·k)' },
    spaceComplexity: 'O(n²)',
    stable: true,
    inPlace: false,
    description: '随机过程单位时间的平均不确定性。',
    intuition: `熵率刻画"一串随机过程平均每个符号携带多少信息"。

**定义**：
H = lim_{n→∞} (1/n) H(X₁, X₂, …, X_n)   —— 联合熵平均
或等价地：
H = lim_{n→∞} H(X_n | X_{n-1}, …, X₁)    —— 条件熵极限

**平稳马尔可夫链的熵率**：
H = Σ_i π_i H(Y | X=i)
其中 π 是平稳分布，H(Y|X=i) = -Σ_j P_{i,j} log P_{i,j}

**与 i.i.d. 熵的关系**：
- 无记忆信源：熵率 = 单符号熵 H
- 有记忆信源：熵率 ≤ 单符号熵（因为相关性降低了不确定性）
- 编码定理：可实现的最小平均码长趋近于熵率`,
    pseudocode: erPseudo,
    code: {
      python: `import numpy as np

def entropy_rate(P):
    """P: n×n 转移矩阵"""
    n = P.shape[0]
    # 求平稳分布 π：π P = π
    # 用幂法迭代
    pi = np.ones(n) / n
    for _ in range(1000):
        pi_new = pi @ P
        if np.allclose(pi, pi_new):
            break
        pi = pi_new
    # H = Σ π_i H(Y|X=i)
    H = 0.0
    for i in range(n):
        h_cond = 0.0
        for j in range(n):
            if P[i, j] > 0:
                h_cond -= P[i, j] * np.log2(P[i, j])
        H += pi[i] * h_cond
    return H, pi`,
    },
    applications: ['自然语言建模', '股票价格过程分析', 'DNA 序列压缩', '语音信号处理'],
  },
  'it-channel': {
    slug: 'it-channel',
    name: '信道模型 BSC/BEC',
    nameEn: 'Channel Models (BSC / BEC)',
    category: 'itChannel',
    difficulty: '基础',
    fn: channelSteps,
    viz: 'itChannel',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
    spaceComplexity: 'O(1)',
    stable: true,
    inPlace: true,
    description: '基础离散无记忆信道的转移概率与噪声演示。',
    intuition: `信道将输入 X 以概率 P(Y|X) 映射为输出 Y。

**二元对称信道 BSC(p)**：
- 输入 0/1 比特，输出 0/1 比特
- 以概率 1-p 正确传输，以概率 p 翻转
- 容量 C = 1 - H(p)

**二元擦除信道 BEC(p)**：
- 输入 0/1 比特，输出 {0, 1, e(擦除)}
- 以概率 1-p 正确传输，以概率 p 被擦除为 e
- 容量 C = 1 - p（比 BSC 高，因为接收方知道哪里出错了）

**直观对比**：
- BSC：接收方不知道某个比特是否出错
- BEC：接收方明确知道哪个位置被擦除了，所以容量更高`,
    pseudocode: channelPseudo,
    code: {
      python: `import random

def bsc_channel(x, p=0.1):
    """二元对称信道：以概率 p 翻转"""
    return x ^ (1 if random.random() < p else 0)

def bec_channel(x, p=0.1):
    """二元擦除信道：以概率 p 返回 'e'"""
    return 'e' if random.random() < p else x

# 模拟 N 次传输
def simulate(channel_fn, inputs, **kwargs):
    return [channel_fn(x, **kwargs) for x in inputs]`,
    },
    applications: ['无线通信物理层建模', '存储系统（磁盘/SSD 错误）', '量子密钥分发信道建模', '密码学协议分析'],
  },
  'it-channelcapacity': {
    slug: 'it-channelcapacity',
    name: '信道容量',
    nameEn: 'Channel Capacity',
    category: 'itChannel',
    difficulty: '进阶',
    fn: channelCapacitySteps,
    viz: 'itChannelCapacity',
    timeComplexity: { best: 'O(mn·k)', average: 'O(mn·k)', worst: 'O(mn·k)' },
    spaceComplexity: 'O(mn)',
    stable: true,
    inPlace: false,
    description: '信道可可靠传输的最大速率。',
    intuition: `信道容量 C = max_{p(x)} I(X;Y)，代表信道可实现的最大可靠通信速率。

**香农第二定理（有噪信道编码定理）**：
- 对任意 R < C，存在编码使解码错误率任意小
- 对任意 R > C，不可能任意小错误

**Blahut-Arimoto 算法**：
交替优化输入分布 q(x) 与辅助分布 r(y)，直到 I(X;Y) 收敛到最大值 C。

**经典信道的容量**：
- BSC(p)：C = 1 - H(p)
- BEC(p)：C = 1 - p
- AWGN（连续）：C = (1/2) log₂(1 + SNR)
- 当输入均匀分布时达到容量（对对称信道）`,
    pseudocode: capPseudo,
    code: {
      python: `import numpy as np

def blahut_arimoto(P, iters=100):
    """P: m×n 信道转移矩阵 P(y|x)"""
    m, n = P.shape
    q = np.ones(m) / m  # 初始均匀分布
    for _ in range(iters):
        # r(y) = Σ_x q(x) P(y|x)
        r = q @ P
        # I = Σ qP log(P / r)
        I = 0.0
        for i in range(m):
            for j in range(n):
                if q[i] > 0 and P[i, j] > 0 and r[j] > 0:
                    I += q[i] * P[i, j] * np.log2(P[i, j] / r[j])
        # q'(x) ∝ exp(Σ_y P(y|x) log(P(y|x)/r(y)))
        q_new = np.zeros(m)
        for i in range(m):
            s = 0.0
            for j in range(n):
                if P[i, j] > 0 and r[j] > 0:
                    s += P[i, j] * np.log2(P[i, j] / r[j])
            q_new[i] = 2 ** s
        q = q_new / q_new.sum()
    return I, q`,
    },
    applications: ['5G/6G 通信系统设计', '光纤通信容量规划', 'MIMO 系统优化', '存储系统纠错码设计'],
  },
  'it-markov-source': {
    slug: 'it-markov-source',
    name: '马尔可夫信源',
    nameEn: 'Markov Source',
    category: 'itMarkov',
    difficulty: '中等',
    fn: markovSourceSteps,
    viz: 'itMarkovSource',
    timeComplexity: { best: 'O(n²·k)', average: 'O(n²·k)', worst: 'O(n²·k)' },
    spaceComplexity: 'O(n²)',
    stable: true,
    inPlace: false,
    description: '状态图与转移矩阵展示状态跳转、多步转移与平稳分布。',
    intuition: `马尔可夫信源是一个满足无后效性的随机过程：下一状态只依赖当前状态。

**一阶马尔可夫链**：
P(X_t | X_{t-1}, X_{t-2}, …, X₀) = P(X_t | X_{t-1})

**转移矩阵 P**：P[i][j] = P(X_t = j | X_{t-1} = i)

**平稳分布 π**：
满足 π P = π（不变） 且 Σ_i π_i = 1
对不可约、非周期的有限状态马尔可夫链，存在唯一平稳分布。

**大数定律**：长期访问频率收敛到平稳分布 π。

**k 步转移**：P^k [i][j] = P(X_{t+k}=j | X_t=i)。随 k 增大各行收敛到 π。`,
    pseudocode: markovPseudo,
    code: {
      python: `import numpy as np

def markov_stationary(P, iters=1000):
    """幂法求平稳分布"""
    n = P.shape[0]
    pi = np.ones(n) / n
    for _ in range(iters):
        pi_new = pi @ P
        if np.allclose(pi, pi_new, atol=1e-10):
            break
        pi = pi_new
    return pi

def simulate_markov(P, start, steps):
    """模拟马尔可夫链状态游走"""
    n = P.shape[0]
    state = start
    trace = [state]
    for _ in range(steps):
        state = np.random.choice(n, p=P[state])
        trace.append(state)
    return trace`,
    },
    applications: ['自然语言 N-gram 建模', '网页 PageRank', '天气预报模型', '金融资产价格模型'],
  },
  'it-markov-channel': {
    slug: 'it-markov-channel',
    name: '马尔可夫信道',
    nameEn: 'Markov Channel',
    category: 'itMarkov',
    difficulty: '进阶',
    fn: markovChannelSteps,
    viz: 'itMarkovChannel',
    timeComplexity: { best: 'O(n²·k)', average: 'O(n²·k)', worst: 'O(n²·k)' },
    spaceComplexity: 'O(n²)',
    stable: true,
    inPlace: false,
    description: '信道状态随时间演化下的输入输出过程。',
    intuition: `马尔可夫信道刻画了信道质量随时间动态变化（如无线信道的衰落）。

**模型**：
- 信道状态 S_t 按马尔可夫链演化：S_t ~ P(S_t | S_{t-1})
- 输出 Y_t 的分布依赖于当前输入 X_t 和信道状态 S_t

**经典例子——Gilbert-Elliott 信道**：
- 两状态：好(G) 和 坏(B)
- 好状态：错误率很低（如 0.05）
- 坏状态：错误率很高（如 0.5）
- 状态之间有转移概率

**与无记忆信道的差异**：
- 错误成"突发"出现，而不是独立随机
- 需要交织 (interleaving) 来分散突发错误
- 容量需要对所有信道状态的长期平均取极小/加权平均`,
    pseudocode: markovChanPseudo,
    code: {
      python: `import random

class GilbertElliott:
    def __init__(self, P_state, p_good=0.05, p_bad=0.5):
        self.S = P_state        # 信道状态转移矩阵
        self.pe = [p_good, p_bad]
        self.state = 0          # 初始在好状态
    def transmit(self, x):
        pe = self.pe[self.state]
        y = x ^ (1 if random.random() < pe else 0)
        # 状态转移
        r = random.random()
        self.state = 0 if r < self.S[self.state][0] else 1
        return y`,
    },
    applications: ['无线通信（Rayleigh 衰落信道）', '电力线通信', '深空通信', '磁盘读写错误建模'],
  },
  'it-huffman': {
    slug: 'it-huffman',
    name: '霍夫曼编码',
    nameEn: 'Huffman Coding',
    category: 'itCoding',
    difficulty: '中等',
    fn: huffmanSteps,
    viz: 'itHuffman',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    stable: false,
    inPlace: false,
    description: '最优前缀码：基于频率统计的贪心合并建树。',
    intuition: `霍夫曼编码由 David Huffman 1952 年提出，是**最优前缀码**的贪心算法。

**核心思想**：频率高的符号用短码字，频率低的用长码字。

**算法步骤**：
1. 将每个符号作为独立节点（频率 = 符号频率）放入优先队列
2. 重复：取出频率最小的两个节点，合并为新节点（频率 = 两者之和）
3. 合并节点的左子节点对应码字"0"，右子节点对应"1"
4. 直到队列只剩一个节点（霍夫曼树的根）
5. DFS 遍历得到每个叶子的码字

**最优性**：霍夫曼编码在所有唯一可译码中实现最短平均码长（对独立同分布符号）。

**前缀性质**：任何码字都不是另一个码字的前缀，因此译码时无需分隔符。`,
    pseudocode: huffmanPseudo,
    code: {
      python: `import heapq
from collections import Counter

def huffman(symbols):
    """symbols: [(freq, symbol)]"""
    heap = [[f, [s, ""]] for f, s in symbols]
    heapq.heapify(heap)
    while len(heap) > 1:
        lo = heapq.heappop(heap)
        hi = heapq.heappop(heap)
        for pair in lo[1:]:
            pair[1] = '0' + pair[1]
        for pair in hi[1:]:
            pair[1] = '1' + pair[1]
        heapq.heappush(heap, [lo[0] + hi[0]] + lo[1:] + hi[1:])
    return sorted(heapq.heappop(heap)[1:], key=lambda p: (len(p[-1]), p))

# 使用示例
text = "abracadabra"
freqs = Counter(text)
codes = huffman([(f, s) for s, f in freqs.items()])`,
    },
    applications: ['ZIP/GZIP 压缩', 'JPEG 图像压缩（Huffman 阶段）', 'MP3 音频编码', 'DEFLATE 算法'],
  },
  'it-shannonfano': {
    slug: 'it-shannonfano',
    name: '香农-费诺编码',
    nameEn: 'Shannon-Fano Coding',
    category: 'itCoding',
    difficulty: '中等',
    fn: shannonFanoSteps,
    viz: 'itShannonFano',
    timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(n)',
    stable: false,
    inPlace: false,
    description: '概率排序后上下半分递归分配码字，次优前缀码。',
    intuition: `香农-费诺编码是霍夫曼编码的前身，由 Claude Shannon 和 Robert Fano 分别独立提出。

**算法步骤**：
1. 将符号按频率降序排列
2. 将列表切分为上下两部分，使两部分累计频率尽可能接近
3. 上半部分各符号追加"0"，下半部分各符号追加"1"
4. 对上下两部分递归执行切分，直到每组只剩一个符号

**与霍夫曼编码的比较**：
- 香农-费诺实现简单但可能不是最优（贪心从上往下）
- 霍夫曼编码通过自底向上合并保证最优
- 两者都是前缀码，都满足 Kraft 不等式

香农-费诺是**次优**但更易理解的教学演示。`,
    pseudocode: sfPseudo,
    code: {
      python: `def shannon_fano(symbols):
    """symbols: list of (symbol, freq), sorted desc by freq"""
    codes = {s: '' for s, _ in symbols}
    def recurse(group):
        if len(group) <= 1:
            return
        total = sum(f for _, f in group)
        acc, split = 0, 0
        best_diff = float('inf')
        for k in range(len(group) - 1):
            acc += group[k][1]
            diff = abs(total - 2 * acc)
            if diff <= best_diff:
                best_diff = diff
                split = k + 1
        left, right = group[:split], group[split:]
        for s, _ in left:
            codes[s] += '0'
        for s, _ in right:
            codes[s] += '1'
        recurse(left)
        recurse(right)
    recurse(sorted(symbols, key=lambda x: -x[1]))
    return codes`,
    },
    applications: ['历史上曾用于图像压缩', '教学演示前缀码构造', '与霍夫曼编码对比学习'],
  },
  'it-errorcorrect': {
    slug: 'it-errorcorrect',
    name: '纠错编码基础',
    nameEn: 'Error Correcting Codes',
    category: 'itCoding',
    difficulty: '中等',
    fn: errorCorrectSteps,
    viz: 'itErrorCorrect',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    stable: true,
    inPlace: true,
    description: '奇偶校验与汉明 (7,4) 码的编码、检错与纠错过程。',
    intuition: `纠错编码通过在数据中添加冗余校验位，使接收端能够检测甚至纠正传输错误。

**奇偶校验码**：
- 奇/偶校验：在数据末尾追加一位，使 1 的个数为奇/偶
- 能检测奇数个位错误，不能纠正

**汉明码 (7,4)**：Richard Hamming 1950 年提出
- 4 位数据 + 3 位校验位 → 7 位码字
- 校验位放在 2 的幂位置（1, 2, 4），数据位填剩余位置
- 每个校验位覆盖一组特定位置（二进制特征）

**译码过程**：
- 重新计算 3 个校验位，得到校验子（syndrome）
- 校验子的二进制值 = 出错位置（1-indexed，0 表示无错）
- 翻转该位完成纠错

汉明码可以纠正 **1 位**错误、检测 **2 位**错误。码率 = 4/7 ≈ 0.57。`,
    pseudocode: eccPseudo,
    code: {
      python: `def hamming_encode(d):
    """d: 4-bit list [d1, d2, d3, d4]"""
    d1, d2, d3, d4 = d
    r1 = d1 ^ d2 ^ d4
    r2 = d1 ^ d3 ^ d4
    r4 = d2 ^ d3 ^ d4
    return [r1, r2, d1, r4, d2, d3, d4]

def hamming_decode(received):
    """返回 (data, error_pos)；error_pos=0 表示无错"""
    r1, r2, d1, r4, d2, d3, d4 = received
    s1 = r1 ^ d1 ^ d2 ^ d4
    s2 = r2 ^ d1 ^ d3 ^ d4
    s3 = r4 ^ d2 ^ d3 ^ d4
    syndrome = s3 * 4 + s2 * 2 + s1
    corrected = received.copy()
    if syndrome > 0:
        corrected[syndrome - 1] ^= 1
    return [corrected[2], corrected[4], corrected[5], corrected[6]], syndrome`,
    },
    applications: ['DRAM ECC 内存', '卫星通信', 'RAID 存储', 'QR 码数据恢复'],
  },
  'it-datacompression': {
    slug: 'it-datacompression',
    name: '数据压缩与冗余度',
    nameEn: 'Data Compression & Redundancy',
    category: 'itCoding',
    difficulty: '基础',
    fn: dataCompressionSteps,
    viz: 'itDataCompression',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    stable: true,
    inPlace: true,
    description: '定长/变长编码对比、平均码长、编码效率与冗余度。',
    intuition: `数据压缩的本质是利用信源的统计冗余，用更短的码字表示高频符号。

**关键指标**：
- **熵 H(X)**：理论下界——无损压缩不可能低于这个值
- **平均码长 L**：编码后每个符号的平均比特数
- **编码效率 η = H / L**：越接近 1 越好
- **冗余度 ρ = 1 - η**：浪费的编码空间比例

**香农第一定理（信源编码定理）**：
对任意唯一可译码，L ≥ H(X)；存在编码使 H(X) ≤ L < H(X) + 1。

**定长 vs 变长**：
- 定长编码：每个符号 ⌈log n⌉ 比特，简单但对非均匀分布浪费空间
- 变长编码（霍夫曼等）：高频符号用短码字，平均码长接近熵`,
    pseudocode: dcPseudo,
    code: {
      python: `import math

def stats(symbols, codes):
    """symbols: [(s, f)], codes: {s: code_str}"""
    H = -sum(f * math.log2(f) for _, f in symbols if f > 0)
    L = sum(f * len(codes[s]) for s, f in symbols)
    eta = H / L
    rho = 1 - eta
    return {'entropy': H, 'avg_len': L, 'efficiency': eta, 'redundancy': rho}`,
    },
    applications: ['通用压缩算法（zip、7z）', '多媒体编码（JPEG、MP4、MP3）', '基因组数据压缩', '数据库列式存储压缩'],
  },
}

export default IT_ALGORITHMS
