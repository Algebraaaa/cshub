import GuideLayout from '../components/guide/GuideLayout'
import { InfoCard, StepCard, CompareTable, ResourceCard } from '../components/guide/GuideComponents'

const META = {
  icon: '🤖',
  tag: 'AI 工具指南',
  title: 'Claude Code & Codex 实战手册',
  subtitle: '不讲大道理，只给命令、Prompt、避坑。三分钟上手，三十分钟干活。',
  gradientFrom: '#0f0c29',
  gradientTo: '#302b63',
  stats: [
    { icon: '⌨️', label: 'CLI / 桌面 / VSCode' },
    { icon: '🧩', label: 'Skills · Hooks · MCP' },
    { icon: '📋', label: '可复制任务卡' },
    { icon: '⏱️', label: '15 分钟读完' },
  ],
}

const SECTIONS = [
  { icon: '🗺️', title: '工具速览：5 秒选一个', content: <SectionOverview /> },
  { icon: '📸', title: '客户端截图导览（中英对照）', content: <SectionScreenshots /> },
  { icon: '⌨️', title: 'Claude Code：终端里的全栈搭子', content: <SectionClaudeCode /> },
  { icon: '🚀', title: 'Codex：OpenAI 的同款套路', content: <SectionCodex /> },
  { icon: '⚔️', title: 'Claude Code vs Codex 怎么选', content: <SectionCompare /> },
  { icon: '📋', title: '任务卡模板：复制就能用', content: <SectionTaskCard /> },
  { icon: '🚧', title: '踩过的坑，你别再踩', content: <SectionPitfalls /> },
]

export default function AIGuidePage() {
  return <GuideLayout meta={META} sections={SECTIONS} />
}

// ─── Section: Overview ────────────────────────────────────────────────────────

const TOOLS = [
  { name: 'Claude Code',   org: 'Anthropic', icon: '⌨️', color: '#d97706', tagline: '终端 Agent，本文主角',     price: 'API 按量 / Pro $20', best: '改多文件、跑命令、长任务' },
  { name: 'Codex',         org: 'OpenAI',    icon: '🚀', color: '#10a37f', tagline: '终端 Agent，本文另一主角', price: 'ChatGPT Plus 含',     best: '云端并行 + 本地操刀' },
  { name: 'Cursor',        org: 'Anysphere', icon: '🖱️', color: '#3b82f6', tagline: 'AI 原生 IDE',              price: 'Pro $20/月',           best: '边写边补全 + 仓库问答' },
  { name: 'GitHub Copilot',org: 'GitHub',    icon: '🐙', color: '#6e40c9', tagline: 'IDE 行内补全',             price: '学生免费',             best: 'Tab 补全、写文档' },
  { name: 'ChatGPT',       org: 'OpenAI',    icon: '🧠', color: '#10a37f', tagline: '通用对话',                 price: 'Plus $20/月',          best: '查概念、骂报错' },
  { name: 'Claude.ai',     org: 'Anthropic', icon: '🎭', color: '#d97706', tagline: '通用对话 + Projects',      price: 'Pro $20/月',           best: '读长代码、写文档' },
]

function SectionOverview() {
  return (
    <div>
      <p style={p}>
        本文只讲两件事：<strong>Claude Code</strong> 和 <strong>Codex</strong>，因为它们才是 2026 年真正能替你干活的 Agent。其他工具一张表搞定。
      </p>
      <div style={grid(260)}>
        {TOOLS.map((t) => (
          <div key={t.name} style={toolCard(t.color)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{t.org}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.color, marginBottom: 6 }}>{t.tagline}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong style={{ color: '#34d399' }}>最适合：</strong>{t.best}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>{t.price}</div>
          </div>
        ))}
      </div>
      <InfoCard type="tip" title="一句话总结">
        要 <strong>实时 Tab 补全</strong> → Copilot / Cursor。要 <strong>"帮我把这个任务做完"</strong> → Claude Code / Codex。前者打字快，后者活做完。
      </InfoCard>
    </div>
  )
}

// ─── Section: Claude Code ─────────────────────────────────────────────────────

function SectionClaudeCode() {
  return (
    <div>
      <InfoCard type="info" title="它是什么">
        Claude Code 是一个 <strong>能读你整个代码库、能执行命令、能改文件</strong> 的 AI Agent。你在终端说"修这个 bug"，它真的会 grep、改代码、跑测试、回报结果。
      </InfoCard>

      <h3 style={h3}>三个版本，按场景选</h3>
      <CompareTable
        headers={['版本', '怎么装', '适合场景']}
        rows={[
          ['CLI（终端）',    'npm install -g @anthropic-ai/claude-code',                                '主力姿势，长任务、跑命令、远程 SSH 都能用'],
          ['桌面端（Desktop）','官网下载 Claude.ai 桌面应用，自带 Claude Code',                          '不想开终端、想要 GUI 文件树和 diff 视图'],
          ['VSCode 插件',    'VSCode 扩展市场搜 "Claude Code"',                                          '边写代码边唤起 Agent，diff 直接在编辑器内 review'],
          ['JetBrains 插件', 'JetBrains 插件市场搜 "Claude Code"',                                       'IDEA / PyCharm / WebStorm 用户'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>30 秒上手</h3>
      <pre style={codeBlock}>{`# 1. 装
npm install -g @anthropic-ai/claude-code

# 2. 在项目目录启动
cd your-project
claude

# 3. 第一次进项目，让它写项目记忆
/init

# 4. 直接说人话
> 读一下这个仓库，告诉我入口、路由、构建命令是什么
> 修复 src/api.js 里的超时报错，改完跑 npm test`}</pre>

      <h3 style={{ ...h3, marginTop: 28 }}>必学的斜杠命令</h3>
      <CompareTable
        headers={['命令', '作用', '什么时候用']}
        rows={[
          ['/init',        '扫描仓库生成 CLAUDE.md（项目记忆）',         '第一次进新项目'],
          ['/clear',       '清空当前对话上下文',                         '聊太长、想换话题前清一下省 token'],
          ['/compact',     '压缩历史保留要点',                           '长任务做了 1 小时，想接着干又不想丢上下文'],
          ['/resume',      '恢复上一次的会话',                           '不小心关了终端、想接着上次干'],
          ['/review',      '让 Claude 审 PR 或当前 diff',                '提 PR 前自检'],
          ['/cost',        '看当次会话花了多少钱',                       '怀疑自己烧钱了'],
          ['/model',       '切换底模（Opus / Sonnet / Haiku）',          '简单任务用 Haiku 省钱，复杂用 Opus'],
          ['/agents',      '管理子代理（subagent）',                     '让专用 Agent 跑测试、跑 lint'],
          ['/mcp',         '管理 MCP 服务器',                            '接 Notion / GitHub / Linear 等外部工具'],
          ['/permissions', '改文件操作和命令的权限白名单',                '减少烦人的二次确认'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 28 }}>CLAUDE.md：项目记忆怎么写才有用</h3>
      <p style={p}>
        <strong>不要</strong>写"本项目使用 React"——这它自己能看出来。<strong>只写</strong>它光读代码看不出来的东西：业务约束、跑命令、禁改文件、风格偏好。
      </p>
      <pre style={codeBlock}>{`# 项目：React + Vite 算法可视化站

## 命令
- 启动：cd algo-viz && npm run dev
- 构建：npm run build（提交前必跑）
- 没有测试套件，构建通过即视为 OK

## 规则
- 新增页面必须复用 GuideLayout
- 不要改 public/screenshots/ 下的截图
- 算法实现写在 src/algorithms/，必须返回步骤数组
- 颜色用 CSS 变量 --accent / --surface，不要硬编码 hex

## 风格
- 解释面向零基础学生，少术语多比喻
- 中文注释，代码英文`}</pre>

      <h3 style={{ ...h3, marginTop: 28 }}>🧩 Skills：把 Claude 变成专家</h3>
      <p style={p}>
        <strong>Skill 是带说明书的能力包</strong>。比如装一个 <code style={inlineCode}>pdf</code> skill，Claude 就懂怎么解析/生成 PDF；装 <code style={inlineCode}>xlsx</code> skill，它就能读写 Excel。Anthropic 官方仓库已经有几十个开箱即用的 skill。
      </p>
      <CompareTable
        headers={['Skill 名', '能干什么']}
        rows={[
          ['pdf',                '读 PDF、抽文本、填表单、合并切分、OCR'],
          ['xlsx / pptx / docx', '直接生成或编辑 Office 文件，不靠 Python 拼装'],
          ['skill-creator',      '让 Claude 自己写新 skill 给自己用'],
          ['engineering:debug',  '结构化调试流程：复现 → 隔离 → 诊断 → 修复'],
          ['engineering:code-review','按安全 / 性能 / 正确性三维 review 代码'],
          ['engineering:incident-response','跑事故响应流程，最后产出 postmortem'],
          ['cockroachdb:*',      '一整套 CockroachDB DBA / 开发者技能'],
        ]}
      />
      <pre style={codeBlock}>{`# 触发方式：直接说话，Claude 自己挑 skill
> 把这个 PPT 转成 PDF 并加水印         # 自动调用 pptx + pdf
> review 一下这个 PR 的安全风险         # 自动调用 engineering:code-review
> 给我创建一个翻译公司术语表的 skill    # 自动调用 skill-creator

# 你也可以显式调用
> /skill pdf 把 docs/ 下所有 PDF 合并成一份`}</pre>
      <InfoCard type="tip" title="Skills 的关键认知">
        Skill ≠ Prompt 模板。它是一个 <strong>文件夹</strong>，里面有 SKILL.md（描述什么时候用）+ 脚本 + 资源。Claude 看到任务符合描述就自己加载。<strong>自己写 skill</strong> 是把团队最佳实践沉淀进 AI 最快的方式。
      </InfoCard>

      <h3 style={{ ...h3, marginTop: 28 }}>🪝 Hooks：在事件点上自动跑命令</h3>
      <p style={p}>
        Hook 是配在 <code style={inlineCode}>~/.claude/settings.json</code> 里的脚本钩子。比如"每次 Claude 写完代码自动跑 prettier"，或者"它要执行危险命令前先给我看一眼"。
      </p>
      <pre style={codeBlock}>{`// ~/.claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "prettier --write $CLAUDE_FILE_PATHS" }]
      }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "notify-send 'Claude 干完了'" }] }
    ]
  }
}`}</pre>

      <h3 style={{ ...h3, marginTop: 28 }}>🔌 MCP：让 Claude 连上你的工具栈</h3>
      <p style={p}>
        MCP（Model Context Protocol）= AI 版的 USB 协议。装一个 MCP server，Claude 就能直接读你的 Notion / Linear / GitHub / Postgres / Figma。
      </p>
      <CompareTable
        headers={['MCP 服务器', '装上之后能干嘛']}
        rows={[
          ['github',     '直接查 issue、改 PR、读 review 评论'],
          ['linear',     '从 Linear 拉任务、改状态、写评论'],
          ['notion',     '把会议纪要存进 Notion，或读取已有页面'],
          ['postgres',   '让它直接查你的数据库（只读模式更安全）'],
          ['filesystem', '给 Claude 限定一个项目外目录的访问权'],
          ['playwright', '让 Claude 跑浏览器自动化、截图、测 UI'],
        ]}
      />
      <pre style={codeBlock}>{`# 装一个 MCP server
claude mcp add github

# 在会话里直接说
> 把仓库 anthropic/sdk 最近 5 个 open PR 列一下，找出阻塞最久的
> 在 Linear 把 ENG-421 状态改成 In Review`}</pre>

      <h3 style={{ ...h3, marginTop: 28 }}>🤖 Subagents：开分身干并行活</h3>
      <p style={p}>
        长任务时主 Agent 上下文会爆，<strong>Subagent</strong> 把一部分工作丢给独立的子会话——它干完只回报结论，不污染主上下文。
      </p>
      <pre style={codeBlock}>{`> 用 Explore subagent 找出所有用到 useEffect 的组件
> 用 general-purpose subagent 跑一遍完整 build 并把所有 warning 列给我

# 自己定义一个 subagent（写在 .claude/agents/test-runner.md）：
---
name: test-runner
description: 跑 npm test，定位失败用例，给出最小复现
tools: Bash, Read, Grep
---
你只做一件事：跑测试，找失败，定位文件。不要修代码。`}</pre>
    </div>
  )
}

// ─── Section: Codex ───────────────────────────────────────────────────────────

function SectionCodex() {
  return (
    <div>
      <InfoCard type="info" title="它是什么">
        Codex 是 OpenAI 的 Agent 产品线，套路和 Claude Code 几乎一样：终端能跑、IDE 能跑、还有一个 <strong>云端版本</strong> 能并行跑多个任务（比如同时让 3 个 Agent 用不同方案改同一个 bug，最后挑 diff 最干净的）。
      </InfoCard>

      <h3 style={h3}>三种形态</h3>
      <CompareTable
        headers={['形态', '怎么用', '适合场景']}
        rows={[
          ['Codex CLI',     'npm install -g @openai/codex && codex',     '本地终端，主力'],
          ['Codex IDE',     'VSCode / Cursor / JetBrains 插件',           '边写边调，diff 在编辑器内 review'],
          ['Codex Cloud',   'chatgpt.com/codex 连 GitHub 仓库',           '云端跑长任务、并行跑多方案、自动开 PR'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>30 秒上手 CLI</h3>
      <pre style={codeBlock}>{`# 1. 装
npm install -g @openai/codex

# 2. 登录（用 ChatGPT 账号）
codex --login

# 3. 进项目
cd your-project
codex

# 4. 直接说话
> Explain this repo
> Fix the failing test in tests/auth.spec.ts and run the suite`}</pre>

      <h3 style={{ ...h3, marginTop: 28 }}>三档自治模式</h3>
      <CompareTable
        headers={['模式', '它能干啥', '什么时候开']}
        rows={[
          ['--suggest（默认）',  '只读 + 提建议，啥都要你点同意',  '第一次接触陌生项目'],
          ['--auto-edit',        '自动改文件，跑命令仍需确认',    '小修小补、改样式、加组件'],
          ['--full-auto',        '改文件 + 跑命令全自动',          '修构建失败、补测试、长任务，前提 git 必须干净'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 28 }}>☁️ Codex Cloud：并行才是杀手锏</h3>
      <p style={p}>
        在 chatgpt.com/codex 绑 GitHub 仓库后，每个任务都在 <strong>独立的云端沙箱</strong> 里跑：
      </p>
      <CompareTable
        headers={['玩法', '怎么用']}
        rows={[
          ['一题三解',         '同一个任务交给 3 个 Agent 并行做，对比 diff 选最干净的'],
          ['长跑任务',         '迁移、批量重构这种 1 小时起的活，丢云端别占本地终端'],
          ['自动开 PR',        'Agent 跑完直接推分支、开 PR、附上自测说明'],
          ['手机也能用',       'ChatGPT App 里就能下任务，路上脑子一热让它先干着'],
        ]}
      />

      <InfoCard type="warning" title="开 full-auto 之前">
        必须做两件事：① <strong>git status 是干净的</strong>（出问题能 reset）；② <strong>项目目录之外它不该有访问权</strong>（用 sandbox 或者 Docker 隔离）。
      </InfoCard>
    </div>
  )
}

// ─── Section: Compare ─────────────────────────────────────────────────────────

function SectionCompare() {
  return (
    <div>
      <CompareTable
        headers={['维度', 'Claude Code', 'Codex']}
        rows={[
          ['底模强项',     '推理 / 长上下文 / 重构（Sonnet 4.x、Opus）',  '代码补全 / 工具调用 / 速度（GPT-5 系列）'],
          ['上下文长度',   '200K+，能塞下整个中型仓库',                    '较长，但更靠工具检索而非塞满'],
          ['Skills 生态',  '官方 + 社区一堆，可自己写',                    '主要靠 Custom GPT / Prompt 包'],
          ['Hooks',        '原生支持事件钩子',                              '靠 Cloud 端 webhook / Actions'],
          ['MCP',          '一等公民，最丰富的 server 生态',                '逐步对接中'],
          ['云端并行',     '靠脚本 / GitHub Action 自己拼',                '原生 Codex Cloud，并行天然好'],
          ['IDE 集成',     'VSCode / JetBrains 官方插件',                  'VSCode / Cursor / JetBrains 插件'],
          ['计费',         'API 按量，Pro 套餐有额度',                      'ChatGPT Plus / Pro 含额度'],
        ]}
      />
      <InfoCard type="tip" title="我的实际用法">
        <strong>本地长任务 + 多文件改动</strong>：Claude Code（Skills + MCP 太香）。
        <strong>云端并行 + 自动开 PR</strong>：Codex Cloud（手机下单，回来挑 diff）。
        两个都用，不互斥。
      </InfoCard>
    </div>
  )
}

// ─── Section: Task Card ───────────────────────────────────────────────────────

function SectionTaskCard() {
  return (
    <div>
      <p style={p}>
        Vibe Coding 不是甩个"帮我搞定"就让 AI 乱写。下面这份任务卡是我自己每次开新活都会先填的，把它原样粘进 Claude Code / Codex 都好使。
      </p>
      <pre style={codeBlock}>{`# 任务：[一句话目标，例如 "给首页加暗色模式切换按钮"]

## 背景
- 技术栈：React 19 + Vite + TS
- 当前文件：src/layout/TopBar.jsx
- 设计要求：图标按钮，点击切换 html.dataset.theme
- 不要动：现有 CSS 变量命名、Sidebar 组件

## 验收
- npm run build 通过
- 切换后刷新页面状态保留（localStorage）
- 移动端 ≤768px 仍正常显示

## 流程（严格按顺序）
1. 先读相关文件，把计划告诉我（列要改的文件 + 为什么）
2. 等我说"go"再改
3. 一次只做一个改动，改完跑 npm run build
4. 最后总结：改了啥、怎么验、有什么没做完`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>5 步标准流</h3>
      {[
        { number: 1, title: '写清目标和验收',  children: '没有验收标准 = 没有终点。AI 也不知道啥叫"做完"。' },
        { number: 2, title: '先检索再开工',    children: '官方文档 + GitHub issue 翻一下，把关键链接贴给 AI，别让它瞎猜 API。' },
        { number: 3, title: '强制要计划',      children: '"先列要改的文件 + 风险 + 验证命令，等我确认再动手"。' },
        { number: 4, title: '小步 + 验证',     children: '每改一处立刻跑 build / test / 浏览器看一眼。失败立刻回滚。' },
        { number: 5, title: '看 diff 才合并',  children: '检查有没有：无关改动、删错文件、硬编码密钥、过度抽象。' },
      ].map((s, i) => <StepCard key={i} {...s} color="#38bdf8" />)}
    </div>
  )
}

// ─── Section: Pitfalls ────────────────────────────────────────────────────────

function SectionPitfalls() {
  return (
    <div>
      {[
        { number: 1, title: '不要泄密',         children: 'API Key、数据库密码、公司源码不要粘给 AI 对话框。本地 Agent 也要看：CLAUDE.md 别 commit 进公开仓库。' },
        { number: 2, title: 'full-auto 前 git 必须干净', children: '出问题能 git reset --hard 救回来。否则它一通乱改你哭都来不及。' },
        { number: 3, title: 'AI 会自信地胡说',  children: '函数名、API 签名、版本号这种事实必须去官方文档核对。Claude 也会编。' },
        { number: 4, title: '面试不能靠它',     children: '白板编程、口述算法还是得自己会。AI 是教练不是替身。' },
        { number: 5, title: '作业谨慎用',       children: '高校已经普及 AI 检测。让它教你 ≠ 让它替你交。' },
        { number: 6, title: '别让上下文爆炸',   children: '长任务记得 /compact，无关上下文记得 /clear，子任务用 subagent 隔离。' },
      ].map((s, i) => <StepCard key={i} {...s} color="#f87171" />)}

      <h3 style={{ ...h3, marginTop: 24 }}>官方资料（看一手的）</h3>
      <ResourceCard title="Claude Code 官方文档" url="https://docs.claude.com/en/docs/claude-code/overview" desc="安装、Skills、Hooks、MCP、Subagents、Settings 全套" tag="官方" tagColor="#d97706" />
      <ResourceCard title="Anthropic Skills 仓库" url="https://github.com/anthropics/skills" desc="官方开源 skill 集合，可以直接抄学写法" tag="官方" tagColor="#d97706" />
      <ResourceCard title="MCP 协议与 Server 列表" url="https://modelcontextprotocol.io/" desc="协议文档 + 社区维护的 MCP server 目录" tag="协议" tagColor="#8b5cf6" />
      <ResourceCard title="Codex 官方入门" url="https://help.openai.com/en/articles/11096431-openai-codex-cli-getting-started" desc="CLI 安装 + suggest / auto-edit / full-auto 三档" tag="官方" tagColor="#10a37f" />
      <ResourceCard title="Codex Cloud" url="https://platform.openai.com/docs/codex/overview" desc="云端并行 + 自动 PR 工作流" tag="官方" tagColor="#10a37f" />
    </div>
  )
}

// ─── Section: Screenshots ─────────────────────────────────────────────────────

const SHOTS = [
  {
    src: '/claude-code-guide/06-claudeCLI.png',
    title: 'Claude Code · CLI（终端原版）',
    en: 'CLI — Terminal',
    desc: '所有 Claude Code 形态的"祖宗"。一行 `claude` 进入会话，能跑命令、读文件、改代码、装 MCP、用 Skills。桌面端 Code 模式和 VSCode 插件本质上是它的 GUI 壳。',
    notes: [
      { en: 'PS E:\\...\\algo-viz> claude', zh: '在项目根目录敲 claude', tip: '进入项目目录后输入 `claude` 启动。当前目录就是它的工作区，能看到所有文件。' },
      { en: 'Claude Code v2.1.138',  zh: '版本号',           tip: '更新很频繁，过期了它会自己提示升级。Windows 上用 `npm i -g @anthropic-ai/claude-code@latest`。' },
      { en: 'Welcome back EldenRing!',zh: '欢迎横幅',         tip: '识别到你的账号信息，确认账号没串。多账号场景看这里。' },
      { en: 'Opus 4.7 · Claude Pro', zh: '当前模型 · 套餐',   tip: '显示底模和计费来源。会话内 `/model` 可切。' },
      { en: 'Tips for getting started', zh: '上手提示',       tip: '第一次进项目就照着做：先 `/init` 让它写 CLAUDE.md。' },
      { en: "What's new",            zh: '更新日志',          tip: '每次启动列最近 3 条变更。看到新功能直接试。' },
      { en: '/release-notes for more', zh: '完整发布日志',     tip: '想看历史变更敲这个命令。' },
      { en: '> Try "write a test…"', zh: '输入提示符',         tip: '`>` 后直接说人话。灰色占位符是 Claude 给的灵感，按 Tab 直接采纳。' },
      { en: '? for shortcuts',       zh: '快捷键帮助',         tip: '敲 `?` 弹快捷键浮层（Ctrl+C 中断、Ctrl+D 退出、↑ 历史命令等）。' },
      { en: '/ide for Visual Studio Code', zh: '一键挂到 VSCode', tip: '检测到本机有 VSCode 时显示。敲 `/ide` 把当前会话推到 VSCode 插件里，文件 diff 直接在编辑器看。' },
    ],
    demo: {
      title: '实战演示 · 从启动到改完一个 bug',
      code: `# 第一步：进项目
PS E:\\Project\\algo-viz> claude

# 第二步：首次使用，让它生成项目记忆
> /init
✓ Analyzing repo... wrote CLAUDE.md (87 lines)

# 第三步：派活
> 首页 Hero 在 ≤768px 时文字溢出，定位原因并修，改完跑 npm run build
● 我先 grep 一下 Hero 相关样式...
● 找到 src/pages/HomePage.jsx:42 的 .hero-title 没设 max-width
● 计划：给 .hero-title 加 max-width:90vw + word-break:break-word
  改 1 个文件，预计 30 秒，需要确认吗？(y/n)
> y
● Edit src/pages/HomePage.jsx ✓
● Running: npm run build
● ✓ built in 4.2s
● 修好了。验证：浏览器开 chrome devtools, toggle device toolbar → iPhone SE。

# 第四步：切到 VSCode 看 diff
> /ide
✓ Attached to Visual Studio Code (window: algo-viz)`,
    },
  },
  {
    src: '/claude-code-guide/05-claude.ai.png',
    title: 'claude.ai · 网页版',
    en: 'Web App',
    desc: '浏览器打开就能用，Pro 账号 $20/月。最轻量的入口，适合查概念、读代码、写文档。',
    notes: [
      { en: 'New chat',  zh: '新建对话',     tip: '开全新会话，不携带历史上下文。' },
      { en: 'Search',    zh: '搜索历史',     tip: '在过往对话里搜关键词，找回上次的结果。' },
      { en: 'Projects',  zh: '项目',         tip: '把一组文件 + 系统提示词打包，每次对话自动带入。适合"专门做某事"的长期会话，比如"算法可视化站维护"。' },
      { en: 'Code',      zh: '代码空间',     tip: '网页版 Claude Code 入口（云端沙箱），不用本地装环境也能让 Claude 改代码。' },
      { en: 'Customize', zh: '自定义',       tip: '改 Claude 的回答风格、语气、默认偏好，整账号生效。' },
      { en: 'Design',    zh: '设计',         tip: '专门做视觉/UI 设计的工作模式，会调用 Artifacts 直接预览。' },
      { en: 'Type / for skills', zh: '输入 / 触发 Skills', tip: '在输入框敲 "/" 唤起 Skills 菜单（pdf / xlsx / pptx 等），这是 Skills 最直接的触发方式。' },
      { en: 'Opus 4.7 ⌄', zh: '模型切换',  tip: '右下角下拉切底模。简单任务 Haiku 省钱，复杂任务 Opus，常规用 Sonnet。' },
      { en: 'Code / Write / Learn',  zh: '快捷模式按钮',  tip: '一键切到对应任务的预设系统提示词，省得自己写。' },
      { en: 'From Drive / Gmail',    zh: '外部连接',      tip: '已授权的话可以直接让 Claude 读你的 Google Drive / Gmail，背后是 MCP-like 集成。' },
    ],
    demo: {
      title: '实战演示 · 用 Skills 把一摞资料变成 PPT',
      code: `# 场景：老师发了 3 份 PDF 资料，让你周一汇报

你：[拖入 3 个 PDF] /pdf 把这三份资料的核心观点提炼成大纲
Claude: ✓ 用 pdf skill 解析中...
        资料 A 主张 X；资料 B 反驳 X 提出 Y；资料 C 折中。
        建议大纲：背景 → 三种观点对比 → 我的结论 → Q&A

你：/pptx 按这个大纲生成 8 页 ppt，深色主题，每页放一句要点 + 一个对比表
Claude: ✓ 用 pptx skill 生成中...
        已生成 lecture.pptx（8 页，含 2 个对比表），点击下载

要点：输入框敲 "/" 自己跳菜单，Claude 会按文件类型自动选 skill。
不需要你记 skill 名，更不需要你装 Python。`,
    },
  },
  {
    src: '/claude-code-guide/01-chat.png',
    title: 'Claude 桌面端 · Chat 模式',
    en: 'Desktop App — Chat Mode',
    desc: '官网下的桌面应用，自带三个 Tab：Chat / Cowork / Code。Chat 就是网页版的本地壳，但能调用本地文件、桌面通知、剪贴板。',
    notes: [
      { en: 'Chat tab',     zh: 'Chat 标签页',   tip: '默认对话模式，跟网页版几乎一样，胜在原生快捷键和系统集成。' },
      { en: 'Cowork tab',   zh: 'Cowork 标签页', tip: '协作任务模式（详见下一张图），让 Claude 像同事一样把一个任务从头干到尾。' },
      { en: 'Code tab',     zh: 'Code 标签页',   tip: 'Claude Code 的桌面入口（详见第 3 张图），打开本地仓库直接改代码。' },
      { en: 'New chat',     zh: '新建对话',       tip: '开新会话。快捷键通常是 Ctrl/Cmd + N。' },
      { en: 'Projects',     zh: '项目',           tip: '同网页版，绑定文件 + 系统提示。' },
      { en: 'Artifacts',    zh: '产物',           tip: '过去对话中 Claude 生成的可运行代码 / 图表 / 文档卡片，集中管理。' },
      { en: 'Customize',    zh: '自定义',         tip: '调风格、语气、人称、偏好。' },
      { en: 'Recents',      zh: '最近对话',       tip: '历史会话列表，点击恢复。' },
      { en: 'Opus 4.7 ⌄',   zh: '模型切换',       tip: '同网页版。' },
    ],
    demo: {
      title: '实战演示 · Projects 当作"长期记忆库"',
      code: `# 场景：你要长期维护一个算法可视化站，每次开新对话不想重复说背景

1. 点 Projects → New Project → 命名 "AlgoViz 维护"
2. 上传 5 个关键文件：
     - CLAUDE.md（项目规则）
     - src/data/algorithms.js（元数据结构）
     - src/components/playgrounds/SortingPlayground.jsx（参考实现）
     - package.json
     - 设计稿截图.png
3. 在 Project 系统提示框写：
     "我在维护一个 React + Vite 算法可视化站。
      新增算法的标准流程：① 在 src/algorithms/ 写步骤生成函数
      ② 在 algorithms.js 加元数据 ③ 复用现有 Playground 类型。
      代码风格：函数式 React、CSS 变量、JetBrains Mono 字体。"

之后每次开新对话直接说"加一个希尔排序"，
Claude 自动带着这些上下文回答，不用每次贴文件。

省 token，省你脑子。`,
    },
  },
  {
    src: '/claude-code-guide/02-Cowork.png',
    title: 'Claude 桌面端 · Cowork 模式',
    en: 'Desktop App — Cowork Mode',
    desc: '"Let\'s knock something off your list" —— Cowork 把 Claude 当协作同事用：下一个任务，它在后台跑，跑完通知你。适合做"我现在不想盯着，但需要它干完"的活。',
    notes: [
      { en: 'New task',       zh: '新建任务',       tip: '下达一个具体任务（不是聊天），Claude 会拆解、执行、汇报。' },
      { en: 'Projects',       zh: '项目',           tip: '任务可以挂在某个 Project 下，共享上下文。' },
      { en: 'Scheduled',      zh: '定时任务',       tip: '设定时执行：每天早上拉一遍 GitHub issue 摘要，每周一汇总周报。' },
      { en: 'Live artifacts', zh: '实时产物',       tip: '看 Claude 当前任务正在生成的中间产物（代码、表格、文档）。' },
      { en: 'Dispatch · Beta',zh: '调度（公测）',   tip: '把多个子任务并行分派给多个 Agent，类似云端并行。' },
      { en: 'Customize',      zh: '自定义',         tip: '调 Cowork 的工作风格与默认验收标准。' },
      { en: 'Work in a project', zh: '挂到项目里', tip: '下任务时选项目，自动带入项目文件和规则。' },
      { en: 'Ask',            zh: '提问模式',       tip: '快速切换：不想真的执行任务，只想问问怎么做。' },
    ],
    demo: {
      title: '实战演示 · Scheduled 每天自动跑周报',
      code: `# 场景：每周一早上 9 点要给老板汇报上周进度

New task → Schedule → 选 "每周一 09:00"

任务内容（粘进 New task 输入框）：
————————————————————————
你是我的研发助理。请执行：
1. 用 MCP github 工具列出 owner=me 的仓库
   在过去 7 天里 closed 的所有 PR
2. 对每个 PR 抽：标题、改动行数、合并日期、最大改动文件
3. 按"功能/修复/重构"分类
4. 输出 Markdown 周报，控制在 200 字以内
5. 跑完用 MCP slack 发到 #my-weekly 频道
————————————————————————

→ 每周一早上你打开电脑就看到 Slack 推送好了。
→ Live artifacts 里能回看每周生成过程的中间产物。
→ 不满意改 prompt 重新跑，不用每周手动 copy paste。

这就是 Cowork 真正的杀手锏：定时 + 多工具串联 + 异步执行。`,
    },
  },
  {
    src: '/claude-code-guide/03-Code.png',
    title: 'Claude 桌面端 · Code 模式（= Claude Code）',
    en: 'Desktop App — Code Mode (Claude Code Desktop)',
    desc: '这就是 Claude Code 的桌面 GUI。底部输入框选一个本地目录，它就能读你的仓库、执行命令、改文件。和 CLI 同源，但有 GUI 文件树和 diff 预览。',
    notes: [
      { en: 'New session',  zh: '新建会话',     tip: '开一个新的 Claude Code 工作会话，相当于 CLI 里跑 `claude` 一次。' },
      { en: 'Routines',     zh: '例行任务',     tip: '保存的常用 prompt / 工作流，一键复用（"跑构建并修首个报错"）。' },
      { en: 'Customize',    zh: '自定义',       tip: '配 hooks、权限、默认 model 等，相当于改 settings.json 但有 GUI。' },
      { en: 'More',         zh: '更多',         tip: 'MCP server 管理、Skills 列表、Subagents 等高级功能在这里展开。' },
      { en: 'Recents',      zh: '最近会话',     tip: '历史会话，按项目分组，点击 resume。' },
      { en: 'Local · 📁 AlgorithmVisualization', zh: '本地 · 当前项目目录', tip: '当前会话绑定的本地仓库路径。点击文件夹图标可切换项目。' },
      { en: '↗ 文件夹箭头', zh: '换项目',       tip: '一键切到另一个本地仓库。' },
      { en: 'Describe a task or ask a question', zh: '输入任务或提问', tip: '直接说人话："修 src/api.js 的超时报错，跑测试"。这就是 CLI 里 `>` 提示符后的位置。' },
      { en: 'Accept edits', zh: '自动接受改动', tip: '开了之后 Claude 改文件不再每次问你（等于 CLI 的 --auto-edit）。关掉则每个改动都要按 y。' },
      { en: 'Opus 4.7 · Medium', zh: '模型 · 推理强度', tip: 'Medium 是默认推理强度，可切 High（更慢更准）/ Low（更快）。' },
    ],
    demo: {
      title: '实战演示 · 用 Routines 一键修构建失败',
      code: `# 场景：build 经常因为各种小问题挂掉，你想"我懒得每次重复打那一长串"

1. 点 Routines → New Routine → 命名 "auto-fix-build"
2. 内容粘这段：
————————————————————————
你的任务：
1. 运行 npm run build
2. 如果失败，读 stderr 抽出第一个 error
3. 定位到对应文件:行
4. 改最小修复
5. 重新 build，循环最多 3 次
6. 还是失败就停下，给我汇报
不允许：改 package.json、删文件、改测试
————————————————————————
3. 保存。绑快捷键 Ctrl+Shift+B（在 Customize 里设）

之后每次构建挂了：
→ 按 Ctrl+Shift+B
→ Code 模式开新 session 自动跑这个 routine
→ 通常 2 分钟内修好

注意 Accept edits 开成 ON（不然每步都要按 y）。
对照本机 git 干净的前提下用，搞砸能 reset。`,
    },
  },
  {
    src: '/claude-code-guide/04-claude-for-vscode.png',
    title: 'VSCode 插件 · Claude Code for VSCode',
    en: 'VSCode Extension',
    desc: '在 VSCode 扩展市场搜 "Claude Code" 安装。右侧多出一个面板，diff 直接在编辑器内 review，改完点 Accept 入库。最适合"边写代码边唤起 Agent"。',
    notes: [
      { en: 'Claude Code panel', zh: 'Claude Code 侧边面板', tip: '插件主面板，右侧打开。这里跑的会话和 CLI / 桌面端共享历史。' },
      { en: 'CLAUDE.md · /docs', zh: '项目记忆 / 文档标签', tip: '面板顶部 Tab，能快速查看当前项目的 CLAUDE.md 和加载到上下文里的文档。' },
      { en: 'Ask Claude to edit…', zh: '让 Claude 改代码', tip: '直接打需求，Claude 改完产 diff，编辑器里左红右绿对照。' },
      { en: 'Ask before edits',    zh: '改动前先问我', tip: '开着 = 每次改动按 y 确认（推荐新项目用）。关掉 = full-auto。' },
      { en: '左侧 VSCode 项目树',  zh: '工作区文件',  tip: 'Claude 能感知到你当前打开/选中的文件，问"重构这个组件"时它知道指什么。' },
      { en: '中间欢迎页',          zh: '快捷入口',    tip: '"开始使用 VS Code"、"演练"、"Get Started"——首次打开的引导卡片。' },
      { en: '终端栏（底部）',      zh: '集成终端',    tip: 'Claude 跑命令时输出会直接显示在 VSCode 终端，方便你看实时日志。' },
    ],
    demo: {
      title: '实战演示 · 选中代码就地重构',
      code: `# 场景：你在 SortingPlayground.jsx 里看见一坨重复的 useState，想抽个 hook

1. 在编辑器选中重复的那段代码（5 行 useState）
2. 右侧 Claude Code 面板，Ask before edits 设为 OFF（要节奏快）
3. 在面板输入框打：
   "把选中这段抽成一个 useArrayInput hook，
    放到 src/hooks/useArrayInput.js。
    保持现有行为，更新原文件的引用。"
4. 回车
   → 面板里出现两个文件改动：
     ✚ src/hooks/useArrayInput.js (new)
     ± src/components/playgrounds/SortingPlayground.jsx (-12 +3)
   → 点 file 名直接跳转，diff 在编辑器左红右绿
5. 看一眼，没问题点 "Accept all"，否则点 "Reject" 或单文件 reject

实战节奏：选代码 → 说人话 → 看 diff → Accept。
比 ChatGPT 复制粘贴快 10 倍，比 CLI 多了"diff 直接看"的爽感。

如果 hook 名字不喜欢，直接在面板回复 "重命名 useArrayInput 为 useArrayState"
Claude 会改完所有引用，再次给你 diff。`,
    },
  },
]

function SectionScreenshots() {
  return (
    <div>
      <InfoCard type="info" title="一图胜千言">
        Claude 全家桶其实就 <strong>4 个入口</strong>：网页版 / 桌面应用（含 Chat / Cowork / Code 三模式）/ VSCode 插件 / CLI（终端，前面章节讲过）。下面每张图都按编号标注，<strong>左边英文 = 界面原词</strong>，<strong>右边中文 = 干啥用的</strong>。
      </InfoCard>

      {SHOTS.map((shot, idx) => (
        <div key={idx} style={shotCard}>
          <div style={shotHeader}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: 1 }}>{shot.en}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{shot.title}</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>图 {idx + 1} / {SHOTS.length}</div>
          </div>
          <div style={shotImageWrap}>
            <img src={shot.src} alt={shot.title} style={shotImage} loading="lazy" />
          </div>
          <p style={{ ...p, marginTop: 14, marginBottom: 12 }}>{shot.desc}</p>
          <div style={notesGrid}>
            {shot.notes.map((n, i) => (
              <div key={i} style={noteItem}>
                <div style={noteBadge}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 4 }}>
                    <code style={inlineCode}>{n.en}</code>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{n.zh}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{n.tip}</div>
                </div>
              </div>
            ))}
          </div>
          {shot.demo && (
            <div style={demoBlock}>
              <div style={demoTitle}>
                <span style={{ fontSize: 13 }}>🎯</span>
                <span>{shot.demo.title}</span>
              </div>
              <pre style={demoCode}>{shot.demo.code}</pre>
            </div>
          )}
        </div>
      ))}

      <InfoCard type="tip" title="顺序怎么选">
        新手路径：<strong>claude.ai 网页版</strong>（先熟悉对话） → <strong>桌面端 Chat / Cowork</strong>（开始让它干活） → <strong>VSCode 插件</strong>（边写边唤起） → <strong>CLI / Code 模式</strong>（长任务、远程、自动化）。前两步几乎零学习成本，后面才需要看下一章的命令清单。
      </InfoCard>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const p = { fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }
const h3 = { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '20px 0 12px 0' }
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
const inlineCode = {
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  padding: '1px 6px',
  borderRadius: 4,
  background: 'var(--surface-2)',
  color: 'var(--accent-light)',
}
const grid = (min) => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 14, margin: '20px 0' })
const toolCard = (color) => ({
  padding: 16,
  borderRadius: 12,
  background: 'var(--surface)',
  border: `1px solid ${color}33`,
})
const shotCard = {
  margin: '20px 0 28px',
  padding: 18,
  borderRadius: 14,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
}
const shotHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  marginBottom: 12,
  gap: 12,
}
const shotImageWrap = {
  borderRadius: 10,
  overflow: 'hidden',
  border: '1px solid var(--border)',
  background: 'var(--surface-2)',
}
const shotImage = {
  display: 'block',
  width: '100%',
  height: 'auto',
}
const notesGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: 10,
}
const noteItem = {
  display: 'flex',
  gap: 10,
  padding: '10px 12px',
  borderRadius: 8,
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
}
const noteBadge = {
  flexShrink: 0,
  width: 22,
  height: 22,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  color: '#fff',
  fontSize: 11,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
const demoBlock = {
  marginTop: 16,
  borderRadius: 10,
  overflow: 'hidden',
  border: '1px solid rgba(139, 92, 246, 0.3)',
  background: 'linear-gradient(135deg, rgba(139,92,246,0.04), rgba(236,72,153,0.04))',
}
const demoTitle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 14px',
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--accent-light)',
  background: 'rgba(139, 92, 246, 0.08)',
  borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
  letterSpacing: 0.3,
}
const demoCode = {
  margin: 0,
  padding: '14px 16px',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  lineHeight: 1.75,
  color: 'var(--text-secondary)',
  whiteSpace: 'pre-wrap',
  overflowX: 'auto',
}
