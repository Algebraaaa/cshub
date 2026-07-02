# CSHub 竞赛算法扩展集成报告

## 1. 项目信息

- 主项目目录：`F:\cshub`
- 框架：React 19 + Vite 8 + Tailwind CSS 4 + React Router 7
- 启动命令：`npm run dev`
- 当前验收服务：`http://127.0.0.1:5173`
- 构建命令：`npm run build`
- 本次参考产物：`F:\cshub\回收站bin\OG5SL7_Rune_quick.zip`

## 2. 新增算法清单

| 模块 | 类别 | 难度 | 来源 | 动画 | 代码高亮 | 说明 |
|---|---|---|---|---|---|---|
| Tarjan 割点与桥 (`tarjancp`) | 图论 | 进阶 | cp-templates/Rune 产物 | 是 | 是 | 是 |
| LCA 最近公共祖先 (`lca`) | 图论 | 进阶 | cp-templates/Rune 产物 | 是 | 是 | 是 |
| Dinic 最大流 (`dinic`) | 图论 | 进阶 | cp-templates/Rune 产物 | 是 | 是 | 是 |
| 最小费用最大流 (`mcmf`) | 图论 | 进阶 | cp-templates/Rune 产物 | 是 | 是 | 是 |
| 欧拉回路 (`eulerpath`) | 图论 | 进阶 | Rune 产物 | 是 | 是 | 是 |
| 懒标记线段树 (`lazyseg`) | 数据结构 | 进阶 | cp-templates/Rune 产物 | 是 | 是 | 是 |
| 差分数组 (`diffarray`) | 数据结构 | 中等 | Rune 产物 | 是 | 是 | 是 |
| AC 自动机 (`aho`) | 字符串 | 进阶 | cp-templates/Rune 产物 | 是 | 是 | 是 |
| 字符串哈希 (`stringhash`) | 字符串 | 中等 | cp-templates/Rune 产物 | 是 | 是 | 是 |
| 快速幂 (`fastpow`) | 数学 | 基础 | cp-templates/Rune 产物 | 是 | 是 | 是 |
| 欧拉筛 (`sieve`) | 数学 | 中等 | cp-templates/Rune 产物 | 是 | 是 | 是 |
| 矩阵快速幂 (`matrixpow`) | 数学 | 进阶 | Rune 产物 | 是 | 是 | 是 |

覆盖类别：图论、数据结构、字符串、数学；原项目已有 DP、回溯、排序等分类继续保留。

## 3. 重点集成说明

- 新增算法均使用现有 `PlaygroundShell` 和 `StepController`，继承播放、暂停、单步、重置、调速能力。
- 每个步骤保留 `cppLine` / `pythonLine`，通过现有 `StepContext` 与右侧代码面板同步高亮。
- 新增 `math` 算法分组，接入 `algorithmDetails` 懒加载、`subjects` 分类、`algorithmMeta` 搜索元数据和 `playgroundRegistry`。
- 保留当前项目已有 KMP、Trie、Fenwick、普通线段树、0/1 背包等实现，本次只补充缺失或更高阶的竞赛模块。

## 4. 修改文件清单

- 新增算法函数：`src/algorithms/graph/*`、`src/algorithms/dataStructures/*`、`src/algorithms/string/*`、`src/algorithms/math/*`
- 新增 Playground：`src/components/playgrounds/*Playground.jsx`
- 更新注册与数据：`src/data/algorithms/graph.js`、`src/data/algorithms/dataStructures.js`、`src/data/algorithms/string.js`、`src/data/algorithms/math.js`
- 更新元数据：`src/data/algorithmMeta.js`、`src/data/algorithmDetails.js`、`src/data/subjects.js`、`src/data/quizzes.js`
- 更新 Playground 映射：`src/components/learning/playgroundRegistry.js`
- 更新 lint 忽略：`eslint.config.js`
- 清理既有 lint 问题：AI playground、音乐课程、布局和错题本相关少量未使用变量/Hook 依赖

## 5. 自测结果

- `npm run lint`：通过
- `npm run test -- src/components/learning/playgroundRegistry.test.js src/data/algorithmMeta.test.js src/data/subjects.test.js`：通过，3 个文件 7 个测试
- `npm run build -- --outDir C:\Users\Raelon\AppData\Local\Temp\cshub-cp-merge-build --emptyOutDir`：通过
- `npm run dev -- --host 127.0.0.1 --port 5173`：已启动，`http://127.0.0.1:5173` 返回 200
- 路由 smoke：`/algo/tarjancp` 返回 200

构建存在 Vite 对 `src/features/guitar/lib/guitarMath.js` 的既有动态导入 warning，不影响本次竞赛算法模块。

## 6. 未完成或风险

暂无明显已知问题。
