import { p0PipelineHazard, memoryTopic, osTopic, protocolTopic, cryptoTopic, structureTopic } from '../algorithms/p0Topics'

const COMMON_CODE = {
  cpp: `// 教学可视化伪代码：真实系统实现会包含更多边界处理
void step() {
    // 读取当前状态
    // 执行本阶段动作
    // 更新状态并进入下一步
}`,
  python: `def step(state):
    # 教学可视化伪代码：真实系统实现会包含更多边界处理
    state = state.copy()
    return state`,
}

function entry({
  slug,
  name,
  nameEn,
  category,
  difficulty = '中等',
  fn,
  viz,
  desc,
  intuition,
  pseudo,
  time = 'O(1)',
  space = 'O(1)',
  apps = [],
}) {
  return {
    slug,
    name,
    nameEn,
    category,
    difficulty,
    fn,
    viz,
    timeComplexity: { best: time, average: time, worst: time },
    spaceComplexity: space,
    description: desc,
    intuition,
    pseudocode: pseudo,
    code: COMMON_CODE,
    applications: apps,
  }
}

export const EXTRA_ALGORITHMS = {
  pipelinehazard: entry({
    slug: 'pipelinehazard',
    name: '五级流水线冒险处理',
    nameEn: 'Pipeline Hazards',
    category: 'co',
    fn: p0PipelineHazard,
    viz: 'pipeline',
    desc: '展示 IF/ID/EX/MEM/WB 五级流水线中的数据冒险、STALL 气泡和数据转发。',
    intuition: '流水线让多条指令重叠执行，但相邻指令存在数据依赖时，后续指令可能过早读取旧值。硬件通常用停顿和转发解决这类冒险。',
    pseudo: `for each cycle:
    advance pipeline stages
    if load-use hazard:
        insert STALL
    if producer result is available:
        forward data to consumer`,
    apps: ['408 计算机组成原理', 'CPU 微体系结构入门', '面试中的流水线冒险问题'],
  }),

  instructioncycle: entry({
    slug: 'instructioncycle',
    name: '指令执行周期',
    nameEn: 'Instruction Cycle',
    category: 'co',
    fn: memoryTopic('instructioncycle'),
    viz: 'memory',
    desc: '按取指、译码、执行、访存、写回展示一条指令如何在 CPU 中完成。',
    intuition: '一条机器指令不是瞬间完成的，而是沿着控制器、寄存器、ALU 和存储器逐步流动。',
    pseudo: `IR = memory[PC]
decode(IR)
result = execute()
if needs_memory: access_memory()
write_back(result)
PC = next_pc`,
    apps: ['组成原理指令周期', '理解 CPU 如何执行程序'],
  }),

  mainmemorydecode: entry({
    slug: 'mainmemorydecode',
    name: '主存地址译码',
    nameEn: 'Memory Address Decoding',
    category: 'co',
    fn: memoryTopic('mainmemorydecode'),
    viz: 'memory',
    desc: '展示地址线如何经过译码器选择存储芯片与片内单元。',
    intuition: '地址并不是直接“找到数据”，而是先用高位做片选，再用低位定位片内偏移。',
    pseudo: `chip_select = decode(high_address_bits)
offset = low_address_bits
data = selected_chip[offset]`,
    apps: ['主存扩展题', '地址线/片选信号计算'],
  }),

  tlbtranslation: entry({
    slug: 'tlbtranslation',
    name: 'TLB 地址转换',
    nameEn: 'TLB Translation',
    category: 'memoryManagement',
    fn: memoryTopic('tlbtranslation'),
    viz: 'memory',
    desc: '展示虚拟页号查询 TLB、未命中后查页表并回填 TLB 的过程。',
    intuition: 'TLB 是页表项的高速缓存，用来避免每次访存都先查慢速页表。',
    pseudo: `vpn, offset = split(virtual_address)
if TLB has vpn:
    ppn = TLB[vpn]
else:
    ppn = page_table[vpn]
    TLB.insert(vpn, ppn)
physical_address = ppn + offset`,
    apps: ['OS 虚拟内存', '组成原理存储层次', '地址转换面试题'],
  }),

  virtualphysical: entry({
    slug: 'virtualphysical',
    name: '虚拟地址到物理地址',
    nameEn: 'Virtual to Physical Address',
    category: 'memoryManagement',
    fn: memoryTopic('virtualphysical'),
    viz: 'memory',
    desc: '展示页号查页表、页框号拼接偏移得到物理地址的过程。',
    intuition: '分页机制让进程看到连续虚拟地址，而物理内存可以离散分配。',
    pseudo: `page, offset = split(VA)
pte = page_table[page]
if not pte.valid: page_fault()
PA = pte.frame * page_size + offset`,
    apps: ['页表计算题', '缺页异常理解'],
  }),

  contiguousfit: entry({
    slug: 'contiguousfit',
    name: '连续内存分配 First/Best/Worst Fit',
    nameEn: 'Contiguous Memory Fit',
    category: 'memoryManagement',
    fn: memoryTopic('contiguousfit'),
    viz: 'memory',
    desc: '比较首次适应、最佳适应、最坏适应如何选择空闲分区。',
    intuition: '连续分配的核心问题是把作业放进哪个空闲洞；选择策略会影响外部碎片。',
    pseudo: `for block in free_list according to strategy:
    if block.size >= request:
        allocate block
        split remainder
        break`,
    apps: ['OS 内存管理', '外部碎片分析'],
  }),

  buddy: entry({
    slug: 'buddy',
    name: '伙伴系统 Buddy',
    nameEn: 'Buddy System',
    category: 'memoryManagement',
    fn: memoryTopic('buddy'),
    viz: 'memory',
    desc: '展示按 2 的幂拆分和释放时伙伴合并的内存分配过程。',
    intuition: 'Buddy 用规则化的 2^k 块减少管理成本，释放时可以快速判断能否合并。',
    pseudo: `need = next_power_of_two(request)
while no free block of need:
    split larger block into two buddies
allocate one block
on free: merge with free buddy`,
    apps: ['Linux 物理页分配思想', '内部碎片与合并'],
  }),

  deadlockgraph: entry({
    slug: 'deadlockgraph',
    name: '死锁检测资源分配图',
    nameEn: 'Resource Allocation Graph',
    category: 'synchronization',
    fn: osTopic('deadlockgraph'),
    viz: 'memory',
    desc: '用资源分配图展示持有边、请求边和等待环。',
    intuition: '当进程和资源之间形成环路，且资源实例数受限时，系统可能进入死锁。',
    pseudo: `build wait-for graph
if graph has cycle:
    report deadlock`,
    apps: ['OS 死锁检测', '银行家算法前置知识'],
  }),

  producerconsumer: entry({
    slug: 'producerconsumer',
    name: '生产者消费者',
    nameEn: 'Producer Consumer',
    category: 'synchronization',
    fn: osTopic('producerconsumer'),
    viz: 'memory',
    desc: '展示 empty/full/mutex 三个信号量如何协调有界缓冲区。',
    intuition: '生产者和消费者既要互斥访问缓冲区，又要在空/满条件下同步等待。',
    pseudo: `producer:
    wait(empty); wait(mutex)
    put()
    signal(mutex); signal(full)
consumer:
    wait(full); wait(mutex)
    get()
    signal(mutex); signal(empty)`,
    apps: ['PV 操作', '并发同步经典题'],
  }),

  readerswriters: entry({
    slug: 'readerswriters',
    name: '读者写者问题',
    nameEn: 'Readers Writers',
    category: 'synchronization',
    fn: osTopic('readerswriters'),
    viz: 'memory',
    desc: '展示多个读者可并发、写者必须独占的同步规则。',
    intuition: '读操作之间不冲突，但读写和写写冲突；关键是管理第一个/最后一个读者。',
    pseudo: `reader:
    readCount++
    if readCount == 1: wait(rwMutex)
    read()
    readCount--
    if readCount == 0: signal(rwMutex)
writer:
    wait(rwMutex); write(); signal(rwMutex)`,
    apps: ['数据库读写锁', 'OS 同步互斥'],
  }),

  dnsresolve: entry({ slug: 'dnsresolve', name: 'DNS 递归 / 迭代解析', nameEn: 'DNS Resolution', category: 'network', fn: protocolTopic('dnsresolve'), viz: 'protocol', desc: '展示本地 DNS 向根、顶级域、权威 DNS 逐级查询的过程。', intuition: 'DNS 把域名解析为 IP，本地 DNS 负责递归服务，对外通常做迭代查询。', pseudo: `query local DNS\nask root\nask TLD\nask authoritative\ncache result`, apps: ['输入 URL 流程', '计算机网络高频题'] }),
  httpflow: entry({ slug: 'httpflow', name: 'HTTP 请求响应', nameEn: 'HTTP Request Response', category: 'network', fn: protocolTopic('httpflow'), viz: 'protocol', desc: '展示浏览器发请求、服务器处理并返回响应的完整链路。', intuition: 'HTTP 是请求-响应模型，请求行、头部、正文和状态码是分析 Web 问题的基本单位。', pseudo: `connect\nsend request\nserver process\nsend response\nrender`, apps: ['Web 基础', 'URL 到页面过程'] }),
  tlshandshake: entry({ slug: 'tlshandshake', name: 'TLS 握手', nameEn: 'TLS Handshake', category: 'network', fn: protocolTopic('tlshandshake'), viz: 'protocol', desc: '展示 ClientHello、证书验证、密钥交换和加密通信建立。', intuition: 'TLS 用非对称机制协商密钥，再用对称加密保护后续 HTTP 数据。', pseudo: `ClientHello\nServerHello + Certificate\nverify cert\nkey exchange\nFinished`, apps: ['HTTPS 原理', '网络安全基础'] }),
  ipv4fragment: entry({ slug: 'ipv4fragment', name: 'IPv4 分片重组', nameEn: 'IPv4 Fragmentation', category: 'network', fn: protocolTopic('ipv4fragment'), viz: 'protocol', desc: '展示超过 MTU 的 IP 数据报如何分片并在目标主机重组。', intuition: 'IPv4 分片用标识、偏移和 MF 标志让目标主机恢复原始数据报。', pseudo: `if packet > MTU:\n    split into fragments\n    set id, offset, MF\nreceiver reassembles`, apps: ['IP 层考点', 'MTU 问题定位'] }),
  ripdistance: entry({ slug: 'ripdistance', name: '距离向量 RIP', nameEn: 'RIP Distance Vector', category: 'network', fn: protocolTopic('ripdistance'), viz: 'protocol', desc: '展示路由器交换距离向量并逐步收敛路由表。', intuition: 'RIP 的核心是“告诉邻居我到各网络有多远”，邻居据此做松弛更新。', pseudo: `for each neighbor vector:\n    dist[d] = min(dist[d], cost(neighbor)+neighbor.dist[d])`, apps: ['路由协议', 'Bellman-Ford 网络应用'] }),

  monotonicstack: entry({ slug: 'monotonicstack', name: '单调栈', nameEn: 'Monotonic Stack', category: 'dataStructures', fn: structureTopic('monotonicstack'), viz: 'advancedstructure', desc: '维护单调栈来在线求下一个更大/更小元素。', intuition: '栈中保留尚未找到答案的候选元素，新元素会结算被它支配的旧元素。', pseudo: `for x in nums:\n    while stack and x > stack.top:\n        answer[stack.pop] = x\n    stack.push(x)`, apps: ['每日温度', '柱状图最大矩形'] }),
  monotonicqueue: entry({ slug: 'monotonicqueue', name: '单调队列', nameEn: 'Monotonic Queue', category: 'dataStructures', fn: structureTopic('monotonicqueue'), viz: 'advancedstructure', desc: '维护窗口最大/最小值候选队列。', intuition: '比当前元素更差且更早过期的元素永远不会成为答案，可以从队尾删除。', pseudo: `push(x): pop smaller from back\nexpire old front\nfront is window optimum`, apps: ['滑动窗口最大值', 'DP 队列优化'] }),
  heapops: entry({ slug: 'heapops', name: '堆的插入 / 删除', nameEn: 'Heap Insert Delete', category: 'dataStructures', fn: structureTopic('heapops'), viz: 'advancedstructure', desc: '展示二叉堆插入上浮、删除堆顶下沉。', intuition: '堆用数组表示完全二叉树，局部上浮/下沉即可恢复堆序。', pseudo: `insert: append then siftUp\ndeleteTop: replace root with last then siftDown`, apps: ['优先队列', '堆排序'] }),
  dagshortest: entry({ slug: 'dagshortest', name: 'DAG 最短路', nameEn: 'DAG Shortest Path', category: 'graph', fn: structureTopic('dagshortest'), viz: 'advancedstructure', desc: '按拓扑序对有向无环图做一次松弛。', intuition: 'DAG 没有回边，拓扑序保证每个点被处理时，前驱的最短路已经确定。', pseudo: `topological_sort(G)\ndist[s]=0\nfor u in topo:\n    relax all edges u->v`, apps: ['拓扑 DP', '项目依赖路径'] }),
  binaryanswer: entry({ slug: 'binaryanswer', name: '二分答案', nameEn: 'Binary Search on Answer', category: 'dataStructures', fn: structureTopic('binaryanswer'), viz: 'advancedstructure', desc: '把优化问题转化为单调判定并二分边界。', intuition: '只要“可行/不可行”随答案单调变化，就可以二分第一个可行值。', pseudo: `while low < high:\n    mid = (low+high)//2\n    if ok(mid): high = mid\n    else: low = mid+1`, apps: ['最小最大值问题', '容量规划题'] }),
  prefixdiff: entry({ slug: 'prefixdiff', name: '前缀和 / 差分', nameEn: 'Prefix Sum and Difference', category: 'dataStructures', fn: structureTopic('prefixdiff'), viz: 'advancedstructure', desc: '展示区间查询和区间批量修改的两个基础技巧。', intuition: '前缀和把多次区间求和降为 O(1)，差分把区间加降为端点修改。', pseudo: `prefix[i]=prefix[i-1]+a[i]\nsum(l,r)=prefix[r]-prefix[l-1]\ndiff[l]+=v; diff[r+1]-=v`, apps: ['区间求和', '批量区间更新'] }),
  btree: entry({ slug: 'btree', name: 'B 树 / B+ 树', nameEn: 'B Tree and B+ Tree', category: 'tree', fn: structureTopic('btree'), viz: 'advancedstructure', desc: '展示多路平衡搜索树的节点分裂与 B+ 树叶子链。', intuition: 'B/B+ 树通过高分叉降低树高，非常适合磁盘和数据库索引。', pseudo: `insert key into leaf\nif node overflows:\n    split node\n    promote separator\nB+ leaves are linked`, apps: ['数据库索引', '文件系统索引'] }),

  hashavalanche: entry({ slug: 'hashavalanche', name: '哈希雪崩效应', nameEn: 'Hash Avalanche', category: 'security', fn: cryptoTopic('hashavalanche'), viz: 'crypto', desc: '展示输入微小变化如何让摘要大幅改变。', intuition: '安全哈希希望每一位输入都充分影响输出，避免从摘要反推出输入结构。', pseudo: `digest1 = H(message)\ndigest2 = H(message with 1-bit change)\ncompare digest1 and digest2`, apps: ['完整性校验', '签名前摘要'] }),
  aesround: entry({ slug: 'aesround', name: 'AES 教学版轮结构', nameEn: 'AES Round Structure', category: 'security', fn: cryptoTopic('aesround'), viz: 'crypto', desc: '用教学视角展示 AES 一轮中的替换、移位、列混合和轮密钥异或。', intuition: 'AES 通过混淆和扩散让明文与密钥的关系变得难以分析。', pseudo: `state = SubBytes(state)\nstate = ShiftRows(state)\nstate = MixColumns(state)\nstate = AddRoundKey(state, roundKey)`, apps: ['对称加密基础', '密码学入门'] }),
  rsaflow: entry({ slug: 'rsaflow', name: 'RSA 加解密流程', nameEn: 'RSA Encrypt Decrypt', category: 'security', fn: cryptoTopic('rsaflow'), viz: 'crypto', desc: '用小参数展示 RSA 公钥加密和私钥解密的数学流程。', intuition: 'RSA 的公开运算容易做，但没有私钥很难从密文恢复明文；教学示例只用于理解。', pseudo: `c = pow(m, e, n)\nm = pow(c, d, n)`, apps: ['非对称加密', 'HTTPS 密钥交换历史方案'] }),
  diffiehellman: entry({ slug: 'diffiehellman', name: 'Diffie-Hellman 密钥交换', nameEn: 'Diffie-Hellman', category: 'security', fn: cryptoTopic('diffiehellman'), viz: 'crypto', desc: '展示双方如何在公开信道上协商相同共享密钥。', intuition: '双方交换公开值，但真正的私钥不传输；离散对数难题保护共享密钥。', pseudo: `A = g^a mod p\nB = g^b mod p\nK1 = B^a mod p\nK2 = A^b mod p`, apps: ['TLS 密钥交换', '端到端加密'] }),
  digitalsignature: entry({ slug: 'digitalsignature', name: '数字签名与验签', nameEn: 'Digital Signature', category: 'security', fn: cryptoTopic('digitalsignature'), viz: 'crypto', desc: '展示哈希、私钥签名、公钥验签如何保证身份和完整性。', intuition: '签名不是隐藏消息，而是让接收方能验证消息确实来自私钥持有者且未被篡改。', pseudo: `digest = H(message)\nsig = Sign(privateKey, digest)\nVerify(publicKey, sig, H(message))`, apps: ['软件包签名', '证书体系', '区块链交易'] }),
}
