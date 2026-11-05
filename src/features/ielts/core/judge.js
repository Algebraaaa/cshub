// ─────────────────────────────────────────────────────────────
// judge · 确定性判题（不依赖模型、不依赖 IO）
//
// question = { type, key, instruction }
//   type: gap | tfng | ynng | mcq | mcq-multi | matching
//   key : string | string[]
//     - "/" 分隔可接受写法：colour/color
//     - 圆括号表示可省略部分：(the) museum
//
// 返回 { correct: boolean, errors: string[] }，errors 取 ERROR_CODES。
// 判定口径见 docs/ielts/RULES.md（缩写 T/F/NG 不接受等）。
// ─────────────────────────────────────────────────────────────

import { ERROR_CODES } from './errorCodes.js'
import { validateAnswerFormat } from './format.js'

const TFNG_LABELS = new Set(['TRUE', 'FALSE', 'NOT GIVEN'])
const YNNG_LABELS = new Set(['YES', 'NO', 'NOT GIVEN'])
const POSITIVE_TF = new Set(['TRUE', 'FALSE'])
const POSITIVE_YN = new Set(['YES', 'NO'])

/**
 * 比较用归一化：小写、去首尾标点、撇号删除（IELTS 接受带不带撇号的写法）、
 * 连续空白合并。连字符保留（连字符词算一个词）。
 * @param {string} s
 * @returns {string}
 */
export function normalizeText(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[.,!?;:"()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 展开圆括号可选片段："(the) museum" → ["the museum", "museum"]。
 * 多组括号做笛卡尔积。
 * @param {string} form
 * @returns {string[]}
 */
function expandParentheses(form) {
  const groups = [...form.matchAll(/\(([^)]*)\)/g)]
  if (groups.length === 0) return [form.trim()]
  /** @type {string[][]} */
  const combinations = [[]]
  for (const g of groups) {
    const inner = g[1].trim()
    const n = combinations.length
    for (let i = 0; i < n; i += 1) {
      const base = combinations[i]
      combinations.push([...base, inner])
      combinations[i] = [...base, '']
    }
  }
  return combinations.map((parts) => {
    let idx = 0
    const replaced = form.replace(/\(([^)]*)\)/g, () => parts[idx++] ?? '')
    return replaced.replace(/\s+/g, ' ').trim()
  })
}

/**
 * 把 key 展开为全部可接受写法（已归一化、去重）。
 * @param {string | string[]} key
 * @returns {string[]}
 */
export function expandKey(key) {
  const rawKeys = Array.isArray(key) ? key : [String(key == null ? '' : key)]
  /** @type {Set<string>} */
  const out = new Set()
  for (const rawKey of rawKeys) {
    for (const slashForm of String(rawKey).split('/')) {
      for (const expanded of expandParentheses(slashForm)) {
        const norm = normalizeText(expanded)
        if (norm) out.add(norm)
      }
    }
  }
  return [...out]
}

/**
 * 标准 Levenshtein 编辑距离。
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function levenshtein(a, b) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i += 1) {
    const cur = [i]
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
    }
    prev = cur
  }
  return prev[b.length]
}

/**
 * 生成单复数变体：去掉/加上 s、es，以及 y ↔ ies 互换。
 * 作用在答案最后一个词上（多词答案的复数差异也总在末词）。
 * @param {string} norm
 * @returns {string[]}
 */
function pluralVariants(norm) {
  const variants = new Set()
  const parts = norm.split(' ')
  const last = parts[parts.length - 1]
  if (!last) return []
  /** @param {string} w */
  const rebuild = (w) => [...parts.slice(0, -1), w].join(' ')
  if (last.endsWith('ies') && last.length > 3) variants.add(rebuild(last.slice(0, -3) + 'y'))
  if (last.endsWith('ses') || last.endsWith('xes') || last.endsWith('ches') || last.endsWith('shes')) {
    variants.add(rebuild(last.slice(0, -2))) // boxes → box
  } else if (last.endsWith('es') && last.length > 2) {
    variants.add(rebuild(last.slice(0, -2)))
  }
  if (last.endsWith('s') && !last.endsWith('ss') && last.length > 1) {
    variants.add(rebuild(last.slice(0, -1))) // cars → car
  }
  if (last.endsWith('y') && last.length > 1) variants.add(rebuild(last.slice(0, -1) + 'ies'))
  if (!last.endsWith('s')) variants.add(rebuild(last + 's'))
  if (last.endsWith('y') === false && /(s|x|z|ch|sh)$/.test(last)) variants.add(rebuild(last + 'es'))
  return [...variants]
}

/**
 * 从自由文本里抽出选择项字母（A–Z，大小写不敏感），保持顺序。
 * "A C" / "ac" / "a,c" / "B、D" 都能解析。
 * @param {string} text
 * @returns {string[]}
 */
function extractLetters(text) {
  const matches = String(text || '').toUpperCase().match(/[A-Z]/g)
  return matches ? [...matches] : []
}

/**
 * 判断题标签归一化。只接受完整单词；T/F/NG 等缩写不接受（RULES.md）。
 * @param {string} text
 * @returns {string | null}
 */
function normalizeJudgementLabel(text) {
  const norm = String(text || '').trim().toUpperCase().replace(/\s+/g, ' ')
  if (TFNG_LABELS.has(norm) || YNNG_LABELS.has(norm)) return norm
  if (norm === 'NOTGIVEN') return 'NOT GIVEN'
  return null
}

/**
 * 判一道题。
 * @param {{type: string, key: string|string[], instruction?: string}} question
 * @param {string} userAnswer
 * @returns {{ correct: boolean, errors: string[] }}
 */
export function judgeAnswer(question, userAnswer) {
  const { type, key, instruction } = question || {}
  const raw = String(userAnswer == null ? '' : userAnswer).trim()
  if (!raw) return { correct: false, errors: [ERROR_CODES.EMPTY] }

  const acceptable = expandKey(key)

  if (type === 'tfng' || type === 'ynng') {
    const label = normalizeJudgementLabel(raw)
    if (!label) return { correct: false, errors: [ERROR_CODES.MISMATCH] }
    if (type === 'tfng' && POSITIVE_YN.has(label)) {
      return { correct: false, errors: [ERROR_CODES.WRONG_LABEL_SET] }
    }
    if (type === 'ynng' && POSITIVE_TF.has(label)) {
      return { correct: false, errors: [ERROR_CODES.WRONG_LABEL_SET] }
    }
    const correct = acceptable.some((form) => form === label.toLowerCase())
    return { correct, errors: correct ? [] : [ERROR_CODES.MISMATCH] }
  }

  if (type === 'mcq') {
    const userLetters = extractLetters(raw)
    const user = userLetters.length ? userLetters[0] : normalizeText(raw)
    const correct = acceptable.some((form) => form === user.toLowerCase())
    return { correct, errors: correct ? [] : [ERROR_CODES.MISMATCH] }
  }

  if (type === 'mcq-multi') {
    const userSet = new Set(extractLetters(raw))
    const keySet = new Set(acceptable.map((f) => f.toUpperCase()))
    const same = userSet.size === keySet.size && [...userSet].every((l) => keySet.has(l))
    return { correct: same, errors: same ? [] : [ERROR_CODES.MISMATCH] }
  }

  if (type === 'matching') {
    const user = normalizeText(raw)
    const correct = acceptable.some((form) => form === user)
    return { correct, errors: correct ? [] : [ERROR_CODES.MISMATCH] }
  }

  // 默认按填空题处理（gap 及任何未声明类型）
  const format = validateAnswerFormat(raw, instruction)
  if (format.violations.includes(ERROR_CODES.WORD_LIMIT)) {
    return { correct: false, errors: [ERROR_CODES.WORD_LIMIT] }
  }
  const user = normalizeText(raw)
  if (acceptable.some((form) => form === user)) return { correct: true, errors: [] }

  // 连字符容错：把连字符换成空格再比一次（"water-proof" ↔ "water proof"）
  const userDehyphen = user.replace(/-/g, ' ')
  if (acceptable.some((form) => form === userDehyphen || form.replace(/-/g, ' ') === user)) {
    return { correct: true, errors: [] }
  }

  if (acceptable.some((form) => pluralVariants(user).includes(form))) {
    return { correct: false, errors: [ERROR_CODES.PLURAL] }
  }

  const minDistance = Math.min(...acceptable.map((form) => levenshtein(user, form)))
  if (minDistance >= 1 && minDistance <= 2) {
    return { correct: false, errors: [ERROR_CODES.SPELLING] }
  }
  return { correct: false, errors: [ERROR_CODES.MISMATCH] }
}
