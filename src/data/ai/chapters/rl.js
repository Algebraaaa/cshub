// AI 专业课 · 强化学习（rl）章节课节数据
// 从 curriculum.js 原样拆出（2026-06）。补全/注入逻辑（AI_COMPLETION_DEFAULTS、
// LATE_COURSE_CODE、completeAILessonMetadata）仍在 ../curriculum.js，
// 模块加载时会原位向这些 lesson 对象补字段。
export const RL_LESSONS = [
  {
    id: 'rl-mdp',
    title: '马尔可夫决策过程 (MDP)',
    summary: '状态、动作、奖励、转移概率、折扣因子',
    theory: `## 马尔可夫决策过程 (MDP)

MDP 是强化学习的数学框架，用五元组 $(\\mathcal{S}, \\mathcal{A}, P, R, \\gamma)$ 描述：

### 五元组

| 符号 | 含义 |
|------|------|
| $\\mathcal{S}$ | 状态空间（有限或无限） |
| $\\mathcal{A}$ | 动作空间 |
| $P$ | 转移概率函数 $P(s' \\mid s, a)$ |
| $R$ | 奖励函数 $R(s, a, s')$ 或 $R(s, a)$ |
| $\\gamma$ | 折扣因子 $\\gamma \\in [0, 1]$ |

### 马尔可夫性质

下一状态只依赖于当前状态和动作，与历史无关：

$$P(s_{t+1} \\mid s_t, a_t, s_{t-1}, a_{t-1}, \\ldots) = P(s_{t+1} \\mid s_t, a_t)$$

### 回报 (Return)

从时刻 $t$ 开始的累积折扣奖励：

$$G_t = R_{t+1} + \\gamma R_{t+2} + \\gamma^2 R_{t+3} + \\cdots = \\sum_{k=0}^{\\infty} \\gamma^k R_{t+k+1}$$

### 折扣因子的意义

- $\\gamma = 0$：只看即时奖励（短视）
- $\\gamma = 1$：未来奖励与即时奖励同等重要（远见）
- 通常 $\\gamma \\in [0.9, 0.99]$
`,
    exercise: { type: 'playground', viz: 'qlearning' },
    code: {
      cpp: `struct MDP {
    int n_states, n_actions;
    vector<vector<vector<double>>> P;  // P[s][a][s'] = probability
    vector<vector<double>> R;          // R[s][a] = reward
    double gamma;

    double sample_next_state(int s, int a) {
        double r = R[s][a];
        // 按转移概率采样下一状态
        double rand_val = (double)rand() / RAND_MAX;
        double cumulative = 0.0;
        for (int s_prime = 0; s_prime < n_states; s_prime++) {
            cumulative += P[s][a][s_prime];
            if (rand_val <= cumulative) return s_prime;
        }
        return n_states - 1;
    }
};`,
      python: `import numpy as np

class MDP:
    def __init__(self, n_states, n_actions, gamma=0.99):
        self.n_states = n_states
        self.n_actions = n_actions
        self.gamma = gamma
        # 转移概率 P[s][a][s']
        self.P = np.zeros((n_states, n_actions, n_states))
        # 奖励 R[s][a]
        self.R = np.zeros((n_states, n_actions))

    def sample_next_state(self, s, a):
        """按转移概率采样下一状态"""
        return np.random.choice(
            self.n_states,
            p=self.P[s][a]
        )

    def step(self, s, a):
        """执行一步，返回 (next_state, reward, done)"""
        s_prime = self.sample_next_state(s, a)
        reward = self.R[s][a]
        done = (s_prime == self.n_states - 1)  # 假设终止状态为最后一个
        return s_prime, reward, done`
    },
    variablesSnapshot: {
      n_states: '5',
      n_actions: '4',
      gamma: '0.95',
      P_shape: '(5, 4, 5)',
      R_shape: '(5, 4)'
    },
    pseudocode: `procedure MDP_STEP(s, a, P, R, gamma)
    s' <- sample from P(s' | s, a)
    r <- R(s, a)
    return (s', r)

procedure COMPUTE_RETURN(rewards, gamma)
    G <- 0
    for t from T down to 1 do
        G <- rewards[t] + gamma * G
    end for
    return G`,
    bigO: {
      time: 'MDP 本身没有计算复杂度，它是一个建模框架。采样一步是 O(1)（假设转移概率可查）。计算回报需要 O(T) 遍历时间序列。',
      space: '存储转移概率表需要 O(|S| × |A| × |S|) 空间，存储奖励表需要 O(|S| × |A|) 空间。',
      note: '|S| 是状态数，|A| 是动作数。对于大规模 MDP，通常用函数近似而非查表。'
    },
    compare: [
      { method: '有限 MDP', data: '|S| 和 |A| 有限', strength: '可用动态规划精确求解', tradeoff: '大规模问题状态爆炸' },
      { method: '连续 MDP', data: '状态/动作连续', strength: '建模更精确', tradeoff: '需要函数近似，难以精确求解' },
      { method: 'POMDP (部分可观测)', data: '观测 ≠ 状态', strength: '更接近真实世界', tradeoff: '需要维护信念状态，复杂度极高' }
    ],
    quiz: [
      {
        q: 'MDP 中折扣因子 γ=0 意味着什么？',
        options: [
          '只关心即时奖励，完全忽略未来奖励',
          '未来奖励和即时奖励同等重要',
          '奖励会翻倍',
          '没有终止状态'
        ],
        answer: 0,
        explanation: 'γ=0 时 G_t = R_{t+1}，智能体完全短视，只追求即时奖励。γ 越大越有远见。'
      },
      {
        q: '马尔可夫性质要求什么？',
        options: [
          '下一状态只依赖于当前状态和动作',
          '所有状态必须可观测',
          '奖励必须为正',
          '转移概率必须对称'
        ],
        answer: 0,
        explanation: '马尔可夫性质要求下一状态的条件分布只依赖于当前状态和动作，与更早的历史无关。'
      }
    ]
  },
  {
    id: 'rl-bellman',
    title: '贝尔曼方程',
    summary: '值函数、最优性、动态规划基础',
    theory: `## 贝尔曼方程

贝尔曼方程是强化学习的核心递归关系，描述了值函数的自洽性质。

### 状态值函数 $V^\\pi(s)$

在策略 $\\pi$ 下，从状态 $s$ 开始的期望回报：

$$V^\\pi(s) = \\mathbb{E}_\\pi[G_t \\mid s_t = s]$$

### 动作值函数 $Q^\\pi(s, a)$

在状态 $s$ 选择动作 $a$，之后遵循策略 $\\pi$ 的期望回报：

$$Q^\\pi(s, a) = \\mathbb{E}_\\pi[G_t \\mid s_t = s, a_t = a]$$

### 贝尔曼期望方程

$$V^\\pi(s) = \\sum_a \\pi(a \\mid s) \\sum_{s', r} P(s', r \\mid s, a) [r + \\gamma V^\\pi(s')]$$

$$Q^\\pi(s, a) = \\sum_{s', r} P(s', r \\mid s, a) [r + \\gamma \\sum_{a'} \\pi(a' \\mid s') Q^\\pi(s', a')]$$

### 贝尔曼最优方程

$$V^*(s) = \\max_a \\sum_{s', r} P(s', r \\mid s, a) [r + \\gamma V^*(s')]$$

$$Q^*(s, a) = \\sum_{s', r} P(s', r \\mid s, a) [r + \\gamma \\max_{a'} Q^*(s', a')]$$

### 最优策略

$$\\pi^*(a \\mid s) = \\begin{cases} 1 & \\text{if } a = \\arg\\max_{a'} Q^*(s, a') \\\\ 0 & \\text{otherwise} \\end{cases}$$
`,
    exercise: { type: 'playground', viz: 'qlearning' },
    code: {
      cpp: `vector<double> bellman_expectation(
    const MDP& mdp,
    const vector<vector<double>>& pi,  // pi[s][a] = 策略概率
    const vector<double>& V
) {
    int nS = mdp.n_states, nA = mdp.n_actions;
    vector<double> V_new(nS, 0.0);
    for (int s = 0; s < nS; s++) {
        for (int a = 0; a < nA; a++) {
            double action_val = 0.0;
            for (int s_prime = 0; s_prime < nS; s_prime++) {
                action_val += mdp.P[s][a][s_prime] *
                    (mdp.R[s][a] + mdp.gamma * V[s_prime]);
            }
            V_new[s] += pi[s][a] * action_val;
        }
    }
    return V_new;
}

vector<double> bellman_optimality(
    const MDP& mdp,
    const vector<double>& V
) {
    int nS = mdp.n_states, nA = mdp.n_actions;
    vector<double> V_new(nS, 0.0);
    for (int s = 0; s < nS; s++) {
        double max_val = -1e18;
        for (int a = 0; a < nA; a++) {
            double action_val = 0.0;
            for (int s_prime = 0; s_prime < nS; s_prime++) {
                action_val += mdp.P[s][a][s_prime] *
                    (mdp.R[s][a] + mdp.gamma * V[s_prime]);
            }
            max_val = max(max_val, action_val);
        }
        V_new[s] = max_val;
    }
    return V_new;
}`,
      python: `def bellman_expectation(mdp, pi, V):
    """贝尔曼期望方程：计算策略 pi 下的 V(s)"""
    V_new = np.zeros(mdp.n_states)
    for s in range(mdp.n_states):
        for a in range(mdp.n_actions):
            action_val = 0.0
            for s_prime in range(mdp.n_states):
                action_val += mdp.P[s, a, s_prime] * \\
                    (mdp.R[s, a] + mdp.gamma * V[s_prime])
            V_new[s] += pi[s, a] * action_val
    return V_new

def bellman_optimality(mdp, V):
    """贝尔曼最优方程：计算 V*(s)"""
    V_new = np.zeros(mdp.n_states)
    for s in range(mdp.n_states):
        max_val = -np.inf
        for a in range(mdp.n_actions):
            action_val = 0.0
            for s_prime in range(mdp.n_states):
                action_val += mdp.P[s, a, s_prime] * \\
                    (mdp.R[s, a] + mdp.gamma * V[s_prime])
            max_val = max(max_val, action_val)
        V_new[s] = max_val
    return V_new`
    },
    variablesSnapshot: {
      V_type: 'state value function',
      Q_type: 'action value function',
      equation: 'Bellman Expectation',
      policy: 'stochastic pi(a|s)'
    },
    pseudocode: `procedure BELLMAN_EXPECTATION(mdp, pi, V)
    for each state s do
        V_new[s] <- sum_a pi(a|s) * sum_{s'} P(s'|s,a) [R(s,a) + gamma * V[s']]
    end for
    return V_new

procedure BELLMAN_OPTIMALITY(mdp, V)
    for each state s do
        V_new[s] <- max_a sum_{s'} P(s'|s,a) [R(s,a) + gamma * V[s']]
    end for
    return V_new`,
    bigO: {
      time: '计算贝尔曼期望方程的一次迭代需要 O(|S| × |A| × |S|)，即对每个状态、每个动作、每个可能的下一状态求和。',
      space: '存储值函数 V 需要 O(|S|) 空间，存储 Q 函数需要 O(|S| × |A|) 空间。',
      note: '这是动态规划的基础，值迭代和策略迭代都基于贝尔曼方程。'
    },
    compare: [
      { method: '贝尔曼期望方程', data: '给定策略 π', strength: '评估固定策略的值函数', tradeoff: '需要已知策略' },
      { method: '贝尔曼最优方程', data: '无策略约束', strength: '直接求最优值函数', tradeoff: '需要 max 操作，非线性' },
      { method: 'TD 学习', data: '采样经验', strength: '无模型，无需 P 和 R', tradeoff: '有估计偏差，需要大量样本' }
    ],
    quiz: [
      {
        q: '贝尔曼最优方程中的 max 操作意味着什么？',
        options: [
          '在每个状态选择最优动作',
          '对所有动作取平均',
          '随机选择一个动作',
          '不选择任何动作'
        ],
        answer: 0,
        explanation: '最优方程中的 max_a 表示智能体可以选择最优动作，因此取所有可能动作中的最大值。'
      },
      {
        q: 'V(s) 和 Q(s,a) 的关系是什么？',
        options: [
          'V(s) = max_a Q(s,a)（最优时）',
          'V(s) = sum_a Q(s,a)',
          'V(s) = Q(s,a) 对所有 a',
          '两者没有关系'
        ],
        answer: 0,
        explanation: '对于最优值函数，V*(s) = max_a Q*(s,a)，因为最优策略会选择使 Q 最大的动作。'
      }
    ]
  },
  {
    id: 'rl-value-iteration',
    title: '值迭代',
    summary: '同步/异步更新、收敛性证明',
    theory: `## 值迭代 (Value Iteration)

值迭代直接使用贝尔曼最优方程迭代更新值函数，直到收敛。

### 同步值迭代

$$V_{k+1}(s) = \\max_a \\sum_{s', r} P(s', r \\mid s, a) [r + \\gamma V_k(s')]$$

每次迭代同时更新所有状态的值，使用旧值计算新值。

### 异步值迭代

按某种顺序逐个更新状态，可以使用最新计算的值：

$$V(s) \\leftarrow \\max_a \\sum_{s', r} P(s', r \\mid s, a) [r + \\gamma V(s')]$$

### 收敛性

值迭代收敛到最优值函数 $V^*$，误差按 $\\gamma$ 的几何级数衰减：

$$\\|V_{k+1} - V^*\\|_\\infty \\leq \\gamma \\|V_k - V^*\\|_\\infty$$

### 停止条件

当 $\\|V_{k+1} - V_k\\|_\\infty < \\epsilon$ 时停止，此时策略损失不超过 $\\frac{2\\epsilon\\gamma}{1-\\gamma}$。

### 从值函数提取策略

$$\\pi(s) = \\arg\\max_a \\sum_{s', r} P(s', r \\mid s, a) [r + \\gamma V(s')]$$
`,
    exercise: { type: 'playground', viz: 'qlearning' },
    code: {
      cpp: `pair<vector<double>, vector<int>> value_iteration(
    const MDP& mdp,
    double epsilon = 1e-6,
    int max_iter = 1000
) {
    int nS = mdp.n_states, nA = mdp.n_actions;
    vector<double> V(nS, 0.0);
    vector<int> policy(nS, 0);

    for (int iter = 0; iter < max_iter; iter++) {
        vector<double> V_new(nS, 0.0);
        double delta = 0.0;

        for (int s = 0; s < nS; s++) {
            double max_val = -1e18;
            for (int a = 0; a < nA; a++) {
                double val = 0.0;
                for (int s_prime = 0; s_prime < nS; s_prime++) {
                    val += mdp.P[s][a][s_prime] *
                        (mdp.R[s][a] + mdp.gamma * V[s_prime]);
                }
                max_val = max(max_val, val);
            }
            V_new[s] = max_val;
            delta = max(delta, abs(V_new[s] - V[s]));
        }

        V = V_new;
        if (delta < epsilon) break;
    }

    // 提取最优策略
    for (int s = 0; s < nS; s++) {
        double max_val = -1e18;
        for (int a = 0; a < nA; a++) {
            double val = 0.0;
            for (int s_prime = 0; s_prime < nS; s_prime++) {
                val += mdp.P[s][a][s_prime] *
                    (mdp.R[s][a] + mdp.gamma * V[s_prime]);
            }
            if (val > max_val) {
                max_val = val;
                policy[s] = a;
            }
        }
    }

    return {V, policy};
}`,
      python: `def value_iteration(mdp, epsilon=1e-6, max_iter=1000):
    V = np.zeros(mdp.n_states)

    for i in range(max_iter):
        V_new = np.zeros(mdp.n_states)
        delta = 0.0

        for s in range(mdp.n_states):
            max_val = -np.inf
            for a in range(mdp.n_actions):
                val = 0.0
                for s_prime in range(mdp.n_states):
                    val += mdp.P[s, a, s_prime] * \\
                        (mdp.R[s, a] + mdp.gamma * V[s_prime])
                max_val = max(max_val, val)
            V_new[s] = max_val
            delta = max(delta, abs(V_new[s] - V[s]))

        V = V_new
        if delta < epsilon:
            break

    # 提取最优策略
    policy = np.zeros(mdp.n_states, dtype=int)
    for s in range(mdp.n_states):
        max_val = -np.inf
        for a in range(mdp.n_actions):
            val = 0.0
            for s_prime in range(mdp.n_states):
                val += mdp.P[s, a, s_prime] * \\
                    (mdp.R[s, a] + mdp.gamma * V[s_prime])
            if val > max_val:
                max_val = val
                policy[s] = a

    return V, policy`
    },
    variablesSnapshot: {
      iteration: 'k',
      max_delta: '||V_{k+1} - V_k||_inf',
      epsilon: '1e-6',
      gamma: '0.95'
    },
    pseudocode: `procedure VALUE_ITERATION(mdp, epsilon)
    V <- 0 for all states
    repeat
        delta <- 0
        for each state s do
            v <- V[s]
            V[s] <- max_a sum_{s'} P(s'|s,a) [R(s,a) + gamma * V[s']]
            delta <- max(delta, |v - V[s]|)
        end for
    until delta < epsilon

    // 提取策略
    for each state s do
        pi[s] <- argmax_a sum_{s'} P(s'|s,a) [R(s,a) + gamma * V[s']]
    end for
    return V, pi`,
    bigO: {
      time: '每次迭代 O(|S| × |A| × |S|)，迭代次数取决于初始误差和 epsilon，通常为 O(log(1/ε) / log(1/γ)) 量级。总复杂度约 O(|S|² × |A| × log(1/ε))。',
      space: '存储值函数 V 需要 O(|S|)，存储策略需要 O(|S|)，MDP 模型需要 O(|S|² × |A|)。',
      note: '值迭代是动态规划方法，需要已知 MDP 模型（P 和 R）。'
    },
    compare: [
      { method: '值迭代', data: '直接优化 V*', strength: '实现简单，收敛稳定', tradeoff: '每次迭代需要遍历所有状态' },
      { method: '策略迭代', data: '交替评估和改进', strength: '通常收敛更快（迭代次数少）', tradeoff: '每次策略评估需要多次迭代' },
      { method: 'Q-learning', data: '无模型采样', strength: '不需要 P 和 R', tradeoff: '需要大量样本，收敛慢' }
    ],
    quiz: [
      {
        q: '值迭代什么时候停止？',
        options: [
          '当两次迭代间值函数的最大变化小于 epsilon',
          '当迭代次数达到 100 次',
          '当所有值函数都为 0',
          '当奖励为正'
        ],
        answer: 0,
        explanation: '值迭代的停止条件是 ||V_{k+1} - V_k||_∞ < ε，即值函数的变化足够小。'
      },
      {
        q: '同步值迭代和异步值迭代的区别是什么？',
        options: [
          '同步用旧值更新所有状态，异步可用最新值',
          '同步更快',
          '异步需要更多内存',
          '两者完全相同'
        ],
        answer: 0,
        explanation: '同步迭代使用 V_k 计算所有 V_{k+1}；异步迭代按顺序更新，可以在计算某个状态时使用刚更新的其他状态的值。'
      }
    ]
  },
  {
    id: 'rl-policy-iteration',
    title: '策略迭代',
    summary: '策略评估 + 策略改进，两阶段交替',
    theory: `## 策略迭代 (Policy Iteration)

策略迭代交替进行**策略评估**和**策略改进**，直到策略收敛。

### 策略评估 (Policy Evaluation)

给定策略 $\\pi$，计算其值函数 $V^\\pi$：

$$V^\\pi(s) = \\sum_a \\pi(a \\mid s) \\sum_{s', r} P(s', r \\mid s, a) [r + \\gamma V^\\pi(s')]$$

这是一个线性方程组，可以用迭代法求解：

$$V_{k+1}(s) = \\sum_a \\pi(a \\mid s) \\sum_{s', r} P(s', r \\mid s, a) [r + \\gamma V_k(s')]$$

### 策略改进 (Policy Improvement)

用当前值函数构造更好的策略：

$$\\pi'(s) = \\arg\\max_a \\sum_{s', r} P(s', r \\mid s, a) [r + \\gamma V^\\pi(s')]$$

### 策略改进定理

如果 $Q^\\pi(s, \\pi'(s)) \\geq V^\\pi(s)$ 对所有 $s$ 成立，则 $\\pi' \\geq \\pi$（更优或相等）。

### 收敛性

策略迭代在有限步内收敛到最优策略，因为每次改进都是单调的，且策略空间有限。

### 与值迭代的比较

| 方法 | 每次迭代 | 收敛速度 |
|------|---------|---------|
| 值迭代 | 更新所有状态的 V | 迭代次数多，每次简单 |
| 策略迭代 | 完整评估 + 改进 | 迭代次数少，每次复杂 |
`,
    exercise: { type: 'playground', viz: 'qlearning' },
    code: {
      cpp: `vector<double> policy_evaluation(
    const MDP& mdp,
    const vector<vector<double>>& pi,
    double epsilon = 1e-6,
    int max_iter = 1000
) {
    int nS = mdp.n_states;
    vector<double> V(nS, 0.0);

    for (int iter = 0; iter < max_iter; iter++) {
        vector<double> V_new(nS, 0.0);
        double delta = 0.0;

        for (int s = 0; s < nS; s++) {
            for (int a = 0; a < mdp.n_actions; a++) {
                double action_val = 0.0;
                for (int s_prime = 0; s_prime < nS; s_prime++) {
                    action_val += mdp.P[s][a][s_prime] *
                        (mdp.R[s][a] + mdp.gamma * V[s_prime]);
                }
                V_new[s] += pi[s][a] * action_val;
            }
            delta = max(delta, abs(V_new[s] - V[s]));
        }

        V = V_new;
        if (delta < epsilon) break;
    }

    return V;
}

pair<vector<vector<double>>, vector<double>> policy_iteration(
    const MDP& mdp,
    double epsilon = 1e-6
) {
    int nS = mdp.n_states, nA = mdp.n_actions;
    // 初始化均匀随机策略
    vector<vector<double>> pi(nS, vector<double>(nA, 1.0 / nA));
    vector<double> V(nS, 0.0);

    while (true) {
        // 策略评估
        V = policy_evaluation(mdp, pi, epsilon);

        // 策略改进
        vector<vector<double>> pi_new(nS, vector<double>(nA, 0.0));
        bool policy_stable = true;

        for (int s = 0; s < nS; s++) {
            int best_action = 0;
            double best_val = -1e18;
            for (int a = 0; a < nA; a++) {
                double val = 0.0;
                for (int s_prime = 0; s_prime < nS; s_prime++) {
                    val += mdp.P[s][a][s_prime] *
                        (mdp.R[s][a] + mdp.gamma * V[s_prime]);
                }
                if (val > best_val) {
                    best_val = val;
                    best_action = a;
                }
            }
            pi_new[s][best_action] = 1.0;
            if (pi[s][best_action] != 1.0) {
                policy_stable = false;
            }
        }

        if (policy_stable) break;
        pi = pi_new;
    }

    return {pi, V};
}`,
      python: `def policy_evaluation(mdp, pi, epsilon=1e-6, max_iter=1000):
    V = np.zeros(mdp.n_states)

    for i in range(max_iter):
        V_new = np.zeros(mdp.n_states)
        delta = 0.0

        for s in range(mdp.n_states):
            for a in range(mdp.n_actions):
                action_val = 0.0
                for s_prime in range(mdp.n_states):
                    action_val += mdp.P[s, a, s_prime] * \\
                        (mdp.R[s, a] + mdp.gamma * V[s_prime])
                V_new[s] += pi[s, a] * action_val
            delta = max(delta, abs(V_new[s] - V[s]))

        V = V_new
        if delta < epsilon:
            break

    return V

def policy_iteration(mdp, epsilon=1e-6):
    # 初始化均匀随机策略
    pi = np.ones((mdp.n_states, mdp.n_actions)) / mdp.n_actions
    V = np.zeros(mdp.n_states)

    while True:
        # 策略评估
        V = policy_evaluation(mdp, pi, epsilon)

        # 策略改进
        pi_new = np.zeros((mdp.n_states, mdp.n_actions))
        policy_stable = True

        for s in range(mdp.n_states):
            best_action = 0
            best_val = -np.inf
            for a in range(mdp.n_actions):
                val = 0.0
                for s_prime in range(mdp.n_states):
                    val += mdp.P[s, a, s_prime] * \\
                        (mdp.R[s, a] + mdp.gamma * V[s_prime])
                if val > best_val:
                    best_val = val
                    best_action = a
            pi_new[s, best_action] = 1.0
            if pi[s, best_action] != 1.0:
                policy_stable = False

        if policy_stable:
            break
        pi = pi_new

    return pi, V`
    },
    variablesSnapshot: {
      policy: 'stochastic pi(a|s)',
      evaluation_iter: 'converged',
      improvement: 'greedy',
      stable: 'False'
    },
    pseudocode: `procedure POLICY_ITERATION(mdp, epsilon)
    pi <- random policy
    repeat
        // 策略评估
        V <- POLICY_EVALUATION(pi, mdp, epsilon)

        // 策略改进
        policy_stable <- true
        for each state s do
            old_action <- pi[s]
            pi[s] <- argmax_a sum_{s'} P(s'|s,a) [R(s,a) + gamma * V[s']]
            if old_action != pi[s] then
                policy_stable <- false
            end if
        end for
    until policy_stable
    return pi, V

procedure POLICY_EVALUATION(pi, mdp, epsilon)
    V <- 0
    repeat
        delta <- 0
        for each state s do
            v <- V[s]
            V[s] <- sum_a pi(a|s) * sum_{s'} P(s'|s,a) [R + gamma*V[s']]
            delta <- max(delta, |v - V[s]|)
        end for
    until delta < epsilon
    return V`,
    bigO: {
      time: '每次策略评估需要 O(k × |S| × |A| × |S|)，其中 k 是评估迭代次数。策略改进需要 O(|S| × |A| × |S|)。总迭代次数通常很少（几次到几十次）。',
      space: '存储策略需要 O(|S| × |A|)，值函数 O(|S|)，MDP 模型 O(|S|² × |A|)。',
      note: '策略迭代的迭代次数通常比值迭代少，但每次迭代更复杂（需要完整评估策略）。'
    },
    compare: [
      { method: '策略迭代', data: '交替评估改进', strength: '迭代次数少，策略稳定后即停止', tradeoff: '每次评估成本高' },
      { method: '值迭代', data: '直接优化 V', strength: '每次迭代简单', tradeoff: '需要更多迭代次数' },
      { method: '广义策略迭代', data: '不精确评估', strength: '折中方案，实际常用', tradeoff: '需要调参评估精度' }
    ],
    quiz: [
      {
        q: '策略迭代什么时候停止？',
        options: [
          '当策略不再变化（策略稳定）',
          '当值函数变化小于 epsilon',
          '当迭代 10 次后',
          '当奖励为正'
        ],
        answer: 0,
        explanation: '策略迭代的停止条件是策略改进后策略不再变化（policy_stable = true），此时已达到最优策略。'
      },
      {
        q: '策略评估解决的是什么问题？',
        options: [
          '给定策略，计算该策略下的状态值函数',
          '找到最优策略',
          '计算即时奖励',
          '更新转移概率'
        ],
        answer: 0,
        explanation: '策略评估是给定一个固定策略 π，计算 V^π(s)，即该策略下每个状态的期望回报。'
      }
    ]
  },
  {
    id: 'rl-qlearning',
    title: 'Q-Learning',
    summary: 'Q 表、贝尔曼方程、ε-greedy 策略',
    theory: `## Q-Learning

Q-Learning 是最经典的**无模型**（model-free）、**离策略**（off-policy）时序差分（TD）算法。

### Q 值更新

$$Q(s, a) \\leftarrow Q(s, a) + \\alpha [r + \\gamma \\max_{a'} Q(s', a') - Q(s, a)]$$

其中：
- $\\alpha$: 学习率
- $\\gamma$: 折扣因子
- $r + \\gamma \\max_{a'} Q(s', a')$: TD 目标
- $r + \\gamma \\max_{a'} Q(s', a') - Q(s, a)$: TD 误差

### 关键特性

- **离策略 (Off-policy)**: 学习的是最优策略 $Q^*$，而行为策略可以是 $\\epsilon$-greedy
- **无模型 (Model-free)**: 不需要知道 P 和 R
- **引导 (Bootstrapping)**: 用估计值更新估计值

### ε-greedy 探索策略

以概率 $\\epsilon$ 随机选择动作（探索），以概率 $1-\\epsilon$ 选择当前最优动作（利用）：

$$a = \\begin{cases} \\arg\\max_a Q(s, a) & \\text{with prob } 1-\\epsilon \\\\ \\text{random action} & \\text{with prob } \\epsilon \\end{cases}$$

### 收敛性

在满足以下条件时，Q-Learning 以概率 1 收敛到 $Q^*$：
1. 学习率满足 Robbins-Monro 条件：$\\sum \\alpha_t = \\infty$ 且 $\\sum \\alpha_t^2 < \\infty$
2. 所有状态-动作对被无限次访问
`,
    exercise: { type: 'playground', viz: 'qlearning' },
    code: {
      cpp: `class QLearning {
public:
    int n_states, n_actions;
    vector<vector<double>> Q;
    double alpha, gamma, epsilon;

    QLearning(int nS, int nA, double alpha = 0.1,
              double gamma = 0.99, double epsilon = 0.1)
        : n_states(nS), n_actions(nA),
          alpha(alpha), gamma(gamma), epsilon(epsilon) {
        Q.resize(nS, vector<double>(nA, 0.0));
    }

    int choose_action(int s) {
        if ((double)rand() / RAND_MAX < epsilon) {
            return rand() % n_actions;  // 探索
        }
        return argmax(Q[s]);  // 利用
    }

    void update(int s, int a, double r, int s_prime, bool done) {
        double max_q_next = 0.0;
        if (!done) {
            max_q_next = *max_element(Q[s_prime].begin(), Q[s_prime].end());
        }
        double td_target = r + gamma * max_q_next;
        double td_error = td_target - Q[s][a];
        Q[s][a] += alpha * td_error;
    }

    void decay_epsilon(double min_epsilon = 0.01, double decay = 0.995) {
        epsilon = max(min_epsilon, epsilon * decay);
    }

private:
    int argmax(const vector<double>& v) {
        return max_element(v.begin(), v.end()) - v.begin();
    }
};`,
      python: `import numpy as np

class QLearning:
    def __init__(self, n_states, n_actions, alpha=0.1,
                 gamma=0.99, epsilon=0.1):
        self.n_states = n_states
        self.n_actions = n_actions
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.Q = np.zeros((n_states, n_actions))

    def choose_action(self, s):
        if np.random.random() < self.epsilon:
            return np.random.randint(self.n_actions)  # 探索
        return np.argmax(self.Q[s])  # 利用

    def update(self, s, a, r, s_prime, done):
        if done:
            max_q_next = 0.0
        else:
            max_q_next = np.max(self.Q[s_prime])
        td_target = r + self.gamma * max_q_next
        td_error = td_target - self.Q[s, a]
        self.Q[s, a] += self.alpha * td_error

    def decay_epsilon(self, min_epsilon=0.01, decay=0.995):
        self.epsilon = max(min_epsilon, self.epsilon * decay)`
    },
    variablesSnapshot: {
      alpha: '0.1',
      gamma: '0.99',
      epsilon: '0.1',
      Q_shape: '(|S|, |A|)',
      td_error: 'r + gamma * max Q(s\') - Q(s,a)'
    },
    pseudocode: `procedure Q_LEARNING(env, n_episodes)
    Initialize Q(s, a) arbitrarily for all s, a
    for episode <- 1 to n_episodes do
        s <- env.reset()
        repeat
            a <- epsilon_greedy(Q, s, epsilon)
            s', r, done <- env.step(a)
            Q(s, a) <- Q(s, a) + alpha * [r + gamma * max_a' Q(s', a') - Q(s, a)]
            s <- s'
        until done
        decay epsilon
    end for
    return Q`,
    bigO: {
      time: '每个时间步的更新是 O(1)（查表和更新）。训练总时间 O(T × |S| × |A|)，其中 T 是总时间步数，需要充分探索所有状态-动作对。',
      space: '存储 Q 表需要 O(|S| × |A|) 空间。对于大规模问题，需要用神经网络近似 Q 函数。',
      note: 'Q-Learning 是 off-policy 算法，因为它学习的是最优策略，而行为策略可以是任意探索策略。'
    },
    compare: [
      { method: 'Q-Learning', data: '离策略 TD', strength: '直接学习最优策略，样本效率高', tradeoff: 'Q 值过估计问题' },
      { method: 'SARSA', data: '同策略 TD', strength: '更保守，适合在线学习', tradeoff: '学习的是行为策略而非最优' },
      { method: 'DQN', data: '神经网络近似', strength: '可处理大规模状态空间', tradeoff: '训练不稳定，需要目标网络' }
    ],
    quiz: [
      {
        q: 'Q-Learning 中的 TD 目标是什么？',
        options: [
          'r + γ * max_{a\'} Q(s\', a\')',
          'r + γ * Q(s\', a\')',
          'r',
          'Q(s, a)'
        ],
        answer: 0,
        explanation: 'Q-Learning 是离策略算法，TD 目标使用 max 操作，假设下一状态选择最优动作。'
      },
      {
        q: '为什么 Q-Learning 被称为离策略算法？',
        options: [
          '它学习最优策略，但行为策略可以是任意探索策略',
          '它不需要策略',
          '它学习行为策略',
          '它不能离线训练'
        ],
        answer: 0,
        explanation: '离策略（off-policy）意味着学习的策略（目标策略）与产生经验的策略（行为策略）可以不同。'
      }
    ]
  },
  {
    id: 'rl-sarsa',
    title: 'SARSA',
    summary: '同策略 TD 学习，与 Q-Learning 对比',
    theory: `## SARSA

SARSA 是**同策略**（on-policy）的时序差分算法，名字来源于其使用的五元组 $(s, a, r, s', a')$。

### Q 值更新

$$Q(s, a) \\leftarrow Q(s, a) + \\alpha [r + \\gamma Q(s', a') - Q(s, a)]$$

与 Q-Learning 的关键区别：SARSA 使用**实际选择的下一个动作** $a'$，而不是 max 操作。

### 与 Q-Learning 的对比

| 特性 | Q-Learning | SARSA |
|------|-----------|-------|
| 策略类型 | 离策略 | 同策略 |
| TD 目标 | $r + \\gamma \\max_{a'} Q(s', a')$ | $r + \\gamma Q(s', a')$ |
| 学习目标 | 最优策略 $Q^*$ | 行为策略 $Q^\\pi$ |
| 收敛性 | 收敛到 $Q^*$ | 收敛到 $Q^\\pi$ |
| 风险偏好 | 激进（过估计风险） | 保守（考虑探索代价） |

### 同策略 vs 离策略

- **同策略**: 学习的策略就是行为策略。SARSA 评估和改进的是当前正在执行的策略。
- **离策略**: 学习的策略与行为策略不同。Q-Learning 用 $\\epsilon$-greedy 采样，但学习的是贪婪策略。

### Expected SARSA

Expected SARSA 是 SARSA 的改进，使用期望替代采样：

$$Q(s, a) \\leftarrow Q(s, a) + \\alpha [r + \\gamma \\sum_{a'} \\pi(a' \\mid s') Q(s', a') - Q(s, a)]$$

比 SARSA 更稳定，减少了采样方差。
`,
    exercise: { type: 'playground', viz: 'qlearning' },
    code: {
      cpp: `class SARSA {
public:
    int n_states, n_actions;
    vector<vector<double>> Q;
    double alpha, gamma, epsilon;

    SARSA(int nS, int nA, double alpha = 0.1,
          double gamma = 0.99, double epsilon = 0.1)
        : n_states(nS), n_actions(nA),
          alpha(alpha), gamma(gamma), epsilon(epsilon) {
        Q.resize(nS, vector<double>(nA, 0.0));
    }

    int choose_action(int s) {
        if ((double)rand() / RAND_MAX < epsilon) {
            return rand() % n_actions;
        }
        return argmax(Q[s]);
    }

    void update(int s, int a, double r, int s_prime, int a_prime, bool done) {
        double td_target = r;
        if (!done) {
            td_target += gamma * Q[s_prime][a_prime];
        }
        double td_error = td_target - Q[s][a];
        Q[s][a] += alpha * td_error;
    }

    void decay_epsilon(double min_epsilon = 0.01, double decay = 0.995) {
        epsilon = max(min_epsilon, epsilon * decay);
    }

private:
    int argmax(const vector<double>& v) {
        return max_element(v.begin(), v.end()) - v.begin();
    }
};

// Expected SARSA
class ExpectedSARSA : public SARSA {
public:
    ExpectedSARSA(int nS, int nA, double alpha = 0.1,
                  double gamma = 0.99, double epsilon = 0.1)
        : SARSA(nS, nA, alpha, gamma, epsilon) {}

    void update_expected(int s, int a, double r, int s_prime, bool done) {
        double expected_q = 0.0;
        if (!done) {
            // 计算期望 Q 值
            int best_a = argmax(Q[s_prime]);
            for (int a_prime = 0; a_prime < n_actions; a_prime++) {
                double prob = (a_prime == best_a) ?
                    (1.0 - epsilon + epsilon / n_actions) :
                    (epsilon / n_actions);
                expected_q += prob * Q[s_prime][a_prime];
            }
        }
        double td_target = r + gamma * expected_q;
        double td_error = td_target - Q[s][a];
        Q[s][a] += alpha * td_error;
    }
};`,
      python: `import numpy as np

class SARSA:
    def __init__(self, n_states, n_actions, alpha=0.1,
                 gamma=0.99, epsilon=0.1):
        self.n_states = n_states
        self.n_actions = n_actions
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.Q = np.zeros((n_states, n_actions))

    def choose_action(self, s):
        if np.random.random() < self.epsilon:
            return np.random.randint(self.n_actions)
        return np.argmax(self.Q[s])

    def update(self, s, a, r, s_prime, a_prime, done):
        td_target = r
        if not done:
            td_target += self.gamma * self.Q[s_prime, a_prime]
        td_error = td_target - self.Q[s, a]
        self.Q[s, a] += self.alpha * td_error

    def decay_epsilon(self, min_epsilon=0.01, decay=0.995):
        self.epsilon = max(min_epsilon, self.epsilon * decay)

class ExpectedSARSA(SARSA):
    def update_expected(self, s, a, r, s_prime, done):
        expected_q = 0.0
        if not done:
            best_a = np.argmax(self.Q[s_prime])
            for a_prime in range(self.n_actions):
                prob = (1.0 - self.epsilon + self.epsilon / self.n_actions
                        if a_prime == best_a
                        else self.epsilon / self.n_actions)
                expected_q += prob * self.Q[s_prime, a_prime]
        td_target = r + self.gamma * expected_q
        td_error = td_target - self.Q[s, a]
        self.Q[s, a] += self.alpha * td_error`
    },
    variablesSnapshot: {
      tuple: '(s, a, r, s\', a\')',
      td_target: 'r + gamma * Q(s\', a\')',
      policy_type: 'on-policy',
      epsilon: '0.1'
    },
    pseudocode: `procedure SARSA(env, n_episodes)
    Initialize Q(s, a) arbitrarily
    for episode <- 1 to n_episodes do
        s <- env.reset()
        a <- epsilon_greedy(Q, s, epsilon)
        repeat
            s', r, done <- env.step(a)
            a' <- epsilon_greedy(Q, s', epsilon)
            Q(s, a) <- Q(s, a) + alpha * [r + gamma * Q(s', a') - Q(s, a)]
            s <- s'
            a <- a'
        until done
    end for
    return Q

procedure EXPECTED_SARSA_UPDATE(Q, s, a, r, s', epsilon)
    expected_Q <- sum_{a'} pi(a'|s') * Q(s', a')
    Q(s, a) <- Q(s, a) + alpha * [r + gamma * expected_Q - Q(s, a)]`,
    bigO: {
      time: '每个时间步 O(1)（查表更新）。Expected SARSA 需要 O(|A|) 计算期望。总训练时间与 Q-Learning 相当。',
      space: '存储 Q 表需要 O(|S| × |A|)，与 Q-Learning 相同。',
      note: 'SARSA 是 on-policy 算法，学习的是行为策略（包括探索部分），因此更保守但更安全。'
    },
    compare: [
      { method: 'SARSA', data: '同策略 TD(0)', strength: '更保守，考虑探索风险', tradeoff: '不直接学习最优策略' },
      { method: 'Q-Learning', data: '离策略 TD(0)', strength: '直接学习最优策略', tradeoff: '可能过估计 Q 值' },
      { method: 'Expected SARSA', data: '期望 TD(0)', strength: '方差更低，更稳定', tradeoff: '每步需要计算期望，稍慢' }
    ],
    quiz: [
      {
        q: 'SARSA 名字中的五个字母分别代表什么？',
        options: [
          '状态 s、动作 a、奖励 r、下一状态 s\'、下一动作 a\'',
          '五个随机变量',
          '五种算法',
          '五个超参数'
        ],
        answer: 0,
        explanation: 'SARSA 代表 State-Action-Reward-State-Action，即更新使用的五元组 (s, a, r, s\', a\')。'
      },
      {
        q: '在悬崖行走问题中，为什么 SARSA 通常表现比 Q-Learning 更安全？',
        options: [
          '因为 SARSA 考虑了探索的风险，会选择远离悬崖的路径',
          '因为 SARSA 奖励更多',
          '因为 SARSA 不需要探索',
          '因为 SARSA 学习率更大'
        ],
        answer: 0,
        explanation: 'SARSA 是同策略算法，学习的是包含 ε-探索的策略，因此会避免那些虽然收益高但探索时容易掉悬崖的动作。'
      }
    ]
  },
  {
    id: 'rl-experience-replay',
    title: '经验回放',
    summary: '回放缓冲区、随机采样、打破样本相关性',
    theory: `## 经验回放 (Experience Replay)

经验回放是深度强化学习的关键技术，通过存储和重用经验打破样本之间的相关性。

### 基本思想

强化学习的样本是连续产生的，相邻样本高度相关。直接用连续样本训练神经网络会导致：
- 梯度估计偏差大
- 训练不稳定
- 样本效率低

经验回放通过以下方式解决这些问题：
1. 将经验 $(s, a, r, s', done)$ 存储在回放缓冲区中
2. 训练时从缓冲区**随机采样** mini-batch
3. 多次重用经验，提高样本效率

### 回放缓冲区 (Replay Buffer)

通常使用循环缓冲区（队列）实现，固定容量，满了之后覆盖最旧的经验：

$$D = \\{e_1, e_2, \\ldots, e_N\\}$$

其中 $N$ 是缓冲区大小，通常 $10^4 \\sim 10^6$。

### 采样策略

- **均匀采样**: 每个经验被采样的概率相同
- **优先经验回放 (PER)**: 根据 TD 误差大小采样，误差大的经验更可能被采样

### 优势

1. **打破相关性**: 随机采样使样本独立同分布
2. **提高样本效率**: 每个经验可被多次使用
3. **减少遗忘**: 旧经验可以防止灾难性遗忘
4. **稳定训练**: 减少梯度方差

### 与 off-policy 的关系

经验回放天然适合 off-policy 算法（如 Q-Learning、DQN），因为可以重用任何行为策略产生的经验。
`,
    exercise: { type: 'playground', viz: 'qlearning' },
    code: {
      cpp: `#include <deque>
#include <random>

struct Experience {
    int s, a, s_prime;
    double r;
    bool done;
};

class ReplayBuffer {
public:
    ReplayBuffer(int capacity = 10000) : capacity(capacity) {}

    void push(const Experience& exp) {
        if (buffer.size() >= capacity) {
            buffer.pop_front();
        }
        buffer.push_back(exp);
    }

    vector<Experience> sample(int batch_size) {
        vector<Experience> batch;
        batch.reserve(batch_size);
        std::random_device rd;
        std::mt19937 gen(rd());
        std::uniform_int_distribution<> dist(0, buffer.size() - 1);

        for (int i = 0; i < batch_size; i++) {
            batch.push_back(buffer[dist(gen)]);
        }
        return batch;
    }

    size_t size() const { return buffer.size(); }

private:
    std::deque<Experience> buffer;
    int capacity;
};

// 优先经验回放 (PER)
class PrioritizedReplayBuffer : public ReplayBuffer {
public:
    PrioritizedReplayBuffer(int capacity = 10000,
                            double alpha = 0.6,
                            double beta = 0.4)
        : ReplayBuffer(capacity), alpha(alpha), beta(beta) {
        priorities.resize(capacity, 1.0);
    }

    void push(const Experience& exp) {
        double max_priority = *max_element(priorities.begin(), priorities.end());
        priorities[buffer.size()] = max_priority;
        ReplayBuffer::push(exp);
    }

    vector<Experience> sample(int batch_size) {
        vector<double> probs(buffer.size());
        for (size_t i = 0; i < buffer.size(); i++) {
            probs[i] = pow(priorities[i], alpha);
        }
        double sum = accumulate(probs.begin(), probs.end(), 0.0);
        for (auto& p : probs) p /= sum;

        std::random_device rd;
        std::mt19937 gen(rd());
        std::discrete_distribution<> dist(probs.begin(), probs.end());

        vector<Experience> batch;
        batch.reserve(batch_size);
        for (int i = 0; i < batch_size; i++) {
            batch.push_back(buffer[dist(gen)]);
        }
        return batch;
    }

    void update_priorities(const vector<int>& indices,
                           const vector<double>& td_errors) {
        for (size_t i = 0; i < indices.size(); i++) {
            priorities[indices[i]] = abs(td_errors[i]) + 1e-6;
        }
    }

private:
    vector<double> priorities;
    double alpha, beta;
};`,
      python: `import numpy as np
from collections import deque
import random

class ReplayBuffer:
    def __init__(self, capacity=10000):
        self.buffer = deque(maxlen=capacity)

    def push(self, s, a, r, s_prime, done):
        self.buffer.append((s, a, r, s_prime, done))

    def sample(self, batch_size):
        batch = random.sample(self.buffer, batch_size)
        s, a, r, s_prime, done = zip(*batch)
        return (np.array(s), np.array(a), np.array(r),
                np.array(s_prime), np.array(done))

    def __len__(self):
        return len(self.buffer)

class PrioritizedReplayBuffer:
    def __init__(self, capacity=10000, alpha=0.6, beta=0.4):
        self.buffer = deque(maxlen=capacity)
        self.priorities = deque(maxlen=capacity)
        self.alpha = alpha
        self.beta = beta
        self.max_priority = 1.0

    def push(self, s, a, r, s_prime, done):
        self.buffer.append((s, a, r, s_prime, done))
        self.priorities.append(self.max_priority)

    def sample(self, batch_size):
        priorities = np.array(self.priorities)
        probs = priorities ** self.alpha
        probs /= probs.sum()

        indices = np.random.choice(len(self.buffer), batch_size, p=probs)
        batch = [self.buffer[i] for i in indices]
        s, a, r, s_prime, done = zip(*batch)

        # 计算重要性采样权重
        weights = (len(self.buffer) * probs[indices]) ** (-self.beta)
        weights /= weights.max()

        return (np.array(s), np.array(a), np.array(r),
                np.array(s_prime), np.array(done), indices, weights)

    def update_priorities(self, indices, td_errors):
        for idx, error in zip(indices, td_errors):
            self.priorities[idx] = abs(error) + 1e-6
            self.max_priority = max(self.max_priority, self.priorities[idx])

    def __len__(self):
        return len(self.buffer)`
    },
    variablesSnapshot: {
      capacity: '10000',
      batch_size: '32',
      current_size: '4521',
      sampling: 'uniform'
    },
    pseudocode: `procedure EXPERIENCE_REPLAY(env, agent, buffer, n_episodes)
    for episode <- 1 to n_episodes do
        s <- env.reset()
        repeat
            a <- agent.act(s)
            s', r, done <- env.step(a)
            buffer.push(s, a, r, s', done)
            s <- s'

            if buffer.size() >= batch_size then
                batch <- buffer.sample(batch_size)
                agent.update(batch)
            end if
        until done
    end for

procedure PER_SAMPLE(buffer, batch_size, alpha)
    priorities <- [p^alpha for p in buffer.priorities]
    probs <- priorities / sum(priorities)
    indices <- sample_from(probs, batch_size)
    return indices, [buffer[i] for i in indices]`,
    bigO: {
      time: 'push 操作 O(1)，sample 操作 O(N) 计算概率（N 为缓冲区大小）或 O(1) 均匀采样。训练时 mini-batch 更新 O(B)。',
      space: '存储缓冲区需要 O(N × D)，其中 D 是单个经验的维度（状态 + 动作 + 奖励 + 下一状态 + 标志）。',
      note: '经验回放是 DQN 等深度强化学习算法的核心组件，使神经网络训练更稳定。'
    },
    compare: [
      { method: '均匀回放', data: '随机采样', strength: '实现简单，无偏', tradeoff: '重要经验可能被忽略' },
      { method: '优先回放 (PER)', data: '按 TD 误差采样', strength: '关注难学的经验，收敛更快', tradeoff: '有偏，需要重要性采样修正' },
      { method: '在线学习', data: '不用缓冲区', strength: '无内存开销', tradeoff: '样本相关性高，训练不稳定' }
    ],
    quiz: [
      {
        q: '经验回放的主要目的是什么？',
        options: [
          '打破样本之间的相关性，提高样本效率',
          '增加内存使用',
          '减少训练时间',
          '提高奖励'
        ],
        answer: 0,
        explanation: '连续产生的经验高度相关，直接训练神经网络会导致不稳定。经验回放通过随机采样使样本更独立，同时允许重复使用经验。'
      },
      {
        q: '优先经验回放中，什么样的经验更可能被采样？',
        options: [
          'TD 误差大的经验（"意外"的经验）',
          '奖励高的经验',
          '最近的经验',
          '随机经验'
        ],
        answer: 0,
        explanation: 'PER 根据 TD 误差的大小分配采样概率，误差大意味着当前 Q 函数预测不准，需要更多学习。'
      }
    ]
  },
  {
    id: 'rl-dqn',
    title: '深度 Q 网络 (DQN)',
    summary: '神经网络近似 Q 函数、目标网络、Double DQN',
    theory: `## 深度 Q 网络 (DQN)

DQN 将 Q-Learning 与深度神经网络结合，解决大规模状态空间的问题。

### 核心创新

1. **经验回放**: 打破样本相关性
2. **目标网络**: 稳定训练目标

### Q 网络

用神经网络 $Q(s, a; \\theta)$ 近似 Q 函数，参数为 $\\theta$。

### 损失函数

$$L(\\theta) = \\mathbb{E}_{(s, a, r, s') \\sim D} [(y - Q(s, a; \\theta))^2]$$

其中目标 $y$ 使用目标网络计算：

$$y = r + \\gamma \\max_{a'} Q(s', a'; \\theta^-)$$

### 目标网络

目标网络 $\\theta^-$ 是主网络的定期副本，每 $C$ 步复制一次：

$$\\theta^- \\leftarrow \\theta$$

目标网络使 TD 目标在一段时间内保持固定，大幅减少训练不稳定性。

### Double DQN

标准 DQN 存在 Q 值过估计问题。Double DQN 通过解耦动作选择和目标计算来缓解：

$$y = r + \\gamma Q(s', \\arg\\max_{a'} Q(s', a'; \\theta); \\theta^-)$$

- 用主网络 $\\theta$ 选择最优动作
- 用目标网络 $\\theta^-$ 评估该动作的 Q 值

### Dueling DQN

将 Q 网络分解为状态值函数 $V(s)$ 和优势函数 $A(s, a)$：

$$Q(s, a) = V(s) + A(s, a) - \\frac{1}{|A|} \\sum_{a'} A(s, a')$$

可以更高效地学习状态值。
`,
    exercise: { type: 'playground', viz: 'qlearning' },
    code: {
      cpp: `#include <torch/torch.h>

struct DQN : torch::nn::Module {
    torch::nn::Linear fc1, fc2, fc3;

    DQN(int state_dim, int action_dim)
        : fc1(register_module("fc1", torch::nn::Linear(state_dim, 128))),
          fc2(register_module("fc2", torch::nn::Linear(128, 128))),
          fc3(register_module("fc3", torch::nn::Linear(128, action_dim))) {}

    torch::Tensor forward(torch::Tensor x) {
        x = torch::relu(fc1->forward(x));
        x = torch::relu(fc2->forward(x));
        return fc3->forward(x);
    }
};

class DQNAgent {
public:
    DQNAgent(int state_dim, int action_dim,
             double lr = 1e-3, double gamma = 0.99,
             double epsilon = 1.0, double epsilon_min = 0.01,
             double epsilon_decay = 0.995, int target_update = 100)
        : gamma(gamma), epsilon(epsilon), epsilon_min(epsilon_min),
          epsilon_decay(epsilon_decay), target_update(target_update),
          action_dim(action_dim), steps(0) {

        policy_net = std::make_shared<DQN>(state_dim, action_dim);
        target_net = std::make_shared<DQN>(state_dim, action_dim);
        target_net->load_state_dict(policy_net->state_dict());

        optimizer = std::make_shared<torch::optim::Adam>(
            policy_net->parameters(), torch::optim::AdamOptions(lr));

        buffer = std::make_shared<ReplayBuffer>();
    }

    int act(torch::Tensor state) {
        if ((double)rand() / RAND_MAX < epsilon) {
            return rand() % action_dim;
        }
        torch::NoGradGuard no_grad;
        auto q_values = policy_net->forward(state);
        return q_values.argmax(1).item<int>();
    }

    void update(int batch_size = 32) {
        if (buffer->size() < batch_size) return;

        auto batch = buffer->sample(batch_size);
        auto states = torch::tensor(/* ... */);
        auto actions = torch::tensor(/* ... */);
        auto rewards = torch::tensor(/* ... */);
        auto next_states = torch::tensor(/* ... */);
        auto dones = torch::tensor(/* ... */);

        auto current_q = policy_net->forward(states).gather(1, actions.unsqueeze(1));

        // Double DQN: 用主网络选动作，目标网络评估
        auto next_actions = policy_net->forward(next_states).argmax(1, true);
        auto max_next_q = target_net->forward(next_states).gather(1, next_actions).squeeze(1);

        auto target_q = rewards + gamma * max_next_q * (1 - dones);

        auto loss = torch::mse_loss(current_q.squeeze(1), target_q.detach());

        optimizer->zero_grad();
        loss.backward();
        optimizer->step();

        steps++;
        if (steps % target_update == 0) {
            target_net->load_state_dict(policy_net->state_dict());
        }

        epsilon = max(epsilon_min, epsilon * epsilon_decay);
    }

private:
    std::shared_ptr<DQN> policy_net, target_net;
    std::shared_ptr<torch::optim::Adam> optimizer;
    std::shared_ptr<ReplayBuffer> buffer;
    double gamma, epsilon, epsilon_min, epsilon_decay;
    int target_update, action_dim, steps;
};`,
      python: `import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from collections import deque
import random

class DQN(nn.Module):
    def __init__(self, state_dim, action_dim):
        super().__init__()
        self.fc1 = nn.Linear(state_dim, 128)
        self.fc2 = nn.Linear(128, 128)
        self.fc3 = nn.Linear(128, action_dim)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

class DQNAgent:
    def __init__(self, state_dim, action_dim,
                 lr=1e-3, gamma=0.99,
                 epsilon=1.0, epsilon_min=0.01,
                 epsilon_decay=0.995, target_update=100):
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_min = epsilon_min
        self.epsilon_decay = epsilon_decay
        self.target_update = target_update
        self.action_dim = action_dim
        self.steps = 0

        self.policy_net = DQN(state_dim, action_dim)
        self.target_net = DQN(state_dim, action_dim)
        self.target_net.load_state_dict(self.policy_net.state_dict())

        self.optimizer = optim.Adam(self.policy_net.parameters(), lr=lr)
        self.buffer = ReplayBuffer()

    def act(self, state):
        if random.random() < self.epsilon:
            return random.randrange(self.action_dim)
        with torch.no_grad():
            state = torch.FloatTensor(state).unsqueeze(0)
            q_values = self.policy_net(state)
            return q_values.argmax().item()

    def update(self, batch_size=32):
        if len(self.buffer) < batch_size:
            return

        states, actions, rewards, next_states, dones = self.buffer.sample(batch_size)
        states = torch.FloatTensor(states)
        actions = torch.LongTensor(actions)
        rewards = torch.FloatTensor(rewards)
        next_states = torch.FloatTensor(next_states)
        dones = torch.FloatTensor(dones)

        current_q = self.policy_net(states).gather(1, actions.unsqueeze(1))

        # Double DQN
        next_actions = self.policy_net(next_states).argmax(1, keepdim=True)
        max_next_q = self.target_net(next_states).gather(1, next_actions).squeeze(1)

        target_q = rewards + self.gamma * max_next_q * (1 - dones)

        loss = nn.MSELoss()(current_q.squeeze(1), target_q.detach())

        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        self.steps += 1
        if self.steps % self.target_update == 0:
            self.target_net.load_state_dict(self.policy_net.state_dict())

        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)`
    },
    variablesSnapshot: {
      target_update: '100 steps',
      epsilon: '1.0 -> 0.01',
      buffer_size: '10000',
      batch_size: '32',
      network: '3-layer MLP (128 hidden)'
    },
    pseudocode: `procedure DQN(env, n_episodes)
    Initialize policy_net Q with random weights theta
    Initialize target_net Q^- with theta^- = theta
    Initialize replay buffer D

    for episode <- 1 to n_episodes do
        s <- env.reset()
        repeat
            a <- epsilon_greedy(Q(s; theta))
            s', r, done <- env.step(a)
            D.store(s, a, r, s', done)
            s <- s'

            // 训练
            if |D| >= batch_size then
                batch <- D.sample(batch_size)
                y <- r + gamma * Q^-(s', argmax_a' Q(s', a'; theta); theta^-)  // Double DQN
                loss <- (y - Q(s, a; theta))^2
                theta <- theta - alpha * grad(loss)
            end if

            // 定期更新目标网络
            if steps % target_update == 0 then
                theta^- <- theta
            end if
        until done
    end for`,
    bigO: {
      time: '每个时间步：动作选择 O(1)（前向传播），经验存储 O(1)。训练更新：前向传播 O(B × |S| × H)，反向传播 O(B × |S| × H)，B 是 batch size，H 是网络规模。',
      space: '存储两个网络 O(H)，回放缓冲区 O(N × D)。总体 O(N × D + H)。',
      note: 'DQN 成功将强化学习扩展到高维状态空间（如 Atari 游戏的像素输入）。'
    },
    compare: [
      { method: 'DQN', data: '标准目标', strength: '简单有效', tradeoff: 'Q 值过估计' },
      { method: 'Double DQN', data: '解耦选择和评估', strength: '减少过估计', tradeoff: '实现稍复杂' },
      { method: 'Dueling DQN', data: '分离 V 和 A', strength: '更高效学习状态值', tradeoff: '需要修改网络结构' }
    ],
    quiz: [
      {
        q: '为什么 DQN 需要目标网络？',
        options: [
          '使训练目标在一段时间内保持固定，减少不稳定性',
          '增加模型容量',
          '减少计算量',
          '不需要目标网络'
        ],
        answer: 0,
        explanation: '如果只用一个网络，每次更新都会改变目标值，导致训练不稳定。目标网络提供固定的学习目标，定期同步。'
      },
      {
        q: 'Double DQN 如何解决过估计问题？',
        options: [
          '用主网络选择动作，目标网络评估该动作的 Q 值',
          '使用更大的网络',
          '减少奖励',
          '增加探索率'
        ],
        answer: 0,
        explanation: '标准 DQN 用同一个网络既选动作又评估，容易选到过估计的动作。Double DQN 解耦了这两个步骤，减少过估计偏差。'
      }
    ]
  },
  {
    id: 'rl-policy-gradient',
    title: '策略梯度',
    summary: 'REINFORCE 算法、基线、方差缩减',
    theory: `## 策略梯度 (Policy Gradient)

策略梯度方法直接参数化策略 $\\pi_\\theta(a \\mid s)$，通过梯度上升最大化期望回报。

### 策略目标

$$J(\\theta) = \\mathbb{E}_{\\tau \\sim \\pi_\\theta}[R(\\tau)] = \\sum_\\tau P(\\tau \\mid \\theta) R(\\tau)$$

其中 $\\tau = (s_0, a_0, r_1, s_1, \\ldots)$ 是轨迹，$R(\\tau) = \\sum_t r_t$ 是轨迹回报。

### 策略梯度定理

$$\\nabla_\\theta J(\\theta) = \\mathbb{E}_{\\tau \\sim \\pi_\\theta} \\left[ \\sum_t \\nabla_\\theta \\log \\pi_\\theta(a_t \\mid s_t) \\cdot G_t \\right]$$

其中 $G_t$ 是从时刻 $t$ 开始的回报。

### REINFORCE 算法

使用蒙特卡洛采样估计梯度：

$$\\nabla_\\theta J(\\theta) \\approx \\frac{1}{N} \\sum_{i=1}^N \\sum_t \\nabla_\\theta \\log \\pi_\\theta(a_t^i \\mid s_t^i) \\cdot G_t^i$$

### 基线 (Baseline)

为了减少方差，引入基线 $b(s)$：

$$\\nabla_\\theta J(\\theta) = \\mathbb{E} \\left[ \\sum_t \\nabla_\\theta \\log \\pi_\\theta(a_t \\mid s_t) \\cdot (G_t - b(s_t)) \\right]$$

基线不改变梯度的期望，但可以大幅降低方差。常用基线：
- 常数基线：$b = \\bar{G}$（平均回报）
- 状态值函数：$b(s) = V^\\pi(s)$

### 优势函数

$$A^\\pi(s, a) = Q^\\pi(s, a) - V^\\pi(s)$$

优势函数衡量动作 $a$ 相对于平均水平的好坏，是更好的策略梯度权重。

### 与值函数方法的对比

| 特性 | 值函数方法 (Q-Learning) | 策略梯度方法 |
|------|------------------------|-------------|
| 优化对象 | Q 值 | 策略参数 |
| 策略 | 隐式（从 Q 导出） | 显式参数化 |
| 动作空间 | 离散 | 离散或连续 |
| 收敛性 | 可能震荡 | 更平滑收敛 |
| 样本效率 | 高（off-policy） | 低（on-policy） |
`,
    exercise: { type: 'playground', viz: 'policyGradient' },
    code: {
      cpp: `#include <torch/torch.h>

struct PolicyNetwork : torch::nn::Module {
    torch::nn::Linear fc1, fc2, fc3;

    PolicyNetwork(int state_dim, int action_dim)
        : fc1(register_module("fc1", torch::nn::Linear(state_dim, 128))),
          fc2(register_module("fc2", torch::nn::Linear(128, 128))),
          fc3(register_module("fc3", torch::nn::Linear(128, action_dim))) {}

    torch::Tensor forward(torch::Tensor x) {
        x = torch::relu(fc1->forward(x));
        x = torch::relu(fc2->forward(x));
        return torch::softmax(fc3->forward(x), /*dim=*/1);
    }
};

class REINFORCE {
public:
    REINFORCE(int state_dim, int action_dim, double lr = 1e-3,
              double gamma = 0.99, bool use_baseline = true)
        : gamma(gamma), use_baseline(use_baseline), action_dim(action_dim) {
        policy = std::make_shared<PolicyNetwork>(state_dim, action_dim);
        optimizer = std::make_shared<torch::optim::Adam>(
            policy->parameters(), torch::optim::AdamOptions(lr));

        if (use_baseline) {
            value_net = std::make_shared<ValueNetwork>(state_dim);
            value_optimizer = std::make_shared<torch::optim::Adam>(
                value_net->parameters(), torch::optim::AdamOptions(lr));
        }
    }

    int act(torch::Tensor state) {
        torch::NoGradGuard no_grad;
        auto probs = policy->forward(state);
        auto dist = torch::multinomial(probs, 1);
        return dist.item<int>();
    }

    void update(const vector<torch::Tensor>& states,
                const vector<int>& actions,
                const vector<double>& rewards) {
        // 计算回报 G_t
        vector<double> returns(rewards.size());
        double G = 0.0;
        for (int t = rewards.size() - 1; t >= 0; t--) {
            G = rewards[t] + gamma * G;
            returns[t] = G;
        }

        auto returns_tensor = torch::tensor(returns);

        // 归一化回报（可选，减少方差）
        returns_tensor = (returns_tensor - returns_tensor.mean()) /
                         (returns_tensor.std() + 1e-8);

        // 计算策略损失
        auto policy_loss = torch::tensor(0.0);
        for (int t = 0; t < states.size(); t++) {
            auto probs = policy->forward(states[t]);
            auto log_prob = torch::log(probs[0][actions[t]]);
            double baseline = 0.0;
            if (use_baseline) {
                baseline = value_net->forward(states[t]).item<double>();
            }
            auto advantage = returns_tensor[t].item<double>() - baseline;
            policy_loss = policy_loss - log_prob * advantage;
        }

        optimizer->zero_grad();
        policy_loss.backward();
        optimizer->step();

        // 更新值函数（基线）
        if (use_baseline) {
            auto value_loss = torch::tensor(0.0);
            for (int t = 0; t < states.size(); t++) {
                auto value = value_net->forward(states[t]);
                value_loss = value_loss + torch::mse_loss(value, returns_tensor[t]);
            }
            value_optimizer->zero_grad();
            value_loss.backward();
            value_optimizer->step();
        }
    }

private:
    std::shared_ptr<PolicyNetwork> policy;
    std::shared_ptr<torch::nn::Module> value_net;  // 简化，实际应为 ValueNetwork
    std::shared_ptr<torch::optim::Adam> optimizer, value_optimizer;
    double gamma;
    bool use_baseline;
    int action_dim;
};`,
      python: `import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

class PolicyNetwork(nn.Module):
    def __init__(self, state_dim, action_dim):
        super().__init__()
        self.fc1 = nn.Linear(state_dim, 128)
        self.fc2 = nn.Linear(128, 128)
        self.fc3 = nn.Linear(128, action_dim)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return torch.softmax(self.fc3(x), dim=-1)

class ValueNetwork(nn.Module):
    def __init__(self, state_dim):
        super().__init__()
        self.fc1 = nn.Linear(state_dim, 128)
        self.fc2 = nn.Linear(128, 128)
        self.fc3 = nn.Linear(128, 1)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

class REINFORCE:
    def __init__(self, state_dim, action_dim, lr=1e-3,
                 gamma=0.99, use_baseline=True):
        self.gamma = gamma
        self.use_baseline = use_baseline
        self.action_dim = action_dim

        self.policy = PolicyNetwork(state_dim, action_dim)
        self.optimizer = optim.Adam(self.policy.parameters(), lr=lr)

        if use_baseline:
            self.value_net = ValueNetwork(state_dim)
            self.value_optimizer = optim.Adam(self.value_net.parameters(), lr=lr)

    def act(self, state):
        state = torch.FloatTensor(state).unsqueeze(0)
        probs = self.policy(state)
        dist = torch.distributions.Categorical(probs)
        action = dist.sample()
        return action.item()

    def update(self, states, actions, rewards):
        # 计算回报 G_t
        returns = []
        G = 0
        for r in reversed(rewards):
            G = r + self.gamma * G
            returns.insert(0, G)
        returns = torch.FloatTensor(returns)

        # 归一化
        returns = (returns - returns.mean()) / (returns.std() + 1e-8)

        # 策略损失
        policy_loss = []
        for t, (state, action) in enumerate(zip(states, actions)):
            state = torch.FloatTensor(state).unsqueeze(0)
            probs = self.policy(state)
            log_prob = torch.log(probs[0, action])
            baseline = self.value_net(state).item() if self.use_baseline else 0
            advantage = returns[t] - baseline
            policy_loss.append(-log_prob * advantage)

        policy_loss = torch.stack(policy_loss).sum()
        self.optimizer.zero_grad()
        policy_loss.backward()
        self.optimizer.step()

        # 更新值函数
        if self.use_baseline:
            value_loss = []
            for t, state in enumerate(states):
                state = torch.FloatTensor(state).unsqueeze(0)
                value = self.value_net(state)
                value_loss.append(nn.MSELoss()(value, returns[t]))
            value_loss = torch.stack(value_loss).sum()
            self.value_optimizer.zero_grad()
            value_loss.backward()
            self.value_optimizer.step()`
    },
    variablesSnapshot: {
      gamma: '0.99',
      use_baseline: 'True',
      policy_type: 'stochastic (softmax)',
      gradient_estimator: 'Monte Carlo'
    },
    pseudocode: `procedure REINFORCE(env, n_episodes)
    Initialize policy pi_theta with random weights
    for episode <- 1 to n_episodes do
        // 收集轨迹
        trajectory <- []
        s <- env.reset()
        repeat
            a <- sample from pi_theta(a|s)
            s', r, done <- env.step(a)
            trajectory.append(s, a, r)
            s <- s'
        until done

        // 计算回报
        for t from T-1 down to 0 do
            G_t <- r_t + gamma * G_{t+1}
        end for

        // 计算梯度并更新
        for t from 0 to T-1 do
            b <- V(s_t)  // 基线
            theta <- theta + alpha * grad(log pi_theta(a_t|s_t)) * (G_t - b)
        end for
    end for
    return theta`,
    bigO: {
      time: '每步采样 O(1)（前向传播）。每个 episode 结束后更新：前向 O(T × H)，反向 O(T × H)，T 是轨迹长度，H 是网络规模。',
      space: '存储策略网络 O(H)，值函数网络 O(H)，轨迹存储 O(T × D)。',
      note: 'REINFORCE 是 on-policy 算法，需要当前策略产生的轨迹。样本效率较低，适合连续动作空间。'
    },
    compare: [
      { method: 'REINFORCE', data: 'MC 策略梯度', strength: '无偏估计，实现简单', tradeoff: '方差大，样本效率低' },
      { method: 'Actor-Critic', data: 'TD 策略梯度', strength: '方差小，可在线学习', tradeoff: '引入偏差（值函数近似）' },
      { method: 'PPO', data: '裁剪目标', strength: '稳定训练，样本效率高', tradeoff: '实现稍复杂' }
    ],
    quiz: [
      {
        q: '策略梯度定理中，为什么要用 log 概率乘以回报？',
        options: [
          '因为 log 概率的梯度给出策略参数的更新方向，回报加权增加高回报轨迹的权重',
          '因为 log 使计算更快',
          '因为回报必须为正',
          '没有特殊原因'
        ],
        answer: 0,
        explanation: '∇log π(a|s) 是 score function，指向增加动作 a 概率的方向。乘以 G_t 使高回报轨迹的方向更受重视。'
      },
      {
        q: '基线的作用是什么？',
        options: [
          '减少梯度估计的方差，而不改变期望',
          '增加奖励',
          '减少探索',
          '增加模型容量'
        ],
        answer: 0,
        explanation: 'E[∇log π · (G - b)] = E[∇log π · G]，因为 E[∇log π · b] = 0。但选择合适的 b（如 V(s)）可以大幅减少方差。'
      }
    ]
  },
  {
    id: 'rl-actor-critic',
    title: 'Actor-Critic',
    summary: '优势函数、A2C、PPO 算法',
    theory: `## Actor-Critic

Actor-Critic 结合了值函数方法和策略梯度方法的优点：
- **Actor (演员)**: 参数化策略 $\\pi_\\theta(a \\mid s)$，负责选动作
- **Critic (评论家)**: 估计值函数 $V_\\phi(s)$，评估动作好坏

### 优势函数

$$A_t = Q(s_t, a_t) - V(s_t)$$

在实践中，常用 TD 误差作为优势函数的估计：

$$A_t \\approx r_t + \\gamma V(s_{t+1}) - V(s_t)$$

### 单步 Actor-Critic 更新

**Actor 更新**（策略参数）：

$$\\theta \\leftarrow \\theta + \\alpha \\nabla_\\theta \\log \\pi_\\theta(a_t \\mid s_t) \\cdot A_t$$

**Critic 更新**（值函数参数）：

$$\\phi \\leftarrow \\phi + \\alpha (r_t + \\gamma V_\\phi(s_{t+1}) - V_\\phi(s_t)) \\nabla_\\phi V_\\phi(s_t)$$

### A2C (Advantage Actor-Critic)

A2C 使用多个并行环境收集经验，同步更新：

$$\\nabla_\\theta J(\\theta) = \\frac{1}{N} \\sum_{i=1}^N \\sum_t \\nabla_\\theta \\log \\pi_\\theta(a_t^i \\mid s_t^i) \\cdot A_t^i$$

相比 A3C（异步），A2C 更简单且在 GPU 上更高效。

### PPO (Proximal Policy Optimization)

PPO 通过裁剪目标函数限制策略更新幅度，防止步长过大：

$$L^{CLIP}(\\theta) = \\hat{\\mathbb{E}}_t \\left[ \\min \\left( r_t(\\theta) \\hat{A}_t, \\text{clip}(r_t(\\theta), 1-\\epsilon, 1+\\epsilon) \\hat{A}_t \\right) \\right]$$

其中 $r_t(\\theta) = \\frac{\\pi_\\theta(a_t \\mid s_t)}{\\pi_{\\theta_{old}}(a_t \\mid s_t)}$ 是重要性采样比率。

### PPO 算法流程

1. 用当前策略收集一批轨迹
2. 计算优势函数 $\\hat{A}_t$
3. 多轮 SGD 最大化裁剪目标
4. 更新策略，丢弃旧数据

### 与其他方法的对比

| 方法 | 稳定性 | 样本效率 | 实现难度 |
|------|--------|---------|---------|
| REINFORCE | 低（大方差） | 低 | 简单 |
| Actor-Critic | 中 | 中 | 中等 |
| PPO | 高 | 高 | 中等 |
| TRPO | 很高 | 高 | 复杂 |
`,
    exercise: { type: 'playground', viz: 'policyGradient' },
    code: {
      cpp: `#include <torch/torch.h>

class ActorCritic {
public:
    ActorCritic(int state_dim, int action_dim,
                double lr_actor = 1e-3, double lr_critic = 1e-3,
                double gamma = 0.99)
        : gamma(gamma), action_dim(action_dim) {
        actor = std::make_shared<ActorNetwork>(state_dim, action_dim);
        critic = std::make_shared<CriticNetwork>(state_dim);
        actor_optimizer = std::make_shared<torch::optim::Adam>(
            actor->parameters(), torch::optim::AdamOptions(lr_actor));
        critic_optimizer = std::make_shared<torch::optim::Adam>(
            critic->parameters(), torch::optim::AdamOptions(lr_critic));
    }

    int act(torch::Tensor state) {
        torch::NoGradGuard no_grad;
        auto probs = actor->forward(state);
        auto dist = torch::multinomial(probs, 1);
        return dist.item<int>();
    }

    void update(torch::Tensor state, int action,
                double reward, torch::Tensor next_state, bool done) {
        auto value = critic->forward(state);
        auto next_value = critic->forward(next_state);

        // TD 目标和优势
        auto td_target = reward + gamma * next_value * (1 - done);
        auto advantage = td_target - value;

        // Critic 更新
        auto critic_loss = torch::mse_loss(value, td_target.detach());
        critic_optimizer->zero_grad();
        critic_loss.backward();
        critic_optimizer->step();

        // Actor 更新
        auto probs = actor->forward(state);
        auto log_prob = torch::log(probs[0][action]);
        auto actor_loss = -log_prob * advantage.detach();
        actor_optimizer->zero_grad();
        actor_loss.backward();
        actor_optimizer->step();
    }

private:
    std::shared_ptr<torch::nn::Module> actor, critic;  // 简化
    std::shared_ptr<torch::optim::Adam> actor_optimizer, critic_optimizer;
    double gamma;
    int action_dim;
};

// PPO
class PPO : public ActorCritic {
public:
    PPO(int state_dim, int action_dim,
        double lr = 3e-4, double gamma = 0.99,
        double clip_epsilon = 0.2, int n_epochs = 4)
        : ActorCritic(state_dim, action_dim, lr, lr, gamma),
          clip_epsilon(clip_epsilon), n_epochs(n_epochs) {}

    void update_batch(const vector<torch::Tensor>& states,
                      const vector<int>& actions,
                      const vector<double>& rewards,
                      const vector<torch::Tensor>& next_states,
                      const vector<bool>& dones) {
        // 计算优势函数（使用 GAE）
        vector<double> advantages = compute_gae(rewards, states, next_states, dones);

        for (int epoch = 0; epoch < n_epochs; epoch++) {
            // 计算新的 log 概率
            auto new_log_probs = compute_log_probs(states, actions);
            auto old_log_probs = /* ... 保存的旧值 */;

            // 重要性采样比率
            auto ratio = torch::exp(new_log_probs - old_log_probs);
            auto adv_tensor = torch::tensor(advantages);

            // PPO 裁剪目标
            auto surr1 = ratio * adv_tensor;
            auto surr2 = torch::clamp(ratio, 1 - clip_epsilon,
                                      1 + clip_epsilon) * adv_tensor;
            auto actor_loss = -torch::min(surr1, surr2).mean();

            // Critic 更新
            auto values = /* ... */;
            auto returns = adv_tensor + values;
            auto critic_loss = torch::mse_loss(values, returns.detach());

            // 联合更新
            auto loss = actor_loss + 0.5 * critic_loss;
            optimizer->zero_grad();
            loss.backward();
            optimizer->step();
        }
    }

private:
    double clip_epsilon;
    int n_epochs;

    vector<double> compute_gae(/* ... */) {
        // GAE (Generalized Advantage Estimation)
        // ...
        return {};
    }
};`,
      python: `import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

class ActorNetwork(nn.Module):
    def __init__(self, state_dim, action_dim):
        super().__init__()
        self.fc1 = nn.Linear(state_dim, 128)
        self.fc2 = nn.Linear(128, 128)
        self.fc3 = nn.Linear(128, action_dim)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return torch.softmax(self.fc3(x), dim=-1)

class CriticNetwork(nn.Module):
    def __init__(self, state_dim):
        super().__init__()
        self.fc1 = nn.Linear(state_dim, 128)
        self.fc2 = nn.Linear(128, 128)
        self.fc3 = nn.Linear(128, 1)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

class ActorCritic:
    def __init__(self, state_dim, action_dim,
                 lr_actor=1e-3, lr_critic=1e-3, gamma=0.99):
        self.gamma = gamma
        self.actor = ActorNetwork(state_dim, action_dim)
        self.critic = CriticNetwork(state_dim)
        self.actor_optimizer = optim.Adam(self.actor.parameters(), lr=lr_actor)
        self.critic_optimizer = optim.Adam(self.critic.parameters(), lr=lr_critic)

    def act(self, state):
        state = torch.FloatTensor(state).unsqueeze(0)
        probs = self.actor(state)
        dist = torch.distributions.Categorical(probs)
        action = dist.sample()
        return action.item()

    def update(self, state, action, reward, next_state, done):
        state = torch.FloatTensor(state).unsqueeze(0)
        next_state = torch.FloatTensor(next_state).unsqueeze(0)

        value = self.critic(state)
        next_value = self.critic(next_state)

        td_target = reward + self.gamma * next_value * (1 - done)
        advantage = td_target - value

        # Critic 更新
        critic_loss = nn.MSELoss()(value, td_target.detach())
        self.critic_optimizer.zero_grad()
        critic_loss.backward()
        self.critic_optimizer.step()

        # Actor 更新
        probs = self.actor(state)
        log_prob = torch.log(probs[0, action])
        actor_loss = -log_prob * advantage.detach()
        self.actor_optimizer.zero_grad()
        actor_loss.backward()
        self.actor_optimizer.step()

class PPO(ActorCritic):
    def __init__(self, state_dim, action_dim,
                 lr=3e-4, gamma=0.99,
                 gae_lambda=0.95, clip_epsilon=0.2,
                 n_epochs=4, batch_size=64):
        super().__init__(state_dim, action_dim, lr, lr, gamma)
        self.gae_lambda = gae_lambda
        self.clip_epsilon = clip_epsilon
        self.n_epochs = n_epochs
        self.batch_size = batch_size

    def compute_gae(self, rewards, values, dones):
        advantages = []
        gae = 0
        for t in reversed(range(len(rewards))):
            if t == len(rewards) - 1:
                next_value = 0
            else:
                next_value = values[t + 1]
            delta = rewards[t] + self.gamma * next_value * (1 - dones[t]) - values[t]
            gae = delta + self.gamma * self.gae_lambda * (1 - dones[t]) * gae
            advantages.insert(0, gae)
        return advantages

    def update(self, states, actions, rewards, next_states, dones):
        states_t = torch.FloatTensor(states)
        actions_t = torch.LongTensor(actions)

        # 计算值和优势
        with torch.no_grad():
            values = self.critic(states_t).squeeze()
            advantages = self.compute_gae(rewards, values.numpy(), dones)
            advantages = torch.FloatTensor(advantages)
            advantages = (advantages - advantages.mean()) / (advantages.std() + 1e-8)

        # 保存旧 log 概率
        with torch.no_grad():
            old_probs = self.actor(states_t)
            old_log_probs = torch.log(old_probs.gather(1, actions_t.unsqueeze(1)).squeeze(1))

        # PPO 更新
        for _ in range(self.n_epochs):
            # 新 log 概率
            probs = self.actor(states_t)
            log_probs = torch.log(probs.gather(1, actions_t.unsqueeze(1)).squeeze(1))

            # 重要性采样比率
            ratio = torch.exp(log_probs - old_log_probs)

            # 裁剪目标
            surr1 = ratio * advantages
            surr2 = torch.clamp(ratio, 1 - self.clip_epsilon,
                                1 + self.clip_epsilon) * advantages
            actor_loss = -torch.min(surr1, surr2).mean()

            # Critic 损失
            values = self.critic(states_t).squeeze()
            returns = advantages + values.detach()
            critic_loss = nn.MSELoss()(values, returns)

            # 联合损失
            loss = actor_loss + 0.5 * critic_loss

            self.actor_optimizer.zero_grad()
            self.critic_optimizer.zero_grad()
            loss.backward()
            self.actor_optimizer.step()
            self.critic_optimizer.step()`
    },
    variablesSnapshot: {
      gamma: '0.99',
      gae_lambda: '0.95',
      clip_epsilon: '0.2',
      n_epochs: '4',
      advantage: 'TD error / GAE'
    },
    pseudocode: `procedure ACTOR_CRITICAL_STEP(s, a, r, s', done)
    V(s) <- critic(s)
    V(s') <- critic(s')
    A <- r + gamma * V(s') - V(s)
    critic_loss <- (A)^2
    actor_loss <- -log pi(a|s) * A
    update critic and actor

procedure PPO_UPDATE(trajectories)
    // 计算优势
    for each trajectory do
        A_t <- compute_GAE(rewards, values)
    end for

    // 多轮优化
    for epoch <- 1 to K do
        ratio <- pi_theta(a|s) / pi_theta_old(a|s)
        L_clip <- min(ratio * A, clip(ratio, 1-eps, 1+eps) * A)
        maximize mean(L_clip) - 0.5 * critic_loss
    end for`,
    bigO: {
      time: 'A2C 每步更新 O(H)（网络前向和反向）。PPO 每批数据更新 K 轮，每轮 O(B × H)，B 是 batch size。',
      space: '存储 Actor 和 Critic 网络各 O(H)，轨迹数据 O(T × D)。',
      note: 'PPO 是目前最实用的策略梯度算法，平衡了稳定性和样本效率。'
    },
    compare: [
      { method: 'A2C', data: '同步优势Actor-Critic', strength: '实现简单，可并行', tradeoff: '需要调参' },
      { method: 'PPO', data: '裁剪策略梯度', strength: '稳定，样本效率高', tradeoff: '实现稍复杂' },
      { method: 'SAC', data: '最大熵 RL', strength: '离策略，高样本效率', tradeoff: '实现复杂，调参多' }
    ],
    quiz: [
      {
        q: 'PPO 中的裁剪目标有什么作用？',
        options: [
          '限制策略更新的幅度，防止步长过大导致性能崩溃',
          '增加奖励',
          '减少计算量',
          '增加探索'
        ],
        answer: 0,
        explanation: '裁剪目标确保新旧策略的比率 r_t(θ) 在 [1-ε, 1+ε] 范围内，防止一次更新改变策略太多。'
      },
      {
        q: 'GAE (Generalized Advantage Estimation) 的作用是什么？',
        options: [
          '在偏差和方差之间取得平衡，通过 λ 参数控制',
          '增加奖励',
          '减少状态空间',
          '增加模型容量'
        ],
        answer: 0,
        explanation: 'GAE 通过混合多步 TD 误差，在偏差（低 λ）和方差（高 λ）之间取得平衡。λ=1 等价于 MC，λ=0 等价于 TD(0)。'
      }
    ]
  }
]
