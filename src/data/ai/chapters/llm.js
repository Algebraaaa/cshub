// AI 专业课 · 大语言模型（llm）章节课节数据
// 从 curriculum.js 原样拆出（2026-06）。补全/注入逻辑（AI_COMPLETION_DEFAULTS、
// LATE_COURSE_CODE、completeAILessonMetadata）仍在 ../curriculum.js，
// 模块加载时会原位向这些 lesson 对象补字段。
export const LLM_LESSONS = [
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
]
