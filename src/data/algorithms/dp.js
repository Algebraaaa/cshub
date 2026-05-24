// 自动从 algorithms.js 拆分（5 个算法 · dp 学科）
import { coinChange } from '../../algorithms/dp/coinChange'
import { editDistance } from '../../algorithms/dp/editDistance'
import { knapsack01 } from '../../algorithms/dp/knapsack'
import { lcs } from '../../algorithms/dp/lcs'
import { lis } from '../../algorithms/dp/lis'

export const DP_ALGORITHMS = {
  knapsack: {
    slug: 'knapsack',
    name: '0-1 背包问题',
    nameEn: '0/1 Knapsack',
    category: 'dp',
    difficulty: '中等',
    fn: knapsack01,
    viz: 'knapsack',
    timeComplexity: { best: 'O(nW)', average: 'O(nW)', worst: 'O(nW)' },
    spaceComplexity: 'O(nW)',
    description: '每件物品要么取要么不取，求容量限制下的最大价值。',
    intuition: `给定 n 件物品（每件有重量 w 和价值 v）和背包容量 W，每件物品最多取一次，求最大价值。

定义 dp[i][w] 为"前 i 件物品在容量 w 下的最大价值"。对第 i 件物品：
- **不取**：dp[i][w] = dp[i-1][w]
- **取**（前提是 w ≥ wᵢ）：dp[i][w] = dp[i-1][w-wᵢ] + vᵢ

转移方程：dp[i][w] = max(dp[i-1][w], dp[i-1][w-wᵢ] + vᵢ)

逐行填表，最终答案是 dp[n][W]。

可以用滚动数组优化空间到 O(W)，关键是 w 要**逆序**遍历（保证用的是上一行的值）。`,
    pseudocode: `procedure knapsack01(items, W):
    n ← length(items)
    dp ← (n+1) × (W+1) array of 0
    for i from 1 to n:
        for w from 0 to W:
            dp[i][w] ← dp[i-1][w]                       // 不取
            if items[i-1].weight ≤ w:
                take ← dp[i-1][w - items[i-1].weight] + items[i-1].value
                dp[i][w] ← max(dp[i][w], take)
    return dp[n][W]`,
    code: {
      cpp: `int knapsack01(vector<int>& weights, vector<int>& values, int W) {
    int n = weights.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            dp[i][w] = dp[i - 1][w];
            if (weights[i - 1] <= w) {
                dp[i][w] = max(dp[i][w],
                    dp[i - 1][w - weights[i - 1]] + values[i - 1]);
            }
        }
    }
    return dp[n][W];
}

// 滚动数组优化版（O(W) 空间）
int knapsack01Optimized(vector<int>& weights, vector<int>& values, int W) {
    vector<int> dp(W + 1, 0);
    int n = weights.size();
    for (int i = 0; i < n; i++) {
        // w 必须逆序，保证用的是上一行的值
        for (int w = W; w >= weights[i]; w--) {
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }
    return dp[W];
}`,
      python: `def knapsack_01(weights, values, W):
    n = len(weights)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(W + 1):
            dp[i][w] = dp[i - 1][w]
            if weights[i - 1] <= w:
                dp[i][w] = max(
                    dp[i][w],
                    dp[i - 1][w - weights[i - 1]] + values[i - 1]
                )
    return dp[n][W]

# 滚动数组优化版（O(W) 空间）
def knapsack_01_optimized(weights, values, W):
    dp = [0] * (W + 1)
    for weight, value in zip(weights, values):
        # w 必须逆序，保证用的是上一行的值
        for w in range(W, weight - 1, -1):
            dp[w] = max(dp[w], dp[w - weight] + value)
    return dp[W]`,
    },
    applications: [
      '资源分配：预算固定下选择项目组合',
      '装载问题：货车装箱、内存分页',
      '密码学的子集和问题',
      'DP 入门必经之路，是无数变种的基石',
    ],
  },

  lcs: {
    slug: 'lcs',
    name: '最长公共子序列 LCS',
    nameEn: 'Longest Common Subsequence',
    category: 'dp',
    difficulty: '中等',
    fn: lcs,
    viz: 'lcs',
    timeComplexity: { best: 'O(mn)', average: 'O(mn)', worst: 'O(mn)' },
    spaceComplexity: 'O(mn)',
    description: '在两个序列中寻找最长的公共子序列（不要求连续）。',
    intuition: `子序列与子串不同——子序列允许跳过字符但保持相对顺序。例如 "ACBDAB" 和 "BDCABA" 的 LCS 是 "BCBA" 或 "BDAB"，长度 4。

定义 dp[i][j] 为 "s1 的前 i 个字符与 s2 的前 j 个字符的 LCS 长度"。

- 若 s1[i-1] == s2[j-1]：dp[i][j] = dp[i-1][j-1] + 1（这个字符可以同时匹配）
- 否则：dp[i][j] = max(dp[i-1][j], dp[i][j-1])（跳过 s1 或 s2 的当前字符）

填表后 dp[m][n] 即为 LCS 长度。要还原 LCS 字符串，从 dp[m][n] 回溯：相同字符则记录并左上走；否则走值更大的方向。`,
    pseudocode: `procedure LCS(s1, s2):
    m ← length(s1), n ← length(s2)
    dp ← (m+1) × (n+1) array of 0
    for i from 1 to m:
        for j from 1 to n:
            if s1[i-1] = s2[j-1]:
                dp[i][j] ← dp[i-1][j-1] + 1
            else:
                dp[i][j] ← max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]`,
    code: {
      cpp: `pair<int, string> lcs(const string& s1, const string& s2) {
    int m = s1.size(), n = s2.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i - 1] == s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    // 回溯构造 LCS 字符串
    int i = m, j = n;
    string result;
    while (i > 0 && j > 0) {
        if (s1[i - 1] == s2[j - 1]) {
            result = s1[i - 1] + result;
            i--; j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }
    return {dp[m][n], result};
}`,
      python: `def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    # 回溯构造 LCS 字符串
    i, j = m, n
    chars = []
    while i > 0 and j > 0:
        if s1[i - 1] == s2[j - 1]:
            chars.append(s1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return dp[m][n], ''.join(reversed(chars))`,
    },
    applications: [
      'diff 工具（git diff、文件比较）',
      '生物信息学：DNA / 蛋白质序列比对',
      '版本控制中的合并算法',
      '语音识别、抄袭检测',
    ],
  },

  lis: {
    slug: 'lis',
    name: '最长递增子序列 LIS',
    nameEn: 'Longest Increasing Subsequence',
    category: 'dp',
    difficulty: '中等',
    fn: lis,
    viz: 'lis',
    timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(n)',
    description: '找序列中最长的严格递增子序列（可不连续）。',
    intuition: `LIS 是经典的 DP 问题：在数组中找一个最长的严格递增子序列（子序列不要求连续，但要保持相对顺序）。

定义 dp[i] = "以 arr[i] 结尾的最长递增子序列长度"，初始全为 1（每个元素自身就是长度 1 的 LIS）。

转移：对每个 i，向左扫描所有 j < i，若 arr[j] < arr[i]，则 arr[j] 可以接在 arr[i] 前面：dp[i] = max(dp[i], dp[j] + 1)。

最终答案 = max(dp[0..n-1])，回溯 prev 数组可还原具体的 LIS 序列。

O(n²) 的 DP 已足够理解，实际上 LIS 有基于二分搜索的 O(n log n) 解法（patience sorting），思想更精妙但稍难理解。`,
    pseudocode: `procedure LIS(A):
    n ← length(A)
    dp ← array of 1 with size n
    prev ← array of -1 with size n
    for i from 1 to n-1:
        for j from 0 to i-1:
            if A[j] < A[i] and dp[j]+1 > dp[i]:
                dp[i] ← dp[j] + 1
                prev[i] ← j
    best ← argmax(dp)
    // trace back from best using prev[]
    return dp[best]`,
    code: {
      cpp: `int lis(vector<int>& arr) {
    int n = arr.size();
    vector<int> dp(n, 1), prev(n, -1);
    int best = 0;
    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (arr[j] < arr[i] && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;
                prev[i] = j;
            }
        }
        if (dp[i] > dp[best]) best = i;
    }
    // Trace back
    vector<int> result;
    for (int cur = best; cur != -1; cur = prev[cur])
        result.push_back(arr[cur]);
    reverse(result.begin(), result.end());
    return dp[best];  // or return result for the sequence
}`,
      python: `def lis(arr):
    n = len(arr)
    dp = [1] * n
    prev = [-1] * n
    best = 0
    for i in range(1, n):
        for j in range(i):
            if arr[j] < arr[i] and dp[j] + 1 > dp[i]:
                dp[i] = dp[j] + 1
                prev[i] = j
        if dp[i] > dp[best]:
            best = i
    # Trace back
    result = []
    cur = best
    while cur != -1:
        result.append(arr[cur])
        cur = prev[cur]
    return dp[best], list(reversed(result))`,
    },
    applications: [
      'diff 工具中的最长公共子序列核心组件',
      '股票最多买卖次数问题的变种',
      '俄罗斯套娃信封问题（二维 LIS）',
      '理解 patience sorting 和 O(n log n) 解法的前置',
    ],
  },

  editdistance: {
    slug: 'editdistance',
    name: '编辑距离',
    nameEn: 'Edit Distance (Levenshtein)',
    category: 'dp',
    difficulty: '中等',
    fn: editDistance,
    viz: 'editdistance',
    timeComplexity: { best: 'O(mn)', average: 'O(mn)', worst: 'O(mn)' },
    spaceComplexity: 'O(mn)',
    description: '将字符串s1转换为s2所需的最少插入、删除、替换操作数。',
    intuition: `编辑距离（Levenshtein Distance）是衡量两个字符串"相似度"的经典指标。\n\n定义 dp[i][j] = 将 s1 前 i 个字符变成 s2 前 j 个字符所需的最少操作数。\n\n转移方程：\n- 若 s1[i-1] == s2[j-1]：**dp[i][j] = dp[i-1][j-1]**（无需操作）\n- 否则：**dp[i][j] = 1 + min(dp[i][j-1], dp[i-1][j], dp[i-1][j-1])**\n  - dp[i][j-1]+1：插入\n  - dp[i-1][j]+1：删除\n  - dp[i-1][j-1]+1：替换\n\n答案为 dp[m][n]。`,
    pseudocode: `procedure editDistance(s1, s2):\n    m, n ← |s1|, |s2|\n    dp[0..m][0..n]\n    // 初始化\n    dp[i][0] ← i, dp[0][j] ← j\n    // 填表\n    for i from 1 to m:\n        for j from 1 to n:\n            if s1[i-1] = s2[j-1]:\n                dp[i][j] ← dp[i-1][j-1]\n            else:\n                dp[i][j] ← 1 + min(dp[i][j-1], dp[i-1][j], dp[i-1][j-1])\n    return dp[m][n]`,
    code: {
      cpp: `int editDistance(string s1, string s2) {\n    int m=s1.size(), n=s2.size();\n    vector<vector<int>> dp(m+1, vector<int>(n+1));\n    for(int i=0;i<=m;i++) dp[i][0]=i;\n    for(int j=0;j<=n;j++) dp[0][j]=j;\n    for(int i=1;i<=m;i++)\n        for(int j=1;j<=n;j++)\n            dp[i][j] = s1[i-1]==s2[j-1]\n                ? dp[i-1][j-1]\n                : 1+min({dp[i][j-1],dp[i-1][j],dp[i-1][j-1]});\n    return dp[m][n];\n}`,
      python: `def edit_distance(s1, s2):\n    m, n = len(s1), len(s2)\n    dp = [[0]*(n+1) for _ in range(m+1)]\n    for i in range(m+1): dp[i][0] = i\n    for j in range(n+1): dp[0][j] = j\n    for i in range(1, m+1):\n        for j in range(1, n+1):\n            if s1[i-1] == s2[j-1]:\n                dp[i][j] = dp[i-1][j-1]\n            else:\n                dp[i][j] = 1 + min(dp[i][j-1], dp[i-1][j], dp[i-1][j-1])\n    return dp[m][n]`,
    },
    applications: [
      'git diff / 文本差异比较',
      '拼写检查与纠错（搜索引擎"您是否想搜索"）',
      '生物信息学：DNA/蛋白质序列比对',
      '机器翻译质量评估（BLEU 相关指标）',
    ],
  },

  coinchange: {
    slug: 'coinchange',
    name: '硬币找零',
    nameEn: 'Coin Change',
    category: 'dp',
    difficulty: '中等',
    fn: coinChange,
    viz: 'coinchange',
    timeComplexity: { best: 'O(n·W)', average: 'O(n·W)', worst: 'O(n·W)' },
    spaceComplexity: 'O(W)',
    description: '给定硬币面值集合，凑出目标金额所需的最少硬币数。',
    intuition: `硬币找零是完全背包的经典变体（每种硬币可用无限次）。\n\n定义 dp[i] = 凑出金额 i 所需的最少硬币数，初始化 dp[0]=0，其余为 ∞。\n\n对每种硬币面值 c，遍历 c..amount：\n**dp[i] = min(dp[i], dp[i-c] + 1)**\n\n与 0-1 背包的关键区别：内层循环**正序**（允许重复使用同一硬币）。`,
    pseudocode: `procedure coinChange(coins, amount):\n    dp[0..amount] ← ∞, dp[0] ← 0\n    for coin in coins:\n        for i from coin to amount:\n            if dp[i-coin] + 1 < dp[i]:\n                dp[i] ← dp[i-coin] + 1\n    return dp[amount] == ∞ ? -1 : dp[amount]`,
    code: {
      cpp: `int coinChange(vector<int>& coins, int amount) {\n    vector<int> dp(amount+1, amount+1);\n    dp[0] = 0;\n    for (int c : coins)\n        for (int i = c; i <= amount; i++)\n            dp[i] = min(dp[i], dp[i-c] + 1);\n    return dp[amount] > amount ? -1 : dp[amount];\n}`,
      python: `def coin_change(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for c in coins:\n        for i in range(c, amount + 1):\n            dp[i] = min(dp[i], dp[i-c] + 1)\n    return -1 if dp[amount] == float('inf') else dp[amount]`,
    },
    applications: [
      'LeetCode 322（力扣经典题）',
      '自动售货机找零系统',
      '完全背包问题的特例',
      '理解贪心失效场景（贪心只对特殊面值有效）',
    ],
  },

}

export default DP_ALGORITHMS
