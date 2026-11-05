// ─────────────────────────────────────────────────────────────
// reviewSession · 一次阅读/听力复盘的确定性汇总（纯函数 + 少量存储）
// ─────────────────────────────────────────────────────────────

import { judgeAnswer, errorCodeToReason, rawToBand, getReason } from '../core/index.js'
import { addIeltsMistake, listIeltsMistakes } from '../../../services/storage/mistakeStore.js'
import { saveSession } from './ieltsStore.js'
import { ensureMany } from './spacedRepetition.js'

/**
 * @typedef {Object} ReviewItem
 * @property {string} qid
 * @property {string} questionType 录入题型（core toJudgeType 前）
 * @property {string} [instruction]
 * @property {string} question 题干
 * @property {string} key 答案册答案
 * @property {string} user 用户答案
 */

/**
 * 跑一遍确定性判题。
 * @param {'reading'|'listening'} module
 * @param {ReviewItem[]} items
 * @param {Record<string,string>} [typeMap] qid → 录入题型（默认 gap）
 */
export function judgeReview(items, typeMap = {}) {
  return items.map((item) => {
    const inputType = item.questionType || typeMap[item.qid] || 'gap'
    const type = inputType.startsWith('matching') ? 'matching' : inputType
    const result = judgeAnswer({ type, key: item.key, instruction: item.instruction }, item.user)
    const code = result.errors[0]
    const ruleReason = result.correct ? null : errorCodeToReason(code)
    return {
      ...item,
      judgeType: type,
      correct: result.correct,
      errors: result.errors,
      ruleReason,
      // 规则可判定就先给定，其余等待模型建议/用户确认
      reasonId: ruleReason || '',
      reasonSource: ruleReason ? 'rule' : 'model',
    }
  })
}

/**
 * 错因计数。
 * @param {Array<{correct:boolean, reasonId?:string}>} results
 * @returns {Record<string, number>}
 */
export function aggregateReasons(results) {
  /** @type {Record<string, number>} */
  const stats = {}
  for (const r of results) {
    if (r.correct || !r.reasonId) continue
    stats[r.reasonId] = (stats[r.reasonId] || 0) + 1
  }
  return stats
}

/**
 * 整卷原始分估算（阅读 3 篇 × 约 13–14 题；听力 4 Part × 10 题）。
 * 结果只标"估算"，按官方公布锚点换算，非官方成绩。
 * @param {'reading'|'listening'} module
 * @param {number} correct
 * @param {number} total
 * @param {boolean} [academic=true]
 * @returns {{raw:number, band:number, label:string}|null}
 */
export function estimateBand(module, correct, total, academic = true) {
  if (!total) return null
  const raw = Math.round((correct / total) * 40)
  if (module === 'listening') {
    return { raw, band: rawToBand('listening', raw), label: '听力估算分数段（按官方锚点近似换算，非官方成绩）' }
  }
  const band = rawToBand(academic ? 'reading-academic' : 'reading-general', raw)
  return { raw, band, label: '阅读估算分数段（按官方锚点近似换算，非官方成绩）' }
}

/**
 * 把一次复盘的错题写进错题库（讲解/定位句/反思随后可 update）。
 * @param {'reading'|'listening'} module
 * @param {Array} results judgeReview 的输出（已含模型/用户确认的 reasonId）
 * @param {object} meta {sourceLabel}
 * @returns {object[]} 新建的错题记录
 */
export function persistMistakes(module, results, meta = {}) {
  const created = []
  for (const r of results) {
    if (r.correct) continue
    const reasonDef = getReason(r.reasonId)
    created.push(addIeltsMistake({
      module,
      questionType: r.judgeType,
      sourceLabel: meta.sourceLabel || '',
      questionSummary: r.question || '',
      userAnswer: r.user || '',
      keyAnswer: r.key || '',
      reasonId: r.reasonId || (module === 'listening' ? 'missed-audio' : 'locating-failed'),
      reasonSource: reasonDef?.source === 'rule' ? 'rule' : 'model',
      locationQuote: r.locationQuote || '',
      explanation: r.explanation || '',
      reflection: r.reflection || '',
    }))
  }
  return created
}

/** 保存会话摘要（原文默认不保存；saveFullText=true 才存全文）。 */
export function persistSession(session) {
  if (Array.isArray(session.mistakeIds)) ensureMany('mistake', session.mistakeIds)
  saveSession(session)
  return session
}

export { listIeltsMistakes }
