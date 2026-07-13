// AI 专业课 · 自然语言处理（nlp）章节课节数据
// 从 curriculum.js 原样拆出（2026-06）。补全/注入逻辑（AI_COMPLETION_DEFAULTS、
// LATE_COURSE_CODE、completeAILessonMetadata）仍在 ../curriculum.js，
// 模块加载时会原位向这些 lesson 对象补字段。
export const NLP_LESSONS = [
        {
          id: 'nlp-word-embedding',
          title: '词嵌入',
          summary: 'Word2Vec、GloVe、词向量空间',
          theory: `## 词嵌入

将离散的词语映射为连续的低维向量空间，是现代 NLP 的基石。

### 为什么需要词嵌入？

传统 one-hot 编码将每个词表示为一个巨大的稀疏向量（维度=词表大小），无法表达词与词之间的语义关系。词嵌入通过无监督或自监督方式，将词映射到稠密的低维向量空间（通常 50-300 维）。

### 词向量的神奇性质

$$vec("King") - vec("Man") + vec("Woman") \\approx vec("Queen")$$

向量空间中的方向对应语义关系：性别、时态、国家-首都等关系都可以通过向量加减法来捕捉。

### 主要方法

| 方法 | 核心思想 | 训练方式 |
|------|---------|---------|
| Word2Vec | 局部上下文窗口预测 | 神经网络（浅层） |
| GloVe | 全局共现统计 | 加权最小二乘 |
| FastText | 子词（subword）信息 | 类似 Word2Vec |

### 词向量的评估

- **内在评估**: 词类比任务（King-Man+Woman=?）、相似度打分
- **外在评估**: 将词向量作为下游任务的输入特征，看效果提升
`,
          exercise: { type: 'playground', viz: 'wordEmbedding' },
          code: {
            cpp: `#include <vector>
#include <map>
#include <string>
using Embedding = std::vector<double>;
using EmbeddingMatrix = std::vector<Embedding>;

// 简单的词向量查询
Embedding get_embedding(const EmbeddingMatrix& matrix,
                        const std::map<std::string, int>& vocab,
                        const std::string& word) {
    auto it = vocab.find(word);
    if (it != vocab.end()) return matrix[it->second];
    return Embedding(matrix[0].size(), 0.0);  // OOV 返回零向量
}

// 词向量运算：King - Man + Woman
Embedding analogy(const Embedding& king, const Embedding& man,
                  const Embedding& woman) {
    Embedding result(king.size());
    for (int i = 0; i < king.size(); i++) {
        result[i] = king[i] - man[i] + woman[i];
    }
    return result;
}`,
            python: `import numpy as np

def analogy(king, man, woman):
    """King - Man + Woman ≈ Queen"""
    return king - man + woman

# 余弦相似度查找最近邻
def find_closest(query_vector, embeddings, vocab, top_k=5):
    similarities = embeddings @ query_vector / (
        np.linalg.norm(embeddings, axis=1) * np.linalg.norm(query_vector) + 1e-8
    )
    top_indices = np.argsort(similarities)[-top_k:][::-1]
    return [(vocab[i], similarities[i]) for i in top_indices]`
          },
          variablesSnapshot: {
            method: 'Word2Vec',
            dimension: '100',
            vocabSize: '10000',
            windowSize: '5',
          },
          pseudocode: `procedure WORD_EMBEDDING_LOOKUP(word, matrix, vocab)
    if word in vocab then
        return matrix[vocab[word]]
    else
        return zero_vector  // OOV 处理
    end if

procedure ANALOGY(king, man, woman)
    return king - man + woman`,
          bigO: {
            time: '查表操作为 O(d)，其中 d 是词向量维度。词类比计算为 O(d)。',
            space: '存储整个嵌入矩阵需要 O(V × d)，V 是词表大小。',
            note: '大规模预训练嵌入（如 GloVe 840B）需要数 GB 存储空间，通常需要内存映射或降采样。',
          },
          compare: [
            { method: 'Word2Vec', data: '局部上下文窗口', strength: '捕捉细粒度语义关系', tradeoff: '忽略全局统计信息' },
            { method: 'GloVe', data: '全局共现矩阵', strength: '融合全局统计和局部上下文', tradeoff: '训练数据需求更大' },
            { method: 'One-hot', data: '无', strength: '简单，无需训练', tradeoff: '高维稀疏，无语义信息' },
          ],
          quiz: [
            {
              q: '词向量空间中 vec(King) - vec(Man) + vec(Woman) ≈ vec(Queen) 说明了什么？',
              options: [
                '词向量编码了语义关系，可以通过代数运算推理',
                'King 和 Queen 是同一个词的不同拼写',
                '所有词向量的距离都是相等的',
                'Man 和 Woman 的向量完全相同',
              ],
              answer: 0,
              explanation: '这个经典的词类比例子说明词向量空间中的方向对应语义关系，性别关系、国家-首都关系等都可以通过向量加减法来捕捉。',
            },
          ],
        },
        {
          id: 'nlp-tokenization',
          title: '分词与子词编码',
          summary: 'Word、Subword（BPE）、Character tokenization',
          theory: `## 分词（Tokenization）

分词是 NLP 的第一步，将原始文本切分成模型可以处理的 token 序列。

### 三种主要粒度

| 粒度 | 说明 | 优点 | 缺点 |
|------|------|------|------|
| Word | 按词切分 | 语义完整 | OOV 问题，词表巨大 |
| Subword | 子词（BPE/WordPiece） | 平衡 OOV 和语义 | 切分规则复杂 |
| Character | 按字符切分 | 无 OOV，词表极小 | 序列过长，语义弱 |

### BPE（Byte Pair Encoding）

BPE 是最常用的子词分词算法，通过迭代合并最高频的字节对来构建词表：

1. 初始化词表为所有单个字符
2. 统计所有相邻 token 对的频率
3. 合并频率最高的 token 对
4. 重复 2-3 直到达到目标词表大小

### 示例

"unbelievable" 可能被切分为：["un", "believ", "able"]

这种切分方式既能处理常见词（整体保留），又能将罕见词拆分为已知的子词单元。

### 现代实践

- **BERT**: 使用 WordPiece（类似 BPE，基于似然合并）
- **GPT-2/3**: 使用 BPE
- **LLaMA**: 使用 SentencePiece（BPE 变体，支持多语言）
- **T5**: 使用 SentencePiece
`,
          exercise: { type: 'playground', viz: 'wordEmbedding' },
          code: {
            cpp: `#include <string>
#include <vector>
#include <map>
#include <algorithm>

// BPE 合并操作
struct BPEMerge {
    std::string first, second, merged;
};

std::vector<std::string> bpe_tokenize(
    const std::string& word,
    const std::vector<BPEMerge>& merges) {
    // 初始化为字符级
    std::vector<std::string> tokens;
    for (char c : word) tokens.push_back(std::string(1, c));

    // 反复应用合并规则
    bool changed = true;
    while (changed) {
        changed = false;
        for (int i = 0; i < (int)tokens.size() - 1; i++) {
            for (const auto& m : merges) {
                if (tokens[i] == m.first && tokens[i+1] == m.second) {
                    tokens[i] = m.merged;
                    tokens.erase(tokens.begin() + i + 1);
                    changed = true;
                    break;
                }
            }
        }
    }
    return tokens;
}`,
            python: `def bpe_tokenize(word, merges):
    """BPE 分词：将词拆分为子词单元"""
    # 初始化为字符列表
    tokens = list(word)

    # 反复应用合并规则
    changed = True
    while changed:
        changed = False
        i = 0
        while i < len(tokens) - 1:
            pair = (tokens[i], tokens[i + 1])
            if pair in merges:
                tokens[i] = ''.join(pair)
                del tokens[i + 1]
                changed = True
            else:
                i += 1
    return tokens

# 示例：学习 BPE 合并规则
def learn_bpe(corpus, num_merges):
    vocab = {' '.join(word): freq for word, freq in corpus.items()}
    merges = {}
    for _ in range(num_merges):
        pairs = {}
        for word, freq in vocab.items():
            symbols = word.split()
            for i in range(len(symbols) - 1):
                pairs[(symbols[i], symbols[i+1])] = \
                    pairs.get((symbols[i], symbols[i+1]), 0) + freq
        if not pairs:
            break
        best = max(pairs, key=pairs.get)
        merges[best] = ''.join(best)
        # 更新词表...
    return merges`
          },
          variablesSnapshot: {
            granularity: 'Subword (BPE)',
            vocabSize: '32000',
            maxSeqLen: '512',
          },
          pseudocode: `procedure BPE_LEARN(corpus, num_merges)
    vocab <- initialize_with_characters(corpus)
    for i <- 1 to num_merges do
        pairs <- count_all_adjacent_pairs(vocab)
        best_pair <- argmax(pairs)
        merge best_pair in vocab
        record merge rule
    end for
    return merges

procedure BPE_TOKENIZE(word, merges)
    tokens <- split_into_characters(word)
    repeat
        for each adjacent pair in tokens do
            if pair in merges then
                merge them
            end if
        end for
    until no more merges apply
    return tokens`,
          bigO: {
            time: 'BPE 学习阶段需要 O(N × M)，其中 N 是语料库大小，M 是合并次数。分词阶段为 O(L × K)，L 是词长，K 是合并规则数。',
            space: '存储合并规则需要 O(V)，V 是词表大小。分词时的中间状态为 O(L)。',
            note: '实际使用中，预训练的 BPE 分词器非常快，因为合并规则是离线学习好的。',
          },
          compare: [
            { method: 'Word tokenization', data: '空格/标点', strength: '语义完整，序列短', tradeoff: 'OOV 问题，词表巨大' },
            { method: 'Subword (BPE)', data: '子词单元', strength: '平衡 OOV 和序列长度', tradeoff: '需要学习合并规则' },
            { method: 'Character', data: '单个字符', strength: '无 OOV，词表极小', tradeoff: '序列过长，语义弱' },
          ],
          quiz: [
            {
              q: 'BPE（Byte Pair Encoding）分词的核心思想是什么？',
              options: [
                '按空格分割文本',
                '迭代合并最高频的相邻 token 对，构建子词词表',
                '随机选择字符组合',
                '只保留词表中出现的完整词',
              ],
              answer: 1,
              explanation: 'BPE 从字符级开始，迭代合并频率最高的相邻 token 对，直到达到目标词表大小。这样既能处理常见词（整体保留），又能将罕见词拆分为已知子词。',
            },
          ],
        },
        {
          id: 'nlp-word2vec',
          title: 'Word2Vec 训练',
          summary: 'CBOW vs Skip-gram、负采样',
          theory: `## Word2Vec

Word2Vec 是 Google 在 2013 年提出的词向量训练方法，通过浅层神经网络学习词的分布式表示。

### 两种架构

| 架构 | 输入 | 输出 | 适用场景 |
|------|------|------|---------|
| CBOW | 上下文词 | 中心词 | 小型语料，高频词效果好 |
| Skip-gram | 中心词 | 上下文词 | 大型语料，低频词效果好 |

### CBOW（Continuous Bag-of-Words）

用上下文词的平均向量来预测中心词：

$$P(w_t | w_{t-k}, ..., w_{t-1}, w_{t+1}, ..., w_{t+k})$$

### Skip-gram

用中心词来预测上下文词：

$$P(w_{t+j} | w_t), \\quad j \\in \\{-k, ..., -1, 1, ..., k\\}$$

### 负采样（Negative Sampling）

原始 softmax 计算代价太高，负采样将多分类问题转化为二分类问题：

$$L = -\\log \\sigma(v_{w_O}^T v_{w_I}) - \\sum_{i=1}^{k} \\log \\sigma(-v_{w_i}^T v_{w_I})$$

其中 $w_O$ 是正样本，$w_i$ 是从噪声分布中采样的负样本。

### 训练目标

最大化正样本的共现概率，最小化负样本的共现概率。最终得到的权重矩阵就是词向量。

### 超参数

- **窗口大小**: 通常 5-10
- **负样本数**: 通常 5-20
- **向量维度**: 通常 100-300
- **学习率**: 通常 0.025，线性衰减<[PLHD83_never_used_51bce0c785ca2f68081bfa7d91973934]>


`,
          exercise: { type: 'playground', viz: 'wordEmbedding' },
          code: {
            cpp: `#include <vector>
#include <cmath>
#include <random>

// Skip-gram 负采样训练步骤
void skipgram_step(
    const std::vector<double>& center_vec,  // 中心词向量
    const std::vector<double>& context_vec,  // 正样本上下文词向量
    const std::vector<std::vector<double>>& neg_vecs,  // 负样本
    std::vector<std::vector<double>>& W_in,  // 输入词向量矩阵
    std::vector<std::vector<double>>& W_out,  // 输出词向量矩阵
    int center_idx, int context_idx,
    const std::vector<int>& neg_indices,
    double lr) {
    int d = center_vec.size();
    // 正样本梯度
    double score = 0;
    for (int i = 0; i < d; i++) score += center_vec[i] * context_vec[i];
    double grad_pos = sigmoid(score) - 1.0;

    // 负样本梯度
    for (int n = 0; n < neg_vecs.size(); n++) {
        double neg_score = 0;
        for (int i = 0; i < d; i++)
            neg_score += center_vec[i] * neg_vecs[n][i];
        double grad_neg = sigmoid(neg_score);
        // 更新输入向量
        for (int i = 0; i < d; i++)
            W_in[center_idx][i] -= lr * (grad_neg * neg_vecs[n][i]);
    }
    // 更新输入向量（正样本）
    for (int i = 0; i < d; i++)
        W_in[center_idx][i] -= lr * grad_pos * context_vec[i];
    // 更新输出向量
    for (int i = 0; i < d; i++)
        W_out[context_idx][i] -= lr * grad_pos * center_vec[i];
}

double sigmoid(double x) {
    return 1.0 / (1.0 + std::exp(-x));
}`,
            python: `import numpy as np

def skipgram_negative_sampling(center_vec, context_vec, neg_vecs, lr=0.025):
    """Skip-gram 负采样单步训练"""
    # 正样本
    score = center_vec @ context_vec
    grad_pos = sigmoid(score) - 1.0

    # 负样本
    grad_center = np.zeros_like(center_vec)
    for neg_vec in neg_vecs:
        neg_score = center_vec @ neg_vec
        grad_neg = sigmoid(neg_score)
        grad_center += grad_neg * neg_vec

    # 更新中心词向量
    grad_center += grad_pos * context_vec
    center_vec -= lr * grad_center

    # 更新上下文词向量
    context_vec -= lr * grad_pos * center_vec

    return center_vec, context_vec

def sigmoid(x):
    return 1.0 / (1.0 + np.exp(-x))

# CBOW 预测中心词
def cbow_predict(context_vecs, W_out):
    """用上下文词的平均向量预测中心词"""
    avg_context = np.mean(context_vecs, axis=0)
    scores = W_out @ avg_context
    probs = softmax(scores)
    return probs

def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum()`
          },
          variablesSnapshot: {
            architecture: 'Skip-gram',
            negativeSamples: '5',
            windowSize: '5',
            learningRate: '0.025',
          },
          pseudocode: `procedure SKIPGRAM_TRAIN(corpus, window_size, dim, neg_samples, epochs)
    W_in <- random_matrix(vocab_size, dim)
    W_out <- random_matrix(vocab_size, dim)
    for epoch <- 1 to epochs do
        for each (center_word, context_word) in corpus do
            // 正样本
            v_c <- W_in[center_word]
            u_o <- W_out[context_word]
            // 负采样
            neg_words <- sample(neg_samples, from=noise_distribution)
            // 梯度下降更新
            update W_in and W_out using negative sampling loss
        end for
    end for
    return W_in  // 输入矩阵作为词向量

procedure CBOW_TRAIN(corpus, window_size, dim, epochs)
    W_in <- random_matrix(vocab_size, dim)
    W_out <- random_matrix(vocab_size, dim)
    for epoch <- 1 to epochs do
        for each (context_words, center_word) in corpus do
            h <- average(W_in[w] for w in context_words)
            // 预测中心词分布
            update W_in and W_out to maximize P(center_word | context)
        end for
    end for
    return W_in`,
          bigO: {
            time: 'Skip-gram 每个训练样本需要 O(d × k)，其中 d 是向量维度，k 是负样本数。完整训练需要 O(N × d × k × epochs)，N 是训练对数量。',
            space: '存储两个词向量矩阵 W_in 和 W_out 需要 O(V × d)，V 是词表大小。',
            note: '负采样将原始 O(V) 的 softmax 计算降为 O(k)，k 通常为 5-20，大大加速训练。',
          },
          compare: [
            { method: 'CBOW', data: '上下文 → 中心词', strength: '训练更快，高频词效果好', tradeoff: '低频词效果不如 Skip-gram' },
            { method: 'Skip-gram', data: '中心词 → 上下文', strength: '低频词效果好，语义更准确', tradeoff: '训练较慢，需要更多负样本' },
            { method: 'Hierarchical Softmax', data: '树结构', strength: '无需负采样', tradeoff: '实现复杂，需要构建 Huffman 树' },
          ],
          quiz: [
            {
              q: 'Word2Vec 中负采样（Negative Sampling）的主要作用是什么？',
              options: [
                '增加训练数据量',
                '将多分类问题转化为多个二分类问题，大幅降低计算复杂度',
                '防止过拟合',
                '自动调整学习率',
              ],
              answer: 1,
              explanation: '原始 softmax 需要计算词表中所有词的概率（O(V) 复杂度），负采样通过区分正样本和少量随机负样本，将复杂度降为 O(k)，k 通常为 5-20。',
            },
          ],
        },
        {
          id: 'nlp-glove',
          title: 'GloVe 全局向量',
          summary: '全局词共现、加权最小二乘',
          theory: `## GloVe（Global Vectors）

GloVe 是 Stanford 在 2014 年提出的词向量方法，结合了全局矩阵分解和局部上下文窗口的优点。

### 核心思想

利用词-词共现矩阵 $X$，其中 $X_{ij}$ 表示词 $i$ 和词 $j$ 在同一窗口中出现的次数。

### 共现概率的比值

$$F(w_i, w_j, \\tilde{w}_k) = \\frac{P_{ik}}{P_{jk}}$$

这个比值能区分词的相关性：
- 对于相关词，比值接近 1
- 对于无关词，比值远离 1

### 损失函数

$$J = \\sum_{i,j=1}^{V} f(X_{ij}) (w_i^T \\tilde{w}_j + b_i + \\tilde{b}_j - \\log X_{ij})^2$$

### 加权函数 $f(x)$

$$f(x) = \\begin{cases} (x/x_{max})^\\alpha & \\text{if } x < x_{max} \\\\ 1 & \\text{otherwise} \\end{cases}$$

其中 $x_{max} = 100$, $\\alpha = 3/4$。

加权函数的作用：
- 给高频共现更高权重
- 避免极少数极端共现对 dominating 训练

### GloVe vs Word2Vec

| 特性 | GloVe | Word2Vec |
|------|-------|---------|
| 数据使用 | 全局共现矩阵 | 局部上下文窗口 |
| 训练方式 | 加权最小二乘 | 负采样/SGD |
| 语义类比 | 优秀 | 优秀 |
| 训练速度 | 通常更快 | 取决于实现 |
| 可解释性 | 共现统计更透明 | 神经网络黑箱 |

### 最终词向量

训练完成后，最终词向量为：

$$w_i^{final} = w_i + \\tilde{w}_i$$

将输入和输出向量相加，综合两者的信息。
`,
          exercise: { type: 'playground', viz: 'wordEmbedding' },
          code: {
            cpp: `#include <vector>
#include <cmath>
#include <unordered_map>

// 构建共现矩阵
void build_cooccurrence(
    const std::vector<std::vector<int>>& corpus,
    int window_size,
    std::vector<std::vector<double>>& X) {
    for (const auto& sentence : corpus) {
        for (int i = 0; i < sentence.size(); i++) {
            int start = std::max(0, i - window_size);
            int end = std::min((int)sentence.size(), i + window_size + 1);
            for (int j = start; j < end; j++) {
                if (i != j) {
                    X[sentence[i]][sentence[j]] += 1.0 / std::abs(i - j);
                }
            }
        }
    }
}

// GloVe 加权函数
double weighting_func(double x, double x_max = 100.0, double alpha = 0.75) {
    if (x >= x_max) return 1.0;
    return std::pow(x / x_max, alpha);
}

// GloVe 单步梯度更新
void glove_step(
    std::vector<double>& w_i, std::vector<double>& w_j_tilde,
    double& b_i, double& b_j_tilde,
    double X_ij, double lr, double x_max = 100.0) {
    int d = w_i.size();
    double diff = 0;
    for (int k = 0; k < d; k++) diff += w_i[k] * w_j_tilde[k];
    diff += b_i + b_j_tilde - std::log(X_ij);

    double weight = weighting_func(X_ij, x_max);
    double grad = weight * diff;

    for (int k = 0; k < d; k++) {
        w_i[k] -= lr * grad * w_j_tilde[k];
        w_j_tilde[k] -= lr * grad * w_i[k];
    }
    b_i -= lr * grad;
    b_j_tilde -= lr * grad;
}`,
            python: `import numpy as np
from collections import defaultdict

def build_cooccurrence(corpus, window_size=10):
    """构建词-词共现矩阵"""
    cooccur = defaultdict(lambda: defaultdict(float))
    for sentence in corpus:
        for i, center in enumerate(sentence):
            start = max(0, i - window_size)
            end = min(len(sentence), i + window_size + 1)
            for j in range(start, end):
                if i != j:
                    # 距离衰减加权
                    cooccur[center][sentence[j]] += 1.0 / abs(i - j)
    return cooccur

def weighting_func(x, x_max=100.0, alpha=0.75):
    """GloVe 加权函数"""
    return (x / x_max) ** alpha if x < x_max else 1.0

def glove_loss(W, W_tilde, b, b_tilde, cooccur, x_max=100.0):
    """计算 GloVe 总损失"""
    loss = 0.0
    for i in cooccur:
        for j, X_ij in cooccur[i].items():
            diff = W[i] @ W_tilde[j] + b[i] + b_tilde[j] - np.log(X_ij)
            weight = weighting_func(X_ij, x_max)
            loss += weight * diff ** 2
    return loss

# 训练示例
def train_glove(cooccur, vocab_size, dim=100, epochs=50, lr=0.05):
    W = np.random.randn(vocab_size, dim) * 0.01
    W_tilde = np.random.randn(vocab_size, dim) * 0.01
    b = np.zeros(vocab_size)
    b_tilde = np.zeros(vocab_size)

    for epoch in range(epochs):
        total_loss = 0
        for i in cooccur:
            for j, X_ij in cooccur[i].items():
                diff = W[i] @ W_tilde[j] + b[i] + b_tilde[j] - np.log(X_ij)
                weight = weighting_func(X_ij)
                grad = weight * diff

                W[i] -= lr * grad * W_tilde[j]
                W_tilde[j] -= lr * grad * W[i]
                b[i] -= lr * grad
                b_tilde[j] -= lr * grad
                total_loss += weight * diff ** 2

        if epoch % 10 == 0:
            print(f"Epoch {epoch}, Loss: {total_loss:.4f}")

    # 最终向量 = W + W_tilde
    return W + W_tilde`
          },
          variablesSnapshot: {
            xMax: '100',
            alpha: '0.75',
            dimension: '100',
            windowSize: '10',
          },
          pseudocode: `procedure GLOVE_TRAIN(corpus, dim, window_size, x_max, alpha, epochs)
    // 1. 构建共现矩阵
    X <- build_cooccurrence(corpus, window_size)
    // 2. 初始化
    W, W_tilde <- random(V, dim)
    b, b_tilde <- zeros(V)
    // 3. 训练
    for epoch <- 1 to epochs do
        for each (i, j, X_ij) in X where X_ij > 0 do
            diff <- W_i^T * W_tilde_j + b_i + b_tilde_j - log(X_ij)
            weight <- (X_ij / x_max)^alpha  if X_ij < x_max else 1
            // 梯度更新
            W_i <- W_i - lr * weight * diff * W_tilde_j
            W_tilde_j <- W_tilde_j - lr * weight * diff * W_i
            b_i <- b_i - lr * weight * diff
            b_tilde_j <- b_tilde_j - lr * weight * diff
        end for
    end for
    // 4. 最终向量
    return W + W_tilde`,
          bigO: {
            time: '构建共现矩阵需要 O(C × W)，C 是语料库大小，W 是窗口大小。训练每轮需要 O(N_nonzero)，N_nonzero 是共现矩阵的非零元素数。',
            space: '存储共现矩阵需要 O(V^2)（稀疏存储 O(N_nonzero)）。词向量矩阵需要 O(V × d)。',
            note: 'GloVe 利用全局统计信息，通常比 Word2Vec 需要更少的训练轮次。稀疏存储共现矩阵可以大幅节省内存。',
          },
          compare: [
            { method: 'GloVe', data: '全局共现矩阵', strength: '融合全局统计，训练稳定', tradeoff: '需要存储共现矩阵，内存需求大' },
            { method: 'Word2Vec', data: '局部上下文窗口', strength: '在线训练，无需存储矩阵', tradeoff: '忽略全局统计信息' },
            { method: 'SVD/LSA', data: '词-文档矩阵', strength: '理论基础扎实', tradeoff: '计算复杂度高，语义捕获不如神经网络方法' },
          ],
          quiz: [
            {
              q: 'GloVe 损失函数中的加权函数 f(x) 有什么作用？',
              options: [
                '加速梯度下降收敛',
                '给高频共现更高权重，避免极少数极端共现 dominating 训练',
                '自动调整学习率',
                '将词向量归一化到单位长度',
              ],
              answer: 1,
              explanation: '加权函数 f(x) = (x/x_max)^α 确保高频共现获得适当权重，同时限制极少数非常高频共现（如功能词）对训练的过度影响。α=3/4 是经验最优值。',
            },
          ],
        },
        {
          id: 'nlp-attention',
          title: '注意力机制',
          summary: 'Self-Attention、缩放点积注意力',
          theory: `## 注意力机制

注意力机制让模型在处理每个位置时，能够动态关注输入序列中最相关的部分，是 Transformer 的核心组件。

### 缩放点积注意力（Scaled Dot-Product Attention）

$$Attention(Q, K, V) = softmax(\\frac{QK^T}{\\sqrt{d_k}}) V$$

### 三个输入

| 符号 | 名称 | 含义 |
|------|------|------|
| Q | Query（查询） | 当前位置的表示，用于"提问" |
| K | Key（键） | 所有位置的表示，用于"被查询" |
| V | Value（值） | 所有位置的表示，用于"被提取" |

### 计算步骤

1. **计算相似度**: $Q$ 和 $K$ 做点积，得到注意力分数
2. **缩放**: 除以 $\\sqrt{d_k}$，防止点积过大导致 softmax 饱和
3. **归一化**: softmax 将分数转为概率分布
4. **加权求和**: 用注意力权重对 $V$ 加权求和

### 为什么要除以 $\\sqrt{d_k}$？

当 $d_k$ 较大时，点积的方差也会变大，导致 softmax 函数进入饱和区（梯度接近 0）。除以 $\\sqrt{d_k}$ 可以将方差归一化到 1，保持梯度稳定。

### Self-Attention 特殊情况

当 $Q = K = V = X$（输入序列）时，称为 **Self-Attention**（自注意力），每个位置可以直接关注序列中的任意其他位置。

### 与 RNN/CNN 的对比

| 特性 | Self-Attention | RNN | CNN |
|------|---------------|-----|-----|
| 长距离依赖 | O(1) 路径长度 | O(n) 路径长度 | 需要多层堆叠 |
| 并行计算 | 完全并行 | 必须串行 | 可并行 |
| 计算复杂度 | O(n^2 d) | O(n d^2) | O(k n d) |
`,
          exercise: { type: 'playground', viz: 'attention' },
          code: {
            cpp: `#include <vector>
#include <cmath>
using Matrix = std::vector<std::vector<double>>;

Matrix matmul(const Matrix& A, const Matrix& B);
Matrix transpose(const Matrix& A);
Matrix row_softmax(const Matrix& scores);

Matrix self_attention(const Matrix& X,
                      const Matrix& Wq,
                      const Matrix& Wk,
                      const Matrix& Wv) {
    // 1. 线性变换得到 Q, K, V
    Matrix Q = matmul(X, Wq);
    Matrix K = matmul(X, Wk);
    Matrix V = matmul(X, Wv);

    // 2. 计算注意力分数 QK^T
    Matrix scores = matmul(Q, transpose(K));

    // 3. 缩放
    double scale = std::sqrt((double)K[0].size());
    for (auto& row : scores) {
        for (double& value : row) value /= scale;
    }

    // 4. Softmax 归一化
    Matrix A = row_softmax(scores);

    // 5. 加权求和
    return matmul(A, V);
}`,
            python: `import numpy as np

def softmax(x, axis=-1):
    """数值稳定的 softmax"""
    e_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return e_x / e_x.sum(axis=axis, keepdims=True)

def scaled_dot_product_attention(Q, K, V, mask=None):
    """
    缩放点积注意力
    Q: (n, d_k), K: (m, d_k), V: (m, d_v)
    返回: (n, d_v)
    """
    d_k = Q.shape[-1]
    # 1. 计算注意力分数
    scores = Q @ K.T / np.sqrt(d_k)

    # 2. 应用掩码（可选）
    if mask is not None:
        scores = np.where(mask == 0, -1e9, scores)

    # 3. Softmax 归一化
    weights = softmax(scores, axis=-1)

    # 4. 加权求和
    output = weights @ V
    return output, weights

def self_attention(X, Wq, Wk, Wv):
    """Self-Attention: Q=K=V=X"""
    Q = X @ Wq
    K = X @ Wk
    V = X @ Wv
    return scaled_dot_product_attention(Q, K, V)`
          },
          variablesSnapshot: {
            phase: 'input',
            tokens: '4',
            dk: '3',
            matrix: 'QK^T',
          },
          pseudocode: `procedure SELF_ATTENTION(X, Wq, Wk, Wv)
    // 线性变换
    Q <- X * Wq
    K <- X * Wk
    V <- X * Wv
    // 计算注意力分数
    scores <- Q * transpose(K) / sqrt(dk)
    // Softmax 归一化
    weights <- row_softmax(scores)
    // 加权求和
    output <- weights * V
    return output, weights`,
          bigO: {
            time: '序列长度为 n、隐藏维度为 d 时，QK^T 与 A V 都需要 O(n^2 d)。',
            space: '注意力权重矩阵需要 O(n^2)，Q/K/V 中间矩阵需要 O(n d)。',
            note: '长序列场景中 n^2 注意力矩阵是主要瓶颈，多头注意力会在多个子空间重复该过程。',
          },
          compare: [
            { method: 'Self-Attention', data: '整段序列', strength: '任意位置可直接建模依赖，O(1) 路径长度', tradeoff: '注意力矩阵随序列长度平方增长' },
            { method: 'RNN', data: '逐步状态', strength: '天然适合时间序列递推，参数共享', tradeoff: '长距离依赖路径长，无法并行' },
            { method: 'CNN', data: '局部窗口', strength: '局部模式提取高效，可并行', tradeoff: '远距离关系需要堆叠多层' },
          ],
          quiz: [
            {
              q: 'Self-Attention 中除以 sqrt(dk) 的主要目的是什么？',
              options: [
                '控制点积尺度，避免 softmax 过早饱和导致梯度消失',
                '把所有 token 的权重强制设为相同',
                '删除 V 矩阵中的噪声',
                '让矩阵乘法变成线性复杂度',
              ],
              answer: 0,
              explanation: '当维度 dk 较大时，Q 和 K 的点积幅度会变大，导致 softmax 函数进入饱和区（梯度接近 0）。缩放后 softmax 梯度更稳定，训练更容易收敛。',
            },
          ],
        },
        {
          id: 'nlp-multihead-attention',
          title: '多头注意力',
          summary: '并行注意力头、拼接与线性变换',
          theory: `## 多头注意力（Multi-Head Attention）

多头注意力是 Transformer 的关键创新，通过并行运行多个注意力头，让模型同时关注不同子空间的信息。

### 核心思想

$$MultiHead(Q, K, V) = Concat(head_1, ..., head_h) W^O$$

其中每个 head 为：

$$head_i = Attention(Q W_i^Q, K W_i^K, V W_i^V)$$

### 为什么需要多头？

| 优势 | 说明 |
|------|------|
| 多样性 | 不同头关注不同的语义关系（语法、语义、位置等） |
| 表达能力 | 多个子空间的组合比单头更强大 |
| 训练稳定 | 类似集成学习，降低单一注意力模式的风险 |

### 计算流程

1. 将 Q, K, V 分别通过线性变换投影到 h 个子空间
2. 每个子空间独立计算缩放点积注意力
3. 将 h 个头的输出拼接（Concat）
4. 再通过一个线性变换 $W^O$ 融合信息

### 维度设计

- 输入维度: $d_{model}$（如 512）
- 头数: $h$（如 8）
- 每头维度: $d_k = d_v = d_{model} / h$（如 64）

总计算量与单头（$d_k = d_{model}$）相近，但表达能力更强。

### 实际观察

在训练好的 Transformer 中，不同头确实学到了不同的模式：
- 有的头关注语法关系（主谓一致）
- 有的头关注指代关系（代词-先行词）
- 有的头关注局部相邻词
`,
          exercise: { type: 'playground', viz: 'attention' },
          code: {
            cpp: `#include <vector>
#include <cmath>
using Matrix = std::vector<std::vector<double>>;
using Tensor3D = std::vector<Matrix>;  // [heads, seq, dim_per_head]

// 张量 reshape: [seq, model_dim] -> [heads, seq, dim_per_head]
Tensor3D split_heads(const Matrix& X, int heads) {
    int seq_len = X.size();
    int model_dim = X[0].size();
    int dim_per_head = model_dim / heads;
    Tensor3D result(heads, Matrix(seq_len, std::vector<double>(dim_per_head)));
    for (int h = 0; h < heads; h++) {
        for (int s = 0; s < seq_len; s++) {
            for (int d = 0; d < dim_per_head; d++) {
                result[h][s][d] = X[s][h * dim_per_head + d];
            }
        }
    }
    return result;
}

// 张量 reshape 回: [heads, seq, dim_per_head] -> [seq, model_dim]
Matrix merge_heads(const Tensor3D& X) {
    int heads = X.size();
    int seq_len = X[0].size();
    int dim_per_head = X[0][0].size();
    int model_dim = heads * dim_per_head;
    Matrix result(seq_len, std::vector<double>(model_dim));
    for (int s = 0; s < seq_len; s++) {
        for (int h = 0; h < heads; h++) {
            for (int d = 0; d < dim_per_head; d++) {
                result[s][h * dim_per_head + d] = X[h][s][d];
            }
        }
    }
    return result;
}

Matrix multihead_attention(const Matrix& Q, const Matrix& K, const Matrix& V,
                           const Matrix& Wq, const Matrix& Wk, const Matrix& Wv,
                           const Matrix& Wo, int heads) {
    // 线性变换
    Matrix Q_proj = matmul(Q, Wq);
    Matrix K_proj = matmul(K, Wk);
    Matrix V_proj = matmul(V, Wv);

    // 拆分多头
    Tensor3D Q_heads = split_heads(Q_proj, heads);
    Tensor3D K_heads = split_heads(K_proj, heads);
    Tensor3D V_heads = split_heads(V_proj, heads);

    // 每个头独立计算注意力
    Tensor3D head_outputs(heads);
    for (int h = 0; h < heads; h++) {
        head_outputs[h] = self_attention(Q_heads[h], K_heads[h], V_heads[h]);
    }

    // 拼接并线性变换
    Matrix merged = merge_heads(head_outputs);
    return matmul(merged, Wo);
}`,
            python: `import numpy as np

def split_heads(X, num_heads):
    """[seq_len, d_model] -> [num_heads, seq_len, d_k]"""
    seq_len, d_model = X.shape
    d_k = d_model // num_heads
    return X.reshape(seq_len, num_heads, d_k).transpose(1, 0, 2)

def merge_heads(X):
    """[num_heads, seq_len, d_k] -> [seq_len, d_model]"""
    num_heads, seq_len, d_k = X.shape
    return X.transpose(1, 0, 2).reshape(seq_len, num_heads * d_k)

def multihead_attention(Q, K, V, Wq, Wk, Wv, Wo, num_heads, mask=None):
    """
    多头注意力
    Q, K, V: [seq_len, d_model]
    Wq, Wk, Wv: [d_model, d_model]
    Wo: [d_model, d_model]
    """
    d_model = Q.shape[-1]
    d_k = d_model // num_heads

    # 线性变换
    Q_proj = Q @ Wq  # [seq, d_model]
    K_proj = K @ Wk
    V_proj = V @ Wv

    # 拆分多头
    Q_heads = split_heads(Q_proj, num_heads)  # [heads, seq, d_k]
    K_heads = split_heads(K_proj, num_heads)
    V_heads = split_heads(V_proj, num_heads)

    # 每个头计算缩放点积注意力
    head_outputs = []
    for h in range(num_heads):
        scores = Q_heads[h] @ K_heads[h].T / np.sqrt(d_k)
        if mask is not None:
            scores = np.where(mask == 0, -1e9, scores)
        weights = softmax(scores, axis=-1)
        head_out = weights @ V_heads[h]
        head_outputs.append(head_out)

    # 拼接 + 线性变换
    concat = merge_heads(np.stack(head_outputs))
    output = concat @ Wo
    return output

def softmax(x, axis=-1):
    e_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return e_x / e_x.sum(axis=axis, keepdims=True)`
          },
          variablesSnapshot: {
            numHeads: '8',
            dModel: '512',
            dk: '64',
            seqLen: '10',
          },
          pseudocode: `procedure MULTIHEAD_ATTENTION(Q, K, V, Wq, Wk, Wv, Wo, h)
    // 线性变换并拆分多头
    Q_proj <- Q * Wq; split into h heads
    K_proj <- K * Wk; split into h heads
    V_proj <- V * Wv; split into h heads
    // 每个头独立计算
    for i <- 1 to h do
        head_i <- attention(Q_i, K_i, V_i)
    end for
    // 拼接并线性变换
    concat <- concatenate(head_1, ..., head_h)
    output <- concat * Wo
    return output`,
          bigO: {
            time: '每个头需要 O(n^2 × d_k)，h 个头总计 O(n^2 × d_model)。线性变换需要 O(n × d_model^2)。总复杂度 O(n^2 × d_model + n × d_model^2)。',
            space: 'h 个注意力权重矩阵需要 O(h × n^2)，中间张量需要 O(n × d_model)。',
            note: '多头注意力的总计算量与单头（d_k = d_model）相近，但通过并行多个子空间获得了更强的表达能力。',
          },
          compare: [
            { method: 'Multi-Head Attention', data: '并行 h 个子空间', strength: '同时关注多种语义关系，表达能力强', tradeoff: '需要存储多个注意力矩阵' },
            { method: 'Single-Head Attention', data: '单一子空间', strength: '计算简单，内存占用小', tradeoff: '表达能力有限，只能关注一种模式' },
            { method: 'CNN Multi-Channel', data: '多通道卷积', strength: '局部模式提取', tradeoff: '无法直接建模长距离依赖' },
          ],
          quiz: [
            {
              q: '多头注意力中，将 d_model 拆分为 h 个 d_k = d_model/h 维子空间的主要目的是什么？',
              options: [
                '减少计算量，提高训练速度',
                '让不同头学习不同的语义关系（如语法、语义、位置），增强模型表达能力',
                '使模型更容易过拟合',
                '减少参数数量，防止过拟合',
              ],
              answer: 1,
              explanation: '多头注意力的核心思想是让模型在不同子空间中学习不同的注意力模式。总计算量与单头相近，但表达能力显著增强。实践中观察到不同头确实学到了语法关系、指代关系等不同模式。',
            },
          ],
        },
        {
          id: 'nlp-masked-attention',
          title: '掩码注意力',
          summary: '因果掩码、填充掩码、防止未来信息泄露',
          theory: `## 掩码注意力（Masked Attention）

掩码注意力是 Transformer 解码器的核心组件，通过掩码矩阵阻止模型"看到"未来信息。

### 两种掩码

| 掩码类型 | 用途 | 实现 |
|---------|------|------|
| 因果掩码（Causal Mask） | 解码器自注意力 | 上三角设为 -∞ |
| 填充掩码（Padding Mask） | 忽略 padding token | padding 位置设为 -∞ |

### 因果掩码（Look-ahead Mask）

在自回归生成中，第 $t$ 个位置只能关注 $1, ..., t$ 的位置，不能看到未来：

$$\\text{Mask}_{ij} = \\begin{cases} 0 & \\text{if } i \\geq j \\\\ -\\infty & \\text{if } i < j \\end{cases}$$

### 填充掩码（Padding Mask）

批量处理时，不同序列长度不同，需要填充到相同长度。填充位置不应参与注意力计算：

$$\\text{PaddingMask}_{ij} = \\begin{cases} 1 & \\text{if token } j \\text{ is not padding} \\\\ 0 & \\text{if token } j \\text{ is padding} \\end{cases}$$

### 实现方式

在 softmax 之前，将掩码位置的分数设为 $-\\infty$：

$$\\text{scores} = \\frac{QK^T}{\\sqrt{d_k}} + \\text{mask}$$

softmax 后，$e^{-\\infty} = 0$，这些位置的注意力权重为 0。

### 应用场景

- **Transformer 解码器**: 因果掩码 + 填充掩码
- **Transformer 编码器**: 仅填充掩码
- **GPT 系列**: 因果掩码（自回归）
- **BERT**: 填充掩码（双向注意力）
`,
          exercise: { type: 'playground', viz: 'attention' },
          code: {
            cpp: `#include <vector>
#include <cmath>
#include <limits>

using Matrix = std::vector<std::vector<double>>;

// 生成因果掩码矩阵
Matrix generate_causal_mask(int seq_len) {
    Matrix mask(seq_len, std::vector<double>(seq_len, 0.0));
    for (int i = 0; i < seq_len; i++) {
        for (int j = i + 1; j < seq_len; j++) {
            mask[i][j] = -std::numeric_limits<double>::infinity();
        }
    }
    return mask;
}

// 生成填充掩码
Matrix generate_padding_mask(const std::vector<int>& seq, int pad_id = 0) {
    int seq_len = seq.size();
    Matrix mask(seq_len, std::vector<double>(seq_len, 0.0));
    for (int i = 0; i < seq_len; i++) {
        for (int j = 0; j < seq_len; j++) {
            if (seq[j] == pad_id) {
                mask[i][j] = -std::numeric_limits<double>::infinity();
            }
        }
    }
    return mask;
}

// 带掩码的注意力计算
Matrix masked_attention(const Matrix& Q, const Matrix& K, const Matrix& V,
                        const Matrix& mask) {
    int d_k = K[0].size();
    // 计算分数
    Matrix scores(Q.size(), std::vector<double>(K.size()));
    for (int i = 0; i < Q.size(); i++) {
        for (int j = 0; j < K.size(); j++) {
            for (int d = 0; d < d_k; d++) {
                scores[i][j] += Q[i][d] * K[j][d];
            }
            scores[i][j] /= std::sqrt((double)d_k);
            // 应用掩码
            scores[i][j] += mask[i][j];
        }
    }
    // Softmax + 加权求和
    Matrix weights = row_softmax(scores);
    return matmul(weights, V);
}`,
            python: `import numpy as np

def generate_causal_mask(seq_len):
    """生成因果掩码：上三角为 -inf"""
    mask = np.triu(np.full((seq_len, seq_len), -np.inf), k=1)
    return mask  # 下三角为 0，上三角为 -inf

def generate_padding_mask(seq, pad_id=0):
    """生成填充掩码：padding 位置为 -inf"""
    # [seq_len] -> [1, 1, seq_len] 便于广播
    mask = (seq == pad_id).astype(float) * -1e9
    return mask[np.newaxis, np.newaxis, :]  # [1, 1, seq_len]

def masked_attention(Q, K, V, causal_mask=None, padding_mask=None):
    """
    带掩码的缩放点积注意力
    Q: [n, d_k], K: [m, d_k], V: [m, d_v]
    """
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)  # [n, m]

    # 应用因果掩码
    if causal_mask is not None:
        scores += causal_mask  # 广播: [n, m]

    # 应用填充掩码
    if padding_mask is not None:
        scores += padding_mask  # 广播: [1, 1, m]

    # Softmax（-inf 位置权重为 0）
    weights = softmax(scores, axis=-1)
    output = weights @ V
    return output, weights

def softmax(x, axis=-1):
    e_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return e_x / e_x.sum(axis=axis, keepdims=True)

# 示例：解码器自注意力
def decoder_self_attention(X, Wq, Wk, Wv, pad_token_id=0):
    seq_len = X.shape[0]
    Q = X @ Wq
    K = X @ Wk
    V = X @ Wv

    causal_mask = generate_causal_mask(seq_len)
    return masked_attention(Q, K, V, causal_mask=causal_mask)`
          },
          variablesSnapshot: {
            maskType: 'causal',
            seqLen: '6',
            maskedPositions: 'upper triangle',
          },
          pseudocode: `procedure MASKED_ATTENTION(Q, K, V, mask)
    scores <- Q * transpose(K) / sqrt(dk)
    scores <- scores + mask  // -inf 位置 softmax 后为 0
    weights <- softmax(scores)
    output <- weights * V
    return output, weights

procedure CAUSAL_MASK(seq_len)
    mask <- zeros(seq_len, seq_len)
    for i <- 1 to seq_len do
        for j <- i+1 to seq_len do
            mask[i][j] <- -infinity
        end for
    end for
    return mask`,
          bigO: {
            time: '与普通注意力相同 O(n^2 d)，掩码操作仅增加 O(n^2) 的矩阵加法。',
            space: '需要额外存储掩码矩阵 O(n^2)，或通过广播机制避免显式存储。',
            note: '因果掩码通常是固定的上三角矩阵，可以预先计算并缓存。填充掩码因输入而异，但只需存储为向量 O(n)。',
          },
          compare: [
            { method: 'Causal Masked Attention', data: '下三角有效', strength: '防止未来信息泄露，适合自回归生成', tradeoff: '无法利用双向上下文' },
            { method: 'Full Attention (BERT)', data: '全部有效', strength: '双向上下文，理解能力强', tradeoff: '不能用于生成任务' },
            { method: 'Local Attention', data: '局部窗口', strength: 'O(n × w) 复杂度，适合长序列', tradeoff: '无法捕获长距离依赖' },
          ],
          quiz: [
            {
              q: '在 Transformer 解码器中，为什么要对自注意力使用因果掩码（Causal Mask）？',
              options: [
                '减少计算量，提高训练速度',
                '防止模型在生成第 t 个词时看到 t 之后的未来信息，确保自回归特性',
                '增加模型的非线性能力',
                '防止过拟合，起到正则化作用',
              ],
              answer: 1,
              explanation: '因果掩码将注意力分数矩阵的上三角设为 -inf，softmax 后这些位置权重为 0。这确保第 t 个位置只能关注 1 到 t 的位置，不会泄露未来信息，符合自回归生成的要求。',
            },
          ],
        },
        {
          id: 'nlp-positional-encoding',
          title: '位置编码',
          summary: '正弦位置编码、学习式位置编码、旋转位置编码',
          theory: `## 位置编码（Positional Encoding）

Transformer 的自注意力本身是**位置无关**的（permutation invariant），需要显式注入位置信息。

### 为什么需要位置编码？

自注意力计算 $QK^T$ 时，打乱输入顺序不会改变结果。但语言是有顺序的，"猫吃老鼠"和"老鼠吃猫"含义完全不同。

### 三种主要方法

| 方法 | 代表模型 | 特点 |
|------|---------|------|
| 正弦编码 | 原始 Transformer | 固定函数，无需训练，可外推 |
| 学习式编码 | BERT | 可学习参数，效果好但无法外推 |
| 旋转编码（RoPE） | LLaMA, GPT-NeoX | 相对位置信息，外推性好 |

### 正弦位置编码

$$PE_{(pos, 2i)} = \\sin\\left(\\frac{pos}{10000^{2i/d_{model}}}\\right)$$

$$PE_{(pos, 2i+1)} = \\cos\\left(\\frac{pos}{10000^{2i/d_{model}}}\\right)$$

### 为什么是正弦/余弦？

正弦编码有一个神奇的性质：对于任意固定偏移 $k$，$PE_{pos+k}$ 可以表示为 $PE_{pos}$ 的线性变换。这意味着模型可以通过注意力机制隐式学习相对位置关系。

### 学习式位置编码

直接为每个位置学习一个向量：

$$PE_{pos} = \\text{Embedding}(pos)$$

优点是灵活，缺点是无法外推到训练时未见过的更长序列。

### 旋转位置编码（RoPE）

RoPE 将位置信息编码为旋转矩阵：

$$f(q, pos) = q \\cdot e^{i pos \\theta}$$

天然编码相对位置：$f(q, pos_1) \\cdot f(k, pos_2) = f(q, k, pos_1 - pos_2)$

### 注入方式

通常将位置编码**加到**词嵌入上：

$$X = \\text{Embedding}(tokens) + PE$$
`,
          exercise: { type: 'playground', viz: 'transformer' },
          code: {
            cpp: `#include <vector>
#include <cmath>
using Matrix = std::vector<std::vector<double>>;

// 正弦位置编码
Matrix sinusoidal_positional_encoding(int seq_len, int d_model) {
    Matrix PE(seq_len, std::vector<double>(d_model));
    for (int pos = 0; pos < seq_len; pos++) {
        for (int i = 0; i < d_model; i += 2) {
            double div_term = std::pow(10000.0, (2.0 * i / 2.0) / d_model);
            PE[pos][i] = std::sin(pos / div_term);
            if (i + 1 < d_model) {
                PE[pos][i + 1] = std::cos(pos / div_term);
            }
        }
    }
    return PE;
}

// 注入位置编码
Matrix add_positional_encoding(const Matrix& embeddings, const Matrix& PE) {
    Matrix result = embeddings;
    for (int i = 0; i < embeddings.size(); i++) {
        for (int j = 0; j < embeddings[0].size(); j++) {
            result[i][j] += PE[i][j];
        }
    }
    return result;
}`,
            python: `import numpy as np

def sinusoidal_positional_encoding(seq_len, d_model):
    """正弦位置编码"""
    PE = np.zeros((seq_len, d_model))
    position = np.arange(seq_len)[:, np.newaxis]  # [seq, 1]
    div_term = np.exp(
        np.arange(0, d_model, 2) * -(np.log(10000.0) / d_model)
    )  # [d_model/2]
    PE[:, 0::2] = np.sin(position * div_term)  # 偶数维
    PE[:, 1::2] = np.cos(position * div_term)  # 奇数维
    return PE

def add_positional_encoding(embeddings, PE):
    """将位置编码加到词嵌入上"""
    return embeddings + PE[:embeddings.shape[0]]

# 旋转位置编码（RoPE）
def rotary_position_embedding(q, k, seq_len):
    """RoPE: 将位置信息编码为旋转"""
    d = q.shape[-1]
    positions = np.arange(seq_len)[:, np.newaxis]  # [seq, 1]
    freqs = 1.0 / (10000 ** (np.arange(0, d, 2) / d))  # [d/2]
    angles = positions * freqs  # [seq, d/2]

    # 构造旋转矩阵
    cos = np.cos(angles)  # [seq, d/2]
    sin = np.sin(angles)  # [seq, d/2]

    # 应用旋转
    q1, q2 = q[..., 0::2], q[..., 1::2]
    q_rotated = np.stack([
        q1 * cos - q2 * sin,
        q1 * sin + q2 * cos
    ], axis=-1).reshape(q.shape)

    k1, k2 = k[..., 0::2], k[..., 1::2]
    k_rotated = np.stack([
        k1 * cos - k2 * sin,
        k1 * sin + k2 * cos
    ], axis=-1).reshape(k.shape)

    return q_rotated, k_rotated`
          },
          variablesSnapshot: {
            method: 'sinusoidal',
            seqLen: '50',
            dModel: '512',
          },
          pseudocode: `procedure SINUSOIDAL_PE(seq_len, d_model)
    PE <- zeros(seq_len, d_model)
    for pos <- 0 to seq_len-1 do
        for i <- 0 to d_model/2-1 do
            div_term <- 10000^(2i/d_model)
            PE[pos][2i] <- sin(pos / div_term)
            PE[pos][2i+1] <- cos(pos / div_term)
        end for
    end for
    return PE

procedure ADD_POSITIONAL_ENCODING(embeddings, PE)
    return embeddings + PE  // 广播加法`,
          bigO: {
            time: '生成正弦位置编码需要 O(seq_len × d_model)。注入操作是元素级加法 O(seq_len × d_model)。',
            space: '存储位置编码矩阵需要 O(seq_len × d_model)，可预先计算并缓存。',
            note: '正弦位置编码是固定函数，无需训练参数。学习式位置编码需要 O(seq_len × d_model) 的可学习参数。RoPE 无需存储额外矩阵，通过在线计算实现。',
          },
          compare: [
            { method: '正弦编码', data: '固定 sin/cos 函数', strength: '无需训练，可外推到更长序列', tradeoff: '表达能力受限，无法学习位置偏好' },
            { method: '学习式编码', data: '可学习 Embedding', strength: '灵活，能学习任务相关的位置模式', tradeoff: '无法外推到训练时未见过的长度' },
            { method: '旋转编码 (RoPE)', data: '旋转矩阵', strength: '天然编码相对位置，外推性好', tradeoff: '实现稍复杂，需要修改注意力计算' },
          ],
          quiz: [
            {
              q: '为什么 Transformer 需要位置编码（Positional Encoding）？',
              options: [
                '为了减少计算量，提高训练速度',
                '因为自注意力是位置无关的（打乱输入顺序不改变结果），而语言是有顺序的',
                '为了增加模型参数数量，提高表达能力',
                '为了防止梯度消失，起到正则化作用',
              ],
              answer: 1,
              explanation: '自注意力计算 QK^T 时，打乱输入顺序不会改变结果（排列不变性）。但"猫吃老鼠"和"老鼠吃猫"含义完全不同，因此必须通过位置编码显式注入顺序信息。',
            },
          ],
        },
        {
          id: 'nlp-transformer',
          title: 'Transformer 架构',
          summary: '编码器-解码器、多头注意力、前馈网络、层归一化',
          theory: `## Transformer

Transformer 是 Google 在 2017 年提出的序列模型，完全基于注意力机制，抛弃了 RNN 的循环结构，开启了 NLP 的新时代。

### 整体架构

整体数据流：

输入 → [嵌入 + 位置编码] → [编码器×N] → [解码器×N] → 输出概率

### 编码器（Encoder）

每层包含两个子层：
1. **多头自注意力** + 残差连接 + 层归一化
2. **前馈网络** + 残差连接 + 层归一化

$$\\text{EncoderLayer}(x) = \\text{LayerNorm}(x + \\text{FFN}(\\text{LayerNorm}(x + \\text{MHSA}(x))))$$

### 解码器（Decoder）

每层包含三个子层：
1. **掩码多头自注意力** + 残差 + 层归一化
2. **编码器-解码器注意力** + 残差 + 层归一化
3. **前馈网络** + 残差 + 层归一化

### 前馈网络（FFN）

$$FFN(x) = \\max(0, x W_1 + b_1) W_2 + b_2$$

通常 $d_{ff} = 4 \\times d_{model}$（如 2048），增加非线性表达能力。

### 关键超参数（原始 Transformer）

| 超参数 | 值 |
|--------|-----|
| $d_{model}$ | 512 |
| $d_{ff}$ | 2048 |
| 头数 $h$ | 8 |
| $d_k = d_v$ | 64 |
| 编码器/解码器层数 | 6 |
| Dropout | 0.1 |

### 训练目标

$$L = -\\sum_{t=1}^{T} \\log P(w_t | w_1, ..., w_{t-1})$$

### 优缺点

- **优点**: 完全并行化，长距离依赖 O(1) 路径，可解释性强
- **缺点**: 自注意力 $O(n^2)$ 复杂度，长序列计算昂贵
`,
          exercise: { type: 'playground', viz: 'transformer' },
          code: {
            cpp: `#include <vector>
#include <cmath>
#include <algorithm>
using Matrix = std::vector<std::vector<double>>;

// 层归一化
Matrix layer_norm(const Matrix& X, const std::vector<double>& gamma,
                  const std::vector<double>& beta, double eps = 1e-6) {
    int seq_len = X.size();
    int d = X[0].size();
    Matrix result(seq_len, std::vector<double>(d));
    for (int i = 0; i < seq_len; i++) {
        double mean = 0, var = 0;
        for (int j = 0; j < d; j++) mean += X[i][j];
        mean /= d;
        for (int j = 0; j < d; j++) var += (X[i][j] - mean) * (X[i][j] - mean);
        var /= d;
        for (int j = 0; j < d; j++) {
            result[i][j] = gamma[j] * (X[i][j] - mean) / std::sqrt(var + eps) + beta[j];
        }
    }
    return result;
}

// 前馈网络（FFN）
Matrix positionwise_ffn(const Matrix& X, const Matrix& W1, const Matrix& b1,
                        const Matrix& W2, const Matrix& b2) {
    // 第一层 + ReLU
    Matrix hidden = matmul(X, W1);
    for (auto& row : hidden)
        for (auto& val : row)
            val = std::max(0.0, val + b1[0]);  // 简化：b1 广播
    // 第二层
    return matmul(hidden, W2);
}

// 编码器层
Matrix encoder_layer(const Matrix& X,
                     const Matrix& Wq, const Matrix& Wk, const Matrix& Wv, const Matrix& Wo,
                     const Matrix& W1, const Matrix& W2,
                     const std::vector<double>& gamma, const std::vector<double>& beta) {
    // 1. 多头自注意力 + 残差 + 层归一化
    Matrix attn_out = multihead_attention(X, X, X, Wq, Wk, Wv, Wo, 8);
    Matrix norm1 = layer_norm(add(X, attn_out), gamma, beta);

    // 2. FFN + 残差 + 层归一化
    Matrix ffn_out = positionwise_ffn(norm1, W1, std::vector<double>{0}, W2, std::vector<double>{0});
    Matrix norm2 = layer_norm(add(norm1, ffn_out), gamma, beta);

    return norm2;
}`,
            python: `import numpy as np

def layer_norm(X, gamma, beta, eps=1e-6):
    """层归一化"""
    mean = X.mean(axis=-1, keepdims=True)
    var = X.var(axis=-1, keepdims=True)
    X_norm = (X - mean) / np.sqrt(var + eps)
    return gamma * X_norm + beta

def positionwise_ffn(X, W1, b1, W2, b2):
    """位置前馈网络: FFN(x) = ReLU(x W1 + b1) W2 + b2"""
    hidden = np.maximum(0, X @ W1 + b1)  # ReLU
    return hidden @ W2 + b2

def encoder_layer(X, params):
    """
    单层编码器
    params: dict 包含 Wq, Wk, Wv, Wo, W1, b1, W2, b2, gamma, beta
    """
    # 1. 多头自注意力 + 残差 + 层归一化
    attn_out = multihead_attention(
        X, X, X,
        params['Wq'], params['Wk'], params['Wv'], params['Wo'],
        num_heads=8
    )
    norm1 = layer_norm(X + attn_out, params['gamma1'], params['beta1'])

    # 2. FFN + 残差 + 层归一化
    ffn_out = positionwise_ffn(
        norm1, params['W1'], params['b1'], params['W2'], params['b2']
    )
    norm2 = layer_norm(norm1 + ffn_out, params['gamma2'], params['beta2'])

    return norm2

def transformer_encoder(X, params_list, num_layers=6):
    """完整的 Transformer 编码器"""
    for layer_params in params_list:
        X = encoder_layer(X, layer_params)
    return X`
          },
          variablesSnapshot: {
            layers: '6',
            dModel: '512',
            dFF: '2048',
            numHeads: '8',
          },
          pseudocode: `procedure ENCODER_LAYER(X)
    // 子层 1: 多头自注意力 + 残差 + 层归一化
    attn <- multihead_attention(X, X, X)
    norm1 <- layer_norm(X + attn)
    // 子层 2: FFN + 残差 + 层归一化
    ffn <- positionwise_ffn(norm1)
    norm2 <- layer_norm(norm1 + ffn)
    return norm2

procedure DECODER_LAYER(X, encoder_output)
    // 子层 1: 掩码多头自注意力
    masked_attn <- masked_multihead_attention(X, X, X)
    norm1 <- layer_norm(X + masked_attn)
    // 子层 2: 编码器-解码器注意力
    cross_attn <- multihead_attention(norm1, encoder_output, encoder_output)
    norm2 <- layer_norm(norm1 + cross_attn)
    // 子层 3: FFN
    ffn <- positionwise_ffn(norm2)
    norm3 <- layer_norm(norm2 + ffn)
    return norm3`,
          bigO: {
            time: '每层编码器需要 O(n^2 × d_model + n × d_model^2)，L 层总复杂度 O(L × (n^2 × d_model + n × d_model^2))。',
            space: '每层需要 O(n × d_model) 的中间状态，L 层总 O(L × n × d_model)。注意力矩阵 O(n^2)。',
            note: '对于长序列，n^2 项主导复杂度。高效 Transformer（如 Linformer、Performer）通过近似将复杂度降为 O(n)。',
          },
          compare: [
            { method: 'Transformer', data: '全注意力', strength: 'O(1) 长距离依赖，完全并行', tradeoff: 'O(n^2) 复杂度，长序列昂贵' },
            { method: 'RNN (LSTM)', data: '逐步递推', strength: 'O(n) 复杂度，适合流式处理', tradeoff: '无法并行，长距离依赖弱' },
            { method: 'CNN (ConvS2S)', data: '局部卷积', strength: '可并行，局部模式强', tradeoff: '长距离需要多层，感受野有限' },
          ],
          quiz: [
            {
              q: 'Transformer 编码器中，每个子层后都使用"残差连接 + 层归一化"的目的是什么？',
              options: [
                '减少参数量，防止过拟合',
                '残差连接缓解梯度消失，层归一化稳定训练分布，两者结合使深层网络可训练',
                '增加模型非线性能力',
                '加速前向传播计算',
              ],
              answer: 1,
              explanation: '残差连接（Add）让梯度可以直接回传到浅层，缓解梯度消失问题。层归一化（LayerNorm）将每层输出归一化到稳定分布，防止内部协变量偏移。两者结合使 Transformer 能够训练非常深的网络（数十甚至上百层）。',
            },
          ],
        },
        {
          id: 'nlp-bert-gpt',
          title: 'BERT 与 GPT',
          summary: '编码器-only vs 解码器-only、预训练目标对比',
          theory: `## BERT vs GPT

BERT 和 GPT 是 Transformer 架构的两种主要变体，分别代表了"双向理解"和"自回归生成"两大范式。

### 架构对比

| 特性 | BERT | GPT |
|------|------|-----|
| 基础架构 | 多层编码器 | 多层解码器 |
| 注意力 | 双向（Full Attention） | 单向（Causal Masked） |
| 预训练任务 | MLM + NSP | 自回归语言建模 |
| 擅长任务 | 理解类（分类、抽取） | 生成类（续写、对话） |
| 代表模型 | BERT-base/large, RoBERTa | GPT-2/3/4, LLaMA, PaLM |

### BERT 的预训练目标

**1. 掩码语言模型（Masked Language Model, MLM）**

随机掩码 15% 的 token，让模型预测被掩码的词：

$$L_{MLM} = -\\sum_{\\hat{x} \\in m(x)} \\log P(\\hat{x} | x_{\\setminus m(x)})$$

其中 $m(x)$ 是被掩码的位置集合。

特殊处理：80% 替换为 [MASK]，10% 替换为随机词，10% 保持原样。

**2. 下一句预测（Next Sentence Prediction, NSP）**

判断句子 B 是否是句子 A 的下一句，50% 正例，50% 负例。

### GPT 的预训练目标

**自回归语言模型（Autoregressive Language Model）**

给定前面的词，预测下一个词：

$$L_{AR} = -\\sum_{t=1}^{T} \\log P(w_t | w_1, ..., w_{t-1})$$

### 模型规模演进

| 模型 | 参数量 | 层数 | 隐藏维度 | 头数 |
|------|--------|------|---------|------|
| BERT-base | 110M | 12 | 768 | 12 |
| BERT-large | 340M | 24 | 1024 | 16 |
| GPT-2 | 1.5B | 48 | 1600 | 25 |
| GPT-3 | 175B | 96 | 12288 | 96 |
| LLaMA-2 70B | 70B | 80 | 8192 | 64 |

### 选择指南

- **理解任务**（分类、命名实体识别、抽取式问答）→ 用 BERT 类模型
- **生成任务**（续写、翻译、摘要、对话）→ 用 GPT 类模型
- **资源有限** → 用蒸馏版（DistilBERT、TinyGPT）
`,
          exercise: { type: 'playground', viz: 'transformer' },
          code: {
            cpp: `#include <vector>
#include <string>
#include <random>

// BERT MLM 预训练数据生成
void create_mlm_input(
    std::vector<int>& tokens,
    std::vector<int>& masked_labels,
    const std::vector<int>& special_tokens,
    double mask_prob = 0.15) {
    int n = tokens.size();
    masked_labels.assign(n, -100);  // -100 表示不计算损失
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<> dis(0.0, 1.0);
    std::uniform_int_distribution<> vocab_dis(0, 30000);

    for (int i = 0; i < n; i++) {
        // 跳过特殊 token
        bool is_special = false;
        for (int st : special_tokens) {
            if (tokens[i] == st) { is_special = true; break; }
        }
        if (is_special) continue;

        if (dis(gen) < mask_prob) {
            masked_labels[i] = tokens[i];  // 原始 token 作为标签
            double r = dis(gen);
            if (r < 0.8) {
                tokens[i] = 4;  // [MASK] token id = 4
            } else if (r < 0.9) {
                tokens[i] = vocab_dis(gen);  // 随机替换
            }
            // 10% 保持原样
        }
    }
}

// GPT 自回归训练目标
double autoregressive_loss(
    const std::vector<std::vector<double>>& logits,  // [seq_len, vocab_size]
    const std::vector<int>& targets) {               // [seq_len]
    double loss = 0.0;
    int n = logits.size();
    for (int t = 0; t < n - 1; t++) {
        // logits[t] 预测 targets[t+1]
        double max_logit = *std::max_element(logits[t].begin(), logits[t].end());
        double sum_exp = 0.0;
        for (double l : logits[t]) sum_exp += std::exp(l - max_logit);
        double log_prob = logits[t][targets[t+1]] - max_logit - std::log(sum_exp);
        loss -= log_prob;
    }
    return loss / (n - 1);
}`,
            python: `import numpy as np
import random

def create_mlm_input(tokens, mask_token_id=4, vocab_size=30522, mask_prob=0.15):
    """
    BERT MLM 预训练数据生成
    tokens: list of token ids
    返回: (masked_tokens, labels)
    labels: 非掩码位置为 -100（忽略），掩码位置为原始 token id
    """
    labels = [-100] * len(tokens)
    masked_tokens = tokens.copy()

    for i in range(len(tokens)):
        if random.random() < mask_prob:
            labels[i] = tokens[i]  # 保存原始 token 作为标签
            r = random.random()
            if r < 0.8:
                masked_tokens[i] = mask_token_id  # 80% [MASK]
            elif r < 0.9:
                masked_tokens[i] = random.randint(0, vocab_size - 1)  # 10% 随机
            # 10% 保持原样

    return masked_tokens, labels

def autoregressive_loss(logits, targets):
    """
    GPT 自回归损失
    logits: [seq_len, vocab_size]
    targets: [seq_len] (shifted by 1)
    """
    # logits[t] 预测 targets[t]
    shifted_logits = logits[:-1]  # [seq_len-1, vocab]
    shifted_targets = targets[1:]  # [seq_len-1]

    # 交叉熵
    log_probs = shifted_logits - np.log(np.sum(np.exp(shifted_logits), axis=-1, keepdims=True))
    nll = -log_probs[np.arange(len(shifted_targets)), shifted_targets]
    return np.mean(nll)

# NSP（下一句预测）标签生成
def create_nsp_example(sentence_a, sentence_b, is_next):
    """
    BERT NSP 输入格式:
    <[BOS_never_used_51bce0c785ca2f68081bfa7d91973934]> sentence_a [SEP] sentence_b [SEP]
    """
    input_ids = [2] + sentence_a + [3] + sentence_b + [3]  # 2=<[BOS_never_used_51bce0c785ca2f68081bfa7d91973934]>, 3=[SEP]
    token_type_ids = [0] * (2 + len(sentence_a) + 1) + [1] * (len(sentence_b) + 1)
    label = 1 if is_next else 0
    return input_ids, token_type_ids, label`
          },
          variablesSnapshot: {
            bertModel: 'BERT-base',
            bertParams: '110M',
            gptModel: 'GPT-2',
            gptParams: '1.5B',
            mlmProb: '0.15',
          },
          pseudocode: `procedure BERT_PRETRAIN(corpus, epochs)
    for epoch <- 1 to epochs do
        for each sentence_pair in corpus do
            // MLM 任务
            masked_tokens, labels <- create_mlm_input(tokens)
            mlm_loss <- cross_entropy(predict(masked_tokens), labels)
            // NSP 任务
            nsp_label <- sample_next_sentence(sentence_pair)
            nsp_loss <- binary_cross_entropy(predict_nsp(), nsp_label)
            // 总损失
            total_loss <- mlm_loss + nsp_loss
            update model parameters
        end for
    end for

procedure GPT_PRETRAIN(corpus, epochs)
    for epoch <- 1 to epochs do
        for each sequence in corpus do
            // 自回归预测
            for t <- 1 to T do
                logits <- model(w_1, ..., w_{t-1})
                loss += cross_entropy(logits, w_t)
            end for
            update model parameters
        end for
    end for`,
          bigO: {
            time: 'BERT 预训练需要 O(N × L × d_model^2)，N 是训练 token 数，L 是层数。GPT 同样量级，但推理时可以缓存 KV 减少重复计算。',
            space: 'BERT 需要存储整个序列的注意力矩阵 O(n^2)。GPT 推理时可使用 KV 缓存 O(n × d_model)。',
            note: 'GPT 的自回归推理天然适合流式生成，但每步需要 O(n) 的注意力计算（或 O(1) 用 KV 缓存）。BERT 需要完整序列输入，不适合流式场景。',
          },
          compare: [
            { method: 'BERT (Encoder-only)', data: '双向上下文', strength: '理解能力强，适合分类/抽取任务', tradeoff: '不能直接生成，需要额外的解码层' },
            { method: 'GPT (Decoder-only)', data: '单向上下文（因果）', strength: '天然适合生成任务，自回归特性', tradeoff: '理解能力受限，无法看到双向信息' },
            { method: 'T5 (Encoder-Decoder)', data: '双向编码 + 单向解码', strength: '统一框架，理解+生成兼顾', tradeoff: '参数量更大，推理更慢' },
          ],
          quiz: [
            {
              q: 'BERT 预训练中的 MLM（掩码语言模型）任务，为什么 80% 替换为 [MASK]，10% 替换为随机词，10% 保持原样？',
              options: [
                '为了增加训练数据量',
                '防止模型过度依赖 [MASK] token 的特殊表示，因为下游任务中没有 [MASK]',
                '为了减少计算量，提高训练速度',
                '为了让模型学习 token 之间的顺序关系',
              ],
              answer: 1,
              explanation: '如果所有掩码位置都用 [MASK]，模型会学到 [MASK] 的特殊表示，但下游任务（如分类）中不会出现 [MASK] token。加入随机替换和保持原样可以让模型更鲁棒，减少预训练和微调之间的分布差异。',
            },
          ],
        },
]
