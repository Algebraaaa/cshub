// ─────────────────────────────────────────────────────────────
// playgroundRegistry · viz key → Playground lazy loader
//
// 设计：
// - Playground 组件文件通过 Vite 的 import.meta.glob 自动发现（无需手工 import 路径）。
// - VIZ_TO_NAME 是唯一手工维护的小表：viz key → "<Foo>Playground" 文件名（去 .jsx）。
// - 多 viz 共享同一 Playground（如 bst/rb/avl/treap → TreePlayground）通过指向同名 loader 实现。
//
// 新增一个 Playground 文件时：
//   1. 在 src/components/playgrounds/ 下新建 <Foo>Playground.jsx（glob 自动发现，无需改本文件）
//   2. 在下方 VIZ_TO_NAME 加一行 viz key → 'Foo'（仅当算法元数据已用新 viz key 时）
//
// Node 测试环境（playgroundRegistry.test.js 直接 node --test）：
// - import.meta.glob 不存在，使用 stub 缓存。每个 name 返回同一占位函数，保证
//   引用相等（bst/rb/avl/treap 共享 loader）以及 typeof === 'function'。
// ─────────────────────────────────────────────────────────────

// Vite transforms `import.meta.glob('...')` at build time into an object literal.
// In Node test runs (no Vite transform), the runtime expression throws because
// `import.meta.glob` is undefined — the try/catch keeps the registry importable
// in both environments and lets the test fall back to stub loaders.
let modules
try {
  modules = import.meta.glob('../playgrounds/*Playground.jsx')
} catch {
  modules = null
}

const byName = modules
  ? Object.fromEntries(
      Object.entries(modules).map(([p, loader]) => {
        const name = p.split('/').pop().replace('.jsx', '')
        return [name, loader]
      })
    )
  : null

// Node test fallback: cache stub loaders per name so identity comparisons hold.
const stubCache = new Map()
function lookup(name) {
  if (byName) return byName[name] || null
  if (!stubCache.has(name)) {
    stubCache.set(name, () => Promise.resolve({ default: () => null }))
  }
  return stubCache.get(name)
}

// viz key → Playground 文件名（不带 .jsx）
// 注意：多个 viz key 指向同一个 name 即表示共享同一个 Playground 实现
export const VIZ_TO_NAME = {
  // 排序
  sorting: 'Sorting',
  counting: 'CountingSort',
  radix: 'RadixSort',
  bucket: 'BucketSort',
  // 堆
  heap: 'Heap',
  // 图
  graph: 'Graph',
  floyd: 'Floyd',
  topo: 'Topo',
  astar: 'AStar',
  tarjancp: 'TarjanCutpoint',
  lca: 'LCA',
  dinic: 'Dinic',
  mcmf: 'Mcmf',
  eulerpath: 'EulerPath',
  // 树（共享 TreePlayground）
  bst: 'Tree',
  rb: 'Tree',
  avl: 'Tree',
  treap: 'Tree',
  // DP
  knapsack: 'Knapsack',
  lcs: 'LCS',
  lis: 'LIS',
  editdistance: 'EditDistance',
  coinchange: 'CoinChange',
  // OS
  pageReplacement: 'PageReplacement',
  disk: 'Disk',
  elevator: 'Elevator',
  cpuschedule: 'CPUSchedule',
  bankers: 'Bankers',
  philosophers: 'Philosophers',
  // 字符串
  string: 'String',
  aho: 'Aho',
  stringhash: 'StringHash',
  // 数学
  fastpow: 'FastPow',
  sieve: 'Sieve',
  matrixpow: 'MatrixPow',
  // 回溯
  backtracking: 'NQueens',
  // 数据结构
  unionfind: 'UnionFind',
  trie: 'Trie',
  linkedlist: 'LinkedList',
  hashtable: 'HashTable',
  segtree: 'SegTree',
  fenwick: 'Fenwick',
  binarysearch: 'BinarySearch',
  lazyseg: 'LazySeg',
  diffarray: 'DiffArray',
  slidingwindow: 'SlidingWindow',
  advancedstructure: 'AdvancedStructure',
  // 网络
  tcphandshake: 'TCPHandshake',
  tcpcongestion: 'TCPCongestion',
  protocol: 'ProtocolTimeline',
  // 计算机组成
  ieee754: 'IEEE754',
  cachemap: 'CacheMap',
  pipeline: 'Pipeline',
  memory: 'Memory',
  // 安全
  crypto: 'Crypto',
  // 数据库
  bplustree: 'BPlusTree',
  txnIsolation: 'Transaction',
  hashJoin: 'HashJoin',
  mvcc: 'Mvcc',
  queryPlan: 'QueryPlan',
  // 编译原理
  regexNfa: 'RegexNfa',
  nfaToDfa: 'NfaToDfa',
  buildAst: 'Ast',
  ll1: 'LL1',
  lr0: 'LR0',
  codeGen: 'CodeGen',
  // 信息论
  itSelfInfo: 'ItSelfInfo',
  itEntropy: 'ItEntropy',
  itJointEntropy: 'ItJointEntropy',
  itMutualInfo: 'ItMutualInfo',
  itKLDivergence: 'ItKLDivergence',
  itEntropyRate: 'ItEntropyRate',
  itChannel: 'ItChannel',
  itChannelCapacity: 'ItChannelCapacity',
  itMarkovSource: 'ItMarkovSource',
  itMarkovChannel: 'ItMarkovChannel',
  itHuffman: 'ItHuffman',
  itShannonFano: 'ItShannonFano',
  itErrorCorrect: 'ItErrorCorrect',
  itDataCompression: 'ItDataCompression',
}

export const PLAYGROUND_LOADERS = Object.fromEntries(
  Object.entries(VIZ_TO_NAME).map(([viz, name]) => [viz, lookup(`${name}Playground`)])
)

export function getPlaygroundLoader(viz) {
  return PLAYGROUND_LOADERS[viz] || null
}

const preloadCache = new Map()

export function preloadPlayground(viz) {
  const loader = getPlaygroundLoader(viz)
  if (!loader) return Promise.resolve(null)
  if (!preloadCache.has(viz)) {
    preloadCache.set(viz, loader().catch(err => {
      preloadCache.delete(viz)
      throw err
    }))
  }
  return preloadCache.get(viz)
}
