# 雅思模块架构（docs/ielts/ARCHITECTURE.md）

> 范围：`src/features/ielts/`、`src/pages/Ielts*.jsx`、`src/services/storage/mistakeStore.js`、
> `api/ielts/llm.js`、`scripts/ielts/`。本文档记录分层、依赖方向、关键取舍与安全边界。

## 1. 分层与依赖方向

```
pages/Ielts*.jsx                 薄页面（标题 + 一个特性组件），全部懒加载
        │
features/ielts/components/*      React UI（工作台、训练器、画像、设置……）
features/ielts/hooks/*           React 状态（localStorage hook 封装）
        │
features/ielts/llm/runner.js     唯一模型调用入口（fetch / 重试 / 状态机）
features/ielts/llm/templates.js  模板注册表（纯 JS，网页与导出脚本共用）
        │
features/ielts/core/*  ◄──────── 框架无关内核（判题/换算/证据/路径/错因）
        │
services/storage/*               统一存储层（LocalStore JSON KV + mistakeStore）
```

- **依赖只能向下**。`core/` 不 import `features/` 之外任何东西，也不 import React/DOM/
  localStorage/网络；`core/purity.test.js` 扫描 import 与禁用标识符强制这一点。
- `templates.js` 只依赖 `core`，因此 Node 脚本（`scripts/ielts/export-harness.mjs`）和
  Vercel Function（`api/ielts/llm.js`）可以直接复用同一份模板与约束，不需要浏览器环境。
- `llm/runner.js` 是整个网页端唯一调用 `fetch` 的地方；UI 不感知服务商协议差异。
- `llm/callLog.js` 在每次调用结束时写脱敏日志（无 key/无正文，见 docs/ielts/REPETITION.md）。
- `storage/spacedRepetition.js` 是间隔复习排期（错题/替换/词块），`storage/setReports.js`
  负责整套分组与 Markdown/打印报告；两者都是纯逻辑 + 本地 JSON KV。

### 内核文件（固定公开接口见 `core/index.js`）

| 文件 | 职责 |
|---|---|
| `errorCodes.js` | 六个固定错因码 |
| `format.js` | 答题指令解析与词数/数字数校验 |
| `judge.js` | key 展开（`/`、圆括号）、归一化、Levenshtein、六类判题 |
| `bands.js` | 部分官方平均锚点与非官方补全阈值的估算、总分/写作/口语取整（来源和假设见 RULES.md） |
| `evidence.js` | `verifyEvidence`：空白/大小写归一化后的逐字子串校验 |
| `ladder.js` | 写作训练路径与 `canStart` 解锁规则 |
| `reasons.js` | 固定错因表（规则判定 vs 模型建议） |
| `parseInput.js` | 整段粘贴自动拆题/拆答案 |

## 2. 模型调用链路（真实 / 模拟）

1. UI 收集变量 → `runTemplate(templateId, variables, settings)`。
2. `checkVariables` 检查必填变量（空字符串也算缺失）；输入总长有上限（24k 字符）。
3. **无 API key**：直接执行 `template.mock(variables)`，返回 `status:'mock'`、
   `simulated:true`。模拟反馈：
   - 定位句用确定性启发式从原文里找包含答案关键词的句子，找不到就留空（不编造）；
   - 其余字段是固定的引导文案，统一带「模拟反馈」前缀；
   - 同样过模板自己的 `validate` 与 `verifyOutput`，不会因为是模拟就放松校验。
4. **有 key**：按模板 system/user 消息请求 OpenAI 兼容的 chat/completions
   （DeepSeek 默认；或用户填写的任意兼容地址；或同源 `/api/ielts/llm` 中转），
   要求 JSON 输出 → `JSON.parse`（容忍 ```json 代码块包裹）→ `template.validate`
   → `template.verifyOutput`（证据逐条 `verifyEvidence`）。任何一环不合格，带上失败原因
   **重试一次**；仍不合格返回 `invalid-output`，UI 显示「讲解不可靠」并允许重试。
5. 界面上永远区分三类信息：规则判定（确定）、模型建议（可改）、估算分数（非官方）。

发送前知情：有 key 时讲解按钮先弹「发送预览」，展示将发送的 system/user 全文与字符数，
用户确认后才发（同一次复盘确认一次即可）；无 key 时不触网，直接模拟。

## 3. 数据与存储

- 所有个人数据只写浏览器 localStorage，统一走 `services/storage/LocalStore.js` 的
  `readJSON/writeJSON`（带 QuotaExceeded 写失败可见化）。
- 错题统一在 `services/storage/mistakeStore.js`（键 `cshub-mistakes-v1`）：
  - `algo`：算法课后题（slug → 错题号 + 分数），由 `Quiz.jsx`/`WrongAnswers.jsx` 写入；
  - `ielts`：阅读/听力错题（错因、定位句、讲解摘要、反思、来源、时间）。
- **迁移**：首次访问时把老键 `algoviz-wrong-questions`、`algoviz-quiz-scores` 并入新结构，
  幂等、老键不删除（无损），迁移纯函数 `migrateInto` 有单测。
- 雅思其余数据键见 `features/ielts/storage/ieltsStore.js`（设置、写作进度与会话、
  知识笔记、口语话题/历史、自定义词块/收藏、我的替换库）。
- 原文/文稿**默认不长期保存**，只存复盘需要的定位句；用户勾选后才随会话保存全文，
  并可在错题库删除。导出默认剥离 API key；「清空」只清雅思数据，不碰算法进度。

## 4. 自带 key 的安全边界

- key 只存在用户浏览器 localStorage；不进 git、不进构建产物（构建产物里没有默认 key）。
- 直连模式：浏览器直接向服务商发请求，key 作为 Authorization 头。
- 中转模式（`api/ielts/llm.js`，Vercel Function）：
  - 只转发，不写任何日志、不持久化；key 只用于上游 Authorization；
  - 模板白名单（未注册 templateId 拒绝）、请求体大小上限、45s 上游超时；
  - 原样透传上游响应。
- `vercel.json` 的 SPA rewrite 用负向先行断言排除 `/api`，函数在文件系统阶段命中，
  不会被改写成首页。

## 5. 路由与包体

- 8 个页面（`/ielts`、reading/listening/mistakes/writing/speaking/vocab/settings）
  全部在 `routeLoaders.js` 注册动态 import，各自独立 chunk；`core` 被抽成共享 chunk。
- 主入口 chunk 只增加路由表若干条，增长控制在 +5KB 以内（验收实测见汇报）。

## 6. 对话插件导出

- `npm run ielts:export-harness` → `dist-harness/ielts/{system-prompt.md,commands.json}`，
  由 `templates.js`（模板/约束/证据字段）和 `core/ladder.js`（路径）现场生成；
- `npm run ielts:check-harness` 重新生成并逐字节比对，漂移即非零退出（防网页/插件两份定义）。
- `npm run ielts:check-templates` 用固定夹具离线校验每个模板各版本的输出结构与证据门
  （夹具见 `scripts/ielts/fixtures.mjs`，规则见 `docs/ielts/REPETITION.md`）。

## 7. 关键取舍

1. **判题确定性优先**：字数、单复数、拼写近形、判断题标签体系都在内核判定，模型不能推翻；
   模型只负责解释与建议错因，用户可改。
2. **证据不通过即降级**：模型给的定位句不是原文逐字子串时，不展示为可靠结论，整条讲解
   标「不可靠」并重试，而不是悄悄截断或替模型圆场。
3. **无 key 也能完整练习**：判题、错题库、画像、计时、词块、路径解锁全部本地可用；
   讲解用结构合法、醒目标注的模拟反馈，宁可信息少也不冒充真实讲解。
4. **写作/口语不代写**：模板约束最多 3 处问题、口语语法最多 2 处；估分只给文字区间且
   必须以「估算」开头；文字不给发音分，缺发音分时 `speakingBand` 直接抛错。
5. **题面录入从宽、判题从严**：粘贴拆题保守（无题号按行），拆错在表格里逐题可改；
   判断题缩写 T/F/NG 在没有官方统一口径时一律不接受（见 RULES.md）。
