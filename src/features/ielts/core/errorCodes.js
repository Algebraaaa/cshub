// ─────────────────────────────────────────────────────────────
// ERROR_CODES · 判题错因码（固定枚举，阅读/听力共用）
//
// EMPTY           未作答
// WORD_LIMIT      超出题目要求的词数/数字数限制
// PLURAL          仅单复数差异（去/加 s、es，或 y ↔ ies）
// SPELLING        非单复数差异，但与可接受写法编辑距离 1–2
// WRONG_LABEL_SET 判断题标签体系用错（TFNG 答 YES/NO；YNNG 答 TRUE/FALSE）
// MISMATCH        其他错误
// ─────────────────────────────────────────────────────────────

/** @enum {string} */
export const ERROR_CODES = {
  EMPTY: 'EMPTY',
  WORD_LIMIT: 'WORD_LIMIT',
  PLURAL: 'PLURAL',
  SPELLING: 'SPELLING',
  WRONG_LABEL_SET: 'WRONG_LABEL_SET',
  MISMATCH: 'MISMATCH',
}
