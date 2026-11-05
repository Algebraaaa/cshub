// ─────────────────────────────────────────────────────────────
// IELTS 内核 · 公开入口（第十一节固定接口）
//
// 框架无关的纯 JS：不引用 React、DOM、localStorage、网络或站内其他模块。
// 回归测试直接从这里 import；网页版与对话插件也只依赖这里导出的定义。
// ─────────────────────────────────────────────────────────────

export { ERROR_CODES } from './errorCodes.js'
export {
  validateAnswerFormat,
  parseInstruction,
  tokenizeAnswer,
  isNumberToken,
} from './format.js'
export {
  judgeAnswer,
  expandKey,
  normalizeText,
  levenshtein,
} from './judge.js'
export {
  rawToBand,
  overallBand,
  writingBand,
  speakingBand,
  roundToHalf,
  RAW_BAND_ANCHORS,
  BELOW_TABLE_POLICY,
} from './bands.js'
export { verifyEvidence, normalizeForEvidence } from './evidence.js'
export { getWritingLadder, canStart } from './ladder.js'
export {
  ERROR_REASONS,
  getReason,
  reasonsForModule,
  errorCodeToReason,
} from './reasons.js'
export {
  parseNumberedEntries,
  parseAnswerBlock,
  parseQuestionRange,
  QUESTION_TYPES,
  toJudgeType,
} from './parseInput.js'
