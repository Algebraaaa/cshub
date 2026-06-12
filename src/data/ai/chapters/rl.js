// AI 专业课 · 强化学习（rl）章节课节数据
// 从 curriculum.js 原样拆出（2026-06）。补全/注入逻辑（AI_COMPLETION_DEFAULTS、
// LATE_COURSE_CODE、completeAILessonMetadata）仍在 ../curriculum.js，
// 模块加载时会原位向这些 lesson 对象补字段。
export const RL_LESSONS = [
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
]
