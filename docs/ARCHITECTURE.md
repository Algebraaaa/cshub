# CS Hub 项目架构文档

> 一个基于 React + Vite + Supabase 的计算机科学学习平台，涵盖算法可视化、音乐学习、个人成长等多个模块。

---

## 1. 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 19.x |
| 构建工具 | Vite | 8.x |
| 路由 | React Router DOM | 7.x |
| 样式 | Tailwind CSS | 4.x |
| 后端/数据库 | Supabase (可选) | 2.x |
| Markdown 渲染 | react-markdown + remark-gfm | 10.x |
| 音频引擎 | Tone.js | 15.x |
| 测试 | Vitest + @testing-library/react | 4.x |
| 部署 | Vercel | - |

---

## 2. 目录结构总览

```
cshub/
├── src/
│   ├── main.jsx                  # 应用入口，挂载 AppProviders + App
│   ├── App.jsx                   # 路由定义（React Router）
│   ├── AppProviders.jsx          # 全 Context Provider 组合
│   ├── index.css                 # 全局样式 + Tailwind
│   │
│   ├── algorithms/               # 算法实现（纯 JS，无 UI 依赖）
│   │   ├── sorting/              #   排序：bubble, merge, quick, heap...
│   │   ├── graph/                #   图：bfs, dfs, dijkstra, bellmanFord...
│   │   ├── tree/                 #   树：bst, avl, redBlack, treap
│   │   ├── dp/                   #   动态规划：knapsack, lcs, lis...
│   │   ├── backtracking/         #   回溯：nQueens
│   │   ├── string/               #   字符串匹配：kmp, rabinKarp...
│   │   ├── dataStructures/       #   数据结构：hashTable, linkedList, trie...
│   │   ├── pageReplacement/      #   页面置换：fifo, lru, opt
│   │   ├── disk/                 #   磁盘调度：fcfs, sstf, scan
│   │   ├── cpuScheduling/        #   CPU 调度：roundRobin, nonPreemptive
│   │   ├── synchronization/      #   进程同步：bankers, philosophers
│   │   ├── network/              #   网络：tcpHandshake, slidingWindow...
│   │   ├── security/             #   安全：rsa, diffieHellman
│   │   ├── co/                   #   计算机组成：ieee754, cacheMap, pipeline
│   │   ├── database/             #   数据库：bPlusTree, hashJoin, mvcc...
│   │   └── compiler/             #   编译原理：regexToNfa, ll1, lr0, codeGen
│   │
│   ├── components/
│   │   ├── playgrounds/          # 交互式可视化组件（每个算法一个 Playground）
│   │   │   ├── SortingPlayground.jsx
│   │   │   ├── GraphPlayground.jsx
│   │   │   ├── TreePlayground.jsx      # 共享：bst/rb/avl/treap
│   │   │   ├── PlaygroundShell.jsx     # Playground 通用外壳
│   │   │   ├── shared.jsx              # Playground 共享 UI 组件
│   │   │   └── inputs/                 # 共享输入组件
│   │   │       ├── ArrayInput.jsx
│   │   │       └── NumberInput.jsx
│   │   │
│   │   ├── learning/             # 学习页面组件
│   │   │   ├── AlgorithmPlaygroundFor.jsx  # Playground 动态分发器
│   │   │   ├── playgroundRegistry.js       # viz key → Playground 映射表
│   │   │   ├── AlgorithmHeader.jsx
│   │   │   ├── AlgorithmTabs.jsx
│   │   │   ├── CodeBlock.jsx             # 代码高亮展示
│   │   │   ├── ComplexityAnalysis.jsx    # 复杂度分析
│   │   │   ├── Quiz.jsx                  # 测验组件
│   │   │   ├── Notes.jsx                 # 笔记组件
│   │   │   ├── ResizableSplitPanel.jsx   # 可拖拽分栏
│   │   │   └── VariablePanel.jsx         # 变量面板
│   │   │
│   │   ├── home/                 # 首页组件
│   │   │   ├── HeroSection.jsx
│   │   │   ├── IntroSection.jsx
│   │   │   └── FrameEdgeDecor.jsx
│   │   │
│   │   ├── guide/                # 指南页面组件
│   │   │   ├── GuideLayout.jsx
│   │   │   └── GuideComponents.jsx
│   │   │
│   │   ├── profile/              # 个人中心组件
│   │   │   ├── LearningHeatmap.jsx
│   │   │   ├── FavoritesPanel.jsx
│   │   │   ├── WrongAnswers.jsx
│   │   │   ├── WeeklyReport.jsx
│   │   │   └── Recommendations.jsx
│   │   │
│   │   ├── [独立可视化]          # 特定算法的独立可视化组件
│   │   │   ├── GraphViz.jsx, TreeViz.jsx, SortingViz.jsx...
│   │   │
│   │   ├── SearchPalette.jsx     # 全局搜索
│   │   ├── StepController.jsx    # 步骤控制器
│   │   └── ErrorBoundary.jsx     # 错误边界
│   │
│   ├── contexts/                 # React Context（全局状态）
│   │   ├── ThemeContext.jsx      # 主题（明/暗）
│   │   ├── AuthContext.jsx       # 认证（Supabase Auth）
│   │   ├── ProgressContext.jsx   # 学习进度（收藏/完成/测验）
│   │   ├── AchievementsContext.jsx # 成就系统
│   │   └── StepContext.jsx       # 算法步骤控制
│   │
│   ├── data/                     # 静态数据层
│   │   ├── algorithms.js         # 算法聚合器（import.meta.glob 自动收集）
│   │   ├── algorithmMeta.js      # 算法元数据（自动生成）
│   │   ├── algorithmDetails.js   # 算法详情（描述、复杂度、代码）
│   │   ├── algorithms/           # 按学科分类的算法数据文件
│   │   │   ├── sorting.js, graph.js, tree.js, dp.js...
│   │   ├── subjects.js           # 学科分类定义
│   │   ├── paths.js              # 学习路径
│   │   ├── quizzes.js            # 测验题目
│   │   ├── achievements.js       # 成就定义
│   │   ├── icons.js              # 图标映射
│   │   ├── complexityNotes.js    # 复杂度说明
│   │   ├── piano/                # 钢琴课程数据 + 歌曲 JSON
│   │   ├── guitar/               # 吉他课程数据
│   │   └── violin/               # 小提琴课程数据
│   │
│   ├── pages/                    # 页面组件（路由对应）
│   │   ├── HomePage.jsx          # 首页
│   │   ├── AlgorithmPage.jsx     # 算法详情页（核心页面）
│   │   ├── LearningCenterPage.jsx # 学习中心
│   │   ├── ProfilePage.jsx       # 个人中心
│   │   ├── PianoPage.jsx         # 钢琴模块
│   │   ├── GuitarPage.jsx        # 吉他模块
│   │   ├── ViolinPage.jsx        # 小提琴模块
│   │   ├── FinancePage.jsx       # 理财模块
│   │   └── ...                   # 其他页面
│   │
│   ├── layout/                   # 布局组件
│   │   ├── AppLayout.jsx         # 根布局（TopBar + Sidebar + Outlet）
│   │   ├── TopBar.jsx            # 顶部导航栏
│   │   ├── Sidebar.jsx           # 侧边栏（算法目录）
│   │   ├── MobileBottomNav.jsx   # 手机底部导航
│   │   ├── DynamicIsland.jsx     # 动态岛通知
│   │   └── navItems.js           # 导航数据源
│   │
│   ├── features/                 # 功能模块（按领域划分）
│   │   ├── piano/                # 钢琴
│   │   │   ├── audio/tonePianoEngine.js  # Tone.js 音频引擎
│   │   │   ├── components/               # PianoKeyboard, NoteWaterfall...
│   │   │   ├── hooks/                    # useKeyboardInput, useTonePiano...
│   │   │   └── lib/noteMath.js           # 音符数学工具
│   │   ├── guitar/               # 吉他
│   │   │   ├── audio/guitarEngine.js
│   │   │   ├── components/       # ChordCard, FretboardDiagram...
│   │   │   └── hooks/useGuitarAudio.js
│   │   ├── violin/               # 小提琴
│   │   │   ├── audio/violinEngine.js
│   │   │   ├── components/       # FingeringChart, StringDiagram...
│   │   │   └── hooks/useViolinAudio.js
│   │   └── music/                # 音乐通用
│   │       ├── components/       # CurriculumIndex, LessonViewer...
│   │       └── hooks/useCourseProgress.js
│   │
│   ├── services/                 # 服务层
│   │   └── storage/
│   │       ├── LocalStore.js     # localStorage 适配器
│   │       ├── RemoteStore.js    # Supabase 适配器
│   │       └── SyncService.js    # 本地 + 云端同步协调器
│   │
│   ├── hooks/                    # 自定义 Hooks
│   │   └── useMediaQuery.js      # 响应式断点
│   │
│   ├── lib/                      # 第三方库封装
│   │   └── supabase.js           # Supabase 客户端（可选）
│   │
│   └── utils/                    # 工具函数
│       ├── safeHtml.js           # XSS 安全 HTML
│       └── stepProtocol.js       # 算法步骤协议
│
├── scripts/                      # 构建脚本
│   ├── generateAlgorithmMeta.cjs # 生成 algorithmMeta.js
│   └── splitAlgorithms.cjs       # 拆分算法数据
│
├── supabase/
│   └── schema.sql                # 数据库建表脚本
│
├── public/                       # 静态资源
│   ├── claude-code-guide/        # Claude Code 教程图片
│   └── github-guide/             # GitHub 教程图片
│
├── docs/                         # 项目文档
│   ├── guides/                   # 使用指南
│   └── reports/                  # 变更报告
│
├── index.html                    # HTML 入口
├── vite.config.js                # Vite 配置
├── vercel.json                   # Vercel 部署配置
└── package.json
```

---

## 3. 核心数据流

### 3.1 应用启动流程

```
index.html
  └─ src/main.jsx
       ├─ AppProviders (lazy loaded)
       │    ├─ ThemeProvider        → 读取 localStorage / 系统偏好 → 设置 data-theme
       │    ├─ AuthProvider         → 检测 Supabase session → 初始化用户状态
       │    ├─ ProgressProvider     → 加载本地进度 → 若已登录则同步云端
       │    └─ AchievementsProvider → 加载成就数据
       └─ App
            └─ BrowserRouter → Routes → AppLayout → <Outlet /> → 具体页面
```

### 3.2 算法数据流（核心路径）

```
用户访问 /algo/:slug
       │
       ▼
AlgorithmPage (pages/AlgorithmPage.jsx)
       │
       ├─ 从 ALGORITHMS 查找算法对象 { fn, category, viz, slug }
       ├─ 从 algorithmDetails 获取详情 { description, complexity, code }
       │
       ▼
AlgorithmTabs (components/learning/AlgorithmTabs.jsx)
       │
       ├─ Tab: 可视化 → AlgorithmPlaygroundFor
       │              → playgroundRegistry 查找 viz key
       │              → lazy import 对应 Playground 组件
       │              → 用户输入数据 → 执行 algo.fn() → 动画展示步骤
       │
       ├─ Tab: 代码 → CodeBlock (代码高亮 + 行号)
       ├─ Tab: 复杂度 → ComplexityAnalysis
       ├─ Tab: 测验 → Quiz → 答题 → recordQuiz() → ProgressContext
       └─ Tab: 笔记 → Notes
```

### 3.3 Playground 组件映射机制

```
算法元数据中的 viz 字段（如 "sorting", "graph", "tree"）
       │
       ▼
playgroundRegistry.js
       │
       ├─ VIZ_TO_NAME: viz key → Playground 文件名
       │    例: "sorting" → "Sorting"
       │        "bst" / "rb" / "avl" → "Tree"（共享同一组件）
       │
       ├─ import.meta.glob('../playgrounds/*Playground.jsx')
       │    → 自动发现所有 Playground 文件
       │
       └─ getPlaygroundLoader(viz) → lazy(() => import('./SortingPlayground.jsx'))
```

### 3.4 数据持久化流

```
用户操作（收藏/完成/测验）
       │
       ▼
ProgressContext.toggleFavorite(slug) / toggleCompleted(slug) / recordQuiz()
       │
       ├─ 更新 React state（即时 UI 反馈）
       │
       ├─ LocalStore.saveProgress() → localStorage（始终同步）
       │
       └─ SyncService.enqueueProgress() → debounce 600ms
              │
              ├─ [未登录] → 仅 localStorage，跨标签通过 storage 事件同步
              │
              └─ [已登录] → RemoteStore.pushProgressRow() → Supabase upsert
                           → Supabase Realtime → 其他设备实时更新
```

### 3.5 云端同步策略

```
登录时：
  1. 拉取云端数据: RemoteStore.fetchProgress(userId)
  2. 合并本地 + 云端: SyncService.mergeProgress()
     - favorites/completed: 取并集
     - quizScores: 取 correct 最大值 + lastAt 最新值
  3. 推回合并结果到云端
  4. 订阅 Supabase Realtime 实时变更

注销时：
  - 重置同步标志，回退到纯 localStorage 模式
```

---

## 4. 路由结构

```
/                           → HomePage（首页）
/algo/:slug                 → AlgorithmPage（算法详情，核心页面）
/compare                    → AlgorithmComparePage（算法对比）
/learn                      → LearningCenterPage（学习中心）
/path                       → PathPage（学习路径列表）
/path/:pathId               → PathPage（具体学习路径）
/logic                      → LogicPage（逻辑学）
/profile                    → ProfilePage（个人中心）
/piano                      → PianoPage（钢琴首页）
/piano/lesson/:lessonId     → PianoLessonPage（钢琴课程）
/piano/practice/:slug       → PianoPracticePage（钢琴练习）
/piano/song/:slug           → PianoPracticePage（钢琴歌曲）
/guitar                     → GuitarPage（吉他首页）
/guitar/lesson/:lessonId    → GuitarLessonPage（吉他课程）
/violin                     → ViolinPage（小提琴首页）
/violin/lesson/:lessonId    → ViolinLessonPage（小提琴课程）
/finance                    → FinancePage（理财）
/finance/stocks             → StockMarketPage（股市）
/github                     → GitHubGuidePage（GitHub 指南）
/ai                         → AIGuidePage（AI 指南）
/interview                  → InterviewGuidePage（面试指南）
/roadmap                    → RoadmapPage（路线图）
/toolbox                    → ToolboxPage（工具箱）
/projects                   → ProjectsGuidePage（项目指南）
/setup                      → SetupGuidePage（环境搭建）
/growth                     → PersonalGrowthPage（个人成长）
/health                     → HealthPage（健康）
/books/:slug                → BookNotesPage（读书笔记）
```

---

## 5. 布局系统

```
AppLayout
├── TopBar（顶部导航，含 logo + 导航 tab + 主题切换）
├── [算法页] Sidebar（侧边栏，算法目录树，桌面内嵌 / 手机抽屉）
├── [指南页] SidebarRailToggle（侧栏收起/展开按钮）
├── main
│    └── <Outlet /> → 具体页面内容
└── [手机] MobileBottomNav（底部 5 tab 导航）
```

响应式断点：
- phone: ≤640px → 抽屉式侧栏 + 底部导航
- ipad: 641-1024px → 内嵌侧栏（默认收起）
- desktop: >1024px → 内嵌侧栏（默认展开）

---

## 6. Context（全局状态）职责

| Context | 文件 | 职责 |
|---------|------|------|
| ThemeContext | contexts/ThemeContext.jsx | 明/暗主题切换，支持 View Transitions 动画 |
| AuthContext | contexts/AuthContext.jsx | Supabase GitHub OAuth 登录，用户状态 |
| ProgressContext | contexts/ProgressContext.jsx | 收藏、完成状态、测验分数，本地+云端同步 |
| AchievementsContext | contexts/AchievementsContext.jsx | 成就解锁状态 |
| StepContext | contexts/StepContext.jsx | 算法步骤播放控制（上一步/下一步/播放/暂停） |

---

## 7. 算法模块分类

| 分类 key | 名称 | 算法数量 |
|----------|------|---------|
| sorting | 排序算法 | 10 |
| graph | 图算法 | 9 |
| tree | 树结构 | 4 |
| dp | 动态规划 | 5 |
| backtracking | 回溯算法 | 1 |
| pageReplacement | 页面置换 | 3 |
| diskScheduling | 磁盘调度 | 3 |
| string | 字符串匹配 | 3 |
| dataStructures | 数据结构 | 7 |
| network | 计算机网络 | 3 |
| security | 网络安全 | 2 |
| co | 计算机组成 | 3 |
| cpuScheduling | CPU 调度 | 2 |
| synchronization | 进程同步 | 2 |
| database | 数据库 | 5 |
| compiler | 编译原理 | 6 |

---

## 8. Supabase 数据库表

| 表名 | 用途 | 主键 |
|------|------|------|
| user_progress | 用户收藏/完成状态 | (user_id, slug) |
| user_quiz_scores | 测验成绩 | (user_id, slug) |
| notes | 用户笔记 | id (uuid) |
| user_streaks | 连续学习天数 | user_id |
| user_achievements | 成就解锁记录 | (user_id, achievement_id) |
| user_path_progress | 学习路径进度 | (user_id, path_id) |

所有表启用 Row Level Security，用户只能读写自己的数据。

---

## 9. 构建与部署

### 开发
```bash
npm run dev          # 启动开发服务器
npm run test         # 运行测试
npm run lint         # ESLint 检查
npm run check        # lint + test + build 全量检查
```

### 生产构建
```bash
npm run build        # Vite 生产构建
```

构建产物分包策略（vite.config.js）：
- `vendor-react`: React + React DOM + React Router
- `vendor-supabase`: Supabase JS SDK
- `vendor-tone`: Tone.js 音频库
- `vendor-markdown`: react-markdown + remark/rehype
- `vendor-helpers`: Babel helpers

### 部署
- 平台：Vercel
- 配置：vercel.json（SPA fallback 到 index.html）
- 环境变量：`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`（可选）

---

## 10. 关键设计模式

1. **算法与 UI 分离**: `src/algorithms/` 纯函数，`src/components/playgrounds/` 纯 UI，通过 `algoFn` prop 连接
2. **Playground 注册表**: `playgroundRegistry.js` 用 `import.meta.glob` 自动发现，新增 Playground 无需手动注册
3. **渐进式云端**: Supabase 可选，未配置时自动降级为纯 localStorage 模式
4. **延迟加载**: 所有页面组件 `lazy()` 导入，Playground 组件按需加载
5. **数据聚合**: `src/data/algorithms.js` 用 `import.meta.glob` 自动收集学科文件，新增学科无需改聚合器
