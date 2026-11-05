# 五门专业课内容审计（docs/COURSE_AUDIT.md）

> 整合工作仍在进行：以下保留候选实现的审计记录作为线索，并非对所有代码示例的最终验收。部分页面里的 C++ 示例仍缺类型、常量或辅助函数，不能单独编译运行；包装脚本注入驱动或辅助代码后通过，不能证明原始示例本身已完整修复。后续须逐项修复、独立运行并核对结果。

- 审计范围（生成器）：`src/algorithms/cpuScheduling/`、`src/algorithms/pageReplacement/`、
  `src/algorithms/disk/`、`src/algorithms/synchronization/`、`src/algorithms/database/`、
  `src/algorithms/network/`、`src/algorithms/co/`、`src/algorithms/compiler/`
  全部导出的步骤生成器；`src/algorithms/p0Topics.js` 中属于这五门课的部分；
  `src/data/algorithms/os.js`、`src/data/algorithms/db.js`、
  `src/data/algorithms/network.js`、`src/data/algorithms/co.js`、
  `src/data/algorithms/compiler.js` 里的 C++/Python 示例；
  `src/data/extraAlgorithms.js` 中相关条目（14 个，fn 冒烟全过）。
- 口径：操作系统汤小丹等《计算机操作系统（第四版）》、组成唐朔飞《计算机组成原理》、
  网络谢希仁《计算机网络（第 8 版）》、数据库萨师煊/王珊《数据库系统概论》、
  编译陈火旺《程序设计语言——编译原理》/ 龙书；标准：IEEE 754-2008、RFC 5681/9293。
- 自动产物：`npm run course:extract-snippets`（提取 32 组示例）与
  `npm run course:run-snippets`（编译/运行/比对），机器可读结果在
  `results.json`（运行脚本时生成，属于已忽略的临时构建产物）。
- 候选实现记录的问题见 `docs/CONVENTIONS.md` 第 5 节；各项修复前失败的情况尚需逐项复核。

## 1. 生成器结果检查（候选记录）

| 文件 | 导出 | 测试位置 | 结果 |
|---|---|---|---|
| cpuScheduling/nonPreemptive.js | `cpuSchedule` / `cpuFcfs` / `cpuSjf` / `cpuSrtn` | `src/algorithms/osGenerators.test.js` | 通过（教材短作业集 + 独立参考实现对拍 finish/周转/等待 + gantt 不变量） |
| cpuScheduling/roundRobin.js | `cpuRoundRobin` | 同上 | 通过（quantum 切出、空闲跳转、四进程 q=2 用例） |
| pageReplacement/{fifo,lru,opt}.js | `fifo` `lru` `opt` | 同上 | 通过（经典 20 串 15/12/9；200 次随机序列对拍容量 1–5） |
| disk/{fcfs,sstf,scan}.js | `fcfs` `sstf` `scan` | 同上 | 已检查边界扫描与最后请求折返两种口径，见 CONVENTIONS 第 1 条 |
| synchronization/bankers.js | `bankersAlgorithm` | 同上 | 通过（经典样例安全序列 P1→P3→P4→P0→P2；终态 Work=Available+ΣAllocation；不安全输入） |
| synchronization/philosophers.js | `diningPhilosophers` | 同上 | 通过（naive 死锁、资源序号场景吃面者叉子集合两两不相交） |
| p0Topics.js | `p0PipelineHazard`、`memoryTopic`×6、`osTopic`×3、`protocolTopic`×5 | `src/algorithms/p0Topics.test.js` | 通过（load-use 9 周期矩阵、连续分配 500K/300K/600K、IPv4 分片偏移 0/185/370 等） |
| database/hashJoin.js | `hashJoin` | `src/algorithms/dbGenerators.test.js` | 通过（与嵌套循环参考实现一致，含重复键/桶冲突；build/probe/match/miss 步数） |
| database/bPlusTree.js | `bPlusTreeInsert`(`bplustree`) | 同上 | 通过（m=3 强分裂不变量、200 个随机键全部可检索、叶子链有序、重复跳过） |
| database/mvcc.js | `mvccDemo` | 同上 | 通过（**修复 xid 序可见性 bug**；写冲突中止、VACUUM 只留当前版本） |
| database/transaction.js | `transactionScenario`(`txnIsolation`) | 同上 | 通过（RU 脏读/RC 阻止、RC 不可重复读/RR 一致、RC 幻读/RR 快照不幻） |
| database/queryPlan.js | `queryPlanSteps` | 同上 | 通过（select/join/group 每个计划节点都有 done） |
| network/slidingWindow.js | `slidingWindow` | `src/algorithms/networkGenerators.test.js` | 通过（**修复无丢包假超时 bug**；GBN 回退重传、乱序丢弃、停等退化） |
| network/tcpHandshake.js | `tcpHandshake` | 同上 | 通过（SYN→SYN+ACK→ACK 序号 100/300、四次挥手 FIN/ACK/FIN+ACK/ACK、TIME_WAIT） |
| network/tcpCongestion.js | `tcpCongestion` | 同上 | 通过（慢启动指数→16、3 dupACK ssthresh=10/cwnd=13、超时 ssthresh=8/cwnd=1） |
| co/cacheMap.js | `cacheMapping` `cacheDirect` `cacheSet` `cacheFully` | `src/algorithms/coGenerators.test.js` | 通过（默认序列 2 命中、300 次随机序列对拍直接映射、位数和=8、全相联 2 次回访命中） |
| co/ieee754.js | `ieee754` | 同上 | 通过（13.625 与 DataView 32 位编码逐位一致；-2.5、1.0、0/∞/NaN 特殊值） |
| co/pipeline.js | `fiveStagePipeline` `pipelineIdeal` `pipelineHazard` | 同上 | 通过（理想 n+4；**修复 totalCycles 11→9**；转发 MEM→EX/EX→EX） |
| compiler/regexToNfa.js | `regexToNfa` `regexToFinalNfa` | `src/algorithms/compilerGenerators.test.js` | 通过（NFA 接受/拒绝集合模拟、a/b/ab/a|b/a*/括号） |
| compiler/nfaToDfa.js | `nfaToDfa` | 同上 | 通过（**修复自环状态无限入队 bug**；DFA 与 NFA 语言等价、确定性、无 ε 边、abb 5 状态） |
| compiler/buildAst.js | `buildAst` | 同上 | 通过（1+2*3=7、左结合 10-2-3=5、括号、非法字符抛错） |
| compiler/codeGen.js | `codeGenSteps` | 同上 | 通过（arith TAC 指令数、未知 id 回退） |
| compiler/lr0.js | `lr0Steps` | 同上 | 通过（id+id 接受、6 个项集状态、accept 格） |
| compiler/ll1.js | `ll1Steps` | 同上 | 通过（id+id*id 接受、FIRST/FOLLOW 填表无冲突） |

原候选记录了生成器及 extraAlgorithms 的测试数量；这些历史数量不是当前整合版本的验收结果，实际通过情况以本次重新运行的测试日志为准。

## 2. C++/Python 示例（共 64 段）

自动流程：从 5 个 data 文件按 `slug` 提取 cpp/python 模板字符串 → 为可独立运行的算法
注入最小 driver（同一组输入，期望值直接取自 JS 生成器）→ `g++ -std=c++17` 编译运行、
`python3` 运行 → 逐行比对（尾随逗号归一化）。

| slug | 文件 | C++ | Python | 与生成器一致 |
|---|---|---|---|---|
| fifo | os | match | match | 是（20 串 FIFO=15） |
| lru | os | match | match | 是（LRU=12） |
| opt | os | match | match | 是（OPT=9） |
| diskfcfs | os | match | match | 是（498） |
| sstf | os | match | match | 是（248） |
| scan | os | 待复核 | 待复核 | 两种口径变更后需要重新进行独立运行比对 |
| cpufcfs | os | match | match | 是（finish 6,9,17,19,24） |
| cpusjf | os | match | match | 是（finish 6,11,24,8,16） |
| cpusrtn | os | match | match | 是（finish 11,4,24,6,16） |
| cpurr | os | match | match | 是（finish 14,6,24,11,22） |
| bankers | os | match | match | 是（**已修示例遍历次序**，seq 1,3,4,0,2） |
| philosophers | os | 编译通过、按设计常驻运行（3s 超时回收） | runs | 并发模式演示 |
| txnIsolation | db | 已修复脏读示例 | 已修复脏读示例 | 四种隔离级别与生成器脏读场景一致；其他场景待补充 |
| queryPlan | db | 已修复过滤和哈希连接示例 | 已修复过滤和哈希连接示例 | 已对照独立参考实现，含重复键；与预设计划步骤的逐步对应仍待补充 |
| bplustree / hashJoin / mvcc | db | teaching-fragment | teaching-fragment | 见下 |
| tcphandshake / tcpcongestion / slidingwindow | network | teaching-fragment | teaching-fragment | 见下 |
| ieee754 / cachemapdirect / cachemapset / cachemapfully / pipelineideal / pipelinehazard | co | teaching-fragment | teaching-fragment | 见下 |
| regexNfa / nfaToDfa / buildAst / ll1 / lr0 / codeGen | compiler | teaching-fragment | teaching-fragment | 见下 |

以上是原候选实现的脚本结果快照；代码与口径调整后须重新核验，不能将注入驱动的结果等同于页面源码可独立运行。

### teaching-fragment 的含义（未做成独立程序的原因）

这些代码存在缺失的辅助类型、常量或函数。它们的“teaching-fragment”标记是原候选实现的记录，不满足本任务要求的独立编译运行。生成器单测可以检查生成器行为，但不能替代对页面示例的独立验证；脚本添加驱动或辅助代码的结果也应单独说明。后续需补全页面示例，运行并和生成器比较，同时检查动画高亮。

## 3. 边界输入与不变量覆盖

- 空序列/单元素：置换（空=0 缺页、容量 1）、磁盘（空请求 0 寻道）、GBN（0 帧、窗口 1 退化停等）、Cache（空序列）。
- 重复/冲突：LRU 命中更新、B+ 树重复键跳过、Hash Join 重复键笛卡尔配对、SSTF 等距先到先服务。
- 强分裂/极端容量：B+ 树 m=3 全序列、页置换容量 1–5 随机对拍。
- 非法输入：正则括号不匹配抛错、表达式非法字符抛错、隔离级别/计划 id 的回退路径。
- 不变量：调度 gantt 总执行时长=Σburst 且等待≥0；Cache tag+index+offset 位数和=地址位数；
  DFA 每 (状态,符号) 至多一条转移且无 ε；LR(0)/LL(1) 都能接受样例输入。

## 3.5 课后题审计（src/data/quizzes.js 五门课 34 个 slug × 3 题 = 102 题）

- 结构完整性：每个 slug 恰 3 题、每题 4 个互异选项、answer 合法（唯一正确项），
  由 `src/data/quizLinkage.test.js` 用 `test.each` 逐 slug 强制。
- 原候选记录了逐题核对；当前整合尚未独立复核全部题目，不能据此宣称所有答案均正确。现有自动测试覆盖部分结构与生成器联动，仍须补充逐题来源和验算。
- 13 处“能算出结果”的题改为与生成器联动断言：置换三算法 15/12/9、SSTF 248/SCAN 到边界、
  RR 大时间片退化为 FCFS、银行家安全序列、IEEE 1+8+23、流水 n+k-1、Reno 10/13、
  GBN discard、片偏移 8 字节、片选 3 根线、NFA 6 状态、B+ 树扇出 100 存 1 亿约 4 层。
- 题目口径与生成器一致：SCAN 题为“扫到边界”（非 LOOK），RR“新到达先入队”由生成器对拍背书。

## 3.6 模型模板质量门（讲解输出）

`npm run ielts:check-templates`（夹具 `scripts/ielts/fixtures.mjs`）首次运行即发现并修复
7 处模板 validator 漏洞：阅读/听力定位句空串被误判非法（与“找不到不许编造”矛盾）、
session-summary 不限制 problems 条数也不校验 reasonId、写作 estimatedBand 不强制
“估算”开头/expressions 不要求 1–2 条、translation keyPoints 不要求 2–3、
口语 cueCard 不封顶、chunks/grammarFixes/estimates 白名单未强制（模型可偷发发音分）。
均已收紧 validator，正反夹具全部通过；详见 docs/ielts/REPETITION.md。

## 4. 复现命令

```bash
npm run course:extract-snippets   # 提取 32 组示例
npm run course:run-snippets       # g++/python3 编译运行并与生成器比对（失败退出码 1）
npm run course:check-transaction  # 页面事务示例独立运行，与脏读生成器结果比对
npm run course:check-query-plan   # 页面过滤/连接示例独立运行，与参考结果比对
npx vitest run src/algorithms/osGenerators.test.js \
  src/algorithms/p0Topics.test.js src/algorithms/dbGenerators.test.js \
  src/algorithms/networkGenerators.test.js src/algorithms/coGenerators.test.js \
  src/algorithms/compilerGenerators.test.js src/data/quizLinkage.test.js
npm run ielts:check-templates   # 模板正反样例质量门
```
