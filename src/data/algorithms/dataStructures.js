// 自动从 algorithms.js 拆分（7 个算法 · dataStructures 学科）
import { binarySearch } from '../../algorithms/dataStructures/binarySearch'
import { fenwickTree } from '../../algorithms/dataStructures/fenwick'
import { hashTable } from '../../algorithms/dataStructures/hashTable'
import { linkedListOps } from '../../algorithms/dataStructures/linkedList'
import { segTree } from '../../algorithms/dataStructures/segTree'
import { lazySegTree } from '../../algorithms/dataStructures/lazySegTree'
import { diffArray } from '../../algorithms/dataStructures/diffArray'
import { trieOps } from '../../algorithms/dataStructures/trie'
import { unionFind } from '../../algorithms/dataStructures/unionFind'

export const DATASTRUCTURES_ALGORITHMS = {
  unionfind: {
    slug: 'unionfind',
    name: '并查集',
    nameEn: 'Union-Find',
    category: 'dataStructures',
    difficulty: '中等',
    fn: unionFind,
    viz: 'unionfind',
    timeComplexity: { best: 'O(α(n))', average: 'O(α(n))', worst: 'O(α(n))' },
    spaceComplexity: 'O(n)',
    stable: null,
    description: '用"按大小合并+路径压缩"实现近乎常数时间的集合合并与查询。',
    intuition: `并查集（Disjoint Set Union，DSU）是一种专门处理"动态连通性"问题的数据结构：给定一组元素，支持两种操作——合并两个集合、查询两个元素是否属于同一集合。

朴素实现用数组存储每个元素的"父节点"，根节点的父节点指向自己。但链状结构会让 Find 退化到 O(n)。

两种关键优化让并查集几乎变成 O(1)：
1. **按大小合并（Union by Size）**：总是把小树挂到大树上，保证树高 ≤ log n。
2. **路径压缩（Path Compression）**：Find 时把路径上所有节点直接指向根节点，使后续 Find 更快。

两者结合后，每次操作均摊代价为 **O(α(n))**，α 是反阿克曼函数，对任何实际数据 α(n) ≤ 4，可视为常数。`,
    pseudocode: `procedure MakeSet(x):
    parent[x] ← x;  size[x] ← 1

procedure Find(x):           // 路径压缩
    if parent[x] ≠ x:
        parent[x] ← Find(parent[x])
    return parent[x]

procedure Union(x, y):       // 按大小合并
    rx ← Find(x);  ry ← Find(y)
    if rx = ry: return       // 已同集
    if size[rx] < size[ry]: swap(rx, ry)
    parent[ry] ← rx
    size[rx] ← size[rx] + size[ry]`,
    code: {
      cpp: `class UnionFind {
    vector<int> parent, sz;
public:
    UnionFind(int n) : parent(n), sz(n, 1) {
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);  // 路径压缩
        return parent[x];
    }
    bool unite(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return false;
        if (sz[rx] < sz[ry]) swap(rx, ry);
        parent[ry] = rx;
        sz[rx] += sz[ry];
        return true;
    }
    bool connected(int x, int y) { return find(x) == find(y); }
};`,
      python: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # 路径压缩
        return self.parent[x]

    def union(self, x, y):
        rx, ry = self.find(x), self.find(y)
        if rx == ry:
            return False
        if self.size[rx] < self.size[ry]:
            rx, ry = ry, rx
        self.parent[ry] = rx
        self.size[rx] += self.size[ry]
        return True

    def connected(self, x, y):
        return self.find(x) == self.find(y)`,
    },
    applications: [
      '图的连通性检测（如 Kruskal 最小生成树算法的核心组件）',
      '社交网络中"朋友的朋友"类型的连通关系查询',
      'LeetCode 200 岛屿数量、721 账户合并、684 冗余连接等经典题',
      '在线算法处理动态网络中节点的实时合并',
    ],
  },

  trie: {
    slug: 'trie',
    name: 'Trie（前缀树）',
    nameEn: 'Trie',
    category: 'dataStructures',
    difficulty: '中等',
    fn: trieOps,
    viz: 'trie',
    timeComplexity: { best: 'O(m)', average: 'O(m)', worst: 'O(m)' },
    spaceComplexity: 'O(n·m)',
    stable: null,
    description: '用多叉树存储字符串集合，每个节点代表一个字符，支持 O(m) 插入与前缀查询。',
    intuition: `Trie（读作 "try"，来自 re**trie**val）是一种专为字符串设计的树形数据结构。每个节点表示字符串的一个字符，从根到某个标记节点的路径拼成一个完整单词。

核心优势在于**前缀共享**：所有以相同前缀开头的单词共享同一段路径，避免重复存储。例如 "app"、"apple"、"apt" 共享 "ap" 路径。

每次插入或查询的时间复杂度为 **O(m)**（m 为字符串长度），与字典中单词数量无关。

常见变体：
- **压缩 Trie**：合并只有一个子节点的链式节点，节省空间
- **后缀树**：存储字符串所有后缀，用于高效子串查询`,
    pseudocode: `procedure Insert(root, word):
    curr ← root
    for ch in word:
        if ch not in curr.children:
            curr.children[ch] ← new TrieNode
        curr ← curr.children[ch]
    curr.isEnd ← true

procedure Search(root, word):
    curr ← root
    for ch in word:
        if ch not in curr.children: return false
        curr ← curr.children[ch]
    return curr.isEnd

procedure StartsWith(root, prefix):
    curr ← root
    for ch in prefix:
        if ch not in curr.children: return false
        curr ← curr.children[ch]
    return true`,
    code: {
      cpp: `struct TrieNode {
    unordered_map<char, TrieNode*> children;
    bool isEnd = false;
};

class Trie {
    TrieNode* root = new TrieNode();
public:
    void insert(const string& word) {
        auto* curr = root;
        for (char c : word) {
            if (!curr->children.count(c))
                curr->children[c] = new TrieNode();
            curr = curr->children[c];
        }
        curr->isEnd = true;
    }
    bool search(const string& word) {
        auto* curr = root;
        for (char c : word) {
            if (!curr->children.count(c)) return false;
            curr = curr->children[c];
        }
        return curr->isEnd;
    }
    bool startsWith(const string& prefix) {
        auto* curr = root;
        for (char c : prefix) {
            if (!curr->children.count(c)) return false;
            curr = curr->children[c];
        }
        return true;
    }
};`,
      python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        curr = self.root
        for ch in word:
            if ch not in curr.children:
                curr.children[ch] = TrieNode()
            curr = curr.children[ch]
        curr.is_end = True

    def search(self, word: str) -> bool:
        curr = self.root
        for ch in word:
            if ch not in curr.children:
                return False
            curr = curr.children[ch]
        return curr.is_end

    def starts_with(self, prefix: str) -> bool:
        curr = self.root
        for ch in prefix:
            if ch not in curr.children:
                return False
            curr = curr.children[ch]
        return True`,
    },
    applications: [
      '搜索引擎自动补全/拼写检查（输入前缀快速给出候选词）',
      'IP 路由表中最长前缀匹配（路由器核心操作）',
      'LeetCode 208 实现 Trie、212 单词搜索 II 等高频题',
      '敏感词过滤系统（多模式匹配的基础）',
    ],
  },

  linkedlist: {
    slug: 'linkedlist',
    name: '链表',
    nameEn: 'Linked List',
    category: 'dataStructures',
    difficulty: '基础',
    fn: linkedListOps,
    viz: 'linkedlist',
    timeComplexity: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    stable: null,
    description: '每个节点持有值和指向下一节点的指针，插入/删除 O(1)，但随机访问 O(n)。',
    intuition: `链表是最基础的线性数据结构之一。与数组不同，链表的节点在内存中**不连续**——每个节点除了存储数据，还包含一个指向下一节点的指针。

这带来了关键权衡：
- **优点**：在已知位置插入/删除只需修改指针，O(1)；动态扩容无需预分配内存。
- **缺点**：随机访问需要从头遍历，O(n)；额外的指针开销增加内存占用；缓存不友好。

常见变体：
- **双向链表**：每节点额外持有 prev 指针，支持 O(1) 的前向遍历与删除
- **循环链表**：尾节点指向头节点，适合队列/轮转算法
- **跳表**：多层索引链表，实现 O(log n) 查找

链表反转是面试高频题：维护 prev/curr 两个指针，逐节点将 next 方向反转。`,
    pseudocode: `// 头插法
procedure Prepend(head, val):
    node ← new Node(val)
    node.next ← head
    head ← node

// 在 pos 位置插入
procedure InsertAt(head, pos, val):
    node ← new Node(val)
    curr ← head;  i ← 0
    while i < pos-1: curr ← curr.next; i++
    node.next ← curr.next
    curr.next ← node

// 反转链表
procedure Reverse(head):
    prev ← null;  curr ← head
    while curr ≠ null:
        nxt ← curr.next
        curr.next ← prev
        prev ← curr;  curr ← nxt
    return prev`,
    code: {
      cpp: `struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

// 头插法 O(1)
ListNode* prepend(ListNode* head, int val) {
    auto* node = new ListNode(val);
    node->next = head;
    return node;
}

// 删除第一个值为 val 的节点 O(n)
ListNode* deleteVal(ListNode* head, int val) {
    auto dummy = new ListNode(0);
    dummy->next = head;
    auto* prev = dummy;
    while (prev->next) {
        if (prev->next->val == val) {
            prev->next = prev->next->next;
            break;
        }
        prev = prev->next;
    }
    return dummy->next;
}

// 反转链表 O(n)
ListNode* reverse(ListNode* head) {
    ListNode* prev = nullptr;
    auto* curr = head;
    while (curr) {
        auto* nxt = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}`,
      python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def prepend(head, val):
    node = ListNode(val)
    node.next = head
    return node

def delete_val(head, val):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next:
        if prev.next.val == val:
            prev.next = prev.next.next
            break
        prev = prev.next
    return dummy.next

def reverse(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
    },
    applications: [
      '操作系统内存管理的空闲块链表',
      'LRU 缓存淘汰算法（双向链表 + 哈希表实现 O(1) 操作）',
      '浏览器前进/后退历史记录（双向链表）',
      '多项式表示与大数乘法',
    ],
  },

  hashtable: {
    slug: 'hashtable',
    name: '哈希表',
    nameEn: 'Hash Table',
    category: 'dataStructures',
    difficulty: '中等',
    fn: hashTable,
    viz: 'hashtable',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    stable: null,
    description: '通过哈希函数将键映射到桶，配合链地址法解决冲突，均摊 O(1) 的插入与查找。',
    intuition: `哈希表是实现关联数组（键值对）的核心数据结构，也是几乎所有高级语言标准库中 Map/Dict/Object 的底层实现。

核心思想：用**哈希函数** h(key) 把任意键映射到 [0, m) 区间内的桶索引，直接通过数组下标 O(1) 定位。

**哈希冲突**不可避免（鸽巢原理），有两种主流解决方案：
1. **链地址法（Chaining）**：每个桶存储一条链表，冲突元素追加到链尾。平均情况下链表长度为 n/m（装载因子 α），查找 O(1+α)。
2. **开放寻址法（Open Addressing）**：冲突时按某规则探测下一个空桶（线性探测、二次探测、双散列）。

**负载因子 α = n/m** 是性能关键：通常保持 α < 0.75，超过时扩容（重哈希，将数组扩大一倍）以保持均摊 O(1)。`,
    pseudocode: `function hash(key, m):
    h ← 0
    for ch in key: h ← (h × 31 + ord(ch)) mod m
    return h

procedure Insert(T, key, value):
    i ← hash(key, m)
    for node in T[i]:
        if node.key = key: node.value ← value; return
    T[i].append({key, value})

procedure Lookup(T, key):
    i ← hash(key, m)
    for node in T[i]:
        if node.key = key: return node.value
    return NOT_FOUND

procedure Delete(T, key):
    i ← hash(key, m)
    T[i].remove(node where node.key = key)`,
    code: {
      cpp: `template<typename K, typename V>
class HashMap {
    int m;
    vector<list<pair<K,V>>> table;
    int hash(const K& k) {
        size_t h = std::hash<K>{}(k);
        return h % m;
    }
public:
    HashMap(int m = 16) : m(m), table(m) {}

    void insert(const K& key, const V& val) {
        int i = hash(key);
        for (auto& [k, v] : table[i])
            if (k == key) { v = val; return; }
        table[i].push_back({key, val});
    }

    V* lookup(const K& key) {
        int i = hash(key);
        for (auto& [k, v] : table[i])
            if (k == key) return &v;
        return nullptr;
    }

    bool remove(const K& key) {
        int i = hash(key);
        auto& chain = table[i];
        for (auto it = chain.begin(); it != chain.end(); ++it)
            if (it->first == key) { chain.erase(it); return true; }
        return false;
    }
};`,
      python: `class HashMap:
    def __init__(self, m=16):
        self.m = m
        self.table = [[] for _ in range(m)]

    def _hash(self, key):
        h = 0
        for ch in str(key):
            h = (h * 31 + ord(ch)) % self.m
        return h

    def insert(self, key, value):
        i = self._hash(key)
        for item in self.table[i]:
            if item[0] == key:
                item[1] = value
                return
        self.table[i].append([key, value])

    def lookup(self, key):
        i = self._hash(key)
        for k, v in self.table[i]:
            if k == key:
                return v
        return None

    def delete(self, key):
        i = self._hash(key)
        self.table[i] = [(k, v) for k, v in self.table[i] if k != key]`,
    },
    applications: [
      '编程语言运行时的变量符号表（Python dict、Java HashMap）',
      '数据库索引结构（等值查询的哈希索引）',
      '缓存系统（Redis 的 hash 数据类型）',
      '去重与频次统计（Two Sum、Top K Frequent Elements 等经典题）',
    ],
  },

  segtree: {
    slug: 'segtree',
    name: '线段树',
    nameEn: 'Segment Tree',
    category: 'dataStructures',
    difficulty: '进阶',
    fn: segTree,
    viz: 'segtree',
    timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(n)',
    stable: null,
    description: '将数组区间映射为二叉树节点，支持 O(log n) 的区间查询与单点更新。',
    intuition: `线段树（Segment Tree）是一种用于高效处理**区间查询**与**区间/单点更新**的二叉树数据结构。

核心思想：将数组 [0, n-1] 划分为递归的子区间，每个节点存储其对应区间的**聚合信息**（如区间和、最大值、最小值）。

树的结构：
- 根节点对应整个数组
- 每个内部节点 [l, r] 分裂为左子 [l, mid] 和右子 [mid+1, r]
- 叶节点对应单个元素
- 共 **O(n)** 个节点（通常开 4n 大小数组）

**区间查询 O(log n)**：若当前节点区间完全在查询范围内，直接返回；否则分别查询左右子树并合并。最多访问 **4 log n** 个节点。

**单点更新 O(log n)**：从叶节点开始，沿路径向上更新所有祖先节点。

高级变体：懒标记（Lazy Propagation）支持区间整体更新，仍保持 O(log n)。`,
    pseudocode: `// 建树（求区间和）
procedure Build(node, start, end):
    if start = end:
        tree[node] ← arr[start]; return
    mid ← (start + end) / 2
    Build(2·node, start, mid)
    Build(2·node+1, mid+1, end)
    tree[node] ← tree[2·node] + tree[2·node+1]

// 区间查询 [l, r]
procedure Query(node, start, end, l, r):
    if r < start or end < l: return 0    // 不相交
    if l ≤ start and end ≤ r: return tree[node]  // 完全包含
    mid ← (start + end) / 2
    return Query(2·node,start,mid,l,r) + Query(2·node+1,mid+1,end,l,r)

// 单点更新 arr[idx] ← val
procedure Update(node, start, end, idx, val):
    if start = end: tree[node] ← val; return
    mid ← (start + end) / 2
    if idx ≤ mid: Update(2·node, start, mid, idx, val)
    else:         Update(2·node+1, mid+1, end, idx, val)
    tree[node] ← tree[2·node] + tree[2·node+1]`,
    code: {
      cpp: `class SegTree {
    int n;
    vector<int> tree;
public:
    SegTree(vector<int>& a) : n(a.size()), tree(4*a.size()) {
        build(1, 0, n-1, a);
    }
    void build(int node, int s, int e, vector<int>& a) {
        if (s == e) { tree[node] = a[s]; return; }
        int mid = (s+e)/2;
        build(2*node, s, mid, a);
        build(2*node+1, mid+1, e, a);
        tree[node] = tree[2*node] + tree[2*node+1];
    }
    int query(int node, int s, int e, int l, int r) {
        if (r < s || e < l) return 0;
        if (l <= s && e <= r) return tree[node];
        int mid = (s+e)/2;
        return query(2*node,s,mid,l,r) + query(2*node+1,mid+1,e,l,r);
    }
    void update(int node, int s, int e, int idx, int val) {
        if (s == e) { tree[node] = val; return; }
        int mid = (s+e)/2;
        if (idx <= mid) update(2*node, s, mid, idx, val);
        else update(2*node+1, mid+1, e, idx, val);
        tree[node] = tree[2*node] + tree[2*node+1];
    }
    int query(int l, int r) { return query(1, 0, n-1, l, r); }
    void update(int idx, int val) { update(1, 0, n-1, idx, val); }
};`,
      python: `class SegTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self._build(1, 0, self.n - 1, arr)

    def _build(self, node, s, e, arr):
        if s == e:
            self.tree[node] = arr[s]
            return
        mid = (s + e) // 2
        self._build(2*node, s, mid, arr)
        self._build(2*node+1, mid+1, e, arr)
        self.tree[node] = self.tree[2*node] + self.tree[2*node+1]

    def query(self, l, r):
        return self._query(1, 0, self.n-1, l, r)

    def _query(self, node, s, e, l, r):
        if r < s or e < l: return 0
        if l <= s <= e <= r: return self.tree[node]
        mid = (s + e) // 2
        return self._query(2*node, s, mid, l, r) + \
               self._query(2*node+1, mid+1, e, l, r)

    def update(self, idx, val):
        self._update(1, 0, self.n-1, idx, val)

    def _update(self, node, s, e, idx, val):
        if s == e:
            self.tree[node] = val
            return
        mid = (s + e) // 2
        if idx <= mid: self._update(2*node, s, mid, idx, val)
        else: self._update(2*node+1, mid+1, e, idx, val)
        self.tree[node] = self.tree[2*node] + self.tree[2*node+1]`,
    },
    applications: [
      '区间求和/最值查询（数据库聚合、统计分析）',
      '动态规划优化（DP 中的区间最值查询）',
      '计算几何（扫描线算法中的区间覆盖计数）',
      'LeetCode 307 区域和检索、315 计算右侧小于当前元素的个数等进阶题',
    ],
  },

  binarysearch: {
    slug: 'binarysearch',
    name: '二分查找',
    nameEn: 'Binary Search',
    category: 'dataStructures',
    difficulty: '基础',
    fn: binarySearch,
    viz: 'binarysearch',
    timeComplexity: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
    description: '在已排序数组上每次将搜索区间减半，O(log n) 定位目标。',
    intuition: `二分查找的核心是 **不变量**：答案永远在区间 [l, r] 内。每次取 mid 后，根据 arr[mid] 和 target 的比较结果，丢掉一半区间。\n\n三种主流变体：\n- **经典二分**：找任意一个等于 target 的位置（不存在返回 -1）\n- **左边界 lower_bound**：找第一个 ≥ target 的位置（C++ STL 的 std::lower_bound）\n- **右边界 upper_bound**：找第一个 > target 的位置（std::upper_bound）\n\n上界和下界配合可用来求 **target 的出现区间** [lower, upper)，进而求出现次数 = upper − lower。\n\n面试时最容易写错的地方是边界条件：闭区间 [l,r] 用 \`while (l <= r)\` + \`r = mid - 1\`；半开区间 [l,r) 用 \`while (l < r)\` + \`r = mid\`。两套写法保持一致才不会死循环。`,
    pseudocode: `procedure binarySearch(arr, target):
    l ← 0
    r ← length(arr) - 1
    while l ≤ r:
        mid ← (l + r) / 2
        if arr[mid] = target:
            return mid
        else if arr[mid] < target:
            l ← mid + 1
        else:
            r ← mid - 1
    return -1`,
    code: {
      cpp: `// 经典二分（精确匹配）
int binarySearch(vector<int>& arr, int target) {
    int l = 0, r = arr.size() - 1;
    while (l <= r) {
        int mid = l + (r - l) / 2;   // 防溢出
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}

// 左边界（lower_bound）
int lowerBound(vector<int>& arr, int target) {
    int l = 0, r = arr.size();        // 半开 [l, r)
    while (l < r) {
        int mid = l + (r - l) / 2;
        if (arr[mid] >= target) r = mid;
        else l = mid + 1;
    }
    return l;
}`,
      python: `# 经典二分
def binary_search(arr, target):
    l, r = 0, len(arr) - 1
    while l <= r:
        mid = (l + r) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            l = mid + 1
        else:
            r = mid - 1
    return -1

# 左边界（lower_bound）
def lower_bound(arr, target):
    l, r = 0, len(arr)
    while l < r:
        mid = (l + r) // 2
        if arr[mid] >= target:
            r = mid
        else:
            l = mid + 1
    return l`,
    },
    applications: [
      '已排序数组中的精确查找',
      'lower_bound / upper_bound 求元素出现区间',
      '二分答案（最值问题 → 判定问题）',
      '配合 sqrt / 旋转数组等变形题',
      '二分查找树 BST 的查找路径本质同源',
    ],
  },

  fenwick: {
    slug: 'fenwick',
    name: 'Fenwick 树（树状数组）',
    nameEn: 'Fenwick Tree (BIT)',
    category: 'dataStructures',
    difficulty: '进阶',
    fn: fenwickTree,
    viz: 'fenwick',
    timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(n)',
    description: '用 lowbit 跳跃的紧凑数组，支持 O(log n) 的单点更新和前缀和查询。',
    intuition: `**树状数组**（Binary Indexed Tree，BIT）是用一维数组实现的"虚拟树"，能在 O(log n) 时间内：\n- **单点更新** a[i] += delta\n- **查询前缀和** sum(1..i)\n\n核心是 \`lowbit(x) = x & (-x)\`，意思是"x 的二进制最低位 1 所代表的值"：\n- lowbit(6) = lowbit(0b110) = 0b010 = 2\n- lowbit(8) = lowbit(0b1000) = 0b1000 = 8\n\n**tree[i] 管辖的区间** = [i - lowbit(i) + 1, i]，长度恰好是 lowbit(i)。这样一来：\n- 查询 sum(1..i)：从 i 出发，每次 \`i -= lowbit(i)\` 跳到上一段，累加 tree[i]，直到 i = 0\n- 更新 a[i] += d：从 i 出发，每次 \`i += lowbit(i)\` 跳到管辖它的下一个节点，给 tree[i] 加 d，直到 i > n\n\n两个操作访问的节点数都是 O(log n)。\n\n相比线段树：常数小、代码短，但功能弱（只能维护前缀和这种支持差分的运算，不支持区间最值）。Fenwick 树是 OI / 竞赛 / 算法岗面试的高频题。`,
    pseudocode: `function lowbit(x):
    return x AND (-x)

function update(i, delta):
    while i ≤ n:
        tree[i] ← tree[i] + delta
        i ← i + lowbit(i)

function prefixSum(i):
    sum ← 0
    while i > 0:
        sum ← sum + tree[i]
        i ← i - lowbit(i)
    return sum

// 区间和 = prefixSum(r) - prefixSum(l - 1)`,
    code: {
      cpp: `class Fenwick {
    int n;
    vector<int> tree;
public:
    Fenwick(int n_) : n(n_), tree(n_ + 1, 0) {}

    int lowbit(int x) { return x & (-x); }

    void update(int i, int delta) {
        for (; i <= n; i += lowbit(i))
            tree[i] += delta;
    }

    int prefixSum(int i) {
        int sum = 0;
        for (; i > 0; i -= lowbit(i))
            sum += tree[i];
        return sum;
    }

    int rangeSum(int l, int r) {
        return prefixSum(r) - prefixSum(l - 1);
    }
};`,
      python: `class Fenwick:
    def __init__(self, n):
        self.n = n
        self.tree = [0] * (n + 1)

    @staticmethod
    def lowbit(x):
        return x & -x

    def update(self, i, delta):
        while i <= self.n:
            self.tree[i] += delta
            i += self.lowbit(i)

    def prefix_sum(self, i):
        s = 0
        while i > 0:
            s += self.tree[i]
            i -= self.lowbit(i)
        return s

    def range_sum(self, l, r):
        return self.prefix_sum(r) - self.prefix_sum(l - 1)`,
    },
    applications: [
      '动态前缀和 / 区间和查询',
      '逆序对计数（树状数组经典题）',
      '二维 BIT：矩阵区间和',
      '差分 + BIT：区间更新 + 单点查询',
      'OI / 算法竞赛核心数据结构',
    ],
  },

  lazyseg: {
    slug: 'lazyseg',
    name: '懒标记线段树',
    nameEn: 'Lazy Segment Tree',
    category: 'dataStructures',
    difficulty: '进阶',
    fn: lazySegTree,
    viz: 'lazyseg',
    timeComplexity: { best: 'O(log n)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(n)',
    stable: null,
    description: '线段树 + lazy 标记，支持 O(log n) 的区间修改与区间查询。',
    intuition: `懒标记线段树是普通线段树的进阶版本，解决了**区间修改**的效率问题。

**问题：** 普通线段树的单点更新 O(log n)，但如果要做"区间加"操作（对 [l, r] 所有元素加 val），朴素做法是逐个单点更新，O(n log n)。

**解决方案 — Lazy 标记：**
- 当更新范围完全覆盖某个节点时，不继续向下递归，而是在该节点打上一个"懒标记" lazy[node]
- lazy[node] 表示"这个节点的子树中每个元素都应该加上 lazy[node]，但还没来得及向下传播"
- 查询或更新需要进入子树时，先 pushDown 把懒标记传给子节点

**PushDown 操作：**
- lazy[left] += lazy[node]
- lazy[right] += lazy[node]
- tree[left] += lazy[node] × (左子树长度)
- tree[right] += lazy[node] × (右子树长度)
- lazy[node] = 0

这样区间加和区间查询都是 O(log n)。`,
    pseudocode: `procedure PushDown(node, len):
    if lazy[node] ≠ 0:
        lazy[2·node] += lazy[node]
        lazy[2·node+1] += lazy[node]
        tree[2·node] += lazy[node] × (len/2)
        tree[2·node+1] += lazy[node] × (len - len/2)
        lazy[node] ← 0

procedure RangeAdd(node, l, r, ql, qr, val):
    if ql ≤ l and r ≤ qr:           // 完全覆盖
        tree[node] += val × (r-l+1)
        lazy[node] += val; return
    PushDown(node, r-l+1)
    mid ← (l+r)/2
    if ql ≤ mid: RangeAdd(2·node, l, mid, ql, qr, val)
    if qr > mid: RangeAdd(2·node+1, mid+1, r, ql, qr, val)
    tree[node] ← tree[2·node] + tree[2·node+1]

procedure Query(node, l, r, ql, qr):
    if ql ≤ l and r ≤ qr: return tree[node]
    PushDown(node, r-l+1)
    mid ← (l+r)/2; sum ← 0
    if ql ≤ mid: sum += Query(2·node, l, mid, ql, qr)
    if qr > mid: sum += Query(2·node+1, mid+1, r, ql, qr)
    return sum`,
    code: {
      cpp: `struct LazySegTree {
    int n;
    vector<ll> tree, lazy;

    void push_up(int u) { tree[u] = tree[2*u] + tree[2*u+1]; }

    void push_down(int u, int len) {
        if (lazy[u] == 0) return;
        lazy[2*u] += lazy[u]; lazy[2*u+1] += lazy[u];
        tree[2*u] += lazy[u] * (len/2);
        tree[2*u+1] += lazy[u] * (len - len/2);
        lazy[u] = 0;
    }

    void build(int u, int l, int r, vector<ll>& a) {
        if (l == r) { tree[u] = a[l]; return; }
        int mid = (l+r)/2;
        build(2*u, l, mid, a); build(2*u+1, mid+1, r, a);
        push_up(u);
    }

    void update(int u, int l, int r, int ql, int qr, ll val) {
        if (ql <= l && r <= qr) {
            tree[u] += val * (r - l + 1);
            lazy[u] += val; return;
        }
        push_down(u, r - l + 1);
        int mid = (l+r)/2;
        if (ql <= mid) update(2*u, l, mid, ql, qr, val);
        if (qr > mid) update(2*u+1, mid+1, r, ql, qr, val);
        push_up(u);
    }

    ll query(int u, int l, int r, int ql, int qr) {
        if (ql <= l && r <= qr) return tree[u];
        push_down(u, r - l + 1);
        int mid = (l+r)/2; ll res = 0;
        if (ql <= mid) res += query(2*u, l, mid, ql, qr);
        if (qr > mid) res += query(2*u+1, mid+1, r, ql, qr);
        return res;
    }
};`,
      python: `class LazySegTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self.lazy = [0] * (4 * self.n)
        self._build(1, 0, self.n-1, arr)

    def _push_up(self, u):
        self.tree[u] = self.tree[2*u] + self.tree[2*u+1]

    def _push_down(self, u, length):
        if self.lazy[u] == 0: return
        for child, half in [(2*u, length//2), (2*u+1, length - length//2)]:
            self.lazy[child] += self.lazy[u]
            self.tree[child] += self.lazy[u] * half
        self.lazy[u] = 0

    def _build(self, u, l, r, arr):
        if l == r: self.tree[u] = arr[l]; return
        mid = (l+r)//2
        self._build(2*u, l, mid, arr)
        self._build(2*u+1, mid+1, r, arr)
        self._push_up(u)

    def update(self, ql, qr, val):
        self._update(1, 0, self.n-1, ql, qr, val)

    def _update(self, u, l, r, ql, qr, val):
        if ql <= l and r <= qr:
            self.tree[u] += val * (r - l + 1)
            self.lazy[u] += val; return
        self._push_down(u, r - l + 1)
        mid = (l+r)//2
        if ql <= mid: self._update(2*u, l, mid, ql, qr, val)
        if qr > mid: self._update(2*u+1, mid+1, r, ql, qr, val)
        self._push_up(u)

    def query(self, ql, qr):
        return self._query(1, 0, self.n-1, ql, qr)

    def _query(self, u, l, r, ql, qr):
        if ql <= l and r <= qr: return self.tree[u]
        self._push_down(u, r - l + 1)
        mid = (l+r)//2; res = 0
        if ql <= mid: res += self._query(2*u, l, mid, ql, qr)
        if qr > mid: res += self._query(2*u+1, mid+1, r, ql, qr)
        return res`,
    },
    applications: [
      '区间加 / 区间求和（经典模板题）',
      '区间赋值 / 区间最值（需要不同 pushDown 策略）',
      '二维线段树（矩阵区域操作）',
      'CCPC/ICPC 数据结构核心考点',
    ],
  },

  diffarray: {
    slug: 'diffarray',
    name: '差分数组',
    nameEn: 'Difference Array',
    category: 'dataStructures',
    difficulty: '中等',
    fn: diffArray,
    viz: 'diffarray',
    timeComplexity: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
    spaceComplexity: 'O(n)',
    stable: null,
    description: 'd[i] = a[i] − a[i−1]，区间加 O(1)，前缀和恢复 O(n)。',
    intuition: `**差分数组**是前缀和的逆运算，专门用于高效处理**多次区间修改 + 最终统一查询**的场景。

**定义：** 对于数组 a[0..n-1]，差分数组 d[0..n]：
- d[0] = a[0]
- d[i] = a[i] - a[i-1]（i ≥ 1）

**区间加 O(1)：** 对 a[l..r] 所有元素加 val，只需：
- d[l] += val
- d[r+1] -= val

因为前缀和恢复时，d[l] 的增加会影响 a[l], a[l+1], ..., a[n-1]，而 d[r+1] 的减少又抵消了 a[r+1] 之后的影响。

**恢复数组 O(n)：** a[i] = a[i-1] + d[i]（即 d 的前缀和就是 a）

**适用场景：**
- 多次区间修改，最后一次查询全部结果
- 不适合需要**区间修改 + 区间查询**交替进行的场景（用线段树）

**与树状数组的配合：** 差分 + BIT = 区间修改 + 单点查询 O(log n)。`,
    pseudocode: `// 构建差分数组
procedure BuildDiff(a):
    d[0] ← a[0]
    for i from 1 to n-1:
        d[i] ← a[i] - a[i-1]
    return d

// 区间加 [l, r] += val
procedure RangeAdd(d, l, r, val):
    d[l] += val
    if r + 1 < n:
        d[r + 1] -= val

// 恢复数组（d 的前缀和）
procedure Restore(d):
    a[0] ← d[0]
    for i from 1 to n-1:
        a[i] ← a[i-1] + d[i]
    return a`,
    code: {
      cpp: `// 构建差分数组
vector<int> buildDiff(const vector<int>& a) {
    int n = a.size();
    vector<int> d(n + 1, 0);
    d[0] = a[0];
    for (int i = 1; i < n; i++) d[i] = a[i] - a[i-1];
    return d;
}

// 区间加 [l, r] += val
void rangeAdd(vector<int>& d, int l, int r, int val) {
    d[l] += val;
    if (r + 1 < (int)d.size()) d[r + 1] -= val;
}

// 恢复数组
vector<int> restore(const vector<int>& d, int n) {
    vector<int> a(n);
    a[0] = d[0];
    for (int i = 1; i < n; i++) a[i] = a[i-1] + d[i];
    return a;
}`,
      python: `def build_diff(a):
    n = len(a)
    d = [0] * (n + 1)
    d[0] = a[0]
    for i in range(1, n):
        d[i] = a[i] - a[i-1]
    return d

def range_add(d, l, r, val):
    d[l] += val
    if r + 1 < len(d):
        d[r + 1] -= val

def restore(d, n):
    a = [0] * n
    a[0] = d[0]
    for i in range(1, n):
        a[i] = a[i-1] + d[i]
    return a`,
    },
    applications: [
      '多次区间加操作后统一查询结果',
      '航班预订统计（LeetCode 1109）',
      '拼车问题（LeetCode 1094）',
      '差分 + BIT：区间修改 + 单点查询',
    ],
  },
}

export default DATASTRUCTURES_ALGORITHMS
