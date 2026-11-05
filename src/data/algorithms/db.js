// 数据库系统学科算法（从 algorithms.js 拆出）
import { bplustree } from '../../algorithms/database/bPlusTree'
import { txnIsolation } from '../../algorithms/database/transaction'
import { hashJoin } from '../../algorithms/database/hashJoin'
import { mvccDemo } from '../../algorithms/database/mvcc'
import { queryPlanSteps } from '../../algorithms/database/queryPlan'

export const DB_ALGORITHMS = {
  bplustree: {
    slug: 'bplustree',
    name: 'B+ 树',
    nameEn: 'B+ Tree',
    category: 'dbIndex',
    difficulty: '进阶',
    fn: bplustree,
    viz: 'bplustree',
    timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(n)',
    stable: true,
    inPlace: false,
    description: '磁盘友好的多路平衡查找树：所有数据都在叶子，叶子串成链表，区间查询极快。',
    intuition: `**为什么数据库用 B+ 树而不是红黑树？**

红黑树是内存里的二叉树，每个节点只有 2 个孩子。要找 1 亿条记录中的一条，要走约 27 层——27 次随机磁盘 I/O。

B+ 树把每个节点撑成几百个键（贴合一次磁盘页 16KB 的读取大小）。同样 1 亿条，B+ 树只要 3-4 层，3-4 次 I/O。

**B+ 树相对 B 树的两个特征：**
1. **数据只放在叶子**：内部节点只放索引键，不放数据指针，每页能塞更多键 → 更扁。
2. **叶子串成链表**：范围查询 \`WHERE age BETWEEN 20 AND 30\` 只要找到第一个叶子，然后顺着链表读，不必反复回到根。

**插入过程：**
1. 从根下降到目标叶子（按键比较选孩子）。
2. 在叶子按序插入。
3. 若叶子键数 > m-1 → **分裂**：中位键上推到父节点，左右各成一个新节点。
4. 父节点若也满 → 继续上推；一直到根；根若满 → 树高 + 1。`,
    pseudocode: `procedure insert(root, key):
    leaf ← findLeaf(root, key)         // 1. 沿路下降到叶子
    insertInOrder(leaf, key)           // 2. 有序插入
    if size(leaf) > maxKeys:
        splitAndPromote(leaf)          // 3. 溢出 → 分裂

procedure splitAndPromote(node):
    mid ← floor(size(node) / 2)
    right ← new node from node[mid..]
    node ← node[..mid]                 // B+ 叶子：中位键留在右
    if isLeaf:
        right.next ← node.next
        node.next ← right              // 叶子链表
    promote mid_key to parent
    if parent overflows: splitAndPromote(parent)
    else if no parent: create new root`,
    code: {
      cpp: `// 简化版：仅展示插入框架
struct Node { vector<int> keys; vector<Node*> children; bool isLeaf; Node* next; };

void insert(Node*& root, int key, int m) {
    Node* leaf = findLeaf(root, key);
    auto it = upper_bound(leaf->keys.begin(), leaf->keys.end(), key);
    leaf->keys.insert(it, key);
    if (leaf->keys.size() > m - 1) splitLeaf(root, leaf, m);
}`,
      python: `class Node:
    def __init__(self, is_leaf=False):
        self.keys, self.children = [], []
        self.is_leaf, self.next = is_leaf, None

def insert(root, key, m):
    leaf = find_leaf(root, key)
    leaf.keys.append(key); leaf.keys.sort()
    if len(leaf.keys) > m - 1:
        split_leaf(root, leaf, m)`,
    },
    applications: [
      'MySQL InnoDB / PostgreSQL 主键索引',
      'SQLite 表存储与索引',
      '文件系统目录索引（NTFS、ext4）',
      'LSM-Tree 之外的几乎所有 OLTP 索引',
      '408 数据库 / 操作系统课文件系统模块',
    ],
  },

  txnIsolation: {
    slug: 'txnIsolation',
    name: '事务隔离级别',
    nameEn: 'Transaction Isolation',
    category: 'dbTxn',
    difficulty: '进阶',
    fn: txnIsolation,
    viz: 'txnIsolation',
    timeComplexity: { best: 'N/A', average: 'N/A', worst: 'N/A' },
    spaceComplexity: 'N/A',
    stable: true,
    inPlace: false,
    description: '在两个并发事务的时间线上演示脏读、不可重复读、幻读，对比 4 种隔离级别的防护效果。',
    intuition: `**SQL 标准定义了 3 种并发读异常：**

| 现象 | 描述 |
| --- | --- |
| **脏读** | 读到了另一个事务**还没提交**的数据；对方回滚后你基于幻觉做了决策。|
| **不可重复读** | 同一事务内对**同一行**读两次，结果不一样（中间被人改并提交了）。|
| **幻读** | 同一事务内对**同一查询条件**执行两次，行数变了（中间被人 INSERT 并提交了）。|

**4 种隔离级别正是为了防御以上现象：**

| 级别 | 脏读 | 不可重复读 | 幻读 |
| --- | --- | --- | --- |
| Read Uncommitted (RU) | ❌ 允许 | ❌ 允许 | ❌ 允许 |
| Read Committed (RC) | ✅ 阻止 | ❌ 允许 | ❌ 允许 |
| Repeatable Read (RR) | ✅ 阻止 | ✅ 阻止 | ⚠️ 部分（MySQL 用快照避免） |
| Serializable (S) | ✅ 阻止 | ✅ 阻止 | ✅ 阻止 |

**实现机制速记：** RC 用「读已提交的最新版本」，RR 用「事务开始时的快照」，S 等价于在所有数据上加共享锁（或谓词锁）。`,
    pseudocode: `// 读操作的隔离级别决策
function READ(txn, row):
    case isolation_level:
        RU: return latest_value(row)              // 含未提交
        RC: return latest_committed(row)
        RR: return snapshot(txn.start_ts, row)    // 事务开始时的快照
        S:  acquire shared_lock(row); return committed(row)

// 写操作
function WRITE(txn, row, value):
    if level >= RC: acquire exclusive_lock(row)
    txn.drafts[row] = value                       // 暂存到事务私有 draft

function COMMIT(txn):
    for row in txn.drafts:
        committed[row] = txn.drafts[row]          // 持久化
    release all locks`,
    code: {
      cpp: `#include <iostream>
#include <map>
using namespace std;

// 教学快照模型；可串行化的真实实现还需要锁或其他并发控制。
enum class Isolation { RU, RC, RR, Serializable };
struct Transaction {
    map<int, int> physical, committed, snapshot;
    int read(int row, Isolation level) const {
        if (level == Isolation::RU) return physical.at(row);
        if (level == Isolation::RC) return committed.at(row);
        return snapshot.at(row);
    }
};

int main() {
    // 对应演示：T1 将 100 改为 40 但尚未提交，T2 读取。
    Transaction t{{{1, 40}}, {{1, 100}}, {{1, 100}}};
    for (auto level : {Isolation::RU, Isolation::RC, Isolation::RR, Isolation::Serializable})
        cout << t.read(1, level) << '\n';
}`,
      python: `# 教学快照模型；可串行化的真实实现还需要并发控制。
physical = {1: 40}       # T1 尚未提交的写入
committed = {1: 100}
snapshot = committed.copy()

def read(row, level):
    if level == 'RU': return physical[row]
    if level == 'RC': return committed[row]
    if level in ('RR', 'Serializable'): return snapshot[row]
    raise ValueError(level)

for level in ('RU', 'RC', 'RR', 'Serializable'):
    print(read(1, level))`,
    },
    applications: [
      '所有支持事务的 RDBMS（MySQL、PostgreSQL、SQL Server、Oracle）',
      '理解 InnoDB 的 ReadView / PostgreSQL 的 MVCC 之必修课',
      '微服务 SAGA / 分布式事务的语义基础',
      '面试高频：「MySQL 默认隔离级别是什么？为什么？」',
      '408 数据库系统第 11 章必考内容',
    ],
  },

  hashJoin: {
    slug: 'hashJoin',
    name: '哈希联接',
    nameEn: 'Hash Join',
    category: 'dbQuery',
    difficulty: '中等',
    fn: hashJoin,
    viz: 'hashJoin',
    timeComplexity: { best: 'O(|R|+|S|)', average: 'O(|R|+|S|)', worst: 'O(|R|·|S|)' },
    spaceComplexity: 'O(|R|)',
    stable: false,
    inPlace: false,
    description: '用较小表建哈希表，扫较大表逐行探测——等值联接的现代默认算法。',
    intuition: `**两个表的等值联接最朴素的做法是嵌套循环（NLJ）**：
\`\`\`
for r in R:
    for s in S:
        if r.key == s.key: output(r, s)
\`\`\`
复杂度 O(|R|·|S|)，1 万 × 1 万 = 1 亿次比较——慢得离谱。

**Hash Join 的核心想法：让查找变 O(1)。**
1. **Build phase**：把较小的表 R 全部读进内存，按 join 列建一个哈希表 H。
2. **Probe phase**：遍历较大的表 S，每行用 join 列 hash 一下，到 H 里直接找匹配。

总复杂度从 O(|R|·|S|) 降到 **O(|R| + |S|)**——线性！代价是 build 表必须装得下内存。

**何时不用 Hash Join？**
- 非等值联接（\`>\`、\`<\`、范围）→ 必须用 NLJ 或 sort-merge。
- 一边已经按 join 列**有序**了 → sort-merge join 更划算（省去 hash 步骤）。
- 小表更小（< 几千行）且大表很大 → block NLJ + 索引 lookup 反而快。`,
    pseudocode: `procedure hashJoin(R, S):
    // Build phase：R 是较小的一侧
    H ← empty hash table
    for r in R:
        H[hash(r.key)].append(r)

    // Probe phase
    output ← []
    for s in S:
        bucket ← H[hash(s.key)]
        for r in bucket:
            if r.key == s.key:
                output.append(merge(r, s))
    return output`,
    code: {
      cpp: `vector<pair<R,S>> hashJoin(vector<R>& Rt, vector<S>& St) {
    unordered_multimap<int, R> H;
    for (auto& r : Rt) H.emplace(r.key, r);
    vector<pair<R,S>> out;
    for (auto& s : St) {
        auto range = H.equal_range(s.key);
        for (auto it = range.first; it != range.second; ++it)
            out.emplace_back(it->second, s);
    }
    return out;
}`,
      python: `from collections import defaultdict

def hash_join(R, S, key_R, key_S):
    H = defaultdict(list)
    for r in R: H[key_R(r)].append(r)        # build
    out = []
    for s in S:                                # probe
        for r in H[key_S(s)]:
            out.append((r, s))
    return out`,
    },
    applications: [
      'PostgreSQL / SQL Server 等值联接的默认物理算子',
      'Spark / Hive 的 broadcast hash join（小表 broadcast）',
      'MySQL 8.0 起默认 join 算法',
      '数据仓库星型模型的事实表 × 维度表',
      '面试高频：「Join 有几种实现？为什么这种 SQL 慢？」',
    ],
  },

  mvcc: {
    slug: 'mvcc',
    name: 'MVCC',
    nameEn: 'Multi-Version Concurrency Control',
    category: 'dbTxn',
    difficulty: '进阶',
    fn: mvccDemo,
    viz: 'mvcc',
    timeComplexity: { best: 'O(1)', average: 'O(v)', worst: 'O(v)' },
    spaceComplexity: 'O(v·n)',
    stable: true,
    inPlace: false,
    description: '多版本并发控制：每次写操作保留旧版本，读操作依据事务快照选择可见版本，读写互不阻塞。',
    intuition: `**为什么读写不用互相等待？**

传统锁机制下，读要等写释放锁，写要等读释放锁——高并发时性能崩塌。MVCC 的思路是：**写操作不覆盖旧数据，而是追加新版本**。读操作根据自己的「快照」决定看哪个版本。

**版本链**
每行数据不再是单条记录，而是一条版本链：
\`\`\`
id=1: [value=100, xmin=T1, xmax=T3] → [value=200, xmin=T3, xmax=null]
\`\`\`
- \`xmin\`：创建该版本的事务 id
- \`xmax\`：删除/覆盖该版本的事务 id（null 表示当前有效）

**快照隔离（Snapshot Isolation）**
事务启动时记录「当时哪些事务活跃」，这个集合叫快照（snapshot）。
读一个版本时，可见条件：
1. \`xmin\` 已提交 且 \`xmin\` **不在** 快照集合中（即 xmin 在我启动之前已提交）
2. \`xmax\` 为 null，或 \`xmax\` **在** 快照集合中（即 xmax 还未提交，覆盖对我不可见）

**结论**：T1 启动后，T2 更新了某行并提交，T1 照样看到旧版本——快照冻住了世界。`,
    pseudocode: `// 写：追加新版本
procedure write(row, newVal, txn):
    oldVersion.xmax ← txn.id          // 标记旧版本被覆盖
    append new version {
        value: newVal,
        xmin: txn.id,
        xmax: null
    }

// 读：按快照过滤
procedure read(row, txn):
    for each version v in row.chain:
        if isVisible(v, txn): return v.value

function isVisible(v, txn):
    return committed(v.xmin)
        and v.xmin not in txn.snapshot
        and (v.xmax is null
             or not committed(v.xmax)
             or v.xmax in txn.snapshot)

// Vacuum：清理不再被任何活跃快照引用的旧版本
procedure vacuum(rows, activeSnapshots):
    min_active ← min(activeSnapshots)
    for each version v where v.xmax < min_active:
        remove v`,
    code: {
      cpp: `// PostgreSQL 可见性简化版
struct Version { int xmin, xmax; int value; };
struct Txn { int id; vector<int> snapshot; };

bool isVisible(Version v, Txn& txn, set<int>& committed) {
    // xmin 必须已提交且不在快照中
    if (!committed.count(v.xmin)) return false;
    if (find(txn.snapshot, v.xmin)) return false;
    // xmax 为空，或还未提交，或在快照中（被此后事务删）
    if (v.xmax == 0) return true;
    if (!committed.count(v.xmax)) return true;
    return find(txn.snapshot, v.xmax);
}`,
      python: `# MVCC 可见性判断
def is_visible(version, txn, committed):
    xmin, xmax = version['xmin'], version['xmax']
    # xmin 已提交且不在快照（快照前已提交）
    if xmin not in committed: return False
    if xmin in txn['snapshot']: return False
    # xmax 为 None 或未提交或在快照中
    if xmax is None: return True
    if xmax not in committed: return True
    return xmax in txn['snapshot']`,
    },
    applications: [
      'PostgreSQL、MySQL InnoDB 的并发读写核心机制',
      '快照隔离（Snapshot Isolation）与 Serializable SI',
      'CockroachDB / TiDB 等分布式数据库的 MVCC 实现',
      'Git 提交历史：每次提交保留快照，可随时回溯',
      '408 数据库课：并发控制、事务隔离级别章节',
    ],
  },

  queryPlan: {
    slug: 'queryPlan',
    name: '查询计划',
    nameEn: 'Query Plan (Volcano Model)',
    category: 'dbQuery',
    difficulty: '进阶',
    fn: queryPlanSteps,
    viz: 'queryPlan',
    timeComplexity: { best: 'O(n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(n)',
    stable: true,
    inPlace: false,
    description: '数据库查询执行器将 SQL 翻译成算子树（Volcano 模型），数据从叶子节点向上逐层拉取、过滤、聚合，直到根节点吐出结果。',
    intuition: `**SQL 是声明式的，数据库怎么执行？**

你写 \`SELECT ... FROM ... WHERE ... JOIN ... GROUP BY\`，数据库先通过查询优化器生成**执行计划**——一棵算子树。

**Volcano / Iterator 模型**
每个算子实现同一套接口：\`open() / next() / close()\`。
父节点调 \`next()\`，子节点才去拉数据——这叫**拉取模型（pull model）**。
数据从叶子（SeqScan / IndexScan）向上流，经过 Filter、Join、Sort、Aggregate，最终到达根节点。

**常见算子**
- **SeqScan**：全表扫描，逐行读磁盘页
- **IndexScan**：走 B+ 树索引，精确定位后回表
- **Filter**：按条件过滤，不满足直接丢弃
- **HashJoin**：Build 阶段把小表存进哈希表，Probe 阶段逐行探测
- **Sort**：外部排序（ORDER BY）
- **Aggregate**：GROUP BY + 聚合函数（SUM/COUNT/AVG）
- **Limit**：截取前 N 行

**代价估算**：优化器给每个节点估算 \`cost\`（I/O + CPU）和输出行数 \`rows\`，选择总代价最低的计划。`,
    pseudocode: `// Volcano 模型：每个算子实现 next()
interface Iterator { Tuple next(); }

class SeqScan implements Iterator:
    next() → read next page, return row

class Filter(child, predicate) implements Iterator:
    next():
        loop: t = child.next()
              if predicate(t): return t

class HashJoin(build, probe, key) implements Iterator:
    open():
        // Build phase: fill hash table
        while t = build.next(): hashTable[t[key]].add(t)
    next():
        // Probe phase
        while t = probe.next():
            if t[key] in hashTable: return join(t, hashTable[t[key]])

class Aggregate(child, groupBy, agg) implements Iterator:
    open(): compute groups from child
    next(): return next group result`,
    code: {
      cpp: `#include <functional>
#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;

// Volcano 风格：算子通过 next 按需返回一行。
struct Row { int userId; int amount; };
struct Iterator {
    virtual ~Iterator() = default;
    virtual bool next(Row& row) = 0;
};
struct SeqScan : Iterator {
    vector<Row> rows; size_t pos = 0;
    explicit SeqScan(vector<Row> input) : rows(std::move(input)) {}
    bool next(Row& row) override {
        if (pos == rows.size()) return false;
        row = rows[pos++]; return true;
    }
};
struct Filter : Iterator {
    Iterator& child; function<bool(const Row&)> predicate;
    Filter(Iterator& input, function<bool(const Row&)> pred) : child(input), predicate(pred) {}
    bool next(Row& row) override {
        while (child.next(row)) if (predicate(row)) return true;
        return false;
    }
};
struct HashJoin : Iterator {
    vector<Row> result; size_t pos = 0;
    HashJoin(Iterator& users, Iterator& orders) {
        unordered_multimap<int, Row> buckets;
        Row row;
        while (users.next(row)) buckets.emplace(row.userId, row);
        while (orders.next(row)) {
            auto [first, last] = buckets.equal_range(row.userId);
            for (auto it = first; it != last; ++it) result.push_back(row);
        }
    }
    bool next(Row& row) override {
        if (pos == result.size()) return false;
        row = result[pos++]; return true;
    }
};
int main() {
    vector<Row> orders{{1,150},{1,80},{2,200},{4,150}};
    vector<Row> users{{1,0},{1,0},{2,0},{3,0}};
    SeqScan scan(orders); Filter filter(scan, [](const Row& r) { return r.amount > 100; });
    Row row; int count = 0; while (filter.next(row)) ++count;
    cout << count << '\n';
    SeqScan build(users), probe(orders); HashJoin join(build, probe);
    count = 0; while (join.next(row)) ++count;
    cout << count << '\n';
}`,
      python: `# Volcano 风格：算子通过 next 按需返回一行。
class SeqScan:
    def __init__(self, rows): self.rows = iter(rows)
    def next(self): return next(self.rows, None)

class Filter:
    def __init__(self, child, predicate): self.child, self.predicate = child, predicate
    def next(self):
        while (row := self.child.next()) is not None:
            if self.predicate(row): return row
        return None

class HashJoin:
    def __init__(self, build, probe):
        buckets, result = {}, []
        while (row := build.next()) is not None:
            buckets.setdefault(row['user_id'], []).append(row)
        while (row := probe.next()) is not None:
            result.extend((user, row) for user in buckets.get(row['user_id'], []))
        self.rows = iter(result)
    def next(self): return next(self.rows, None)

def count(iterator):
    total = 0
    while iterator.next() is not None: total += 1
    return total

orders = [{'user_id': i, 'amount': a} for i, a in [(1,150),(1,80),(2,200),(4,150)]]
users = [{'user_id': i} for i in (1,1,2,3)]
print(count(Filter(SeqScan(orders), lambda row: row['amount'] > 100)))
print(count(HashJoin(SeqScan(users), SeqScan(orders))))`,
    },
    applications: [
      'MySQL EXPLAIN / PostgreSQL EXPLAIN ANALYZE 输出的执行计划树',
      'Spark 的 DAG 执行引擎（同样是算子树）',
      '数据库内核开发：实现一个简单 SQL 执行引擎',
      '面试高频：「为什么这条 SQL 慢？」背后的执行计划分析',
      '408 数据库课：查询处理与查询优化章节',
    ],
  },
}
