// ─────────────────────────────────────────────────────────────
// 统一高亮协议（2026-06）
//
// 算法库与 AI 课 playground 的 step 用同一组字段声明「当前步骤对应的
// 代码高亮行」，消费方一律通过 getStepCodeLine(step, lang) 解析：
//
//   cppLine / pythonLine / javaLine   各语言显式行号（最优先，语义精确）
//   codeLines: { cpp, python, java }  等价的对象写法
//   codeLine / line / pseudoLine      不区分语言的兜底（仅算法库旧步骤）
//
// 消费方：
//   - 算法库：components/learning/codeLineInference.js（getDirectLine）
//   - AI 课：features/music/components/LessonViewer.jsx（snapshot.current 直通，
//     explicitOnly —— AI 步骤里的 `line` 字段可能另有含义，不做泛化兜底）
// ─────────────────────────────────────────────────────────────

/**
 * 解析步骤声明的代码高亮行。
 * @param {object} step  算法/playground 的单个 step
 * @param {string} lang  'cpp' | 'python' | 'java' | 'pseudo'
 * @param {object} opts  explicitOnly: 只认按语言显式声明的行号，
 *                       忽略 codeLine/line/pseudoLine 泛化字段
 * @returns {number|null}
 */
export function getStepCodeLine(step, lang, { explicitOnly = false } = {}) {
  if (!step || typeof step !== 'object') return null
  const direct = lang === 'cpp' ? step.cppLine
    : lang === 'python' ? step.pythonLine
    : lang === 'java' ? step.javaLine
    : undefined
  if (Number.isInteger(direct)) return direct
  const fromMap = step.codeLines?.[lang]
  if (Number.isInteger(fromMap)) return fromMap
  if (explicitOnly) return null
  if (Number.isInteger(step.codeLine)) return step.codeLine
  if (Number.isInteger(step.line)) return step.line
  if (Number.isInteger(step.pseudoLine)) return step.pseudoLine
  return null
}

export const PRIORITY_STEP_KEYS = [
  'phase', 'level', 'found', 'answer', 'result',
  'i', 'j', 'k',
  'l', 'r', 'left', 'right', 'low', 'high', 'mid',
  'minIdx', 'maxIdx', 'key', 'pivot', 'pivotIndex',
  'leftRange', 'rightRange', 'iPos', 'jPos', 'kPos',
  'target', 'current', 'node', 'neighbor',
  'queue', 'stack', 'visited', 'dist', 'dp',
]

export const HIDDEN_STEP_KEYS = new Set([
  'array',
  'arrays',
  'description',
  'cppLine',
  'pythonLine',
  'pseudoLine',
  'codeLine',
  'line',
  'highlight',
  'highlights',
  'graph',
  'edges',
  'nodes',
  'matrix',
])

export const MAX_VARIABLES = 8

export function createStep(description, fields = {}) {
  if (description && typeof description === 'object') {
    return { ...description }
  }
  return { description, ...fields }
}

export function normalizeStepVariables(step) {
  return Object.fromEntries(extractVariableMap(step))
}

export function extractStepVariables(step) {
  return [...extractVariableMap(step).values()]
}

export function extractVariableMap(step) {
  const variables = new Map()
  if (!step || typeof step !== 'object') return variables

  for (const key of PRIORITY_STEP_KEYS) {
    if (Object.prototype.hasOwnProperty.call(step, key)) {
      addVariable(variables, key, step[key])
    }
  }

  for (const [key, value] of Object.entries(step)) {
    if (variables.has(key) || HIDDEN_STEP_KEYS.has(key)) continue
    if (!isDisplayableValue(value)) continue
    addVariable(variables, key, value)
  }

  addDerivedVariables(variables, step)
  return variables
}

export function computeVariableSchema(steps, maxVariables = MAX_VARIABLES) {
  if (!Array.isArray(steps) || steps.length === 0) return []

  const everSeen = new Set()
  const firstSeenOrder = []
  for (const step of steps) {
    const map = extractVariableMap(step)
    for (const key of map.keys()) {
      if (!everSeen.has(key)) {
        everSeen.add(key)
        firstSeenOrder.push(key)
      }
    }
  }

  const prioritySet = new Set(PRIORITY_STEP_KEYS)
  const priorityHits = PRIORITY_STEP_KEYS.filter(key => everSeen.has(key))
  const rest = firstSeenOrder.filter(key => !prioritySet.has(key))
  return [...priorityHits, ...rest].slice(0, maxVariables)
}

function addDerivedVariables(variables, step) {
  if (!variables.has('j') && Array.isArray(step.comparing) && step.comparing.length > 0) {
    addVariable(variables, step.comparing.length === 1 ? 'index' : 'leftIndex', step.comparing[0])
    if (step.comparing.length > 1) addVariable(variables, 'rightIndex', step.comparing[1])
  }

  if (Array.isArray(step.swapped) && step.swapped.length > 0) {
    addVariable(variables, 'swap', step.swapped)
  }

  if (Array.isArray(step.queue) && step.queue.length > 0) {
    addVariable(variables, 'queueSize', step.queue.length)
  }

  if (Array.isArray(step.stack) && step.stack.length > 0) {
    addVariable(variables, 'stackSize', step.stack.length)
  }
}

function addVariable(variables, key, value) {
  const formatted = formatStepValue(value)
  if (!formatted) return
  variables.set(key, { key, value: formatted })
}

function isDisplayableValue(value) {
  if (value === null || value === undefined) return false
  if (['number', 'string', 'boolean'].includes(typeof value)) return true
  if (Array.isArray(value) || value instanceof Set) return true
  return typeof value === 'object' && Object.keys(value).length <= 12
}

export function formatStepValue(value, depth = 0) {
  if (value === null || value === undefined) return null

  const valueType = typeof value
  if (valueType === 'number' || valueType === 'boolean') return String(value)
  if (valueType === 'string') return value

  if (value instanceof Set) {
    return formatLinearCollection([...value], depth, 'Set')
  }

  if (Array.isArray(value)) {
    if (isMatrix(value)) return formatMatrix(value, depth)
    return formatLinearCollection(value, depth)
  }

  if (valueType === 'object') {
    if (depth > 0) return '{...}'
    const allEntries = Object.entries(value).filter(([, item]) => item !== null && item !== undefined)
    if (allEntries.length === 0) return null
    if (allEntries.length > 6) return `{ ${allEntries.length} keys }`
    const entries = allEntries
      .slice(0, 4)
      .map(([itemKey, itemValue]) => `${itemKey}: ${formatStepValue(itemValue, depth + 1) ?? '-'}`)
    return `{ ${entries.join(', ')}${allEntries.length > 4 ? ', ...' : ''} }`
  }

  return null
}

function formatLinearCollection(value, depth = 0, label = null) {
  if (depth > 0) return label ? `${label}(${value.length})` : `[${value.length} items]`
  if (value.length === 0) return label ? `${label}([])` : '[]'

  const firstFew = value.slice(0, 5)
  const objectCount = firstFew.filter(item => item && typeof item === 'object').length
  if (objectCount >= 3) return label ? `${label}(${value.length} items)` : `[ ${value.length} items ]`

  const maxItems = 8
  const items = value
    .slice(0, maxItems)
    .map(item => formatStepValue(item, depth + 1) ?? '-')
  const suffix = value.length > maxItems ? `, ... (${value.length})` : ''
  const body = `[${items.join(', ')}${suffix}]`
  return label ? `${label}(${body})` : body
}

function isMatrix(value) {
  return value.length > 0 && value.every(row => Array.isArray(row))
}

function formatMatrix(value, depth) {
  const rows = value.length
  const cols = Math.max(0, ...value.map(row => row.length))
  if (depth > 0) return `${rows}x${cols} matrix`
  if (rows <= 3 && cols <= 5) {
    return value
      .map(row => `[${row.map(item => formatStepValue(item, depth + 1) ?? '-').join(', ')}]`)
      .join(' ')
  }
  return `${rows}x${cols} matrix`
}
