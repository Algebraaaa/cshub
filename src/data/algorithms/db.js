// 数据库系统学科算法（从 algorithms.js 拆出）
import { bplustree } from '../../algorithms/database/bPlusTree'
import { txnIsolation } from '../../algorithms/database/transaction'
import { hashJoin } from '../../algorithms/database/hashJoin'

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
      cpp: `// 教学伪代码：实际由 DBMS 内核实现（如 InnoDB ReadView）
class Transaction {
    map<int, int> drafts;
    long start_ts;
public:
    int read(int row, IsoLevel lvl) {
        switch (lvl) {
            case RU: return physical[row];          // 含 draft
            case RC: return committed[row];
            case RR: return snapshot_at(start_ts, row);
            case S:  lock_shared(row); return committed[row];
        }
    }
};`,
      python: `# psycopg2 设置隔离级别
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_SERIALIZABLE

conn = psycopg2.connect(...)
conn.set_isolation_level(ISOLATION_LEVEL_SERIALIZABLE)

# 之后所有事务都是 Serializable
with conn.cursor() as cur:
    cur.execute("BEGIN")
    cur.execute("UPDATE account SET balance = balance - 100 WHERE id = 1")
    cur.execute("UPDATE account SET balance = balance + 100 WHERE id = 2")
    cur.execute("COMMIT")`,
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
}
