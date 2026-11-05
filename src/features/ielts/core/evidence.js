// ─────────────────────────────────────────────────────────────
// evidence · 引用校验
//
// 所有模型输出里引用原文/听力文稿的句子，都必须逐字来自用户贴入的
// 文本。合并连续空白、忽略大小写后做子串匹配；不通过的引用放进 missing，
// 界面必须标"讲解不可靠"，不得作为可靠定位句展示。
// ─────────────────────────────────────────────────────────────

/**
 * 空白/大小写归一化。
 * @param {string} text
 * @returns {string}
 */
export function normalizeForEvidence(text) {
  return String(text == null ? '' : text)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 逐条校验引用是否逐字来自原文。
 * @param {string} passage 原文/听力文稿
 * @param {string[]} quotes 待校验的引用列表
 * @returns {{ ok: boolean, missing: string[] }} missing 为校验失败的引用原文
 */
export function verifyEvidence(passage, quotes) {
  const haystack = normalizeForEvidence(passage)
  const list = Array.isArray(quotes) ? quotes : []
  /** @type {string[]} */
  const missing = []
  for (const quote of list) {
    if (typeof quote !== 'string') {
      missing.push(String(quote ?? ''))
      continue
    }
    const needle = normalizeForEvidence(quote)
    if (!needle || !haystack.includes(needle)) missing.push(quote)
  }
  return { ok: missing.length === 0, missing }
}
