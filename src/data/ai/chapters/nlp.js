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

将离散的词语映射为连续的向量空间。

### Word2Vec

- **CBOW**: 用上下文预测中心词
- **Skip-gram**: 用中心词预测上下文

### 词向量的神奇性质

$$vec("King") - vec("Man") + vec("Woman") \\approx vec("Queen")$$
`,
          exercise: { type: 'playground', viz: 'wordEmbedding' },
        },
        {
          id: 'nlp-attention',
          title: '注意力机制',
          summary: 'Self-Attention、Multi-Head Attention',
          theory: `## 注意力机制

注意力让模型关注输入中最相关的部分。

### Self-Attention

$$Attention(Q, K, V) = softmax(\\frac{QK^T}{\\sqrt{d_k}}) V$$

其中 Q=查询, K=键, V=值
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
    Matrix Q = matmul(X, Wq);
    Matrix K = matmul(X, Wk);
    Matrix V = matmul(X, Wv);

    Matrix scores = matmul(Q, transpose(K));
    double scale = std::sqrt((double)K[0].size());
    for (auto& row : scores) {
        for (double& value : row) value /= scale;
    }

    Matrix A = row_softmax(scores);
    return matmul(A, V);
}`,
            python: `import numpy as np

def self_attention(X, Wq, Wk, Wv):
    Q = X @ Wq
    K = X @ Wk
    V = X @ Wv

    scores = Q @ K.T / np.sqrt(K.shape[-1])
    weights = softmax(scores, axis=-1)
    output = weights @ V

    return output, weights`
          },
          variablesSnapshot: {
            phase: 'input',
            tokens: '4',
            dk: '3',
            matrix: 'QK^T',
          },
          pseudocode: `procedure SELF_ATTENTION(X, Wq, Wk, Wv)
    Q <- X * Wq
    K <- X * Wk
    V <- X * Wv
    scores <- Q * transpose(K) / sqrt(dk)
    weights <- row_softmax(scores)
    output <- weights * V
    return output, weights`,
          bigO: {
            time: '序列长度为 n、隐藏维度为 d 时，QK^T 与 A V 都需要 O(n^2 d)。',
            space: '注意力权重矩阵需要 O(n^2)，Q/K/V 中间矩阵需要 O(n d)。',
            note: '长序列场景中 n^2 注意力矩阵是主要瓶颈，多头注意力会在多个子空间重复该过程。',
          },
          compare: [
            { method: 'Self-Attention', data: '整段序列', strength: '任意位置可直接建模依赖', tradeoff: '注意力矩阵随序列长度平方增长' },
            { method: 'RNN', data: '逐步状态', strength: '天然适合时间序列递推', tradeoff: '长距离依赖和并行计算较弱' },
            { method: 'CNN', data: '局部窗口', strength: '局部模式提取高效', tradeoff: '远距离关系需要堆叠多层' },
          ],
          quiz: [
            {
              q: 'Self-Attention 中除以 sqrt(dk) 的主要目的是什么？',
              options: [
                '控制点积尺度，避免 softmax 过早饱和',
                '把所有 token 的权重强制设为相同',
                '删除 V 矩阵中的噪声',
                '让矩阵乘法变成线性复杂度',
              ],
              answer: 0,
              explanation: '当维度较大时，Q 和 K 的点积幅度会变大；缩放后 softmax 梯度更稳定。',
            },
          ],
          codeStepHighlightLines: {
            cpp: [9, 10, 11, 13, 16, 20, 21],
            python: [4, 5, 6, 8, 9, 10, 12],
          },
        },
        {
          id: 'nlp-transformer',
          title: 'Transformer 架构',
          summary: '编码器-解码器、位置编码、多头注意力',
          theory: `## Transformer

基于注意力机制的序列模型，抛弃了 RNN 的循环结构。

### 核心组件

- Multi-Head Self-Attention
- Position-wise Feed-Forward
- Positional Encoding
- Layer Normalization
`,
          exercise: { type: 'playground', viz: 'transformer' },
        },
]
