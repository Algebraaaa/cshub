// AI 专业课 · 课节补全数据与逻辑(从 curriculum.js 拆出,2026-07 P0 性能优化)
// 全部补全对象原样搬入,经 Object.assign 原位 mutate lesson;
// 应用顺序不可变:章节 ENRICHMENTS → LATE_COURSE_CODE → completeAILessonMetadata,
// curriculum.test.js 的注入生效用例锁住这一点。
// 本文件不 import 任何章节数据 → 只进 AILessonPage 一侧的 chunk,
// AIPage 目录页只依赖轻量 curriculumIndex.js。

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
    exercise: { type: 'playground', viz: 'gradientDescent3D' },
    defaultCodeFocus: 'quad',
    codeFocusLabels: { quad: '二次曲面', rosenbrock: 'Rosenbrock', saddle: '鞍点', default: '2D/3D 梯度下降' },
    codeHighlightLines: {
      cpp: { quad: 5, rosenbrock: 10, saddle: 5, default: 5 },
      python: { quad: 4, rosenbrock: 8, saddle: 4, default: 4 },
    },
    codeStepHighlightLines: {
      cpp: { default: [3, 4, 5, 6, 10, 11, 12] },
      python: { default: [2, 3, 4, 8, 9, 10] },
    },
    variablesSnapshot: { method: '2D/3D Gradient Descent', learningRate: '-', position: '-', loss: '-' },
    code: {
      cpp: `struct Point2D { double x, y; };

Point2D gd_step_2d(Point2D p, double lr, auto grad_fn) {
    auto [gx, gy] = grad_fn(p.x, p.y);
    return {p.x - lr * gx, p.y - lr * gy};
}

double rosenbrock(double x, double y) {
    double valley = y - x * x;
    return (1 - x) * (1 - x) + 100 * valley * valley;
}

pair<double,double> rosenbrock_grad(double x, double y) {
    double gx = -2 * (1 - x) - 400 * x * (y - x * x);
    double gy = 200 * (y - x * x);
    return {gx, gy};
}

vector<Point2D> optimize(Point2D start, double lr) {
    vector<Point2D> path;
    for (int step = 0; step < 40; step++) {
        path.push_back(start);
        start = gd_step_2d(start, lr, rosenbrock_grad);
    }
    return path;
}`,
      python: `def gd_step_2d(point, lr, grad_fn):
    x, y = point
    gx, gy = grad_fn(x, y)
    return x - lr * gx, y - lr * gy

def rosenbrock(x, y):
    valley = y - x * x
    return (1 - x) ** 2 + 100 * valley ** 2

def rosenbrock_grad(x, y):
    gx = -2 * (1 - x) - 400 * x * (y - x * x)
    gy = 200 * (y - x * x)
    return gx, gy

def optimize(start, lr, steps=40):
    path = []
    point = start
    for _ in range(steps):
        path.append(point)
        point = gd_step_2d(point, lr, rosenbrock_grad)
    return path`,
    },
    pseudocode: `procedure GRADIENT_DESCENT_2D(point, learningRate, loss)
    repeat
        (gx, gy) <- gradient(loss, point)
        point.x <- point.x - learningRate * gx
        point.y <- point.y - learningRate * gy
        record point and loss(point)
    until convergence`,
    bigO: { time: '每步一次二维梯度，T 步为 O(T * cost(grad))。', space: '在线更新 O(1)，保存 2D/3D 轨迹为 O(T)。', note: '2D 等高线和 3D 曲面只是同一 loss landscape 的不同视角。' },
    compare: [
      { method: '2D 等高线', data: '俯视投影', strength: '路径和梯度方向清楚', tradeoff: '看不出曲面高度' },
      { method: '3D 曲面', data: '真实 loss landscape', strength: '曲面、轨迹、收敛过程直观', tradeoff: '需要更多渲染空间' },
    ],
    quiz: [{ q: '三维损失曲面中的参数点沿什么方向移动？', options: ['负梯度方向', '正梯度方向', '随机方向', '坐标轴固定方向'], answer: 0, explanation: '梯度指向局部上升最快方向，梯度下降沿负梯度更新参数。' }],
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

const DL_ENRICHMENTS = {
  'dl-neural-network': {
    defaultCodeFocus: 'forward',
    codeFocusLabels: { forward: '前向传播', backward: '反向传播', update: '参数更新', default: '神经网络训练' },
    codeHighlightLines: {
      cpp: { forward: 12, backward: 20, update: 25, default: 12 },
      python: { forward: 8, backward: 15, update: 20, default: 8 },
    },
    codeStepHighlightLines: {
      cpp: { default: [8, 9, 10, 12, 16, 20, 21, 25] },
      python: { default: [4, 5, 6, 8, 12, 15, 16, 20] },
    },
    variablesSnapshot: { layer: '-', activation: '-', loss: '-', gradient: '-' },
    code: {
      cpp: `double sigmoid(double z) {
    return 1.0 / (1.0 + exp(-z));
}

double train_one_sample(Vector x, double y, Network& net, double lr) {
    Vector a0 = x;
    Vector z1 = net.W1 * a0 + net.b1;
    Vector a1 = sigmoid(z1);
    Vector z2 = net.W2 * a1 + net.b2;
    double y_hat = sigmoid(z2[0]);
    double loss = 0.5 * pow(y_hat - y, 2);

    double dz2 = (y_hat - y) * y_hat * (1 - y_hat);
    Matrix dW2 = outer(Vector{dz2}, a1);
    Vector dz1 = (transpose(net.W2) * Vector{dz2}) * sigmoid_grad(z1);
    Matrix dW1 = outer(dz1, a0);

    net.W2 -= lr * dW2;
    net.b2 -= lr * Vector{dz2};
    net.W1 -= lr * dW1;
    net.b1 -= lr * dz1;
    return loss;
}`,
      python: `def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def train_one_sample(x, y, net, lr):
    a0 = x
    z1 = net.W1 @ a0 + net.b1
    a1 = sigmoid(z1)
    z2 = net.W2 @ a1 + net.b2
    y_hat = sigmoid(z2)
    loss = 0.5 * (y_hat - y) ** 2

    dz2 = (y_hat - y) * y_hat * (1 - y_hat)
    dW2 = np.outer(dz2, a1)
    dz1 = (net.W2.T @ dz2) * a1 * (1 - a1)
    dW1 = np.outer(dz1, a0)

    net.W2 -= lr * dW2
    net.b2 -= lr * dz2
    net.W1 -= lr * dW1
    net.b1 -= lr * dz1
    return loss`,
    },
    pseudocode: `procedure TRAIN_ONE_SAMPLE(x, y)
    a0 <- x
    z1 <- W1 * a0 + b1
    a1 <- sigmoid(z1)
    z2 <- W2 * a1 + b2
    y_hat <- sigmoid(z2)
    compute output delta and hidden delta
    compute dW/db for every layer
    update parameters by gradient descent`,
    bigO: { time: '单样本两层网络前向+反向约 O(dh + h)。批量训练乘以 batch size 和迭代轮数。', space: '保存激活、梯度和参数约 O(dh + h)。', note: '可视化按 step 展示前向、误差、梯度和更新。' },
    compare: [
      { method: '前向传播', data: '输入到输出', strength: '得到预测和 loss', tradeoff: '不更新参数' },
      { method: '反向传播', data: '输出到输入', strength: '计算每层梯度', tradeoff: '依赖链式法则和缓存' },
    ],
    quiz: [{ q: '反向传播的核心数学工具是什么？', options: ['链式法则', '快速排序', '欧氏距离', '最大流'], answer: 0, explanation: '反向传播把 loss 对每层参数的导数按链式法则逐层传回。' }],
  },
  'dl-cnn': {
    defaultCodeFocus: 'conv',
    codeFocusLabels: { conv: '卷积', pool: '池化', classify: '分类', default: 'CNN 前向' },
    codeHighlightLines: {
      cpp: { conv: 8, pool: 18, classify: 27, default: 8 },
      python: { conv: 7, pool: 16, classify: 24, default: 7 },
    },
    codeStepHighlightLines: {
      cpp: { default: [4, 5, 7, 8, 9, 17, 18, 27] },
      python: { default: [3, 4, 6, 7, 8, 15, 16, 24] },
    },
    variablesSnapshot: { layer: 'conv', kernel: '3x3', featureMap: '-', pool: '-' },
    code: {
      cpp: `Matrix conv2d(Matrix image, Matrix kernel) {
    int H = image.rows(), W = image.cols();
    int K = kernel.rows();
    Matrix out(H - K + 1, W - K + 1);
    for (int r = 0; r <= H - K; ++r) {
        for (int c = 0; c <= W - K; ++c) {
            double sum = 0;
            for (int i = 0; i < K; ++i)
                for (int j = 0; j < K; ++j)
                    sum += image(r+i, c+j) * kernel(i, j);
            out(r, c) = relu(sum);
        }
    }
    return out;
}

Matrix max_pool2d(Matrix feature, int size = 2) {
    Matrix pooled(feature.rows()/size, feature.cols()/size);
    for (int r = 0; r < pooled.rows(); ++r)
        for (int c = 0; c < pooled.cols(); ++c)
            pooled(r,c) = max_region(feature, r*size, c*size, size);
    return pooled;
}

Vector cnn_forward(Matrix image, CNN& model) {
    Matrix fmap = conv2d(image, model.kernel);
    Matrix pooled = max_pool2d(fmap);
    return softmax(model.fc * flatten(pooled) + model.bias);
}`,
      python: `def conv2d(image, kernel):
    h, w = image.shape
    k = kernel.shape[0]
    out = np.zeros((h-k+1, w-k+1))
    for r in range(h-k+1):
        for c in range(w-k+1):
            patch = image[r:r+k, c:c+k]
            out[r, c] = np.maximum(0, np.sum(patch * kernel))
    return out

def max_pool2d(feature, size=2):
    ph, pw = feature.shape[0] // size, feature.shape[1] // size
    pooled = np.zeros((ph, pw))
    for r in range(ph):
        for c in range(pw):
            patch = feature[r*size:(r+1)*size, c*size:(c+1)*size]
            pooled[r, c] = np.max(patch)
    return pooled

def cnn_forward(image, model):
    fmap = conv2d(image, model.kernel)
    pooled = max_pool2d(fmap)
    logits = model.fc @ pooled.flatten() + model.bias
    return softmax(logits)`,
    },
    pseudocode: `procedure CNN_FORWARD(image)
    slide kernel over image
    multiply each patch by kernel and sum
    apply activation to build feature map
    pool local regions to downsample
    flatten and classify with fully connected layer`,
    bigO: { time: '单个卷积层约 O(HWKC)，池化约 O(HW)。多通道和多卷积核按通道数与核数线性放大。', space: '主要保存特征图和池化结果，约 O(HW * filters)。', note: '可视化逐步高亮感受野、kernel、feature map 和 pool 区域。' },
    compare: [
      { method: '卷积', data: '局部 patch', strength: '提取边缘/纹理', tradeoff: '依赖 kernel 和步长' },
      { method: '池化', data: '局部区域', strength: '降采样、增强平移不变性', tradeoff: '丢失精细位置' },
    ],
    quiz: [{ q: 'CNN 卷积层主要利用了图像的什么结构？', options: ['局部空间结构', '随机顺序', '哈希表结构', '树结构'], answer: 0, explanation: '卷积核在局部窗口滑动，复用参数提取局部空间特征。' }],
  },
  'dl-rnn': {
    defaultCodeFocus: 'rnn',
    codeFocusLabels: { rnn: 'RNN 时间展开', lstm: 'LSTM 门控', default: '序列前向' },
    codeHighlightLines: {
      cpp: { rnn: 8, lstm: 20, default: 8 },
      python: { rnn: 6, lstm: 17, default: 6 },
    },
    codeStepHighlightLines: {
      cpp: { default: [4, 5, 6, 8, 9, 10, 19, 20] },
      python: { default: [3, 4, 5, 6, 7, 15, 16, 17] },
    },
    variablesSnapshot: { time: '-', hidden: '-', output: '-', gate: '-' },
    code: {
      cpp: `Vector rnn_step(double x_t, Vector h_prev, RNNCell cell) {
    Vector z = cell.Wxh * Vector{x_t} + cell.Whh * h_prev + cell.bh;
    return tanh(z);
}

vector<Vector> rnn_forward(vector<double> seq, RNNCell cell) {
    Vector h = zeros(cell.hiddenSize);
    vector<Vector> states;
    for (double x_t : seq) {
        h = rnn_step(x_t, h, cell);
        states.push_back(h);
    }
    return states;
}

LSTMState lstm_step(double x_t, LSTMState prev, LSTMCell cell) {
    Vector f = sigmoid(cell.Wf * concat(prev.h, x_t) + cell.bf);
    Vector i = sigmoid(cell.Wi * concat(prev.h, x_t) + cell.bi);
    Vector o = sigmoid(cell.Wo * concat(prev.h, x_t) + cell.bo);
    Vector c_hat = tanh(cell.Wc * concat(prev.h, x_t) + cell.bc);
    Vector c = f * prev.c + i * c_hat;
    Vector h = o * tanh(c);
    return {h, c};
}`,
      python: `def rnn_step(x_t, h_prev, cell):
    z = cell.Wxh @ np.array([x_t]) + cell.Whh @ h_prev + cell.bh
    return np.tanh(z)

def rnn_forward(seq, cell):
    h = np.zeros(cell.hidden_size)
    states = []
    for x_t in seq:
        h = rnn_step(x_t, h, cell)
        states.append(h)
    return states

def lstm_step(x_t, prev, cell):
    hx = np.concatenate([prev.h, [x_t]])
    f = sigmoid(cell.Wf @ hx + cell.bf)
    i = sigmoid(cell.Wi @ hx + cell.bi)
    o = sigmoid(cell.Wo @ hx + cell.bo)
    c_hat = np.tanh(cell.Wc @ hx + cell.bc)
    c = f * prev.c + i * c_hat
    h = o * np.tanh(c)
    return LSTMState(h=h, c=c)`,
    },
    pseudocode: `procedure RNN_FORWARD(sequence)
    h0 <- zeros
    for each time step t do
        ht <- tanh(Wxh * xt + Whh * h(t-1) + b)
        yt <- Why * ht + by
        record ht and yt
    end for`,
    bigO: { time: '标准 RNN 每步 O(hd + h^2)，长度 T 序列为 O(T(hd+h^2))。LSTM 常数约为 4 倍门控。', space: '推理可 O(h)，训练 BPTT 需保存 O(Th) 状态。', note: '可视化按时间步同步高亮输入、隐藏状态和输出。' },
    compare: [
      { method: 'RNN', data: '单隐藏状态', strength: '结构简单', tradeoff: '长序列梯度易消失' },
      { method: 'LSTM/GRU', data: '门控状态', strength: '更适合长期依赖', tradeoff: '参数更多' },
    ],
    quiz: [{ q: 'RNN 中隐藏状态 h_t 的作用是什么？', options: ['携带历史信息', '排序数组', '压缩图片尺寸', '计算最短路'], answer: 0, explanation: 'h_t 由当前输入和上一时刻隐藏状态共同决定，用于保留序列历史。' }],
  },
}

const DL_COMPLETION_ENRICHMENTS = {
  'dl-forward-propagation': {
    codeStepHighlightLines: { cpp: { default: [2, 3, 4, 5, 6, 7] }, python: { default: [2, 3, 4, 5, 6, 7] } },
    bigO: { time: '每层矩阵乘法为 O(n_l * n_{l-1} * batch)，总复杂度为各层求和。', space: '需要缓存每层 A/Z，约为各层激活大小之和。', note: '可视化逐层展示输入、线性变换和激活输出。' },
    compare: [{ method: '逐样本', data: '单个向量', strength: '便于理解', tradeoff: '效率低' }, { method: '批量矩阵', data: 'batch 矩阵', strength: 'GPU 友好', tradeoff: '维度更难追踪' }],
    quiz: [{ q: '前向传播中 Z = W A + b 后通常接什么？', options: ['激活函数', '排序函数', '哈希函数', '剪枝操作'], answer: 0, explanation: '线性变换后通过激活函数引入非线性。' }],
  },
  'dl-backward-propagation': {
    codeStepHighlightLines: { cpp: { default: [2, 3, 4, 5, 6, 7] }, python: { default: [2, 3, 4, 5, 6, 7] } },
    bigO: { time: '与前向传播同阶，通常也是各层矩阵乘法复杂度之和。', space: '需要前向缓存和各层梯度。', note: '可视化从输出层向输入层展示误差信号传播。' },
    compare: [{ method: '数值梯度', data: '微小扰动', strength: '易验证', tradeoff: '极慢' }, { method: '反向传播', data: '链式法则', strength: '高效', tradeoff: '实现需保存缓存' }],
    quiz: [{ q: '反向传播为什么需要前向缓存？', options: ['计算局部导数', '减少样本数量', '随机初始化', '生成测试集'], answer: 0, explanation: '梯度公式需要用到每层的输入、Z 和激活值。' }],
  },
  'dl-activation-functions': {
    codeStepHighlightLines: { cpp: { default: [2, 3, 4, 5, 6, 7] }, python: { default: [2, 3, 4, 5, 6, 7] } },
    bigO: { time: '对每个元素独立计算，复杂度 O(N)。', space: '原地计算可 O(1)，保留输出为 O(N)。', note: '可视化比较 Sigmoid、Tanh、ReLU 等函数形状和梯度。' },
    compare: [{ method: 'Sigmoid/Tanh', data: '平滑饱和', strength: '输出有界', tradeoff: '易梯度消失' }, { method: 'ReLU', data: '分段线性', strength: '训练快', tradeoff: '可能死神经元' }],
    quiz: [{ q: 'ReLU 的主要优点是什么？', options: ['计算简单且缓解梯度消失', '输出概率分布', '自动聚类', '精确求逆'], answer: 0, explanation: 'ReLU 正区间梯度为 1，计算简单，深层网络中常用。' }],
  },
  'dl-loss-functions': {
    codeStepHighlightLines: { cpp: { default: [2, 3, 4, 5, 6, 7] }, python: { default: [2, 3, 4, 5, 6, 7] } },
    bigO: { time: '对 batch 中每个样本累加，复杂度 O(N)。', space: '通常 O(1) 累加，保留逐样本误差为 O(N)。', note: '可视化比较 MSE、交叉熵等损失随预测变化的曲线。' },
    compare: [{ method: 'MSE', data: '连续误差', strength: '回归常用', tradeoff: '对离群点敏感' }, { method: '交叉熵', data: '概率分布', strength: '分类常用', tradeoff: '预测接近 0 时数值敏感' }],
    quiz: [{ q: '多分类 softmax 通常配合什么损失？', options: ['交叉熵', '欧氏距离排序', '基尼系数', '最大流'], answer: 0, explanation: 'softmax 输出类别概率，交叉熵衡量真实分布与预测分布差异。' }],
  },
  'dl-cnn-convolution': {
    codeStepHighlightLines: { cpp: { default: [2, 3, 4, 5, 6, 7] }, python: { default: [2, 3, 4, 5, 6, 7] } },
    bigO: { time: '单输出通道约 O(HW K^2 C)，多卷积核乘以输出通道数。', space: '输出特征图 O(H_out W_out C_out)。', note: '可视化逐步高亮输入 patch、kernel 和输出单元。' },
    compare: [{ method: 'valid 卷积', data: '无 padding', strength: '输出更小', tradeoff: '边缘信息损失' }, { method: 'same 卷积', data: '带 padding', strength: '尺寸保持', tradeoff: '引入边界填充' }],
    quiz: [{ q: '卷积核在图像上滑动时，每个输出值来自什么？', options: ['局部区域加权求和', '整张图排序', '随机采样', '哈希映射'], answer: 0, explanation: '卷积输出由局部 patch 与 kernel 元素乘积求和得到。' }],
  },
  'dl-pooling': {
    codeStepHighlightLines: { cpp: { default: [2, 3, 4, 5, 6, 7] }, python: { default: [2, 3, 4, 5, 6, 7] } },
    bigO: { time: '池化遍历每个局部窗口，复杂度约 O(HW)。', space: '输出降采样特征图，通常小于输入。', note: '可视化高亮池化窗口和当前最大/平均值。' },
    compare: [{ method: 'Max Pooling', data: '最大值', strength: '保留强响应', tradeoff: '忽略其它值' }, { method: 'Average Pooling', data: '平均值', strength: '平滑稳定', tradeoff: '特征响应变弱' }],
    quiz: [{ q: '池化层的主要作用是什么？', options: ['降采样并增强平移鲁棒性', '增加参数量', '生成词向量', '求最短路'], answer: 0, explanation: '池化减少空间尺寸，同时让局部微小平移对输出影响更小。' }],
  },
}

const AI_COMPLETION_DEFAULTS = {
  optim: {
    bigO: {
      time: '按可视化迭代步执行，T 步通常为 O(T * updateCost)，二阶或拟牛顿方法还会包含矩阵/方向更新成本。',
      space: '在线更新为 O(d)，保存轨迹、动量、历史梯度或近似 Hessian 时按算法增加到 O(Td) 或 O(d^2)。',
      note: '补齐层只提供教学页兜底说明；已有精写算法说明不会被覆盖。',
    },
    compare: [
      { method: '一阶方法', data: '梯度方向', strength: '实现简单，适合大规模训练', tradeoff: '学习率敏感，可能震荡' },
      { method: '二阶/拟二阶方法', data: '曲率或近似曲率', strength: '局部收敛快', tradeoff: '矩阵成本更高' },
    ],
    quiz: [{ q: '优化算法动画中最关键的同步状态是什么？', options: ['当前参数、梯度方向和损失变化', '页面背景颜色', '随机文件名', '浏览器缓存'], answer: 0, explanation: '教学重点是每一步参数如何沿更新方向移动，以及 loss 如何收敛。' }],
  },
  ml: {
    bigO: {
      time: '复杂度随样本数 N、特征维度 d 和迭代/树/簇数量变化；页面按动画 step 展示关键训练或推理阶段。',
      space: '主要保存训练数据、模型参数和当前可视化状态，通常为 O(Nd) 加模型规模。',
      note: '不同模型的精确复杂度会因实现而变，这里给出课程演示层面的统一说明。',
    },
    compare: [
      { method: '训练阶段', data: '样本和特征', strength: '学习模型参数或结构', tradeoff: '计算量较大' },
      { method: '预测/解释阶段', data: '当前样本和模型状态', strength: '便于观察决策过程', tradeoff: '只反映局部行为' },
    ],
    quiz: [{ q: '机器学习可视化 step 应该同步突出什么？', options: ['数据状态、模型参数和对应代码行', '只显示最终结论', '只显示静态文字', '隐藏中间变量'], answer: 0, explanation: '本平台要求动画、变量状态和右侧代码行一一对应。' }],
  },
  or: {
    bigO: {
      time: '最优化/运筹问题复杂度取决于变量数、约束数和求解策略；分支定界、整数规划等在最坏情况下可能指数级。',
      space: '保存约束、松弛解、表格或搜索树，常见为 O(mn) 到 O(nodes * state)。',
      note: '动画重点展示可行域、松弛问题、上下界、当前最优解和剪枝依据。',
    },
    compare: [
      { method: '连续松弛', data: '线性/凸约束', strength: '可快速得到界', tradeoff: '不一定满足整数约束' },
      { method: '离散搜索', data: '分支树和候选解', strength: '能处理整数条件', tradeoff: '搜索空间可能很大' },
    ],
    quiz: [{ q: '分支定界类动画中剪枝通常依赖什么？', options: ['上下界和当前最优整数解', '字体大小', '随机颜色', '代码文件长度'], answer: 0, explanation: '当节点界限不可能优于当前最优解，或不可行/已整数时即可剪枝。' }],
  },
  feature: {
    bigO: {
      time: '特征工程和评估指标通常线性扫描样本，常见为 O(Nd)；交叉验证会乘以折数和模型训练成本。',
      space: '需要保存变换后的特征、统计量或评估曲线，通常为 O(Nd) 或 O(N)。',
      note: '动画重点展示当前特征列、统计量、评估单元格和指标更新。',
    },
    compare: [
      { method: '特征变换', data: '原始特征', strength: '改善尺度、表示和可分性', tradeoff: '可能增加维度' },
      { method: '模型评估', data: '预测与真实标签', strength: '量化泛化表现', tradeoff: '需要关注数据划分和阈值' },
    ],
    quiz: [{ q: '评估指标动画最应该避免什么？', options: ['高亮与当前样本/矩阵单元错位', '显示变量状态', '展示公式过程', '支持单步'], answer: 0, explanation: '混淆矩阵、ROC 等模块必须让当前样本、公式和高亮位置保持同步。' }],
  },
  dl: {
    bigO: {
      time: '深度学习模块复杂度由层类型、输入尺寸、隐藏维度和 batch size 决定，动画按前向/反向关键步骤拆解。',
      space: '训练需要保存参数、激活缓存和梯度，通常高于只做推理。',
      note: '页面重点展示张量流动、梯度传播和代码行同步。',
    },
    compare: [
      { method: '前向计算', data: '输入到输出', strength: '显示预测如何产生', tradeoff: '不解释参数如何学习' },
      { method: '反向计算', data: 'loss 到参数', strength: '显示梯度来源', tradeoff: '链式法则步骤更密集' },
    ],
    quiz: [{ q: '深度学习动画中代码高亮应跟随什么？', options: ['当前层或当前时间步的计算', '导航栏位置', '页面滚动条', '文件修改时间'], answer: 0, explanation: 'CNN/RNN/反向传播都应按当前层、窗口或时间步同步高亮代码。' }],
  },
}

function deriveDefaultStepLines(lesson, lang) {
  const source = lesson.code?.[lang] || lesson.pseudocode || ''
  const lines = source
    .split('\n')
    .map((text, index) => ({ text, line: index + 1 }))
    .filter(item => item.text.trim().length > 0)
    .map(item => item.line)
  return lines.length ? lines.slice(0, 8) : [1]
}

function completeAILessonMetadata(chapter, lesson) {
  if (lesson.exercise?.type !== 'playground') return

  if (!lesson.codeStepHighlightLines) {
    lesson.codeStepHighlightLines = {
      cpp: { default: deriveDefaultStepLines(lesson, 'cpp') },
      python: { default: deriveDefaultStepLines(lesson, 'python') },
    }
  }

  if (!lesson.codeHighlightLines && lesson.code) {
    lesson.codeHighlightLines = {
      cpp: { default: deriveDefaultStepLines(lesson, 'cpp')[0] },
      python: { default: deriveDefaultStepLines(lesson, 'python')[0] },
    }
  }

  if (!lesson.variablesSnapshot) {
    lesson.variablesSnapshot = { phase: '-', step: '-', metric: '-' }
  }

  const defaults = AI_COMPLETION_DEFAULTS[chapter.id]
  if (!defaults) return

  if (!lesson.bigO) {
    lesson.bigO = { ...defaults.bigO }
  }
  if (!Array.isArray(lesson.compare) || lesson.compare.length === 0) {
    lesson.compare = defaults.compare.map(row => ({ ...row }))
  }
  if (!Array.isArray(lesson.quiz) || lesson.quiz.length === 0) {
    lesson.quiz = defaults.quiz.map(row => ({ ...row, options: [...row.options] }))
  }
}

const LATE_COURSE_DEFAULTS = {
  nlp: {
    bigO: {
      time: '序列模块复杂度通常随 token 数 T 和隐藏维度 d 增长；注意力核心为 O(T^2 d)。',
      space: '需要保存 token 表示、注意力矩阵或中间激活，通常为 O(Td) 到 O(T^2)。',
      note: '动画按 token、矩阵或模块链路逐步高亮。'
    },
    compare: [
      { method: '词向量', data: 'token embedding', strength: '把离散词映射到连续空间', tradeoff: '上下文表达有限' },
      { method: 'Transformer', data: '上下文化表示', strength: '捕获长距离依赖', tradeoff: '注意力矩阵成本较高' },
    ],
    quiz: [{ q: 'NLP 可视化中最重要的同步对象是什么？', options: ['当前 token/矩阵行和对应代码行', '页面背景图', '文件大小', '滚动条颜色'], answer: 0, explanation: '词向量、注意力和 Transformer 都要让当前 token 或矩阵行与代码步骤同步。' }],
  },
  cv: {
    bigO: {
      time: '卷积特征提取约为 O(HW K^2 C)，检测还会叠加候选框筛选与 NMS 成本。',
      space: '主要保存图像张量、特征图、logits 和候选框。',
      note: '动画突出局部感受野、特征流和最终类别/框。'
    },
    compare: [
      { method: '图像分类', data: '整图标签', strength: '输出单一类别概率', tradeoff: '不定位目标' },
      { method: '目标检测', data: '类别+位置', strength: '能定位多个对象', tradeoff: '训练和后处理更复杂' },
    ],
    quiz: [{ q: '目标检测相比图像分类额外预测什么？', options: ['边界框位置', '排序索引', '数据库事务', '梯度符号'], answer: 0, explanation: '检测任务同时输出类别和边界框。' }],
  },
  rl: {
    bigO: {
      time: '每个 episode 按环境交互步数展开；值函数更新通常 O(|A|)，策略梯度按轨迹长度累加。',
      space: 'Q 表需要 O(|S||A|)，神经策略还需要保存参数和轨迹。',
      note: '动画展示状态、动作、奖励、回报和参数更新。'
    },
    compare: [
      { method: 'Q-Learning', data: '状态-动作值', strength: '无模型、更新直观', tradeoff: '大状态空间需函数逼近' },
      { method: '策略梯度', data: '动作概率', strength: '可处理连续动作', tradeoff: '方差较高' },
    ],
    quiz: [{ q: 'Q-Learning 的 TD target 包含什么？', options: ['即时奖励和下一状态最大 Q 值', 'HTML 标签', '图片像素均值', '词频排序'], answer: 0, explanation: 'TD target = r + gamma * max_a Q(s_next,a)。' }],
  },
  llm: {
    bigO: {
      time: 'LLM 训练和推理成本主要由 token 数、层数和隐藏维度决定；RAG 还包含检索成本。',
      space: '需要保存模型参数、上下文 token、检索片段或工具调用状态。',
      note: '动画展示预训练、检索增强或 Agent 循环的关键链路。'
    },
    compare: [
      { method: '预训练/微调', data: '文本和偏好数据', strength: '塑造模型能力和行为', tradeoff: '训练成本高' },
      { method: 'RAG/Agent', data: '外部知识和工具', strength: '增强事实性和行动能力', tradeoff: '链路更长，需观测失败点' },
    ],
    quiz: [{ q: 'RAG 降低幻觉的关键做法是什么？', options: ['先检索证据再生成', '删除上下文', '随机选择答案', '只调大字体'], answer: 0, explanation: 'RAG 把相关知识片段注入 prompt，让生成基于外部证据。' }],
  },
}

Object.assign(AI_COMPLETION_DEFAULTS, LATE_COURSE_DEFAULTS)

const LATE_COURSE_CODE = {
  'nlp-word-embedding': {
    variablesSnapshot: { phase: 'embedding', metric: 'cosine' },
    pseudocode: `procedure WORD_EMBEDDING(tokens, E)
    ids <- tokenize(tokens)
    vectors <- E[ids]
    score <- cosine(vectors[i], vectors[j])
    analogy <- vec("king") - vec("man") + vec("woman")
    nearest <- argmax cosine(analogy, E)
    return vectors, nearest`,
    code: {
      python: `import numpy as np

def cosine(a, b):
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

E = {
    "king": np.array([0.9, 0.2, 0.7]),
    "queen": np.array([0.88, 0.22, 0.76]),
    "man": np.array([0.7, 0.1, 0.1]),
    "woman": np.array([0.68, 0.18, 0.2]),
}
query = E["king"] - E["man"] + E["woman"]
nearest = max(E, key=lambda word: cosine(query, E[word]))`,
      cpp: `double cosine(Vec a, Vec b) {
    return dot(a, b) / (norm(a) * norm(b));
}

auto king = embedding["king"];
auto man = embedding["man"];
auto woman = embedding["woman"];
auto query = king - man + woman;
auto nearest = argmax_words([&](Word w) {
    return cosine(query, embedding[w]);
});`,
    },
  },
  'nlp-transformer': {
    variablesSnapshot: { phase: 'encoder', metric: 'attention' },
    pseudocode: `procedure TRANSFORMER_BLOCK(X)
    X <- X + positional_encoding
    A <- multi_head_attention(X)
    H <- layer_norm(X + A)
    F <- feed_forward(H)
    Y <- layer_norm(H + F)
    return Y`,
    code: {
      python: `def transformer_block(x):
    x = x + positional_encoding(x)
    attn = multi_head_attention(x, x, x)
    h = layer_norm(x + attn)
    f = feed_forward(h)
    y = layer_norm(h + f)
    return y`,
      cpp: `Tensor transformerBlock(Tensor x) {
    x = x + positionalEncoding(x);
    Tensor attn = multiHeadAttention(x, x, x);
    Tensor h = layerNorm(x + attn);
    Tensor f = feedForward(h);
    Tensor y = layerNorm(h + f);
    return y;
}`,
    },
  },
  'cv-image-classification': {
    variablesSnapshot: { phase: 'classification', metric: 'top-1' },
    pseudocode: `procedure CLASSIFY(image)
    x <- normalize(resize(image))
    features <- cnn_backbone(x)
    pooled <- global_average_pool(features)
    logits <- linear(pooled)
    probs <- softmax(logits)
    return argmax(probs)`,
    code: {
      python: `def classify(image, model):
    x = normalize(resize(image))
    features = model.backbone(x)
    pooled = global_average_pool(features)
    logits = model.classifier(pooled)
    probs = softmax(logits)
    return probs.argmax()`,
      cpp: `int classify(Image image, Model model) {
    Tensor x = normalize(resize(image));
    Tensor features = model.backbone(x);
    Tensor pooled = globalAveragePool(features);
    Tensor logits = model.classifier(pooled);
    Tensor probs = softmax(logits);
    return argmax(probs);
}`,
    },
  },
  'cv-object-detection': {
    variablesSnapshot: { phase: 'detection', metric: 'IoU' },
    pseudocode: `procedure DETECT(image)
    features <- backbone(image)
    anchors <- generate_anchors(features)
    boxes, scores <- detection_head(features, anchors)
    keep <- nms(boxes, scores, iou_threshold)
    return boxes[keep], scores[keep]`,
    code: {
      python: `def detect(image, model):
    features = model.backbone(image)
    anchors = generate_anchors(features)
    boxes, scores = model.head(features, anchors)
    keep = nms(boxes, scores, iou_threshold=0.5)
    return boxes[keep], scores[keep]`,
      cpp: `Detections detect(Image image, Detector model) {
    Tensor features = model.backbone(image);
    auto anchors = generateAnchors(features);
    auto [boxes, scores] = model.head(features, anchors);
    auto keep = nms(boxes, scores, 0.5);
    return gatherDetections(boxes, scores, keep);
}`,
    },
  },
  'rl-qlearning': {
    variablesSnapshot: { phase: 'td-update', metric: 'TD error' },
    pseudocode: `procedure Q_LEARNING(s)
    a <- epsilon_greedy(Q[s])
    s_next, r <- env.step(a)
    target <- r + gamma * max_a Q[s_next, a]
    error <- target - Q[s, a]
    Q[s, a] <- Q[s, a] + alpha * error`,
    code: {
      python: `def q_learning_step(Q, s, eps, alpha, gamma):
    a = epsilon_greedy(Q[s], eps)
    s_next, r = env.step(a)
    target = r + gamma * Q[s_next].max()
    td_error = target - Q[s, a]
    Q[s, a] += alpha * td_error
    return s_next, td_error`,
      cpp: `StepResult qLearningStep(Table& Q, State s) {
    Action a = epsilonGreedy(Q[s], eps);
    auto [sNext, reward] = env.step(a);
    double target = reward + gamma * maxValue(Q[sNext]);
    double error = target - Q[s][a];
    Q[s][a] += alpha * error;
    return {sNext, error};
}`,
    },
  },
  'rl-policy-gradient': {
    variablesSnapshot: { phase: 'policy-update', metric: 'return' },
    pseudocode: `procedure REINFORCE(policy)
    trajectory <- sample_episode(policy)
    returns <- discounted_returns(trajectory.rewards)
    for each step t do
        loss <- -log pi(a_t | s_t) * returns[t]
    end for
    update policy by gradient descent`,
    code: {
      python: `def reinforce(policy):
    trajectory = sample_episode(policy)
    returns = discounted_returns(trajectory.rewards)
    loss = 0.0
    for step, G in zip(trajectory, returns):
        loss += -policy.log_prob(step.state, step.action) * G
    loss.backward()
    optimizer.step()`,
      cpp: `void reinforce(Policy& policy) {
    auto trajectory = sampleEpisode(policy);
    auto returns = discountedReturns(trajectory.rewards);
    Loss loss = 0.0;
    for (int t = 0; t < trajectory.size(); ++t) {
        loss += -policy.logProb(trajectory[t].state, trajectory[t].action) * returns[t];
    }
    optimizer.step(loss);
}`,
    },
  },
  'llm-pretraining': {
    variablesSnapshot: { phase: 'training', metric: 'loss' },
    pseudocode: `procedure LLM_TRAINING(text)
    tokens <- tokenize(text)
    loss <- next_token_loss(tokens)
    update model on pretraining corpus
    fine_tune on instruction data
    align with preference feedback`,
    code: {
      python: `def training_step(model, tokens):
    inputs = tokens[:, :-1]
    targets = tokens[:, 1:]
    logits = model(inputs)
    loss = cross_entropy(logits, targets)
    loss.backward()
    optimizer.step()
    return loss`,
      cpp: `double trainingStep(Model& model, Tokens tokens) {
    auto inputs = tokens.dropLast();
    auto targets = tokens.dropFirst();
    Tensor logits = model.forward(inputs);
    double loss = crossEntropy(logits, targets);
    optimizer.step(loss);
    return loss;
}`,
    },
  },
  'llm-rag': {
    variablesSnapshot: { phase: 'retrieve', metric: 'top-k' },
    pseudocode: `procedure RAG(query, docs)
    chunks <- split_documents(docs)
    index <- embed_and_store(chunks)
    evidence <- retrieve_top_k(index, query)
    prompt <- build_prompt(query, evidence)
    answer <- llm.generate(prompt)
    return answer, evidence`,
    code: {
      python: `def rag_answer(query, vector_db, llm):
    q_vec = embed(query)
    chunks = vector_db.search(q_vec, top_k=3)
    prompt = build_prompt(query, chunks)
    answer = llm.generate(prompt)
    return answer, chunks`,
      cpp: `RagResult ragAnswer(string query, VectorDB& db, LLM& llm) {
    Vector q = embed(query);
    auto chunks = db.search(q, 3);
    string prompt = buildPrompt(query, chunks);
    string answer = llm.generate(prompt);
    return {answer, chunks};
}`,
    },
  },
  'llm-agent': {
    variablesSnapshot: { phase: 'agent-loop', metric: 'progress' },
    pseudocode: `procedure AGENT(goal)
    memory <- load_context(goal)
    while not done do
        plan <- decide_next_action(goal, memory)
        result <- call_tool(plan.tool, plan.args)
        memory <- update_memory(result)
    end while
    return final_answer(memory)`,
    code: {
      python: `def run_agent(goal, tools):
    memory = load_context(goal)
    while not done(memory):
        action = planner.next_action(goal, memory)
        result = tools[action.name](**action.args)
        memory = update_memory(memory, result)
    return final_answer(memory)`,
      cpp: `Answer runAgent(Goal goal, ToolSet tools) {
    Memory memory = loadContext(goal);
    while (!done(memory)) {
        Action action = planner.nextAction(goal, memory);
        Result result = tools.call(action.name, action.args);
        memory = updateMemory(memory, result);
    }
    return finalAnswer(memory);
}`,
    },
  },
}

// 各章节专属 ENRICHMENTS(dl 有两轮 assign,保持独立 map 顺序应用,
// 不合并成单 map——同一 lesson-id 出现在两个 map 时字段要逐层合并而非整体覆盖)
const PER_CHAPTER_ENRICHMENTS = {
  optim: [OPTIMIZATION_ENRICHMENTS],
  ml: [ML_ENRICHMENTS],
  dl: [DL_ENRICHMENTS, DL_COMPLETION_ENRICHMENTS],
}

/**
 * 对单个章节做全部补全(原位 mutate lessons,与拆分前 curriculum.js 顶层
 * 循环完全同序):章节 ENRICHMENTS → LATE_COURSE_CODE → completeAILessonMetadata。
 * 幂等:completeAILessonMetadata 自带 if(!lesson.bigO) 守卫,Object.assign
 * 重复执行结果不变;loadChapter 的 Promise 缓存另保证只跑一次。
 * @param {{id: string, title: string, lessons: object[]}} chapter
 */
export function enrichChapter(chapter) {
  for (const map of PER_CHAPTER_ENRICHMENTS[chapter.id] || []) {
    for (const lesson of chapter.lessons || []) {
      if (map[lesson.id]) Object.assign(lesson, map[lesson.id])
    }
  }
  for (const lesson of chapter.lessons || []) {
    if (LATE_COURSE_CODE[lesson.id]) Object.assign(lesson, LATE_COURSE_CODE[lesson.id])
  }
  if (AI_COMPLETION_DEFAULTS[chapter.id]) {
    for (const lesson of chapter.lessons || []) {
      completeAILessonMetadata(chapter, lesson)
    }
  }
  return chapter
}
