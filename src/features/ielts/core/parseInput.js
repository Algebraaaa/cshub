// ─────────────────────────────────────────────────────────────
// parseInput · 整段粘贴自动拆题（纯函数，框架无关）
//
// 真实答案册/用户答案的粘贴格式很乱：
//   "1. TRUE" / "1 TRUE" / "Q1: B" / "11 museums" / 纯每行一个
// 本模块把它们拆成编号条目；拆错了界面允许手动改，所以这里宁可
// 保守：识别不到编号就按非空行顺序编号。
// ─────────────────────────────────────────────────────────────

const NUMBER_PREFIX = /^\s*(?:q\.?\s*|no\.?\s*)?(\d{1,3})\s*[.、):：-]?\s*/i

/**
 * @typedef {Object} NumberedEntry
 * @property {number} number 题号（从 1 开始的连续编号）
 * @property {string} content 去掉题号后的内容
 */

/**
 * 把整段文本拆成编号条目。
 * - 行首带题号（1. / 1) / Q1 / No.1 等）时按题号拆，续行并入上一条；
 * - 完全没有题号时，每个非空行一条，从 1 顺序编号；
 * - 题号可以跳号（跨题组粘贴），输出保留原题号。
 * @param {string} text
 * @returns {NumberedEntry[]}
 */
export function parseNumberedEntries(text) {
  const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n')
  /** @type {{number: number, content: string} | null} */
  let current = null
  /** @type {{number: number, content: string}[]} */
  const entries = []
  let sawNumbers = false
  let autoIndex = 0

  const pushCurrent = () => {
    if (current && current.content.trim()) {
      entries.push({ number: current.number, content: current.content.trim() })
    }
    current = null
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      pushCurrent()
      continue
    }
    const m = line.match(NUMBER_PREFIX)
    // 必须真的带编号标点或 Q/No 前缀才算题号，避免把 "15 minutes" 误判成题号
    const looksNumbered = m && /^\s*(?:q\.?\s*|no\.?\s*)?\d{1,3}\s*[.、):：]/.test(line)
    if (looksNumbered && m) {
      sawNumbers = true
      pushCurrent()
      current = { number: Number(m[1]), content: line.slice(m[0].length) }
    } else if (current && sawNumbers) {
      current.content += ` ${line}`
    } else {
      autoIndex += 1
      entries.push({ number: autoIndex, content: line })
    }
  }
  pushCurrent()
  return entries
}

/**
 * 解析答案册/用户答案粘贴块，返回题号 → 答案文本。
 * @param {string} text
 * @returns {Record<number, string>}
 */
export function parseAnswerBlock(text) {
  /** @type {Record<number, string>} */
  const map = {}
  for (const entry of parseNumberedEntries(text)) {
    map[entry.number] = entry.content
  }
  return map
}

/**
 * 把题号区间字符串（"1-3" / "1–3"）展开成题号数组。
 * @param {string} text
 * @returns {number[]}
 */
export function parseQuestionRange(text) {
  const m = String(text || '').match(/(\d{1,3})\s*[-–~至]\s*(\d{1,3})/)
  if (!m) return []
  const start = Number(m[1])
  const end = Number(m[2])
  if (end < start) return []
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * 题型元数据（录入/判题/统计共用）。
 */
export const QUESTION_TYPES = [
  { id: 'gap', label: '填空（句子/摘要/表格/流程图）' },
  { id: 'tfng', label: '判断题 TRUE / FALSE / NOT GIVEN' },
  { id: 'ynng', label: '判断题 YES / NO / NOT GIVEN' },
  { id: 'mcq', label: '单选题' },
  { id: 'mcq-multi', label: '多选题' },
  { id: 'matching-headings', label: '段落标题匹配' },
  { id: 'matching-info', label: '信息匹配' },
  { id: 'matching-names', label: '人名观点匹配' },
]

/**
 * 录入用题型 → judgeAnswer 的 type。匹配三小类判题规则一致，统一为 matching。
 * @param {string} inputType
 * @returns {'gap'|'tfng'|'ynng'|'mcq'|'mcq-multi'|'matching'}
 */
export function toJudgeType(inputType) {
  if (inputType.startsWith('matching')) return 'matching'
  // @ts-ignore 联合类型在运行期直接透传
  return inputType
}
