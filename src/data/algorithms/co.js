// 自动从 algorithms.js 拆分（6 个算法 · co 学科）
import { cacheDirect, cacheSet, cacheFully } from '../../algorithms/co/cacheMap'
import { ieee754 } from '../../algorithms/co/ieee754'
import { pipelineIdeal, pipelineHazard } from '../../algorithms/co/pipeline'

export const CO_ALGORITHMS = {
  ieee754: {
    slug: 'ieee754',
    name: 'IEEE 754 浮点编码',
    nameEn: 'IEEE 754 Floating Point',
    category: 'co',
    difficulty: '中等',
    fn: ieee754,
    viz: 'ieee754',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
    spaceComplexity: 'O(1)',
    description: 'IEEE 754 单精度浮点（32 位）的二进制编码：符号 + 阶码 + 尾数。',
    intuition: `IEEE 754 是几乎所有现代 CPU 使用的浮点数表示标准。单精度 (float) 用 **32 位** 表示一个实数：\n\n\`\`\`\n| S (1) | E (8) | M (23) |\n  符号    阶码     尾数（隐含 1.）\n\`\`\`\n\n**编码步骤**（拿 13.625 举例）：\n1. **符号位 S**：正数 0 / 负数 1\n2. **转二进制**：13.625₁₀ = 1101.101₂\n3. **规格化**：1101.101 = 1.101101 × 2³，写成 1.xxxx × 2^E 的形式\n4. **阶码加偏移**：E_biased = 3 + 127 = 130 = 10000010₂（偏移 127 让指数可表示正负）\n5. **尾数**：取小数点后的 23 位，隐含的前导 1 不存; 1.101101 → 尾数 = 10110100000000000000000\n\n**为什么用偏移阶码**：直接用 8 位补码表示 ±127，但浮点比较经常要看大小关系。用偏移后的无符号数比较，**位级比较 = 数值比较**（除符号位外），硬件实现简单。\n\n**特殊值**：\n- **±0**：阶码全 0，尾数全 0\n- **±∞**：阶码全 1，尾数全 0\n- **NaN**：阶码全 1，尾数非 0\n- **次正规数 (denormal)**：阶码全 0，尾数非 0（表示极小数）\n\n**为什么 0.1 + 0.2 ≠ 0.3**：0.1 在二进制下是无限循环（0.0001100110011...），只能截断到 23 位，必然有误差。这就是浮点运算不精确的根源。\n\n双精度 (double) 是 64 位：1 + 11 + 52。`,
    pseudocode: `// 单精度 (32 位) 编码
S ← (value < 0) ? 1 : 0
abs ← |value|

// 1. 转二进制：abs = 1.xxxx × 2^E
shift = 找到最高位 1 的位置
E_unbiased = shift
mantissa_bits = abs 二进制的小数部分前 23 位（去掉隐含的 1.）

// 2. 阶码偏移
E_biased = E_unbiased + 127

// 3. 组装
result = (S << 31) | (E_biased << 23) | mantissa_bits`,
    code: {
      cpp: `#include <cstdint>
#include <cstring>

uint32_t float_to_bits(float f) {
    uint32_t bits;
    std::memcpy(&bits, &f, sizeof(f));
    return bits;
}

void decompose(float f) {
    uint32_t bits = float_to_bits(f);
    uint32_t sign     = (bits >> 31) & 0x1;
    uint32_t exponent = (bits >> 23) & 0xFF;        // 8 bits
    uint32_t mantissa =  bits        & 0x7FFFFF;    // 23 bits
    int E_unbiased = (int)exponent - 127;
    // 值 = (-1)^sign × 1.mantissa × 2^E_unbiased
}`,
      python: `import struct

def decompose(f):
    bits = struct.unpack('I', struct.pack('f', f))[0]
    sign = (bits >> 31) & 1
    exponent = (bits >> 23) & 0xFF
    mantissa = bits & 0x7FFFFF
    e_unbiased = exponent - 127
    print(f"S={sign}  E={exponent} (={e_unbiased})  M={mantissa:023b}")

decompose(13.625)
# 输出：S=0  E=130 (=3)  M=10110100000000000000000`,
    },
    applications: [
      '所有现代 CPU/GPU 浮点运算的底层标准',
      '理解浮点精度问题（如 0.1 + 0.2 ≠ 0.3）',
      '考研 408 计算机组成原理必考',
      '游戏 / 图形学 / 科学计算的数值稳定性分析',
      'AI 训练中的 FP16 / BF16 / FP8 等低精度格式都基于 IEEE 754 框架',
    ],
  },

  cachemapdirect: {
    slug: 'cachemapdirect',
    name: 'Cache 映射 - 直接映射',
    nameEn: 'Direct Mapped Cache',
    category: 'co',
    difficulty: '中等',
    fn: cacheDirect,
    viz: 'cachemap',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
    spaceComplexity: 'O(n)',
    description: '每个主存块只能映射到唯一的 Cache 行：line = block_addr mod N。',
    intuition: `**直接映射 (Direct Mapped)**：地址分成 **Tag | Index | Offset** 三段：\n- **Offset**：块内偏移（块大小 = 2^offset_bits）\n- **Index**：选择 Cache 行（N 行 = 2^index_bits）\n- **Tag**：剩余高位，用来判断是否命中\n\n命中流程：用 Index 直接定位到唯一一行，比较 Tag → 命中即返回；不命中则取主存块替换该行（**没有选择，必须替换**）。\n\n**优点**：硬件最简单（只比较一次 Tag）、延迟最低。\n\n**缺点**：**冲突未命中** (conflict miss) 很多——如果两个频繁访问的块 Index 相同，就会反复互相踢出，即使 Cache 还有空位。\n\n本可视化用：8 个 Cache 行，块大小 4B，地址 8 位（Tag 3 / Index 3 / Offset 2）。`,
    pseudocode: `// 直接映射查找
offset_bits ← log2(block_size)
index_bits  ← log2(num_blocks)
index ← (addr >> offset_bits) AND ((1 << index_bits) - 1)
tag   ← addr >> (offset_bits + index_bits)

if cache[index].valid AND cache[index].tag == tag:
    return HIT
else:
    cache[index] ← {valid: true, tag: tag, data: load_from_memory}
    return MISS`,
    code: { cpp: `// 直接映射 Cache 简化实现
struct CacheLine { bool valid; uint32_t tag; uint8_t data[BLOCK_SIZE]; };
CacheLine cache[NUM_BLOCKS];

bool access(uint32_t addr) {
    uint32_t offset = addr & (BLOCK_SIZE - 1);
    uint32_t index  = (addr >> log2(BLOCK_SIZE)) & (NUM_BLOCKS - 1);
    uint32_t tag    = addr >> (log2(BLOCK_SIZE) + log2(NUM_BLOCKS));

    CacheLine& line = cache[index];
    if (line.valid && line.tag == tag) return true;   // HIT
    line.valid = true; line.tag = tag;                // MISS → load
    return false;
}`, python: `class DirectCache:
    def __init__(self, num_blocks, block_size):
        self.cache = [{'valid': False, 'tag': -1} for _ in range(num_blocks)]
        self.num_blocks = num_blocks
        self.block_size = block_size

    def access(self, addr):
        offset_bits = (self.block_size - 1).bit_length()
        idx_bits = (self.num_blocks - 1).bit_length()
        index = (addr >> offset_bits) & (self.num_blocks - 1)
        tag = addr >> (offset_bits + idx_bits)
        line = self.cache[index]
        if line['valid'] and line['tag'] == tag:
            return True
        line['valid'] = True; line['tag'] = tag
        return False` },
    applications: ['L1 指令 Cache 常用直接映射（追求低延迟）', '考研 408 经典考点：地址分解、命中流程、容量计算'],
  },

  cachemapset: {
    slug: 'cachemapset',
    name: 'Cache 映射 - 组相联',
    nameEn: 'Set Associative Cache',
    category: 'co',
    difficulty: '中等',
    fn: cacheSet,
    viz: 'cachemap',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(k)' },
    spaceComplexity: 'O(n)',
    description: 'Cache 分组，每组 k 路。主存块按 Index 映射到组，组内 k 路全相联查找。',
    intuition: `**组相联 (Set Associative)** 是直接映射和全相联的折中：\n- 整个 Cache 分成 **S 个组**，每组有 **k 路 (way)**\n- 主存块按 Index 选到组，组内 **k 个候选位置**用 Tag 比较\n- 命中需要并行比较 k 个 Tag（硬件代价高于直接映射）\n\n本可视化用 **2 路组相联**（k=2）：8 个 Cache 行 = 4 组 × 2 路，Index 2 位、Tag 4 位、Offset 2 位。\n\n**替换策略**（k > 1 时需要）：LRU、FIFO、随机。这里用 LRU。\n\n**为什么是主流**：现代 CPU L1/L2 Cache 大多是 **4-8 路组相联**——直接映射冲突太多，全相联硬件代价又太高，2-8 路是甜蜜点。`,
    pseudocode: `// 2 路组相联查找
set ← (addr >> offset_bits) AND (NUM_SETS - 1)
tag ← addr >> (offset_bits + index_bits)

for way in 0..k-1:
    if cache[set][way].valid AND cache[set][way].tag == tag:
        update LRU age
        return HIT

// MISS: 选 LRU 替换
victim ← way with largest age in set
cache[set][victim] ← {valid: true, tag: tag, age: 0}
return MISS`,
    code: { cpp: `// 2 路组相联 + LRU
struct Way { bool valid; uint32_t tag; int age; };
Way cache[NUM_SETS][2];

bool access(uint32_t addr) {
    uint32_t set = (addr >> OFFSET_BITS) & (NUM_SETS - 1);
    uint32_t tag = addr >> (OFFSET_BITS + log2(NUM_SETS));
    for (auto& w : cache[set]) w.age++;
    for (int i = 0; i < 2; i++) {
        if (cache[set][i].valid && cache[set][i].tag == tag) {
            cache[set][i].age = 0;
            return true;
        }
    }
    // MISS: LRU
    int victim = cache[set][0].age >= cache[set][1].age ? 0 : 1;
    cache[set][victim] = {true, tag, 0};
    return false;
}`, python: `class SetAssocCache:
    def __init__(self, num_sets, k, block_size):
        self.sets = [[{'valid':False,'tag':-1,'age':0} for _ in range(k)]
                     for _ in range(num_sets)]
        self.num_sets = num_sets; self.k = k; self.block_size = block_size

    def access(self, addr):
        ob = (self.block_size - 1).bit_length()
        sb = (self.num_sets - 1).bit_length()
        s = (addr >> ob) & (self.num_sets - 1)
        t = addr >> (ob + sb)
        for w in self.sets[s]: w['age'] += 1
        for w in self.sets[s]:
            if w['valid'] and w['tag'] == t:
                w['age'] = 0; return True
        victim = max(self.sets[s], key=lambda w: w['age'])
        victim.update(valid=True, tag=t, age=0)
        return False` },
    applications: ['现代 CPU L1/L2/L3 Cache 主流组织方式（4-16 路）', '面试高频：能画出 2 路组相联的命中流程图'],
  },

  cachemapfully: {
    slug: 'cachemapfully',
    name: 'Cache 映射 - 全相联',
    nameEn: 'Fully Associative Cache',
    category: 'co',
    difficulty: '中等',
    fn: cacheFully,
    viz: 'cachemap',
    timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    description: '主存块可放在 Cache 任意行，需并行比较所有 Tag。',
    intuition: `**全相联 (Fully Associative)** 让任何主存块可以放到 Cache 的任意位置——只有 Tag 和 Offset，没有 Index。\n\n命中流程：把地址的 Tag 和 **所有 Cache 行的 Tag** 同时比较（硬件用 CAM, Content Addressable Memory 实现）。\n\n**优点**：冲突未命中最少（只要 Cache 还有空位，就不会发生 conflict miss）。\n\n**缺点**：硬件代价巨大（需要 N 个比较器并行工作），延迟高。\n\n**实际应用**：只用在 **小容量、高命中率** 的场合：\n- **TLB (Translation Lookaside Buffer)**：地址翻译加速，通常 32-128 项\n- **L1 victim cache**：辅助 L1 缓存被替换的块\n\n替换策略必须有（LRU、FIFO、随机），因为不知道往哪里放。`,
    pseudocode: `// 全相联查找
tag ← addr >> offset_bits

for line in cache:
    if line.valid AND line.tag == tag:
        update LRU age
        return HIT

// MISS: 找空位或 LRU
victim ← first invalid line, or line with max age
victim ← {valid: true, tag: tag, age: 0}
return MISS`,
    code: { cpp: `// 全相联 + LRU
struct Line { bool valid; uint32_t tag; int age; };
Line cache[NUM_LINES];

bool access(uint32_t addr) {
    uint32_t tag = addr >> OFFSET_BITS;
    for (auto& l : cache) l.age++;
    for (auto& l : cache) {
        if (l.valid && l.tag == tag) {
            l.age = 0;
            return true;
        }
    }
    int v = -1, maxAge = -1;
    for (int i = 0; i < NUM_LINES; i++) {
        if (!cache[i].valid) { v = i; break; }
        if (cache[i].age > maxAge) { v = i; maxAge = cache[i].age; }
    }
    cache[v] = {true, tag, 0};
    return false;
}`, python: `class FullyAssocCache:
    def __init__(self, num_lines, block_size):
        self.lines = [{'valid': False, 'tag': -1, 'age': 0} for _ in range(num_lines)]
        self.block_size = block_size

    def access(self, addr):
        ob = (self.block_size - 1).bit_length()
        tag = addr >> ob
        for l in self.lines: l['age'] += 1
        for l in self.lines:
            if l['valid'] and l['tag'] == tag:
                l['age'] = 0; return True
        victim = next((l for l in self.lines if not l['valid']), None)
        if victim is None: victim = max(self.lines, key=lambda l: l['age'])
        victim.update(valid=True, tag=tag, age=0)
        return False` },
    applications: ['TLB（页表项 Cache）', 'L1 victim cache', 'PC 高速缓冲存储器的小容量辅助结构'],
  },

  pipelineideal: {
    slug: 'pipelineideal',
    name: 'CPU 五级流水线 - 理想',
    nameEn: '5-Stage Pipeline (Ideal)',
    category: 'co',
    difficulty: '中等',
    fn: pipelineIdeal,
    viz: 'pipeline',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    description: 'MIPS 经典 5 级流水线（IF/ID/EX/MEM/WB），无冒险的理想情况。',
    intuition: `**MIPS 五级流水线** 把指令执行分成 5 个阶段，每个阶段一个周期：\n- **IF (Instruction Fetch)**：取指令\n- **ID (Instruction Decode)**：译码 + 读寄存器\n- **EX (Execute)**：执行 ALU 运算 / 计算地址\n- **MEM (Memory)**：访存（load / store）\n- **WB (Write Back)**：把结果写回寄存器\n\n**为什么流水线快**：单条指令耗时 5 周期不变，但每个周期都能 **启动** 一条新指令。理想情况下吞吐量提升 5 倍。\n\n**时空图**（理想 5 条指令）：\n\`\`\`\nC1 C2 C3 C4 C5 C6 C7 C8 C9\nIF ID EX MEM WB                  ← I1\n   IF ID EX MEM WB               ← I2\n      IF ID EX MEM WB            ← I3\n         IF ID EX MEM WB         ← I4\n            IF ID EX MEM WB      ← I5\n\`\`\`\n5 条指令 9 周期（vs 顺序 25 周期），加速比 ≈ 2.78×（指令数越多越接近 5×）。\n\n**理想 ≠ 现实**：实际有 3 种冒险（hazard）阻碍流水：\n- **结构冒险**：两个阶段同时要用同一资源（解决：分离指令/数据 Cache、增加 ALU）\n- **数据冒险**：后一条指令要用前一条还没写回的结果（解决：转发 / 停顿）\n- **控制冒险**：分支跳转目标未知（解决：分支预测）`,
    pseudocode: `// 流水线寄存器（每两个阶段之间的锁存器）
struct IF_ID  { uint32_t pc, instruction; }
struct ID_EX  { uint32_t rs_val, rt_val, imm, dest; ALUOp op; }
struct EX_MEM { uint32_t alu_result, rt_val, dest; bool memWrite; }
struct MEM_WB { uint32_t data, alu_result, dest; bool regWrite; }

// 每个周期，所有 5 个阶段并行工作
on each clock cycle:
    WB  → write result to register file
    MEM → access memory
    EX  → ALU compute
    ID  → decode + read registers
    IF  → fetch next instruction
    // 状态从前向后传递（IF_ID → ID_EX → ...）`,
    code: {
      cpp: `// 简化的流水线寄存器结构
struct PipelineReg {
    uint32_t pc, instr;
    uint32_t rs_val, rt_val, imm;
    uint32_t alu_result;
    uint32_t mem_data;
    int dest_reg;
};

class Pipeline {
    PipelineReg if_id, id_ex, ex_mem, mem_wb;

    void cycle() {
        // 从后向前更新（避免覆盖）
        writeBack(mem_wb);
        memoryAccess(ex_mem, mem_wb);
        execute(id_ex, ex_mem);
        decode(if_id, id_ex);
        fetch(if_id);
    }
};`,
      python: `class FiveStagePipeline:
    """MIPS 5 级流水线骨架（仅演示数据流，省略具体指令解析）"""

    def __init__(self):
        self.if_id = None
        self.id_ex = None
        self.ex_mem = None
        self.mem_wb = None

    def cycle(self):
        # 从后向前更新，避免新值覆盖未使用的旧值
        if self.mem_wb: self.write_back(self.mem_wb)
        if self.ex_mem: self.mem_wb = self.memory(self.ex_mem)
        if self.id_ex:  self.ex_mem = self.execute(self.id_ex)
        if self.if_id:  self.id_ex = self.decode(self.if_id)
        self.if_id = self.fetch()`,
    },
    applications: [
      '现代 RISC-V / ARM / MIPS 教学的标准模型',
      '考研 408 计算机组成原理必考',
      '理解超标量、乱序执行的前置知识',
      'CPU 设计课程的实验基础（用 Verilog 实现）',
    ],
  },

  pipelinehazard: {
    slug: 'pipelinehazard',
    name: 'CPU 五级流水线 - 数据冒险',
    nameEn: '5-Stage Pipeline (Data Hazard)',
    category: 'co',
    difficulty: '进阶',
    fn: pipelineHazard,
    viz: 'pipeline',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    description: '演示 load-use 数据冒险 + 转发 (forwarding) + 必要的 STALL 气泡。',
    intuition: `**数据冒险** = 后续指令依赖前面还未写回的结果。考虑：\n\`\`\`\nlw  $t0, 0($s1)       # I0：从内存载入 $t0，结果在 MEM 阶段才有\nadd $t1, $t0, $s2     # I1：需要 $t0，但它在 EX 阶段就要用！\n\`\`\`\n\n**3 种主要冒险**：\n1. **RAW (Read After Write)** = 真数据依赖。前一条要写、后一条要读\n2. **WAR (Write After Read)** = 反依赖。流水线中不会发生（顺序发射）\n3. **WAW (Write After Write)** = 输出依赖。流水线中通常不发生\n\n**解决方法**：\n\n### 1. 转发 (Forwarding / Bypass)\n当 EX 阶段需要的值已在 EX/MEM 或 MEM/WB 流水线寄存器里，**直接送给 ALU 输入**，不等写回。绝大多数 ALU-ALU 依赖能 0 周期解决。\n\n### 2. 停顿 (Stall) — load-use 冒险\nlw 的结果在 **MEM 阶段末** 才有，下一条 ALU 指令的 EX 阶段需要这个值——**必须等一个周期**，插入一个 NOP 气泡。\n\n### 3. 编译器调度\n聪明的编译器会把无依赖的指令插到 lw 后面，避免 stall。\n\n本可视化场景（有 1 个 STALL）：\n\`\`\`\n      C1   C2   C3   C4    C5   C6   C7   C8\nI0    IF   ID   EX   MEM   WB                  ← lw $t0\nI1         IF   ID  STALL  EX   MEM  WB        ← 用 $t0，停 1 周期 + MEM→EX 转发\nI2              IF   ID   STALL  EX   MEM  WB  ← 用 $t1，EX→EX 转发，被 I1 拖累再停 1\nI3                   IF  STALL   ID   EX  MEM  ← 无依赖但被流水线拖累\n\`\`\``,
    pseudocode: `// 冒险检测单元（Hazard Detection Unit）
on each cycle in ID stage:
    if id_ex.rt_used_in_next AND if_id reads id_ex.rt:
        stall_pipeline()            // 插入 NOP，不更新 PC 和 IF/ID

// 转发单元（Forwarding Unit）
on each cycle in EX stage:
    if ex_mem.dest == id_ex.rs and ex_mem.regWrite:
        alu_input_a = ex_mem.alu_result   // EX→EX 转发
    elif mem_wb.dest == id_ex.rs and mem_wb.regWrite:
        alu_input_a = mem_wb.data         // MEM→EX 转发`,
    code: {
      cpp: `// Forwarding + Stall 检测（节选）
void detectHazardAndForward(ID_EX& idex, EX_MEM& exmem, MEM_WB& memwb) {
    // EX-EX 转发
    if (exmem.regWrite && exmem.dest != 0) {
        if (exmem.dest == idex.rs) idex.rs_val = exmem.alu_result;
        if (exmem.dest == idex.rt) idex.rt_val = exmem.alu_result;
    }
    // MEM-EX 转发
    if (memwb.regWrite && memwb.dest != 0) {
        if (memwb.dest == idex.rs) idex.rs_val = memwb.data;
        if (memwb.dest == idex.rt) idex.rt_val = memwb.data;
    }
    // Load-Use stall（lw 紧跟使用其结果的 ALU 指令）
    if (idex.memRead && (idex.rt == ifid.rs || idex.rt == ifid.rt)) {
        stall(); // 暂停 IF/ID，插入 NOP 到 ID/EX
    }
}`,
      python: `# 教学用 forwarding + stall 检测
def forward_and_stall(ifid, idex, exmem, memwb):
    # 转发优先级：EX/MEM > MEM/WB
    if exmem and exmem.reg_write and exmem.dest:
        if exmem.dest == idex.rs: idex.rs_val = exmem.alu_result
        if exmem.dest == idex.rt: idex.rt_val = exmem.alu_result
    if memwb and memwb.reg_write and memwb.dest:
        if memwb.dest == idex.rs: idex.rs_val = memwb.data
        if memwb.dest == idex.rt: idex.rt_val = memwb.data

    # Load-use 必须停顿一个周期
    if idex and idex.mem_read:
        if idex.rt in (ifid.rs, ifid.rt):
            return 'stall'
    return 'go'`,
    },
    applications: [
      'CPU 设计课程实验：用 Verilog 实现 5 级流水线 + 转发 + 停顿',
      '考研 408 高频考点（手画流水线时空图、计算 CPI）',
      '理解 GCC / LLVM 编译器调度优化（reordering、scheduling）的根据',
      '现代 CPU 的乱序执行 / 寄存器重命名都是为了消除冒险',
    ],
  },

}

export default CO_ALGORITHMS
