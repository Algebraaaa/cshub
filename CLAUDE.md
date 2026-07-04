# CS Hub · Development Conventions

Project: 计算机专业开放学习平台，React 19 + Vite 8 + Tailwind v4 + 可选 Supabase。

## 📁 关键目录

```
src/
├── algorithms/<subject>/        纯算法（返回步骤数组）
├── components/
│   ├── home/                    HomePage 拆出的 sections
│   ├── learning/                算法详情页相关组件
│   ├── playgrounds/             每种 viz 一个 Playground（86 个）
│   └── profile/                 ProfilePage 拆出的板块
├── contexts/                    Auth / Progress / Achievements / Theme / Step
├── data/
│   ├── algorithms.js            算法元数据（待拆，C1）
│   ├── algorithms/<subject>.js  按学科拆分后的入口（进行中）
│   ├── quizzes.js               每个算法 3 题选择题
│   ├── paths.js                 学习路径定义
│   ├── achievements.js          徽章规则
│   └── subjects.js              7 学科 + CATEGORY_TO_SUBJECT 映射
├── pages/                       路由页面
└── layout/                      AppLayout / TopBar / Sidebar
```

## 🎨 样式约定 ⚠️

**新组件强制使用 Tailwind**，可读性大幅高于 inline style。
老组件保留 inline style 直到下次重构经过该文件。

### Tailwind token（来自 `@theme` in `index.css`）

| Tailwind class | 对应 CSS 变量 |
|---|---|
| `bg-surface bg-surface-mid bg-surface-strong` | --surface / --surface-2 / --surface-3 |
| `bg-bg bg-elev` | --bg / --bg-elev |
| `text-fg text-fg-muted text-fg-faint` | --text-primary / --text-secondary / --text-tertiary |
| `border-border-soft border-border-strong border-glass-border` | --border / --border-strong / --glass-border |
| `text-accent bg-accent-soft border-accent-border` | --accent / --accent-soft / --accent-border |
| `text-success / -warning / -danger / -info` | --green / --yellow / --red / --blue |
| `rounded-glass-sm/md/lg/xl` | --r-sm/md/lg/xl |

### 复用的 className utility（来自 `@layer components`）

| Class | 用途 |
|---|---|
| `.glass-card` | 主卡片容器（panel/section 容器） |
| `.glass-card-sm` | 紧凑卡片 |
| `.toolbar-btn` / `.toolbar-btn-active` | 工具栏/Tab 按钮 |
| `.section-eyebrow` | 大写小标题（"学科门类" 这类）|
| `.icon-btn` | 32x32 图标按钮 |
| `.btn-primary` / `.btn-ghost` | 主/次按钮 |

### 动态颜色（如学科 gradient）

学科色、路径色等运行时动态的颜色仍走 inline `style={{ background: subject.gradient }}`，
这是合理例外。

## 🧩 新增算法步骤

1. **算法函数**（纯函数返回步骤数组）→ `src/algorithms/<subject>/<name>.js`
2. **元数据 + 学习内容** → `src/data/algorithms.js`（待拆分后改为 `src/data/algorithms/<subject>.js`）
   - 必须字段：slug, name, nameEn, category, difficulty, fn, viz, timeComplexity, spaceComplexity, stable, inPlace, description, intuition, pseudocode, code{cpp,python}, applications
3. **Playground** → `src/components/playgrounds/<Name>Playground.jsx`
4. 注册到 `src/components/learning/AlgorithmPlaygroundFor.jsx` switch
5. **课后题** → `src/data/quizzes.js`（3 题选择题）
6. 若是新 category → `src/data/subjects.js` 的 `CATEGORY_TO_SUBJECT` 加映射

新增算法只动 ~3 个文件，详情页 / 学科页 / Sidebar / 搜索面板自动列出。

## 🎬 Playground 编写约定

- 用 `useStepController(steps)` hook 管理播放/单步
- SVG 节点用 `<g style={{ transform: 'translate(...)', transition: 'all 0.3s' }}>`，不要绑 `cx`/`cy` 直接动
- 节点 id 必须稳定（不能用值/索引重生成），否则失去过渡动画
- 颜色变化用 `fill transition`
- 顶部使用 `<Toolbar>` + `<ToolbarBtn>` 做 preset 切换
- 底部使用 `<StepController>` 渲染 scrubber + 控制
- 计划在里程碑 D 抽 `PlaygroundShell` 高阶组件统一以上 boilerplate

## 🔐 Supabase 可选

无 `VITE_SUPABASE_URL` 时项目以单机模式运行（localStorage 持久化）。配置后自动启用：
- 用户进度跨设备同步（LWW 合并，见 `src/services/storage/SyncService.js`）
- 公开笔记浏览
- 徽章云端持久化

表结构与 RLS 策略见 `supabase/schema.sql`。

## 🌐 路由

```
/                            HomePage（精简版：Hero + 7 学科 + 工具与指南抽屉）
/subject/:subjectId          SubjectPage
/algo/:slug                  AlgorithmPage（Header + Viz + Tab 区）
/algo/:slug#tab=quiz         直达指定 Tab
/algo/:slug?path=xxx         路径上下文（带 prev/next 导航）
/path · /path/:id            学习路径列表 / 详情
/profile                     个人主页（徽章/进度/热力图/推荐）
/{guide-name}                各类指南页（在 TopBar "更多"菜单内）
```

## 🚀 启动

```bash
npm install
npm run dev          # http://localhost:5173
npm run build
npm run lint
```

可选 Supabase：复制 `.env.example` → `.env.local` 填入凭证。
