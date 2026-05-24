function cloneSteps(steps) {
  return steps.map((step, index) => ({
    phase: step.phase || 'step',
    event: step.event || step.phase || `step-${index}`,
    description: step.description,
    ...step,
  }))
}

export function p0PipelineHazard() {
  const instructions = [
    { asm: 'lw  R1, 0(R2)', desc: '从内存加载 R1，结果到 MEM 末尾才可用' },
    { asm: 'add R3, R1, R4', desc: '紧跟着使用 R1，形成 load-use 冒险' },
    { asm: 'sub R5, R3, R6', desc: '依赖上一条 ALU 结果，可通过转发解决' },
    { asm: 'and R7, R8, R9', desc: '独立指令，被前面的停顿顺延' },
  ]
  const totalCycles = 9
  const schedule = [
    ['IF', 'ID', 'EX', 'MEM', 'WB', null, null, null, null],
    [null, 'IF', 'ID', 'STALL', 'EX', 'MEM', 'WB', null, null],
    [null, null, 'IF', 'STALL', 'ID', 'EX', 'MEM', 'WB', null],
    [null, null, null, 'IF', 'STALL', 'ID', 'EX', 'MEM', 'WB'],
  ]
  const steps = [{
    cycle: -1,
    totalCycles,
    instructions,
    schedule,
    mode: 'hazard',
    phase: 'init',
    description: '五级流水线：IF/ID/EX/MEM/WB。示例展示 load-use 数据冒险、插入气泡和数据转发。',
  }]
  for (let c = 0; c < totalCycles; c += 1) {
    const active = instructions
      .map((_, i) => schedule[i][c] ? `I${i}:${schedule[i][c]}` : null)
      .filter(Boolean)
    const hasStall = active.some(item => item.includes('STALL'))
    steps.push({
      cycle: c,
      totalCycles,
      instructions,
      schedule,
      mode: 'hazard',
      phase: hasStall ? 'stall' : 'normal',
      forwarding: c === 4 ? 'MEM -> EX' : c === 5 ? 'EX -> EX' : null,
      description: `周期 ${c + 1}：${active.join('，') || '空闲'}${hasStall ? '；插入 STALL 气泡等待数据就绪。' : '。'}`,
    })
  }
  steps.push({
    cycle: totalCycles - 1,
    totalCycles,
    instructions,
    schedule,
    mode: 'hazard',
    phase: 'done',
    description: `完成：4 条指令在 ${totalCycles} 个周期内完成；停顿减少错误读数，转发减少额外等待。`,
  })
  return steps
}

const MEMORY_TOPICS = {
  instructioncycle: {
    title: '指令执行周期',
    actors: ['PC', '指令存储器', '控制器', 'ALU', '寄存器堆'],
    steps: [
      ['fetch', '取指：PC 给出地址，指令存储器返回当前指令。', ['PC=100', 'IR=lw R1,0(R2)']],
      ['decode', '译码：控制器识别操作码，读出源寄存器。', ['opcode=lw', 'R2=200']],
      ['execute', '执行：ALU 计算有效地址 R2+0。', ['EA=200']],
      ['memory', '访存：按有效地址读取主存数据。', ['M[200]=42']],
      ['writeback', '写回：把结果写入目标寄存器 R1。', ['R1=42', 'PC=104']],
    ],
  },
  mainmemorydecode: {
    title: '主存地址译码',
    actors: ['CPU 地址线', '译码器', '片选信号', '存储芯片'],
    steps: [
      ['addr', 'CPU 输出地址 0x2A，高位选择芯片，低位选择片内单元。', ['addr=00101010']],
      ['chip', '高位地址进入译码器，产生唯一片选信号 CS2。', ['A7..A5=001', 'CS2=1']],
      ['offset', '低位地址进入被选中芯片，定位片内偏移。', ['offset=01010']],
      ['data', '被选中芯片把数据放到数据总线。', ['D=0x3F']],
    ],
  },
  tlbtranslation: {
    title: 'TLB 地址转换',
    actors: ['CPU', 'TLB', '页表', 'Cache/内存'],
    steps: [
      ['split', '虚拟地址拆成 VPN 和页内偏移。', ['VA=0x12A4', 'VPN=0x12', 'offset=0xA4']],
      ['tlbmiss', '查询 TLB 未命中，硬件或操作系统访问页表。', ['TLB miss']],
      ['pagetable', '页表给出物理页号 PPN，并回填 TLB。', ['PPN=0x3B']],
      ['physical', '拼接 PPN 和 offset，得到物理地址。', ['PA=0x3BA4']],
    ],
  },
  virtualphysical: {
    title: '虚拟地址到物理地址',
    actors: ['进程 VA', '页表项 PTE', '物理内存帧'],
    steps: [
      ['split', '虚拟地址 = 页号 + 页内偏移，偏移在转换中保持不变。', ['page=5', 'offset=108']],
      ['pte', '查页表第 5 项，发现 valid=1，frame=2。', ['PTE[5]={valid:1, frame:2}']],
      ['compose', '物理地址 = frame 起始地址 + offset。', ['PA=2*4KB+108']],
      ['fault', '如果 valid=0，则触发缺页异常并调页。', ['page fault 分支']],
    ],
  },
  contiguousfit: {
    title: '连续内存分配',
    actors: ['作业队列', '空闲分区表', '内存'],
    steps: [
      ['init', '初始空闲分区：100K、500K、200K、300K、600K。', ['free=[100,500,200,300,600]']],
      ['first', 'First Fit：从低地址开始找，第一个足够大的 500K 被选中。', ['job=212K', 'choose=500K']],
      ['best', 'Best Fit：选择能容纳且剩余最小的 300K。', ['job=212K', 'choose=300K']],
      ['worst', 'Worst Fit：选择最大的 600K，尽量留下较大的剩余块。', ['job=212K', 'choose=600K']],
      ['compare', '三种策略本质是选择空闲分区的规则不同，会影响外部碎片。', ['外部碎片']],
    ],
  },
  buddy: {
    title: '伙伴系统 Buddy',
    actors: ['请求', '2^k 空闲块', '拆分/合并'],
    steps: [
      ['request', '请求 13K，向上取整为 16K 块。', ['request=13K', 'need=16K']],
      ['split', '没有 16K 时，把 64K 拆成两个 32K，再拆一个 32K 为两个 16K。', ['64 -> 32+32 -> 16+16']],
      ['allocate', '分配其中一个 16K，另一个 16K 保持空闲。', ['alloc=16K']],
      ['free', '释放后如果伙伴也空闲，就逐级合并回大块。', ['16+16 -> 32']],
    ],
  },
}

const OS_TOPICS = {
  deadlockgraph: {
    title: '死锁检测资源分配图',
    actors: ['P1', 'R1', 'P2', 'R2'],
    steps: [
      ['hold', 'P1 持有 R1，P2 持有 R2。', ['P1 -> R1', 'P2 -> R2']],
      ['wait', 'P1 请求 R2，P2 请求 R1，形成等待环。', ['P1 waits R2', 'P2 waits R1']],
      ['cycle', '资源分配图存在环，并且每类资源只有一个实例，判定死锁。', ['cycle=P1-R2-P2-R1']],
      ['break', '解除死锁可撤销进程、抢占资源或回滚。', ['recover']],
    ],
  },
  producerconsumer: {
    title: '生产者消费者',
    actors: ['Producer', 'empty', 'buffer', 'full', 'Consumer'],
    steps: [
      ['produce', '生产者先 wait(empty)，确认缓冲区有空位。', ['empty--']],
      ['put', '生产者进入互斥区，把产品放入缓冲区。', ['buffer += item']],
      ['signal', '生产者 signal(full)，通知消费者有产品。', ['full++']],
      ['consume', '消费者 wait(full)，取走产品后 signal(empty)。', ['full--', 'empty++']],
    ],
  },
  readerswriters: {
    title: '读者写者',
    actors: ['Reader', 'readCount', 'rwMutex', 'Writer'],
    steps: [
      ['firstreader', '第一个读者进入时锁住 rwMutex，阻止写者。', ['readCount=1']],
      ['manyreaders', '后续读者只增加 readCount，可并发读。', ['readCount=3']],
      ['lastreader', '最后一个读者离开时释放 rwMutex。', ['readCount=0']],
      ['writer', '写者独占 rwMutex，写期间读者和其他写者都等待。', ['exclusive write']],
    ],
  },
}

const PROTOCOL_TOPICS = {
  dnsresolve: {
    title: 'DNS 递归/迭代解析',
    actors: ['浏览器', '本地 DNS', '根 DNS', '顶级域 DNS', '权威 DNS'],
    steps: [
      ['query', '浏览器把 example.com 查询交给本地 DNS。', '浏览器 -> 本地 DNS: A example.com'],
      ['root', '本地 DNS 迭代询问根服务器，得到 .com 顶级域服务器地址。', '本地 DNS -> 根 DNS'],
      ['tld', '继续询问 .com 顶级域 DNS，得到 example.com 权威 DNS。', '本地 DNS -> 顶级域 DNS'],
      ['auth', '询问权威 DNS，得到最终 IP。', '权威 DNS -> 本地 DNS: 93.184.216.34'],
      ['cache', '本地 DNS 缓存结果并返回浏览器。', '本地 DNS -> 浏览器: IP'],
    ],
  },
  httpflow: {
    title: 'HTTP 请求响应',
    actors: ['浏览器', 'TCP 连接', 'Web 服务器'],
    steps: [
      ['connect', '浏览器复用或建立 TCP 连接。', 'Browser -> Server: connect'],
      ['request', '发送请求行、请求头和可选请求体。', 'GET /index.html HTTP/1.1'],
      ['process', '服务器路由、读取资源、生成响应。', 'server handler'],
      ['response', '返回状态行、响应头和响应体。', 'HTTP/1.1 200 OK'],
      ['render', '浏览器解析 HTML/CSS/JS 并渲染页面。', 'render'],
    ],
  },
  tlshandshake: {
    title: 'TLS 握手',
    actors: ['Client', 'Server', 'CA/证书'],
    steps: [
      ['hello', 'ClientHello 发送版本、随机数、支持的密码套件。', 'ClientHello'],
      ['serverhello', 'ServerHello 选择套件并返回证书。', 'ServerHello + Certificate'],
      ['verify', '客户端验证证书链和域名。', 'verify cert'],
      ['key', '双方通过密钥交换得到共享密钥。', 'ECDHE shared secret'],
      ['finished', '切换到对称加密，发送 Finished 校验握手完整性。', 'encrypted HTTP'],
    ],
  },
  ipv4fragment: {
    title: 'IPv4 分片重组',
    actors: ['发送主机', '路由器 MTU=1500', '目标主机'],
    steps: [
      ['packet', '原始 IP 数据报长度超过下一跳 MTU。', 'len=4000'],
      ['split', '路由器按 MTU 切成多个分片，复制标识字段。', 'ID=77'],
      ['offset', '每片记录片偏移和 MF 标志。', 'offset=0/185/370'],
      ['deliver', '分片可乱序到达，目标主机按 ID 和 offset 收集。', 'reorder'],
      ['reassemble', '所有分片到齐后重组；缺一片则整包失败。', 'reassemble'],
    ],
  },
  ripdistance: {
    title: '距离向量 RIP',
    actors: ['路由器 A', '路由器 B', '路由器 C', '路由表'],
    steps: [
      ['init', '每个路由器只知道直连网络的距离。', 'A: B=1, C=inf'],
      ['exchange', '相邻路由器周期性交换自己的距离向量。', 'B -> A: C=1'],
      ['relax', 'A 发现经 B 到 C 的距离为 2，更新路由表。', 'A[C]=2 via B'],
      ['converge', '多轮交换后全网收敛。', 'converged'],
      ['limit', 'RIP 用跳数作为度量，最大 15 跳。', 'max=15'],
    ],
  },
}

const CRYPTO_TOPICS = {
  hashavalanche: {
    title: '哈希雪崩效应',
    actors: ['输入消息', '压缩函数', '摘要'],
    steps: [
      ['input', '两条消息只差 1 bit。', ['hello', 'jello']],
      ['mix', '分组、填充、轮函数不断扩散差异。', ['diffusion']],
      ['digest', '输出摘要看起来完全不同。', ['hash1 != hash2']],
      ['use', '雪崩效应用于完整性校验和签名前摘要。', ['integrity']],
    ],
  },
  aesround: {
    title: 'AES 教学版轮结构',
    actors: ['State', 'SubBytes', 'ShiftRows', 'MixColumns', 'RoundKey'],
    steps: [
      ['state', '明文块排成 4x4 字节状态矩阵。', ['state[4][4]']],
      ['sub', 'SubBytes 用 S 盒做非线性替换。', ['byte -> S(byte)']],
      ['shift', 'ShiftRows 按行循环移位，打散列内位置。', ['row shift']],
      ['mix', 'MixColumns 混合每一列，扩散到多个字节。', ['column mix']],
      ['key', 'AddRoundKey 与轮密钥异或。', ['state XOR key']],
    ],
  },
  rsaflow: {
    title: 'RSA 加解密流程',
    actors: ['明文 m', '公钥 (e,n)', '密文 c', '私钥 d'],
    steps: [
      ['key', '选小质数 p=5,q=11 得 n=55，教学用小参数便于观察。', ['n=pq=55']],
      ['public', '发布公钥 (e,n)，私钥 d 保密。', ['e=3', 'd=27']],
      ['encrypt', '加密：c = m^e mod n。', ['m=7 -> c=13']],
      ['decrypt', '解密：m = c^d mod n。', ['c=13 -> m=7']],
    ],
  },
  diffiehellman: {
    title: 'Diffie-Hellman 密钥交换',
    actors: ['Alice', '公开参数 g,p', 'Bob', '共享密钥'],
    steps: [
      ['public', '双方公开素数 p 和生成元 g。', ['p=23', 'g=5']],
      ['private', 'Alice 选私钥 a，Bob 选私钥 b，私钥不传输。', ['a=6', 'b=15']],
      ['exchange', '双方交换 A=g^a mod p 与 B=g^b mod p。', ['A=8', 'B=19']],
      ['secret', 'Alice 算 B^a，Bob 算 A^b，得到相同共享密钥。', ['K=2']],
    ],
  },
  digitalsignature: {
    title: '数字签名与验签',
    actors: ['发送方', '哈希', '私钥签名', '公钥验签', '接收方'],
    steps: [
      ['hash', '先对消息求哈希，得到固定长度摘要。', ['digest=H(m)']],
      ['sign', '发送方用私钥对摘要签名。', ['sig=Sign(sk,digest)']],
      ['send', '发送消息和签名，消息本身不一定加密。', ['m + sig']],
      ['verify', '接收方用公钥验签，并重新计算摘要比对。', ['Verify(pk,sig,H(m))']],
      ['result', '验签通过说明消息未被篡改且签名来自私钥持有者。', ['auth + integrity']],
    ],
  },
}

const STRUCTURE_TOPICS = {
  monotonicstack: {
    title: '单调栈',
    items: [2, 1, 5, 3, 4],
    steps: [
      ['push', '维护递减栈，元素 2 入栈。', [2], '找右侧第一个更大元素'],
      ['push', '1 小于栈顶 2，继续入栈。', [2, 1], '栈内保持递减'],
      ['pop', '5 大于 1 和 2，弹出它们并确定答案为 5。', [5], '1->5, 2->5'],
      ['push', '3 小于 5，入栈等待更大元素。', [5, 3], '等待'],
      ['pop', '4 大于 3，弹出 3，答案为 4。', [5, 4], '3->4'],
    ],
  },
  monotonicqueue: {
    title: '单调队列',
    items: [1, 3, -1, -3, 5, 3],
    steps: [
      ['push', '入队 1，队列保持递减。', [1], '窗口最大值候选'],
      ['popback', '入队 3 前弹出更小的 1。', [3], '3 成为最大候选'],
      ['push', '入队 -1，队列为 3,-1。', [3, -1], '窗口 [1,3,-1] max=3'],
      ['expire', '窗口右移，过期元素离开队首。', [3, -1, -3], '检查下标过期'],
      ['popback', '入队 5，弹出所有更小元素。', [5], '新窗口 max=5'],
    ],
  },
  heapops: {
    title: '堆的插入与删除',
    items: [9, 7, 6, 3, 2],
    steps: [
      ['insert', '插入 8 到堆尾。', [9, 7, 6, 3, 2, 8], 'append'],
      ['siftup', '8 大于父节点 6，上浮交换。', [9, 7, 8, 3, 2, 6], 'sift up'],
      ['delete', '删除堆顶 9，用堆尾 6 补到根。', [6, 7, 8, 3, 2], 'replace root'],
      ['siftdown', '6 与较大孩子 8 交换，下沉恢复大根堆。', [8, 7, 6, 3, 2], 'sift down'],
    ],
  },
  dagshortest: {
    title: 'DAG 最短路',
    items: ['S', 'A', 'B', 'C', 'T'],
    steps: [
      ['topo', '先对 DAG 做拓扑排序。', ['S', 'A', 'B', 'C', 'T'], '无环保证一次松弛有效'],
      ['init', 'dist[S]=0，其余为无穷。', ['S:0', 'A:inf', 'B:inf'], '初始化'],
      ['relax', '按拓扑序松弛 S 的出边。', ['A=2', 'B=5'], 'relax S'],
      ['relax', '继续松弛 A、B、C，得到 T 的最短距离。', ['T=6'], 'done'],
    ],
  },
  binaryanswer: {
    title: '二分答案',
    items: [1, 2, 4, 8, 16, 32],
    steps: [
      ['range', '答案具有单调性：可行区间和不可行区间有边界。', ['low=1', 'high=32'], 'monotonic predicate'],
      ['mid', '检查 mid=16，可行则尝试更小答案。', ['ok(16)=true'], 'high=16'],
      ['mid', '检查 mid=8，不可行则答案必须更大。', ['ok(8)=false'], 'low=9'],
      ['done', '区间收缩到第一个可行答案。', ['answer=12'], 'lower_bound'],
    ],
  },
  prefixdiff: {
    title: '前缀和 / 差分',
    items: [2, 1, 3, 4, 2],
    steps: [
      ['prefix', '前缀和把区间求和变成两次数组访问。', ['pre=[0,2,3,6,10,12]'], 'sum(l,r)=pre[r]-pre[l-1]'],
      ['query', '查询 [2,4]：pre[4]-pre[1]=8。', ['10-2=8'], 'O(1)'],
      ['diff', '差分把区间加变成两个端点修改。', ['diff[l]+=v', 'diff[r+1]-=v'], 'range add'],
      ['restore', '对差分做前缀和还原最终数组。', ['restore'], 'batch update'],
    ],
  },
  btree: {
    title: 'B 树 / B+ 树',
    items: ['10', '20', '30', '40', '50'],
    steps: [
      ['node', '多路平衡树一个节点存多个关键字，减少磁盘 I/O。', ['[10,20,30]'], '多路'],
      ['split', '节点满后插入 40，需要分裂并把中间关键字上提。', ['split'], 'B 树插入'],
      ['bplus', 'B+ 树内部节点只做索引，数据都在叶子层。', ['leaf linked'], '范围查询友好'],
      ['range', '范围查询沿叶子链顺序扫描。', ['20 -> 30 -> 40'], '数据库索引'],
    ],
  },
}

export function memoryTopic(slug) {
  return () => {
    const topic = MEMORY_TOPICS[slug]
    return cloneSteps(topic.steps.map(([phase, description, facts], i) => ({
      phase,
      title: topic.title,
      actors: topic.actors,
      facts,
      active: i,
      description,
    })))
  }
}

export function osTopic(slug) {
  return () => {
    const topic = OS_TOPICS[slug]
    return cloneSteps(topic.steps.map(([phase, description, facts], i) => ({
      phase,
      title: topic.title,
      actors: topic.actors,
      facts,
      active: i,
      description,
    })))
  }
}

export function protocolTopic(slug) {
  return () => {
    const topic = PROTOCOL_TOPICS[slug]
    return cloneSteps(topic.steps.map(([phase, description, message], i) => ({
      phase,
      title: topic.title,
      actors: topic.actors,
      message,
      active: i,
      description,
    })))
  }
}

export function cryptoTopic(slug) {
  return () => {
    const topic = CRYPTO_TOPICS[slug]
    return cloneSteps(topic.steps.map(([phase, description, facts], i) => ({
      phase,
      title: topic.title,
      actors: topic.actors,
      facts,
      active: i,
      description,
    })))
  }
}

export function structureTopic(slug) {
  return () => {
    const topic = STRUCTURE_TOPICS[slug]
    return cloneSteps(topic.steps.map(([phase, description, state, note], i) => ({
      phase,
      title: topic.title,
      items: topic.items,
      state,
      note,
      active: i,
      description,
    })))
  }
}
