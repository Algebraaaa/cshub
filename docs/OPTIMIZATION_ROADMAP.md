# CS Hub 工业级优化路线图

> 2026-07 制定。P0 已全部落地(7 个 commit);本文档保留 P1/P2 待办与验收标准备查。
> 背景调查:构建产物原 4.4MB/137 chunk;469 源文件 ~95K 行;历次结论见 git log 中 P0 各 commit 说明。

## P0(已完成,2026-07-02)

| # | 内容 | Commit 关键词 | 主要收益 |
|---|------|--------------|---------|
| P0-3 | 依赖安全:vite→8.1.3、undici→7.28、清 extraneous | `chore(deps)` | npm audit 0 漏洞 |
| P0-6 | 字体 `display=block`→`swap` + noscript 兜底 | `perf(fonts)` | 消字体加载期文字隐形 |
| P0-4 | `src/lib/monitoring.js` 全局错误管道(onerror + unhandledrejection + ErrorBoundary→Vercel `client_error` 事件,60s 去重/20 条会话限额/chunk-load 分类,addReporter 可插拔) | `feat(observability)` | 线上错误可见 |
| P0-7 | `PageSkeleton`(150ms 延迟显现)替换 "Loading..." | `feat(ux)` | 慢网感知提升 |
| P0-5 | `routeLoaders.js` + `useRoutePreload`:导航 hover/focus 预热路由 chunk | `perf(routing)` | 点击导航秒开 |
| P0-1 | AI 课程按章动态加载:160.7KB(58.7 gzip)巨石 → 轻索引 10.4KB(4.5 gzip)+ 10 个章节 chunk + enrich chunk;index 由 `npm run generate:ai-index` 生成,一致性测试防漂移 | `perf(ai-course)` | 目录页 -92% 数据负载 |
| P0-2 | ProgressContext → ref store + useSyncExternalStore;新增 `useProgressActions`/`useProgressSelector`,`useProgress()` API 完全兼容 | `perf(state)` | Provider 零级联重渲染 |

## P1(下一批)

1. **重复 playground 去重**:`BackpropagationPlayground` vs `BackwardPropagationPlayground`(已确认高度重复)合并;审计 `ActivationFunctions/Activation`、`OneHotEncoding/OneHot`、`ConvexOpt/ConvexOptimization`、`ROCAUC/ROCCurve` 四对疑似。验收:registry 测试绿 + 对应课节/算法页正常。
2. **AIPage.jsx(~1200 行)拆分**:snap-scroll 逻辑、PARTICLES/公式等 hero 数据、章节列表拆为 3-4 个模块。
3. **algorithmMeta.js(1905 行)瘦身**:按学科拆 + 消费方按需引,减主 chunk。
4. **ESLint hooks 规则收紧**:`exhaustive-deps` 升 error,清理现有违规;评估恢复 `set-state-in-effect`/`purity` 为 warn。
5. **Progress selector 迁移**:Sidebar(`isFavorite/isCompleted`)、PathPage(仅 `completed`)、SearchPalette(仅 `favorites`)改 `useProgressSelector`,消白渲染(P0-2 已铺轨)。
6. **chunk-load 自动恢复**:monitoring 已把部署后旧 chunk 404 标为 `source:'chunk-load'`;捕获后带 sessionStorage flag 自动整页刷新一次,消部署后白屏。
7. **enrichment 按章下沉**:`enrichLessons.js`(~65KB chunk)按章拆,课节页只拉本章补全。
8. **playground 局部 ErrorBoundary**:单个可视化崩溃不再打穿整页(现仅路由级一个边界)。

## P2(远期)

1. **index.css(7200+ 行)模块化**:按 layer/feature 拆 + 清死样式。
2. **TypeScript 渐进迁移**:先 jsconfig `checkJs` + JSDoc,data 层(curriculum/meta 结构)先行 .ts。
3. **PWA/离线缓存**:vite-plugin-pwa,precache 壳 + runtime cache 章节/算法 chunk,二次访问秒开。
4. **字体自托管**:woff2 子集化 + preload,消 Google Fonts 第三方依赖与 FOUT。

## 维护约定

- AI 课节数据改动后跑 `npm run generate:ai-index`(curriculum.test.js 一致性用例红了即提示)。
- 新增路由页面:在 `src/routeLoaders.js` 注册 loader(App.jsx lazy 与 hover 预热共用)。
- 接入 Sentry 等 APM:在应用入口调 `monitoring.js` 的 `addReporter()`,业务代码零改动。
- 每项优化独立 commit,出问题单项 revert。
