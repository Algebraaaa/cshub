import { getAlgorithmMeta } from './algorithmMeta.js'

const CATEGORY_GROUP = {
  sorting: 'sorting',
  graph: 'graph',
  tree: 'tree',
  dp: 'dp',
  backtracking: 'backtracking',
  string: 'string',
  dataStructures: 'dataStructures',
  math: 'math',
  pageReplacement: 'os',
  diskScheduling: 'os',
  cpuScheduling: 'os',
  synchronization: 'os',
  memoryManagement: 'os',
  network: 'network',
  security: 'security',
  co: 'co',
  dbIndex: 'db',
  dbTxn: 'db',
  dbQuery: 'db',
  compilerLex: 'compiler',
  compilerSyn: 'compiler',
  compilerCode: 'compiler',
  itFundamental: 'it',
  itChannel: 'it',
  itMarkov: 'it',
  itCoding: 'it',
}

const GROUP_LOADERS = {
  backtracking: () => import('./algorithms/backtracking.js'),
  co: () => import('./algorithms/co.js'),
  compiler: () => import('./algorithms/compiler.js'),
  dataStructures: () => import('./algorithms/dataStructures.js'),
  db: () => import('./algorithms/db.js'),
  dp: () => import('./algorithms/dp.js'),
  graph: () => import('./algorithms/graph.js'),
  it: () => import('./algorithms/it.js'),
  math: () => import('./algorithms/math.js'),
  network: () => import('./algorithms/network.js'),
  os: () => import('./algorithms/os.js'),
  security: () => import('./algorithms/security.js'),
  sorting: () => import('./algorithms/sorting.js'),
  string: () => import('./algorithms/string.js'),
  tree: () => import('./algorithms/tree.js'),
}

const groupCache = new Map()
const detailCache = new Map()
let extraCache = null

function getModuleAlgorithms(module) {
  return module.default ?? Object.values(module).find(value => value && typeof value === 'object' && !Array.isArray(value))
}

function loadGroup(group) {
  const loader = GROUP_LOADERS[group]
  if (!loader) return Promise.resolve(null)
  if (!groupCache.has(group)) {
    groupCache.set(group, loader().catch(err => {
      groupCache.delete(group)
      throw err
    }))
  }
  return groupCache.get(group)
}

async function loadExtraAlgorithm(slug) {
  extraCache ??= import('./extraAlgorithms.js')
  const module = await extraCache
  return module.EXTRA_ALGORITHMS?.[slug] ?? null
}

export async function loadAlgorithmDetail(slug) {
  if (detailCache.has(slug)) return detailCache.get(slug)
  const promise = resolveAlgorithmDetail(slug).catch(err => {
    detailCache.delete(slug)
    throw err
  })
  detailCache.set(slug, promise)
  return promise
}

async function resolveAlgorithmDetail(slug) {
  const meta = getAlgorithmMeta(slug)
  if (!meta) return null

  const group = CATEGORY_GROUP[meta.category]
  if (group) {
    const module = await loadGroup(group)
    const algorithms = getModuleAlgorithms(module)
    const detail = algorithms?.[slug]
    if (detail) return detail
  }

  return loadExtraAlgorithm(slug)
}

export function preloadAlgorithmDetail(slug) {
  return loadAlgorithmDetail(slug).catch(() => null)
}

export async function loadAlgorithmDetails(slugs) {
  return Promise.all(slugs.map(slug => loadAlgorithmDetail(slug)))
}
