import GuideLayout from '../components/guide/GuideLayout'
import TerminalBlock from '../components/guide/TerminalBlock'
import { InfoCard, StepCard, CompareTable, ResourceCard } from '../components/guide/GuideComponents'

const META = {
  icon: '🐙',
  tag: 'GitHub 入门',
  title: 'GitHub 零基础上手指南',
  subtitle: '从“GitHub 是什么”到注册、建仓库、上传代码、看懂英文界面、提交 Issue 和 Pull Request，按步骤照做即可。',
  gradientFrom: '#24292f',
  gradientTo: '#0969da',
  stats: [
    { icon: '🧭', label: '适合零基础' },
    { icon: '🖼️', label: '英文界面对照' },
    { icon: '⌨️', label: '命令可复制' },
    { icon: '🚀', label: '从注册到协作' },
  ],
}

const SECTIONS = [
  { icon: '🧠', title: '先搞懂 GitHub 是什么', content: <SectionIntro /> },
  { icon: '🔤', title: '英文界面中文速查', content: <SectionVocabulary /> },
  { icon: '📝', title: '注册账号与首页截图', content: <SectionSignup /> },
  { icon: '🏠', title: '登录后主界面怎么看', content: <SectionMainInterface /> },
  { icon: '🔍', title: '如何高效搜索仓库', content: <SectionSearchRepos /> },
  { icon: '⚙️', title: '安装 Git 并配置身份', content: <SectionInstallGit /> },
  { icon: '📦', title: '创建第一个仓库', content: <SectionCreateRepo /> },
  { icon: '⬆️', title: '把本地代码上传到 GitHub', content: <SectionUpload /> },
  { icon: '🧰', title: '网页 / VS Code / Visual Studio 实战入口', content: <SectionEditorWorkflows /> },
  { icon: '🔎', title: '看懂仓库主页截图', content: <SectionRepoTour /> },
  { icon: '🤝', title: 'Issue 与 Pull Request 协作', content: <SectionCollaboration /> },
  { icon: '🚀', title: 'Pages / Actions / Codespaces / Copilot', content: <SectionAdvancedFeatures /> },
  { icon: '🎓', title: '教育优惠认证教程', content: <SectionEducation /> },
  { icon: '🛟', title: 'SSH、常见报错与下一步', content: <SectionTroubleshooting /> },
]

export default function GitHubGuidePage() {
  return <GuideLayout meta={META} sections={SECTIONS} />
}

function SectionIntro() {
  return (
    <div>
      <p style={p}>
        GitHub 可以理解为“程序员的云端项目文件夹 + 版本历史 + 协作平台”。你把代码放上去后，可以随时回看修改记录，也可以让同学、老师、面试官看到你的项目。
      </p>
      <div style={grid}>
        <MiniCard title="Git" desc="本地版本管理工具。负责记录每次修改，就像代码的存档系统。" />
        <MiniCard title="GitHub" desc="云端代码平台。负责托管仓库、展示项目、协作开发和开源贡献。" />
        <MiniCard title="Repository" desc="仓库。一个项目通常对应一个仓库，里面有代码、README、历史记录。" />
      </div>
      <InfoCard type="tip" title="最小学习目标">
        小白第一天只需要掌握 4 件事：创建仓库、clone 到本地、commit 保存修改、push 上传到 GitHub。
      </InfoCard>
    </div>
  )
}

function SectionVocabulary() {
  return (
    <div>
      <p style={p}>GitHub 主界面是英文。先把最常见的按钮和栏目翻译记住，后面跟图操作会轻松很多。</p>
      <CompareTable
        headers={['英文', '中文', '你应该怎么理解']}
        rows={[
          ['Sign up', '注册', '还没有账号时点这里。'],
          ['Sign in', '登录', '已有账号时点这里。'],
          ['Repository / Repo', '仓库', '一个项目的云端文件夹。'],
          ['Code', '代码 / 克隆入口', '看代码、复制 clone 地址、下载 ZIP。'],
          ['Issues', '问题 / 任务', '提 bug、提需求、讨论待办事项。'],
          ['Pull requests', '合并请求', '把某个分支或 fork 的修改申请合并进主项目。'],
          ['Actions', '自动化流程', '自动测试、打包、部署。'],
          ['Projects', '项目看板', '任务管理面板，类似 Trello。'],
          ['Wiki', '项目文档', '更长的说明文档。'],
          ['Fork', '复刻仓库', '把别人的仓库复制到你的账号下，常用于开源贡献。'],
          ['Star', '收藏 / 点星', '表示关注或认可项目，也方便以后找回来。'],
          ['Watch / Notifications', '关注通知', '订阅项目动态。'],
          ['Branch', '分支', '独立开发线，避免直接改坏 main。'],
          ['Commit', '提交记录', '一次带说明的代码存档。'],
          ['README', '项目说明书', '别人打开仓库后最先看的介绍。'],
        ]}
      />
    </div>
  )
}

function SectionSignup() {
  return (
    <div>
      <ScreenshotFigure
        src="/github-guide/01-home-signup.png"
        title="GitHub 首页：注册入口"
        desc="截图来自 GitHub 公开首页。右上角也有 Sign up，页面中间也可能出现邮箱输入框和绿色注册按钮。"
        labels={[
          ['Platform / Solutions / Resources', '平台能力、解决方案、资源入口，新手暂时不用管。'],
          ['Search 图标', '搜索开源项目、用户、代码。'],
          ['Sign in', '登录已有账号。'],
          ['Sign up', '注册新账号。'],
          ['Enter your email', '输入邮箱开始注册。'],
        ]}
      />
      <div>
        {[
          { number: 1, title: '打开官网', children: <>访问 <a href="https://github.com" target="_blank" rel="noreferrer" style={link}>github.com</a>，点击 <strong>Sign up</strong>。</> },
          { number: 2, title: '填写邮箱与用户名', children: <>邮箱建议用常用邮箱；用户名建议简短、英文、长期可用，例如 <code style={code}>zhangsan-dev</code>。</> },
          { number: 3, title: '验证邮箱', children: 'GitHub 会发送验证码或验证链接。收不到时检查垃圾邮件。' },
          { number: 4, title: '先跳过复杂设置', children: '注册过程如果询问用途、团队、计划，选免费个人使用即可。后面都可以改。' },
        ].map(step => <StepCard key={step.number} {...step} />)}
      </div>
      <InfoCard type="warning" title="用户名要认真选">
        用户名会出现在你的主页地址里，例如 <code style={code}>https://github.com/yourname</code>。尽量不要用随机乱码，也不要用过多下划线和数字。
      </InfoCard>
    </div>
  )
}

function SectionMainInterface() {
  return (
    <div>
      <p style={p}>
        注册并登录后，你通常会进入 GitHub Dashboard（仪表盘）。因为 Dashboard 需要登录态，这里用 GitHub 公开页面截图讲解同一套顶部入口，并补充登录后常见区域含义。
      </p>
      <ScreenshotFigure
        src="/github-guide/01-home-signup.png"
        title="GitHub 顶部主界面：英文入口中文对照"
        desc="登录后右上角会变成通知铃铛、加号菜单和头像菜单，但顶部搜索、导航、仓库入口的含义一致。"
        labels={[
          ['GitHub logo', '点击回到 GitHub 首页 / Dashboard。'],
          ['Platform', '平台能力介绍。新手暂时不用频繁点。'],
          ['Solutions', '面向团队、企业、行业的解决方案。'],
          ['Resources', '文档、学习资源、博客、客户案例。'],
          ['Open Source', '开源相关入口。想找开源项目时可看。'],
          ['Enterprise', '企业版入口。个人学习不用管。'],
          ['Pricing', '价格方案。学生认证、免费额度和付费方案可在这里了解。'],
          ['Search icon / Search box', '搜索仓库、代码、用户、Issue。高效搜索的核心入口。'],
          ['Sign in / Avatar menu', '登录后这里会变成头像，点头像可进入 Your profile、Your repositories、Settings。'],
          ['Sign up', '未登录时注册；登录后通常不会显示。'],
        ]}
      />
      <CompareTable
        headers={['登录后常见区域', '中文含义', '小白应该怎么用']}
        rows={[
          ['Dashboard', '仪表盘 / 首页', '看最近访问的仓库、关注项目动态、推荐内容。'],
          ['Top repositories', '你的常用仓库', '快速进入自己最近用的项目。'],
          ['Recent activity', '最近动态', '看你或关注项目最近发生了什么。'],
          ['Pull requests', '合并请求列表', '团队协作时查看别人让你审核的代码。'],
          ['Issues', '问题 / 任务列表', '查看分配给你的任务或你参与的讨论。'],
          ['Notifications', '通知', '看别人 @ 你、PR 审核、Issue 回复。'],
          ['+ New repository', '新建仓库', '创建一个新项目。'],
          ['Your profile', '个人主页', '你的 GitHub 名片，面试官常看这里。'],
          ['Your repositories', '你的仓库', '查看、管理你创建或 fork 的项目。'],
          ['Settings', '账号设置', '改头像、邮箱、SSH Key、教育认证、Copilot 设置。'],
        ]}
      />
      <InfoCard type="tip" title="小白每天只需要看 3 个地方">
        <strong>Your repositories</strong> 找自己的项目，<strong>Notifications</strong> 看别人是否回复你，<strong>Search</strong> 找开源项目和学习资料。
      </InfoCard>
    </div>
  )
}

function SectionSearchRepos() {
  return (
    <div>
      <p style={p}>
        GitHub 搜索不只是输入关键词。真正高效的方式是用搜索限定符（qualifier）把结果缩小到“语言、Star 数、更新时间、主题、是否归档”等条件。
      </p>
      <ScreenshotFigure
        src="/github-guide/05-search-results.png"
        title="搜索结果页：按 Star 排序寻找高质量仓库"
        desc="示例搜索：stars:>10000 language:javascript topic:react，并按 Most stars 排序。"
        labels={[
          ['Filter by', '按类型筛选：Code、Repositories、Issues、Pull requests、Users。'],
          ['Repositories', '仓库结果。找项目时优先选这个。'],
          ['Languages', '按语言过滤。注意一个仓库可能混合多种语言。'],
          ['Sort by: Most stars', '按 Star 数排序，快速找到热门项目。'],
          ['Repository card', '每个结果卡片会显示仓库名、描述、标签、语言、Star、更新时间。'],
          ['Star button', '收藏仓库，方便以后回到 Stars 列表找。'],
        ]}
      />
      <CompareTable
        headers={['搜索目标', '推荐搜索语句', '含义']}
        rows={[
          ['找热门 React 项目', 'stars:>10000 language:javascript topic:react', 'Star 大于 10000，主要语言 JavaScript，主题包含 react。'],
          ['找近期还在维护的项目', 'pushed:>2025-01-01 stars:>1000', '最近仍有提交，且有一定关注度。'],
          ['找适合新手贡献的任务', 'label:"good first issue" state:open', '筛选还打开的新手友好 Issue。'],
          ['找某个用户的仓库', 'user:facebook react', '只搜 facebook 账号下和 react 相关的仓库。'],
          ['找某组织内代码', 'org:vercel language:typescript', '只搜 vercel 组织下 TypeScript 相关内容。'],
          ['排除已归档项目', 'archived:false stars:>500', '过滤掉不再维护的仓库。'],
          ['找教程类仓库', 'topic:tutorial language:python stars:>1000', 'Python 教程主题仓库。'],
          ['在指定仓库搜代码', 'repo:facebook/react useState', '只在 facebook/react 仓库里搜 useState。'],
        ]}
      />
      <InfoCard type="warning" title="不要只看 Star">
        Star 多不代表一定适合你。还要看 <strong>Updated</strong> 是否近期更新、<strong>Issues</strong> 是否有人维护、<strong>README</strong> 是否清晰、<strong>License</strong> 是否允许使用。
      </InfoCard>
    </div>
  )
}

function SectionInstallGit() {
  return (
    <div>
      <p style={p}>GitHub 是网站，Git 是你电脑上的命令工具。想把本地代码上传到 GitHub，需要先安装 Git。</p>
      <CompareTable
        headers={['系统', '安装方式', '验证命令']}
        rows={[
          ['Windows', <>访问 <a href="https://git-scm.com/downloads" target="_blank" rel="noreferrer" style={link}>git-scm.com/downloads</a> 下载，安装时一路默认即可。</>, 'git --version'],
          ['macOS', '终端运行 xcode-select --install，或使用 Homebrew 安装 git。', 'git --version'],
          ['Ubuntu / Debian', 'sudo apt install git', 'git --version'],
        ]}
      />
      <TerminalBlock title="第一次配置 Git 身份" commands={[
        { comment: '# 查看是否安装成功', cmd: 'git --version', output: 'git version 2.x.x' },
        { comment: '# 配置你的名字。这里建议用英文名或 GitHub 用户名', cmd: 'git config --global user.name "your-name"' },
        { comment: '# 配置你的邮箱。建议和 GitHub 账号邮箱一致', cmd: 'git config --global user.email "you@example.com"' },
        { comment: '# 推荐把默认分支名设为 main', cmd: 'git config --global init.defaultBranch main' },
        { comment: '# 检查配置', cmd: 'git config --global --list' },
      ]} />
      <InfoCard type="info" title="为什么要配置 user.name 和 user.email？">
        每次 commit 都会记录作者。配置错了不会影响代码，但你的提交记录可能不会正确关联到 GitHub 账号。
      </InfoCard>
    </div>
  )
}

function SectionCreateRepo() {
  return (
    <div>
      <p style={p}>仓库就是项目主页。新手建议先创建一个叫 <code style={code}>hello-github</code> 的公开练习仓库。</p>
      <div>
        {[
          { number: 1, title: '进入新建仓库页面', children: <>登录后点击右上角 <strong>+</strong>，选择 <strong>New repository（新建仓库）</strong>。</> },
          { number: 2, title: '填写 Repository name', children: <>仓库名填 <code style={code}>hello-github</code>。只能用英文、数字、短横线更稳。</> },
          { number: 3, title: 'Description 可选', children: '写一句项目说明，例如 My first GitHub repository。' },
          { number: 4, title: '选择 Public 或 Private', children: <>练习项目建议选 <strong>Public（公开）</strong>；作业或隐私项目选 <strong>Private（私有）</strong>。</> },
          { number: 5, title: '勾选 Add a README file', children: <>新手建议勾选。README 是项目说明书，仓库首页会直接显示。</> },
          { number: 6, title: '点击 Create repository', children: <>最后点绿色按钮 <strong>Create repository（创建仓库）</strong>。</> },
        ].map(step => <StepCard key={step.number} {...step} />)}
      </div>
      <CompareTable
        headers={['字段', '中文', '建议']}
        rows={[
          ['Repository name', '仓库名称', '短、清楚、英文，例如 algorithm-notes。'],
          ['Description', '仓库描述', '一句话说明项目用途。'],
          ['Public', '公开', '适合作品集、学习笔记、开源项目。'],
          ['Private', '私有', '适合课程作业、未公开项目、含隐私内容的仓库。'],
          ['Add a README file', '添加说明文件', '新手建议勾选。'],
          ['Add .gitignore', '忽略文件模板', 'Node 项目选 Node，Python 项目选 Python。'],
          ['Choose a license', '开源许可证', '练习仓库可以先不选；正式开源再选 MIT 等。'],
        ]}
      />
    </div>
  )
}

function SectionUpload() {
  return (
    <div>
      <p style={p}>下面是最常用、最通用的上传流程。你可以把它理解成：初始化项目 → 保存一次修改 → 绑定 GitHub 仓库 → 上传。</p>
      <TerminalBlock title="从本地新项目上传到 GitHub" commands={[
        { comment: '# 进入你的项目文件夹', cmd: 'cd my-project' },
        { comment: '# 初始化 Git 仓库。只需要做一次', cmd: 'git init' },
        { comment: '# 查看当前有哪些文件被修改', cmd: 'git status' },
        { comment: '# 把所有修改加入暂存区', cmd: 'git add .' },
        { comment: '# 提交一次存档。引号里写本次改了什么', cmd: 'git commit -m "init: first commit"' },
        { comment: '# 绑定远程仓库。把 URL 换成你自己的仓库地址', cmd: 'git remote add origin https://github.com/你的用户名/hello-github.git' },
        { comment: '# 第一次上传到 main 分支', cmd: 'git push -u origin main' },
      ]} />
      <InfoCard type="tip" title="以后每次改完代码，只需要三连">
        <code style={code}>git add .</code> → <code style={code}>git commit -m "说明"</code> → <code style={code}>git push</code>
      </InfoCard>
      <CompareTable
        headers={['命令', '中文解释', '什么时候用']}
        rows={[
          ['git status', '查看状态', '不知道现在有没有改动时先看它。'],
          ['git add .', '加入暂存区', '准备把本次修改纳入提交。'],
          ['git commit -m "..."', '提交存档', '给本次修改拍快照并写说明。'],
          ['git push', '上传到 GitHub', '把本地 commit 推到云端。'],
          ['git pull', '拉取云端更新', '多人协作前先同步最新代码。'],
          ['git clone URL', '下载仓库', '第一次把 GitHub 项目下载到本地。'],
        ]}
      />
    </div>
  )
}

function SectionEditorWorkflows() {
  return (
    <div>
      <p style={p}>
        实际开发不一定全靠命令行。你可以在 GitHub 网页、VS Code、Visual Studio 里完成创建仓库、提交 commit、推送 push、创建 PR。下面按入口拆开讲。
      </p>

      <h3 style={h3}>一、GitHub 网页版：适合改 README、文档、小文件</h3>
      <ScreenshotFigure
        src="/github-guide/02-repo-overview.png"
        title="GitHub 网页版仓库入口"
        desc="网页端适合轻量修改、创建文件、上传小文件、发 Issue/PR。Add file 等写入按钮只会在你有权限的仓库显示；大项目开发仍建议用本地 VS Code / Visual Studio。"
        labels={[
          ['Add file', '添加文件。常见选项是 Create new file（新建文件）和 Upload files（上传文件）。'],
          ['Create new file', '在线新建文件，例如 README.md、docs/intro.md。'],
          ['Upload files', '上传本地文件。适合补图片、文档、小 demo。'],
          ['Commit changes', '提交更改。网页端保存修改也叫 commit。'],
          ['Create a new branch for this commit', '为这次修改创建新分支，常用于给别人仓库提 PR。'],
          ['Propose changes', '提交修改建议，GitHub 会引导你创建 PR。'],
        ]}
      />
      <div>
        {[
          { number: 1, title: '在网页创建文件', children: <>进入仓库 → <strong>Add file</strong> → <strong>Create new file</strong>，文件名可以写 <code style={code}>docs/intro.md</code>，斜杠会自动创建文件夹。</> },
          { number: 2, title: '写 commit message', children: <>页面底部填写 <strong>Commit changes</strong>。第一行写短说明，例如 <code style={code}>docs: add intro page</code>。</> },
          { number: 3, title: '选择提交到 main 还是新分支', children: <>自己的练习仓库可以直接 commit 到 <strong>main</strong>；团队项目建议选 <strong>Create a new branch</strong> 再发 PR。</> },
          { number: 4, title: '网页版发 PR', children: <>修改提交后，如果你选了新分支，点击 <strong>Compare & pull request</strong>，填写标题和说明，再点 <strong>Create pull request</strong>。</> },
        ].map(step => <StepCard key={step.number} {...step} color="#0969da" />)}
      </div>
      <InfoCard type="warning" title="网页端不适合做什么？">
        不适合批量改代码、不适合跑测试、不适合调试项目。网页端改完最好仍在本地 pull 一下，确认能运行。
      </InfoCard>

      <h3 style={{ ...h3, marginTop: 32 }}>二、VS Code：最推荐的日常入口</h3>
      <CompareTable
        headers={['英文按钮 / 命令', '中文含义', '怎么操作']}
        rows={[
          ['Source Control', '源代码管理面板', '左侧分支图标，查看文件改动、暂存、提交。'],
          ['Initialize Repository', '初始化 Git 仓库', '项目还不是 Git 仓库时点击它。'],
          ['Publish Branch / Publish to GitHub', '发布分支 / 发布到 GitHub', '本地项目还没远程仓库时，VS Code 可帮你创建并推送。'],
          ['Stage Changes (+)', '暂存更改', '等价于 git add。可暂存单个文件或全部文件。'],
          ['Commit', '提交', '填写提交说明后点击 Commit，等价于 git commit。'],
          ['Sync Changes', '同步更改', '通常会 pull + push。新手要先确认自己理解当前改动。'],
          ['Create Pull Request', '创建 PR', '需要 GitHub Pull Requests and Issues 扩展。'],
          ['Git: Clone', '克隆仓库', '命令面板 Ctrl+Shift+P 搜 Git: Clone，粘贴仓库地址。'],
        ]}
      />
      <div>
        {[
          { number: 1, title: '准备环境', children: <>安装 Git；在 VS Code 扩展里安装 <strong>GitHub Pull Requests and Issues</strong>；左下角 Accounts 登录 GitHub。</> },
          { number: 2, title: '从零创建仓库', children: <>打开项目文件夹 → Source Control → <strong>Initialize Repository</strong> → 暂存文件 → 填 commit message → <strong>Commit</strong> → <strong>Publish to GitHub</strong>。</> },
          { number: 3, title: '从 GitHub 下载仓库', children: <>按 <code style={code}>Ctrl+Shift+P</code> → 输入 <strong>Git: Clone</strong> → 粘贴仓库 URL → 选择本地目录。</> },
          { number: 4, title: '日常 commit', children: <>改代码 → Source Control 看 diff → 点文件旁边 <strong>+</strong> 暂存 → 输入说明 → <strong>Commit</strong> → <strong>Sync Changes / Push</strong>。</> },
          { number: 5, title: '创建 PR', children: <>新建分支并 push 后，在 GitHub Pull Requests 面板点 <strong>Create Pull Request</strong>，填写目标分支、标题、描述。</> },
        ].map(step => <StepCard key={step.number} {...step} color="#7c3aed" />)}
      </div>
      <InfoCard type="tip" title="VS Code 最稳工作流">
        永远先 <strong>Pull</strong> 同步最新代码，再新建分支开发；每次 commit 只做一件事；push 后再创建 PR。
      </InfoCard>

      <h3 style={{ ...h3, marginTop: 32 }}>三、Visual Studio：适合 C# / .NET / C++ 项目</h3>
      <CompareTable
        headers={['Visual Studio 入口', '中文含义', '说明']}
        rows={[
          ['Git Changes', 'Git 更改窗口', '查看修改、暂存、commit、push。'],
          ['Create Git Repository', '创建 Git 仓库', '把当前解决方案初始化为 Git 仓库，并可发布到 GitHub。'],
          ['Commit All', '提交全部', '提交当前所有已跟踪/选择的修改。'],
          ['Push', '推送', '把本地 commit 上传到 GitHub。'],
          ['Pull', '拉取', '从 GitHub 拉取远程更新。'],
          ['Fetch', '获取', '只获取远程信息，不自动合并。'],
          ['New Pull Request', '新建 PR', '菜单通常在 Git → GitHub or Azure DevOps → New Pull Request。'],
          ['Manage Branches', '管理分支', '新建、切换、合并分支。'],
        ]}
      />
      <div>
        {[
          { number: 1, title: '登录 GitHub', children: <>Visual Studio 右上角账户入口登录 GitHub。首次推送私有仓库时可能会弹浏览器授权。</> },
          { number: 2, title: '创建仓库', children: <>打开解决方案 → 菜单 <strong>Git</strong> → <strong>Create Git Repository</strong>，选择 GitHub、仓库名、Public/Private。</> },
          { number: 3, title: '提交 commit', children: <>打开 <strong>Git Changes</strong> 窗口 → 查看 Changes → 写 commit message → <strong>Commit All</strong>。</> },
          { number: 4, title: '推送到 GitHub', children: <>提交后点 <strong>Push</strong>。如果是第一次推送，Visual Studio 会创建远程仓库或要求选择远程地址。</> },
          { number: 5, title: '创建 PR', children: <>在分支完成修改并 push 后，菜单 <strong>Git</strong> → <strong>GitHub or Azure DevOps</strong> → <strong>New Pull Request</strong>。</> },
        ].map(step => <StepCard key={step.number} {...step} color="#60a5fa" />)}
      </div>

      <h3 style={{ ...h3, marginTop: 32 }}>四、三种入口怎么选？</h3>
      <CompareTable
        headers={['场景', '推荐入口', '原因']}
        rows={[
          ['改 README / 文档错别字', 'GitHub 网页版', '不用拉代码，几分钟完成。'],
          ['前端、Node、Python、算法项目', 'VS Code', '轻量、扩展多、GitHub 集成好。'],
          ['C#、.NET、C++、Windows 桌面项目', 'Visual Studio', '解决方案、调试器、项目模板更完整。'],
          ['开源项目贡献', 'VS Code + GitHub PR 扩展', '能本地跑测试，也能直接创建/查看 PR。'],
          ['临时修小问题，没有本地环境', 'github.dev / Codespaces', '浏览器里编辑，适合轻量改动。'],
        ]}
      />
      <ResourceCard title="GitHub 官方：网页创建仓库与首次提交" url="https://docs.github.com/create-a-repo?tool=webui" desc="按 Web UI 完成新仓库、README、首次 commit。" tag="官方" tagColor="#0969da" />
      <ResourceCard title="GitHub 官方：网页管理文件" url="https://docs.github.com/articles/managing-files-on-github" desc="创建、编辑、上传、删除文件的网页操作入口。" tag="官方" tagColor="#0969da" />
      <ResourceCard title="VS Code 官方：GitHub 集成" url="https://code.visualstudio.com/docs/sourcecontrol/github" desc="在 VS Code 中处理 Issue、PR、分支发布与 GitHub 扩展。" tag="VS Code" tagColor="#7c3aed" />
      <ResourceCard title="Visual Studio 官方：创建 GitHub 仓库" url="https://learn.microsoft.com/en-us/visualstudio/version-control/git-create-repository?view=vs-2022" desc="从 Visual Studio 直接创建本地 Git 仓库并发布到 GitHub。" tag="Visual Studio" tagColor="#60a5fa" />
    </div>
  )
}

function SectionRepoTour() {
  return (
    <div>
      <ScreenshotFigure
        src="/github-guide/02-repo-overview.png"
        title="仓库主页：你最常看的页面"
        desc="示例是公开仓库 facebook/react。你自己的仓库页面布局也类似。"
        labels={[
          ['facebook / react', '仓库所属账号 / 仓库名。你的仓库会显示 用户名 / 仓库名。'],
          ['Public', '公开仓库；Private 表示私有仓库。'],
          ['Code', '代码区，也是默认首页。'],
          ['Issues', '问题、需求、任务讨论区。'],
          ['Pull requests', '代码合并请求区。'],
          ['Actions', '自动化测试和部署。'],
          ['main', '当前分支。新手通常只用 main。'],
          ['绿色 Code 按钮', '复制 clone 地址或下载 ZIP 的入口。'],
          ['About', '项目简介、官网、标签、Star 数等。'],
        ]}
      />
      <InfoCard type="info" title="新手看仓库的顺序">
        先看 <strong>README</strong> 知道项目做什么；再看 <strong>Code</strong> 里的目录结构；遇到问题看 <strong>Issues</strong>；想贡献代码再看 <strong>Pull requests</strong> 和 <strong>Contributing</strong>。
      </InfoCard>
    </div>
  )
}

function SectionCollaboration() {
  return (
    <div>
      <ScreenshotFigure
        src="/github-guide/03-issues-page.png"
        title="Issues 页面：提问题、报 bug、看任务"
        desc="Issue 不是“代码错误”的同义词，它更像项目里的公开讨论和任务单。"
        labels={[
          ['Open / Closed', 'Open 是还没解决，Closed 是已关闭。'],
          ['Search box', '筛选 Issue，例如 is:issue state:open。'],
          ['Labels', '标签，例如 bug、documentation、good first issue。'],
          ['New issue', '新建一个 Issue。'],
        ]}
      />
      <div>
        {[
          { number: 1, title: '什么时候提 Issue？', children: '发现 bug、文档看不懂、想提出功能建议、想认领一个任务，都可以开 Issue。' },
          { number: 2, title: 'Issue 标题怎么写？', children: <>用“现象 + 场景”写清楚，例如 <code style={code}>登录后刷新页面会退出账号</code>。</> },
          { number: 3, title: 'Issue 内容写什么？', children: '复现步骤、期望结果、实际结果、截图、系统环境。越具体，越容易被解决。' },
        ].map(step => <StepCard key={step.number} {...step} color="#0969da" />)}
      </div>

      <ScreenshotFigure
        src="/github-guide/04-pull-requests.png"
        title="Pull requests 页面：申请合并代码"
        desc="PR 是团队协作的核心。你先在分支里改代码，再发 PR 让维护者审核。"
        labels={[
          ['New pull request', '新建合并请求。'],
          ['Open / Closed', 'Open 是待审核或待合并，Closed 是已关闭。'],
          ['Reviewers', '代码审核人。'],
          ['Labels / Milestones', '标签和里程碑，用于分类和排期。'],
        ]}
      />
      <TerminalBlock title="团队协作推荐流程" commands={[
        { comment: '# 先拉取最新代码', cmd: 'git pull' },
        { comment: '# 新开一个分支，不要直接在 main 上改', cmd: 'git switch -c feature/login-page' },
        { comment: '# 修改代码后提交', cmd: 'git add .' },
        { cmd: 'git commit -m "feat: add login page"' },
        { comment: '# 推送你的分支', cmd: 'git push -u origin feature/login-page' },
        { comment: '# 回到 GitHub 页面，点击 Compare & pull request', cmd: '' },
      ]} />
    </div>
  )
}

function SectionAdvancedFeatures() {
  return (
    <div>
      <h3 style={h3}>1. GitHub Pages：免费发布静态网站</h3>
      <p style={p}>
        GitHub Pages 适合发布个人主页、作品集、项目文档、课程笔记。它主要托管静态网页，也就是 HTML/CSS/JS、Markdown 文档和静态构建产物。
      </p>
      <div>
        {[
          { number: 1, title: '准备一个仓库', children: <>个人主页仓库命名为 <code style={code}>用户名.github.io</code>；项目站点可以用任意仓库名。</> },
          { number: 2, title: '上传网页文件', children: <>最简单是放一个 <code style={code}>index.html</code>。React/Vite 项目通常先 build，再发布 <code style={code}>dist</code>。</> },
          { number: 3, title: '进入 Settings → Pages', children: <>在仓库页面点 <strong>Settings</strong>，左侧找到 <strong>Pages</strong>。</> },
          { number: 4, title: '选择发布来源', children: <>可以选择 <strong>Deploy from a branch</strong>，或用 <strong>GitHub Actions</strong> 自动构建发布。</> },
          { number: 5, title: '访问网址', children: <>个人主页通常是 <code style={code}>https://用户名.github.io</code>；项目页通常是 <code style={code}>https://用户名.github.io/仓库名</code>。</> },
        ].map(step => <StepCard key={step.number} {...step} color="#0969da" />)}
      </div>

      <h3 style={{ ...h3, marginTop: 32 }}>2. GitHub Actions：自动测试、构建、部署</h3>
      <ScreenshotFigure
        src="/github-guide/06-actions-page.png"
        title="Actions 页面：自动化工作流运行记录"
        desc="Actions 常用于每次 push 后自动跑测试、检查代码格式、构建项目、部署 Pages。"
        labels={[
          ['Actions tab', '仓库里的自动化入口。'],
          ['All workflows', '所有工作流列表。'],
          ['Workflow runs', '每次运行记录。绿色勾表示成功，红色叉表示失败。'],
          ['Status / Branch / Actor', '运行状态、触发分支、触发人。'],
          ['Filter workflow runs', '按关键词过滤运行记录。'],
        ]}
      />
      <TerminalBlock title="最小 GitHub Actions 示例" commands={[
        { comment: '# 在仓库中新建 .github/workflows/ci.yml', cmd: 'mkdir -p .github/workflows' },
        { cmd: 'touch .github/workflows/ci.yml' },
        { comment: '# 提交后，每次 push 都会触发工作流', cmd: 'git add .github/workflows/ci.yml' },
        { cmd: 'git commit -m "ci: add first workflow"' },
        { cmd: 'git push' },
      ]} />
      <div style={codeBlock}>
{`name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install
      - run: npm test`}
      </div>

      <h3 style={{ ...h3, marginTop: 32 }}>3. GitHub Codespaces：浏览器里的 VS Code</h3>
      <ScreenshotFigure
        src="/github-guide/07-codespaces-page.png"
        title="Codespaces：云端开发环境"
        desc="不用在自己电脑装环境，直接在浏览器里打开一个带 VS Code 的云端机器，适合学校机房、低配电脑、临时改代码。"
        labels={[
          ['Codespaces', '云端开发环境。'],
          ['Get started for free', '开始使用。个人账号通常有免费额度，学生认证后额度更多。'],
          ['Browser VS Code', '在浏览器里写代码、运行终端、预览页面。'],
          ['Port forwarding', '运行 Web 项目时，Codespaces 会把端口映射成可访问网址。'],
        ]}
      />
      <InfoCard type="tip" title="什么时候用 Codespaces？">
        临时看开源项目、电脑装环境失败、课堂演示、需要快速跑一个 Node/Python 项目时，Codespaces 很省时间。长期重度使用要注意额度。
      </InfoCard>

      <h3 style={{ ...h3, marginTop: 32 }}>4. GitHub Copilot：AI 编程助手</h3>
      <ScreenshotFigure
        src="/github-guide/08-copilot-page.png"
        title="Copilot：GitHub 的 AI 编程助手"
        desc="Copilot 可以在 VS Code、JetBrains、GitHub.com、Codespaces 中补全代码、解释代码、生成测试和回答项目问题。"
        labels={[
          ['GitHub Copilot', 'AI 编程助手。'],
          ['Get started', '开始开通或配置。'],
          ['Copilot in VS Code', '在 VS Code 中用补全和聊天。'],
          ['Copilot CLI', '在命令行里让 AI 帮你解释命令。'],
          ['Plans & Pricing', '查看付费与学生权益。'],
        ]}
      />
      <CompareTable
        headers={['场景', '怎么问 Copilot', '注意事项']}
        rows={[
          ['解释代码', 'Explain this function', '先选中代码再问，结果更准确。'],
          ['生成测试', 'Write unit tests for this function', '生成后必须自己运行测试。'],
          ['修 Bug', 'Why does this error happen?', '把报错和相关代码一起给它。'],
          ['写 README', 'Generate a README for this project', '要补充项目真实运行方式。'],
          ['学习新库', 'Show a minimal example using React Router', '让它给最小例子，不要一次生成大项目。'],
        ]}
      />
    </div>
  )
}

function SectionEducation() {
  return (
    <div>
      <p style={p}>
        GitHub Education 是学生权益入口。通过学生身份验证后，可以获得 Student Developer Pack、Copilot 学生权益、Codespaces 额度等。具体权益会变动，以 GitHub 官方页面为准。
      </p>
      <ScreenshotFigure
        src="/github-guide/09-education-pack.png"
        title="GitHub Student Developer Pack：学生开发者包"
        desc="截图来自 GitHub Education 公开页面。认证入口通常是 Sign up for Student Developer Pack。"
        labels={[
          ['Students', '学生相关入口。'],
          ['Teachers', '教师相关入口。'],
          ['Schools', '学校合作入口。'],
          ['Sign in', '登录 GitHub 账号后继续申请。'],
          ['Sign up for Student Developer Pack', '申请学生开发者包。'],
          ['Experiences', '按学习场景整理的学生权益和工具推荐。'],
        ]}
      />
      <CompareTable
        headers={['认证前准备', '说明', '建议']}
        rows={[
          ['GitHub 账号', '必须先注册并登录个人账号。', '用户名和邮箱尽量规范。'],
          ['学校邮箱', '如果学校提供 edu / edu.cn / 学校域名邮箱，优先使用。', '更容易通过自动验证。'],
          ['学生证明材料', '学生证、在读证明、课程表、学信网学籍报告等。', '最好包含姓名、学校、当前日期或有效期。'],
          ['真实姓名', '材料姓名需要和申请信息匹配。', '不要使用他人材料。'],
          ['用途说明', '说明你会用 GitHub 学习编程、做课程项目、参与开源。', '简短真实即可。'],
        ]}
      />
      <div>
        {[
          { number: 1, title: '进入申请页', children: <>访问 <a href="https://education.github.com/pack" target="_blank" rel="noreferrer" style={link}>education.github.com/pack</a>，点击 <strong>Sign up for Student Developer Pack</strong>。</> },
          { number: 2, title: '选择 Student 身份', children: '登录 GitHub 后选择学生身份，按页面提示填写学校信息。' },
          { number: 3, title: '验证学校邮箱或上传材料', children: '有学校邮箱优先用邮箱；没有则上传学生证、在读证明或学籍报告。' },
          { number: 4, title: '等待审核', children: '审核时间不固定。通过后可在 Education benefits 页面看到权益。' },
          { number: 5, title: '开通 Copilot Student', children: <>认证通过后访问 <code style={code}>github.com/settings/education/benefits</code>，按页面提示激活 Copilot 学生权益。</> },
        ].map(step => <StepCard key={step.number} {...step} color="#34d399" />)}
      </div>
      <InfoCard type="warning" title="关于 Copilot 学生计划">
        GitHub 官方文档提示：从 2026-04-20 起，Copilot Pro、Pro+ 和 student plans 的新注册暂时暂停。你看到的页面状态可能会随 GitHub 政策调整而变化，务必以官方页面为准。
      </InfoCard>
      <ResourceCard title="GitHub 官方：学生身份申请" url="https://docs.github.com/zh/education/about-github-education/github-education-for-students/apply-to-github-education-as-a-student" desc="官方中文文档，最可靠。" tag="官方中文" tagColor="#0969da" />
      <ResourceCard title="GitHub 官方：学生免费使用 Copilot" url="https://docs.github.com/en/copilot/how-tos/manage-your-account/free-access-with-copilot-student" desc="Copilot 学生权益说明和激活入口。" tag="官方" tagColor="#0969da" />
      <ResourceCard title="知乎：GitHub Education 学生认证经验贴搜索" url="https://www.zhihu.com/search?type=content&q=GitHub%20Education%20%E5%AD%A6%E7%94%9F%E8%AE%A4%E8%AF%81%20%E6%95%99%E7%A8%8B" desc="知乎文章经常变动，这里提供站内搜索入口，建议结合官方文档核对。" tag="知乎" tagColor="#2563eb" />
      <ResourceCard title="GitHub 官方：搜索语法" url="https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories" desc="仓库搜索限定符和排序方式。" tag="官方" tagColor="#0969da" />
      <ResourceCard title="GitHub 官方：Pages 快速开始" url="https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site" desc="创建 GitHub Pages 站点的官方步骤。" tag="官方" tagColor="#0969da" />
      <ResourceCard title="GitHub 官方：Actions 快速开始" url="https://docs.github.com/en/actions/writing-workflows/quickstart" desc="创建第一个 Actions workflow。" tag="官方" tagColor="#0969da" />
      <ResourceCard title="GitHub 官方：Codespaces 快速开始" url="https://docs.github.com/en/codespaces/quickstart" desc="打开、编辑和提交 Codespaces 中的代码。" tag="官方" tagColor="#0969da" />
    </div>
  )
}

function SectionTroubleshooting() {
  return (
    <div>
      <h3 style={h3}>推荐配置 SSH Key</h3>
      <p style={p}>HTTPS 也能上传代码，但新手经常被账号密码、Token 卡住。SSH 配好后，以后 push 更顺。</p>
      <TerminalBlock title="生成并测试 SSH Key" commands={[
        { comment: '# 生成密钥。邮箱换成你的 GitHub 邮箱', cmd: 'ssh-keygen -t ed25519 -C "you@example.com"' },
        { comment: '# 一路回车即可。然后查看公钥', cmd: 'cat ~/.ssh/id_ed25519.pub', output: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... you@example.com' },
        { comment: '# 把上面整行复制到 GitHub：头像 → Settings → SSH and GPG keys → New SSH key', cmd: '' },
        { comment: '# 测试是否配置成功', cmd: 'ssh -T git@github.com', output: "Hi yourname! You've successfully authenticated..." },
      ]} />

      <CompareTable
        headers={['报错 / 现象', '通常原因', '解决方式']}
        rows={[
          ['Permission denied (publickey)', 'SSH Key 没配好或 remote 地址不是 SSH', '重新添加公钥，检查 git remote -v。'],
          ['Updates were rejected', '远程仓库比你本地更新', '先 git pull，再解决冲突后 push。'],
          ['fatal: not a git repository', '当前文件夹不是 Git 仓库', 'cd 到项目目录，或先 git init。'],
          ['nothing to commit', '没有新修改可提交', '这是正常提示，说明当前很干净。'],
          ['merge conflict', '你和别人改了同一段代码', '打开冲突文件，保留正确内容，再 add/commit。'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 32 }}>下一步：学生包与个人网站</h3>
      <div style={grid}>
        <MiniCard title="GitHub Student Developer Pack" desc="学生可以申请开发工具权益，包括 Copilot、云服务额度等。建议用学校邮箱验证。" />
        <MiniCard title="GitHub Pages" desc="可以免费发布个人主页、项目文档、作品集。适合简历展示。" />
        <MiniCard title="GitHub Skills" desc="GitHub 官方互动课程，用任务形式带你练仓库、PR、Actions。" />
      </div>

      <ResourceCard title="GitHub Docs：创建仓库" url="https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository" desc="官方说明 New repository 页面每个选项的含义。" tag="官方" tagColor="#0969da" />
      <ResourceCard title="GitHub Docs：添加 SSH Key" url="https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account" desc="官方 SSH Key 配置步骤。" tag="官方" tagColor="#0969da" />
      <ResourceCard title="GitHub Docs：从 Fork 创建 PR" url="https://docs.github.com/articles/creating-a-pull-request-from-a-fork" desc="开源贡献时最常用的 PR 流程。" tag="官方" tagColor="#0969da" />
      <ResourceCard title="Pro Git 中文版" url="https://git-scm.com/book/zh/v2" desc="系统学习 Git 的免费中文书。" tag="免费" tagColor="#34d399" />
    </div>
  )
}

function MiniCard({ title, desc }) {
  return (
    <div style={{
      padding: '16px',
      borderRadius: 14,
      background: 'var(--glass-bg-mid)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--glass-shine)',
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</div>
    </div>
  )
}

function ScreenshotFigure({ src, title, desc, labels }) {
  return (
    <figure style={{
      margin: '18px 0 24px',
      borderRadius: 18,
      overflow: 'hidden',
      border: '1px solid var(--glass-border-strong)',
      background: 'var(--glass-bg)',
      boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
    }}>
      <img src={src} alt={title} style={{ width: '100%', display: 'block', background: '#fff' }} />
      <figcaption style={{ padding: '16px 18px 18px' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: 12 }}>{desc}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 8 }}>
          {labels.map(([en, zh], i) => (
            <div key={`${en}-${i}`} style={{
              padding: '9px 10px',
              borderRadius: 10,
              background: 'var(--glass-bg-mid)',
              border: '1px solid var(--glass-border)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0969da', marginBottom: 3 }}>{en}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{zh}</div>
            </div>
          ))}
        </div>
      </figcaption>
    </figure>
  )
}

const p = { fontSize: 'var(--fs-md)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-loose)', marginBottom: 'var(--space-4)' }
const h3 = { fontSize: 'var(--fs-lg)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 var(--space-3) 0' }
const link = { color: 'var(--accent-light)', textDecoration: 'underline', textUnderlineOffset: 3 }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)', margin: 'var(--space-4) 0' }
const codeBlock = {
  margin: 'var(--space-4) 0',
  padding: 'var(--space-4)',
  borderRadius: 12,
  background: '#0d1117',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#e6edf3',
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-sm)',
  lineHeight: 'var(--lh-normal)',
  whiteSpace: 'pre-wrap',
  overflowX: 'auto',
}
const code = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--fs-sm)',
  background: 'var(--surface-2)',
  padding: '1px 5px',
  borderRadius: 4,
  color: 'var(--accent-light)',
}
