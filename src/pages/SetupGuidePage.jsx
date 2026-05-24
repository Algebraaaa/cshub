import GuideLayout from '../components/guide/GuideLayout'
import { InfoCard, StepCard, CompareTable, ResourceCard } from '../components/guide/GuideComponents'

const META = {
  icon: '⚡',
  tag: '环境配置',
  title: '开发环境一站式配置',
  subtitle: '装机三天 vs 装机一晚——差距在于知道装啥、按什么顺序装。Windows / macOS / Linux 三端通吃，全是可复制的命令。',
  gradientFrom: '#1A2980',
  gradientTo: '#26D0CE',
  stats: [
    { icon: '🖥️', label: '三端命令对照' },
    { icon: '🐧', label: 'WSL2 一条龙' },
    { icon: '🔌', label: '10 个必装扩展' },
    { icon: '✅', label: '一键验证脚本' },
  ],
}

const SECTIONS = [
  { icon: '🖥️', title: '三端环境对照表',                content: <SectionPlatforms /> },
  { icon: '📦', title: '一行命令装齐主流工具链',         content: <SectionPackages /> },
  { icon: '🐧', title: 'WSL2 一条龙（Windows 学生必看）',content: <SectionWSL /> },
  { icon: '✏️', title: 'VSCode：10 个必装扩展 + 配置',  content: <SectionVSCode /> },
  { icon: '🛠️', title: 'Git 全局配置 + SSH + 多账号',   content: <SectionGit /> },
  { icon: '🐍', title: '语言版本管理（Node / Python / Java）', content: <SectionLangManagers /> },
  { icon: '🐳', title: 'Docker Desktop 入门',           content: <SectionDocker /> },
  { icon: '⌨️', title: '终端美化与生产力快捷键',         content: <SectionTerminal /> },
  { icon: '✅', title: '验证脚本：装完跑一下',           content: <SectionVerify /> },
]

export default function SetupGuidePage() {
  return <GuideLayout meta={META} sections={SECTIONS} />
}

// ─── Section 1: Platforms ─────────────────────────────────────────────────────

function SectionPlatforms() {
  return (
    <div>
      <InfoCard type="info" title="先选一个平台">
        三端各有优劣，没有"最好"只有"最适合"。新手学生绝大多数用 Windows，但 <strong>必须开 WSL2</strong>，不然写很多教程都会卡。Mac 用户最舒服但贵。Linux 适合知道自己想要什么的人。
      </InfoCard>
      <CompareTable
        headers={['对比维度', 'Windows', 'macOS', 'Linux']}
        rows={[
          ['门槛',         '低（开机即用）',                     '低（开机即用）',                     '高（要懂分区 / 驱动）'],
          ['硬件成本',     '便宜（5k 起）',                       '贵（万元起）',                       '看你怎么装'],
          ['开发体验',     '原生差，开 WSL2 才行',                '原生 Unix 体验最佳',                 '最纯粹的 Unix'],
          ['国产工具兼容',  '最好（QQ、微信、网银都有）',          '良好',                              '差（多数要靠浏览器）'],
          ['命令行',       'PowerShell + WSL Bash',              'zsh（默认）+ Homebrew',             'bash / zsh + apt/pacman'],
          ['推荐用户',     '国内学生 95%、游戏党',                '前端 / 设计 / 富有的人',             '后端老手、服务器党'],
          ['这份指南的偏向','✅ 主推',                            '✅ 同等支持',                        '⚠️ 命令通用，但跳过一些 GUI 步骤'],
        ]}
      />

      <h3 style={h3}>不可妥协的硬件下限</h3>
      <CompareTable
        headers={['组件', '最低', '推荐', '理由']}
        rows={[
          ['内存',  '8GB',  '16GB+', 'IDE + Docker + 浏览器三件套吃内存厉害'],
          ['硬盘',  '256G SSD', '512G NVMe', '机械硬盘别考虑了，开 IDE 都卡'],
          ['CPU',   'i5 / R5 / M1', 'i7 / R7 / M2 Pro', '编译速度直接影响幸福感'],
          ['屏幕',  '14"',  '2K + 16:10', '看代码列宽差别巨大'],
          ['网络',  '能翻墙', '稳定 VPN', 'npm / GitHub / Docker Hub 都要走外网'],
        ]}
      />
    </div>
  )
}

// ─── Section 2: Packages ──────────────────────────────────────────────────────

function SectionPackages() {
  return (
    <div>
      <p style={p}>包管理器是装机的灵魂。<strong>一行命令解决一上午"去官网下→双击→Next→Next"</strong>。</p>

      <h3 style={h3}>🪟 Windows（PowerShell 管理员）</h3>
      <pre style={codeBlock}>{`# 1. winget 是 Windows 11 自带的官方包管理器
winget --version   # 没装的话去 Microsoft Store 搜 "应用安装程序"

# 2. 一键装齐
winget install --id Git.Git -e
winget install --id Microsoft.VisualStudioCode -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Python.Python.3.12 -e
winget install --id Microsoft.OpenJDK.21 -e
winget install --id Microsoft.PowerToys -e
winget install --id Microsoft.WindowsTerminal -e
winget install --id Docker.DockerDesktop -e
winget install --id Postman.Postman -e

# 3. 装完关掉窗口重开（让 PATH 生效），验证
node -v; python --version; java -version; git --version`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>🍎 macOS（终端）</h3>
      <pre style={codeBlock}>{`# 1. 装 Homebrew（Mac 标准包管理器）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 一键装齐（brew install 多个包并行下）
brew install git node python@3.12 openjdk@21 wget htop tree jq
brew install --cask visual-studio-code iterm2 docker postman raycast

# 3. M 系列芯片注意 Rosetta（少数老软件要装）
softwareupdate --install-rosetta --agree-to-license

# 4. 验证
node -v; python3 -V; java -version; git --version`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>🐧 Linux（Ubuntu / Debian）</h3>
      <pre style={codeBlock}>{`# 1. 更新源
sudo apt update && sudo apt upgrade -y

# 2. 装基础工具
sudo apt install -y git curl wget build-essential unzip tree htop jq

# 3. Node.js（用 NodeSource 源，apt 默认版本太老）
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Python 3.12（Ubuntu 22.04 默认是 3.10，自己加 ppa）
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt install -y python3.12 python3.12-venv python3-pip

# 5. Java（OpenJDK 21）
sudo apt install -y openjdk-21-jdk

# 6. VSCode（官方 deb 包）
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo install -D -o root -g root -m 644 microsoft.gpg /etc/apt/keyrings/microsoft.gpg
echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | sudo tee /etc/apt/sources.list.d/vscode.list
sudo apt update && sudo apt install -y code`}</pre>

      <InfoCard type="tip" title="国内网络加速">
        装包慢得想哭的话，给每个工具配国内镜像：<br />
        • npm：<code style={ic}>npm config set registry https://registry.npmmirror.com</code><br />
        • pip：<code style={ic}>pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple</code><br />
        • Docker：daemon.json 加 <code style={ic}>{`"registry-mirrors": ["https://docker.m.daocloud.io"]`}</code><br />
        • Homebrew：<code style={ic}>brew tap-new homebrew/core --custom-remote https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git</code>
      </InfoCard>
    </div>
  )
}

// ─── Section 3: WSL2 ──────────────────────────────────────────────────────────

function SectionWSL() {
  return (
    <div>
      <InfoCard type="warning" title="Windows 学生必装">
        <strong>不开 WSL2，半数 Linux 教程你都跑不起来</strong>。WSL2 让你在 Windows 里跑一个真正的 Ubuntu 内核，启动比虚拟机快 10 倍。VSCode 和 Docker 都原生支持。
      </InfoCard>

      <pre style={codeBlock}>{`# 1. PowerShell 管理员（一行装齐）
wsl --install

# 这命令会：
# - 启用 WSL2 功能
# - 启用虚拟机平台
# - 默认装 Ubuntu 发行版
# - 重启后让你设用户名密码

# 2. 重启后，开始菜单搜 "Ubuntu" 启动
# 第一次启动会让你设用户名和密码（不显示输入！）

# 3. 装好后，更新一下
sudo apt update && sudo apt upgrade -y

# 4. 在 WSL 里直接调用 Windows 资源管理器打开当前目录
explorer.exe .

# 5. 在 Windows 文件管理器里访问 WSL 文件
# 地址栏输入：\\\\wsl$\\Ubuntu\\home\\你的用户名`}</pre>

      <h3 style={h3}>三个必学技巧</h3>
      {[
        { number: 1, title: 'VSCode 连 WSL', children: <>装 VSCode 的 <strong>WSL</strong> 扩展。在 Ubuntu 里跑 <code style={ic}>code .</code>，VSCode 会自动以远程模式打开当前目录，所有终端 / 任务 / 调试都跑在 Linux 上。</> },
        { number: 2, title: 'Windows ↔ Linux 文件互访', children: <>WSL 里的 Linux 文件：<code style={ic}>{'\\\\wsl$\\Ubuntu\\home\\你'}</code> 在 Windows 资源管理器能看到。Windows 文件：在 Ubuntu 里走 <code style={ic}>/mnt/c/Users/你/...</code>。</> },
        { number: 3, title: '把项目放对地方', children: <>性能差距大！项目放在 <strong>Linux 文件系统</strong>（<code style={ic}>~/projects</code>）跑得快。放在 <code style={ic}>/mnt/c/...</code> 会比纯 Windows 还慢，因为跨文件系统 IO。</> },
      ].map((s, i) => <StepCard key={i} {...s} color="#06b6d4" />)}

      <InfoCard type="info" title="WSL 常见坑">
        ❌ 别在 Windows 里 <code style={ic}>chmod +x</code>，WSL 看不到权限变化 → 在 WSL 里改<br />
        ❌ Git 行尾符问题：<code style={ic}>git config --global core.autocrlf input</code><br />
        ❌ Docker Desktop 装好后开启 WSL2 集成（设置 → Resources → WSL Integration）<br />
        ✅ 想关掉某个发行版：<code style={ic}>wsl --terminate Ubuntu</code>；想重装：<code style={ic}>wsl --unregister Ubuntu</code>
      </InfoCard>
    </div>
  )
}

// ─── Section 4: VSCode ───────────────────────────────────────────────────────

function SectionVSCode() {
  return (
    <div>
      <p style={p}>VSCode 是当前最主流的编辑器。装好它 + 10 个扩展，开箱就能写 React / Python / Java / Go / TS 任意项目。</p>

      <h3 style={h3}>10 个必装扩展</h3>
      <CompareTable
        headers={['扩展名', '作用', '场景']}
        rows={[
          ['Claude Code',          'Anthropic 官方插件，让 Claude 直接读写你的代码',         '所有项目'],
          ['GitLens',              '每行代码旁显示作者 / 提交时间，hover 看 diff',         '所有项目'],
          ['Error Lens',           '把错误警告直接显示在行尾，告别 hover',                   '所有项目'],
          ['Prettier',             '保存时自动格式化',                                       '前端 / TS / JS'],
          ['ESLint',               'JS/TS 静态检查',                                          '前端 / Node'],
          ['Python (Microsoft)',   'Python 官方扩展，含 Pylance 类型检查',                   'Python'],
          ['Extension Pack for Java','Java 全家桶（Maven / Spring / Lombok）',               'Java'],
          ['Remote Development',   'WSL / SSH / Container 三件套，远程开发必装',             'WSL / 服务器'],
          ['Material Icon Theme',  '文件图标更清晰',                                          '所有项目'],
          ['Code Spell Checker',   '检查代码 / 注释里的英文拼写',                            '写文档 / 注释多'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>settings.json 模板（开箱即用）</h3>
      <p style={p}>按 <code style={ic}>Ctrl+Shift+P</code> → 输入 <code style={ic}>Preferences: Open User Settings (JSON)</code>，把下面整段粘进去。</p>
      <pre style={codeBlock}>{`{
  // —— 字体与显示 ——
  "editor.fontFamily": "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  "editor.fontSize": 14,
  "editor.fontLigatures": true,
  "editor.lineHeight": 1.6,
  "editor.cursorBlinking": "smooth",
  "editor.cursorSmoothCaretAnimation": "on",
  "editor.smoothScrolling": true,
  "editor.minimap.enabled": false,
  "workbench.iconTheme": "material-icon-theme",

  // —— 编辑行为 ——
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  "editor.linkedEditing": true,
  "editor.stickyScroll.enabled": true,
  "files.autoSave": "onFocusChange",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,

  // —— 终端 ——
  "terminal.integrated.fontFamily": "'JetBrains Mono'",
  "terminal.integrated.fontSize": 13,
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "terminal.integrated.defaultProfile.linux": "bash",

  // —— Git ——
  "git.confirmSync": false,
  "git.autofetch": true,
  "git.enableSmartCommit": true,

  // —— 语言专属 ——
  "[javascript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescriptreact]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[python]": { "editor.defaultFormatter": "ms-python.black-formatter" },
  "[json]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },

  // —— Claude Code ——
  "claude-code.autoApproveEdits": false,
  "claude-code.preferredModel": "claude-opus-4-7"
}`}</pre>

      <InfoCard type="tip" title="字体安装">
        推荐 <strong>JetBrains Mono</strong>（免费、好看、连字）：
        <code style={ic}> https://www.jetbrains.com/lp/mono/</code> 下载后，Windows 双击 install / Mac 双击安装 / Linux 放到 <code style={ic}>~/.local/share/fonts</code> 跑 <code style={ic}>fc-cache -f</code>。
      </InfoCard>
    </div>
  )
}

// ─── Section 5: Git ───────────────────────────────────────────────────────────

function SectionGit() {
  return (
    <div>
      <h3 style={h3}>第一次装完 Git 必做</h3>
      <pre style={codeBlock}>{`# 1. 设置全局身份（提交时用的名字和邮箱）
git config --global user.name "你的名字"
git config --global user.email "your@email.com"

# 2. 默认主分支用 main 不用 master
git config --global init.defaultBranch main

# 3. 拉取时默认走 rebase（保持线性历史，不要 merge commit）
git config --global pull.rebase true

# 4. 把 LF 行尾符强制统一（Windows 用户必做）
git config --global core.autocrlf input

# 5. 让 Git 显示中文不乱码
git config --global core.quotepath false

# 6. 长期凭据缓存（HTTPS clone 不用每次输密码）
git config --global credential.helper store

# 7. 美化 log
git config --global alias.lg "log --oneline --graph --decorate --all"
# 之后用 git lg 看分支图`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>SSH key 一次配齐</h3>
      <pre style={codeBlock}>{`# 1. 生成 ed25519 密钥（比 RSA 安全且短）
ssh-keygen -t ed25519 -C "your@email.com"
# 一路回车，密码可设可不设

# 2. 启动 ssh-agent 把 key 加进去
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 3. 复制公钥（注意是 .pub 后缀的）
# Windows: cat ~/.ssh/id_ed25519.pub | clip
# Mac:     cat ~/.ssh/id_ed25519.pub | pbcopy
# Linux:   cat ~/.ssh/id_ed25519.pub | xclip -selection clipboard

# 4. 粘到 GitHub: Settings → SSH and GPG keys → New SSH key

# 5. 验证
ssh -T git@github.com
# 看到 "Hi xxx! You've successfully authenticated" 就 ok`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>多账号切换（学校号 + 工作号）</h3>
      <pre style={codeBlock}>{`# ~/.ssh/config 写入：
Host github.com-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal

Host github.com-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work

# clone 时改 host：
git clone git@github.com-work:company/repo.git
git clone git@github.com-personal:yourname/blog.git

# 每个仓库局部设邮箱：
cd company/repo && git config user.email "work@company.com"`}</pre>

      <ResourceCard title="Pro Git（中文版）" url="https://git-scm.com/book/zh/v2" desc="Git 官方书中文版，完整免费在线阅读。" tag="官方" />
    </div>
  )
}

// ─── Section 6: Lang Managers ────────────────────────────────────────────────

function SectionLangManagers() {
  return (
    <div>
      <InfoCard type="warning" title="为什么要版本管理器">
        不同项目可能要不同版本（这个项目 Node 18，那个 Node 22）。<strong>用版本管理器，一条命令切换</strong>，比卸载重装好用一万倍。
      </InfoCard>

      <h3 style={h3}>Node.js → nvm</h3>
      <pre style={codeBlock}>{`# Mac / Linux / WSL
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# 重开终端

# Windows: 用 nvm-windows（不是同一个项目，但命令兼容）
# https://github.com/coreybutler/nvm-windows/releases

# 装 LTS + 最新版
nvm install --lts
nvm install latest

# 切换
nvm use 22
nvm use --lts

# 项目根目录放 .nvmrc 写明版本，进目录自动切换
echo "22.11.0" > .nvmrc`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>Python → uv（新潮）或 venv（标配）</h3>
      <pre style={codeBlock}>{`# 方案 A：用 uv（Rust 写的，比 pip 快 10-100 倍，2024 后强烈推荐）
# Mac / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

uv venv .venv               # 建虚拟环境
source .venv/bin/activate   # 激活（Windows: .venv\\Scripts\\activate）
uv pip install -r requirements.txt

# 方案 B：标准库 venv（稳但慢）
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 想要"切 Python 版本"：用 pyenv
curl https://pyenv.run | bash
pyenv install 3.12.7
pyenv global 3.12.7`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>Java → SDKMAN!</h3>
      <pre style={codeBlock}>{`# Mac / Linux / WSL（Windows 用 WSL 跑）
curl -s "https://get.sdkman.io" | bash
# 重开终端

sdk list java          # 看所有可用版本
sdk install java 21.0.5-tem   # 装 Eclipse Temurin 21
sdk default java 21.0.5-tem   # 设默认

# 切换
sdk use java 17.0.13-tem      # 临时（当前 shell）
sdk default java 17.0.13-tem  # 永久

# 也能装 Maven / Gradle / Kotlin / Scala
sdk install maven
sdk install gradle`}</pre>

      <InfoCard type="tip" title="一表汇总">
        Node → <strong>nvm</strong>（Mac/Linux）/ <strong>nvm-windows</strong>（Windows）<br />
        Python → <strong>uv + venv</strong>（推荐）/ <strong>pyenv</strong>（多版本）<br />
        Java → <strong>SDKMAN!</strong>（无敌）<br />
        Go → <strong>gvm</strong> 或直接装最新（向后兼容好，不太需要切版本）<br />
        Ruby → <strong>rbenv</strong>（如果你真用 Ruby）
      </InfoCard>
    </div>
  )
}

// ─── Section 7: Docker ───────────────────────────────────────────────────────

function SectionDocker() {
  return (
    <div>
      <p style={p}>Docker 是大三大四的常客：跑数据库、跑 Redis、跑别人的开源项目，不想污染本机环境就装它。</p>

      <pre style={codeBlock}>{`# 1. 装 Docker Desktop（Windows / Mac）
# 官网下载 https://www.docker.com/products/docker-desktop/
# Windows 安装后会自动启用 WSL2 集成

# Linux 装 Docker Engine（无 GUI）：
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# 退出重登终端

# 2. 验证
docker --version
docker run hello-world   # 拉一个 hello-world 镜像跑一下

# 3. 国内加速（重要！）
# 编辑 ~/.docker/daemon.json（Mac/Linux）或 Docker Desktop 设置 → Docker Engine
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://dockerproxy.com"
  ]
}
# 改完重启 Docker

# 4. 最常用的几个命令
docker ps                  # 看运行中的容器
docker ps -a               # 看所有容器（含停了的）
docker images              # 看本地镜像
docker stop <id>           # 停容器
docker rm <id>             # 删容器
docker exec -it <id> bash  # 进容器 shell
docker compose up -d       # 后台跑 compose 文件

# 5. 学生最常用的"开发数据库"
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 mysql:8
docker run -d --name redis -p 6379:6379 redis:7
docker run -d --name pg -e POSTGRES_PASSWORD=root -p 5432:5432 postgres:16`}</pre>

      <InfoCard type="info" title="什么时候不用 Docker">
        本机 ≤ 8GB 内存的话 Docker 会拖垮整机。这种情况：用本机包管理器装 MySQL / Redis，或者用 SQLite。
      </InfoCard>
    </div>
  )
}

// ─── Section 8: Terminal ─────────────────────────────────────────────────────

function SectionTerminal() {
  return (
    <div>
      <p style={p}>终端美化不是花架子，<strong>命令补全和语法高亮真的提速</strong>。建议初学就装。</p>

      <h3 style={h3}>zsh + Oh My Zsh（Mac / Linux / WSL）</h3>
      <pre style={codeBlock}>{`# 1. zsh（Mac 自带；Linux/WSL 要装）
sudo apt install -y zsh
chsh -s $(which zsh)   # 切默认 shell，注销重登生效

# 2. Oh My Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 3. 两个必装插件
git clone https://github.com/zsh-users/zsh-autosuggestions \\
  ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting \\
  ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting

# 4. 编辑 ~/.zshrc 找到 plugins=(git) 改成：
plugins=(git zsh-autosuggestions zsh-syntax-highlighting z)

# 5. 主题（个人最爱 powerlevel10k）
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \\
  \${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
# 改 ~/.zshrc：ZSH_THEME="powerlevel10k/powerlevel10k"

# 6. 重开终端，p10k 会引导你配置`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>Windows Terminal（PowerShell 美化）</h3>
      <pre style={codeBlock}>{`# 1. 装 oh-my-posh（PowerShell 美化器）
winget install JanDeDobbeleer.OhMyPosh -s winget

# 2. 编辑配置（$PROFILE 文件，不存在就创建）
notepad $PROFILE

# 把下面这行加进去：
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH\\jandedobbeleer.omp.json" | Invoke-Expression

# 3. PSReadLine 增强补全（PowerShell 已自带，调一下配置）
Set-PSReadLineOption -PredictionSource HistoryAndPlugin
Set-PSReadLineOption -PredictionViewStyle ListView`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>必学的 20 个 VSCode 快捷键</h3>
      <CompareTable
        headers={['操作', 'Win / Linux', 'Mac']}
        rows={[
          ['命令面板',           'Ctrl + Shift + P',  'Cmd + Shift + P'],
          ['快速打开文件',        'Ctrl + P',          'Cmd + P'],
          ['全局搜索文件内容',     'Ctrl + Shift + F',  'Cmd + Shift + F'],
          ['当前文件内搜索',       'Ctrl + F',          'Cmd + F'],
          ['替换',               'Ctrl + H',          'Cmd + Option + F'],
          ['跳转到定义',          'F12',               'F12'],
          ['查看引用',            'Shift + F12',       'Shift + F12'],
          ['重命名符号',          'F2',                'F2'],
          ['多光标（点击）',       'Alt + 点击',         'Option + 点击'],
          ['多光标（下一个相同）', 'Ctrl + D',          'Cmd + D'],
          ['多光标（所有相同）',   'Ctrl + Shift + L',  'Cmd + Shift + L'],
          ['上下移动当前行',       'Alt + ↑/↓',          'Option + ↑/↓'],
          ['复制当前行到下方',     'Shift + Alt + ↓',    'Shift + Option + ↓'],
          ['删除整行',           'Ctrl + Shift + K',   'Cmd + Shift + K'],
          ['注释/取消注释',       'Ctrl + /',           'Cmd + /'],
          ['折叠/展开代码',       'Ctrl + Shift + [/]', 'Cmd + Option + [/]'],
          ['打开/关闭终端',       'Ctrl + `',           'Cmd + `'],
          ['切换侧边栏',          'Ctrl + B',           'Cmd + B'],
          ['切换文件',           'Ctrl + Tab',         'Ctrl + Tab'],
          ['Zen 模式（专注）',    'Ctrl + K Z',         'Cmd + K Z'],
        ]}
      />
    </div>
  )
}

// ─── Section 9: Verify ───────────────────────────────────────────────────────

function SectionVerify() {
  return (
    <div>
      <p style={p}>装完跑一下这个脚本，看哪些工具齐了。复制到终端直接执行。</p>

      <h3 style={h3}>Bash / zsh（Mac / Linux / WSL）</h3>
      <pre style={codeBlock}>{`#!/usr/bin/env bash
# 把下面整段保存为 check-env.sh，chmod +x，跑 ./check-env.sh

check() {
  if command -v $1 &> /dev/null; then
    printf "✅ %-12s %s\\n" "$1" "$($1 $2 2>&1 | head -1)"
  else
    printf "❌ %-12s 未安装\\n" "$1"
  fi
}

echo "—— 必备工具 ——"
check git --version
check node --version
check npm --version
check python3 --version
check java --version
check docker --version

echo "—— 编辑器 / 工具 ——"
check code --version
check curl --version
check wget --version
check jq --version

echo "—— Shell 增强 ——"
check zsh --version
[[ -d ~/.oh-my-zsh ]] && echo "✅ oh-my-zsh   已装" || echo "❌ oh-my-zsh   未装"
[[ -d ~/.nvm ]]       && echo "✅ nvm         已装" || echo "❌ nvm         未装"`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>PowerShell（Windows）</h3>
      <pre style={codeBlock}>{`# 把下面保存为 check-env.ps1，PowerShell 跑 .\\check-env.ps1

function Check($name, $arg = "--version") {
  if (Get-Command $name -ErrorAction SilentlyContinue) {
    $ver = & $name $arg 2>&1 | Select-Object -First 1
    Write-Host ("✅ {0,-12} {1}" -f $name, $ver)
  } else {
    Write-Host ("❌ {0,-12} 未安装" -f $name) -ForegroundColor Red
  }
}

Write-Host "—— 必备工具 ——"
Check git
Check node
Check npm
Check python
Check java
Check docker

Write-Host "—— 编辑器 / 工具 ——"
Check code
Check curl
Check jq

Write-Host "—— WSL ——"
if (Get-Command wsl -ErrorAction SilentlyContinue) {
  $distro = wsl -l -v | Select-Object -Skip 1
  Write-Host "✅ wsl          $distro"
} else {
  Write-Host "❌ wsl          未启用" -ForegroundColor Red
}`}</pre>

      <InfoCard type="tip" title="装完往哪走">
        环境好了就该写代码。建议路线：本站 <a href="/ai" style={linkStyle}>AI 工具实战</a>（装 Claude Code）→ <a href="/github" style={linkStyle}>GitHub 入门</a>（建第一个仓库）→ <a href="/projects" style={linkStyle}>项目指南</a>（选个项目开干）→ <a href="/algo" style={linkStyle}>算法可视化</a>（边学边练）。
      </InfoCard>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const p = { fontSize: 'var(--fs-md)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-loose)', marginBottom: 'var(--space-4)' }
const h3 = { fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--text-primary)', margin: 'var(--space-5) 0 var(--space-3) 0' }
const linkStyle = { color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }
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
  fontSize: 'var(--fs-sm)',
  padding: '1px 6px',
  borderRadius: 4,
  background: 'var(--surface-2)',
  color: 'var(--accent-light)',
}
