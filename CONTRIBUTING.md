# 贡献指南 · CS Hub

欢迎参与。本文档说明本地开发、质量门、代码约定与提交流程。

## 本地开发

```bash
npm install        # Node ≥ 20（见 package.json engines）
npm run dev        # http://localhost:5173，无需 Supabase 即可运行
```

## 质量门（提交前务必本地通过）

| 命令 | 作用 |
|---|---|
| `npm run lint` | ESLint（含 react-hooks 规则） |
| `npm test` | Vitest 全量单测 |
| `npm run typecheck` | 类型检查（渐进式，见下方「类型」） |
| `npm run build` | 生产构建 |
| `npm run check` | 一次性跑 lint + test + build |

**CI（`.github/workflows/ci.yml`）会在每次 push / PR 上跑同样的检查，红了不合并。**
所以本地先绿再推——这是 AI 辅助开发最重要的安全网。

## 代码约定

详见 [CLAUDE.md](CLAUDE.md)，要点：

- **新组件强制 Tailwind**（`@theme` token / `@layer components` 复用类），老组件保留 inline style 直到重构。
- **可视化组件**：SVG 节点用稳定 `id` 作 key + `transform` 过渡，不要直接绑 `cx/cy`；颜色变化走 `fill transition`。
- **无障碍**：状态不要只靠颜色区分（照顾红绿色盲），配合形状/符号/文字；交互元素给 `aria-label`。
- **异步/存储/登录态**：任何涉及网络失败、账号切换、跨标签的改动，先想清失败场景（参考 `src/services/storage/SyncService.js` 的竞态处理与测试）。

## 新增一个算法

只需动 ~3 个文件（详情页/学科页/侧栏/搜索会自动列出）：

1. **算法函数**（纯函数，返回步骤数组）→ `src/algorithms/<subject>/<name>.js`
2. **元数据 + 学习内容** → `src/data/algorithms/<subject>.js`
   （必填：slug, name, category, difficulty, fn, viz, timeComplexity, description, intuition, pseudocode, code{cpp,python}, applications）
3. **Playground** → `src/components/playgrounds/<Name>Playground.jsx`，并注册到 `AlgorithmPlaygroundFor`
4. **课后题** → `src/data/quizzes.js`（3 题）
5. 新增 category 时 → `src/data/subjects.js` 加映射

新算法**必须**在 `src/data/algorithmSmoke.test.jsx` 的全量冒烟里能渲染+单步不崩；边界正确性参考 `src/data/sortingCorrectness.test.js`。

## 类型

项目为纯 JS，正在渐进迁移类型检查（[FRONTEND_SELF_CHECK.md](docs/FRONTEND_SELF_CHECK.md) 维度 10）：

- `jsconfig.json`：给编辑器提供跨文件跳转与 JSDoc 类型提示。
- `npm run typecheck`：对**已补 JSDoc 的子集**开 `checkJs` 强制检查（`tsconfig.typecheck.json` 的 `include` 列表）。
- 新写纯逻辑模块请补 JSDoc 并加入该 include 列表，让强制检查范围只增不减。

## 提交与 PR

- 一个逻辑改动一个 commit，信息用 `type(scope): 简述`（feat/fix/perf/chore/test/docs…）。
- 修 bug 尽量配一个能复现的测试（防回归）。
- 提 PR 前确保 `npm run check` 与 `npm run typecheck` 均绿。
