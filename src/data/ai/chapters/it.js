// AI 专业课 · 信息论与编码（it）章节课节数据
// 由模块表 + buildInfoTheoryLesson 生成；从 curriculum.js 原样拆出（2026-06）。
// 2026-07：课节内容改为直接取自算法库（algorithms/it.js 的小白化
// intuition/伪代码/真实代码 + quizzes.js 的 3 题测验），单一数据源——
// 此前 14 个课节共用同一段通用 entropy 代码和同一道通用测验。
import IT_ALGORITHMS from '../../algorithms/it.js'
import { QUIZZES } from '../../quizzes.js'

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
  const algo = IT_ALGORITHMS[id]
  return {
    id,
    title,
    summary,
    algorithmSlug: id,
    // 信息论课节复用算法库的公式/矩阵可视化（自带推导面板），
    // 教学焦点是公式高亮，通用 entropy 示例代码降级为折叠参考。
    displayMode: 'visualFirst',
    theory: buildTheory(title, formula, algo),
    exercise: { type: 'playground', viz: 'infoTheoryBridge' },
    variablesSnapshot: {
      concept: title,
      category,
      formula,
    },
    // 伪代码/代码/测验直接取算法库同名条目（真实的按算法内容），
    // codeStepHighlightLines 不再硬编码——completeAILessonMetadata
    // 会按新代码自动推导默认高亮行。
    pseudocode: algo?.pseudocode,
    code: algo?.code,
    bigO: algo ? {
      time: `最好 ${algo.timeComplexity.best} / 平均 ${algo.timeComplexity.average} / 最坏 ${algo.timeComplexity.worst}`,
      space: algo.spaceComplexity,
      note: '以左侧信息论 playground 的 step 数据为演示口径。',
    } : undefined,
    compare: [
      { method: '公式推导', data: '概率项和对数项', strength: '适合解释熵、互信息、KL 等概念', tradeoff: '需要逐行同步高亮' },
      { method: '矩阵/状态图', data: '转移矩阵和状态节点', strength: '适合信道、马尔可夫和编码过程', tradeoff: '需要保持单元格与动画同步' },
    ],
    quiz: QUIZZES[id],
  }
}

// 课节正文 = 算法库的小白化讲解 + 核心公式;库里没有时退回原一行摘要
function buildTheory(title, formula, algo) {
  const intro = algo?.intuition
    ? algo.intuition
    : `${title}。`
  return `## ${title}

${intro}

### 核心公式

$$${formula}$$

左侧动画展示公式或矩阵的逐步演算，右侧代码行随 step 同步高亮。`
}

export const INFO_THEORY_LESSONS = INFO_THEORY_MODULES.map(buildInfoTheoryLesson)
