// AI 专业课 · 信息论与编码（it）章节课节数据
// 由模块表 + buildInfoTheoryLesson 生成；从 curriculum.js 原样拆出（2026-06）。
const INFO_THEORY_MODULES = [
  ['it-selfinfo', '自信息与信息量', '概率越小，信息量越大', 'I(x) = -log2 p(x)', 'itFundamental'],
  ['it-entropy', '信息熵 Entropy', '离散分布的平均不确定性', 'H(X) = -Σ p(x) log2 p(x)', 'itFundamental'],
  ['it-joint-conditional', '联合熵与条件熵', '联合概率表上的 H(X,Y) 与 H(Y|X)', 'H(Y|X) = H(X,Y) - H(X)', 'itFundamental'],
  ['it-mutual', '互信息 Mutual Information', '两个随机变量共享的信息量', 'I(X;Y) = Σ p(x,y) log p(x,y)/(p(x)p(y))', 'itFundamental'],
  ['it-kl-crossentropy', 'KL 散度与交叉熵', '两个概率分布的差异与分类损失', 'D_KL(P||Q) = Σ P(x) log(P(x)/Q(x))', 'itFundamental'],
  ['it-entropyrate', '熵率 Entropy Rate', '随机过程单位时间的不确定性', 'H_rate = Σ_i π_i H(P_i)', 'itFundamental'],
  ['it-channel', '信道模型 BSC/BEC', '转移概率、噪声和输出符号', 'P(Y|X)', 'itChannel'],
  ['it-channelcapacity', '信道容量', '最大化输入分布下的互信息', 'C = max_p(x) I(X;Y)', 'itChannel'],
  ['it-markov-source', '马尔可夫信源', '状态图、转移矩阵与平稳分布', 'π_{t+1} = π_t P', 'itMarkov'],
  ['it-markov-channel', '马尔可夫信道', '信道状态随时间变化的输入输出过程', 'P(y,s_{t+1}|x,s_t)', 'itMarkov'],
  ['it-huffman', '霍夫曼编码', '频率统计、节点合并和最优前缀码', 'L_avg = Σ p_i l_i', 'itCoding'],
  ['it-shannonfano', '香农-费诺编码', '概率排序、递归划分和码字分配', 'l_i = ceil(-log2 p_i)', 'itCoding'],
  ['it-errorcorrect', '纠错编码基础', '校验、定位错误和纠错', 'syndrome = H r^T', 'itCoding'],
  ['it-datacompression', '数据压缩与冗余度', '平均码长、编码效率与冗余', 'η = H(X) / L_avg', 'itCoding'],
]

function buildInfoTheoryLesson([id, title, summary, formula, category]) {
  return {
    id,
    title,
    summary,
    algorithmSlug: id,
    // 信息论课节复用算法库的公式/矩阵可视化（自带推导面板），
    // 教学焦点是公式高亮，通用 entropy 示例代码降级为折叠参考。
    displayMode: 'visualFirst',
    theory: `## ${title}

${summary}。

### 核心公式

$$${formula}$$

本课节复用 CSHub 信息论可视化模块，左侧展示动画、公式或矩阵演算，右侧代码行随 step 同步高亮。`,
    exercise: { type: 'playground', viz: 'infoTheoryBridge' },
    variablesSnapshot: {
      concept: title,
      category,
      formula,
    },
    pseudocode: `procedure INFORMATION_THEORY_STEP(input)
    normalize probability model
    select current derivation term
    highlight formula line and probability cell
    update partial result
    return current visualization state`,
    code: {
      python: `import math

def safe_log2(x):
    return 0.0 if x <= 0 else math.log2(x)

def entropy(probabilities):
    total = 0.0
    for p in probabilities:
        if p > 0:
            total += -p * safe_log2(p)
    return total

def information_theory_step(model):
    probabilities = model.current_distribution()
    value = entropy(probabilities)
    return value`,
      cpp: `#include <cmath>
#include <vector>

double safe_log2(double x) {
    return x <= 0.0 ? 0.0 : std::log2(x);
}

double entropy(const std::vector<double>& probabilities) {
    double total = 0.0;
    for (double p : probabilities) {
        if (p > 0.0) {
            total += -p * safe_log2(p);
        }
    }
    return total;
}

double informationTheoryStep(Model& model) {
    auto probabilities = model.currentDistribution();
    return entropy(probabilities);
}`,
    },
    codeStepHighlightLines: {
      python: [6, 7, 8, 9, 10, 13, 14, 15],
      cpp: [8, 9, 10, 11, 12, 18, 19],
    },
    bigO: {
      time: '公式类通常按概率项线性扫描；矩阵/概率表模块按表格大小或状态数逐步演示。',
      space: '主要保存概率分布、矩阵、当前 step 和可视化状态，通常为 O(n) 到 O(n^2)。',
      note: '实际复杂度以左侧具体信息论 playground 的 step 数据为准。',
    },
    compare: [
      { method: '公式推导', data: '概率项和对数项', strength: '适合解释熵、互信息、KL 等概念', tradeoff: '需要逐行同步高亮' },
      { method: '矩阵/状态图', data: '转移矩阵和状态节点', strength: '适合信道、马尔可夫和编码过程', tradeoff: '需要保持单元格与动画同步' },
    ],
    quiz: [
      {
        q: '信息论可视化中最重要的同步关系是什么？',
        options: [
          '当前动画 step 与公式行、矩阵单元格或代码行一致',
          '只显示最终数值',
          '隐藏概率模型',
          '跳过中间推导',
        ],
        answer: 0,
        explanation: '信息论教学的重点是让每一项概率、求和、对数和矩阵单元都能与动画步骤对应。',
      },
    ],
  }
}

export const INFO_THEORY_LESSONS = INFO_THEORY_MODULES.map(buildInfoTheoryLesson)
