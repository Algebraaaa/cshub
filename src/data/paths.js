// ─────────────────────────────────────────────────────────────
// 学习路径：把零散算法组织为有序学习序列。
// 每条 path = { id, name, desc, color, gradient, level, slugs[] }
// slug 必须在 algorithms.js 中真实存在；UI 会跳过不存在的。
// ─────────────────────────────────────────────────────────────

export const PATHS = {
  'ds-final-sprint': {
    id: 'ds-final-sprint',
    name: '数据结构期末冲刺',
    desc: '从线性结构到图算法的考前一周冲刺序列。',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
    level: '入门 → 进阶',
    estimate: '约 6 小时',
    slugs: [
      'linkedlist', 'hashtable', 'bst', 'redblack',
      'segtree', 'unionfind',
      'bfs', 'dfs', 'dijkstra', 'toposort',
    ],
  },
  'sorting-deep-dive': {
    id: 'sorting-deep-dive',
    name: '排序算法精讲',
    desc: '从比较类到非比较类排序，理解时间/空间/稳定性权衡。',
    color: '#38bdf8',
    gradient: 'linear-gradient(135deg, #38bdf8, #a855f7)',
    level: '入门',
    estimate: '约 3 小时',
    slugs: ['bubblesort', 'selectionsort', 'insertionsort', 'shellsort', 'quicksort', 'mergesort', 'heapsort', 'countingsort', 'radixsort', 'bucketsort'],
  },
  'interview-essentials': {
    id: 'interview-essentials',
    name: '面试高频套路',
    desc: '动归 + 字符串匹配 + 图最短路：把核心算法压成肌肉记忆。',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e, #38bdf8)',
    level: '进阶',
    estimate: '约 5 小时',
    slugs: ['knapsack', 'lcs', 'lis', 'editdistance', 'coinchange', 'kmp', 'dijkstra', 'toposort'],
  },
  'os-systematic': {
    id: 'os-systematic',
    name: '操作系统串讲',
    desc: 'CPU 调度、进程同步到页面置换、磁盘 I/O 的完整路径。',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    level: '系统',
    estimate: '约 4 小时',
    slugs: ['cpufcfs', 'cpusjf', 'cpurr', 'bankers', 'philosophers', 'fifo', 'lru', 'opt', 'diskfcfs', 'sstf', 'scan'],
  },
  'graph-master': {
    id: 'graph-master',
    name: '图算法专修',
    desc: 'BFS/DFS 起步，走到最短路径与最小生成树的完整图算法路径。',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
    level: '进阶',
    estimate: '约 4 小时',
    slugs: ['bfs', 'dfs', 'toposort', 'dijkstra', 'bellmanford', 'floydwarshall', 'prim', 'kruskal', 'astar'],
  },
  'db-essentials': {
    id: 'db-essentials',
    name: '数据库精讲',
    desc: 'B+ 树索引 → 事务隔离 → 连接算法，掌握关系数据库核心原理。',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    level: '进阶',
    estimate: '约 2 小时',
    slugs: ['bplustree', 'txnIsolation', 'hashJoin'],
  },
  'compiler-intro': {
    id: 'compiler-intro',
    name: '编译原理入门',
    desc: '正则 → NFA → DFA → AST，走完编译器前端的完整流程。',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    level: '进阶',
    estimate: '约 2 小时',
    slugs: ['regexNfa', 'nfaToDfa', 'buildAst'],
  },
  'network-tour': {
    id: 'network-tour',
    name: '计算机网络串讲',
    desc: 'TCP 握手 → 拥塞控制 → 滑动窗口，理解可靠传输的底层机制。',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #22c55e)',
    level: '系统',
    estimate: '约 1.5 小时',
    slugs: ['tcphandshake', 'tcpcongestion', 'slidingwindow'],
  },
  'co-fundamentals': {
    id: 'co-fundamentals',
    name: '计算机组成原理',
    desc: 'IEEE 754 浮点 → Cache 映射 → 流水线，从数字表示到指令执行。',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #f59e0b)',
    level: '系统',
    estimate: '约 3 小时',
    slugs: ['ieee754', 'cachemapdirect', 'cachemapset', 'cachemapfully', 'pipelineideal', 'pipelinehazard'],
  },
}

export const PATH_LIST = Object.values(PATHS)

export function getPath(pathId) {
  return PATHS[pathId] || null
}

// 给定一个 algorithm slug，返回它所在的路径列表（用于详情页 prev/next 导航）
export function findPathsContaining(slug) {
  return PATH_LIST.filter(p => p.slugs.includes(slug))
}

// 给定 path + 当前 slug，返回 { index, total, prev, next }
export function getPathNavigation(pathId, currentSlug) {
  const p = PATHS[pathId]
  if (!p) return null
  const idx = p.slugs.indexOf(currentSlug)
  if (idx === -1) return null
  return {
    path: p,
    index: idx,
    total: p.slugs.length,
    prev: idx > 0 ? p.slugs[idx - 1] : null,
    next: idx < p.slugs.length - 1 ? p.slugs[idx + 1] : null,
  }
}

export function getPathProgress(pathId, completedSet) {
  const p = PATHS[pathId]
  if (!p || !completedSet) return { done: 0, total: 0, pct: 0 }
  const total = p.slugs.length
  const done = p.slugs.filter(s => completedSet.has(s)).length
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 }
}
