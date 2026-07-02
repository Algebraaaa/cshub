// AI 专业课 · 机器学习基础（ml）章节课节数据
// 从 curriculum.js 原样拆出（2026-06）。补全/注入逻辑（AI_COMPLETION_DEFAULTS、
// LATE_COURSE_CODE、completeAILessonMetadata）仍在 ../curriculum.js，
// 模块加载时会原位向这些 lesson 对象补字段。
export const ML_LESSONS = [
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
| RBF 核 | $K(x,y) = e^{-\\gamma\\|x-y\\|^2}$ | 通用 |
| 多项式核 | $K(x,y) = (x^T y + c)^d$ | 特定场景 |
`,
          exercise: { type: 'playground', viz: 'svm' },
        },
        {
          id: 'ml-gradient-descent-3d',
          title: '梯度下降 2D/3D 可视化',
          summary: '二维等高线 + 三维损失曲面 + 收敛轨迹',
          theory: `## 梯度下降多维可视化

在多维参数空间中，损失函数形成**曲面**（landscape），梯度下降在曲面上寻找最低点。

### 2D 等高线视图

等高线将三维曲面投影到二维平面，每条线上函数值相同。优化路径在等高线图上清晰展示收敛过程。

### 3D 曲面视图

三维视图直观展示损失曲面的形状（碗形、香蕉谷、鞍点等），以及参数点在曲面上的移动轨迹。

### 常见地形

| 地形 | 特征 | 对优化的影响 |
|------|------|------------|
| 碗形（二次） | 唯一全局最优 | 容易收敛 |
| 香蕉谷（Rosenbrock） | 窄长弯曲 | 容易在谷底震荡 |
| 鞍点 | 某些方向上升、某些下降 | 可能停滞 |
`,
          exercise: { type: 'playground', viz: 'gradientDescent3D' },
          code: {
            cpp: `struct Point2D { double x, y; };

Point2D gd_step_2d(Point2D p, double lr, auto loss_grad) {
    auto [gx, gy] = loss_grad(p.x, p.y);
    return {p.x - lr * gx, p.y - lr * gy};
}

double rosenbrock(double x, double y) {
    return (1 - x) * (1 - x) + 100 * (y - x * x) * (y - x * x);
}`,
            python: `def gd_step_2d(x, y, lr, grad_fn):
    gx, gy = grad_fn(x, y)
    return x - lr * gx, y - lr * gy

def rosenbrock(x, y):
    return (1 - x)**2 + 100 * (y - x**2)**2`,
          },
          pseudocode: `procedure GD_2D(start, learningRate, lossFunction)
    point <- start
    for step <- 1 to maxSteps do
        (gx, gy) <- gradient(lossFunction, point)
        point <- point - learningRate * (gx, gy)
        record(point, loss(point))
    end for
    return trajectory`,
        },
        {
          id: 'ml-ridge-regression',
          title: '岭回归 (Ridge)',
          summary: 'L2 正则化：缩小权重，防止过拟合',
          theory: `## 岭回归 (Ridge Regression)

在普通线性回归的损失函数上添加 **L2 正则化**项：

$$L(w, b) = \\frac{1}{n}\\sum(y_i - \\hat{y}_i)^2 + \\alpha \\|w\\|^2$$

### 效果

- $\\alpha$ 越大 → 权重越小 → 模型越简单 → 偏差增加、方差减小
- 解析解: $w = (X^TX + \\alpha I)^{-1}X^Ty$
- 权重趋向均匀缩小，但不会精确为 0
`,
          exercise: { type: 'playground', viz: 'ridgeRegression' },
          code: {
            cpp: `Vector ridge_solution(Matrix X, Vector y, double alpha) {
    Matrix XtX = X.transpose() * X;
    Matrix I = identity(X.cols());
    return inverse(XtX + alpha * I) * X.transpose() * y;
}`,
            python: `def ridge_solution(X, y, alpha):
    XtX = X.T @ X
    I = np.eye(X.shape[1])
    return np.linalg.inv(XtX + alpha * I) @ X.T @ y`,
          },
          pseudocode: `procedure RIDGE(X, y, alpha)
    w <- (X^T X + alpha * I)^{-1} X^T y
    return w`,
        },
        {
          id: 'ml-lasso-regression',
          title: 'Lasso 回归',
          summary: 'L1 正则化：产生稀疏解，自动特征选择',
          theory: `## Lasso 回归

使用 **L1 正则化**，能产生**稀疏**解（部分权重精确为 0）：

$$L(w) = \\frac{1}{2n}\\|y - Xw\\|^2 + \\alpha \\|w\\|_1$$

### 与 Ridge 的区别

| 性质 | Ridge (L2) | Lasso (L1) |
|------|-----------|-----------|
| 权重 | 趋近 0 但不为 0 | 部分精确为 0 |
| 特征选择 | 无 | 自动选择 |
| 解法 | 解析解 | 坐标下降/ISTA |

### 软阈值操作

Lasso 的坐标下降核心：$w_j = S(z_j, \\lambda) / \\|x_j\\|^2$

其中 $S(z, \\lambda) = \\text{sign}(z) \\max(|z| - \\lambda, 0)$
`,
          exercise: { type: 'playground', viz: 'lassoRegression' },
          code: {
            cpp: `double soft_threshold(double z, double lambda) {
    return sign(z) * max(abs(z) - lambda, 0.0);
}

void lasso_step(Vector& w, Matrix X, Vector y, double alpha) {
    for (int j = 0; j < w.size(); j++) {
        double z = X.col(j).dot(y - X * w + X.col(j) * w[j]);
        w[j] = soft_threshold(z, alpha) / X.col(j).squaredNorm();
    }
}`,
            python: `def soft_threshold(z, lam):
    return np.sign(z) * np.maximum(np.abs(z) - lam, 0)

def lasso_step(w, X, y, alpha):
    for j in range(len(w)):
        residual = y - X @ w + X[:, j] * w[j]
        z = X[:, j] @ residual
        w[j] = soft_threshold(z, alpha) / np.sum(X[:, j]**2)
    return w`,
          },
          pseudocode: `procedure LASSO(X, y, alpha)
    initialize w
    repeat
        for each feature j do
            z_j <- X_j^T (y - Xw + X_j w_j)
            w_j <- soft_threshold(z_j, alpha) / ||X_j||^2
        end for
    until convergence`,
        },
        {
          id: 'ml-naive-bayes',
          title: '朴素贝叶斯',
          summary: '贝叶斯定理 + 特征独立假设',
          theory: `## 朴素贝叶斯分类器

基于**贝叶斯定理**和特征**条件独立**假设：

$$P(C_k | x) = \\frac{P(C_k) \\prod_{i=1}^d P(x_i | C_k)}{P(x)}$$

### 高斯朴素贝叶斯

假设每个特征在每个类别下服从正态分布：

$$P(x_i | C_k) = \\frac{1}{\\sqrt{2\\pi\\sigma_{ik}^2}} \\exp\\left(-\\frac{(x_i - \\mu_{ik})^2}{2\\sigma_{ik}^2}\\right)$$

### 优缺点

- **优点**: 训练极快，小数据集效果好，可解释性强
- **缺点**: 特征独立假设通常不成立
`,
          exercise: { type: 'playground', viz: 'naiveBayes' },
          code: {
            python: `def fit_gaussian_nb(X, y):
    classes = np.unique(y)
    params = {}
    for c in classes:
        X_c = X[y == c]
        params[c] = {
            'mean': X_c.mean(axis=0),
            'var': X_c.var(axis=0),
            'prior': len(X_c) / len(X),
        }
    return params

def predict_nb(x, params):
    posteriors = {}
    for c, p in params.items():
        log_prob = np.log(p['prior'])
        log_prob += np.sum(-0.5 * np.log(2 * np.pi * p['var'])
                          - (x - p['mean'])**2 / (2 * p['var']))
        posteriors[c] = log_prob
    return max(posteriors, key=posteriors.get)`,
            cpp: `// Gaussian Naive Bayes
struct ClassParams { Vector mean, var; double prior; };

int predict_nb(Vector x, map<int, ClassParams> params) {
    int best_class = -1;
    double best_logp = -1e18;
    for (auto& [c, p] : params) {
        double logp = log(p.prior);
        for (int i = 0; i < x.size(); i++)
            logp += -0.5*log(2*M_PI*p.var[i])
                    - (x[i]-p.mean[i])*(x[i]-p.mean[i])/(2*p.var[i]);
        if (logp > best_logp) { best_logp = logp; best_class = c; }
    }
    return best_class;
}`,
          },
          pseudocode: `procedure NAIVE_BAYES_TRAIN(X, y)
    for each class c do
        compute mean_c, var_c for each feature
        compute prior_c = count(c) / N
    end for

procedure NAIVE_BAYES_PREDICT(x, params)
    for each class c do
        log_posterior <- log(prior_c) + sum log P(x_i | c)
    end for
    return class with max log_posterior`,
        },
        {
          id: 'ml-random-forest',
          title: '随机森林',
          summary: '多棵决策树 + Bagging + 特征随机子集',
          theory: `## 随机森林

通过 **Bagging**（有放回抽样）和**特征随机子集**训练多棵决策树，用多数投票或平均预测：

### 构建过程

1. 对每棵树：有放回抽取 Bootstrap 样本
2. 每个节点：随机选 $m$ 个特征（$m \\approx \\sqrt{d}$），从中选最佳切分
3. 长到最大深度（不剪枝）
4. 预测：所有树投票（分类）或平均（回归）

### 为什么有效

- Bootstrap 抽样 → 降低方差
- 特征随机子集 → 树之间**去相关**
- 不剪枝 → 每棵树偏差低

### OOB 误差

未被抽到的样本（约 1/3）可用于估计泛化误差，无需交叉验证。
`,
          exercise: { type: 'playground', viz: 'randomForest' },
          code: {
            python: `def random_forest_predict(X_test, trees, m_features):
    predictions = np.zeros((len(trees), len(X_test)))
    for i, tree in enumerate(trees):
        predictions[i] = tree.predict(X_test)
    # 分类：多数投票
    return np.apply_along_axis(
        lambda x: np.bincount(x.astype(int)).argmax(),
        axis=0, arr=predictions
    )

def bootstrap_sample(X, y):
    idx = np.random.choice(len(X), len(X), replace=True)
    return X[idx], y[idx]`,
            cpp: `int forest_predict(vector<Tree> trees, Vector x) {
    map<int, int> votes;
    for (auto& tree : trees)
        votes[tree.predict(x)]++;
    return argmax(votes);
}`,
          },
          pseudocode: `procedure RANDOM_FOREST(X, y, n_trees)
    for t = 1 to n_trees do
        sample <- bootstrap(X, y)
        trees[t] <- build_tree(sample, random_feature_subset)
    end for
    predict(x) <- majority_vote(trees, x)`,
        },
        {
          id: 'ml-adaboost',
          title: 'AdaBoost 自适应提升',
          summary: '逐步关注错分样本，组合弱学习器',
          theory: `## AdaBoost

通过逐步**增加错分样本权重**来训练一系列弱学习器（通常是决策树桩）：

### 算法流程

1. 初始化样本权重 $w_i = 1/N$
2. 对每轮 $t$:
   - 用当前权重训练弱学习器 $h_t$
   - 计算加权错误率 $\\epsilon_t$
   - 计算学习器权重 $\\alpha_t = \\frac{1}{2}\\ln\\frac{1-\\epsilon_t}{\\epsilon_t}$
   - 更新样本权重：错分的增大，对分的减小
3. 最终预测: $H(x) = \\text{sign}(\\sum_t \\alpha_t h_t(x))$

### 直觉

- 错分样本权重越来越大 → 后续学习器更关注"难"样本
- $\\alpha_t$ 越大 → 该学习器越准确 → 投票权重越高
`,
          exercise: { type: 'playground', viz: 'adaBoost' },
          code: {
            python: `def adaboost_round(X, y, weights, n_rounds):
    models, alphas = [], []
    for t in range(n_rounds):
        h = train_stump(X, y, weights)
        preds = h.predict(X)
        err = np.sum(weights * (preds != y)) / np.sum(weights)
        alpha = 0.5 * np.log((1 - err) / (err + 1e-10))
        weights *= np.exp(-alpha * y * preds)
        weights /= np.sum(weights)
        models.append(h)
        alphas.append(alpha)
    return models, alphas`,
            cpp: `double compute_alpha(double err) {
    return 0.5 * log((1 - err) / (err + 1e-10));
}

void update_weights(Vector& w, Vector preds, Vector y, double alpha) {
    for (int i = 0; i < w.size(); i++)
        w[i] *= exp(-alpha * y[i] * preds[i]);
    double sum = w.sum();
    for (auto& v : w) v /= sum;
}`,
          },
          pseudocode: `procedure ADABOOST(X, y, T)
    w <- uniform(1/N)
    for t = 1 to T do
        h_t <- train_weak_learner(X, y, w)
        err_t <- weighted_error(h_t, X, y, w)
        alpha_t <- 0.5 * ln((1-err) / err)
        w <- w * exp(-alpha * y * h(x))
        normalize w
    end for
    H(x) <- sign(sum alpha_t * h_t(x))`,
        },
        {
          id: 'ml-gradient-boosting',
          title: '梯度提升 (GBDT)',
          summary: '每棵新树拟合前一轮的残差/负梯度',
          theory: `## 梯度提升 (Gradient Boosting)

每棵新树拟合当前集成模型的**负梯度**（对 MSE 即残差）：

### 算法

1. 初始化 $F_0(x) = \\bar{y}$（均值）
2. 对每轮 $m$:
   - 计算伪残差: $r_i = y_i - F_{m-1}(x_i)$
   - 训练回归树 $h_m$ 拟合 $r_i$
   - 更新: $F_m(x) = F_{m-1}(x) + \\nu \\cdot h_m(x)$

其中 $\\nu$ 是学习率（shrinkage），通常 0.01 ~ 0.1。

### 与 AdaBoost 的区别

| 方法 | 关注点 | 新学习器拟合 |
|------|--------|------------|
| AdaBoost | 样本权重 | 加权错分 |
| GBDT | 残差/梯度 | 负梯度方向 |
`,
          exercise: { type: 'playground', viz: 'gradientBoosting' },
          code: {
            python: `def gradient_boosting(X, y, n_trees, lr=0.1):
    F = np.full(len(y), np.mean(y))
    trees = []
    for m in range(n_trees):
        residuals = y - F
        tree = fit_regression_tree(X, residuals)
        trees.append(tree)
        F += lr * tree.predict(X)
    return trees, F`,
            cpp: `Vector gradient_boosting(Matrix X, Vector y, int n_trees, double lr) {
    Vector F = Vector::Constant(y.size(), y.mean());
    vector<Tree> trees;
    for (int m = 0; m < n_trees; m++) {
        Vector residuals = y - F;
        Tree h = fit_regression_tree(X, residuals);
        F += lr * h.predict(X);
        trees.push_back(h);
    }
    return F;
}`,
          },
          pseudocode: `procedure GRADIENT_BOOSTING(X, y, T, lr)
    F_0 <- mean(y)
    for m = 1 to T do
        residuals <- y - F_{m-1}
        h_m <- fit_tree(X, residuals)
        F_m <- F_{m-1} + lr * h_m
    end for
    return F_T`,
        },
        {
          id: 'ml-hierarchical-clustering',
          title: '层次聚类',
          summary: '自底向上合并，构建树状图',
          theory: `## 层次聚类 (Hierarchical Clustering)

**凝聚式**（Agglomerative）方法：每个点初始为一簇，逐步合并最近的两个簇。

### 链接方式

| 链接 | 簇间距离定义 | 效果 |
|------|------------|------|
| Single | 最近点距离 | 链状簇 |
| Complete | 最远点距离 | 紧凑球状 |
| Average | 平均距离 | 折中 |

### 树状图 (Dendrogram)

合并过程可视化为树状图，横轴是样本，纵轴是合并距离。水平切一刀即可得到指定数量的簇。
`,
          exercise: { type: 'playground', viz: 'hierarchicalClustering' },
          code: {
            python: `def agglomerative_clustering(data, linkage='average'):
    clusters = [[i] for i in range(len(data))]
    merges = []
    while len(clusters) > 1:
        best_i, best_j = -1, -1
        best_dist = float('inf')
        for i in range(len(clusters)):
            for j in range(i+1, len(clusters)):
                d = cluster_dist(clusters[i], clusters[j], data, linkage)
                if d < best_dist:
                    best_dist = d
                    best_i, best_j = i, j
        merged = clusters[best_i] + clusters[best_j]
        merges.append((best_i, best_j, best_dist, merged))
        clusters[best_i] = merged
        clusters.pop(best_j)
    return merges`,
            cpp: `// Agglomerative clustering - merge closest pair each step
void merge_step(vector<Cluster>& clusters, string linkage) {
    int best_i = 0, best_j = 1;
    double best_d = cluster_dist(clusters[0], clusters[1], linkage);
    for (int i = 0; i < clusters.size(); i++)
        for (int j = i+1; j < clusters.size(); j++) {
            double d = cluster_dist(clusters[i], clusters[j], linkage);
            if (d < best_d) { best_d = d; best_i = i; best_j = j; }
        }
    clusters[best_i].merge(clusters[best_j]);
    clusters.erase(clusters.begin() + best_j);
}`,
          },
          pseudocode: `procedure AGGLOMERATIVE_CLUSTERING(data, linkage)
    clusters <- [{i} for each point i]
    while |clusters| > 1 do
        (i, j) <- closest pair of clusters
        merge clusters[i] and clusters[j]
        record merge distance
    end while
    return dendrogram`,
        },
        {
          id: 'ml-dbscan',
          title: 'DBSCAN 密度聚类',
          summary: '基于密度的聚类，自动发现任意形状的簇',
          theory: `## DBSCAN (Density-Based Spatial Clustering)

通过**密度**定义簇：如果一个点的 $\\epsilon$-邻域内有足够多（$\\geq$ minPts）的点，它就是**核心点**。

### 点类型

- **核心点**: $\\epsilon$-邻域内点数 $\\geq$ minPts
- **边界点**: 不是核心点，但在某个核心点的邻域内
- **噪声点**: 既不是核心点也不是边界点

### 算法

1. 随机选一个未访问点
2. 如果它是核心点，从它开始扩展簇（递归加入密度可达的点）
3. 否则标记为噪声（后续可能被归入某个簇的边界）

### 优势

- 不需要指定簇数 K
- 能发现任意形状的簇
- 能识别噪声点
`,
          exercise: { type: 'playground', viz: 'dbscan' },
          code: {
            python: `def dbscan(data, eps, min_pts):
    labels = np.full(len(data), -1)  # -1 = noise
    cluster_id = 0
    for i in range(len(data)):
        if labels[i] != -1: continue
        neighbors = region_query(data, i, eps)
        if len(neighbors) < min_pts:
            continue  # noise (may become border later)
        labels[i] = cluster_id
        seeds = list(neighbors)
        while seeds:
            q = seeds.pop(0)
            if labels[q] == -1:
                labels[q] = cluster_id
            if labels[q] != -1 and labels[q] != cluster_id:
                continue
            labels[q] = cluster_id
            q_neighbors = region_query(data, q, eps)
            if len(q_neighbors) >= min_pts:
                seeds.extend(q_neighbors)
        cluster_id += 1
    return labels`,
            cpp: `void expand_cluster(int p, vector<int>& neighbors, int cid,
                    vector<int>& labels, vector<bool>& visited,
                    Matrix data, double eps, int min_pts) {
    labels[p] = cid;
    queue<int> seeds(neighbors.begin(), neighbors.end());
    while (!seeds.empty()) {
        int q = seeds.front(); seeds.pop();
        if (!visited[q]) { visited[q] = true;
            auto qn = region_query(data, q, eps);
            if (qn.size() >= min_pts)
                for (int n : qn) seeds.push(n);
        }
        if (labels[q] == -1) labels[q] = cid;
    }
}`,
          },
          pseudocode: `procedure DBSCAN(data, eps, minPts)
    for each unvisited point p do
        neighbors <- regionQuery(p, eps)
        if |neighbors| < minPts then mark p as noise
        else
            create new cluster C
            expandCluster(p, neighbors, C)
        end if
    end for`,
        },
        {
          id: 'ml-pca',
          title: 'PCA 主成分分析',
          summary: '降维：找到方差最大的投影方向',
          theory: `## PCA (Principal Component Analysis)

将高维数据投影到方差最大的低维子空间：

### 步骤

1. **中心化**: $X_c = X - \\bar{X}$
2. **协方差矩阵**: $C = \\frac{1}{n} X_c^T X_c$
3. **特征分解**: $C = V \\Lambda V^T$
4. **选主成分**: 取最大的 $k$ 个特征值对应的特征向量
5. **投影**: $Z = X_c V_k$

### 解释方差比

第 $i$ 个主成分解释的方差占比: $\\lambda_i / \\sum_j \\lambda_j$

### 应用

- 降维可视化（2D/3D）
- 去噪
- 特征提取
`,
          exercise: { type: 'playground', viz: 'pca' },
          code: {
            python: `def pca(X, n_components):
    X_centered = X - X.mean(axis=0)
    cov_matrix = np.cov(X_centered, rowvar=False)
    eigenvalues, eigenvectors = np.linalg.eigh(cov_matrix)
    # 按特征值降序排列
    idx = np.argsort(eigenvalues)[::-1]
    eigenvectors = eigenvectors[:, idx]
    # 选前 k 个主成分
    W = eigenvectors[:, :n_components]
    Z = X_centered @ W
    explained_var = eigenvalues[idx][:n_components] / eigenvalues.sum()
    return Z, W, explained_var`,
            cpp: `PCAResult pca(Matrix X, int k) {
    Vector mean = X.colwise().mean();
    X.rowwise() -= mean.transpose();
    Matrix cov = X.transpose() * X / X.rows();
    SelfAdjointEigenSolver<Matrix> solver(cov);
    Matrix V = solver.eigenvectors().rightCols(k).rowwise().reverse();
    Matrix Z = X * V;
    return {Z, V, solver.eigenvalues()};
}`,
          },
          pseudocode: `procedure PCA(X, k)
    X_c <- X - mean(X)
    C <- X_c^T * X_c / n
    (eigenvalues, eigenvectors) <- eigendecompose(C)
    sort by eigenvalue descending
    W <- top k eigenvectors
    Z <- X_c * W
    return Z, explained_variance`,
        },
        {
          id: 'ml-gmm',
          title: 'GMM 高斯混合模型',
          summary: 'EM 算法：软聚类 + 概率框架',
          theory: `## 高斯混合模型 (GMM)

假设数据由 $K$ 个高斯分布混合而成：

$$P(x) = \\sum_{k=1}^K \\pi_k \\mathcal{N}(x | \\mu_k, \\Sigma_k)$$

### EM 算法

**E-step**（期望步）: 计算每个样本属于每个成分的后验概率

$$\\gamma_{ik} = \\frac{\\pi_k \\mathcal{N}(x_i | \\mu_k, \\Sigma_k)}{\\sum_j \\pi_j \\mathcal{N}(x_i | \\mu_j, \\Sigma_j)}$$

**M-step**（最大化步）: 用后验概率更新参数

$$\\mu_k = \\frac{\\sum_i \\gamma_{ik} x_i}{\\sum_i \\gamma_{ik}}, \\quad \\pi_k = \\frac{\\sum_i \\gamma_{ik}}{N}$$

### 与 K-Means 的关系

K-Means 是 GMM 的"硬分配"特例（$\\Sigma_k \\to 0$）。
`,
          exercise: { type: 'playground', viz: 'gmm' },
          code: {
            python: `def gmm_em(X, K, max_iter=50):
    N, D = X.shape
    pi = np.ones(K) / K
    mu = X[np.random.choice(N, K)]
    sigma = [np.eye(D)] * K
    for _ in range(max_iter):
        # E-step
        gamma = np.zeros((N, K))
        for k in range(K):
            gamma[:, k] = pi[k] * gaussian_pdf(X, mu[k], sigma[k])
        gamma /= gamma.sum(axis=1, keepdims=True)
        # M-step
        Nk = gamma.sum(axis=0)
        for k in range(K):
            mu[k] = (gamma[:, k:k+1] * X).sum(0) / Nk[k]
            pi[k] = Nk[k] / N
    return mu, sigma, pi`,
            cpp: `// GMM EM step
void em_step(Matrix X, Matrix& gamma, vector<Vector>& mu,
             vector<Matrix>& sigma, Vector& pi) {
    int N = X.rows(), K = mu.size();
    // E-step: compute responsibilities
    for (int k = 0; k < K; k++)
        gamma.col(k) = pi[k] * gaussian_pdf(X, mu[k], sigma[k]);
    gamma.rowwise() /= gamma.rowwise().sum();
    // M-step
    Vector Nk = gamma.colwise().sum();
    for (int k = 0; k < K; k++) {
        mu[k] = (gamma.col(k).asDiagonal() * X).colwise().sum() / Nk[k];
        pi[k] = Nk[k] / N;
    }
}`,
          },
          pseudocode: `procedure GMM_EM(X, K)
    initialize pi, mu, sigma
    repeat
        E-step: gamma_ik <- pi_k * N(x_i|mu_k, sigma_k) / sum_j ...
        M-step: update mu_k, sigma_k, pi_k using gamma
    until log-likelihood converges`,
        },
        {
          id: 'ml-hmm',
          title: 'HMM 隐马尔可夫模型',
          summary: '状态转移 + 观测概率 + Viterbi 解码',
          theory: `## 隐马尔可夫模型 (HMM)

序列模型，有**隐藏状态**和**观测**两层：

### 三个核心问题

| 问题 | 算法 | 描述 |
|------|------|------|
| 评估 | Forward | $P(O|\\lambda)$，观测序列概率 |
| 解码 | Viterbi | 最可能的隐藏状态序列 |
| 学习 | Baum-Welch (EM) | 参数估计 |

### Viterbi 解码

$$\\delta_t(j) = \\max_i [\\delta_{t-1}(i) \\cdot a_{ij}] \\cdot b_j(o_t)$$

回溯得到最优路径。
`,
          exercise: { type: 'playground', viz: 'hmm' },
          code: {
            python: `def viterbi(obs, trans, emit, start):
    T, N = len(obs), len(start)
    delta = np.zeros((T, N))
    psi = np.zeros((T, N), dtype=int)
    # 初始化
    delta[0] = start * emit[:, obs[0]]
    # 递推
    for t in range(1, T):
        for j in range(N):
            delta[t, j] = np.max(delta[t-1] * trans[:, j]) * emit[j, obs[t]]
            psi[t, j] = np.argmax(delta[t-1] * trans[:, j])
    # 回溯
    path = np.zeros(T, dtype=int)
    path[-1] = np.argmax(delta[-1])
    for t in range(T-2, -1, -1):
        path[t] = psi[t+1, path[t+1]]
    return path`,
            cpp: `vector<int> viterbi(vector<int> obs, Matrix trans, Matrix emit, Vector start) {
    int T = obs.size(), N = start.size();
    Matrix delta(T, N); MatrixXi psi(T, N);
    delta.row(0) = start.array() * emit.col(obs[0]).array();
    for (int t = 1; t < T; t++)
        for (int j = 0; j < N; j++) {
            Vector tmp = delta.row(t-1).array() * trans.col(j).array();
            delta(t, j) = tmp.maxCoeff(&psi(t, j)) * emit(j, obs[t]);
        }
    vector<int> path(T);
    delta.row(T-1).maxCoeff(&path[T-1]);
    for (int t = T-2; t >= 0; t--) path[t] = psi(t+1, path[t+1]);
    return path;
}`,
          },
          pseudocode: `procedure VITERBI(observations, transition, emission, start)
    delta[0] <- start * emission[:, obs[0]]
    for t = 1 to T do
        for each state j do
            delta[t,j] <- max_i(delta[t-1,i] * trans[i,j]) * emit[j, obs[t]]
            psi[t,j] <- argmax_i(...)
        end for
    end for
    backtrack using psi to find best path`,
        },
        {
          id: 'ml-mle-map',
          title: 'MLE 与 MAP 估计',
          summary: '最大似然 vs 最大后验，先验的影响',
          theory: `## MLE 与 MAP

### 最大似然估计 (MLE)

$$\\hat{\\theta}_{MLE} = \\arg\\max_\\theta P(D | \\theta) = \\arg\\max_\\theta \\prod_i P(x_i | \\theta)$$

只看数据，不加任何先验。

### 最大后验估计 (MAP)

$$\\hat{\\theta}_{MAP} = \\arg\\max_\\theta P(\\theta | D) = \\arg\\max_\\theta P(D | \\theta) P(\\theta)$$

加入先验 $P(\\theta)$，等价于带正则化的 MLE。

### 对比

| 方法 | 公式 | 等价于 |
|------|------|--------|
| MLE | $\\max P(D|\\theta)$ | 无正则化 |
| MAP | $\\max P(D|\\theta)P(\\theta)$ | 带正则化 |
| Ridge | MSE + $\\alpha\\|w\\|^2$ | Gaussian prior |
| Lasso | MSE + $\\alpha\\|w\\|_1$ | Laplace prior |
`,
          exercise: { type: 'playground', viz: 'mleVsMap' },
          code: {
            python: `def mle_coin(heads, total):
    return heads / total  # 最大似然估计

def map_coin_beta(heads, total, alpha, beta):
    # Beta 先验下的 MAP
    return (heads + alpha - 1) / (total + alpha + beta - 2)

def posterior_beta(heads, total, alpha, beta):
    # 后验分布参数
    return alpha + heads, beta + (total - heads)`,
            cpp: `double mle_coin(int heads, int total) {
    return (double)heads / total;
}

double map_coin_beta(int heads, int total, double alpha, double beta) {
    return (heads + alpha - 1.0) / (total + alpha + beta - 2.0);
}`,
          },
          pseudocode: `procedure MLE(data)
    theta <- argmax product P(x_i | theta)
    return theta

procedure MAP(data, prior)
    theta <- argmax product P(x_i | theta) * P(theta)
    return theta`,
        },
]
