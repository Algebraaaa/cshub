// ─────────────────────────────────────────────────────────────
// format · 答案格式校验（词数 / 数字数限制）
//
// 与判对错分离：validateAnswerFormat 只看"形式是否符合 instruction"，
// 不看答案内容是否正确。IELTS 官方对字数限制的口径见
// src/features/ielts/data/rules.js 与 docs/ielts/RULES.md。
//
// 约定（非官方细节，已在 RULES.md 标注）：
//   - 连字符词（water-proof）算 1 个词；
//   - "数字 token" 指整体由数字与标点组成的 token（15 / 1,200 / 3.5）；
//   - 带序数后缀（1st）也算数字；带货币符号的 £15 同样算数字。
// ─────────────────────────────────────────────────────────────

import { ERROR_CODES } from './errorCodes.js'

/**
 * @typedef {Object} FormatSpec
 * @property {number} maxWords    允许的最大单词数（数字不算词）
 * @property {number} maxNumbers  允许的最大数字数
 * @property {boolean} [wordsRequired] A NUMBER 类指令：不允许出现词
 */

/**
 * 把题目要求文本解析成结构化限制。大小写不敏感。
 * 支持的指令（至少）：
 *   ONE WORD ONLY
 *   ONE WORD AND/OR A NUMBER
 *   NO MORE THAN TWO WORDS
 *   NO MORE THAN TWO WORDS AND/OR A NUMBER
 *   NO MORE THAN THREE WORDS
 *   NO MORE THAN THREE WORDS AND/OR A NUMBER
 *   A NUMBER
 * @param {string} instruction
 * @returns {FormatSpec | null} 无法识别时返回 null（调用方不做强约束）
 */
export function parseInstruction(instruction) {
  const text = String(instruction || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) return null

  const wordsLimit = (n) => ({ maxWords: n, maxNumbers: 0 })

  if (/\ba number only\b/.test(text)) return { maxWords: 0, maxNumbers: 1, wordsRequired: false }
  // 必须先匹配带 AND/OR A NUMBER 的长指令，再匹配纯词数指令
  if (/\bone word and or a number\b/.test(text)) return { maxWords: 1, maxNumbers: 1 }
  if (/\bno more than two words and or a number\b/.test(text)) return { maxWords: 2, maxNumbers: 1 }
  if (/\bno more than three words and or a number\b/.test(text)) return { maxWords: 3, maxNumbers: 1 }
  if (/\bone word only\b/.test(text)) return wordsLimit(1)
  if (/\bno more than two words\b/.test(text)) return wordsLimit(2)
  if (/\bno more than three words\b/.test(text)) return wordsLimit(3)
  if (/^a number$/.test(text) || /\bchoose a number\b/.test(text)) {
    return { maxWords: 0, maxNumbers: 1, wordsRequired: false }
  }
  return null
}

/**
 * 切分答案并区分词 token / 数字 token。
 * 连字符不切（连字符词算 1 个词）。
 * @param {string} answer
 * @returns {{ tokens: string[], words: number, numbers: number }}
 */
export function tokenizeAnswer(answer) {
  const raw = String(answer || '').trim()
  if (!raw) return { tokens: [], words: 0, numbers: 0 }
  const tokens = raw.split(/\s+/).filter(Boolean)
  let numbers = 0
  for (const token of tokens) {
    if (isNumberToken(token)) numbers += 1
  }
  return { tokens, words: tokens.length - numbers, numbers }
}

/**
 * 一个 token 是否整体是"数字"：去掉货币/百分号/千分位/小数点/序数后缀后
 * 必须含数字且不含字母（允许 st/nd/rd/th 后缀）。
 * @param {string} token
 * @returns {boolean}
 */
export function isNumberToken(token) {
  const stripped = token
    .replace(/[£$€¥%]/g, '')
    .replace(/(st|nd|rd|th)$/i, '')
    .replace(/[,./:-]/g, '')
  return stripped.length > 0 && /[0-9]/.test(stripped) && !/[a-z]/i.test(stripped)
}

// Recognize a complete written integer when the instruction requests a number.
// Limit recognition to grammatical groups so arbitrary words are not accepted.
function isWrittenInteger(answer) {
  const unit = '(?:one|two|three|four|five|six|seven|eight|nine)'
  const small = '(?:ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)'
  const tens = '(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)'
  const belowHundred = `(?:${small}|${tens}(?:[- ]${unit})?|${unit})`
  const group = `(?:${unit} hundred(?: (?:and )?${belowHundred})?|${belowHundred})`
  const integer = `(?:zero|${group}(?: thousand(?: (?:and )?${group})?)?)`
  return new RegExp(`^(?:minus )?${integer}$`, 'i').test(answer.trim().replace(/\s+/g, ' '))
}

/**
 * 校验答案格式。
 * @param {string} answer 用户答案
 * @param {string} instruction 题目要求原文（大小写不敏感）
 * @returns {{ ok: boolean, words: number, numbers: number, violations: string[] }}
 *   violations 取 ERROR_CODES：空答案 EMPTY；超限 WORD_LIMIT。
 */
export function validateAnswerFormat(answer, instruction) {
  const { words, numbers } = tokenizeAnswer(answer)
  const trimmed = String(answer || '').trim()
  if (!trimmed) {
    return { ok: false, words: 0, numbers: 0, violations: [ERROR_CODES.EMPTY] }
  }
  const spec = parseInstruction(instruction)
  if (!spec) {
    // 识别不出的指令不强行判错：内容判对仍走 judgeAnswer。
    return { ok: true, words, numbers, violations: [] }
  }
  if (spec.maxWords === 0 && spec.maxNumbers === 1 && isWrittenInteger(trimmed)) {
    return { ok: true, words: 0, numbers: 1, violations: [] }
  }
  /** @type {string[]} */
  const violations = []
  if (words > spec.maxWords) violations.push(ERROR_CODES.WORD_LIMIT)
  if (numbers > spec.maxNumbers) violations.push(ERROR_CODES.WORD_LIMIT)
  if (spec.wordsRequired === false && words > 0) violations.push(ERROR_CODES.WORD_LIMIT)
  return { ok: violations.length === 0, words, numbers, violations }
}
