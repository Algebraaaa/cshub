import { CATEGORIES, ALGORITHM_LIST } from './algorithmMeta.js'

// ─────────────────────────────────────────────────────────────
// 学科分层：subject → category → algorithm
// 不修改 algorithms.js 任何条目，从 category 推导 subject。
//
// 单一数据源（SSOT）：每个 SUBJECTS 条目自带 `categories` 字段列出归属的 category
// keys；CATEGORY_TO_SUBJECT 与各种 helper 都从这个字段派生。新增 category
// 时只需在对应学科的 `categories` 数组里加一行，无需同步维护其它表。
// ─────────────────────────────────────────────────────────────

export const SUBJECTS = {
  algo: {
    id: 'algo',
    name: '算法与数据结构',
    shortName: '算法',
    icon: '🧮',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    description: '排序、图、动规、回溯、字符串与基础数据结构',
    available: true,
    categories: ['sorting', 'graph', 'tree', 'dp', 'backtracking', 'string', 'dataStructures'],
  },
  os: {
    id: 'os',
    name: '操作系统',
    shortName: 'OS',
    icon: '🖥️',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
    description: 'CPU 调度、内存管理、页面置换、磁盘 I/O 与同步',
    available: true,
    categories: ['pageReplacement', 'diskScheduling', 'cpuScheduling', 'synchronization', 'memoryManagement'],
  },
  network: {
    id: 'network',
    name: '计算机网络',
    shortName: '网络',
    icon: '🌐',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    description: 'TCP/IP 协议族、传输层与拥塞控制',
    available: true,
    categories: ['network'],
  },
  co: {
    id: 'co',
    name: '计算机组成',
    shortName: '组成',
    icon: '⚙️',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
    description: 'CPU 流水线、Cache 映射与浮点编码',
    available: true,
    categories: ['co'],
  },
  security: {
    id: 'security',
    name: '信息安全',
    shortName: '安全',
    icon: '🔐',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    description: '密码学算法：加解密、密钥交换与签名',
    available: true,
    categories: ['security'],
  },
  db: {
    id: 'db',
    name: '数据库系统',
    shortName: '数据库',
    icon: '🗃️',
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
    description: 'B+ 树、事务隔离、MVCC、联接与查询计划',
    available: true,
    categories: ['dbIndex', 'dbTxn', 'dbQuery'],
  },
  compiler: {
    id: 'compiler',
    name: '编译原理',
    shortName: '编译',
    icon: '🛠️',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    description: '正则 → NFA/DFA、递归下降与 AST 构建',
    available: true,
    categories: ['compilerLex', 'compilerSyn'],
  },
}

// 从 SUBJECTS[].categories 派生的反向索引——category key → subject id。
// 维护规则：在对应 subject 的 `categories` 数组里加一行即可，本表自动跟新。
export const CATEGORY_TO_SUBJECT = Object.fromEntries(
  Object.values(SUBJECTS).flatMap(s => (s.categories || []).map(c => [c, s.id]))
)

export const SUBJECT_LIST = Object.values(SUBJECTS)

export function getSubject(subjectId) {
  return SUBJECTS[subjectId] || null
}

export function getSubjectByCategory(categoryKey) {
  return CATEGORY_TO_SUBJECT[categoryKey] || 'algo'
}

// 该 subject 下出现过的 category key 列表（保留 algorithms.js 中实际有算法的那些）
export function getCategoriesBySubject(subjectId) {
  const seen = new Set()
  for (const algo of ALGORITHM_LIST) {
    if (getSubjectByCategory(algo.category) === subjectId) {
      seen.add(algo.category)
    }
  }
  const configuredOrder = getSubject(subjectId)?.categories || []
  const ordered = configuredOrder.filter(catKey => seen.has(catKey))
  const remaining = Array.from(seen).filter(catKey => !ordered.includes(catKey))
  return [...ordered, ...remaining].map(catKey => ({ key: catKey, ...CATEGORIES[catKey] }))
}

export function getAlgorithmsBySubject(subjectId) {
  return ALGORITHM_LIST.filter(a => getSubjectByCategory(a.category) === subjectId)
}

export function getSubjectStats(subjectId, completedSet) {
  const algos = getAlgorithmsBySubject(subjectId)
  const total = algos.length
  if (!completedSet || total === 0) return { total, done: 0, pct: 0 }
  const done = algos.filter(a => completedSet.has(a.slug)).length
  return { total, done, pct: Math.round((done / total) * 100) }
}
