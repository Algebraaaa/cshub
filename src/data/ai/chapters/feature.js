// AI 专业课 · 特征工程与模型评估（feature）章节课节数据
// 从 curriculum.js 原样拆出（2026-06）。补全/注入逻辑（AI_COMPLETION_DEFAULTS、
// LATE_COURSE_CODE、completeAILessonMetadata）仍在 ../curriculum.js，
// 模块加载时会原位向这些 lesson 对象补字段。
export const FEATURE_LESSONS = [
        {
          id: 'feature-standardization',
          title: '标准化与归一化',
          summary: 'Z-score 标准化 vs Min-Max 归一化',
          theory: `## 特征缩放

不同特征的量纲和范围差异很大，需要统一尺度。

### Z-score 标准化

$$x' = \\frac{x - \\mu}{\\sigma}$$

- 结果均值为 0，标准差为 1
- 不受异常值范围限制

### Min-Max 归一化

$$x' = \\frac{x - x_{min}}{x_{max} - x_{min}}$$

- 结果在 [0, 1] 范围内
- 对异常值敏感

### 何时使用

| 方法 | 适用场景 |
|------|---------|
| Z-score | 梯度下降、SVM、PCA |
| Min-Max | 神经网络、图像处理 |
| Robust | 有异常值的数据 |
`,
          exercise: { type: 'playground', viz: 'standardization' },
          code: {
            python: `def zscore_normalize(X):
    mu = X.mean(axis=0)
    sigma = X.std(axis=0)
    return (X - mu) / sigma, mu, sigma

def minmax_normalize(X):
    X_min = X.min(axis=0)
    X_max = X.max(axis=0)
    return (X - X_min) / (X_max - X_min), X_min, X_max`,
            cpp: `Matrix zscore(Matrix X) {
    Vector mu = X.colwise().mean();
    Vector sigma = ((X.rowwise() - mu.transpose()).array().square()
                   .colwise().mean()).sqrt();
    return (X.rowwise() - mu.transpose()).array().rowwise() / sigma.transpose().array();
}`,
          },
          pseudocode: `procedure ZSCORE(X)
    mu <- mean(X, axis=0)
    sigma <- std(X, axis=0)
    return (X - mu) / sigma

procedure MINMAX(X)
    return (X - min(X)) / (max(X) - min(X))`,
        },
        {
          id: 'feature-one-hot',
          title: 'One-Hot 编码',
          summary: '类别变量转二进制向量',
          theory: `## One-Hot 编码

将**类别变量**转换为二进制向量：

| 原始 | One-Hot |
|------|---------|
| 红 | [1, 0, 0] |
| 绿 | [0, 1, 0] |
| 蓝 | [0, 0, 1] |

### 注意事项

- **维度爆炸**: $k$ 个类别 → $k$ 个新特征
- **多重共线性**: 可以用 drop-first（$k-1$ 个特征）
- **高基数问题**: 类别太多时考虑 target encoding

### 替代表示

| 方法 | 适用场景 |
|------|---------|
| One-Hot | 低基数无序类别 |
| Ordinal | 有序类别 |
| Target Encoding | 高基数类别 |
| Embedding | 深度学习 |
`,
          exercise: { type: 'playground', viz: 'oneHot' },
          code: {
            python: `def one_hot_encode(categories):
    unique = sorted(set(categories))
    mapping = {c: i for i, c in enumerate(unique)}
    encoded = np.zeros((len(categories), len(unique)))
    for i, cat in enumerate(categories):
        encoded[i, mapping[cat]] = 1
    return encoded, unique

# 使用 pandas
# pd.get_dummies(df, columns=['color'], drop_first=True)`,
            cpp: `Matrix one_hot_encode(vector<string> categories) {
    set<string> unique(categories.begin(), categories.end());
    map<string, int> mapping;
    int idx = 0;
    for (auto& c : unique) mapping[c] = idx++;
    Matrix encoded = Matrix::Zero(categories.size(), unique.size());
    for (int i = 0; i < categories.size(); i++)
        encoded(i, mapping[categories[i]]) = 1;
    return encoded;
}`,
          },
          pseudocode: `procedure ONE_HOT(categories)
    unique <- sorted unique values
    for each category c_i do
        vector <- zeros(|unique|)
        vector[index(c_i)] <- 1
    end for
    return encoded_matrix`,
        },
        {
          id: 'feature-selection',
          title: '特征选择',
          summary: 'Filter、Wrapper、Embedded 三种方法',
          theory: `## 特征选择

从大量特征中选出**最有价值**的子集。

### 三种方法

| 方法 | 原理 | 示例 |
|------|------|------|
| Filter | 统计指标独立筛选 | 相关系数、卡方检验、互信息 |
| Wrapper | 用模型性能评估子集 | 前向选择、后向消除、RFE |
| Embedded | 模型训练过程自动选择 | Lasso、决策树、随机森林 |

### 前向选择

1. 从空集开始
2. 每次加入使模型改善最多的特征
3. 直到无法改善或达到预设数量

### 好处

- 降低维度 → 减少过拟合
- 提高可解释性
- 加速训练
`,
          exercise: { type: 'playground', viz: 'featureSelection' },
          code: {
            python: `def forward_selection(X, y, max_features=5):
    selected = []
    remaining = list(range(X.shape[1]))
    best_score = -float('inf')
    for _ in range(max_features):
        best_feat = None
        for feat in remaining:
            candidate = selected + [feat]
            score = cross_val_score(X[:, candidate], y)
            if score > best_score:
                best_score = score
                best_feat = feat
        if best_feat is None: break
        selected.append(best_feat)
        remaining.remove(best_feat)
    return selected

def filter_selection(X, y, threshold=0.1):
    correlations = [np.corrcoef(X[:, i], y)[0,1] for i in range(X.shape[1])]
    return [i for i, c in enumerate(correlations) if abs(c) > threshold]`,
            cpp: `vector<int> forward_selection(Matrix X, Vector y, int max_features) {
    vector<int> selected; set<int> remaining;
    for (int i = 0; i < X.cols(); i++) remaining.insert(i);
    for (int k = 0; k < max_features; k++) {
        int best_feat = -1; double best_score = -INF;
        for (int feat : remaining) {
            auto candidate = selected; candidate.push_back(feat);
            double score = cross_val_score(X, y, candidate);
            if (score > best_score) { best_score = score; best_feat = feat; }
        }
        if (best_feat < 0) break;
        selected.push_back(best_feat); remaining.erase(best_feat);
    }
    return selected;
}`,
          },
          pseudocode: `procedure FORWARD_SELECTION(X, y, k)
    selected <- empty
    for step = 1 to k do
        best_feat <- argmax score(selected + feat) for feat not in selected
        selected <- selected + best_feat
    end for
    return selected`,
        },
        {
          id: 'feature-polynomial',
          title: '多项式特征',
          summary: '通过特征交叉和幂次扩展特征空间',
          theory: `## 多项式特征扩展

将原始特征 $[x_1, x_2]$ 扩展为多项式组合：

### degree=2 的扩展

$$[1, x_1, x_2] \\to [1, x_1, x_2, x_1^2, x_1 x_2, x_2^2]$$

### 效果

- 允许线性模型拟合**非线性**关系
- 扩展后的特征空间中，决策边界仍是"线性"的
- degree 越高 → 模型越灵活 → 但参数爆炸

### 维度增长

$d$ 个特征、degree $p$ → $\\binom{d+p}{p}$ 个特征

| 原始特征 | degree | 扩展后 |
|---------|--------|--------|
| 2 | 2 | 6 |
| 2 | 3 | 10 |
| 10 | 2 | 66 |
`,
          exercise: { type: 'playground', viz: 'polynomialFeatures' },
          code: {
            python: `from itertools import combinations_with_replacement

def polynomial_features(X, degree=2):
    n, d = X.shape
    features = [np.ones(n)]  # bias
    for deg in range(1, degree + 1):
        for combo in combinations_with_replacement(range(d), deg):
            feat = np.ones(n)
            for idx in combo:
                feat *= X[:, idx]
            features.append(feat)
    return np.column_stack(features)

# sklearn
# from sklearn.preprocessing import PolynomialFeatures
# poly = PolynomialFeatures(degree=2)
# X_poly = poly.fit_transform(X)`,
            cpp: `Matrix polynomial_features(Matrix X, int degree) {
    int n = X.rows(), d = X.cols();
    vector<Vector> features;
    features.push_back(Vector::Ones(n));
    for (int deg = 1; deg <= degree; deg++) {
        // Generate all combinations with replacement
        // ... compute product for each combination
    }
    Matrix result(n, features.size());
    for (int i = 0; i < features.size(); i++)
        result.col(i) = features[i];
    return result;
}`,
          },
          pseudocode: `procedure POLY_FEATURES(X, degree)
    features <- [1]  // bias
    for deg = 1 to degree do
        for each combination of deg features (with replacement) do
            features.append(product of selected features)
        end for
    end for
    return features_matrix`,
        },
        {
          id: 'feature-confusion-matrix',
          title: '混淆矩阵',
          summary: 'TP、FP、TN、FN 与派生指标',
          theory: `## 混淆矩阵

二分类结果的 2×2 矩阵：

| | 预测正 | 预测负 |
|---|--------|--------|
| **实际正** | TP | FN |
| **实际负** | FP | TN |

### 派生指标

| 指标 | 公式 | 含义 |
|------|------|------|
| Accuracy | $(TP+TN)/(TP+FP+TN+FN)$ | 整体正确率 |
| Precision | $TP/(TP+FP)$ | 预测为正的准确率 |
| Recall | $TP/(TP+FN)$ | 实际为正的检出率 |
| F1 | $2 \\cdot \\frac{P \\cdot R}{P + R}$ | 精确率与召回率的调和平均 |
| Specificity | $TN/(TN+FP)$ | 负类正确率 |

### 何时关注哪个指标

- **Precision 重要**: 垃圾邮件检测（误报代价高）
- **Recall 重要**: 疾病诊断（漏诊代价高）
`,
          exercise: { type: 'playground', viz: 'confusionMatrix' },
          code: {
            python: `def confusion_matrix(y_true, y_pred):
    TP = np.sum((y_true == 1) & (y_pred == 1))
    FP = np.sum((y_true == 0) & (y_pred == 1))
    TN = np.sum((y_true == 0) & (y_pred == 0))
    FN = np.sum((y_true == 1) & (y_pred == 0))
    accuracy = (TP + TN) / (TP + FP + TN + FN)
    precision = TP / (TP + FP) if (TP + FP) > 0 else 0
    recall = TP / (TP + FN) if (TP + FN) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
    return {'TP': TP, 'FP': FP, 'TN': TN, 'FN': FN,
            'accuracy': accuracy, 'precision': precision,
            'recall': recall, 'f1': f1}`,
            cpp: `struct Metrics { int TP, FP, TN, FN; double accuracy, precision, recall, f1; };

Metrics compute_metrics(vector<int> y_true, vector<int> y_pred) {
    Metrics m = {0, 0, 0, 0, 0, 0, 0, 0};
    for (int i = 0; i < y_true.size(); i++) {
        if (y_true[i] && y_pred[i]) m.TP++;
        else if (!y_true[i] && y_pred[i]) m.FP++;
        else if (!y_true[i] && !y_pred[i]) m.TN++;
        else m.FN++;
    }
    m.accuracy = (double)(m.TP + m.TN) / y_true.size();
    m.precision = m.TP + m.FP ? (double)m.TP / (m.TP + m.FP) : 0;
    m.recall = m.TP + m.FN ? (double)m.TP / (m.TP + m.FN) : 0;
    m.f1 = m.precision + m.recall ? 2*m.precision*m.recall / (m.precision+m.recall) : 0;
    return m;
}`,
          },
          pseudocode: `procedure CONFUSION_MATRIX(y_true, y_pred)
    TP <- count(y_true=1 and y_pred=1)
    FP <- count(y_true=0 and y_pred=1)
    TN <- count(y_true=0 and y_pred=0)
    FN <- count(y_true=1 and y_pred=0)
    accuracy <- (TP+TN) / total
    precision <- TP / (TP+FP)
    recall <- TP / (TP+FN)
    F1 <- 2*P*R / (P+R)`,
        },
        {
          id: 'feature-roc-curve',
          title: 'ROC 曲线与 AUC',
          summary: '阈值变化下的 TPR-FPR 权衡',
          theory: `## ROC 曲线

**Receiver Operating Characteristic** 曲线展示不同阈值下分类器的表现：

- **X 轴**: FPR (False Positive Rate) = $FP / (FP + TN)$
- **Y 轴**: TPR (True Positive Rate) = $TP / (TP + FN)$ = Recall

### AUC (Area Under Curve)

- AUC = 1: 完美分类器
- AUC = 0.5: 随机猜测（对角线）
- AUC < 0.5: 比随机还差

### 如何绘制

1. 将预测概率从高到低排序
2. 从阈值 = 1 开始，逐步降低
3. 每降低一次阈值，计算新的 TPR 和 FPR
4. 连接所有 (FPR, TPR) 点

### 适用场景

- 类别不平衡时比 Accuracy 更可靠
- 比较不同模型的整体性能
`,
          exercise: { type: 'playground', viz: 'rocCurve' },
          code: {
            python: `def compute_roc(y_true, y_scores):
    # 按分数降序排列
    order = np.argsort(-y_scores)
    y_true = y_true[order]
    y_scores = y_scores[order]
    P = np.sum(y_true == 1)
    N = np.sum(y_true == 0)
    tpr, fpr = [0], [0]
    tp, fp = 0, 0
    for i in range(len(y_true)):
        if y_true[i] == 1: tp += 1
        else: fp += 1
        tpr.append(tp / P)
        fpr.append(fp / N)
    # AUC (梯形法则)
    auc = np.trapz(tpr, fpr)
    return fpr, tpr, auc`,
            cpp: `pair<vector<double>, double> compute_roc(vector<int> y, vector<double> scores) {
    int P = count(y.begin(), y.end(), 1);
    int N = y.size() - P;
    auto order = argsort(scores, descending);
    vector<double> tpr, fpr; int tp = 0, fp = 0;
    tpr.push_back(0); fpr.push_back(0);
    for (int i : order) {
        if (y[i]) tp++; else fp++;
        tpr.push_back((double)tp/P);
        fpr.push_back((double)fp/N);
    }
    double auc = trapezoid_area(fpr, tpr);
    return {tpr, auc};
}`,
          },
          pseudocode: `procedure ROC(y_true, y_scores)
    sort by scores descending
    for each threshold do
        compute TPR and FPR
        add point to curve
    end for
    AUC <- trapezoid_area(fpr, tpr)
    return curve, AUC`,
        },
        {
          id: 'feature-cross-validation',
          title: '交叉验证',
          summary: 'K-fold、留一法、分层抽样',
          theory: `## 交叉验证 (Cross-Validation)

通过多次划分训练/测试集来**更可靠地**评估模型。

### K-Fold 交叉验证

1. 将数据随机分成 $K$ 份
2. 每次用 $K-1$ 份训练，1 份测试
3. 重复 $K$ 次，取平均性能

### 变体

| 方法 | 特点 |
|------|------|
| K-Fold | 标准方法，K=5 或 10 |
| Stratified K-Fold | 保持类别比例 |
| Leave-One-Out | K=N，计算量大 |
| Repeated K-Fold | 多次随机划分 |

### 为什么需要

- 单次 train/test 划分结果不稳定
- 更充分利用有限数据
- 减少过拟合到特定测试集的风险
`,
          exercise: { type: 'playground', viz: 'crossValidation' },
          code: {
            python: `def k_fold_cv(model_fn, X, y, k=5):
    n = len(X)
    indices = np.random.permutation(n)
    fold_size = n // k
    scores = []
    for fold in range(k):
        test_idx = indices[fold*fold_size : (fold+1)*fold_size]
        train_idx = np.concatenate([indices[:fold*fold_size],
                                    indices[(fold+1)*fold_size:]])
        model = model_fn()
        model.fit(X[train_idx], y[train_idx])
        score = model.score(X[test_idx], y[test_idx])
        scores.append(score)
    return np.mean(scores), np.std(scores), scores`,
            cpp: `vector<double> k_fold_cv(ModelFactory factory, Matrix X, Vector y, int k) {
    int n = X.rows(), fold_size = n / k;
    auto indices = random_permutation(n);
    vector<double> scores;
    for (int fold = 0; fold < k; fold++) {
        auto [train_idx, test_idx] = split_fold(indices, fold, fold_size);
        auto model = factory();
        model.fit(X(train_idx), y(train_idx));
        scores.push_back(model.evaluate(X(test_idx), y(test_idx)));
    }
    return scores;
}`,
          },
          pseudocode: `procedure K_FOLD_CV(model, X, y, k)
    shuffle data, split into k folds
    for fold = 1 to k do
        train <- all folds except fold
        test <- fold
        score <- train_and_evaluate(model, train, test)
    end for
    return mean(scores), std(scores)`,
        },
        {
          id: 'feature-bias-variance',
          title: '偏差-方差权衡',
          summary: '欠拟合、过拟合与模型复杂度',
          theory: `## 偏差-方差分解

预测误差可以分解为三个部分：

$$E[(y - \\hat{f}(x))^2] = \\text{Bias}^2 + \\text{Variance} + \\text{Irreducible Noise}$$

### 三个分量

| 分量 | 含义 | 表现 |
|------|------|------|
| Bias² | 模型预测偏离真值 | 欠拟合 |
| Variance | 模型对训练集变化敏感 | 过拟合 |
| Noise | 数据本身的随机性 | 不可消除 |

### 模型复杂度的影响

- **简单模型** (如线性): 高偏差、低方差 → 欠拟合
- **复杂模型** (如深度树): 低偏差、高方差 → 过拟合
- **最优模型**: 在偏差和方差间取得平衡

### 解决方法

- 过拟合: 正则化、剪枝、早停、交叉验证
- 欠拟合: 增加模型复杂度、添加特征
`,
          exercise: { type: 'playground', viz: 'biasVariance' },
          code: {
            python: `def bias_variance_decomposition(model_fn, X, y, n_bootstraps=20):
    predictions = []
    for _ in range(n_bootstraps):
        idx = np.random.choice(len(X), len(X), replace=True)
        model = model_fn()
        model.fit(X[idx], y[idx])
        predictions.append(model.predict(X))
    predictions = np.array(predictions)
    mean_pred = predictions.mean(axis=0)
    bias_sq = np.mean((mean_pred - y)**2)
    variance = np.mean(predictions.var(axis=0))
    return bias_sq, variance

def learning_curve(model, X, y, train_sizes):
    train_scores, test_scores = [], []
    for size in train_sizes:
        X_tr, y_tr = X[:size], y[:size]
        model.fit(X_tr, y_tr)
        train_scores.append(model.score(X_tr, y_tr))
        test_scores.append(model.score(X_test, y_test))
    return train_scores, test_scores`,
            cpp: `pair<double, double> bias_variance(auto model_factory, Matrix X, Vector y, int B) {
    vector<Vector> predictions(B);
    for (int b = 0; b < B; b++) {
        auto idx = bootstrap_sample(X.rows());
        auto model = model_factory();
        model.fit(X(idx), y(idx));
        predictions[b] = model.predict(X);
    }
    Vector mean_pred = Vector::Zero(X.rows());
    for (auto& p : predictions) mean_pred += p;
    mean_pred /= B;
    double bias_sq = (mean_pred - y).squaredNorm() / X.rows();
    double var = 0;
    for (auto& p : predictions) var += (p - mean_pred).squaredNorm();
    var /= (B * X.rows());
    return {bias_sq, var};
}`,
          },
          pseudocode: `procedure BIAS_VARIANCE(model_fn, X, y, B)
    for b = 1 to B do
        bootstrap sample -> train model -> predict on X
    end for
    bias^2 <- mean((mean_prediction - y)^2)
    variance <- mean(var(predictions across bootstraps))
    return bias_sq, variance`,
        },
]
