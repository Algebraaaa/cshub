import { Link } from 'react-router-dom'
import GuideLayout from '../components/guide/GuideLayout'
import { InfoCard, StepCard, CompareTable, ResourceCard } from '../components/guide/GuideComponents'

const META = {
  icon: '🗺️',
  tag: 'AI 时代路线图',
  title: 'AI 时代 CS 学生破局路线图',
  subtitle: '基础仍是地基，AI 是杠杆，项目和解决问题能力决定差异化。',
  gradientFrom: '#0f5132',
  gradientTo: '#38ef7d',
  stats: [
    { icon: '🧠', label: 'AI 时代能力栈' },
    { icon: '🎓', label: '4 年路线' },
    { icon: '🚀', label: '项目破局' },
    { icon: '💼', label: '求职闭环' },
  ],
}

const SECTIONS = [
  { icon: '🔎', title: '先看清变化：AI 时代程序员还值钱吗', content: <SectionReality /> },
  { icon: '🧱', title: '破局能力栈：基础 + AI + 项目 + 表达', content: <SectionStack /> },
  { icon: '🎓', title: '大学四年路线：每一年怎么用 AI 加速', content: <SectionFourYears /> },
  { icon: '🤖', title: 'AI 工具工作流：从会用到用出结果', content: <SectionWorkflow /> },
  { icon: '🚀', title: '项目破局：别再做同质化 CRUD', content: <SectionProjects /> },
  { icon: '🧭', title: '信息检索与持续学习', content: <SectionLearning /> },
  { icon: '💼', title: '求职破局：简历、面试、GitHub', content: <SectionCareer /> },
  { icon: '⏱️', title: '6/12/24 个月行动路线', content: <SectionPace /> },
]

export default function RoadmapPage() {
  return <GuideLayout meta={META} sections={SECTIONS} />
}

function In({ to, children }) {
  return (
    <Link to={to} style={ls}>
      {children}
    </Link>
  )
}

function SectionReality() {
  return (
    <div>
      <InfoCard type="info" title="先把变化说清楚">
        AI 会替代一部分低质量搬砖：照教程复制、不会定位问题、只会写样板代码的人会越来越难。但 AI 不会替你定义问题、判断取舍、理解业务、设计系统、承担结果。真正值钱的是“能用 AI 把复杂问题做成结果”的人。
      </InfoCard>

      <CompareTable
        headers={['变化', '被削弱的能力', '更值钱的能力']}
        rows={[
          ['代码生成变便宜', '只会照着需求写 CRUD', '能拆需求、定边界、写验收、看 diff'],
          ['资料获取变快', '只会等老师讲、收藏教程不动手', '会检索官方文档、GitHub issue、英文资料并快速验证'],
          ['项目同质化更严重', 'Todo、电商、管理系统换皮', '能把真实问题做成可部署、可展示、可讲述的作品'],
          ['面试更看深度', '背八股但讲不出项目取舍', '能讲清“遇到什么问题、怎么定位、为什么这样解”'],
          ['工具迭代很快', '只会某个框架的固定套路', '能持续学习，快速迁移到新工具链'],
        ]}
      />

      <h3 style={h3}>AI 时代的破局公式</h3>
      <pre style={codeBlock}>{`基础能力 × AI 杠杆 × 真实项目 × 清晰表达 = 差异化竞争力

基础能力：数据结构、OS、网络、数据库、工程化
AI 杠杆：Claude Code / Codex / Copilot / 搜索与文档能力
真实项目：可部署、可演示、有 README、有问题复盘
清晰表达：简历 STAR、面试项目讲述、GitHub 作品集`}</pre>

      <InfoCard type="tip" title="判断自己有没有破局">
        不是“我用了 AI”，而是你能不能拿出一个结果：一个上线项目、一次 PR、一个高质量 README、一段可复盘的 bug 定位过程、一场能讲 10 分钟的项目面试。
      </InfoCard>
    </div>
  )
}

function SectionStack() {
  return (
    <div>
      <p style={p}>能力栈不要堆名词。每一层都要有训练方式、可见产出和验证标准。</p>
      <CompareTable
        headers={['层级', '要练什么', '怎么练', '产出 / 验证', '本站入口']}
        rows={[
          ['基础', '数据结构、算法、OS、网络、数据库', '先看可视化建立直觉，再手写代码和刷题', '能讲复杂度、边界条件、系统原理', <In to="/algo/bubblesort">算法库</In>],
          ['AI', '会用 Agent 做真实开发，而不是聊天', 'Claude Code / Codex 读仓库、改代码、跑构建', '每次任务有计划、diff、验证结果', <In to="/ai">AI 工具实战</In>],
          ['项目', '真实技术栈、部署、文档、问题复盘', '把普通 CRUD 升级为有场景、有架构、有演示的项目', 'README、演示图、架构图、线上地址', <In to="/projects">项目指南</In>],
          ['协作', 'GitHub、PR、Issue、Code Review', '每个项目都用分支、commit、PR 管理', 'GitHub 首页能被面试官 30 秒看懂', <In to="/github">GitHub 指南</In>],
          ['表达', '简历、项目讲述、白板编程、行为面', '每个项目写 STAR，AI 模拟面试反复练', '能 1 分钟讲清背景，10 分钟讲深项目', <In to="/interview">面试指南</In>],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>每周最小闭环</h3>
      {[
        { number: 1, title: '学一个硬基础', children: '例如 LRU、事务隔离、TCP 拥塞控制。要求能画图讲清楚。' },
        { number: 2, title: '用 AI 做一次实践', children: '让 Claude Code / Codex 帮你读代码、补测试、修 bug，但必须自己看 diff。' },
        { number: 3, title: '沉淀到项目或笔记', children: '写 README、博客、issue 复盘或 GitHub commit，形成可见资产。' },
        { number: 4, title: '模拟一次表达', children: '用 AI 扮演面试官，让它追问你项目和基础知识。' },
      ].map((s, i) => <StepCard key={i} {...s} color="#38bdf8" />)}
    </div>
  )
}

function SectionFourYears() {
  return (
    <div>
      <InfoCard type="info" title="路线图不是课程表">
        每年都要有“学习输入 + AI 加速 + 项目产出 + 求职准备”。只学课本不够，只做项目也会空心化。
      </InfoCard>

      <CompareTable
        headers={['阶段', '基础主线', 'AI 加速方式', '作品集产出', '求职准备']}
        rows={[
          ['大一', 'C / Python、数据结构入门、离散数学', '用 AI 解释概念、生成练习题、review 你的手写代码', '1 个命令行小工具 + 1 份数据结构笔记', 'GitHub 建好主页，学会 commit / PR'],
          ['大二', '算法、OS、网络、数据库、Web 基础', '用 Codex/Claude Code 读开源项目，帮你定位 bug 和补测试', '1 个前后端分离项目 + 部署地址', '开始写项目 README 和技术复盘'],
          ['大三上', '方向分叉：前端/后端/AI/系统选一条', '用 Agent 做工程化升级：鉴权、缓存、CI、部署、文档', '1 个能讲 10 分钟的进阶项目', '简历 v1、模拟面试、暑期实习投递准备'],
          ['大三下', '八股、刷题、系统设计、实习技术栈', '用 AI 模拟面试、复盘每次失败、补项目短板', '项目 v2 + 实习经历沉淀', '暑期实习和秋招提前批'],
          ['大四', '查漏补缺、毕设、目标公司技术栈', '用 AI 准备面试表达、整理作品集、优化简历', 'GitHub 作品集最终版', '秋招正式批、谈薪、三方、入职准备'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>每学期验收标准</h3>
      <CompareTable
        headers={['学期', '最低产出', '加分产出']}
        rows={[
          ['大一上', '能独立写 C/Python 小程序', '把学习笔记整理到 GitHub'],
          ['大一下', '实现链表、栈、队列、树、哈希', '用可视化或博客解释一个数据结构'],
          ['大二上', '刷题 100+，会基本 Web 后端', '部署一个带数据库的项目'],
          ['大二下', '能讲 OS/网络/数据库核心概念', '给项目加测试、CI、部署文档'],
          ['大三上', '简历项目能讲清架构和难点', '项目获得 star、PR 或真实用户反馈'],
          ['大三下', '暑期实习投递和面试复盘', '实习项目能写进简历'],
          ['大四上', '秋招主流程跑完', 'GitHub 作品集和简历完全闭环'],
          ['大四下', '毕设和入职技术栈准备', '写一篇“从学生到工程师”的复盘文章'],
        ]}
      />
    </div>
  )
}

function SectionWorkflow() {
  return (
    <div>
      <p style={p}>AI 工具不是“替你写代码”的按钮，而是一套开发工作流。重点是把任务定义、检索、实现、验证、复盘串起来。</p>

      <h3 style={h3}>一次标准 AI 开发任务</h3>
      {[
        { number: 1, title: '写任务卡', children: '目标、背景、限制、验收标准先写清楚。没有验收，AI 不知道什么时候算做完。' },
        { number: 2, title: '先检索资料', children: '查官方文档和 GitHub issue，把关键链接贴给 AI，避免它凭空编 API。' },
        { number: 3, title: '让 Agent 出计划', children: '要求列出要改哪些文件、风险点、验证命令。计划不清，不让它动代码。' },
        { number: 4, title: '小步改 + 看 diff', children: 'Claude Code / Codex 改完后必须看 diff。你负责判断，不是 AI 负责背锅。' },
        { number: 5, title: '跑构建和页面验证', children: '至少跑 build/test；前端页面再用浏览器看一眼。' },
        { number: 6, title: '写复盘', children: '记录根因、修复方式、以后如何快速判断同类问题。' },
      ].map((s, i) => <StepCard key={i} {...s} color="#10a37f" />)}

      <h3 style={{ ...h3, marginTop: 24 }}>工具分工</h3>
      <CompareTable
        headers={['工具', '最好用的场景', '不要怎么用']}
        rows={[
          ['Copilot', '行内补全、写样板代码、补注释', '不要让它决定架构'],
          ['Claude Code', '读仓库、多文件重构、跑命令、长期任务', '不要在没看 diff 的情况下接受大改动'],
          ['Codex', '本地修 bug、云端并行、多方案对比、自动 PR', '不要在 git 不干净时开 full-auto'],
          ['ChatGPT / Claude.ai', '查概念、总结资料、模拟面试、写文档', '不要把它当官方文档'],
          ['GitHub', '作品集、issue、PR、开源协作', '不要只上传 zip 或一次性大 commit'],
        ]}
      />

      <pre style={codeBlock}>{`任务卡模板：

任务：[一句话目标]
背景：[技术栈 / 当前问题 / 相关链接]
限制：[不要改哪些文件 / 保持哪些行为]
验收：[npm run build 通过 / 页面无溢出 / README 更新]

流程：
1. 先读代码并给计划
2. 等我确认再改
3. 每次只做最小改动
4. 改完跑验证命令
5. 总结改动、验证结果和残余风险`}</pre>

      <ResourceCard title="AI 工具实战" url="/ai" desc="Claude Code、Codex、Skills、MCP、任务卡和避坑。" tag="本站" />
      <ResourceCard title="GitHub 入门指南" url="/github" desc="仓库、commit、PR、Pages、Actions、Codespaces 和 Copilot。" tag="本站" />
    </div>
  )
}

function SectionProjects() {
  return (
    <div>
      <InfoCard type="warning" title="同质化项目为什么没人看">
        图书管理、学生管理、Todo、电商模板不是不能做，而是必须升级。面试官想看的不是“你会 CRUD”，而是你有没有真实场景、工程取舍、上线能力和复盘能力。
      </InfoCard>

      <CompareTable
        headers={['普通项目', 'AI 时代升级方向', '可展示产出']}
        rows={[
          ['图书管理系统', '加搜索推荐、借阅数据分析、权限审计、导入导出', '在线 demo、权限设计图、数据看板截图'],
          ['Todo App', '升级成 AI 学习任务管理：自动拆任务、周报、复盘', '任务流截图、AI 任务卡、README 动图'],
          ['电商项目', '加秒杀压测、库存一致性、缓存策略、订单状态机', '压测报告、架构图、故障复盘'],
          ['博客系统', '加 Markdown 编辑器、全文搜索、AI 摘要、RSS', '部署地址、写作流、搜索性能对比'],
          ['算法可视化', '加交互动画、Quiz、代码高亮、学习进度', '可视化截图、复杂度解释、用户路径'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>好项目的 6 个验收</h3>
      {[
        { number: 1, title: '能访问', children: '有线上地址或可一键本地运行。README 写清启动方式。' },
        { number: 2, title: '能看懂', children: '首屏截图、功能动图、架构图、技术栈说明齐全。' },
        { number: 3, title: '能讲深', children: '至少 3 个技术难点：性能、并发、状态、缓存、部署、权限等。' },
        { number: 4, title: '有 AI 使用痕迹', children: '不是写“用了 AI”，而是展示 AI 如何加速调试、测试、文档或数据处理。' },
        { number: 5, title: '有真实复盘', children: '写清一次 bug 或性能问题：怎么发现、怎么定位、怎么修、怎么验证。' },
        { number: 6, title: 'GitHub 像作品集', children: 'commit 清晰、PR 可读、README 专业、issues 记录路线图。' },
      ].map((s, i) => <StepCard key={i} {...s} color="#a855f7" />)}

      <ResourceCard title="项目指南" url="/projects" desc="项目选题、README、部署、演示图、简历写法和面试讲法。" tag="本站" />
    </div>
  )
}

function SectionLearning() {
  return (
    <div>
      <p style={p}>AI 时代学习速度变快，但错误信息也更多。会检索、会验证、会复盘，比收藏 100 个教程更重要。</p>

      <CompareTable
        headers={['问题类型', '优先信息源', '搜索方式', '验证方式']}
        rows={[
          ['API 用法', '官方文档', '技术名 + 版本 + official docs', '写最小 demo 跑通'],
          ['报错', 'GitHub issue / Stack Overflow', '完整错误关键词 + 版本号', '复现并确认根因'],
          ['框架选择', '官方文档 + 真实项目源码', 'framework comparison production case', '做一个小功能对比'],
          ['论文 / AI 概念', '论文原文 + 课程笔记', 'arxiv title + code + survey', '复现核心例子'],
          ['工程实践', '开源仓库、PR、issue', 'topic + GitHub issue + best practices', '在项目里小步落地'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>高质量检索 Prompt</h3>
      <pre style={codeBlock}>{`我正在学习/解决一个技术问题，请先帮我制定检索方案，不要直接编答案。

背景：
- 技术栈：
- 版本：
- 目标：
- 报错或现象：

请输出：
1. 5 组英文搜索关键词
2. 优先看的官方文档页面
3. GitHub issue / Stack Overflow 应该搜什么
4. 哪些信息可能已经过时
5. 最小验证 demo 怎么写`}</pre>

      <InfoCard type="tip" title="持续学习的节奏">
        每周固定做三件事：读一篇官方文档或源码、解决一个真实小问题、写一段复盘。长期来看，这比追热点更稳。
      </InfoCard>
    </div>
  )
}

function SectionCareer() {
  return (
    <div>
      <p style={p}>AI 时代求职不是把“熟练使用 ChatGPT”写进简历，而是把 AI 加持后的产出写出来。</p>

      <CompareTable
        headers={['场景', '低质量写法', '破局写法']}
        rows={[
          ['简历技能', '熟悉 ChatGPT、Copilot', '使用 Claude Code / Codex 完成测试补齐、重构、CI 修复，并保留 PR 记录'],
          ['项目描述', '使用 AI 完成项目开发', '用 AI 辅助定位构建失败，补充 12 个边界测试，构建耗时降低 30%'],
          ['GitHub', '上传最终代码', '用 issue 管理路线图，用 PR 记录功能迭代，README 有演示和复盘'],
          ['面试表达', 'AI 帮我写了代码', '我负责定义任务和验收，AI 负责生成方案，我通过 diff 和测试验证'],
          ['开源贡献', 'Fork 了项目', '提交 1 个可合并 PR，附复现、修复、测试说明'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>简历项目 STAR 模板</h3>
      <pre style={codeBlock}>{`项目：AI 加持的 [项目名]
S 背景：为什么做这个项目，解决谁的问题
T 目标：核心指标是什么，例如可访问、可部署、可演示、可扩展
A 行动：
  - 设计了哪些模块
  - 遇到什么技术难点
  - 如何使用 AI 工具加速检索、调试、测试或文档
R 结果：
  - 上线地址 / GitHub star / PR / 测试覆盖 / 性能数据
  - 最终能给面试官演示什么`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>面试时怎么讲 AI 使用</h3>
      {[
        { number: 1, title: '先讲你定义的问题', children: '例如“首页移动端溢出”，不是“我让 AI 改样式”。' },
        { number: 2, title: '再讲你怎么约束 AI', children: '给了哪些文件、限制、验收标准、禁止改动项。' },
        { number: 3, title: '讲你如何验证', children: '跑了什么命令、看了什么页面、补了什么测试、如何确认没有副作用。' },
        { number: 4, title: '最后讲复盘', children: '这次问题以后如何更快定位，项目规范如何沉淀到 CLAUDE.md / README。' },
      ].map((s, i) => <StepCard key={i} {...s} color="#f472b6" />)}

      <ResourceCard title="面试指南" url="/interview" desc="简历、八股、白板编程、行为面和 AI 模拟面试。" tag="本站" />
      <ResourceCard title="GitHub 入门指南" url="/github" desc="把 GitHub 做成面试作品集，而不是代码仓库网盘。" tag="本站" />
    </div>
  )
}

function SectionPace() {
  return (
    <div>
      <p style={p}>醒悟时间不同，路线不同。下面三套节奏都以“可验证产出”为目标。</p>

      <h3 style={h3}>6 个月极速版：大三/跨专业补救</h3>
      <CompareTable
        headers={['阶段', '重点', 'AI 用法', '必须产出']}
        rows={[
          ['第 1 月', '主语言 + 数据结构补课', '用 AI 讲概念、出题、review 手写代码', '链表、树、哈希、排序手写仓库'],
          ['第 2 月', 'Web 后端或前端主栈', '用 Agent 读示例项目、解释目录结构', '一个 CRUD 项目上线'],
          ['第 3 月', 'OS / 网络 / 数据库八股', 'AI 连环追问 + 错题复盘', '八股笔记和 20 次模拟问答'],
          ['第 4 月', '项目升级', 'Claude Code/Codex 加测试、CI、文档、部署', '项目 README、架构图、线上 demo'],
          ['第 5 月', '刷题 + 面试表达', 'AI 模拟白板和项目深挖', 'Hot 100 主体完成，项目能讲 10 分钟'],
          ['第 6 月', '投递 + 复盘', '每场面试后让 AI 帮你整理薄弱点', '简历 v2、GitHub 作品集、投递记录'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>12 个月稳健版：大二下/大三上</h3>
      <CompareTable
        headers={['月份', '重点', '必须产出']}
        rows={[
          ['1-2 月', '基础 + 主语言', '数据结构手写仓库 + 50 道题'],
          ['3-4 月', 'Web 工程 + GitHub', '前后端项目 v1 + README'],
          ['5-6 月', 'OS/网络/数据库', '八股笔记 + 项目技术难点补齐'],
          ['7-8 月', '项目破局', 'AI 加持的进阶项目 + 部署 + 文档'],
          ['9-10 月', '面试准备', '简历 v1 + 模拟面试 + Hot 100'],
          ['11-12 月', '实习投递', '投递表 + 复盘文档 + 简历 v2'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>24 个月放松版：大一/大二早规划</h3>
      <CompareTable
        headers={['阶段', '重点', '必须产出']}
        rows={[
          ['大一上', '编程入门 + GitHub', '一个命令行工具 + GitHub 主页'],
          ['大一下', '数据结构 + 可视化理解', '手写数据结构 + 学习笔记'],
          ['大二上', '算法 + Web 入门', '一个带数据库项目'],
          ['大二下', 'OS/网络/数据库 + 部署', '前后端分离项目上线'],
          ['大三上', '方向选择 + 项目升级', '简历项目 v1 + README 专业化'],
          ['大三下', '实习投递 + 面试闭环', '暑期实习 offer 或可复盘投递过程'],
          ['大四', '秋招 + 毕设 + 入职准备', 'offer、作品集、入职技术栈预习'],
        ]}
      />

      <InfoCard type="tip" title="最后的执行原则">
        每个月至少留下一个可见资产：一个 PR、一篇复盘、一版 README、一个部署地址、一次模拟面试记录。没有产出，学习就很难转化成竞争力。
      </InfoCard>

      <ResourceCard title="环境配置" url="/setup" desc="先把开发环境、Git、VS Code、Claude Code 装好。" tag="本站" />
      <ResourceCard title="算法可视化库" url="/algo/bubblesort" desc="用动画建立算法直觉，再去刷题。" tag="本站" />
      <ResourceCard title="AI 工具实战" url="/ai" desc="把 Agent 纳入真实开发流程。" tag="本站" />
      <ResourceCard title="项目指南" url="/projects" desc="把项目做成能展示、能讲述、能面试的作品。" tag="本站" />
      <ResourceCard title="面试指南" url="/interview" desc="简历、八股、白板和行为面闭环。" tag="本站" />
    </div>
  )
}

const p = { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }
const h3 = { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '20px 0 12px 0' }
const ls = { color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600, borderBottom: '1px dashed var(--accent-light)' }
const codeBlock = {
  margin: '14px 0 18px',
  padding: '16px 18px',
  borderRadius: 12,
  background: 'var(--code-bg)',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  lineHeight: 1.75,
  overflowX: 'auto',
  whiteSpace: 'pre-wrap',
}
