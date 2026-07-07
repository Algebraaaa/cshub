// 信息论 学科（14 个模块）
import { selfInfoSteps } from '../../algorithms/it/selfInfo.js'
import { entropySteps } from '../../algorithms/it/entropy.js'
import { jointEntropySteps } from '../../algorithms/it/jointEntropy.js'
import { mutualInfoSteps } from '../../algorithms/it/mutualInfo.js'
import { klDivergenceSteps } from '../../algorithms/it/klDivergence.js'
import { entropyRateSteps } from '../../algorithms/it/entropyRate.js'
import { channelSteps } from '../../algorithms/it/channel.js'
import { channelCapacitySteps } from '../../algorithms/it/channelCapacity.js'
import { markovSourceSteps } from '../../algorithms/it/markovSource.js'
import { markovChannelSteps } from '../../algorithms/it/markovChannel.js'
import { huffmanSteps } from '../../algorithms/it/huffman.js'
import { shannonFanoSteps } from '../../algorithms/it/shannonFano.js'
import { errorCorrectSteps } from '../../algorithms/it/errorCorrect.js'
import { dataCompressionSteps } from '../../algorithms/it/dataCompression.js'

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
    description: '把"这个消息有多让人意外"变成一个可以计算的数字：越意外，信息量越大。',
    intuition: `**先从生活说起**：朋友告诉你"明天太阳会从东边升起"——你完全不会觉得学到了什么，因为这是必然的。但如果他说"明天全城停电"，你会立刻竖起耳朵。**越意外的消息，带给你的"信息"越多**——自信息就是把这种"意外程度"变成一个可以计算的数字。

**怎么算？** 公式是 I(x) = -log₂ p(x)，别被吓到，拆开看只有两个零件：

- **p(x)**：这件事发生的概率（0 到 1 之间的数，越小越罕见）
- **-log₂**：一个"翻译器"，把概率翻译成信息量——概率越小，翻出来的数字越大

**代入几个数试试**：
- 必然发生（p=1）→ I = 0 比特：没有任何意外，零信息
- 抛硬币出正面（p=1/2）→ I = 1 比特：相当于回答一次"是/否"
- 猜中扑克牌花色（p=1/4）→ I = 2 比特：相当于连答两次"是/否"
- 中彩票（p=0.01）→ I ≈ 6.64 比特：非常意外，信息量很大

**为什么偏偏用 log？** 因为它能保证一个非常自然的性质：两件**独立**的事同时发生，总信息量 = 各自信息量相加（概率相乘 → log 变相加）。就像你先猜硬币再猜花色，总共需要 1 + 2 = 3 次"是/否"提问。

**单位**：以 2 为底叫**比特 (bit)**——你可以把"1 比特"理解为"一次是/否提问能消除的不确定性"。`,
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
    description: '衡量"这件事平均有多难猜"：越难猜，熵越大；答案越确定，熵越接近 0。',
    intuition: `**玩个猜谜游戏**：我心里想一个东西，你只能问"是/否"问题。如果我想的是"抛硬币的结果"，你问 1 个问题就够了（"是正面吗？"）。如果是"扑克牌的花色"（4 种等可能），你需要 2 个问题。**信息熵 = 平均需要问多少个"是/否"问题才能猜中答案**——这就是香农 1948 年提出的度量不确定性的方法。

**公式**：H(X) = -Σ p(x) log₂ p(x)，拆开读：

- 对每个可能的结果 x，先算它的自信息 -log₂ p(x)（"这个结果有多意外"）
- 再按概率 p(x) 加权平均——**熵就是"平均意外程度"**

**代入感受一下**：
- 公平硬币（0.5 / 0.5）：H = 1 比特——标准的"猜一次"
- 灌了铅的硬币（0.9 / 0.1）：H ≈ 0.47 比特——十有八九是正面，基本不用猜
- 必然事件（1 / 0）：H = 0——答案已知，无需再问
- 四选一均匀分布：H = 2 比特——要问两轮

**两条最有用的性质（人话版）**：
1. **越平均越难猜**：所有结果等可能时熵最大（n 个取值 → log₂ n 比特）；分布越偏向某个结果，熵越小
2. **熵是压缩的极限**：一段数据的熵是多少比特，无损压缩后平均每个符号最少就要多少比特——zip 再厉害也压不破这条底线

记住一句话：**熵大 = 难猜 = 信息多 = 难压缩**。`,
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
    description: '两个变量一起猜要问几个问题（联合熵）？先告诉你一个，另一个还要问几个（条件熵）？',
    intuition: `**场景**：X 是"今天的天气"（晴/雨），Y 是"小明有没有带伞"。这两件事显然有关联——下雨天小明大概率带伞。信息论用两个量来描述这对变量：

**联合熵 H(X,Y)** —— "把天气和带伞**两件事一起**猜出来，平均要问多少个是/否问题？"
公式：H(X,Y) = -ΣΣ p(x,y) log₂ p(x,y)，就是把每种组合（晴+带伞、雨+没带伞……）的概率代入熵公式。

**条件熵 H(Y|X)** —— "**先告诉你今天的天气**，再猜小明有没有带伞，平均还要问几个问题？"
因为天气提供了线索（下雨→多半带伞），答案变好猜了，所以 H(Y|X) 通常比 H(Y) 小。

**链法则（最重要的一条）**：
H(X,Y) = H(X) + H(Y|X)
翻译成人话：**猜两件事的总代价 = 先猜第一件的代价 + 知道第一件后再猜第二件的代价**。就像点外卖：总价 = 主食价 + 配菜价（配菜可能因为套餐优惠变便宜）。

**两个极端情况帮你校准直觉**：
- X、Y 完全无关（天气和小明的星座）：H(Y|X) = H(Y)——线索毫无帮助，该问几个还是几个
- Y 完全由 X 决定（看见雨就一定带伞）：H(Y|X) = 0——知道天气就知道答案，一个问题都不用问`,
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
      cpp: `#include <cmath>
#include <vector>
using Matrix = std::vector<std::vector<double>>;

// 联合熵 H(X,Y) = -ΣΣ p(x,y) log₂ p(x,y)
double jointEntropy(const Matrix& P) {
    double h = 0.0;
    for (const auto& row : P)
        for (double p : row)
            if (p > 0) h -= p * std::log2(p);
    return h;
}

// 条件熵 H(Y|X) = -ΣΣ p(x,y) log₂ p(y|x)
double conditionalEntropy(const Matrix& P) {
    double h = 0.0;
    for (const auto& row : P) {
        double px = 0.0;                 // 边缘概率 p(x) = 该行求和
        for (double p : row) px += p;
        if (px <= 0) continue;
        for (double pxy : row)
            if (pxy > 0) h -= pxy * std::log2(pxy / px);
    }
    return h;
}`,
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
    description: '知道了 B，能少猜多少 A？——度量两个变量"共享了多少信息"。',
    intuition: `**从一个问题开始**：天气预报说"明天降水概率 80%"，你对明天是否下雨的把握立刻大了很多。**互信息 I(X;Y) 度量的就是：知道 Y（预报）之后，猜 X（实际天气）能省下多少个"是/否"问题**。

**最好记的定义**：
I(X;Y) = H(X) - H(X|Y)
= （原本猜 X 的难度）-（有了线索 Y 之后猜 X 的难度）
= **线索帮你省下的提问次数**

**文氏图是理解它的最好方式**：画两个圆，左圆是 H(X)（X 的全部不确定性），右圆是 H(Y)。两圆**重叠的部分就是互信息**——两个变量共享的那部分信息。由此一眼看出三条性质：

1. **对称**：I(X;Y) = I(Y;X)——重叠部分不分谁先谁后（预报帮你猜天气，天气也帮你反推预报的内容）
2. **非负**：I ≥ 0——线索最差也就是"毫无帮助"（两圆不相交，X、Y 独立），不可能"越听越糊涂"
3. **有上限**：I ≤ min(H(X), H(Y))——重叠部分不可能比任何一个圆还大

**实际用途**（这个概念在机器学习里到处都是）：
- **特征选择**：算每个特征与标签的互信息，挑"最能帮你猜中标签"的特征
- **相关性检测**：相关系数只能发现线性关系，互信息能捕捉**任意形状**的关联`,
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
      cpp: `#include <cmath>
#include <vector>
using Matrix = std::vector<std::vector<double>>;

// 互信息 I(X;Y) = ΣΣ p(x,y) log₂( p(x,y) / (p(x)p(y)) )
double mutualInformation(const Matrix& P) {
    int m = P.size(), n = P[0].size();
    std::vector<double> px(m, 0.0), py(n, 0.0);
    for (int i = 0; i < m; i++)          // 边缘分布：行和 / 列和
        for (int j = 0; j < n; j++) {
            px[i] += P[i][j];
            py[j] += P[i][j];
        }
    double mi = 0.0;
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) {
            double pxy = P[i][j];
            if (pxy > 0 && px[i] > 0 && py[j] > 0)
                mi += pxy * std::log2(pxy / (px[i] * py[j]));
        }
    return mi;                            // 独立时 = 0，关联越强越大
}`,
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
    description: '用"错误的认知"做事要多付多少代价？——度量两个概率分布差多远。',
    intuition: `**先讲一个压缩的故事**：你要给一本英文书设计压缩编码。最优做法是按**真实**的字母频率 P 分配码长（常见字母短码）。但如果你拿错了统计表，按另一份频率 Q 来设计——编码照样能用，只是**平均每个字母要多花一些比特**。**多花的这部分，就是 KL 散度 D(P||Q)**。

D(P||Q) = Σ P(x) log₂( P(x) / Q(x) )
读法：真实分布是 P，你却以为是 Q，为这个"认知偏差"付出的平均额外代价。

**交叉熵**是它的孪生兄弟：
H(P,Q) = H(P) + D(P||Q)
= （本来就要花的底价）+（认知偏差的额外代价）
按错误频率表 Q 编码时，实际的平均总码长。

**三条性质（人话版）**：
1. **不对称**：D(P||Q) ≠ D(Q||P)——"把雨天当晴天"和"把晴天当雨天"的代价不一样，所以它不是普通意义上的"距离"
2. **非负**：D ≥ 0——用错误认知永远不会比用正确认知更省，P=Q 时才为 0
3. **P 有 Q 没有会爆炸**：若某结果真实会发生（P>0）但你认为绝不可能（Q=0），代价是无穷大——"绝不可能"被打脸的代价最惨重

**为什么深度学习总在用交叉熵损失**：分类模型里 P 是真实标签（one-hot），Q 是模型预测的概率。最小化交叉熵 = 最小化 D(P||Q) = **逼着模型的"认知"贴近真实分布**（H(P) 是常数不影响优化）。这就是 softmax + cross-entropy 成为分类标配的原因。`,
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
      cpp: `#include <cmath>
#include <vector>

// KL 散度 D(P||Q) = Σ P(x) log₂( P(x)/Q(x) )
// 读作："真实分布是 P，却按 Q 来编码，平均多付的比特数"
double klDivergence(const std::vector<double>& P,
                    const std::vector<double>& Q) {
    double d = 0.0;
    for (size_t i = 0; i < P.size(); i++)
        if (P[i] > 0 && Q[i] > 0)
            d += P[i] * std::log2(P[i] / Q[i]);
    return d;                             // P==Q 时为 0，永不为负
}

// 交叉熵 H(P,Q) = -Σ P(x) log₂ Q(x) = H(P) + D(P||Q)
double crossEntropy(const std::vector<double>& P,
                    const std::vector<double>& Q) {
    double h = 0.0;
    for (size_t i = 0; i < P.size(); i++)
        if (P[i] > 0 && Q[i] > 0)
            h -= P[i] * std::log2(Q[i]);
    return h;
}`,
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
    description: '一长串符号里，平均每个新符号还能带来多少"新信息"？',
    intuition: `**输入法的联想功能为什么准？** 当你打出"今天天气真"，下一个字几乎必然是"好"或"差"——虽然汉字有几千个，但**在上文的约束下，下一个字的实际不确定性非常小**。熵率度量的正是这个："一串符号平均每个新符号带来多少新信息"。

**为什么不能直接用单字的熵？** 单独看，每个汉字的熵可能有 9~10 比特（几千个可能）。但连成句子后，上下文帮你排除了绝大多数选项。**符号之间的关联会大幅压低"每符号的真实信息量"**——熵率考虑了这种关联，单符号熵没有。

**定义（取极限的原因是要看"长期平均"）**：
H = lim (1/n) H(X₁, …, X_n)
即"前 n 个符号的总不确定性 ÷ n"，当 n 足够大时趋于稳定。

**对马尔可夫信源有现成公式**（下一符号只依赖当前状态时）：
H = Σᵢ πᵢ · H(下一符号 | 当前状态 = i)
读法：在每个状态里各算一次"下一步的熵"，再按长期停留比例 π 加权平均。

**记住对比**：
- 完全无记忆（每个符号独立）：熵率 = 单符号熵
- 有记忆（有上下文关联）：熵率 **<** 单符号熵——关联越强，越好猜
- 香农估计英文的熵率只有约 **1.3 比特/字母**（26 个字母独立时是 4.7）——这就是为什么文本压缩能压掉 70% 以上`,
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
      cpp: `#include <cmath>
#include <vector>
using Matrix = std::vector<std::vector<double>>;

// 平稳马尔可夫链的熵率 H = Σᵢ πᵢ · H(下一状态 | 当前=i)
double entropyRate(const Matrix& P, int iters = 1000) {
    int n = P.size();
    std::vector<double> pi(n, 1.0 / n);   // 幂法求平稳分布 πP = π
    for (int t = 0; t < iters; t++) {
        std::vector<double> nxt(n, 0.0);
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                nxt[j] += pi[i] * P[i][j];
        pi = nxt;
    }
    double H = 0.0;
    for (int i = 0; i < n; i++) {         // 每个状态的"下一步熵"按 π 加权
        double hCond = 0.0;
        for (int j = 0; j < n; j++)
            if (P[i][j] > 0) hCond -= P[i][j] * std::log2(P[i][j]);
        H += pi[i] * hCond;
    }
    return H;
}`,
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
    description: '给"会出错的传话游戏"建模：消息经过嘈杂环境，会被翻转或丢失。',
    intuition: `**信道就是"会出错的传话筒"**：你说 0，对方可能听成 1；你发的比特，可能半路丢了。信息论把这种"不可靠的传输环境"抽象成**信道模型**：输入 X 进去，按一定概率规则变成输出 Y 出来。最经典的两个模型：

**二元对称信道 BSC(p) —— "听错型"**
好比在嘈杂的酒吧里传话：每个比特有 p 的概率被**翻转**（0↔1），1-p 的概率安然无恙。最麻烦的是——**接收方不知道哪个比特被翻转了**，每个收到的比特都可能是错的。

**二元擦除信道 BEC(p) —— "没听清型"**
好比电话信号断断续续：每个比特有 p 的概率**丢失**，接收方收到一个明确的"?"（擦除标记）。虽然也丢信息，但**接收方确切知道哪个位置丢了**。

**哪个更糟糕？** 直觉上"听错"比"没听清"更麻烦——听错了你还信以为真，没听清至少知道要重问。容量公式印证了这一点（p=0.1 时）：
- BSC 容量 C = 1 - H(p) ≈ 0.53 比特/次——错得不明不白，损失过半
- BEC 容量 C = 1 - p = 0.9 比特/次——丢得明明白白，只损失 10%

**"知道自己不知道"本身就是宝贵的信息**——这是比较这两个信道最深刻的启示。`,
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
      cpp: `#include <random>

std::mt19937 rng(std::random_device{}());
std::uniform_real_distribution<double> uni(0.0, 1.0);

// 二元对称信道 BSC(p)：以概率 p 把比特翻转（0↔1）
int bscChannel(int x, double p = 0.1) {
    return uni(rng) < p ? (x ^ 1) : x;
}

// 二元擦除信道 BEC(p)：以概率 p 丢失比特（返回 -1 表示擦除 'e'）
int becChannel(int x, double p = 0.1) {
    return uni(rng) < p ? -1 : x;
}

// 对比要点：BSC 出错"不留痕迹"（收到的都像正常比特），
// BEC 出错"明明白白"（接收方知道哪一位丢了），所以 BEC 容量更高。`,
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
    description: '一条嘈杂的通信线路，理论上每次最多能可靠传多少信息？这个"上限"就是容量。',
    intuition: `**把信道想成一条高速公路**：路况（噪声）决定了它每小时最多能安全通过多少辆车。信道容量 C 就是**这条"信息公路"的极限吞吐量**——无论工程师多聪明，可靠传输的速率都不可能超过 C；但只要低于 C，就总有办法做到几乎不出错。

**香农第二定理（1948 年最震撼的结论）**：
- 传输速率 R < C：**一定存在**某种编码方案，让错误率想多小就多小——哪怕信道很吵！
- 传输速率 R > C：错误率有一个下界，**无论如何编码**都压不下去

在香农之前，人们以为"要更可靠就只能传更慢，要零错误就得无限慢"。香农证明：**低于容量的任何速率都能几乎零错误**——这个定理直接催生了现代通信业。

**容量怎么定义？** C = max I(X;Y)：在所有可能的输入用法中，挑一种让"输出对输入的透露量"（互信息）最大——这个最大值就是容量。

**常见信道的容量（感受一下数字）**：
- BSC(0.1)：C ≈ 0.53——每发 1 比特只有一半真正"到账"
- BEC(0.1)：C = 0.9——丢失明确可知，只损失 10%
- 你家 WiFi 遵循的公式 C = (1/2)log₂(1+SNR)：信号越强（SNR 大），容量越高

**Blahut-Arimoto 算法**：容量的定义是个"挑最优输入分布"的优化问题，一般信道没有现成公式。该算法像"左右脚交替上台阶"：固定输入分布算输出 → 根据输出反推更好的输入分布 → 反复迭代，逐步爬到容量最大值。本页动画演示的就是这个过程。`,
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
      cpp: `#include <cmath>
#include <vector>
using Matrix = std::vector<std::vector<double>>;

// Blahut-Arimoto：交替优化，逐步逼近信道容量 C = max I(X;Y)
double blahutArimoto(const Matrix& P, int iters = 100) {
    int m = P.size(), n = P[0].size();
    std::vector<double> q(m, 1.0 / m);    // 输入分布，从均匀开始
    double I = 0.0;
    for (int t = 0; t < iters; t++) {
        std::vector<double> r(n, 0.0);    // 输出分布 r(y) = Σ q(x)P(y|x)
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) r[j] += q[i] * P[i][j];
        I = 0.0;                          // 当前互信息
        std::vector<double> qNew(m, 0.0);
        for (int i = 0; i < m; i++) {
            double s = 0.0;
            for (int j = 0; j < n; j++)
                if (P[i][j] > 0 && r[j] > 0) {
                    double t2 = P[i][j] * std::log2(P[i][j] / r[j]);
                    I += q[i] * t2;
                    s += t2;
                }
            qNew[i] = std::pow(2.0, s);   // 好用的输入方向权重更大
        }
        double sum = 0.0;
        for (double v : qNew) sum += v;
        for (int i = 0; i < m; i++) q[i] = qNew[i] / sum;
    }
    return I;                             // 收敛到容量 C
}`,
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
    description: '"明天的天气只看今天"——一种只记得当前状态、不追究历史的随机过程。',
    intuition: `**用天气来理解**：假设天气只有"晴"和"雨"两种，且**明天的天气只取决于今天**——晴天后 80% 还是晴，雨天后 60% 继续雨。至于前天、大前天是什么天气？一概不影响。这种"只看当前、不问历史"的性质叫**无后效性（马尔可夫性）**，满足它的随机过程就是马尔可夫链。

**转移矩阵——把规则写成表格**：
P[i][j] = 从状态 i 一步跳到状态 j 的概率。上面的天气就是一个 2×2 表：
晴→晴 0.8，晴→雨 0.2；雨→晴 0.4，雨→雨 0.6。每一行加起来必须等于 1（明天总得是某种天气）。

**平稳分布 π——运行很久之后的"长期占比"**：
让这个天气系统跑一万天，统计晴天占比——你会发现它收敛到一个固定值（本例约 67% 晴），**而且跟第一天是晴是雨毫无关系**。这个长期占比就是平稳分布，满足 π P = π："再走一步，分布不变"。

**怎么求 π？** 最直观的是**幂法**：随便猜一个初始分布，反复乘转移矩阵 πP、πP²、πP³……直到数字不再变化。动画里可以看到分布一步步"稳定下来"的过程。

**为什么信息论关心它**：真实信源（文字、语音）的符号都有上下文关联，马尔可夫链是刻画这种关联最简单的模型——知道了转移矩阵和平稳分布，就能算出信源的**熵率**，进而知道它能被压缩到多小。PageRank 给网页排名用的也是同一套数学：把"随机点链接的网民"建成马尔可夫链，平稳分布就是网页的重要性得分。`,
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
      cpp: `#include <random>
#include <vector>
using Matrix = std::vector<std::vector<double>>;

// 幂法求平稳分布：反复 π ← πP，直到分布不再变化
std::vector<double> markovStationary(const Matrix& P, int iters = 1000) {
    int n = P.size();
    std::vector<double> pi(n, 1.0 / n);
    for (int t = 0; t < iters; t++) {
        std::vector<double> nxt(n, 0.0);
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                nxt[j] += pi[i] * P[i][j];
        pi = nxt;
    }
    return pi;                            // 长期访问频率，与初始状态无关
}

// 模拟状态游走：按当前行的概率分布随机选下一状态
std::vector<int> simulateMarkov(const Matrix& P, int start, int steps) {
    std::mt19937 rng(std::random_device{}());
    std::vector<int> trace = {start};
    int state = start;
    for (int t = 0; t < steps; t++) {
        std::discrete_distribution<int> next(P[state].begin(), P[state].end());
        state = next(rng);
        trace.push_back(state);
    }
    return trace;
}`,
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
    description: '信号时好时坏的传输环境：地铁进隧道、WiFi 被遮挡——信道本身也在"变天"。',
    intuition: `**坐地铁打电话的体验**：平路上信号很好，几乎不丢字；一进隧道，连续好几秒全是杂音；出了隧道又恢复。**信道的"好坏"本身像天气一样随时间变化**——这就是马尔可夫信道，比"每个比特独立出错"的简单模型（BSC）真实得多。

**模型分两层**：
1. **信道自己有状态**：状态 S 按马尔可夫链演化（好→好、好→坏、坏→坏、坏→好各有概率）——这就是"信道的天气系统"
2. **出错率看状态脸色**：每个比特是否出错，取决于**当前时刻**信道处于什么状态

**最经典的例子——Gilbert-Elliott 信道**（本页动画演示的模型）：
- 只有两个状态：**好 (G)**（错误率如 5%）和 **坏 (B)**（错误率如 50%）
- 状态有"惯性"：好状态倾向保持好，坏状态也会持续一阵——正如隧道不会一闪而过

**关键后果：错误是"突发"的**
简单信道里错误均匀散落；马尔可夫信道里错误**扎堆出现**（坏状态期间一大片全错）。这对纠错编码是大麻烦——大多数纠错码擅长修散落的单个错误，架不住连片轰炸。

**工程解法：交织 (interleaving)**
发送前把数据顺序打乱，接收后再复原——突发的连片错误被"摊薄"成散落的单个错误，纠错码就能正常工作了。手机通信、CD、卫星链路全都在用这一招。`,
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
      cpp: `#include <random>

// Gilbert-Elliott 信道：信道状态在"好/坏"间马尔可夫切换，
// 好状态错误率低（默认 5%），坏状态错误率高（默认 50%）
class GilbertElliott {
    double S[2][2];                       // 状态转移矩阵
    double pe[2];                         // 各状态的比特错误率
    int state = 0;                        // 0=好, 1=坏
    std::mt19937 rng{std::random_device{}()};
    std::uniform_real_distribution<double> uni{0.0, 1.0};
public:
    GilbertElliott(double sGG, double sBB,
                   double pGood = 0.05, double pBad = 0.5)
        : S{{sGG, 1 - sGG}, {1 - sBB, sBB}}, pe{pGood, pBad} {}

    int transmit(int x) {
        int y = uni(rng) < pe[state] ? (x ^ 1) : x;  // 按当前状态出错
        state = uni(rng) < S[state][0] ? 0 : 1;      // 信道自己"变天"
        return y;
    }
};`,
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
    description: '像摩尔斯电码一样"常用的字给短编码"，而且能证明这样编是最省的。',
    intuition: `**摩尔斯电码的智慧**：电报员早就发现，把最常用的字母 E 编成最短的"一个点"，罕见的 Q 编成长长的"划划点划"，整体拍发速度快得多。霍夫曼编码（1952 年）把这个"**常用的给短码**"的直觉变成了一个算法，并且**数学上证明了它编出来的码是所有方案里平均最短的**。

**算法本身像一场"配对合并"游戏**：
1. 把每个符号连同它的出现次数当作一个小队伍
2. **每轮挑出人数最少的两个队伍，合并成一队**（人数相加），重新排队
3. 反复合并，直到只剩一个大队伍——合并的过程自然长成一棵树
4. 从树根走到每个符号：向左记 0，向右记 1——路径就是它的编码

**为什么"总挑最小的两个合并"就最优？** 合并得越早，在树里的位置越深，编码越长。让**最少见的符号最早合并**（被压到最深处、拿最长的码），常见符号留在浅层拿短码——直觉和最优性在这里完美重合。

**前缀码：为什么解码不会歧义？** 所有符号都在树的**叶子**上，任何编码都不可能是另一个编码的开头。解码时从左到右读比特、沿树往下走，一到叶子就输出一个符号、跳回树根——**不需要任何分隔符**。

**它就在你身边**：ZIP 压缩包、JPEG 图片、MP3 音乐的最后一道工序都是霍夫曼编码。你每天都在用一个 70 年前的本科生课程作业（Huffman 当年为了免考期末交的论文）。`,
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
      cpp: `#include <queue>
#include <string>
#include <unordered_map>
#include <vector>

struct Node {
    long long freq;
    char sym;                             // 叶子才有符号
    Node *left = nullptr, *right = nullptr;
};
struct Cmp { bool operator()(Node* a, Node* b) { return a->freq > b->freq; } };

// 每轮取频率最小的两个节点合并，长成霍夫曼树
Node* buildHuffman(const std::unordered_map<char, long long>& freqs) {
    std::priority_queue<Node*, std::vector<Node*>, Cmp> pq;
    for (auto& [s, f] : freqs) pq.push(new Node{f, s});
    while (pq.size() > 1) {
        Node* a = pq.top(); pq.pop();
        Node* b = pq.top(); pq.pop();
        pq.push(new Node{a->freq + b->freq, 0, a, b});
    }
    return pq.top();
}

// 从根到叶子的路径就是编码：向左记 0，向右记 1
void assignCodes(Node* node, std::string path,
                 std::unordered_map<char, std::string>& codes) {
    if (!node) return;
    if (!node->left && !node->right) { codes[node->sym] = path; return; }
    assignCodes(node->left,  path + "0", codes);
    assignCodes(node->right, path + "1", codes);
}`,
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
    description: '把符号按出现频率"对半分堆"，一堆记 0 一堆记 1，递归分下去就得到编码。',
    intuition: `**一个分堆游戏**：把所有符号按出现频率从高到低排成一列，然后从中间切一刀——让**上下两堆的总频率尽量接近一半对一半**。上堆的符号编码添个"0"，下堆添个"1"。再对每堆重复同样的切分，直到每堆只剩一个符号。这就是香农-费诺编码的全部。

**为什么要"对半分"？** 回想二十个问题游戏（20 Questions）的诀窍：每个问题都要尽量把可能性砍掉一半，这样问得最少。这里每个比特就是一个"是/否问题"——对半分堆让每个比特都发挥最大的区分作用，高频符号自然会更早"分到只剩自己"，拿到更短的编码。

**它是霍夫曼编码的"前辈"**，两者方向恰好相反：
- 香农-费诺：**自顶向下**切分（先分大堆，再分小堆）
- 霍夫曼：**自底向上**合并（先合并最小的，逐步长成树）

**为什么前辈输给了后辈？** 自顶向下的每一刀只看"当前这一刀最平均"，无法预见后续切分的整体效果——某些频率组合下会多用比特。霍夫曼的自底向上合并可以**数学证明恒为最优**。这也是算法设计里一个经典教训：同样是贪心，贪的方向不同，一个碰巧全局最优，一个只是"还不错"。

**为什么还值得学？** 它是理解前缀码的最佳入门：分堆的过程直接展示了"编码=在树上走路径"的本质,而且"每一步尽量对半分"正是熵（平均需要几个是/否问题）这一概念的算法化身。`,
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
      cpp: `#include <algorithm>
#include <climits>
#include <cmath>
#include <string>
#include <unordered_map>
#include <vector>
using SymList = std::vector<std::pair<char, long long>>;

// 递归分堆：找一刀让上下两堆总频率最接近，上堆添 0 下堆添 1
void shannonFano(SymList group,
                 std::unordered_map<char, std::string>& codes) {
    if (group.size() <= 1) return;
    long long total = 0;
    for (auto& [s, f] : group) total += f;
    long long acc = 0, bestDiff = LLONG_MAX;
    size_t split = 1;
    for (size_t k = 0; k + 1 < group.size(); k++) {
        acc += group[k].second;
        long long diff = std::llabs(total - 2 * acc);
        if (diff <= bestDiff) { bestDiff = diff; split = k + 1; }
    }
    SymList left(group.begin(), group.begin() + split);
    SymList right(group.begin() + split, group.end());
    for (auto& [s, f] : left)  codes[s] += '0';
    for (auto& [s, f] : right) codes[s] += '1';
    shannonFano(left, codes);
    shannonFano(right, codes);
}
// 调用前先按频率降序排序 group（高频在上，先拿到短码）`,
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
    description: '多带几位"验证码"，收到的数据错了不仅能发现，还能自动改回来。',
    intuition: `**生活中你已经在用它**：身份证最后一位是校验码——录入时错一个数字，系统立刻报错。快递单号、银行卡号也一样。**在数据里额外附带几位"根据内容算出来的验证位"，收到后重算一遍对不对得上**,这就是检错；而汉明码更进一步——不但知道错了，还知道**错在哪一位**，直接改回来。

**第一层：奇偶校验（只能发现，不能修复）**
发送 4 位数据前，数一数里面有几个 1，追加一位让 1 的总数凑成偶数。接收方再数一遍：是奇数？肯定错了一位。但**不知道错在哪**，只能要求重发。

**第二层：汉明码 (7,4)——错哪一位都能"定位"**（1950 年，Hamming 因为受够了计算机每逢周末出错停机而发明）
4 位数据配上 3 位校验位，凑成 7 位。妙处在于布局：**校验位放在 1、2、4 号位置**（都是 2 的幂），每个校验位负责"抽查"一组特定位置。

**定位错误就像三个证人指认**：接收方重算 3 个校验位，得到 3 个"对/错"结果（叫校验子）：
- 三个全对 → 没有错误
- 有错时，把三个结果当作二进制数读出来，**这个数字直接就是出错位置**！比如校验子 = 101₂ = 5，那就是第 5 位错了，翻转它即可

这个"校验子=错误地址"的设计是编码理论最优雅的构造之一。

**代价与极限**：多传 3 位换来"纠 1 位错、发现 2 位错"的能力，有效数据占 4/7 ≈ 57%。你电脑里的 **ECC 内存**、太空探测器的通信、二维码的破损恢复,用的都是这一思想的升级版。`,
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
      cpp: `#include <array>

// 汉明 (7,4)：4 位数据 + 3 位校验 → 7 位码字
// 校验位放在 1/2/4 号位（2 的幂），各自"抽查"一组位置
std::array<int, 7> hammingEncode(const std::array<int, 4>& d) {
    int d1 = d[0], d2 = d[1], d3 = d[2], d4 = d[3];
    int r1 = d1 ^ d2 ^ d4;
    int r2 = d1 ^ d3 ^ d4;
    int r4 = d2 ^ d3 ^ d4;
    return {r1, r2, d1, r4, d2, d3, d4};
}

// 译码：重算校验位得到"校验子"，其二进制值直接就是出错位置
std::pair<std::array<int, 4>, int>
hammingDecode(std::array<int, 7> rx) {
    int s1 = rx[0] ^ rx[2] ^ rx[4] ^ rx[6];
    int s2 = rx[1] ^ rx[2] ^ rx[5] ^ rx[6];
    int s3 = rx[3] ^ rx[4] ^ rx[5] ^ rx[6];
    int syndrome = s3 * 4 + s2 * 2 + s1;  // 0 = 无错，否则 = 错误位号
    if (syndrome > 0) rx[syndrome - 1] ^= 1;   // 翻转出错位完成纠错
    return {{rx[2], rx[4], rx[5], rx[6]}, syndrome};
}`,
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
    description: '为什么文件能被压小？压到多小是极限？——压缩的原理和它的"物理底线"。',
    intuition: `**为什么聊天时你打"yyds"而不是完整的四个词？** 因为常说的话值得起一个短代号。数据压缩的全部原理就是这一句：**出现越频繁的内容，越值得分配短编码**。反过来，把所有符号一视同仁（定长编码）就是在浪费——给"的"和"魑"同样长的编码，可"的"出现的次数是"魑"的百万倍。

**用三个指标衡量一套编码好不好**：
- **平均码长 L**：编码后平均每个符号占多少比特——越短越好
- **熵 H(X)**：这个信源理论上的"最短极限"（还记得吗：熵 = 平均信息量）
- **效率 η = H / L**：实际达到了极限的百分之几；**冗余度 ρ = 1 - η** 就是还在浪费的比例

**香农第一定理——压缩的"物理底线"**（1948）：
**任何**无损编码的平均码长都不可能低于熵：L ≥ H(X)。同时,总能设计出 L < H(X) + 1 的编码。
翻译成人话：**熵就是无损压缩的地板**——zip、7z、任何天才算法都不可能突破；但优秀的算法（如霍夫曼、算术编码）可以把地板几乎贴平。

**一个具体对比**（本页动画演示）：4 个符号,频率 0.5 / 0.25 / 0.125 / 0.125：
- 定长编码：每个符号 2 比特,平均 L = 2
- 霍夫曼编码：频率高的用 1 比特,平均 L = 1.75 = 熵 H——**效率 100%，一点不浪费**

**那有损压缩呢？** JPEG、MP3 能压得更狠,是因为它们**扔掉了**人眼/人耳注意不到的信息——那是另一套理论（率失真理论）。无损压缩的世界里,熵就是不可逾越的底线。`,
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
      cpp: `#include <cmath>
#include <string>
#include <unordered_map>
#include <vector>

struct CodeStats {
    double entropy;     // 熵 H：无损压缩的理论地板
    double avgLen;      // 平均码长 L：实际每符号花费
    double efficiency;  // 效率 η = H / L，越接近 1 越好
    double redundancy;  // 冗余度 ρ = 1 - η，浪费的比例
};

CodeStats stats(const std::vector<std::pair<char, double>>& symbols,
                const std::unordered_map<char, std::string>& codes) {
    double H = 0.0, L = 0.0;
    for (auto& [s, f] : symbols) {
        if (f > 0) H -= f * std::log2(f);
        L += f * codes.at(s).size();
    }
    return {H, L, H / L, 1 - H / L};
}`,
    },
    applications: ['通用压缩算法（zip、7z）', '多媒体编码（JPEG、MP4、MP3）', '基因组数据压缩', '数据库列式存储压缩'],
  },
}

export default IT_ALGORITHMS
