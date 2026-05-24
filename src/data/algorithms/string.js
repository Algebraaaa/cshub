// 自动从 algorithms.js 拆分（3 个算法 · string 学科）
import { kmp } from '../../algorithms/string/kmp'
import { naivePatternMatching } from '../../algorithms/string/naive'
import { rabinKarp } from '../../algorithms/string/rabinKarp'

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

}

export default STRING_ALGORITHMS
