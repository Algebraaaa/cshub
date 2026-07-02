import { getStepCodeLine } from '../../utils/stepProtocol'

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .match(/[a-z_][a-z0-9_]*|\d+|[\u4e00-\u9fff]+/g) || []
}

// \u663e\u5f0f\u884c\u53f7\u89e3\u6790\u7edf\u4e00\u8d70 stepProtocol.getStepCodeLine\uff08\u542b codeLine/line/pseudoLine \u515c\u5e95\uff09
function getDirectLine(step, lang) {
  return getStepCodeLine(step, lang)
}

const HINTS = [
  ['初始化', ['let', 'const', 'var', '=', 'push', 'new', 'create', 'init', 'fill', 'set', 'visited', 'queue', 'stack', 'dp', 'parent']],
  ['比较', ['if', 'while', 'for', 'compare', '>', '<', '===', '!==', '>=', '<=']],
  ['检查', ['if', 'while', 'for', 'visited', 'queue', 'stack', 'has', 'includes']],
  ['访问', ['visit', 'visited', 'current', 'node', 'index', 'idx', 'pointer']],
  ['交换', ['swap', '[', ']', '=', 'temp', 'left', 'right', 'arr']],
  ['更新', ['=', 'dist', 'dp', 'parent', 'prev', 'min', 'max', 'key', 'best']],
  ['入队', ['push', 'enqueue', 'queue']],
  ['出队', ['shift', 'dequeue', 'queue']],
  ['插入', ['insert', 'push', 'splice', 'left', 'right', 'node']],
  ['松弛', ['dist', 'prev', 'weight', 'edge']],
  ['匹配', ['text', 'pattern', 'lps', 'match', 'compare']],
  ['回溯', ['backtrack', 'restore', 'remove', 'try']],
  ['递归', ['return', 'function', 'dfs', 'rec']],
]

export function inferCodeLine(codeText, step, lang) {
  const direct = getDirectLine(step, lang)
  if (direct != null) return direct

  const lines = String(codeText || '').split(/\r?\n/)
  if (lines.length === 0) return null

  const description = String(step?.description || '')
  const descTokens = tokenize(description)
  let bestLine = null
  let bestScore = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lower = line.toLowerCase()
    let score = 0

    for (const token of descTokens) {
      if (token.length < 2) continue
      if (lower.includes(token)) score += 2
    }

    for (const [hint, keywords] of HINTS) {
      if (!description.includes(hint)) continue
      for (const keyword of keywords) {
        if (lower.includes(keyword)) score += 1
      }
    }

    if (/\bif\b/.test(lower) && /(比较|检查|更新|交换|匹配|松弛)/.test(description)) score += 1
    if (/\bfor\b|\bwhile\b/.test(lower) && /(循环|遍历|扫描|轮|迭代|重复)/.test(description)) score += 1
    if (/push|enqueue|shift|dequeue/.test(lower) && /(入队|出队|加入队列|队列)/.test(description)) score += 1
    if (/swap|\[.*\] =/.test(lower) && /(交换|调换)/.test(description)) score += 1
    if (/return/.test(lower) && /(完成|结束|返回|最优|结果)/.test(description)) score += 1

    if (score > bestScore) {
      bestScore = score
      bestLine = i + 1
    }
  }

  return bestScore > 0 ? bestLine : null
}