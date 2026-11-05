// ─────────────────────────────────────────────────────────────
// reasons · 固定错因表（第五节，阅读/听力共用，便于长期统计）
//
// source:
//   rule   规则可判定（界面标"规则判定"），可由 ERROR_CODES 直接映射
//   model  模型建议、用户确认/修改（界面标"模型建议"）
// 连读弱读只能基于反思与文稿推断，inferred: true。
// ─────────────────────────────────────────────────────────────

import { ERROR_CODES } from './errorCodes.js'

/**
 * @typedef {Object} ReasonDef
 * @property {string} id
 * @property {string} label 中文展示名
 * @property {'reading'|'listening'|'both'} module
 * @property {'rule'|'model'} source
 * @property {boolean} inferred 是否只能推断（听力连读弱读）
 */

/** @type {ReasonDef[]} */
export const ERROR_REASONS = [
  // —— 共用 ——
  { id: 'spelling-format', label: '拼写或格式', module: 'both', source: 'rule', inferred: false },
  { id: 'plural', label: '单复数', module: 'both', source: 'rule', inferred: false },
  { id: 'word-limit', label: '超字数', module: 'both', source: 'rule', inferred: false },
  { id: 'ran-out-of-time', label: '时间不够没做', module: 'both', source: 'model', inferred: false },
  // —— 阅读 ——
  { id: 'locating-failed', label: '定位失败', module: 'reading', source: 'model', inferred: false },
  { id: 'paraphrase-missed', label: '同义替换没识别', module: 'reading', source: 'model', inferred: false },
  { id: 'over-inference', label: '过度推断（用了原文没有的信息）', module: 'reading', source: 'model', inferred: false },
  { id: 'tfng-confusion', label: '判断题规则混淆（FALSE 与 NOT GIVEN）', module: 'reading', source: 'model', inferred: false },
  { id: 'task-type-misread', label: '题型理解错误', module: 'reading', source: 'model', inferred: false },
  // —— 听力 ——
  { id: 'missed-audio', label: '漏听', module: 'listening', source: 'model', inferred: false },
  { id: 'paraphrase-audio-missed', label: '同义改述没识别', module: 'listening', source: 'model', inferred: false },
  { id: 'distractor-correction', label: '被干扰或改口误导', module: 'listening', source: 'model', inferred: false },
  { id: 'number-time-date', label: '数字时间日期', module: 'listening', source: 'model', inferred: false },
  { id: 'connected-speech', label: '连读弱读（推断）', module: 'listening', source: 'model', inferred: true },
  { id: 'unknown-vocab', label: '词汇不认识', module: 'listening', source: 'model', inferred: false },
]

const REASON_MAP = new Map(ERROR_REASONS.map((r) => [r.id, r]))

/** @param {string} id @returns {ReasonDef | undefined} */
export function getReason(id) {
  return REASON_MAP.get(id)
}

/**
 * @param {'reading'|'listening'} module
 * @returns {ReasonDef[]}
 */
export function reasonsForModule(module) {
  return ERROR_REASONS.filter((r) => r.module === 'both' || r.module === module)
}


/**
 * 判题错误码 → 规则可判定错因。返回 null 表示需要模型建议。
 * @param {string} code ERROR_CODES 之一
 * @returns {string | null} reason id
 */
export function errorCodeToReason(code) {
  switch (code) {
    case ERROR_CODES.SPELLING:
    case ERROR_CODES.WRONG_LABEL_SET:
      return 'spelling-format'
    case ERROR_CODES.PLURAL:
      return 'plural'
    case ERROR_CODES.WORD_LIMIT:
      return 'word-limit'
    default:
      return null
  }
}
