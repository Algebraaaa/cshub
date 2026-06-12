// AI 专业课 · 最优化方法（optim）章节课节数据
// 从 curriculum.js 原样拆出（2026-06）。补全/注入逻辑（AI_COMPLETION_DEFAULTS、
// LATE_COURSE_CODE、completeAILessonMetadata）仍在 ../curriculum.js，
// 模块加载时会原位向这些 lesson 对象补字段。
export const OPTIM_LESSONS = [
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
        {
          id: 'optim-nesterov',
          title: 'Nesterov 加速梯度',
          summary: 'Look-ahead 梯度：先看一步再决定方向',
          theory: `## Nesterov Accelerated Gradient (NAG)

Nesterov 动量在普通 Momentum 基础上，**先"看"一步 lookahead 位置**，再在该位置计算梯度：

$$v_t = \\beta v_{t-1} + \\nabla L(\\theta - \\beta v_{t-1})$$
$$\\theta_{t+1} = \\theta_t - \\alpha v_t$$

### 与 Momentum 的区别

| 方法 | 梯度计算位置 | 效果 |
|------|------------|------|
| Momentum | 当前位置 $\\theta_t$ | 简单累积速度 |
| Nesterov | 前瞻位置 $\\theta - \\beta v$ | 更好的"刹车"能力 |

Nesterov 在即将到达谷底时能更早减速，减少冲过头的现象。
`,
          exercise: { type: 'playground', viz: 'nesterov' },
          code: {
            cpp: `State nesterov_step(State s, double lr, double beta) {
    double lookahead = s.x - beta * s.velocity;
    double g = grad(lookahead);
    s.velocity = beta * s.velocity + g;
    s.x = s.x - lr * s.velocity;
    return s;
}`,
            python: `def nesterov_step(x, velocity, lr, beta):
    lookahead = x - beta * velocity
    g = grad(lookahead)
    velocity = beta * velocity + g
    x = x - lr * velocity
    return x, velocity`,
          },
          pseudocode: `procedure NESTEROV(theta, velocity, lr, beta)
    lookahead <- theta - beta * velocity
    gradient <- grad(loss, lookahead)
    velocity <- beta * velocity + gradient
    theta <- theta - lr * velocity
    return theta, velocity`,
        },
        {
          id: 'optim-adagrad',
          title: 'AdaGrad 自适应学习率',
          summary: '梯度平方累积，自动缩小频繁方向的步长',
          theory: `## AdaGrad

AdaGrad 为每个参数维护独立的学习率，通过累积历史梯度的平方：

$$G_t = G_{t-1} + g_t^2$$
$$\\theta_{t+1} = \\theta_t - \\frac{\\alpha}{\\sqrt{G_t} + \\epsilon} g_t$$

### 特点

- 频繁出现的大梯度 → $G_t$ 增长快 → 有效学习率快速下降
- 罕见的小梯度 → $G_t$ 增长慢 → 有效学习率保持较大
- 缺点：$G_t$ 单调递增，最终学习率趋近于 0（RMSProp 和 Adam 解决了这个问题）
`,
          exercise: { type: 'playground', viz: 'adagrad' },
          code: {
            cpp: `State adagrad_step(State s, double lr, double eps) {
    double g = grad(s.x);
    s.cache += g * g;
    s.x -= lr * g / (sqrt(s.cache) + eps);
    return s;
}`,
            python: `def adagrad_step(x, cache, lr, eps=1e-8):
    g = grad(x)
    cache += g * g
    x -= lr * g / (cache ** 0.5 + eps)
    return x, cache`,
          },
          pseudocode: `procedure ADAGRAD(theta, cache, lr)
    gradient <- grad(loss, theta)
    cache <- cache + gradient^2
    theta <- theta - lr * gradient / (sqrt(cache) + eps)
    return theta, cache`,
        },
        {
          id: 'optim-bfgs',
          title: 'BFGS 拟牛顿法',
          summary: '近似 Hessian 逆矩阵，超线性收敛',
          theory: `## BFGS (Broyden-Fletcher-Goldfarb-Shanno)

BFGS 是一种**拟牛顿法**，不需要计算真实的 Hessian 矩阵，而是通过梯度变化来逐步近似 Hessian 的逆：

$$H_{k+1} = (I - \\rho_k s_k y_k^T) H_k (I - \\rho_k y_k s_k^T) + \\rho_k s_k s_k^T$$

其中 $s_k = x_{k+1} - x_k$, $y_k = \\nabla f_{k+1} - \\nabla f_k$, $\\rho_k = 1/(y_k^T s_k)$

### 搜索方向

$$d_k = -H_k \\nabla f(x_k)$$

### 优势

- 超线性收敛（介于线性和二次之间）
- 不需要计算或存储完整 Hessian
- L-BFGS 变体只需存储最近 m 对 $(s_k, y_k)$，适合大规模问题
`,
          exercise: { type: 'playground', viz: 'bfgs' },
          code: {
            cpp: `Vector bfgs_direction(Vector grad, Matrix H) {
    return -H * grad;  // 搜索方向
}

Matrix bfgs_update(Matrix H, Vector s, Vector y) {
    double rho = 1.0 / dot(y, s);
    Matrix I = identity(H.size());
    Matrix A = I - rho * outer(s, y);
    Matrix B = I - rho * outer(y, s);
    return A * H * B + rho * outer(s, s);
}`,
            python: `def bfgs_direction(grad, H_inv):
    return -H_inv @ grad

def bfgs_update(H_inv, s, y):
    rho = 1.0 / (y @ s)
    I = np.eye(len(s))
    A = I - rho * np.outer(s, y)
    B = I - rho * np.outer(y, s)
    return A @ H_inv @ B + rho * np.outer(s, s)`,
          },
          pseudocode: `procedure BFGS_STEP(x, grad, H_inv)
    direction <- -H_inv * grad
    alpha <- line_search(x, direction)
    s <- alpha * direction
    x_new <- x + s
    y <- grad(x_new) - grad
    H_inv <- bfgs_update(H_inv, s, y)
    return x_new, H_inv`,
        },
        {
          id: 'optim-coordinate-descent',
          title: '坐标下降法',
          summary: '每步只优化一个坐标/参数',
          theory: `## 坐标下降法 (Coordinate Descent)

每次只更新一个参数（坐标），轮流遍历所有维度：

$$\\theta_i^{(t+1)} = \\arg\\min_{\\theta_i} L(\\theta_1^{(t+1)}, \\ldots, \\theta_{i-1}^{(t+1)}, \\theta_i, \\theta_{i+1}^{(t)}, \\ldots)$$

### 适用场景

- Lasso 回归（L1 正则化）—— 有闭式解
- 大规模稀疏问题
- 不可分离但坐标方向简单的目标

### 优点

- 每步只需一维优化，简单高效
- 适合 L1 正则（软阈值操作）
- 对某些问题比全梯度更快
`,
          exercise: { type: 'playground', viz: 'coordinateDescent' },
          code: {
            cpp: `double soft_threshold(double z, double lambda) {
    if (z > lambda) return z - lambda;
    if (z < -lambda) return z + lambda;
    return 0.0;
}

void coordinate_descent_step(Vector& theta, Matrix X, Vector y, double lambda) {
    for (int j = 0; j < theta.size(); ++j) {
        double z = dot(X.col(j), y - X * theta + X.col(j) * theta[j]);
        theta[j] = soft_threshold(z, lambda) / dot(X.col(j), X.col(j));
    }
}`,
            python: `def soft_threshold(z, lam):
    if z > lam: return z - lam
    if z < -lam: return z + lam
    return 0.0

def coordinate_descent_step(theta, X, y, lam):
    for j in range(len(theta)):
        residual = y - X @ theta + X[:, j] * theta[j]
        z = X[:, j] @ residual
        theta[j] = soft_threshold(z, lam) / (X[:, j] @ X[:, j])
    return theta`,
          },
          pseudocode: `procedure COORDINATE_DESCENT(theta, X, y, lambda)
    for j = 1 to d do
        compute partial residual for coordinate j
        theta_j <- soft_threshold(z_j, lambda) / ||x_j||^2
    end for
    return theta`,
        },
]
