# CS Hub — 计算机科学与技术一站式学习平台

> 面向计算机科学与技术专业学生的交互式学习平台，涵盖数据结构、算法、操作系统、计算机网络、数据库、编译原理、体系结构七大核心学科。

**在线访问：[cshubs.top](https://cshubs.top)**

---

## 功能亮点

- **算法可视化** — 动画演示排序、图论、动态规划等经典算法的执行过程
- **交互式测验** — 每个算法附带选择题，答题后实时反馈正误与解析
- **错题本** — 自动记录答错的题目，方便针对性复习
- **学习进度** — 追踪各学科完成情况，徽章系统激励持续学习
- **本周周报** — 每周学习数据汇总，包含七日练习柱状图
- **学习目标** — 自定义目标算法数量，进度条可视化跟进
- **收藏夹** — 收藏感兴趣的算法，支持自定义文件夹分组
- **连续学习** — Streak 打卡机制，记录最长连续学习天数
- **云端同步** — 可选接入 Supabase，登录后跨设备同步所有进度

## 技术栈

| 层次 | 技术 |
|------|------|
| 前端框架 | React 19 + Vite 8 |
| 样式 | Tailwind CSS v4 |
| 路由 | React Router v7 |
| 后端/Auth | Supabase（PostgreSQL + RLS + GitHub OAuth） |
| 部署 | Vercel |

## 本地运行

```bash
# 克隆项目
git clone https://github.com/Algebraaaa/cshub.git
cd cshub

# 安装依赖
npm install

# 启动开发服务器（无需配置 Supabase，本地模式即可运行）
npm run dev
```

### 可选：启用云同步

复制 `.env.example` 为 `.env.local`，填入 Supabase 项目的 URL 和 anon key：

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

不填则自动切换为本机存储模式，全部数据保存在浏览器 localStorage 中。

## 雅思复盘与刻意练习（/ielts）

入口：导航「个人成长」页，或直接访问 `/ielts`。包含阅读复盘、听力复盘、错题库与弱点画像、
整套报告、写作训练、口语训练、词块库七个模块。**判题、错题库、统计、词块与计时无需联网即可使用**；
逐题讲解、写作/口语反馈由用户自带 key 的大模型提供，没有 key 时给醒目标注的「模拟反馈」。

### 配置自己的模型 key

1. 打开 `/ielts/settings`，服务商默认选 DeepSeek（OpenAI 兼容接口）；
2. 填 API key、模型名（如 `deepseek-chat`）即可。其他 OpenAI 兼容服务商改一下接口地址和模型名即可；
3. key 只保存在你浏览器的 localStorage，不进仓库、不进构建产物；发送前页面会展示将发送的内容。
4. 若服务商不允许浏览器直连，可选择「同源中转」并部署仓库自带的 Vercel Function
   `api/ielts/llm.js`（只转发、不保存、模板白名单 + 长度/超时限制；`vercel.json` 已排除 `/api` 被 SPA 重写）。

### 导入写作笔记与口语话题

- 写作知识卡：`/ielts/settings` 支持 Markdown（每张卡以 `## 标题` 开始）或 JSON `[{title, body, area}]`；
- 口语本季话题清单：`/ielts/speaking` 点「导入本季清单」，纯文本每行一个话题，或 JSON；
- 词块库：`/ielts/vocab` 支持每行 `英文 | 中文 | 例句 | 搭配`，或 JSON 导入，可收藏与自定义。

### 整套报告与间隔复习

- `/ielts/sets` 把同一来源标签下的阅读三篇 / 听力四个 Part 归成一套：整套用时、各部分正确率、
  逐部分估算 band 与跨次趋势，可导出 Markdown 或用打印样式另存 PDF；
- 错题、我的替换库、收藏词块自动进入间隔复习（1→2→4→7→15→30→60 天，自评忘了/困难/正常/简单），
  首页显示“今日复习”；
- 每次模型调用写本地脱敏日志（模板 id/版本、状态、证据校验、字段名、短哈希，无 key 无正文），
  可在设置页导出复现包；`npm run ielts:check-templates` 用固定正反样例做离线质量回归。

### 导出对话客户端插件

同一份模板注册表和训练路径定义可导出给无界面的对话式客户端（斜杠命令）：

```bash
npm run ielts:export-harness   # 生成 dist-harness/ielts/system-prompt.md 与 commands.json
npm run ielts:check-harness    # 校验导出与网页版定义一致（CI 可接）
```

个人数据（错题库、会话、进度、笔记、设置）在 `/ielts/settings` 一键导出 JSON 或清空；
导出默认不含 API key。仓库不内置任何官方/剑桥真题、音频或文稿，示例均为原创并标注「非真题」。
规则来源与非官方假设见 `docs/ielts/RULES.md`，架构见 `docs/ielts/ARCHITECTURE.md`。

## 学科覆盖

- **数据结构** — 数组、链表、栈、队列、树、图、堆、哈希表
- **排序算法** — 冒泡、选择、插入、归并、快速、堆排序等
- **图论算法** — BFS、DFS、Dijkstra、Floyd、Prim、Kruskal
- **动态规划** — LCS、背包、最长递增子序列等经典问题
- **操作系统** — 进程调度、内存管理、文件系统、死锁
- **计算机网络** — TCP/UDP、HTTP、路由算法
- **数据库** — 关系代数、索引、事务、MVCC、查询优化
- **编译原理** — LL(1) 语法分析、LR(0)、中间代码生成

## 项目结构

```
src/
├── pages/          # 页面组件（首页、算法页、个人中心等）
├── components/     # 通用组件（可视化、测验、个人中心模块）
├── contexts/       # 全局状态（进度、成就、认证、主题）
├── data/           # 算法元数据与题目数据
├── layout/         # 顶部导航、底部移动端导航
└── services/       # 本地数据服务（同步、最近访问）
```

## 数据安全

- 所有 Supabase 表均启用行级安全（RLS），用户只能读写自己的数据
- `.env.local` 已加入 `.gitignore`，密钥不会泄露到代码仓库
- `service_role` 密钥仅用于后端/管理员操作，永远不应出现在前端代码中

## License

MIT
