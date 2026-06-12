// 自动从 algorithms.js 拆分（3 个算法 · string 学科）
import { kmp } from '../../algorithms/string/kmp'
import { naivePatternMatching } from '../../algorithms/string/naive'
import { rabinKarp } from '../../algorithms/string/rabinKarp'
import { ahoCorasick } from '../../algorithms/string/ahoCorasick'
import { stringHash } from '../../algorithms/string/stringHash'

export const STRING_ALGORITHMS = {
  naive: {
    slug: 'naive',
    name: '朴素字符串匹配',
    nameEn: 'Naive Pattern Matching',
    category: 'string',
    difficulty: '基础',
    fn: naivePatternMatching,
    viz: 'string',
    timeComplexity: { best: 'O(n)', average: 'O(m*(n-m+1))', worst: 'O(m*(n-m+1))' },
    spaceComplexity: 'O(1)',
    description: '通过两层循环，依次对比主串的每一个起始位置是否与模式串匹配。',
    intuition: '最直观的暴力匹配法。像是在主串上滑动一个和模式串一样长的窗口，每次窗口和模式串的字符逐一对比。如果中间有字符不匹配了，就放弃当前起始位置，把窗口向右移动1位，重新开始比较。实现简单，不需要预处理，但在最坏情况下（比如主串是 "AAAA...AB"，模式串是 "AAAAB"），会做大量无用功的重复对比。',
    pseudocode: `procedure naivePatternMatch(text, pattern):
    n ← length(text), m ← length(pattern)
    for s from 0 to n - m:
        match ← true
        for j from 0 to m - 1:
            if text[s + j] ≠ pattern[j]:
                match ← false
                break
        if match:
            return s
    return -1`,
    code: {
      cpp: `int naivePatternMatch(string text, string pattern) {
    int n = text.length(), m = pattern.length();
    if (m == 0) return 0;
    
    for (int s = 0; s <= n - m; s++) {
        bool match = true;
        for (int j = 0; j < m; j++) {
            if (text[s + j] != pattern[j]) {
                match = false;
                break;
            }
        }
        if (match) return s;
    }
    return -1;
}`,
      python: `def naive_pattern_match(text, pattern):
    n = len(text)
    m = len(pattern)
    if m == 0:
        return 0
        
    for s in range(n - m + 1):
        match = True
        for j in range(m):
            if text[s + j] != pattern[j]:
                match = False
                break
        if match:
            return s
    return -1`,
    },
    applications: [
      '简单文本查找（如大多数语言内置的 indexOf）',
      '模式串极短的场景',
    ],
  },

  kmp: {
    slug: 'kmp',
    name: 'KMP 算法',
    nameEn: 'Knuth-Morris-Pratt',
    category: 'string',
    difficulty: '进阶',
    fn: kmp,
    viz: 'string',
    timeComplexity: { best: 'O(n)', average: 'O(n + m)', worst: 'O(n + m)' },
    spaceComplexity: 'O(m)',
    description: '利用已匹配的部分信息，避免主串指针回退，实现线性时间匹配。',
    intuition: '当匹配失败时，由于前面一部分字符已经匹配过了，我们其实知道主串这部分是什么。KMP的核心就是"不回退主串指针"，而是利用模式串自身的特点（最长公共前后缀），把模式串尽可能多地向右滑动。\n\n需要先花 O(m) 的时间预处理模式串，计算 Next 数组（也就是 LPS 数组，最长公共前后缀长度）。发生失配时，通过 Next 数组快速将模式串的指针 j 移动到一个合适的位置继续比较，而主串的指针 i 永远只增不减。',
    pseudocode: `procedure computeLPS(pattern, m):
    lps ← array of m zeros
    len ← 0, i ← 1
    while i < m:
        if pattern[i] = pattern[len]:
            len ← len + 1, lps[i] ← len, i ← i + 1
        else:
            if len ≠ 0: len ← lps[len - 1]
            else: lps[i] ← 0, i ← i + 1
    return lps

procedure kmpMatch(text, pattern):
    n ← length(text), m ← length(pattern)
    if m = 0: return 0
    lps ← computeLPS(pattern, m)
    i ← 0, j ← 0
    while n - i >= m - j:
        if text[i] = pattern[j]:
            i ← i + 1, j ← j + 1
            if j = m:
                return i - j // Match found
        else:
            if j ≠ 0: j ← lps[j - 1]
            else: i ← i + 1
    return -1`,
    code: {
      cpp: `vector<int> computeLPS(string pattern) {
    int m = pattern.length();
    vector<int> lps(m, 0);
    int len = 0, i = 1;
    while (i < m) {
        if (pattern[i] == pattern[len]) {
            len++; lps[i] = len; i++;
        } else {
            if (len != 0) {
                len = lps[len - 1];
            } else {
                lps[i] = 0; i++;
            }
        }
    }
    return lps;
}

int kmpMatch(string text, string pattern) {
    int n = text.length(), m = pattern.length();
    if (m == 0) return 0;
    
    vector<int> lps = computeLPS(pattern);
    int i = 0, j = 0;
    while (n - i >= m - j) {
        if (text[i] == pattern[j]) {
            i++; j++;
            if (j == m) return i - j;
        } else {
            if (j != 0) j = lps[j - 1];
            else i++;
        }
    }
    return -1;
}`,
      python: `def compute_lps(pattern):
    m = len(pattern)
    lps = [0] * m
    length = 0
    i = 1
    while i < m:
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        else:
            if length != 0:
                length = lps[length - 1]
            else:
                lps[i] = 0
                i += 1
    return lps

def kmp_match(text, pattern):
    n, m = len(text), len(pattern)
    if m == 0:
        return 0
        
    lps = compute_lps(pattern)
    i = j = 0
    while n - i >= m - j:
        if text[i] == pattern[j]:
            i += 1
            j += 1
            if j == m:
                return i - j
        else:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1
    return -1`,
    },
    applications: [
      '生物信息学：DNA 序列分析匹配',
      '文本编辑器中的整词搜索',
      '网络入侵检测系统（基于签名的匹配）',
    ],
  },

  rabinkarp: {
    slug: 'rabinkarp',
    name: 'Rabin-Karp',
    nameEn: 'Rabin-Karp',
    category: 'string',
    difficulty: '中等',
    fn: rabinKarp,
    viz: 'string',
    timeComplexity: { best: 'O(n+m)', average: 'O(n+m)', worst: 'O(nm)' },
    spaceComplexity: 'O(1)',
    description: '用滚动哈希快速筛选候选窗口，再逐字符验证。',
    intuition: `Rabin-Karp 的核心是**滚动哈希（Rolling Hash）**：预先计算模式串的哈希值，然后用 O(1) 的方式将文本窗口哈希从位置 i 滑动到 i+1（加入新字符，移出旧字符）。\n\n若窗口哈希 == 模式哈希，再逐字符验证（避免哈希碰撞误判）。\n\n平均情况碰撞极少，时间接近 O(n+m)。最坏情况（大量碰撞）为 O(nm)，但选择好的哈希函数可让概率趋近于0。\n\n特别适合**多模式匹配**：同时搜索多个模式时，只需计算一次文本哈希。`,
    pseudocode: `procedure rabinKarp(text, pattern):\n    patHash ← hash(pattern)\n    winHash ← hash(text[0..m-1])\n    for i from 0 to n-m:\n        if winHash == patHash:\n            if text[i..i+m-1] == pattern:  // 验证\n                report match at i\n        // 滚动哈希\n        winHash = rollHash(winHash, text[i], text[i+m])`,
    code: {
      cpp: `const long long BASE=31, MOD=1e9+9;\n\nbool rabinKarp(string text, string pat) {\n    int n=text.size(), m=pat.size();\n    long long ph=0, wh=0, pw=1;\n    for(int i=0;i<m;i++){\n        ph=(ph*BASE+pat[i])%MOD;\n        wh=(wh*BASE+text[i])%MOD;\n        if(i<m-1) pw=pw*BASE%MOD;\n    }\n    for(int i=0;i<=n-m;i++){\n        if(wh==ph && text.substr(i,m)==pat) return true;\n        if(i<n-m)\n            wh=(BASE*(wh-text[i]*pw%MOD+MOD)+text[i+m])%MOD;\n    }\n    return false;\n}`,
      python: `def rabin_karp(text, pattern):\n    BASE, MOD = 31, 10**9 + 9\n    n, m = len(text), len(pattern)\n    ph = wh = 0\n    pw = pow(BASE, m-1, MOD)\n    for i in range(m):\n        ph = (ph * BASE + ord(pattern[i])) % MOD\n        wh = (wh * BASE + ord(text[i])) % MOD\n    for i in range(n - m + 1):\n        if wh == ph and text[i:i+m] == pattern:\n            return i  # 匹配\n        if i < n - m:\n            wh = (BASE*(wh - ord(text[i])*pw) + ord(text[i+m])) % MOD\n    return -1`,
    },
    applications: [
      '文档抄袭检测（同时匹配多个片段）',
      '多模式字符串搜索',
      '生物信息学的序列相似性搜索',
      '网络入侵检测中的特征串匹配',
    ],
  },

  aho: {
    slug: 'aho',
    name: 'AC 自动机',
    nameEn: 'Aho-Corasick Automaton',
    category: 'string',
    difficulty: '进阶',
    fn: ahoCorasick,
    viz: 'aho',
    timeComplexity: { best: 'O(n + m + z)', average: 'O(n + m + z)', worst: 'O(n + m + z)' },
    spaceComplexity: 'O(m·|Σ|)',
    stable: null,
    description: '在 Trie 上建 fail 指针（类似 KMP 的 next），多模式串一次扫描完成匹配。',
    intuition: `**AC 自动机（Aho-Corasick Automaton）** 是多模式字符串匹配的经典算法，能在一次扫描中同时查找多个模式串。

**核心思想：** 把所有模式串构建成一棵 Trie，然后在 Trie 上添加 **fail 指针**（失配指针），功能类似 KMP 的 next 数组。

**三步走：**
1. **建 Trie：** 把所有模式串插入 Trie，在结尾节点标记匹配信息
2. **建 fail 指针：** BFS 遍历 Trie，对每个节点 u 计算 fail[u]
   - fail[u] 指向 Trie 中"与 u 节点对应的字符串的最长真后缀"匹配的节点
   - 若当前字符在 Trie 中没有匹配的子节点，就跳转到 fail 指针继续尝试
3. **扫描文本：** 沿 Trie 走，每到一个节点就累加该节点及其 fail 链上的匹配数

**时间复杂度：** 建 Trie O(Σ|pi|)，建 fail O(Σ|pi|)，扫描 O(|text| + 匹配数)。

**与 KMP 的关系：** KMP 是单模式匹配（一个 next 数组），AC 自动机是多模式匹配（Trie + fail 指针）。`,
    pseudocode: `// 1. 建 Trie
procedure Insert(root, pattern):
    u ← root
    for ch in pattern:
        if go[u][ch] = 0: go[u][ch] ← newNode()
        u ← go[u][ch]
    cnt[u]++

// 2. BFS 建 fail 指针
procedure Build(root):
    queue ← all children of root
    while queue not empty:
        u ← dequeue
        for each character c:
            if go[u][c] exists:
                fail[go[u][c]] ← go[fail[u]][c]
                cnt[go[u][c]] += cnt[fail[go[u][c]]]
                enqueue(go[u][c])
            else:
                go[u][c] ← go[fail[u]][c]   // 路径压缩

// 3. 扫描匹配
procedure Search(text):
    u ← root, result ← 0
    for ch in text:
        u ← go[u][ch]
        result += cnt[u]
    return result`,
    code: {
      cpp: `const int MAXN = 100005;
int go[MAXN][26], fail[MAXN], cnt[MAXN], tot;

void insert(const string& s) {
    int u = 0;
    for (char c : s) {
        int ch = c - 'a';
        if (!go[u][ch]) go[u][ch] = ++tot;
        u = go[u][ch];
    }
    cnt[u]++;
}

void build() {
    queue<int> q;
    for (int i = 0; i < 26; i++)
        if (go[0][i]) q.push(go[0][i]);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int i = 0; i < 26; i++) {
            if (go[u][i]) {
                fail[go[u][i]] = go[fail[u]][i];
                cnt[go[u][i]] += cnt[fail[go[u][i]]];
                q.push(go[u][i]);
            } else {
                go[u][i] = go[fail[u]][i];
            }
        }
    }
}

int query(const string& text) {
    int u = 0, res = 0;
    for (char c : text) {
        u = go[u][c - 'a'];
        res += cnt[u];
    }
    return res;
}`,
      python: `class AhoCorasick:
    def __init__(self):
        self.go = [[0]*26]    # go[node][char]
        self.fail = [0]
        self.cnt = [0]
        self.tot = 0

    def insert(self, s):
        u = 0
        for c in s:
            ch = ord(c) - ord('a')
            if self.go[u][ch] == 0:
                self.tot += 1
                self.go[u][ch] = self.tot
                self.go.append([0]*26)
                self.fail.append(0)
                self.cnt.append(0)
            u = self.go[u][ch]
        self.cnt[u] += 1

    def build(self):
        from collections import deque
        q = deque()
        for i in range(26):
            if self.go[0][i]:
                q.append(self.go[0][i])
        while q:
            u = q.popleft()
            for i in range(26):
                if self.go[u][i]:
                    self.fail[self.go[u][i]] = self.go[self.fail[u]][i]
                    self.cnt[self.go[u][i]] += self.cnt[self.fail[self.go[u][i]]]
                    q.append(self.go[u][i])
                else:
                    self.go[u][i] = self.go[self.fail[u]][i]

    def query(self, text):
        u, res = 0, 0
        for c in text:
            u = self.go[u][ord(c) - ord('a')]
            res += self.cnt[u]
        return res`,
    },
    applications: [
      '多模式字符串匹配（敏感词过滤）',
      '搜索引擎关键词高亮',
      '网络入侵检测系统（IDS）的多特征匹配',
      '生物信息学：多序列比对',
    ],
  },

  stringhash: {
    slug: 'stringhash',
    name: '字符串哈希',
    nameEn: 'String Hashing',
    category: 'string',
    difficulty: '中等',
    fn: stringHash,
    viz: 'stringhash',
    timeComplexity: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(n)',
    stable: null,
    description: '多项式滚动哈希预处理 O(n)，O(1) 比较任意子串是否相等。',
    intuition: `**字符串哈希**通过多项式滚动哈希，实现 O(1) 的子串比较。

**哈希函数：** 对字符串 S，选择基数 B 和模数 M：
- H[i] = H[i-1] × B + S[i]（前缀哈希）
- P[i] = P[i-1] × B（B 的幂次）

**子串哈希：** hash(S[l..r]) = H[r+1] - H[l] × P[r-l+1]

**选择参数：**
- B = 131 或 13331（经验值，避免碰撞）
- M = 2^64（unsigned long long 自然溢出）或大素数

**碰撞概率：** 对于 2^64 的模数，两个不同字符串碰撞概率约 1/2^64，在实际使用中几乎为零。但为了安全，可以用双哈希（两组不同的 B、M）。

**应用场景：** 判断两个子串是否相同、回文串判定、字符串周期检测等，凡是需要快速比较子串的地方都能用。`,
    pseudocode: `procedure Build(S):
    n ← length(S)
    H[0] ← 0, P[0] ← 1
    for i from 1 to n:
        H[i] ← H[i-1] × B + S[i-1]
        P[i] ← P[i-1] × B

function GetHash(l, r):          // 0-indexed
    return H[r+1] - H[l] × P[r-l+1]

function Equal(l1, r1, l2, r2):  // 比较两个子串
    return GetHash(l1, r1) = GetHash(l2, r2)`,
    code: {
      cpp: `typedef unsigned long long ull;
const ull B = 131;
vector<ull> H, P;

void build(const string& s) {
    int n = s.size();
    H.assign(n + 1, 0);
    P.assign(n + 1, 1);
    for (int i = 1; i <= n; i++) {
        H[i] = H[i-1] * B + s[i-1];
        P[i] = P[i-1] * B;
    }
}

ull getHash(int l, int r) {   // 0-indexed [l, r]
    return H[r+1] - H[l] * P[r - l + 1];
}

bool equal(int l1, int r1, int l2, int r2) {
    return getHash(l1, r1) == getHash(l2, r2);
}`,
      python: `B = 131
MOD = (1 << 64)  # ULL overflow

def build(s):
    n = len(s)
    H = [0] * (n + 1)
    P = [1] * (n + 1)
    for i in range(1, n + 1):
        H[i] = (H[i-1] * B + ord(s[i-1])) % MOD
        P[i] = (P[i-1] * B) % MOD
    return H, P

def get_hash(H, P, l, r):  # 0-indexed [l, r]
    return (H[r+1] - H[l] * P[r - l + 1]) % MOD

def equal(H, P, l1, r1, l2, r2):
    return get_hash(H, P, l1, r1) == get_hash(H, P, l2, r2)`,
    },
    applications: [
      'O(1) 子串比较（替代逐字符比对）',
      '回文串判定（正序哈希 == 逆序哈希）',
      '字符串周期检测',
      'Rabin-Karp 多模式匹配的核心',
    ],
  },
}

export default STRING_ALGORITHMS
