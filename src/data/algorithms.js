// 顶层 algorithms 聚合器：通过 Vite import.meta.glob 自动收集
// src/data/algorithms/<subject>.js 下所有学科文件的默认导出。
// 新增/修改算法只需改对应学科文件，本聚合器无需修改。
//
// EXTRA_ALGORITHMS 居住在 src/data/extraAlgorithms.js（不在 algorithms/ 子目录），
// 因此仍然显式 import 并参与最终聚合。
import { EXTRA_ALGORITHMS } from './extraAlgorithms'

export const CATEGORIES = {
  sorting: { name: '排序算法', icon: '📊', color: '#8b5cf6', desc: '将数据按某种规则排列' },
  graph:   { name: '图算法',   icon: '🗺️', color: '#3b82f6', desc: '在节点和边构成的图上求解' },
  tree:    { name: '树结构',   icon: '🌳', color: '#10b981', desc: '层级数据的高效组织' },
  dp:      { name: '动态规划', icon: '🧩', color: '#f59e0b', desc: '将问题分解为重叠子问题' },
  backtracking: { name: '回溯算法', icon: '🔙', color: '#dc2626', desc: '通过穷举搜索解决决策问题' },
  pageReplacement: { name: '页面置换', icon: '🗂️', color: '#ec4899', desc: '操作系统的内存分页管理算法' },
  diskScheduling:  { name: '磁盘调度', icon: '💽', color: '#8b5cf6', desc: '操作系统的磁盘寻道管理' },
  string:  { name: '字符串匹配', icon: '📝', color: '#14b8a6', desc: '在文本中查找子串模式' },
  dataStructures: { name: '数据结构', icon: '🗄️', color: '#6366f1', desc: '高效组织和操作数据的基本结构' },
  network:  { name: '计算机网络', icon: '🌐', color: '#06b6d4', desc: '传输层 / 网络层经典协议与算法' },
  security: { name: '网络安全',   icon: '🔐', color: '#ef4444', desc: '密码学算法：加解密、密钥交换、签名' },
  co:       { name: '计算机组成', icon: '⚙️', color: '#0ea5e9', desc: '计算机硬件原理：流水线、Cache、浮点编码' },
  cpuScheduling: { name: 'CPU 调度', icon: '⏱️', color: '#f97316', desc: '操作系统的进程调度算法' },
  synchronization: { name: '进程同步', icon: '🔄', color: '#84cc16', desc: '互斥、死锁与经典同步问题' },
  memoryManagement: { name: '内存管理', icon: '🧠', color: '#0f766e', desc: '操作系统的分区分配、分页和地址转换' },
  dbIndex:        { name: '数据库索引', icon: '🌳', color: '#14b8a6', desc: '磁盘友好的索引结构（B+ 树）' },
  dbTxn:          { name: '事务与并发', icon: '🔁', color: '#0d9488', desc: '隔离级别、MVCC 与并发现象' },
  dbQuery:        { name: '查询执行', icon: '🔍', color: '#06b6d4', desc: '关系代数算子的物理执行（联接、聚合）' },
  compilerLex:    { name: '词法分析', icon: '🔤', color: '#f59e0b', desc: '正则 → NFA/DFA 状态机构造' },
  compilerSyn:    { name: '语法分析', icon: '🌲', color: '#ef4444', desc: '递归下降、LL/LR 等语法分析与 AST 构建' },
}


const __subjectModules = import.meta.glob('./algorithms/*.js', { eager: true })

const __collected = Object.values(__subjectModules)
  .map(m => m.default ?? Object.values(m).find(v => v && typeof v === 'object' && !Array.isArray(v)))
  .filter(Boolean)

export const ALGORITHMS = Object.assign({}, ...__collected, EXTRA_ALGORITHMS)

export const ALGORITHM_LIST = Object.values(ALGORITHMS)


export function getAlgorithmsByCategory(catKey) {
  return ALGORITHM_LIST.filter(a => a.category === catKey)
}
