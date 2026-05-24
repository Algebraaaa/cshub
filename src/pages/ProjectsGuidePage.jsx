import { Link } from 'react-router-dom'
import GuideLayout from '../components/guide/GuideLayout'
import { InfoCard, StepCard, CompareTable, ResourceCard } from '../components/guide/GuideComponents'

const META = {
  icon: '🚀',
  tag: '实战项目库',
  title: '简历项目从 0 到 1 全攻略',
  subtitle: '别再写"图书管理系统"了。10 个分级推荐 + 完整深拆案例（拿本站当 case）+ 部署 + 写 README + 怎么投。',
  gradientFrom: '#4A00E0',
  gradientTo: '#8E2DE2',
  stats: [
    { icon: '📊', label: '10 个分级项目' },
    { icon: '🛠️', label: '案例完整深拆' },
    { icon: '🚀', label: '4 大部署方案' },
    { icon: '📝', label: 'README 模板' },
  ],
}

const SECTIONS = [
  { icon: '🎯', title: '选题原则：为什么大多数项目没人看',     content: <SectionPrinciples /> },
  { icon: '📊', title: '10 个推荐项目按难度分级',             content: <SectionList /> },
  { icon: '🛠️', title: '深拆案例：本站算法可视化（全流程）', content: <SectionCaseStudy /> },
  { icon: '🚀', title: '部署四件套对比 + 一键上线',           content: <SectionDeploy /> },
  { icon: '📝', title: 'README 模板（直接抄）',              content: <SectionReadme /> },
  { icon: '📹', title: '展示物料：截图 / GIF / Demo 视频',    content: <SectionShowcase /> },
  { icon: '✍️', title: '把项目写进简历：STAR 实战',          content: <SectionResume /> },
]

export default function ProjectsGuidePage() {
  return <GuideLayout meta={META} sections={SECTIONS} />
}

// ─── Section 1: Principles ────────────────────────────────────────────────────

function SectionPrinciples() {
  return (
    <div>
      <InfoCard type="warning" title="先承认一个事实">
        国内大学生作品的 90% 长得一样：图书管理 / 学生信息管理 / Todo App。<strong>面试官 5 秒就划过去</strong>——不是项目不好，是太常见、没辨识度、看不出你的真实水平。
      </InfoCard>

      <h3 style={h3}>好项目的三个特征（满足任意一个就过线）</h3>
      <CompareTable
        headers={['特征', '解释', '例子']}
        rows={[
          ['🎯 解决真实问题',     '你或别人正在用，能讲出"我做这个是因为..."',     '本站（自己上数据结构课没好工具）/ 给社团做的报名小程序'],
          ['🏗️ 用真实技术栈',     '不是 Hello World 级别，含工程化考虑',          'CRUD ≠ 项目；CRUD + 鉴权 + 缓存 + 部署 = 项目'],
          ['📈 有量化结果',       'star 数 / 用户数 / QPS / 减少耗时百分比',       'GitHub 100 star / 服务 500 个同学 / 接口 P99 30ms'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>3 个雷区</h3>
      <CompareTable
        headers={['雷区', '为什么是雷']}
        rows={[
          ['抄 B 站教程做尚硅谷电商', '面试官见过 1000 次了；问你"为什么用 Redis"答不上来'],
          ['追大模型 toC 应用',      '"我用 GPT 接了个客服机器人"——3 行 prompt 的活，技术含量低'],
          ['只做前端 + 假数据',      '没有后端 / 数据库 / 部署的项目，深度永远到不了'],
        ]}
      />

      <InfoCard type="tip" title="判断项目能不能讲 10 分钟">
        自己测试：<strong>不看代码、不看 PPT、对着空白墙</strong>讲一遍。能不能讲 10 分钟不冷场，并回答这 3 个问题：<br />
        1. 你为什么用 X 技术而不是 Y？<br />
        2. 整个系统遇到的最大技术问题是什么？怎么解的？<br />
        3. 量化收益是多少？（用户 / QPS / 性能提升）<br />
        讲不出 = 项目还没真懂 = 简历上写了也没用。
      </InfoCard>
    </div>
  )
}

// ─── Section 2: List ──────────────────────────────────────────────────────────

const PROJECTS = [
  // 入门 3 个
  { tier: '入门', name: '个人博客静态站',  stack: 'Next.js / Astro + Markdown + Vercel',         time: '1 周',   look: '前端基础 + SEO + 部署链路；可以放学习笔记当沉淀', star: '🌱', color: '#34d399' },
  { tier: '入门', name: '终端工具 CLI',     stack: 'Node.js / Python + 一个具体痛点',             time: '3-5 天', look: '把日常重复操作脚本化；命名清晰发到 npm/pypi',     star: '🌱', color: '#34d399' },
  { tier: '入门', name: 'Chrome 浏览器扩展',stack: 'TS + Chrome Extension API',                   time: '1-2 周', look: '"我每次刷 X 都想要 Y"；上架 Web Store',          star: '🌱', color: '#34d399' },
  // 进阶 4 个
  { tier: '进阶', name: '算法可视化（本站类）',     stack: 'React + Vite + 步进控制器',                      time: '2-4 周', look: '把课内知识变工具；像本站这种能给同学用',          star: '🔥', color: '#fbbf24' },
  { tier: '进阶', name: 'Markdown 编辑器 / 笔记应用', stack: 'Tauri 桌面 + CodeMirror + IndexedDB',         time: '3-4 周', look: '本地优先 + 数据持久化；离线可用',                  star: '🔥', color: '#fbbf24' },
  { tier: '进阶', name: '命令行 AI 助手',            stack: 'Go / Rust + OpenAI/Anthropic API + 流式输出', time: '2 周',   look: '解决"开 Claude 网页太重"问题；带 history + skill', star: '🔥', color: '#fbbf24' },
  { tier: '进阶', name: 'CRUD 实战（含完整工程）',   stack: 'Spring Boot + Vue/React + MySQL + Redis + Docker', time: '4-6 周', look: '不是抄教程：自选业务（社团报名 / 二手书交易 / 抢座）+ 部署上线 + 性能压测', star: '🔥', color: '#fbbf24' },
  // 挑战 3 个
  { tier: '挑战', name: '分布式 K-V 存储',           stack: 'Go + Raft + RocksDB',                            time: '2-3 月', look: '吃透 Raft 论文 + MIT 6.824 Lab；做出来就是简历金牌', star: '💎', color: '#a855f7' },
  { tier: '挑战', name: 'Mini Compiler / DB',        stack: 'C++/Rust + LLVM / B+ 树',                        time: '2-3 月', look: '系统方向的硬通货；CMU 15-445 BusTub Lab 起步',     star: '💎', color: '#a855f7' },
  { tier: '挑战', name: 'AI Agent 平台',             stack: 'TS + Next.js + LangChain + 多 MCP server',       time: '1-2 月', look: '让 Agent 操作真实工具（Slack / GitHub / Notion）； deploy 到 Vercel + 公开使用', star: '💎', color: '#a855f7' },
]

function SectionList() {
  return (
    <div>
      <p style={p}>下面 10 个项目按难度分三档。<strong>简历最多放 3 个项目</strong>，建议组合：<em>1 个进阶（撑技术深度）+ 1 个挑战（亮点）+ 1 个入门（杂烩或开源贡献）</em>。</p>

      <CompareTable
        headers={['档', '项目', '主技术栈', '工时', '看点']}
        rows={PROJECTS.map(p => [
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontWeight: 700, color: p.color }}>
            {p.star} {p.tier}
          </span>,
          <strong style={{ color: 'var(--text-primary)' }}>{p.name}</strong>,
          <code style={ic}>{p.stack}</code>,
          p.time,
          p.look,
        ])}
      />

      <InfoCard type="tip" title="选项目流程">
        ① 看看你日常 / 学习生活里有什么"重复 / 烦躁 / 没人做"的事 → ② 在上表里找最近的档位项目 → ③ 把上表的项目"换皮"成你的实际需求（比如不是"博客"是"读书笔记 + AI 总结"）。<strong>定制感越强，越不容易撞车</strong>。
      </InfoCard>
    </div>
  )
}

// ─── Section 3: Case Study ────────────────────────────────────────────────────

function SectionCaseStudy() {
  return (
    <div>
      <InfoCard type="info" title="深拆样本：你正在用的本站">
        本站（CS Hub 算法可视化平台）就是一个标准的"进阶档"项目案例。下面把它从 0 到 1 的完整流程拆给你看。
      </InfoCard>

      <h3 style={h3}>🎯 步骤 1：需求识别</h3>
      <pre style={codeBlock}>{`触发点：大二学数据结构，老师讲红黑树旋转，PPT 静态图根本看不懂。
        网上搜的可视化工具：要么界面老旧（GeeksforGeeks），
        要么收费（VisuAlgo），要么只覆盖几个算法。

定位：做一个面向国内 CS 学生的中文算法可视化站，
      覆盖课内 40+ 算法，包含交互式 Playground + 学习内容 + Quiz。

差异化：开源 + 中文 + 互联本站其他指南（AI / GitHub / 求职）→
        定位不是"算法工具"，是"学习平台"。`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>🛠️ 步骤 2：技术选型</h3>
      <CompareTable
        headers={['领域', '选型', '为什么']}
        rows={[
          ['前端框架',      'React 19',                  '生态最大 / Hooks 心智模型适合状态机；面试占比最高'],
          ['构建工具',      'Vite',                      'esbuild + Rollup，dev 启动 < 1s；比 Webpack 现代'],
          ['路由',          'react-router-dom v7',       '主流；不上 Next.js 因为静态站不需要 SSR'],
          ['状态',          'Context API + localStorage','项目规模小，没必要上 Redux'],
          ['可视化',        '原生 SVG / Canvas',          '不依赖第三方动画库；学习平台需要"可控的步进感"'],
          ['样式',          'CSS Variables + inline style', '小项目快；大项目应该上 CSS Modules'],
          ['部署',          'Vercel + GitHub Pages',     '静态站零成本上线'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>🏗️ 步骤 3：架构拆解</h3>
      <pre style={codeBlock}>{`├─ src/
│  ├─ algorithms/      ← 纯算法实现（按类别分），输出步骤数组
│  │   ├─ sorting/    bubble.js, quick.js, merge.js ...
│  │   ├─ graph/      bfs.js, dijkstra.js, prim.js ...
│  │   ├─ tree/       bst.js, redblack.js ...
│  │   └─ string/     naive.js, kmp.js, rabinkarp.js
│  │
│  ├─ components/
│  │   ├─ playgrounds/  每种 viz 类型一个 Playground
│  │   ├─ learning/     伪代码 / 复杂度 / Quiz / 对比表
│  │   ├─ guide/        Guide 页公共组件
│  │   └─ SortingViz、HeapViz、TreeViz、StringViz ...
│  │
│  ├─ pages/          HomePage / AlgorithmPage / 8 个 Guide 页
│  ├─ data/           algorithms.js（元数据+学习内容）、quizzes.js
│  ├─ contexts/       Progress / Theme / Step
│  ├─ hooks/          useMediaQuery / useStepController
│  └─ layout/         TopBar / Sidebar / AppLayout`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>🚧 步骤 4：踩坑实录</h3>
      <CompareTable
        headers={['问题', '症状', '解法']}
        rows={[
          ['SVG 节点动画卡',      '红黑树旋转时节点位置跳变',          '用 <g style="transform"> 而非 cx/cy 直接绑，加 transition'],
          ['节点 React key 错位', '同一节点多次重渲染状态丢失',        '节点 id 必须稳定（不能用索引或值生成）'],
          ['步骤数组爆内存',      '某些算法 10000 步快照各保存数组拷贝', '步骤里只存"diff"，渲染时累积'],
          ['搜索面板太慢',        '300+ 算法过滤实时打字卡',           '加 debounce + Fuse.js 模糊匹配'],
          ['移动端表格溢出',      '<table> 在 360px 屏幕横向滚出 UI',  '外层 overflow-x:auto + 字体降一档'],
          ['Quiz 答题进度丢失',    '刷新页面后已答题状态没了',          '改用 localStorage + storage 事件跨标签同步'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>📊 步骤 5：数据 / 量化收益</h3>
      <CompareTable
        headers={['指标', '数字']}
        rows={[
          ['代码量',              '~15k 行（含数据）'],
          ['覆盖算法',            '43 个，9 大类别'],
          ['指南页',              '8 个完整指南页（路线图 / AI / GitHub / 面试 / 项目 / 环境 ...）'],
          ['Quiz 题库',           '129 道（43 × 3）'],
          ['首屏 LCP',            '< 1.5s（Vercel CDN）'],
          ['Lighthouse 性能',     '95+'],
          ['工时',                '~3 个月利用周末和晚上'],
        ]}
      />

      <InfoCard type="tip" title="怎么把上面 5 步讲给面试官">
        把上面 5 步浓缩成 <strong>"为什么做 → 选什么栈 → 怎么分模块 → 遇到什么问题怎么解 → 量化结果"</strong> 五段话，就是面试 10 分钟项目讲解的标准结构。
      </InfoCard>
    </div>
  )
}

// ─── Section 4: Deploy ────────────────────────────────────────────────────────

function SectionDeploy() {
  return (
    <div>
      <CompareTable
        headers={['平台', '免费额度', '适合', '部署难度']}
        rows={[
          ['Vercel',         '无限静态站点 / 100GB 流量',         'React / Next.js / Vue / Svelte 静态站',  '⭐ 30 秒上线（GitHub 一键）'],
          ['Cloudflare Pages','无限构建 / 无限请求',              '同 Vercel，但访问国内更快',              '⭐'],
          ['GitHub Pages',    '仓库 1GB / 月 100GB 流量',         '简单静态站；自定义域名免费',             '⭐⭐'],
          ['Railway / Render','500 小时 / 月（容器）',             '后端服务 + 数据库；不用 Docker 也行',    '⭐⭐'],
          ['阿里云 / 腾讯云',  '按量付费（备案）',                  '生产级 / 国内访问 / 备案站',             '⭐⭐⭐⭐'],
        ]}
      />

      <h3 style={h3}>本站部署一行命令</h3>
      <pre style={codeBlock}>{`# 1. 把项目推到 GitHub
cd algo-viz
git init && git add . && git commit -m "init"
gh repo create your-username/algo-viz --public --push --source=.

# 2. Vercel（最简单）
npm i -g vercel
vercel    # 跟着引导选 framework，2 分钟出 URL

# 3. 或者 GitHub Pages
npm install --save-dev gh-pages
# package.json 加：
#   "homepage": "https://your-username.github.io/algo-viz",
#   "scripts": { "deploy": "vite build && gh-pages -d dist" }
npm run deploy

# 4. 自定义域名（可选）
# 买个 .com 域名，DNS 加 CNAME 指向 yourname.github.io 或 vercel.app`}</pre>

      <InfoCard type="warning" title="国内访问优化">
        Vercel / GitHub Pages 在国内时不时被墙。两个方案：<br />
        ① 备份部署到 <strong>Cloudflare Pages</strong>（国内速度还可以）<br />
        ② 项目里加一行"如果加载失败请访问 [镜像 URL]" 容错<br />
        ③ 投简历前确认面试官能访问——简历附带 GitHub 链接也救得回来
      </InfoCard>
    </div>
  )
}

// ─── Section 5: README ────────────────────────────────────────────────────────

function SectionReadme() {
  return (
    <div>
      <p style={p}>一个项目 70% 的命运由 README 决定。<strong>没人会下载下来跑你的项目</strong>，他们 30 秒扫 README 就决定加不加 star。下面是直接能抄的模板。</p>

      <pre style={codeBlock}>{`# 🚀 项目名 (一句话定位)

> 一句话 hook：解决什么具体问题，给什么人用。
> 例："给 CS 学生用的开源算法可视化学习平台，覆盖 43 个课内算法。"

[![Stars](https://img.shields.io/github/stars/USER/REPO?style=social)](https://github.com/USER/REPO)
[![License](https://img.shields.io/github/license/USER/REPO)](LICENSE)
[![Demo](https://img.shields.io/badge/demo-online-green)](https://your-url.vercel.app)

![首屏截图](docs/screenshot-hero.png)

## ✨ 特性

- 🎯 **特性 1**：用 3-7 个字描述，配 emoji 开头
- 🛠️ **特性 2**：每条都讲"给用户带来什么"而不是"用了什么技术"
- ⚡ **特性 3**：3-5 条最佳；超过 7 条没人看完

## 🎬 演示

[👉 在线 Demo](https://your-url.vercel.app)

![演示 GIF](docs/demo.gif)

## 🚀 快速开始

\`\`\`bash
# 1. clone
git clone https://github.com/USER/REPO.git
cd REPO

# 2. 装依赖
npm install

# 3. 启动
npm run dev
# 浏览器打开 http://localhost:5173
\`\`\`

## 🏗️ 技术栈

- **前端**：React 19 + Vite + react-router
- **状态**：Context API + localStorage
- **样式**：CSS Variables（dark/light theme）
- **可视化**：原生 SVG

## 📂 目录结构

\`\`\`
src/
├── algorithms/    # 纯算法实现（输出步骤数组）
├── components/    # UI 组件
├── pages/         # 页面
├── data/          # 算法元数据 + Quiz 题库
└── contexts/      # 全局状态（进度 / 主题）
\`\`\`

## 🎯 路线图

- [x] 排序算法 8 个
- [x] 图算法 9 个
- [x] 字符串匹配 3 个（朴素 / KMP / Rabin-Karp）
- [ ] 计算几何（凸包 / 最近点对）
- [ ] 数论（快速幂 / 欧拉筛）

## 🤝 贡献

欢迎 PR！请先看 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 📜 License

[MIT](LICENSE) © 你的名字`}</pre>

      <InfoCard type="tip" title="README 加分项">
        ✅ 头部 3 张徽章（star / license / 在线 demo）<br />
        ✅ 截图 + GIF 演示（GIF 在前 100 行内）<br />
        ✅ 中英双语（README.md + README.en.md）<br />
        ✅ 路线图用 checkbox 让人感觉"还在维护"<br />
        ❌ 不要写 1000 行的"为什么我做这个项目"——放 BLOG 里
      </InfoCard>

      <ResourceCard title="shields.io 徽章生成" url="https://shields.io/" desc="GitHub README 徽章一键生成。" tag="工具" />
      <ResourceCard title="Awesome README" url="https://github.com/matiassingers/awesome-readme" desc="精选 README 案例集。" tag="参考" />
    </div>
  )
}

// ─── Section 6: Showcase ──────────────────────────────────────────────────────

function SectionShowcase() {
  return (
    <div>
      <p style={p}>面试官扫简历附带的 GitHub 链接 ≈ 5 秒。如果首屏看不到任何视觉物料，直接划过。</p>

      <h3 style={h3}>必备 3 件套</h3>
      <CompareTable
        headers={['物料', '怎么做', '工具']}
        rows={[
          ['首屏截图',            '高清 + 暗色背景 + 突出最有特色的功能',         'macOS 截图 / Windows Snipping Tool / ShareX'],
          ['演示 GIF（≤ 5MB）',    '展示一个完整流程 30 秒内；放在 README 前 100 行', 'LICEcap / Kap / Peek（Linux）'],
          ['在线 Demo URL',        '部署到 Vercel；放在 README 第一行和 about',     'Vercel / Cloudflare Pages'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>加分项（有时间就做）</h3>
      <CompareTable
        headers={['物料', '场景', '工具']}
        rows={[
          ['项目宣传视频 1-2 分钟', '上传 B 站 / YouTube；可放在 README 顶部',     'OBS Studio + 剪映'],
          ['架构图',               '复杂项目必备；用 Excalidraw / Whimsical',     'Excalidraw / Whimsical'],
          ['博客文章',             '"我做这个项目踩了哪些坑"；引流 + 看你能讲',   'Hashnode / 掘金 / 知乎'],
          ['项目网站',             '独立官网 + 文档；本站就是个例子',             'Docusaurus / Nextra / VitePress'],
        ]}
      />

      <InfoCard type="info" title="录 GIF 的小技巧">
        ① 录之前关闭通知 + 整理桌面壁纸<br />
        ② 浏览器开无痕模式，避免书签栏穿帮<br />
        ③ 控制窗口尺寸 1280×720（GIF 友好）<br />
        ④ 录完用 <code style={ic}>gifsicle</code> 或 <code style={ic}>ezgif.com</code> 压到 5MB 以下<br />
        ⑤ 第一帧就是"高潮"——不要前 3 秒空白
      </InfoCard>
    </div>
  )
}

// ─── Section 7: Resume ────────────────────────────────────────────────────────

function SectionResume() {
  return (
    <div>
      <p style={p}>把项目写到简历是最后一步。<strong>4-5 行 STAR，每行都有具体动词和量化数据</strong>。详细简历写作看 <Link to="/interview" style={ls}>面试指南</Link>。</p>

      <h3 style={h3}>项目写法对照（本站为例）</h3>
      <pre style={codeBlock}>{`❌ 烂版本：
算法可视化平台 (个人项目，2024)
- 用 React 开发了一个算法可视化平台
- 实现了排序、图、树等多种算法的可视化
- 添加了 Quiz 功能
- 部署到了 Vercel

✅ STAR 版本：
🚀 CS Hub 算法可视化学习平台 ┃ 个人开源 ┃ 2024.06-至今
   GitHub: https://github.com/USER/algo-viz （⭐ 120 stars）
   Demo: https://csh.vercel.app

  • 【S】数据结构课静态 PPT 难理解，VisuAlgo 等工具收费且覆盖不全
  • 【T】构建一个覆盖国内课内 40+ 算法的免费中文学习平台
  • 【A】① 纯 SVG 动画 + 步进控制器，43 个算法可视化
         ② Context API + localStorage 进度持久化，跨标签同步
         ③ Vite + react-router，首屏 LCP 1.2s（Lighthouse 96 分）
         ④ 自研步骤生成器统一 viz 接口，新增算法成本降低 70%
  • 【R】上线 4 个月获 GitHub 120 star，服务 ~500 名同学
         3 名社区贡献者提 PR；被 [某教授] 课程主页推荐`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>面试时怎么讲</h3>
      {[
        { number: 1, title: '开场（30 秒）', children: '"我做了一个面向 CS 学生的开源算法可视化平台，覆盖 40 多个课内算法，目前 GitHub 120 star，服务 500 名同学。"' },
        { number: 2, title: '动机（30 秒）', children: '"做这个的原因是大二学红黑树时课件看不懂，搜了一圈现有工具要么收费要么覆盖不全。"' },
        { number: 3, title: '技术深度（4 分钟）', children: '挑 1-2 个技术点深聊：例如"统一步骤接口怎么设计的" 或 "SVG 动画性能怎么优化的"。准备能画在白板上的架构图。' },
        { number: 4, title: '踩坑 / 学习（2 分钟）', children: '"最大的坑是 React 渲染时节点 key 不稳定导致动画乱跳，研究了一周才定位到。后来读了 React 文档 reconciliation 那一章。"' },
        { number: 5, title: '量化收益（30 秒）', children: '"上线 4 个月 120 star，3 个贡献者，被某老师课程主页推荐。每周持续维护，最近在加无障碍。"' },
        { number: 6, title: '收尾（30 秒）', children: '"这个项目让我系统理解了 React 渲染机制 + 大型前端工程组织。如果有机会，我希望能把它扩展成支持 OS 和编译原理课的可视化。"' },
      ].map((s, i) => <StepCard key={i} {...s} color="#a855f7" />)}

      <InfoCard type="tip" title="最后冲刺前">
        简历投出前再做一遍这 3 件事：<br />
        ① <Link to="/setup" style={ls}>检查环境</Link>（面试时手撕代码不要卡环境）<br />
        ② <Link to="/algo" style={ls}>复习 Hot 100 高频题</Link>（搭配本站可视化）<br />
        ③ <Link to="/interview" style={ls}>模拟一场面试</Link>（AI prompt 复制即用）
      </InfoCard>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const p = { fontSize: 'var(--fs-md)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-loose)', marginBottom: 'var(--space-4)' }
const h3 = { fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: 'var(--space-5) 0 var(--space-3) 0' }
const ls = { color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600, borderBottom: '1px dashed var(--accent-light)' }
const codeBlock = {
  margin: 'var(--space-3) 0 var(--space-5)',
  padding: 'var(--space-4) var(--space-5)',
  borderRadius: 12,
  background: 'var(--code-bg)',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-sm)',
  lineHeight: 'var(--lh-normal)',
  overflowX: 'auto',
  whiteSpace: 'pre-wrap',
}
const ic = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-xs)',
  padding: '1px 6px',
  borderRadius: 4,
  background: 'var(--surface-2)',
  color: 'var(--accent-light)',
}
