// AI 专业课 · 最优化与运筹优化（or）章节课节数据
// 从 curriculum.js 原样拆出（2026-06）。补全/注入逻辑（AI_COMPLETION_DEFAULTS、
// LATE_COURSE_CODE、completeAILessonMetadata）仍在 ../curriculum.js，
// 模块加载时会原位向这些 lesson 对象补字段。
export const OR_LESSONS = [
        {
          id: 'or-linear-programming',
          title: '线性规划',
          summary: '约束、可行域、目标等值线与最优顶点',
          theory: `## 线性规划 (Linear Programming)

线性规划用于在线性约束下优化线性目标函数：

$$\\max c^T x, \\quad s.t. \\quad Ax \\le b, \\quad x \\ge 0$$

### 可视化重点

1. 每条约束对应一个半平面
2. 所有半平面的交集形成可行域
3. 目标函数等值线沿梯度方向移动
4. 若有有限最优解，通常出现在可行域顶点

### 三类结果

- 有界最优：等值线停在某个顶点
- 无界：目标可沿可行方向无限增大
- 不可行：约束交集为空
`,
          exercise: { type: 'playground', viz: 'linearProgramming' },
          code: {
            python: `def solve_lp_by_vertices(vertices, c):
    best = None
    best_value = -float('inf')
    for x in vertices:
        value = dot(c, x)
        if value > best_value:
            best = x
            best_value = value
    return best, best_value`,
            cpp: `pair<Point,double> solve_lp_by_vertices(vector<Point> vertices, Point c) {
    Point best{};
    double best_value = -INF;
    for (auto x : vertices) {
        double value = c.x * x.x + c.y * x.y;
        if (value > best_value) {
            best = x;
            best_value = value;
        }
    }
    return {best, best_value};
}`,
          },
          pseudocode: `procedure SOLVE_LP_BY_VERTICES(constraints, objective)
    build feasible polygon from half-planes
    enumerate every feasible vertex
    evaluate objective on each vertex
    return vertex with best objective value`,
        },
        {
          id: 'or-simplex',
          title: '单纯形法',
          summary: '线性规划的顶点搜索算法',
          theory: `## 单纯形法 (Simplex Method)

求解线性规划问题的经典算法：沿可行域的**顶点**移动，逐步改善目标值。

### 标准形式

$$\\max c^T x, \\quad s.t. \\quad Ax \\leq b, \\quad x \\geq 0$$

### 核心思想

1. 从初始基本可行解（顶点）开始
2. 检查是否有相邻顶点能改善目标
3. 如果有，移动到那个顶点（pivot）
4. 重复直到无法改善（达到最优）

### 复杂度

- 最坏情况指数级，但实际中通常很快
- 平均复杂度约 $O(m^2 n)$
`,
          exercise: { type: 'playground', viz: 'simplex' },
          code: {
            python: `def simplex_step(tableau):
    # 选择入基变量（最负的 reduced cost）
    pivot_col = np.argmin(tableau[-1, :-1])
    if tableau[-1, pivot_col] >= 0:
        return 'optimal'
    # 选择出基变量（最小比率测试）
    ratios = tableau[:-1, -1] / tableau[:-1, pivot_col]
    ratios[tableau[:-1, pivot_col] <= 0] = np.inf
    pivot_row = np.argmin(ratios)
    # Pivot 操作
    tableau[pivot_row] /= tableau[pivot_row, pivot_col]
    for i in range(len(tableau)):
        if i != pivot_row:
            tableau[i] -= tableau[i, pivot_col] * tableau[pivot_row]
    return tableau`,
            cpp: `int simplex_step(Matrix& tableau) {
    int m = tableau.rows()-1, n = tableau.cols()-1;
    int pivot_col = argmin(tableau.row(m).head(n));
    if (tableau(m, pivot_col) >= 0) return OPTIMAL;
    int pivot_row = -1; double min_ratio = INF;
    for (int i = 0; i < m; i++) {
        if (tableau(i, pivot_col) > 0) {
            double r = tableau(i, n) / tableau(i, pivot_col);
            if (r < min_ratio) { min_ratio = r; pivot_row = i; }
        }
    }
    pivot(tableau, pivot_row, pivot_col);
    return CONTINUE;
}`,
          },
          pseudocode: `procedure SIMPLEX(tableau)
    while there exists negative reduced cost do
        select entering variable (most negative)
        select leaving variable (min ratio test)
        pivot on selected element
    end while
    return optimal solution`,
        },
        {
          id: 'or-branch-and-bound',
          title: '分支定界法',
          summary: '整数规划的树搜索 + 剪枝',
          theory: `## 分支定界法 (Branch and Bound)

求解整数规划 (IP) 的精确算法，通过**LP 松弛**获得上下界来剪枝：

### 核心思想

1. **松弛**: 去掉整数约束，求解 LP 松弛
2. **分支**: 如果解不满足整数约束，选一个分数变量分两支
3. **定界**: LP 松弛值提供上界（最大化问题）
4. **剪枝**: 如果节点上界 ≤ 当前最优整数解，剪掉

### 剪枝条件

- **不可行**: LP 松弛无解
- **整数最优**: 解已经是整数 → 更新 incumbent
- **界不够好**: 上界 ≤ 当前最好整数解
`,
          exercise: { type: 'playground', viz: 'branchAndBound' },
          code: {
            python: `def branch_and_bound(lp_solver, bounds, integer_vars):
    best_obj = -float('inf')
    best_sol = None
    queue = [(bounds, None)]  # (bounds, branching_constraint)
    nodes_explored = 0
    while queue:
        node = queue.pop()
        nodes_explored += 1
        result = lp_solver.solve(node.bounds)
        if result.status == 'infeasible': continue
        if result.obj <= best_obj: continue  # 剪枝
        if all_integer(result.sol, integer_vars):
            best_obj = result.obj
            best_sol = result.sol
            continue
        # 分支
        var, frac = most_fractional(result.sol, integer_vars)
        queue.append(add_constraint(var, '<=', floor(frac)))
        queue.append(add_constraint(var, '>=', ceil(frac)))
    return best_sol, nodes_explored`,
            cpp: `Solution branch_and_bound(LPSolver solver, Queue<Node> queue) {
    Solution best; best.obj = -INF;
    int explored = 0;
    while (!queue.empty()) {
        Node node = queue.pop(); explored++;
        auto result = solver.solve(node);
        if (result.infeasible || result.obj <= best.obj) continue;
        if (is_integer(result.sol)) { best = result; continue; }
        auto [var, frac] = most_fractional(result.sol);
        queue.push(add_constraint(node, var, LE, floor(frac)));
        queue.push(add_constraint(node, var, GE, ceil(frac)));
    }
    return best;
}`,
          },
          pseudocode: `procedure BRANCH_AND_BOUND(ip)
    queue <- [root_node]
    best_integer <- -infinity
    while queue not empty do
        node <- dequeue
        solve LP relaxation of node
        if infeasible or bound <= best_integer: prune
        else if solution is integer: update best_integer
        else: branch on fractional variable, enqueue children
    end while
    return best_integer_solution`,
        },
        {
          id: 'or-lagrangian',
          title: '拉格朗日乘子法',
          summary: '将约束优化转化为无约束优化',
          theory: `## 拉格朗日乘子法

将**约束优化**问题转化为无约束问题：

### 等式约束

$$\\min f(x), \\quad s.t. \\quad g(x) = 0$$

构造拉格朗日函数: $L(x, \\lambda) = f(x) + \\lambda g(x)$

最优性条件: $\\nabla_x L = 0, \\quad \\nabla_\\lambda L = 0$

即 $\\nabla f = -\\lambda \\nabla g$（梯度平行）

### 几何直觉

在最优解处，目标函数的等高线与约束曲线**相切**——梯度方向平行。

$\\lambda$ 称为**影子价格**，表示约束右端变化一个单位对目标值的影响。
`,
          exercise: { type: 'playground', viz: 'lagrangian' },
          code: {
            python: `def lagrangian_optimization(f, grad_f, g, grad_g, lr=0.01, lr_lam=0.01):
    x = np.array([2.0, 2.0])  # 初始点
    lam = 0.0  # 拉格朗日乘子
    history = []
    for _ in range(100):
        gf = grad_f(x)
        gg = grad_g(x)
        # 更新 x: 最小化 L
        x -= lr * (gf + lam * gg)
        # 更新 lambda: 最大化 L（对偶上升）
        lam += lr_lam * g(x)
        history.append((x.copy(), lam, f(x), g(x)))
    return history`,
            cpp: `void lagrangian_step(Vector& x, double& lam, auto grad_f, auto grad_g,
                     auto g, double lr_x, double lr_lam) {
    Vector gf = grad_f(x);
    Vector gg = grad_g(x);
    x -= lr_x * (gf + lam * gg);  // primal update
    lam += lr_lam * g(x);          // dual ascent
}`,
          },
          pseudocode: `procedure LAGRANGIAN_OPT(f, g, lr_x, lr_lambda)
    initialize x, lambda
    repeat
        x <- x - lr_x * (grad_f(x) + lambda * grad_g(x))
        lambda <- lambda + lr_lambda * g(x)
    until convergence
    return x, lambda`,
        },
        {
          id: 'or-convex-optimization',
          title: '凸优化基础',
          summary: '凸函数、凸集、局部最优即全局最优',
          theory: `## 凸优化

### 凸集

集合 $C$ 是凸的，如果任意两点连线都在 $C$ 中：
$$\\forall x, y \\in C, \\theta \\in [0,1]: \\theta x + (1-\\theta)y \\in C$$

### 凸函数

$$f(\\theta x + (1-\\theta)y) \\leq \\theta f(x) + (1-\\theta)f(y)$$

### 关键性质

- **局部最优 = 全局最优**（凸优化最重要的性质）
- 一阶条件: $f(y) \\geq f(x) + \\nabla f(x)^T(y-x)$
- 二阶条件: Hessian $\\nabla^2 f \\succeq 0$（半正定）

### 凸优化 vs 非凸优化

| 性质 | 凸 | 非凸 |
|------|---|------|
| 局部最优 | 即全局最优 | 可能多个局部最优 |
| 求解 | 多项式时间 | 通常 NP-hard |
| 梯度下降 | 保证收敛 | 可能卡在局部最优 |
`,
          exercise: { type: 'playground', viz: 'convexOptimization' },
          code: {
            python: `def is_convex(hessian):
    # 检查 Hessian 是否半正定
    eigenvalues = np.linalg.eigvalsh(hessian)
    return np.all(eigenvalues >= -1e-10)

def gradient_descent_convex(f, grad_f, x0, lr=0.01, max_iter=100):
    x = x0.copy()
    trajectory = [x.copy()]
    for _ in range(max_iter):
        g = grad_f(x)
        x = x - lr * g
        trajectory.append(x.copy())
    # 凸函数保证收敛到全局最优
    return x, trajectory`,
            cpp: `bool is_convex(Matrix hessian) {
    SelfAdjointEigenSolver<Matrix> solver(hessian);
    return solver.eigenvalues().minCoeff() >= -1e-10;
}

Vector gd_convex(auto f, auto grad, Vector x, double lr, int iters) {
    for (int i = 0; i < iters; i++)
        x -= lr * grad(x);
    return x;  // guaranteed global optimum for convex f
}`,
          },
          pseudocode: `procedure CONVEX_CHECK(f)
    H <- hessian(f)
    if eigenvalues(H) >= 0: f is convex
    property: local_min = global_min

procedure GD_CONVEX(f, grad_f, x0, lr)
    x <- x0
    repeat
        x <- x - lr * grad_f(x)
    until convergence
    return x  // guaranteed global optimum`,
        },
        {
          id: 'or-integer-programming',
          title: '整数规划',
          summary: '变量必须取整数值，NP-hard 问题',
          theory: `## 整数规划 (Integer Programming)

要求部分或全部变量取**整数值**的线性规划：

$$\\max c^T x, \\quad s.t. \\quad Ax \\leq b, \\quad x \\geq 0, \\quad x \\in \\mathbb{Z}^n$$

### 与 LP 松弛的关系

LP 松弛（去掉整数约束）的最优解通常**不是整数**。
整数最优解可能在可行域内部（不在边界上）。

### 整数间隙 (Integrality Gap)

$$\\text{Gap} = \\frac{|z_{LP} - z_{IP}|}{|z_{IP}|}$$

LP 松弛的最优值提供上界/下界，间隙衡量 IP 的难度。

### 应用场景

- 0-1 规划（选/不选决策）
- 背包问题
- 指派问题
- 旅行商问题 (TSP)
`,
          exercise: { type: 'playground', viz: 'integerProgramming' },
          code: {
            python: `def solve_ip_enumeration(c, A, b, integer_vars):
    # 小规模 IP 的暴力枚举
    lp_relax = solve_lp(c, A, b)
    # 在 LP 最优解附近枚举整数点
    best_obj = -float('inf')
    best_sol = None
    bounds = get_bounds(A, b)
    for candidate in enumerate_integer_points(bounds):
        if is_feasible(candidate, A, b):
            obj = c @ candidate
            if obj > best_obj:
                best_obj = obj
                best_sol = candidate
    gap = (lp_relax.obj - best_obj) / abs(best_obj) if best_obj else float('inf')
    return best_sol, gap`,
            cpp: `Solution solve_ip_small(Solver solver, Vector c, Matrix A, Vector b) {
    Solution lp_opt = solver.solve_lp(c, A, b);
    Solution best; best.obj = -INF;
    // Enumerate integer points near LP optimum
    for (auto candidate : enumerate_nearby(lp_opt.sol)) {
        if (A * candidate <= b && candidate >= Vector::Zero(candidate.size())) {
            double obj = c.dot(candidate);
            if (obj > best.obj) { best.sol = candidate; best.obj = obj; }
        }
    }
    return best;
}`,
          },
          pseudocode: `procedure INTEGER_PROGRAMMING(c, A, b)
    lp_opt <- solve_LP_relaxation(c, A, b)
    integer_opt <- branch_and_bound(c, A, b)
    gap <- |lp_opt - integer_opt| / |integer_opt|
    return integer_opt, gap`,
        },
]
