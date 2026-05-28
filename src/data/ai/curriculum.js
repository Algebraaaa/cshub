export const AI_CURRICULUM = {
  id: 'ai-masters',
  title: 'AI 专业课',
  instrument: 'ai',
  icon: '🤖',
  color: '#8b5cf6',
  chapters: [
    {
      id: 'optim',
      title: '最优化方法',
      lessons: [
        {
          id: 'optim-gd-variants',
          title: '梯度下降变体对比',
          summary: 'BGD、SGD、Mini-batch 的收敛行为差异',
          theory: `## 梯度下降变体

三种梯度下降的核心区别在于**每步使用多少数据**计算梯度。

| 方法 | 每步数据量 | 梯度质量 | 速度 |
|------|-----------|---------|------|
| BGD | 全部 N 个 | 精确 | 最慢 |
| SGD | 1 个 | 噪声大 | 最快 |
| Mini-batch | B 个 | 折中 | 折中 |

### 更新规则

$$\\theta \\leftarrow \\theta - \\alpha \\nabla L(\\theta)$$

SGD 的噪声反而有好处——能跳出局部最优。
`,
          exercise: { type: 'playground', viz: 'gdVariants' },
          code: {
            cpp: `#include <bits/stdc++.h>
using namespace std;

struct Point {
    double x, y;
};

Point grad_rosenbrock(Point p) {
    double gx = -2 * (1 - p.x) - 400 * p.x * (p.y - p.x * p.x);
    double gy = 200 * (p.y - p.x * p.x);
    return {gx, gy};
}

Point gd_step(Point p, double lr, string variant) {
    Point g = grad_rosenbrock(p);

    if (variant == "sgd") {
        g.x += random_noise();
        g.y += random_noise();
    } else if (variant == "mini") {
        g.x += 0.3 * random_noise();
        g.y += 0.3 * random_noise();
    }

    return {
        p.x - lr * g.x,
        p.y - lr * g.y
    };
}`,
            python: `def gd_step(x, y, lr, variant):
    gx, gy = grad_rosenbrock(x, y)

    if variant == "sgd":
        gx += random_noise()
        gy += random_noise()
    elif variant == "mini":
        gx += 0.3 * random_noise()
        gy += 0.3 * random_noise()

    return (
        x - lr * gx,
        y - lr * gy,
    )`
          },
          variablesSnapshot: {
            variant: 'BGD',
            learningRate: 0.002,
            position: '(-1.50, 2.00)',
            loss: '12.34'
          },
          pseudocode: `procedure GD_VARIANTS(start, learningRate, variant)
    point <- start
    for step <- 1 to maxSteps do
        gradient <- grad(loss, point)

        if variant = SGD then
            gradient <- gradient + sampleNoise()
        else if variant = MINI_BATCH then
            gradient <- gradient + smallBatchNoise()
        end if

        point <- point - learningRate * gradient
        record(point, loss(point))
    end for
    return path`,
          bigO: {
            time: '可视化固定迭代 T 步，每步计算一次二维梯度，因此演示复杂度为 O(T)。真实训练中 BGD 每步需要扫 N 个样本，SGD 为 O(1)，Mini-batch 为 O(B)。',
            space: '保存轨迹 path 需要 O(T)；只做在线更新时，参数和梯度都是常数空间 O(1)。',
            note: '这里的 T 是迭代步数，N 是数据集规模，B 是 mini-batch 大小。',
          },
          compare: [
            { method: 'BGD', data: '全部 N 个样本', strength: '梯度稳定，路径平滑', tradeoff: '单步最慢，大数据集代价高' },
            { method: 'SGD', data: '1 个样本', strength: '单步最快，噪声有探索性', tradeoff: '震荡明显，收敛曲线不稳定' },
            { method: 'Mini-batch', data: 'B 个样本', strength: '速度和稳定性折中', tradeoff: '需要选择合适 batch size' },
          ],
          quiz: [
            {
              q: '为什么 SGD 的轨迹通常比 BGD 更抖动？',
              options: [
                '因为 SGD 每步只用一个或少量样本估计梯度',
                '因为 SGD 的学习率必须恒等于 0',
                '因为 BGD 不需要计算梯度',
                '因为 Mini-batch 不会产生随机性',
              ],
              answer: 0,
              explanation: 'SGD 使用少量样本估计整体梯度，估计方差更大，所以路径更抖动；这种噪声有时也能帮助跳出较差区域。',
            },
          ],
        },
        {
          id: 'optim-momentum',
          title: 'Momentum 动量法',
          summary: '物理直觉：小球滚下山坡，积累速度',
          theory: `## Momentum

普通梯度下降像一个无摩擦的小球，每步只看当前梯度。Momentum 加入"惯性"：

$$v_t = \\beta v_{t-1} + \\nabla L(\\theta_t)$$
$$\\theta_{t+1} = \\theta_t - \\alpha v_t$$

### 为什么有效？

- 在一致方向上**加速**（积累动量）
- 在震荡方向上**抑制**（正负梯度互相抵消）
- $\\beta$ 通常取 0.9
`,
          exercise: { type: 'playground', viz: 'momentum' },
        },
        {
          id: 'optim-rmsprop',
          title: 'RMSProp',
          summary: '自适应学习率：梯度大的方向步长小',
          theory: `## RMSProp

RMSProp 为每个参数维护一个**自适应学习率**：

$$s_t = \\beta s_{t-1} + (1-\\beta) g_t^2$$
$$\\theta_{t+1} = \\theta_t - \\frac{\\alpha}{\\sqrt{s_t} + \\epsilon} g_t$$

### 直觉

- 梯度一直很大 → $s_t$ 大 → 步长变小（防止冲过头）
- 梯度一直很小 → $s_t$ 小 → 步长变大（加速收敛）
`,
          exercise: { type: 'playground', viz: 'rmsprop' },
        },
        {
          id: 'optim-adam',
          title: 'Adam 优化器',
          summary: '结合 Momentum + RMSProp，最常用的优化器',
          theory: `## Adam (Adaptive Moment Estimation)

Adam 同时维护**一阶矩估计**（动量）和**二阶矩估计**（自适应学习率）：

$$m_t = \\beta_1 m_{t-1} + (1-\\beta_1) g_t$$
$$v_t = \\beta_2 v_{t-1} + (1-\\beta_2) g_t^2$$

偏差修正：
$$\\hat{m}_t = \\frac{m_t}{1-\\beta_1^t}, \\quad \\hat{v}_t = \\frac{v_t}{1-\\beta_2^t}$$

更新：
$$\\theta_{t+1} = \\theta_t - \\frac{\\alpha}{\\sqrt{\\hat{v}_t} + \\epsilon} \\hat{m}_t$$

### 默认超参

$\\alpha=0.001, \\beta_1=0.9, \\beta_2=0.999, \\epsilon=10^{-8}$
`,
          exercise: { type: 'playground', viz: 'adam' },
        },
        {
          id: 'optim-lr-compare',
          title: '学习率对比实验',
          summary: '同一出发点，不同学习率的收敛轨迹',
          theory: `## 学习率的重要性

学习率 $\\alpha$ 是最敏感的超参数：

| 学习率 | 效果 |
|--------|------|
| 太小 | 收敛极慢，浪费计算 |
| 适中 | 快速收敛到最优 |
| 太大 | 震荡，可能发散 |
| 极大 | 直接飞出去 |

### 学习率调度

实践中常用衰减策略：
- Step Decay: 每 N 轮乘以 0.1
- Cosine Annealing: 余弦曲线衰减
- Warmup: 先升后降
`,
          exercise: { type: 'playground', viz: 'lrCompare' },
        },
        {
          id: 'optim-newton',
          title: '牛顿法',
          summary: '二阶优化：用 Hessian 矩阵实现二次收敛',
          theory: `## 牛顿法

利用二阶导数信息，收敛速度比梯度下降快得多：

$$\\theta_{t+1} = \\theta_t - H^{-1} \\nabla L(\\theta_t)$$

其中 $H$ 是 Hessian 矩阵（二阶偏导数矩阵）。

### 优缺点

- **优点**: 二次收敛（误差平方级下降）
- **缺点**: 需要计算和存储 $H^{-1}$，$O(n^2)$ 复杂度
- **改进**: 拟牛顿法（BFGS、L-BFGS）用近似 Hessian
`,
          exercise: { type: 'playground', viz: 'newtonMethod' },
        },
        {
          id: 'optim-conjugate-gradient',
          title: '共轭梯度法',
          summary: '求解线性系统，n 步收敛',
          theory: `## 共轭梯度法

用于求解 $Ax = b$ 形式的线性系统，或等价地最小化二次函数：

$$f(x) = \\frac{1}{2} x^T A x - b^T x$$

### 核心思想

选择一组 $A$-共轭方向 $d_0, d_1, \\ldots$，使得在每个方向上只搜索一次。

### 性质

- 最多 $n$ 步精确收敛（$n$ 为维度）
- 每步只需矩阵-向量乘法
- 比最速下降法快得多
`,
          exercise: { type: 'playground', viz: 'conjugateGradient' },
        },
        {
          id: 'optim-line-search',
          title: '线搜索策略',
          summary: '黄金分割法与回溯线搜索',
          theory: `## 线搜索

确定梯度下降的**步长** $\\alpha$：

### 精确线搜索

找到使 $f(\\theta - \\alpha d)$ 最小的 $\\alpha$。

### 黄金分割法

在区间 $[a, b]$ 内用黄金比例 0.618 缩小区间，$O(\\log n)$ 收敛。

### 回溯线搜索（Armijo）

从大步长开始，不断缩小直到满足 Armijo 条件：

$$f(\\theta - \\alpha d) \\leq f(\\theta) - c \\alpha \\nabla f^T d$$

$c$ 通常取 $10^{-4}$。
`,
          exercise: { type: 'playground', viz: 'lineSearch' },
        },
        {
          id: 'optim-ga',
          title: '遗传算法 (GA)',
          summary: '模拟自然选择：选择、交叉、变异',
          theory: `## 遗传算法

受生物进化启发的全局优化算法。

### 流程

1. **初始化**: 随机生成种群
2. **适应度评估**: 计算每个个体的适应度
3. **选择**: 轮盘赌 / 锦标赛选择优秀个体
4. **交叉**: 两个父代交换基因产生子代
5. **变异**: 随机改变部分基因
6. 重复 2-5 直到收敛

### 关键参数

| 参数 | 作用 | 典型值 |
|------|------|--------|
| 种群大小 | 多样性 vs 计算量 | 50-200 |
| 交叉率 | 搜索范围 | 0.7-0.9 |
| 变异率 | 防止早熟收敛 | 0.01-0.1 |
`,
          exercise: { type: 'playground', viz: 'geneticAlgorithm' },
        },
        {
          id: 'optim-pso',
          title: '粒子群优化 (PSO)',
          summary: '模拟鸟群觅食：个体最优 + 全局最优',
          theory: `## 粒子群优化

每个粒子有位置和速度，受两个"吸引力"影响：

$$v_t = w v_{t-1} + c_1 r_1 (p_{best} - x) + c_2 r_2 (g_{best} - x)$$
$$x_{t+1} = x_t + v_t$$

### 直觉

- $w$: 惯性，保持原来方向
- $c_1 r_1 (p_{best} - x)$: 个体记忆，飞向自己历史最优
- $c_2 r_2 (g_{best} - x)$: 社会学习，飞向全局最优

### 参数

$w=0.7, c_1=c_2=1.5$ 是常用起点。
`,
          exercise: { type: 'playground', viz: 'pso' },
        },
        {
          id: 'optim-sa',
          title: '模拟退火 (SA)',
          summary: 'Metropolis 准则：高温探索，低温收敛',
          theory: `## 模拟退火

模拟金属退火过程的随机优化算法。

### 核心：Metropolis 准则

接受更优解总是接受；接受更差解的概率：

$$P = \\exp\\left(-\\frac{\\Delta E}{T}\\right)$$

- $T$ 高 → 大概率接受差解（探索）
- $T$ 低 → 小概率接受差解（收敛）

### 降温策略

$$T_{t+1} = \\alpha T_t, \\quad \\alpha \\in [0.9, 0.99]$$

### 优点

- 能跳出局部最优
- 理论上能收敛到全局最优
- 实现简单
`,
          exercise: { type: 'playground', viz: 'simulatedAnnealing' },
        },
      ],
    },
    {
      id: 'ml',
      title: '机器学习基础',
      lessons: [
        {
          id: 'ml-linear-regression',
          title: '线性回归',
          summary: '最小二乘法、梯度下降求解线性模型参数',
          theory: `## 线性回归

线性回归是最基础的监督学习算法，目标是找到一条直线（或超平面）来拟合数据。

### 模型

$$\\hat{y} = wx + b$$

其中 $w$ 是权重（斜率），$b$ 是偏置（截距）。

### 损失函数（均方误差）

$$L(w, b) = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2$$

### 梯度下降更新规则

$$w \\leftarrow w - \\alpha \\frac{\\partial L}{\\partial w}$$
$$b \\leftarrow b - \\alpha \\frac{\\partial L}{\\partial b}$$

其中 $\\alpha$ 是学习率。

### 关键概念

| 概念 | 说明 |
|------|------|
| 学习率 | 控制每步更新的步长，太大会震荡，太小收敛慢 |
| 迭代次数 | 梯度下降重复更新的次数 |
| 收敛 | 当损失变化足够小时停止迭代 |
`,
          exercise: { type: 'playground', viz: 'linearRegression' },
        },
        {
          id: 'ml-logistic-regression',
          title: '逻辑回归',
          summary: 'Sigmoid 函数、二分类决策边界',
          theory: `## 逻辑回归

逻辑回归虽然名字里有"回归"，实际上是一个**分类算法**，用于二分类问题。

### 模型

$$\\hat{y} = \\sigma(w^T x + b) = \\frac{1}{1 + e^{-(w^T x + b)}}$$

Sigmoid 函数将任意实数映射到 (0, 1) 区间，输出可解释为概率。

### 损失函数（交叉熵）

$$L = -\\frac{1}{n} \\sum_{i=1}^{n} [y_i \\log(\\hat{y}_i) + (1-y_i) \\log(1-\\hat{y}_i)]$$

### 决策边界

当 $\\hat{y} \\geq 0.5$ 时预测为正类，即 $w^T x + b \\geq 0$。
`,
          exercise: { type: 'playground', viz: 'logisticRegression' },
        },
        {
          id: 'ml-gradient-descent',
          title: '梯度下降优化器',
          summary: 'BGD、SGD、Mini-batch、Momentum、Adam',
          theory: `## 梯度下降家族

梯度下降是神经网络训练的核心优化算法。

### 变体

| 方法 | 每步使用数据 | 特点 |
|------|-------------|------|
| BGD | 全部数据 | 稳定但慢 |
| SGD | 1 个样本 | 快但噪声大 |
| Mini-batch | 小批量 | 折中方案 |
| Momentum | 加入动量 | 加速收敛 |
| Adam | 自适应学习率 | 最常用 |

### Adam 更新规则

$$m_t = \\beta_1 m_{t-1} + (1-\\beta_1) g_t$$
$$v_t = \\beta_2 v_{t-1} + (1-\\beta_2) g_t^2$$
$$\\theta_t = \\theta_{t-1} - \\alpha \\frac{\\hat{m}_t}{\\sqrt{\\hat{v}_t} + \\epsilon}$$
`,
          exercise: { type: 'playground', viz: 'gradientDescent' },
        },
        {
          id: 'ml-knn',
          title: 'K 近邻 (KNN)',
          summary: '距离度量、投票机制、K 值选择',
          theory: `## K 近邻算法

KNN 是一种惰性学习算法，不需要训练过程。

### 算法流程

1. 计算待预测点与所有训练样本的距离
2. 选取距离最近的 K 个邻居
3. 分类：多数投票；回归：取均值

### 距离度量

- **欧氏距离**: $d = \\sqrt{\\sum (x_i - y_i)^2}$
- **曼哈顿距离**: $d = \\sum |x_i - y_i|$
`,
          exercise: { type: 'playground', viz: 'knn' },
        },
        {
          id: 'ml-kmeans',
          title: 'K-Means 聚类',
          summary: '质心迭代、肘部法则、聚类评估',
          theory: `## K-Means 聚类

K-Means 是最经典的无监督聚类算法。

### 算法流程

1. 随机初始化 K 个质心
2. 将每个点分配到最近的质心
3. 重新计算每个簇的质心
4. 重复 2-3 直到收敛

### 评估

- **肘部法则**: 绘制不同 K 值的 WCSS，找拐点
- **轮廓系数**: 衡量簇内紧密度和簇间分离度
`,
          exercise: { type: 'playground', viz: 'kmeans' },
        },
        {
          id: 'ml-decision-tree',
          title: '决策树',
          summary: '信息增益、基尼不纯度、剪枝',
          theory: `## 决策树

决策树通过递归分裂特征空间来构建分类/回归模型。

### 分裂准则

| 准则 | 公式 | 用途 |
|------|------|------|
| 信息增益 | $IG = H(parent) - \\sum \\frac{n_k}{n} H(child_k)$ | ID3 |
| 基尼不纯度 | $Gini = 1 - \\sum p_i^2$ | CART |

### 剪枝

- **预剪枝**: 限制最大深度、最小样本数
- **后剪枝**: 先长满再修剪
`,
          exercise: { type: 'playground', viz: 'decisionTree' },
        },
        {
          id: 'ml-svm',
          title: '支持向量机 (SVM)',
          summary: '最大间隔、核技巧、软间隔',
          theory: `## 支持向量机

SVM 通过找到最大间隔超平面来分类数据。

### 核心概念

- **支持向量**: 离决策边界最近的样本点
- **间隔**: 支持向量到超平面距离的 2 倍
- **核技巧**: 将数据映射到高维空间以处理非线性

### 常用核函数

| 核 | 公式 | 适用场景 |
|-----|------|---------|
| 线性核 | $K(x,y) = x^T y$ | 线性可分 |
| RBF 核 | $K(x,y) = e^{-\\gamma\|x-y\|^2}$ | 通用 |
| 多项式核 | $K(x,y) = (x^T y + c)^d$ | 特定场景 |
`,
          exercise: { type: 'playground', viz: 'svm' },
        },
      ],
    },
    {
      id: 'dl',
      title: '深度学习',
      lessons: [
        {
          id: 'dl-neural-network',
          title: '神经网络基础',
          summary: '感知机、前向传播、反向传播',
          theory: `## 神经网络

神经网络由多层神经元组成，通过前向传播和反向传播学习。

### 前向传播

$$z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}$$
$$a^{[l]} = g(z^{[l]})$$

### 反向传播

$$dz^{[l]} = da^{[l]} * g'(z^{[l]})$$
$$dW^{[l]} = dz^{[l]} a^{[l-1]T}$$
$$db^{[l]} = dz^{[l]}$$

### 激活函数

| 函数 | 公式 | 特点 |
|------|------|------|
| Sigmoid | $\\sigma(z) = \\frac{1}{1+e^{-z}}$ | 输出 (0,1)，梯度消失 |
| ReLU | $\\max(0, z)$ | 训练快，可能死神经元 |
| Tanh | $\\frac{e^z - e^{-z}}{e^z + e^{-z}}$ | 输出 (-1,1) |
`,
          exercise: { type: 'playground', viz: 'neuralNetwork' },
        },
        {
          id: 'dl-cnn',
          title: '卷积神经网络 (CNN)',
          summary: '卷积层、池化层、特征图',
          theory: `## CNN

卷积神经网络专门处理网格结构数据（如图像）。

### 核心层

- **卷积层**: 用滤波器提取局部特征
- **池化层**: 降维，增强平移不变性
- **全连接层**: 最终分类

### 卷积计算

输出尺寸 = $(N - F + 2P) / S + 1$

其中 N=输入尺寸, F=滤波器尺寸, P=填充, S=步长
`,
          exercise: { type: 'playground', viz: 'cnn' },
        },
        {
          id: 'dl-rnn',
          title: '循环神经网络 (RNN)',
          summary: '序列建模、LSTM、GRU',
          theory: `## RNN

循环神经网络处理序列数据，具有记忆能力。

### LSTM 门控机制

- **遗忘门**: 决定丢弃哪些信息
- **输入门**: 决定存储哪些新信息
- **输出门**: 决定输出哪些信息
`,
          exercise: { type: 'playground', viz: 'rnn' },
        },
      ],
    },
    {
      id: 'nlp',
      title: '自然语言处理',
      lessons: [
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
      ],
    },
    {
      id: 'cv',
      title: '计算机视觉',
      lessons: [
        {
          id: 'cv-image-classification',
          title: '图像分类',
          summary: '经典网络架构：LeNet、ResNet、VGG',
          theory: `## 图像分类

使用 CNN 对图像进行类别预测。

### 经典架构

| 网络 | 年份 | 创新 |
|------|------|------|
| LeNet | 1998 | 卷积+池化 |
| AlexNet | 2012 | ReLU、Dropout |
| VGG | 2014 | 小卷积核堆叠 |
| ResNet | 2015 | 残差连接 |
`,
          exercise: { type: 'playground', viz: 'imageClassification' },
        },
        {
          id: 'cv-object-detection',
          title: '目标检测',
          summary: 'YOLO、R-CNN、锚框机制',
          theory: `## 目标检测

在图像中定位并分类多个目标。

### 方法分类

- **两阶段**: R-CNN → Fast R-CNN → Faster R-CNN
- **单阶段**: YOLO、SSD
`,
          exercise: { type: 'playground', viz: 'objectDetection' },
        },
      ],
    },
    {
      id: 'rl',
      title: '强化学习',
      lessons: [
        {
          id: 'rl-qlearning',
          title: 'Q-Learning',
          summary: 'Q 表、贝尔曼方程、ε-greedy 策略',
          theory: `## Q-Learning

基于值函数的无模型强化学习算法。

### Q 值更新

$$Q(s, a) \\leftarrow Q(s, a) + \\alpha [r + \\gamma \\max_{a'} Q(s', a') - Q(s, a)]$$

### 关键参数

- $\\alpha$: 学习率
- $\\gamma$: 折扣因子
- $\\epsilon$: 探索率（ε-greedy）
`,
          exercise: { type: 'playground', viz: 'qlearning' },
        },
        {
          id: 'rl-policy-gradient',
          title: '策略梯度',
          summary: 'REINFORCE 算法、Actor-Critic',
          theory: `## 策略梯度

直接优化策略函数，而非值函数。

### REINFORCE

$$\\nabla J(\\theta) = \\mathbb{E}[\\nabla \\log \\pi_\\theta(a|s) \\cdot G_t]$$
`,
          exercise: { type: 'playground', viz: 'policyGradient' },
        },
      ],
    },
    {
      id: 'llm',
      title: '大语言模型',
      lessons: [
        {
          id: 'llm-pretraining',
          title: '预训练与微调',
          summary: '语言模型预训练、SFT、RLHF',
          theory: `## 大模型训练流程

### 三阶段

1. **预训练**: 在海量文本上学习语言知识
2. **SFT (监督微调)**: 用指令数据微调
3. **RLHF**: 通过人类反馈对齐

### 语言模型目标

$$L = -\\sum \\log P(x_t | x_{<t})$$
`,
          exercise: { type: 'playground', viz: 'pretraining' },
        },
        {
          id: 'llm-rag',
          title: 'RAG 检索增强生成',
          summary: '向量数据库、语义检索、上下文注入',
          theory: `## RAG

将外部知识库与 LLM 结合，减少幻觉。

### 流程

1. 文档切片 → Embedding → 向量数据库
2. 用户查询 → 语义检索 → Top-K 相关片段
3. 将片段注入 Prompt → LLM 生成回答
`,
          exercise: { type: 'playground', viz: 'rag' },
        },
        {
          id: 'llm-agent',
          title: 'AI Agent',
          summary: '工具调用、规划、记忆、多智能体协作',
          theory: `## AI Agent

让 LLM 具备自主行动能力。

### 核心能力

- **规划**: 将复杂任务分解为子步骤
- **工具调用**: 使用 API、代码执行等外部工具
- **记忆**: 短期（上下文）和长期（向量存储）记忆
- **反思**: 评估结果并调整策略
`,
          exercise: { type: 'playground', viz: 'agent' },
        },
      ],
    },
  ],
}

const OPTIMIZATION_ENRICHMENTS = {
  'optim-gd-variants': {
    defaultCodeFocus: 'bgd',
    codeFocusLabels: { bgd: 'BGD', sgd: 'SGD', mini: 'Mini-batch' },
    codeHighlightLines: {
      cpp: { bgd: 25, sgd: 17, mini: 20 },
      python: { bgd: 11, sgd: 5, mini: 8 },
    },
    codeStepHighlightLines: {
      cpp: {
        bgd: [15, 25, 26, 27],
        sgd: [15, 17, 18, 19, 25, 26, 27],
        mini: [15, 20, 21, 22, 25, 26, 27],
      },
      python: {
        bgd: [2, 11, 12, 13],
        sgd: [2, 4, 5, 6, 11, 12, 13],
        mini: [2, 7, 8, 9, 11, 12, 13],
      },
    },
  },
  'optim-momentum': {
    defaultCodeFocus: 'mom09',
    codeFocusLabels: { 'no-mom': '无动量', mom09: 'β=0.9', mom05: 'β=0.5' },
    codeHighlightLines: {
      cpp: { 'no-mom': 8, mom09: 7, mom05: 7, default: 7 },
      python: { 'no-mom': 5, mom09: 4, mom05: 4, default: 4 },
    },
    codeStepHighlightLines: {
      cpp: { default: [7, 8, 9, 10] },
      python: { default: [2, 3, 4, 5] },
    },
    variablesSnapshot: { method: 'Momentum', beta: '0.9', learningRate: '0.02', velocity: '0.00', loss: '-' },
    code: {
      cpp: `struct State {
    double x;
    double velocity;
};

State momentum_step(State s, double lr, double beta) {
    double g = grad(s.x);
    s.velocity = beta * s.velocity + g;
    s.x = s.x - lr * s.velocity;
    return s;
}`,
      python: `def momentum_step(x, velocity, lr, beta):
    g = grad(x)
    velocity = beta * velocity + g
    x = x - lr * velocity
    return x, velocity`,
    },
    pseudocode: `procedure MOMENTUM(theta, velocity, learningRate, beta)
    gradient <- grad(loss, theta)
    velocity <- beta * velocity + gradient
    theta <- theta - learningRate * velocity
    return theta, velocity`,
    bigO: { time: '每步计算一次梯度并更新一次速度，演示为 O(T)。', space: '除轨迹外只保存 velocity，在线更新为 O(1)。', note: 'T 是迭代步数。' },
    compare: [
      { method: '无动量', data: '当前梯度', strength: '简单直接', tradeoff: '狭长谷底容易震荡' },
      { method: 'Momentum', data: '梯度 + 历史速度', strength: '一致方向加速', tradeoff: 'β 过大可能冲过头' },
    ],
    quiz: [{ q: 'Momentum 为什么能减少震荡？', options: ['历史速度会抵消来回变化的梯度分量', '它完全不计算梯度', '它把学习率固定为 0', '它只适用于分类问题'], answer: 0, explanation: '震荡方向的梯度符号经常反转，动量累计后会部分抵消；稳定方向则被持续累积。' }],
  },
  'optim-rmsprop': {
    defaultCodeFocus: 'rms09',
    codeFocusLabels: { rms09: 'β=0.9', rms099: 'β=0.99', fixed: '固定 lr' },
    codeHighlightLines: {
      cpp: { rms09: 8, rms099: 8, fixed: 9, default: 8 },
      python: { rms09: 3, rms099: 3, fixed: 4, default: 3 },
    },
    codeStepHighlightLines: {
      cpp: { default: [7, 8, 9, 10] },
      python: { default: [2, 3, 4, 5] },
    },
    variablesSnapshot: { method: 'RMSProp', beta: '0.9', cache: '0.00', learningRate: '0.1' },
    code: {
      cpp: `struct State {
    double x;
    double cache;
};

State rmsprop_step(State s, double lr, double beta, double eps) {
    double g = grad(s.x);
    s.cache = beta * s.cache + (1 - beta) * g * g;
    s.x = s.x - lr * g / (sqrt(s.cache) + eps);
    return s;
}`,
      python: `def rmsprop_step(x, cache, lr, beta, eps=1e-8):
    g = grad(x)
    cache = beta * cache + (1 - beta) * g * g
    x = x - lr * g / ((cache ** 0.5) + eps)
    return x, cache`,
    },
    pseudocode: `procedure RMSPROP(theta, cache, learningRate, beta)
    gradient <- grad(loss, theta)
    cache <- beta * cache + (1 - beta) * gradient^2
    theta <- theta - learningRate * gradient / (sqrt(cache) + epsilon)
    return theta, cache`,
    bigO: { time: '每步一次梯度和一次逐元素缩放，O(Td)。', space: '需要为每个参数保存二阶滑动平均，O(d)。', note: 'd 是参数维度。' },
    compare: [
      { method: '固定 lr', data: '当前梯度', strength: '开销小', tradeoff: '各方向同一步长' },
      { method: 'RMSProp', data: '梯度平方滑动平均', strength: '自动缩小陡峭方向步长', tradeoff: '需要 β 和 ε' },
    ],
    quiz: [{ q: 'RMSProp 中 cache 变大意味着什么？', options: ['该方向历史梯度较大，实际步长会变小', '学习率会变成无穷大', '梯度被直接置零', '模型已经过拟合'], answer: 0, explanation: '更新分母包含 sqrt(cache)，cache 越大，该方向的实际更新越小。' }],
  },
  'optim-adam': {
    defaultCodeFocus: 'adam',
    codeFocusLabels: { adam: 'Adam', 'adam-fast': '大 lr', 'adam-slow': '小 lr' },
    codeHighlightLines: {
      cpp: { adam: 10, 'adam-fast': 13, 'adam-slow': 13, default: 13 },
      python: { adam: 7, 'adam-fast': 8, 'adam-slow': 8, default: 8 },
    },
    codeStepHighlightLines: {
      cpp: { default: [7, 8, 9, 10, 11, 12, 13, 14] },
      python: { default: [2, 3, 4, 5, 6, 7, 8, 9] },
    },
    variablesSnapshot: { method: 'Adam', learningRate: '0.1', beta1: '0.9', beta2: '0.999' },
    code: {
      cpp: `struct AdamState {
    double x, m, v;
    int t;
};

AdamState adam_step(AdamState s, double lr, double b1, double b2, double eps) {
    double g = grad(s.x);
    s.t += 1;
    s.m = b1 * s.m + (1 - b1) * g;
    s.v = b2 * s.v + (1 - b2) * g * g;
    double mhat = s.m / (1 - pow(b1, s.t));
    double vhat = s.v / (1 - pow(b2, s.t));
    s.x = s.x - lr * mhat / (sqrt(vhat) + eps);
    return s;
}`,
      python: `def adam_step(x, m, v, t, lr, beta1, beta2, eps=1e-8):
    g = grad(x)
    t += 1
    m = beta1 * m + (1 - beta1) * g
    v = beta2 * v + (1 - beta2) * g * g
    m_hat = m / (1 - beta1 ** t)
    v_hat = v / (1 - beta2 ** t)
    x = x - lr * m_hat / ((v_hat ** 0.5) + eps)
    return x, m, v, t`,
    },
    pseudocode: `procedure ADAM(theta, m, v, t)
    g <- grad(loss, theta)
    m <- beta1 * m + (1 - beta1) * g
    v <- beta2 * v + (1 - beta2) * g^2
    mHat <- m / (1 - beta1^t)
    vHat <- v / (1 - beta2^t)
    theta <- theta - learningRate * mHat / (sqrt(vHat) + epsilon)
    return theta, m, v`,
    bigO: { time: '每步 O(d)，总计 O(Td)。', space: '每个参数保存 m 和 v，O(d)。', note: 'Adam 计算略多，但通常减少调参成本。' },
    compare: [
      { method: 'Momentum', data: '一阶矩', strength: '方向加速', tradeoff: '没有自适应缩放' },
      { method: 'RMSProp', data: '二阶矩', strength: '自适应步长', tradeoff: '缺少动量偏差修正' },
      { method: 'Adam', data: '一阶矩 + 二阶矩', strength: '训练深度模型常用', tradeoff: '状态量更多' },
    ],
    quiz: [{ q: 'Adam 为什么要做偏差修正？', options: ['m 和 v 初始为 0，早期估计会偏小', '为了删除梯度', '为了让学习率恒为 1', '为了避免使用平方根'], answer: 0, explanation: 'm、v 从 0 开始会在训练早期低估真实矩，除以 1-β^t 可以减轻这个偏差。' }],
  },
  'optim-lr-compare': {
    defaultCodeFocus: 'lr1',
    codeFocusLabels: { lr01: 'lr=0.01', lr1: 'lr=0.1', lr5: 'lr=0.5', lr105: 'lr=1.05' },
    codeHighlightLines: {
      cpp: { lr01: 3, lr1: 3, lr5: 3, lr105: 3, default: 3 },
      python: { lr01: 4, lr1: 4, lr5: 4, lr105: 4, default: 4 },
    },
    codeStepHighlightLines: {
      cpp: { default: [2, 3, 4] },
      python: { default: [2, 3, 4] },
    },
    variablesSnapshot: { method: 'Learning Rate', learningRate: '-', position: '-', loss: '-' },
    code: {
      cpp: `double gd_update(double x, double lr) {
    double g = grad(x);
    double next = x - lr * g;
    return next;
}`,
      python: `def gd_update(x, lr):
    g = grad(x)
    next_x = x - lr * g
    return next_x`,
    },
    pseudocode: `procedure GD_WITH_LEARNING_RATE(theta, learningRate)
    gradient <- grad(loss, theta)
    theta <- theta - learningRate * gradient
    return theta`,
    bigO: { time: '单条轨迹 O(T)，同时比较 k 个学习率为 O(kT)。', space: '保存 k 条轨迹为 O(kT)。', note: '学习率只改变轨迹，不改变单步渐近复杂度。' },
    compare: [
      { method: '小学习率', data: '小步长', strength: '稳定', tradeoff: '收敛慢' },
      { method: '合适学习率', data: '中等步长', strength: '快且稳定', tradeoff: '需要调参' },
      { method: '过大学习率', data: '大步长', strength: '初期移动快', tradeoff: '震荡或发散' },
    ],
    quiz: [{ q: '学习率过大时最常见的现象是什么？', options: ['在最优点附近震荡甚至发散', '损失必然单调下降', '梯度不再存在', '模型无法计算预测'], answer: 0, explanation: '过大的步长会跨过低谷，在两侧来回跳动，极端时直接发散。' }],
  },
  'optim-newton': {
    defaultCodeFocus: 'newton',
    codeFocusLabels: { newton: 'Newton', gd: 'Gradient Descent' },
    codeHighlightLines: {
      cpp: { newton: 4, gd: 9, default: 4 },
      python: { newton: 4, gd: 8, default: 4 },
    },
    codeStepHighlightLines: {
      cpp: { newton: [2, 3, 4], gd: [8, 9] },
      python: { newton: [2, 3, 4], gd: [7, 8] },
    },
    variablesSnapshot: { method: 'Newton', position: '-', loss: '-', hessian: '-' },
    code: {
      cpp: `double newton_step(double x) {
    double g = grad(x);
    double h = hessian(x);
    return x - g / h;
}

double gradient_step(double x, double lr) {
    double g = grad(x);
    return x - lr * g;
}`,
      python: `def newton_step(x):
    g = grad(x)
    h = hessian(x)
    return x - g / h

def gradient_step(x, lr):
    g = grad(x)
    return x - lr * g`,
    },
    pseudocode: `procedure NEWTON(theta)
    gradient <- grad(loss, theta)
    hessian <- secondDerivative(loss, theta)
    theta <- theta - inverse(hessian) * gradient
    return theta`,
    bigO: { time: '一维演示每步 O(1)；高维精确牛顿法求解 Hessian 线性系统通常为 O(d^3)。', space: '高维 Hessian 存储为 O(d^2)。', note: '拟牛顿法用近似矩阵降低成本。' },
    compare: [
      { method: '梯度下降', data: '一阶导', strength: '便宜通用', tradeoff: '可能需要很多步' },
      { method: '牛顿法', data: '一阶导 + 二阶导', strength: '局部收敛很快', tradeoff: 'Hessian 昂贵且可能不稳定' },
    ],
    quiz: [{ q: '牛顿法为什么常比梯度下降步数少？', options: ['它利用二阶曲率估计低谷形状', '它完全随机搜索', '它不需要损失函数', '它只更新偏置'], answer: 0, explanation: 'Hessian 给出局部曲率，牛顿步等价于在局部二次近似上直接跳到最小点。' }],
  },
  'optim-conjugate-gradient': {
    defaultCodeFocus: 'cg',
    codeFocusLabels: { cg: 'Conjugate Gradient', sd: 'Steepest Descent' },
    codeHighlightLines: {
      cpp: { cg: 11, sd: 2, default: 11 },
      python: { cg: 10, sd: 2, default: 10 },
    },
    codeStepHighlightLines: {
      cpp: { cg: [6, 7, 8, 9, 10, 11], sd: [2] },
      python: { cg: [5, 6, 7, 8, 9, 10], sd: [2] },
    },
    variablesSnapshot: { method: 'CG', residual: '-', direction: '-', loss: '-' },
    code: {
      cpp: `Vector steepest_direction(Vector r) {
    return r;
}

Vector conjugate_gradient_step(Vector x, Vector r, Vector p, Matrix A) {
    double alpha = dot(r, r) / dot(p, A * p);
    Vector xNext = x + alpha * p;
    Vector rNext = r - alpha * (A * p);
    double beta = dot(rNext, rNext) / dot(r, r);
    Vector pNext = rNext + beta * p;
    return xNext;
}`,
      python: `def steepest_direction(r):
    return r

def conjugate_gradient_step(x, r, p, A):
    alpha = dot(r, r) / dot(p, A @ p)
    x_next = x + alpha * p
    r_next = r - alpha * (A @ p)
    beta = dot(r_next, r_next) / dot(r, r)
    p_next = r_next + beta * p
    return x_next, r_next, p_next`,
    },
    pseudocode: `procedure CONJUGATE_GRADIENT(A, b)
    r <- b - A*x
    p <- r
    repeat
        alpha <- (r^T r) / (p^T A p)
        x <- x + alpha * p
        rNew <- r - alpha * A p
        beta <- (rNew^T rNew) / (r^T r)
        p <- rNew + beta * p
        r <- rNew
    until residual is small`,
    bigO: { time: '每步主要是矩阵向量乘法，稠密矩阵 O(d^2)，稀疏矩阵约 O(nnz)。', space: '保存 x、r、p 等向量 O(d)。', note: '理想精确算术下 d 步内收敛。' },
    compare: [
      { method: '最速下降', data: '残差方向', strength: '简单', tradeoff: '方向会反复纠正' },
      { method: '共轭梯度', data: 'A-共轭方向', strength: '避免重复搜索', tradeoff: '要求问题接近二次型/正定线性系统' },
    ],
    quiz: [{ q: '共轭梯度法的 p 方向为什么特殊？', options: ['不同方向关于 A 共轭，避免重复优化同一方向', '它总是随机选取', '它必须等于 0', '它只用于图像分类'], answer: 0, explanation: 'A-共轭方向让二次函数在已搜索方向上的最优性不被后续步骤破坏。' }],
  },
  'optim-line-search': {
    defaultCodeFocus: 'golden',
    codeFocusLabels: { golden: 'Golden Section', backtrack: 'Backtracking' },
    codeHighlightLines: {
      cpp: { golden: 9, backtrack: 16, default: 9 },
      python: { golden: 10, backtrack: 16, default: 10 },
    },
    codeStepHighlightLines: {
      cpp: { golden: [3, 4, 6, 8, 9, 11], backtrack: [15, 16, 18] },
      python: { golden: [3, 4, 6, 10, 11, 12], backtrack: [15, 16, 17] },
    },
    variablesSnapshot: { method: 'Line Search', alpha: '-', interval: '-', loss: '-' },
    code: {
      cpp: `double golden_section(double a, double b) {
    const double rho = 0.6180339887;
    double c = b - rho * (b - a);
    double d = a + rho * (b - a);
    while (b - a > 1e-6) {
        if (phi(c) < phi(d)) b = d;
        else a = c;
        c = b - rho * (b - a);
        d = a + rho * (b - a);
    }
    return (a + b) / 2;
}

double backtracking(double alpha, Vector theta, Vector direction) {
    while (f(theta + alpha * direction) > armijo_bound(theta, direction, alpha)) {
        alpha *= 0.5;
    }
    return alpha;
}`,
      python: `def golden_section(a, b):
    rho = 0.6180339887
    c = b - rho * (b - a)
    d = a + rho * (b - a)
    while b - a > 1e-6:
        if phi(c) < phi(d):
            b = d
        else:
            a = c
        c = b - rho * (b - a)
        d = a + rho * (b - a)
    return (a + b) / 2

def backtracking(alpha, theta, direction):
    while f(theta + alpha * direction) > armijo_bound(theta, direction, alpha):
        alpha *= 0.5
    return alpha`,
    },
    pseudocode: `procedure BACKTRACKING(theta, direction, alpha)
    while Armijo condition is not satisfied do
        alpha <- rho * alpha
    end while
    return alpha`,
    bigO: { time: '黄金分割搜索迭代次数为 O(log((b-a)/ε))；回溯与收缩次数有关。', space: '只保存少量标量，O(1)。', note: '线搜索减少手动选学习率的风险。' },
    compare: [
      { method: '黄金分割', data: '函数值比较', strength: '无需梯度', tradeoff: '适合一维精确搜索' },
      { method: '回溯线搜索', data: 'Armijo 条件', strength: '实现简单，常用于下降方向', tradeoff: '依赖初始步长和收缩率' },
    ],
    quiz: [{ q: '回溯线搜索不断缩小 alpha 是为了什么？', options: ['直到当前步能带来足够下降', '让梯度变成 0', '增加模型参数数量', '删除搜索方向'], answer: 0, explanation: 'Armijo 条件要求步长带来足够的函数下降，不满足时就缩小 alpha。' }],
  },
  'optim-ga': {
    defaultCodeFocus: 'default',
    codeFocusLabels: { default: '默认参数', large: '大种群', 'high-mut': '高变异率' },
    codeHighlightLines: {
      cpp: { default: 6, large: 2, 'high-mut': 5 },
      python: { default: 6, large: 2, 'high-mut': 5 },
    },
    codeStepHighlightLines: {
      cpp: { default: [2, 3, 4, 5, 6] },
      python: { default: [2, 3, 4, 5, 6] },
    },
    variablesSnapshot: { method: 'GA', population: '30', mutationRate: '0.05', bestFitness: '-' },
    code: {
      cpp: `Population ga_generation(Population pop, double crossRate, double mutRate) {
    vector<double> fitness = evaluate(pop);
    Population parents = selection(pop, fitness);
    Population children = crossover(parents, crossRate);
    mutate(children, mutRate);
    return elitism(pop, children, fitness);
}`,
      python: `def ga_generation(population, cross_rate, mutation_rate):
    fitness = evaluate(population)
    parents = selection(population, fitness)
    children = crossover(parents, cross_rate)
    children = mutate(children, mutation_rate)
    return elitism(population, children, fitness)`,
    },
    pseudocode: `procedure GENETIC_ALGORITHM(population)
    evaluate fitness
    parents <- select(population)
    children <- crossover(parents)
    children <- mutate(children)
    population <- keep best individuals
    return population`,
    bigO: { time: '每代评估 P 个个体，T 代约 O(TP * cost(fitness))。', space: '保存种群和子代，O(Pd)。', note: 'P 是种群大小，d 是个体维度。' },
    compare: [
      { method: '小种群', data: '少量个体', strength: '快', tradeoff: '多样性不足' },
      { method: '大种群', data: '更多个体', strength: '探索更广', tradeoff: '评估成本高' },
      { method: '高变异', data: '更强随机扰动', strength: '不易早熟', tradeoff: '收敛更慢' },
    ],
    quiz: [{ q: '遗传算法中变异的主要作用是什么？', options: ['引入新基因，维持搜索多样性', '保证每代完全相同', '替代适应度函数', '让学习率衰减'], answer: 0, explanation: '变异提供随机探索，避免种群过早集中到局部最优附近。' }],
  },
  'optim-pso': {
    defaultCodeFocus: 'default',
    codeFocusLabels: { default: '标准 PSO', inertia: '高惯性', social: '社会导向' },
    codeHighlightLines: {
      cpp: { default: 4, inertia: 4, social: 6 },
      python: { default: 4, inertia: 5, social: 7 },
    },
    codeStepHighlightLines: {
      cpp: { default: [2, 3, 4, 5, 6, 7, 8] },
      python: { default: [2, 3, 4, 5, 6, 7, 9, 10] },
    },
    variablesSnapshot: { method: 'PSO', inertia: '0.7', c1: '1.5', c2: '1.5', bestFitness: '-' },
    code: {
      cpp: `Particle pso_step(Particle p, Point globalBest, double w, double c1, double c2) {
    double r1 = random01();
    double r2 = random01();
    p.velocity = w * p.velocity
        + c1 * r1 * (p.personalBest - p.position)
        + c2 * r2 * (globalBest - p.position);
    p.position = p.position + p.velocity;
    return p;
}`,
      python: `def pso_step(particle, global_best, w, c1, c2):
    r1 = random01()
    r2 = random01()
    particle.velocity = (
        w * particle.velocity
        + c1 * r1 * (particle.personal_best - particle.position)
        + c2 * r2 * (global_best - particle.position)
    )
    particle.position = particle.position + particle.velocity
    return particle`,
    },
    pseudocode: `procedure PSO_STEP(particle, globalBest)
    velocity <- w*velocity + c1*r1*(personalBest-position) + c2*r2*(globalBest-position)
    position <- position + velocity
    update personalBest and globalBest`,
    bigO: { time: '每轮更新 P 个粒子并评估适应度，O(TP * cost(fitness))。', space: '保存粒子位置、速度和历史最优，O(Pd)。', note: 'P 是粒子数。' },
    compare: [
      { method: '高惯性', data: '较大 w', strength: '探索范围大', tradeoff: '可能越过最优区' },
      { method: '社会导向', data: '较大 c2', strength: '快速追随群体最优', tradeoff: '可能过早收敛' },
    ],
    quiz: [{ q: 'PSO 中 c2 项代表什么？', options: ['飞向全局最优的社会学习项', '损失函数的二阶导', '变异概率', '梯度噪声'], answer: 0, explanation: 'c2*r2*(globalBest-position) 让粒子向群体发现的最好位置靠近。' }],
  },
  'optim-sa': {
    defaultCodeFocus: 'slow',
    codeFocusLabels: { slow: '慢降温', fast: '快降温', hot: '高温' },
    codeHighlightLines: {
      cpp: { slow: 7, fast: 7, hot: 4 },
      python: { slow: 6, fast: 6, hot: 4 },
    },
    codeStepHighlightLines: {
      cpp: { default: [2, 3, 4, 5, 7, 8] },
      python: { default: [2, 3, 4, 5, 6, 7] },
    },
    variablesSnapshot: { method: 'SA', temperature: '-', alpha: '-', loss: '-' },
    code: {
      cpp: `State anneal_step(State current, double temperature, double alpha) {
    State candidate = neighbor(current);
    double delta = energy(candidate) - energy(current);
    if (delta < 0 || random01() < exp(-delta / temperature)) {
        current = candidate;
    }
    temperature *= alpha;
    return current;
}`,
      python: `def anneal_step(current, temperature, alpha):
    candidate = neighbor(current)
    delta = energy(candidate) - energy(current)
    if delta < 0 or random01() < exp(-delta / temperature):
        current = candidate
    temperature *= alpha
    return current, temperature`,
    },
    pseudocode: `procedure SIMULATED_ANNEALING(state, temperature)
    candidate <- random neighbor(state)
    delta <- energy(candidate) - energy(state)
    if delta < 0 or random() < exp(-delta / temperature)
        state <- candidate
    temperature <- alpha * temperature
    return state, temperature`,
    bigO: { time: '每轮生成一个邻域解并评估，O(T * cost(energy))。', space: '保存当前解、候选解和最优解，O(d)。', note: '降温慢通常质量更好但计算更久。' },
    compare: [
      { method: '慢降温', data: 'alpha 接近 1', strength: '探索充分', tradeoff: '计算更慢' },
      { method: '快降温', data: 'alpha 较小', strength: '快速收敛', tradeoff: '更易陷入局部最优' },
      { method: '高温', data: '初始 T 大', strength: '更敢接受差解', tradeoff: '早期波动更大' },
    ],
    quiz: [{ q: '模拟退火为什么有时会接受更差解？', options: ['为了跳出局部最优，接受概率由温度控制', '因为它没有目标函数', '因为所有差解都必须接受', '因为温度越低越随机'], answer: 0, explanation: 'Metropolis 准则让高温阶段保留探索能力，随着温度下降逐渐转向收敛。' }],
  },
}

for (const lesson of AI_CURRICULUM.chapters.find(ch => ch.id === 'optim')?.lessons || []) {
  if (OPTIMIZATION_ENRICHMENTS[lesson.id]) {
    Object.assign(lesson, OPTIMIZATION_ENRICHMENTS[lesson.id])
  }
}

const ML_ENRICHMENTS = {
  'ml-linear-regression': {
    defaultCodeFocus: 'standard',
    codeFocusLabels: { standard: '标准训练', slow: '小学习率', biased: '高截距初始' },
    codeHighlightLines: {
      cpp: { standard: 15, slow: 15, biased: 16, default: 15 },
      python: { standard: 11, slow: 11, biased: 12, default: 11 },
    },
    codeStepHighlightLines: {
      cpp: { default: [8, 9, 10, 11, 13, 14, 15, 16, 17] },
      python: { default: [5, 6, 7, 8, 9, 10, 11, 12, 13] },
    },
    variablesSnapshot: { method: 'Linear Regression', weight: '-', bias: '-', mse: '-' },
    code: {
      cpp: `struct LinearModel {
    double w, b;
};

LinearModel train_step(LinearModel m, vector<Point> data, double lr) {
    double gradW = 0, gradB = 0;
    for (auto p : data) {
        double pred = m.w * p.x + m.b;
        double err = pred - p.y;
        gradW += err * p.x;
        gradB += err;
    }
    gradW = 2.0 * gradW / data.size();
    gradB = 2.0 * gradB / data.size();
    m.w -= lr * gradW;
    m.b -= lr * gradB;
    return m;
}`,
      python: `def train_step(w, b, data, lr):
    grad_w = 0.0
    grad_b = 0.0
    for x, y in data:
        pred = w * x + b
        err = pred - y
        grad_w += err * x
        grad_b += err
    grad_w = 2 * grad_w / len(data)
    grad_b = 2 * grad_b / len(data)
    w -= lr * grad_w
    b -= lr * grad_b
    return w, b`,
    },
    pseudocode: `procedure LINEAR_REGRESSION_STEP(model, data, learningRate)
    gradW <- 0
    gradB <- 0
    for each sample (x, y) in data do
        pred <- w*x + b
        error <- pred - y
        gradW <- gradW + error*x
        gradB <- gradB + error
    end for
    w <- w - learningRate * 2*gradW/N
    b <- b - learningRate * 2*gradB/N`,
    bigO: { time: '每轮扫描 N 个样本、d 个特征为 O(Nd)，T 轮为 O(TNd)。', space: '参数向量 O(d)，演示中的轨迹另计 O(T)。', note: '单变量演示中 d=1。' },
    compare: [
      { method: '解析解', data: '矩阵整体求解', strength: '一步得到最优', tradeoff: '高维矩阵求逆昂贵' },
      { method: '梯度下降', data: '批量样本梯度', strength: '适合大数据和流式训练', tradeoff: '需要学习率和迭代次数' },
    ],
    quiz: [{ q: '线性回归最小化的常见目标是什么？', options: ['均方误差 MSE', '交叉熵', '信息增益', '最大间隔'], answer: 0, explanation: '线性回归通常最小化预测值和真实值之间的平方误差平均值。' }],
  },
  'ml-logistic-regression': {
    defaultCodeFocus: 'standard',
    codeFocusLabels: { standard: '标准训练', regularized: 'L2 正则', fast: '大步长' },
    codeHighlightLines: {
      cpp: { standard: 14, regularized: 14, fast: 14, default: 14 },
      python: { standard: 11, regularized: 11, fast: 11, default: 11 },
    },
    codeStepHighlightLines: {
      cpp: { default: [8, 9, 10, 11, 12, 13, 14, 15, 16] },
      python: { default: [5, 6, 7, 8, 9, 10, 11, 12, 13] },
    },
    variablesSnapshot: { method: 'Logistic Regression', probability: '-', accuracy: '-', loss: '-' },
    code: {
      cpp: `double sigmoid(double z) {
    return 1.0 / (1.0 + exp(-z));
}

LogisticModel train_step(LogisticModel m, vector<Sample> data, double lr, double lambda) {
    double gw1 = 0, gw2 = 0, gb = 0;
    for (auto s : data) {
        double z = m.w1 * s.x1 + m.w2 * s.x2 + m.b;
        double p = sigmoid(z);
        double err = p - s.label;
        gw1 += err * s.x1;
        gw2 += err * s.x2;
        gb += err;
    }
    m.w1 -= lr * (gw1 / data.size() + lambda * m.w1);
    m.w2 -= lr * (gw2 / data.size() + lambda * m.w2);
    m.b -= lr * gb / data.size();
    return m;
}`,
      python: `def sigmoid(z):
    return 1 / (1 + exp(-z))

def train_step(w1, w2, b, data, lr, l2):
    gw1 = gw2 = gb = 0.0
    for x1, x2, y in data:
        p = sigmoid(w1 * x1 + w2 * x2 + b)
        err = p - y
        gw1 += err * x1
        gw2 += err * x2
        gb += err
    w1 -= lr * (gw1 / len(data) + l2 * w1)
    w2 -= lr * (gw2 / len(data) + l2 * w2)
    b -= lr * gb / len(data)
    return w1, w2, b`,
    },
    pseudocode: `procedure LOGISTIC_REGRESSION_STEP(model, data)
    for each sample do
        probability <- sigmoid(w dot x + b)
        error <- probability - label
        accumulate gradient
    end for
    update weights with gradient and optional L2 penalty`,
    bigO: { time: '每轮 O(Nd)，T 轮 O(TNd)。预测单样本 O(d)。', space: '参数 O(d)，不需要保存训练历史。', note: '二分类使用 sigmoid，多分类常用 softmax。' },
    compare: [
      { method: '线性回归', data: '连续输出', strength: '适合数值预测', tradeoff: '输出不受 0-1 限制' },
      { method: '逻辑回归', data: '概率输出', strength: '适合线性可分分类', tradeoff: '边界仍是线性的' },
    ],
    quiz: [{ q: '逻辑回归为什么输出可以解释为概率？', options: ['使用 sigmoid 把线性分数压到 0 到 1', '直接返回输入特征', '使用欧氏距离投票', '使用树的叶子节点'], answer: 0, explanation: 'sigmoid(z)=1/(1+e^-z) 会把任意实数映射到 0 到 1。' }],
  },
  'ml-gradient-descent': {
    defaultCodeFocus: 'quad',
    codeFocusLabels: { quad: '二次函数', cubic: '三次函数', slow: '慢学习率', fast: '快学习率' },
    codeHighlightLines: {
      cpp: { quad: 4, cubic: 4, slow: 4, fast: 4, default: 4 },
      python: { quad: 3, cubic: 3, slow: 3, fast: 3, default: 3 },
    },
    codeStepHighlightLines: {
      cpp: { default: [2, 3, 4, 5] },
      python: { default: [2, 3, 4] },
    },
    variablesSnapshot: { method: 'Gradient Descent', learningRate: '-', position: '-', loss: '-' },
    code: {
      cpp: `double gd_step(double x, double lr) {
    double y = loss(x);
    double g = grad(x);
    double next = x - lr * g;
    return next;
}`,
      python: `def gd_step(x, lr):
    y = loss(x)
    g = grad(x)
    return x - lr * g`,
    },
    pseudocode: `procedure GRADIENT_DESCENT(x, learningRate)
    repeat
        y <- loss(x)
        g <- grad(loss, x)
        x <- x - learningRate * g
    until convergence`,
    bigO: { time: '每步一次梯度，T 步为 O(T * cost(grad))。', space: '在线更新 O(1)，若保存轨迹为 O(T)。', note: '学习率影响轨迹，不改变单步复杂度。' },
    compare: [
      { method: '小学习率', data: '小步移动', strength: '稳定', tradeoff: '收敛慢' },
      { method: '大学习率', data: '大步移动', strength: '可能很快', tradeoff: '易震荡或发散' },
    ],
    quiz: [{ q: '梯度下降中负梯度方向代表什么？', options: ['局部最快下降方向', '局部最快上升方向', '随机方向', '分类边界'], answer: 0, explanation: '梯度指向函数上升最快方向，所以负梯度是局部下降最快方向。' }],
  },
  'ml-knn': {
    defaultCodeFocus: 'k3',
    codeFocusLabels: { k3: 'k=3', k5: 'k=5', k7: 'k=7' },
    codeHighlightLines: {
      cpp: { k3: 7, k5: 7, k7: 7, default: 7 },
      python: { k3: 7, k5: 7, k7: 7, default: 7 },
    },
    codeStepHighlightLines: {
      cpp: { default: [3, 4, 5, 7, 8, 9] },
      python: { default: [3, 4, 5, 7, 8, 9] },
    },
    variablesSnapshot: { method: 'KNN', k: '3', radius: '-', prediction: '-' },
    code: {
      cpp: `int predict_knn(Point query, vector<Sample> train, int k) {
    vector<pair<double, int>> distances;
    for (auto s : train) {
        distances.push_back({euclidean(query, s.point), s.label});
    }
    sort(distances.begin(), distances.end());
    int vote = 0;
    for (int i = 0; i < k; ++i) {
        vote += distances[i].second == 1 ? 1 : -1;
    }
    return vote >= 0 ? 1 : 0;
}`,
      python: `def predict_knn(query, train, k):
    distances = []
    for x, y, label in train:
        d = euclidean(query, (x, y))
        distances.append((d, label))
    distances.sort()
    vote = 0
    for _, label in distances[:k]:
        vote += 1 if label == 1 else -1
    return 1 if vote >= 0 else 0`,
    },
    pseudocode: `procedure KNN_PREDICT(query, train, k)
    distances <- []
    for each sample in train do
        append distance(query, sample)
    sort distances ascending
    return majority label among first k`,
    bigO: { time: '朴素预测需要计算 N 个距离并排序，O(Nd + N log N)；用选择算法可降到 O(Nd + N)。', space: '保存距离 O(N)，训练阶段几乎只是存数据。', note: 'KNN 是惰性学习，主要成本在预测时。' },
    compare: [
      { method: '小 k', data: '很近的邻居', strength: '边界灵活', tradeoff: '对噪声敏感' },
      { method: '大 k', data: '更多邻居投票', strength: '更平滑', tradeoff: '可能欠拟合' },
    ],
    quiz: [{ q: 'KNN 为什么常需要特征归一化？', options: ['距离会被尺度大的特征主导', '它不能处理数字', '它不使用训练数据', '它只能做回归'], answer: 0, explanation: '欧氏距离对量纲敏感，尺度大的特征会压过其它特征。' }],
  },
  'ml-kmeans': {
    defaultCodeFocus: 'k2',
    codeFocusLabels: { k2: 'k=2', k3: 'k=3' },
    codeHighlightLines: {
      cpp: { k2: 9, k3: 9, default: 9 },
      python: { k2: 6, k3: 6, default: 6 },
    },
    codeStepHighlightLines: {
      cpp: { default: [4, 5, 6, 8, 9, 10] },
      python: { default: [3, 4, 5, 6, 7] },
    },
    variablesSnapshot: { method: 'K-Means', inertia: '-', centroidShift: '-', phase: '-' },
    code: {
      cpp: `void kmeans_step(vector<Point> data, vector<Point>& centers) {
    vector<int> assign(data.size());
    for (int i = 0; i < data.size(); ++i) {
        assign[i] = nearest_center(data[i], centers);
    }
    for (int c = 0; c < centers.size(); ++c) {
        vector<Point> cluster = collect(data, assign, c);
        centers[c] = mean(cluster);
    }
}`,
      python: `def kmeans_step(data, centers):
    assignments = []
    for point in data:
        assignments.append(nearest_center(point, centers))
    for c in range(len(centers)):
        cluster = [p for p, a in zip(data, assignments) if a == c]
        centers[c] = mean(cluster)
    return centers, assignments`,
    },
    pseudocode: `procedure KMEANS(data, k)
    initialize k centers
    repeat
        assign each point to nearest center
        move each center to mean of assigned points
    until centers stop moving`,
    bigO: { time: '每轮为每个样本计算 k 个中心距离，O(Nkd)，T 轮为 O(TNkd)。', space: '保存中心 O(kd) 和分配 O(N)。', note: '结果依赖初始化，常多次随机重启。' },
    compare: [
      { method: 'k=2', data: '两个中心', strength: '简单稳定', tradeoff: '无法表达更多簇' },
      { method: 'k=3', data: '三个中心', strength: '更细分', tradeoff: 'k 过大可能切碎自然簇' },
    ],
    quiz: [{ q: 'K-Means 每轮包含哪两个核心步骤？', options: ['分配样本和更新中心', '计算 sigmoid 和反向传播', '构造树和剪枝', '寻找最大间隔'], answer: 0, explanation: 'K-Means 交替进行“最近中心分配”和“按均值移动中心”。' }],
  },
  'ml-decision-tree': {
    defaultCodeFocus: 'gini',
    codeFocusLabels: { gini: 'Gini', entropy: 'Entropy' },
    codeHighlightLines: {
      cpp: { gini: 8, entropy: 8, default: 8 },
      python: { gini: 5, entropy: 5, default: 5 },
    },
    codeStepHighlightLines: {
      cpp: { default: [3, 4, 5, 8, 9, 10] },
      python: { default: [3, 4, 5, 7, 8] },
    },
    variablesSnapshot: { method: 'Decision Tree', phase: '-', impurity: '-' },
    code: {
      cpp: `Split choose_best_split(vector<Sample> data) {
    Split best;
    double bestGain = -1;
    for (auto split : all_candidate_splits(data)) {
        auto [left, right] = partition(data, split);
        double gain = impurity(data) - weighted_impurity(left, right);
        if (gain > bestGain) {
            bestGain = gain;
            best = split;
        }
    }
    return best;
}`,
      python: `def choose_best_split(data):
    best_gain = -1
    best_split = None
    for split in all_candidate_splits(data):
        left, right = partition(data, split)
        gain = impurity(data) - weighted_impurity(left, right)
        if gain > best_gain:
            best_gain = gain
            best_split = split
    return best_split`,
    },
    pseudocode: `procedure BUILD_TREE(data)
    if node is pure or too small then return leaf
    best <- argmax information_gain(split)
    split data by best
    build left child and right child recursively`,
    bigO: { time: '朴素训练每层扫描候选切分，常见实现约 O(Nd log N) 到 O(NdN)。预测为树深度 O(depth)。', space: '树节点 O(number of nodes)。', note: '剪枝和深度限制用于控制过拟合。' },
    compare: [
      { method: 'Gini', data: '类别混杂度', strength: '计算简单', tradeoff: '和信息熵结果通常接近' },
      { method: 'Entropy', data: '信息量', strength: '解释为信息增益', tradeoff: '含 log 计算略重' },
    ],
    quiz: [{ q: '决策树选择切分时通常最大化什么？', options: ['不纯度下降或信息增益', '学习率', '欧氏距离', '间隔宽度'], answer: 0, explanation: '好的切分会让子节点更纯，即让 Gini/Entropy 等不纯度下降最多。' }],
  },
  'ml-svm': {
    defaultCodeFocus: 'hard',
    codeFocusLabels: { hard: '硬间隔', soft: '软间隔' },
    codeHighlightLines: {
      cpp: { hard: 7, soft: 8, default: 7 },
      python: { hard: 5, soft: 6, default: 5 },
    },
    codeStepHighlightLines: {
      cpp: { default: [3, 4, 5, 6, 7, 8] },
      python: { default: [3, 4, 5, 6, 7] },
    },
    variablesSnapshot: { method: 'SVM', margin: '-', hingeLoss: '-', supportVectors: '-' },
    code: {
      cpp: `double svm_objective(Vector w, double b, vector<Sample> data, double C) {
    double reg = 0.5 * dot(w, w);
    double penalty = 0;
    for (auto s : data) {
        double score = s.y * (dot(w, s.x) + b);
        penalty += max(0.0, 1.0 - score);
    }
    return reg + C * penalty;
}`,
      python: `def svm_objective(w, b, data, C):
    reg = 0.5 * dot(w, w)
    penalty = 0.0
    for x, y in data:
        score = y * (dot(w, x) + b)
        penalty += max(0.0, 1.0 - score)
    return reg + C * penalty`,
    },
    pseudocode: `procedure TRAIN_LINEAR_SVM(data, C)
    minimize 1/2 ||w||^2 + C * sum hinge_loss
    where hinge_loss = max(0, 1 - y*(w dot x + b))
    support vectors are points near the margin`,
    bigO: { time: '线性 SVM 的现代优化通常接近 O(TNd)；核 SVM 训练可能到 O(N^2) 或 O(N^3)。', space: '线性模型 O(d)，核方法需要保存支持向量。', note: '支持向量决定最终边界。' },
    compare: [
      { method: '硬间隔', data: '不允许错分', strength: '间隔清晰', tradeoff: '要求线性可分且怕噪声' },
      { method: '软间隔', data: '允许 hinge 惩罚', strength: '更抗噪', tradeoff: '需要调 C' },
    ],
    quiz: [{ q: 'SVM 中支持向量是什么？', options: ['离分隔边界最近、决定间隔的样本', '所有训练样本的均值', '随机初始化的中心', '树的叶子节点'], answer: 0, explanation: '支持向量位于间隔边界附近，对最大间隔超平面起决定作用。' }],
  },
}

for (const lesson of AI_CURRICULUM.chapters.find(ch => ch.id === 'ml')?.lessons || []) {
  if (ML_ENRICHMENTS[lesson.id]) {
    Object.assign(lesson, ML_ENRICHMENTS[lesson.id])
  }
}

// 构建扁平查找表
export const AI_LESSON_MAP = Object.fromEntries(
  AI_CURRICULUM.chapters.flatMap(ch =>
    ch.lessons.map(l => [l.id, l])
  )
)

// 总课节数
export const AI_TOTAL_LESSONS = AI_CURRICULUM.chapters.reduce(
  (sum, ch) => sum + ch.lessons.length, 0
)
