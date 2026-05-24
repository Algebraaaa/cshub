import { Link } from 'react-router-dom'
import GuideLayout from '../components/guide/GuideLayout'
import { InfoCard, StepCard, CompareTable, ResourceCard } from '../components/guide/GuideComponents'

const META = {
  icon: '💼',
  tag: '面试求职',
  title: 'CS 面试通关手册',
  subtitle: '从简历到 offer：时间线、八股清单、白板编程、行为面、AI 模拟面试 prompt——国内秋招/春招/实习全覆盖。',
  gradientFrom: '#141E30',
  gradientTo: '#243B55',
  stats: [
    { icon: '📅', label: '招聘时间线' },
    { icon: '📚', title: '6 大领域八股', label: '六大领域八股' },
    { icon: '🤖', label: 'AI 模拟面试' },
    { icon: '📝', label: '简历红线' },
  ],
}

const SECTIONS = [
  { icon: '📅', title: '招聘时间线：什么时候做什么',         content: <SectionTimeline /> },
  { icon: '📝', title: '简历红线：一页纸 + STAR 法则',       content: <SectionResume /> },
  { icon: '📚', title: '八股清单（6 大领域 · 50 题速查）',   content: <SectionTechQA /> },
  { icon: '💻', title: '白板编程 5 步法',                    content: <SectionWhiteboard /> },
  { icon: '🎤', title: '行为面 STAR + 高频问题',             content: <SectionBehavioral /> },
  { icon: '🤖', title: 'AI 模拟面试：4 套可复制 prompt',     content: <SectionAIMock /> },
  { icon: '🎓', title: '应届校招特化：实习 / GitHub / 笔试', content: <SectionFresh /> },
  { icon: '💰', title: '谈薪 + 选 offer + 三方签约',         content: <SectionOffer /> },
]

export default function InterviewGuidePage() {
  return <GuideLayout meta={META} sections={SECTIONS} />
}

// ─── Section 1: Timeline ──────────────────────────────────────────────────────

function SectionTimeline() {
  return (
    <div>
      <InfoCard type="warning" title="国内招聘时间线，错过下一年">
        国内 IT 招聘三大窗口：<strong>秋招（7-11 月）</strong>是主战场，<strong>春招（3-4 月）</strong>是补录，<strong>暑期实习（3-5 月投递，6-8 月在岗）</strong>是大三的隐藏王炸——表现好直接拿秋招提前批 offer。
      </InfoCard>

      <CompareTable
        headers={['时间', '阶段', '关键动作', '哪些公司']}
        rows={[
          ['大三 · 3-4 月',   '春招暑期实习投递',       '简历 v1 + LC 中等 100 起步',                   '字节、美团、滴滴、阿里、腾讯'],
          ['大三 · 5-8 月',   '暑期实习在岗',           '认真做事 + 求 mentor 内推 + 复盘八股',         '一边实习一边准备秋招'],
          ['大三 · 7 月',     '秋招提前批开闸',         '一些大厂提前抢人，常 1-3 面拿 offer',         '字节、美团、华为'],
          ['大四 · 8 月',     '秋招正式批',             '投所有想去的公司，笔试密集',                  '所有大厂、国企'],
          ['大四 · 9-10 月',  '秋招高峰',               '每周 5-10 场面试，需要心态稳',                  '主战场'],
          ['大四 · 11 月',    'offer 收割',             '谈薪、选 offer、拒掉多余的、签三方',          '抓住时间窗'],
          ['大四 · 3-4 月',   '春招补录',               '秋招没结果的最后机会',                        '中小厂、外企、国企二批'],
        ]}
      />

      <h3 style={h3}>不同身份的不同打法</h3>
      <CompareTable
        headers={['身份', '主战场', '关键策略']}
        rows={[
          ['本科应届',         '秋招正式批',                   '简历靠实习 + GitHub 项目；面试比拼八股 + LC'],
          ['硕士应届',         '秋招提前批 + 实习转正',         '论文 / 比赛加分；优先签实习公司'],
          ['博士应届',         '专项校招 / 研究院',             '走 AI Lab / 算法岗，论文质量决定一切'],
          ['转码 / 跨专业',    '秋招正式批 + 春招',            '简历突出"自学能力 + 项目"，弱化非 CS 背景'],
          ['社招 1-3 年',     '随时',                          '比应届少 30% 八股，多 70% 项目深度'],
        ]}
      />

      <ResourceCard title="本站 CS 路线图" url="/roadmap" desc="大学四年完整路线图，含每学期目标 + 项目推荐。" tag="本站" />
    </div>
  )
}

// ─── Section 2: Resume ────────────────────────────────────────────────────────

function SectionResume() {
  return (
    <div>
      <InfoCard type="danger" title="简历红线（违反即被秒拒）">
        ❌ 超过一页 A4 · ❌ 中英文混版乱排 · ❌ 写"精通 Java"但答不出 GC · ❌ 项目只列技术栈不写"我做了什么解决了什么" · ❌ 自我评价写"积极向上吃苦耐劳"
      </InfoCard>

      <h3 style={h3}>一份合格简历的硬指标</h3>
      <CompareTable
        headers={['区域', '内容', '占比']}
        rows={[
          ['头部',     '姓名 + 联系方式 + GitHub + 本科/硕士',                  '5%'],
          ['教育',     '学校 + 专业 + 绩点（≥3.5 写，否则不写）',                '5%'],
          ['实习',     '公司 + 岗位 + 时间 + 3 条 STAR 描述',                  '25%'],
          ['项目',     '2-3 个，每个 4-5 行 STAR 描述 + 量化结果',             '40%'],
          ['技能',     '分组列：语言 / 框架 / 工具，按熟练度排序',             '10%'],
          ['获奖 / 论文', '只写跟岗位相关的；ACM 银及以上、SCI 二区及以上',     '10%'],
          ['其他',     '英语 / 兴趣（可选）',                                   '5%'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>STAR 法则改写项目</h3>
      <p style={p}>STAR = Situation 背景 / Task 任务 / Action 行动 / Result 结果。<strong>烂简历只写 Action，好简历四件齐全</strong>。</p>

      <pre style={codeBlock}>{`❌ 烂版本（只有 Action）：
- 使用 React + Spring Boot + MySQL 开发了一个电商平台
- 实现了用户登录、商品列表、购物车、支付功能
- 部署到了 Vercel 和阿里云

✅ STAR 改写：
项目：高并发限时秒杀系统（GitHub 链接，120 star）
  S: 模拟 1000 QPS 秒杀场景，普通实现下 80% 请求超时
  T: 设计支持 5000 QPS 的稳定下单链路，超卖率 0%
  A: ①Redis 预扣减库存 + Lua 脚本保证原子性
     ②RabbitMQ 异步落库，前端轮询订单状态
     ③Nginx + 令牌桶限流，恶意请求拦在网关
  R: 压测稳定 5200 QPS，零超卖；项目获 GitHub 120 star`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>简历自检 10 问</h3>
      {[
        '是不是一页 A4？打印出来字号是不是 ≥10pt？',
        '联系方式 + GitHub 链接在头部 30px 内可见？',
        '所有时间线对齐（学校时间、实习时间、项目时间）？',
        '每个项目都有"做什么 / 怎么做 / 结果"三件？',
        '项目里有<strong>量化数据</strong>吗（QPS / 用户数 / 减少 % / star 数）？',
        '技能列表里写的每一项你都能讲 5 分钟以上？',
        '没有错别字 / 中英文标点混用 / 半角全角混乱？',
        '导出 PDF 后字体没乱码（用 Times New Roman / 思源宋体）？',
        '邮箱不是 QQ 邮箱（建议用学校 / Gmail / Outlook）？',
        '有没有把简历给至少 3 个人 review 过？',
      ].map((q, i) => <StepCard key={i} number={i + 1} title="" color="#fbbf24"><span dangerouslySetInnerHTML={{ __html: q }} /></StepCard>)}

      <ResourceCard title="OverLeaf 简历模板" url="https://www.overleaf.com/latex/templates/tagged/cv" desc="LaTeX 简历模板库，字体好看不易跑版。" tag="模板" />
      <ResourceCard title="超级简历 wondercv" url="https://www.wondercv.com/" desc="国内简历工具中较克制的一个，免费版够用。" tag="国内" />
    </div>
  )
}

// ─── Section 3: Tech Q&A ──────────────────────────────────────────────────────

function SectionTechQA() {
  return (
    <div>
      <p style={p}>这份清单覆盖国内大厂面试 90% 高频问题。每题给一句话答案锚点，深入展开看推荐资源。<strong>面试前一周每天背 10-20 个</strong>。</p>

      <h3 style={h3}>💻 操作系统（15 题）</h3>
      <CompareTable
        headers={['问题', '一句话答案锚点']}
        rows={[
          ['进程和线程的区别？',                  '资源拥有 vs CPU 调度的最小单位；进程有独立地址空间，线程共享'],
          ['进程间通信（IPC）有哪些方式？',         '管道 / 命名管道 / 信号量 / 共享内存 / 消息队列 / Socket'],
          ['死锁的 4 个必要条件？怎么避免？',     '互斥 / 占有等待 / 不剥夺 / 循环等待；银行家算法'],
          ['用户态 vs 内核态，怎么切换？',         '通过系统调用 / 中断 / 异常切换，开销大'],
          ['虚拟内存为什么存在？',                '让进程感觉拥有连续大内存；隔离 + 按需加载'],
          ['页面置换算法（FIFO/LRU/OPT）？',      <Link to="/algo/lru" style={ls}>来本站可视化感受一下</Link>],
          ['磁盘调度算法（FCFS/SSTF/SCAN）？',    <Link to="/algo/scan" style={ls}>本站可视化</Link>],
          ['零拷贝是什么？',                       'sendfile / mmap / splice 减少内核态用户态切换'],
          ['select / poll / epoll 区别？',         '事件触发机制；epoll 是 O(1)；用红黑树 + 双向链表'],
          ['进程调度算法？',                       'FCFS / SJF / 时间片轮转 / 多级反馈队列'],
          ['内存对齐为什么？',                     'CPU 访问效率；某些架构非对齐访问会 crash'],
          ['僵尸进程 / 孤儿进程？',                '父退子未退 vs 子退父未 wait；孤儿被 init 接管'],
          ['共享内存为什么快？',                   '直接映射到同一物理页，无内核拷贝'],
          ['信号 vs 信号量？',                     '通知 vs 同步原语'],
          ['fork() 后子进程内存？',                'COW（写时复制）'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>🌐 计算机网络（12 题）</h3>
      <CompareTable
        headers={['问题', '一句话答案锚点']}
        rows={[
          ['TCP 三次握手 / 四次挥手？',           '为啥 3 次：防止历史连接；为啥 4 次：被动方要先 ACK 后 FIN'],
          ['TCP 和 UDP 区别？',                  '可靠 vs 不可靠；面向连接 vs 无连接；流 vs 报文'],
          ['HTTP 1.0 / 1.1 / 2.0 / 3 区别？',     '长连接 / 管线化 / 多路复用 / QUIC over UDP'],
          ['HTTPS 加密流程？',                    'TLS 握手；非对称加密交换对称密钥；中间防 MITM 用证书'],
          ['DNS 解析过程？',                       '浏览器→hosts→本地 DNS→根→顶级域→权威；递归 + 迭代'],
          ['输入 URL 到看到页面发生了什么？',     'DNS → TCP → TLS → HTTP → 渲染（八股之王）'],
          ['TCP 拥塞控制？',                       '慢启动 / 拥塞避免 / 快重传 / 快恢复'],
          ['Cookie / Session / Token / JWT？',     '客户端存 vs 服务端存 vs 自包含校验'],
          ['CORS 跨域怎么解决？',                  '后端 Access-Control-Allow-Origin / 代理 / JSONP'],
          ['粘包 / 拆包问题？',                    'TCP 是字节流；定长 / 分隔符 / 包头加长度'],
          ['ARP / RARP？',                         'IP→MAC 映射；适用同网段'],
          ['CDN 工作原理？',                       '就近 DNS 解析到边缘节点；冷热缓存 + 回源'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>☕ Java + JVM（12 题）</h3>
      <CompareTable
        headers={['问题', '一句话答案锚点']}
        rows={[
          ['JVM 内存模型？',                       '堆（共享）/ 栈（线程独立）/ 方法区 / PC / 本地方法栈'],
          ['GC 算法？',                            '标记-清除 / 标记-复制 / 标记-整理 / 分代'],
          ['CMS vs G1 vs ZGC？',                  '老年代低延迟 vs 分区可预测 vs <10ms 大堆'],
          ['类加载机制？',                         '双亲委派；加载→验证→准备→解析→初始化'],
          ['HashMap 原理？',                       '数组 + 链表 + 红黑树（1.8 后）；扩容 2 倍；负载因子 0.75'],
          ['ConcurrentHashMap 怎么并发？',         '1.7 分段锁；1.8 CAS + synchronized 锁桶头'],
          ['volatile / synchronized / Lock？',     '可见性 + 禁重排 vs 互斥 + 重入 vs 灵活可中断'],
          ['ThreadLocal 原理？',                   '每个 Thread 持有一个 ThreadLocalMap，key 是弱引用'],
          ['线程池核心参数？',                    'corePoolSize / maxPoolSize / keepAlive / 队列 / 拒绝策略'],
          ['AQS 是什么？',                         'AbstractQueuedSynchronizer，CAS + 双向链表实现同步器'],
          ['Spring IOC / AOP？',                  'BeanFactory + 反射；JDK 代理 + CGLib'],
          ['Spring Bean 生命周期？',              '实例化 → 属性注入 → BeanNameAware → 初始化 → 销毁'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>🗄️ MySQL（10 题）</h3>
      <CompareTable
        headers={['问题', '一句话答案锚点']}
        rows={[
          ['B+ 树索引为什么？',                    '相比 B 树叶子相连利于范围查询；磁盘 IO 少'],
          ['事务 ACID 是什么？',                   '原子性 / 一致性 / 隔离性 / 持久性'],
          ['四种隔离级别 + 各自问题？',            '读未提交 / 已提交 / 可重复读（MySQL 默认）/ 串行化'],
          ['MVCC 怎么工作？',                      'undo log + read view + trx_id 判断可见性'],
          ['什么是回表？怎么避免？',                '非聚簇索引→主键索引；用覆盖索引 / 索引下推'],
          ['索引失效的场景？',                     '前导模糊 like / OR / 函数 / 隐式类型转换 / 联合索引不连续'],
          ['乐观锁 vs 悲观锁？',                   'version 字段 / select for update'],
          ['分库分表怎么做？',                     '水平 hash / 垂直拆字段；ShardingSphere'],
          ['主从复制原理？',                       'binlog → relay log → SQL thread 回放'],
          ['undo / redo / binlog 区别？',          '回滚 / 崩溃恢复 / 主从复制 + 增量备份'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>🔥 Redis（8 题）</h3>
      <CompareTable
        headers={['问题', '一句话答案锚点']}
        rows={[
          ['Redis 为什么这么快？',                 '纯内存 + 单线程避免上下文切换 + IO 多路复用 + 高效数据结构'],
          ['5 大数据结构 + 应用？',                 'String/List/Hash/Set/ZSet（计数/队列/对象/集合/排行）'],
          ['持久化 RDB vs AOF？',                  '快照 vs 操作日志；4.0 后混合'],
          ['缓存雪崩 / 穿透 / 击穿？',              '大量同时过期 / 不存在的 key / 热点 key 过期'],
          ['Redis 集群模式？',                     '主从 / 哨兵 / Cluster（16384 槽位）'],
          ['分布式锁怎么实现？',                   'SET NX EX + Redisson 看门狗续约'],
          ['热 key 怎么处理？',                    '本地缓存 + 多副本 + 分片'],
          ['内存淘汰策略？',                        'volatile-lru / allkeys-lru / noeviction 等 8 种'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>🧮 算法 / 数据结构（口述题）</h3>
      <CompareTable
        headers={['问题', '回答思路', '本站可视化']}
        rows={[
          ['手写快排',                <span>分治 + 三数取中 + 三路快排（重复元素优化）</span>, <Link to="/algo/quicksort" style={ls}>快排</Link>],
          ['判断链表有环',            <span>快慢指针；找环入口数学证明</span>,                  <Link to="/algo/linkedlist" style={ls}>链表</Link>],
          ['LRU 实现',                <span>HashMap + 双向链表</span>,                          <Link to="/algo/lru" style={ls}>LRU</Link>],
          ['最长递增子序列',          <span>O(n²) DP / O(n log n) 二分</span>,                  <Link to="/algo/lis" style={ls}>LIS</Link>],
          ['编辑距离',                <span>2D DP，三个状态转移</span>,                          <Link to="/algo/editdistance" style={ls}>编辑距离</Link>],
          ['最小生成树',              <span>Prim（堆优化）/ Kruskal（并查集）</span>,            <span><Link to="/algo/prim" style={ls}>Prim</Link> / <Link to="/algo/kruskal" style={ls}>Kruskal</Link></span>],
          ['最短路径',                <span>Dijkstra（正权）/ Bellman-Ford（负权）/ Floyd（任意两点）</span>, <Link to="/algo/dijkstra" style={ls}>Dijkstra</Link>],
          ['字符串匹配',              <span>KMP next 数组 / Rabin-Karp 滚动哈希</span>,           <span><Link to="/algo/kmp" style={ls}>KMP</Link> / <Link to="/algo/rabinkarp" style={ls}>Rabin-Karp</Link></span>],
        ]}
      />

      <ResourceCard title="JavaGuide" url="https://javaguide.cn/" desc="国内最完整 Java 后端八股 + 学习路线，开源 145k+ star。" tag="必看" tagColor="#ef4444" />
      <ResourceCard title="小林 coding（图解系列）" url="https://xiaolincoding.com/" desc="图解网络 / OS / MySQL / Redis。" tag="八股" />
      <ResourceCard title="代码随想录" url="https://programmercarl.com/" desc="算法八股 + 题型分类，校招党人手一份。" tag="算法" />
    </div>
  )
}

// ─── Section 4: Whiteboard ────────────────────────────────────────────────────

function SectionWhiteboard() {
  return (
    <div>
      <InfoCard type="info" title="白板编程是表演不是测试">
        面试官知道你紧张，他真正想看的是<strong>你怎么思考</strong>，不是写得多快。<strong>慢一点、说清楚、写得整齐</strong>，比刷题快但闷头写要分高得多。
      </InfoCard>

      <h3 style={h3}>5 步法（碰到任何题都用这个套路）</h3>
      {[
        { number: 1, title: '澄清（Clarify）', children: <>"输入有什么约束？空数组怎么办？字符全是小写吗？元素能重复吗？要返回索引还是值？" <strong>多问几个边界条件</strong>，避免做错。</> },
        { number: 2, title: '举例（Examples）', children: <>"我来举两个例子：[3,1,2] → ?；[] → ?。"在白板上写出来。<strong>用例子帮自己理清楚思路</strong>，也让面试官知道你理解了题。</> },
        { number: 3, title: '思路（Approach）', children: <>"我先想到暴力解 O(n²)，能不能优化？想用哈希表换 O(n)。" <strong>从暴力开始讲，再优化</strong>，展示思考过程。能讲清复杂度。</> },
        { number: 4, title: '编码（Code）', children: <>变量名取清楚（不用 i j k），写注释。<strong>一边写一边说"现在我把当前数 c 加进 map，看 target-c 是否在"</strong>。</> },
        { number: 5, title: '测试（Test）', children: <>跑一遍刚才举的例子，<strong>用手指点着代码模拟变量变化</strong>。再问一句"还有什么我应该注意的吗？"。</> },
      ].map((s, i) => <StepCard key={i} {...s} color="#22d3ee" />)}

      <h3 style={{ ...h3, marginTop: 24 }}>常见陷阱</h3>
      <CompareTable
        headers={['陷阱', '解药']}
        rows={[
          ['题目读完直接埋头写',     '先在白板上写"输入约束 + 边界 case + 解法选择"'],
          ['思路卡住沉默 30 秒',     '直接说"我现在卡在 X，想从 Y 角度试试"——让面试官有机会引导'],
          ['代码写错改得乱',         '宁可全部擦掉重写一个小函数，也别在原代码上小改小补'],
          ['提交后等面试官说话',     '主动说"我跑一遍 [1,2,3] 看看"，展示自测能力'],
          ['只写 happy path',       '主动说"还要处理空输入 / 负数 / 溢出"——加 5 分'],
        ]}
      />

      <ResourceCard title="LeetCode Hot 100" url="https://leetcode.cn/studyplan/top-100-liked/" desc="国内秋招手撕高频题前 100。本站 43 个可视化先看。" tag="必刷" />
    </div>
  )
}

// ─── Section 5: Behavioral ────────────────────────────────────────────────────

function SectionBehavioral() {
  return (
    <div>
      <p style={p}>行为面（HR 面或者技术 leader 闲聊）也用 <strong>STAR</strong>。问题不变，答案模板就是套结构。</p>

      <h3 style={h3}>10 个国内高频行为题</h3>
      <CompareTable
        headers={['问题', '套路答法']}
        rows={[
          ['自我介绍 1 分钟',                                  '学校 → 实习/项目 → 技术栈 → 想去哪个方向（首尾呼应公司）'],
          ['为什么选我们公司？',                                '具体到业务线 / 技术栈 / 团队，<strong>不要说"大平台"</strong>'],
          ['你最有成就感的项目？',                              'STAR + 量化结果 + 学到什么'],
          ['你最大的挑战 / 失败？',                              '真失败 + 怎么补救 + 之后改变了什么习惯'],
          ['和组员有过冲突吗？',                                '具体场景 + 怎么沟通 + 最后结论'],
          ['为什么从上一家离开？',                              '永远不说前公司坏话；说"想做更核心 / 更全栈 / 更大规模"'],
          ['五年后你想做什么？',                                '技术专家 / 技术管理选一条，别答"看机会"'],
          ['同时拿 A 公司 offer 怎么选？',                       '诚实但有偏好——说出你看重的具体维度'],
          ['对加班怎么看？',                                    '"接受合理加班但反对长期 996"——HR 不爱听完美奴隶'],
          ['你还有什么问题？',                                  '反问 3 个：业务方向 / 团队组成 / 入职后第一年的预期'],
        ]}
      />

      <InfoCard type="tip" title="反问环节的杀手锏">
        "我的简历看下来您觉得在 [岗位] 上还缺什么？" —— 这个问题让面试官认真思考，而且如果你的弱点不致命，他还会顺便告诉你后续应该补什么。
      </InfoCard>

      <h3 style={{ ...h3, marginTop: 24 }}>谈薪话术</h3>
      <pre style={codeBlock}>{`HR: 你期望薪资多少？

❌ 我希望 25k * 16 薪
   （HR 一听不超预期就压你）

✅ 我了解到贵司同类岗位本科应届一般在 22-30k 区间，
   结合我两段头部公司的实习经历和 GitHub 上 [项目名] 的
   开源经历，希望能在区间上半部分。具体看您方便给到的范围。

—— 后续如果给的低，可以说：
"我手上还在等 [另一家公司] 的 offer，
 他们前几天面试反馈不错。如果贵司能在 X 数字上有空间，
 我会优先考虑你们。"`}</pre>
    </div>
  )
}

// ─── Section 6: AI Mock ───────────────────────────────────────────────────────

function SectionAIMock() {
  return (
    <div>
      <p style={p}>用 Claude / ChatGPT 当陪练。配合 <Link to="/ai" style={ls}>本站 AI 指南</Link>，每天花 30 分钟模拟面试，3 周表达能力上一个台阶。</p>

      <h3 style={h3}>🎯 Prompt 1：算法白板模拟</h3>
      <pre style={codeBlock}>{`你现在是字节跳动后端面试官。
我是 [大三 / 硕一] CS 学生，目标岗位是后端开发。

请按以下流程模拟一场算法面试：
1. 先 30 秒自我介绍（你的，让我接你的话）
2. 出一道 LeetCode 中等难度的题（数组 / 字符串 / DP 类）
3. 我说思路时，你认真听并追问"为什么这样想"
4. 我写代码时不要打断，写完后你检查并指出 2-3 个改进点
5. 最后给我评分（满分 10）和具体改进建议

重要要求：
- 你扮演的面试官风格严但不刻薄
- 不要直接给答案，引导我自己想
- 时间控制：题目 + 思路讨论 + 编码不超过 30 分钟`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>🎯 Prompt 2：八股连环问</h3>
      <pre style={codeBlock}>{`你是腾讯 Java 后端面试官，请按"连环追问"方式问我八股。

规则：
1. 从一个基础问题开始（比如 ArrayList 和 LinkedList 区别）
2. 我回答后，根据答案的薄弱点深挖（"那 ArrayList 扩容机制是怎样的？" → "为什么不直接扩 2 倍？"...）
3. 一直追问到我答不出来，停下并解释正确答案
4. 然后换一个主题继续

主题池子：Java 集合 / 并发 / JVM / MySQL / Redis / Spring，每场涵盖 3-4 个主题。

我先来：[此处粘贴你的目标方向]`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>🎯 Prompt 3：行为面 STAR 练习</h3>
      <pre style={codeBlock}>{`你是腾讯 HR，请扮演终面行为面。

我的简历：
- [粘贴你的简历，或者主要项目和实习经历]

请按以下顺序问 5-7 个问题：
1. 自我介绍
2. 最有成就感的项目深挖
3. 一次失败 / 冲突经历
4. 为什么选我们 + 五年规划
5. 反问环节让我问你
6. 谈薪环节模拟

我每次回答后，请用 STAR 4 维度（背景/任务/行动/结果）评分（1-10），
并具体指出哪一段可以怎么改写。`}</pre>

      <h3 style={{ ...h3, marginTop: 24 }}>🎯 Prompt 4：系统设计</h3>
      <pre style={codeBlock}>{`你是阿里 P7 面试官，请出一道系统设计题。

我是后端方向应届生。请按以下结构引导我：
1. 出题："设计一个 [秒杀系统 / 短链生成 / 微博 Feed 流]"
2. 我开始时主动澄清需求和量级（QPS / 数据规模 / 一致性要求）
3. 让我画整体架构（用文字描述模块和数据流）
4. 深挖 2-3 个具体模块（数据库选型 / 缓存策略 / 限流方案）
5. 给我抛 1-2 个"如果 QPS 翻 10 倍怎么办"的扩展性问题
6. 最后给我评分 + 你的标准答案

不要一次性给所有提示，分步引导。`}</pre>

      <InfoCard type="info" title="怎么用">
        把 prompt 复制到 <Link to="/ai" style={ls}>Claude / ChatGPT</Link> 里。每天选一种类型，连续做 3 周。<strong>录音回放</strong>自己的回答比单纯 AI 反馈更有效——你会发现自己卡顿的地方。
      </InfoCard>
    </div>
  )
}

// ─── Section 7: Fresh ─────────────────────────────────────────────────────────

function SectionFresh() {
  return (
    <div>
      <h3 style={h3}>实习经历包装术</h3>
      <p style={p}>没有大厂实习不一定凉。<strong>把现有经历讲成有"业务价值"</strong>就行。</p>
      <CompareTable
        headers={['原始经历', '包装后说法']}
        rows={[
          ['学校实验室帮老师写脚本',  '"在 XX 实验室主导 数据预处理 pipeline，处理 N 万行数据，错误率从 X 降到 Y"'],
          ['给小公司写官网',          '"为 XX 公司独立交付企业官网，含 SEO 优化和 CDN 部署，首屏 LCP 从 X 秒降到 Y 秒"'],
          ['学校项目（团队）',         '"主导前端架构 + 部署，团队 5 人，我负责 X 模块，最终上线服务 N 用户"'],
          ['没有实习只有 GitHub',     '"开源 X 项目 N star，解决 X 类问题；被 Y 公司技术 blog 引用"'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>GitHub 项目展示策略</h3>
      <CompareTable
        headers={['做什么', '为什么']}
        rows={[
          ['每个项目写完整 README',    '面试官 30 秒能看懂；含演示截图 / 部署链接 / 技术栈说明'],
          ['至少 1 个项目 ≥ 30 star',  '社区认可的客观指标，简历加分'],
          ['给开源仓库提 PR',          '哪怕只是修个 typo，面试时能讲"我贡献过 X 项目"'],
          ['Pin 4-6 个优质项目',       'GitHub 首页是面试官第一眼看的'],
          ['持续 commit 习惯',         '小绿格连续 6 个月以上，能讲"持续投入"'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>笔试题型分布（按公司）</h3>
      <CompareTable
        headers={['公司类型', '题型', '难度']}
        rows={[
          ['字节 / 美团',     '4 道算法（简 + 中 + 中 + 难），90 分钟',         '中等偏难'],
          ['阿里 / 腾讯',    '2-3 道算法 + 选择题 + 简答（OS/网络/数据库）',   '中等'],
          ['华为 / 国企',    '3 道算法（注重输入处理）+ 部分笔试在线监控',       '中等'],
          ['外企（米哈游 / 沐瞳）','算法 + 设计题 + 部分英文题',                 '中等偏难'],
          ['银行 / 国企',    '行测 + 申论 + 专业题（弱化算法）',                  '简单'],
        ]}
      />

      <ResourceCard title="本站项目指南" url="/projects" desc="10 个推荐项目 + 完整深拆案例" tag="本站" />
      <ResourceCard title="本站环境配置" url="/setup" desc="装好开发环境是项目的前提" tag="本站" />
    </div>
  )
}

// ─── Section 8: Offer ─────────────────────────────────────────────────────────

function SectionOffer() {
  return (
    <div>
      <h3 style={h3}>多 offer 怎么选</h3>
      <p style={p}>应届第一份工作影响 3-5 年的轨迹。<strong>不要只看钱</strong>。</p>
      <CompareTable
        headers={['维度', '权重', '怎么打分']}
        rows={[
          ['团队 / 同事质量',   '⭐⭐⭐⭐⭐', 'leader 是不是技术大牛？组里有没有可以学的人？'],
          ['业务前景',          '⭐⭐⭐⭐',   '业务在公司里是 P0 还是边缘？未来 3 年扩张还是收缩？'],
          ['技术栈',            '⭐⭐⭐⭐',   '用主流技术还是闭门造车？能不能写进简历？'],
          ['平台 / 品牌',       '⭐⭐⭐⭐',   '5 年后跳槽时这段经历值钱吗？'],
          ['薪资 + 期权',       '⭐⭐⭐',     '应届税前 vs 综合年包；期权当 0 估值看待'],
          ['工作地点',          '⭐⭐⭐',     '北上深 vs 二线，房租通勤影响生活质量'],
          ['加班强度',          '⭐⭐',       '问内部员工，问 mentor'],
        ]}
      />

      <h3 style={{ ...h3, marginTop: 24 }}>三方协议（应届特有）</h3>
      <InfoCard type="warning" title="三方关键知识">
        三方 = 学生 + 学校 + 公司三方签字。<strong>一旦签了违约金从 5k 到 5 万不等</strong>。建议：<br />
        • 11 月前别急着签三方，等 offer 比较完<br />
        • 拿到 offer 看清楚违约条款（违约金 / 违约后多久能再签）<br />
        • 公司发的"录用意向书"不是 offer，没法律效力<br />
        • 签了三方后又有更好的 offer：能毁约就毁（赔钱），实在不行让新公司帮你赔
      </InfoCard>

      <h3 style={{ ...h3, marginTop: 24 }}>入职前必做</h3>
      {[
        { number: 1, title: '了解组内技术栈',       children: '主动联系 HR / mentor 要技术栈清单，提前学。' },
        { number: 2, title: '配好开发环境',          children: <>用 <Link to="/setup" style={ls}>环境配置指南</Link> 装好 Mac / WSL / Docker。</> },
        { number: 3, title: '熟悉 Git 工作流',       children: <>读 <Link to="/github" style={ls}>本站 GitHub 指南</Link>，会基本 PR / Code Review 流程。</> },
        { number: 4, title: '看一遍 LeetCode hot 100', children: '入职后没时间刷题，趁毕业前再过一遍。' },
        { number: 5, title: '调好作息',              children: '从大学放飞到工作正常 8-10 小时，需要适应期。' },
      ].map((s, i) => <StepCard key={i} {...s} color="#22c55e" />)}

      <InfoCard type="tip" title="最后一句">
        校招是<strong>所有职业生涯里最公平的一次招聘</strong>——只看你过去 4 年的积累，不看你出身、人脉、关系。<strong>认真准备 6 个月</strong>，普通学校也能进大厂。本站从 <Link to="/roadmap" style={ls}>路线图</Link> 到 <Link to="/algo" style={ls}>算法</Link> 到 <Link to="/ai" style={ls}>AI 工具</Link>，都是为你这一次冲刺准备的。
      </InfoCard>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
