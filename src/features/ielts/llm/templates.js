// ─────────────────────────────────────────────────────────────
// templates · 模型调用模板注册表（唯一事实源）
//
// 网页版与对话插件（npm run ielts:export-harness）都从这里取定义。
// 每个模板：id / version / variables / output JSON 结构 / 不可移除约束 /
// 输出校验 / 无 key 时的模拟反馈。本文件是纯 JS，只依赖 core。
//
// 输出分三类在界面标注：规则判定（确定）/ 模型建议（可改）/ 估算分数。
// ─────────────────────────────────────────────────────────────

import {
  verifyEvidence,
  reasonsForModule,
  errorCodeToReason,
  ERROR_CODES,
} from '../core/index.js'

const REASON_IDS = (m) => reasonsForModule(m).map((r) => r.id)

function asObject(value) {
  if (typeof value === 'string') {
    try { return JSON.parse(value) } catch { return null }
  }
  return value && typeof value === 'object' ? value : null
}

function requireString(obj, key, errors) {
  if (typeof obj[key] !== 'string' || !obj[key].trim()) errors.push(`${key} 必须是非空字符串`)
}

function optionalString(obj, key, errors) {
  // 允许空串（如“找不到定位句”），但类型必须是字符串
  if (typeof obj[key] !== 'string') errors.push(`${key} 必须是字符串（找不到时给空串）`)
}

function estimateText(obj, key, errors) {
  if (typeof obj[key] !== 'string') { errors.push(`${key} 必须是字符串`); return }
  if (obj[key] && !obj[key].startsWith('估算')) errors.push(`${key} 必须以“估算”开头或为空串`)
}

function requireArrayOf(obj, key, fields, errors) {
  if (!Array.isArray(obj[key])) { errors.push(`${key} 必须是数组`); return }
  obj[key].forEach((item, i) => {
    if (!item || typeof item !== 'object') { errors.push(`${key}[${i}] 必须是对象`); return }
    for (const f of fields) requireString(item, f, errors)
  })
}

function reasonHint(moduleName, errorCode) {
  return errorCodeToReason(errorCode) || (moduleName === 'listening' ? 'missed-audio' : 'locating-failed')
}

/**
 * 从原文里取包含关键词的句子（模拟反馈用，尽量做到有用而不是空话）。
 * @param {string} passage
 * @param {string[]} keywords
 * @returns {string}
 */
function locateSentence(passage, keywords) {
  const sentences = String(passage || '').replace(/\s+/g, ' ').split(/(?<=[.!?。！？])\s+/)
  const lower = sentences.map((s) => s.toLowerCase())
  for (const kw of keywords) {
    const k = String(kw || '').trim().toLowerCase()
    if (k.length < 3) continue
    const hit = lower.findIndex((s) => s.includes(k))
    if (hit >= 0) return sentences[hit]
  }
  return ''
}

function answerKeywords(answer) {
  return String(answer || '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 3)
}

const COMMON_CONSTRAINTS = [
  '你是雅思教练，不是考生：解释“为什么答案册对、学生为什么错”，绝不重新做题、绝不推翻答案册。',
  '只允许使用本次提供的原文/文稿与答案册信息，禁止使用任何外部常识或背景知识补全。',
  '引用原文必须逐字复制，不许改写、拼接或翻译后回译。',
  '用简体中文讲解（原文引用与答案除外），具体、简短、可执行，不写空泛鼓励。',
]

function jsonEnvelope(schemaHint) {
  return [
    '只输出一个 JSON 对象，不要 Markdown 代码块，不要输出 JSON 以外的任何文字。',
    `JSON 结构：${schemaHint}`,
  ].join('\n')
}

/** @type {Record<string, object>} */
export const TEMPLATES = {
  // ── 阅读：单题讲解 ──
  'reading-explain': {
    id: 'reading-explain',
    version: 1,
    module: 'reading',
    variables: ['passage', 'question', 'questionType', 'keyAnswer', 'userAnswer', 'judge', 'sourceLabel'],
    evidenceSourceVar: 'passage',
    evidenceFields: ['locationQuote'],
    constraints: [
      ...COMMON_CONSTRAINTS,
      'locationQuote 必须是 passage 中连续逐字的一个句子；找不到时返回空字符串而不是编造。',
      '判断题必须说明 FALSE 与 NOT GIVEN 的边界具体落在哪一句。',
      'suggestedReasonId 只能从给定的错因 id 列表中选择。',
    ],
    outputSchema: {
      locationQuote: 'string, 逐字定位句；找不到给空串',
      paraphrases: 'Array<{ questionPhrase: string, passagePhrase: string }>, passagePhrase 必须逐字',
      whyKeyCorrect: 'string, 为什么答案册对',
      whyUserWrong: 'string, 为什么学生错',
      tfngNote: 'string? 判断题 FALSE/NG 边界说明',
      suggestedReasonId: 'string, 错因 id',
    },
    schemaHint: '{ "locationQuote": string, "paraphrases": [{ "questionPhrase": string, "passagePhrase": string }], "whyKeyCorrect": string, "whyUserWrong": string, "tfngNote": string, "suggestedReasonId": string }',
    buildSystem(t) {
      return [...t.constraints, jsonEnvelope(t.schemaHint)].join('\n')
    },
    buildUser(v) {
      return [
        `来源标签：${v.sourceLabel || '（未填）'}`,
        `题型：${v.questionType}`,
        `题目：${v.question}`,
        `答案册答案：${v.keyAnswer}`,
        `学生答案：${v.userAnswer}`,
        `判题结果（规则判定，不可质疑）：${JSON.stringify(v.judge)}`,
        `可选错因 id：${REASON_IDS('reading').join(', ')}`,
        '',
        `原文：\n${v.passage}`,
      ].join('\n')
    },
    validate(out0) {
      const errors = []
      const out = asObject(out0)
      if (!out) return ['输出不是合法 JSON 对象']
      optionalString(out, 'locationQuote', errors)
      requireString(out, 'whyKeyCorrect', errors)
      requireString(out, 'whyUserWrong', errors)
      requireString(out, 'suggestedReasonId', errors)
      requireArrayOf(out, 'paraphrases', ['questionPhrase', 'passagePhrase'], errors)
      if (out.suggestedReasonId && !REASON_IDS('reading').includes(out.suggestedReasonId)) {
        errors.push('suggestedReasonId 不在错因表内')
      }
      return errors
    },
    verifyOutput(out, vars) {
      const quotes = [out.locationQuote].filter(Boolean)
      for (const p of out.paraphrases || []) quotes.push(p.passagePhrase)
      return verifyEvidence(vars.passage, quotes)
    },
    mock(vars) {
      const quote = locateSentence(vars.passage, answerKeywords(vars.keyAnswer))
      return {
        locationQuote: quote,
        paraphrases: [],
        whyKeyCorrect: `【模拟反馈】答案册给的是“${vars.keyAnswer}”。请回到定位句核对它如何与题干对应。`,
        whyUserWrong: vars.judge?.errors?.[0] === ERROR_CODES.PLURAL
          ? `【模拟反馈】你的答案“${vars.userAnswer}”与答案册只有单复数差别，这类失分在誊写时检查词尾即可避免。`
          : `【模拟反馈】你的答案“${vars.userAnswer}”与答案册“${vars.keyAnswer}”不一致；配置模型后可得到逐题讲解。`,
        tfngNote: ['tfng', 'ynng'].includes(vars.questionType)
          ? '【模拟反馈】FALSE/NO 必须能在原文找到“相反陈述”；原文没给信息、无法证实也无法证伪时是 NOT GIVEN。'
          : '',
        suggestedReasonId: reasonHint('reading', vars.judge?.errors?.[0]),
      }
    },
  },

  // ── 阅读：单题追问 ──
  'reading-followup': {
    id: 'reading-followup',
    version: 1,
    module: 'reading',
    variables: ['passage', 'question', 'keyAnswer', 'userQuestion'],
    evidenceSourceVar: 'passage',
    evidenceFields: [],
    constraints: [
      ...COMMON_CONSTRAINTS,
      '只回答与本题、本段原文相关的问题；原文没有依据时明说“原文没有提供这个信息”。',
    ],
    outputSchema: { answer: 'string', quotes: 'string[]，逐字原文依据（可空）' },
    schemaHint: '{ "answer": string, "quotes": string[] }',
    buildSystem(t) {
      return [...t.constraints, jsonEnvelope(t.schemaHint)].join('\n')
    },
    buildUser(v) {
      return `题目：${v.question}\n答案册答案：${v.keyAnswer}\n原文：\n${v.passage}\n学生追问：${v.userQuestion}`
    },
    validate(out0) {
      const out = asObject(out0)
      if (!out) return ['输出不是合法 JSON 对象']
      const errors = []
      requireString(out, 'answer', errors)
      if (!Array.isArray(out.quotes)) errors.push('quotes 必须是数组')
      return errors
    },
    verifyOutput(out, vars) {
      return verifyEvidence(vars.passage, out.quotes || [])
    },
    mock(vars) {
      return {
        answer: `【模拟反馈】关于“${vars.userQuestion}”：无 key 模式下只提供模拟反馈。请对照原文与答案册答案“${vars.keyAnswer}”自行核对，配置模型后可继续追问。`,
        quotes: [],
      }
    },
  },

  // ── 阅读/听力：本篇小结（module 变量区分） ──
  'session-summary': {
    id: 'session-summary',
    version: 1,
    module: 'both',
    variables: ['module', 'correctCount', 'totalCount', 'reasonStats', 'questions'],
    evidenceSourceVar: null,
    evidenceFields: [],
    constraints: [
      ...COMMON_CONSTRAINTS,
      '按数据说话：只基于传入的判题与错因统计，不编造学生没犯的错误。',
      'problems 最多 3 条，nextTips 1–2 条，每条具体可执行。',
    ],
    outputSchema: {
      problems: 'Array<{reasonId:string, detail:string}> 最多 3 条',
      nextTips: 'string[] 1–2 条',
    },
    schemaHint: '{ "problems": [{ "reasonId": string, "detail": string }], "nextTips": [string] }',
    buildSystem(t) {
      return [...t.constraints, jsonEnvelope(t.schemaHint)].join('\n')
    },
    buildUser(v) {
      return `模块：${v.module}\n正确：${v.correctCount}/${v.totalCount}\n错因统计：${JSON.stringify(v.reasonStats)}\n题目摘要：${JSON.stringify(v.questions)}`
    },
    validate(out0) {
      const out = asObject(out0)
      if (!out) return ['输出不是合法 JSON 对象']
      const errors = []
      requireArrayOf(out, 'problems', ['reasonId', 'detail'], errors)
      if (Array.isArray(out.problems) && out.problems.length > 3) errors.push('problems 最多 3 条')
      const validReasons = [...new Set([...REASON_IDS('reading'), ...REASON_IDS('listening')])]
      if (Array.isArray(out.problems) && validReasons) {
        for (const p of out.problems) {
          if (!validReasons.includes(p.reasonId)) errors.push(`reasonId 不在错因表内：${p.reasonId}`)
        }
      }
      if (!Array.isArray(out.nextTips)) errors.push('nextTips 必须是数组')
      else if (out.nextTips.length < 1 || out.nextTips.length > 2) errors.push('nextTips 必须 1–2 条')
      return errors
    },
    verifyOutput: null,
    mock(vars) {
      const top = Object.entries(vars.reasonStats || {}).sort((a, b) => b[1] - a[1]).slice(0, 2)
      const names = Object.fromEntries(reasonsForModule(vars.module).map((r) => [r.id, r.label]))
      return {
        problems: top.map(([id, n]) => ({
          reasonId: id,
          detail: `【模拟反馈】“${names[id] || id}”出现 ${n} 次，是本篇最突出的问题。配置模型后可获得结合原文的分析。`,
        })),
        nextTips: ['【模拟反馈】下次练习先读题划定位词，再回原文扫读。'],
      }
    },
  },

  // ── 听力：单题讲解 ──
  'listening-explain': {
    id: 'listening-explain',
    version: 1,
    module: 'listening',
    variables: ['transcript', 'question', 'questionType', 'keyAnswer', 'userAnswer', 'judge', 'reflection'],
    evidenceSourceVar: 'transcript',
    evidenceFields: ['locationQuote'],
    constraints: [
      ...COMMON_CONSTRAINTS,
      'locationQuote 必须是 transcript 中连续逐字的句子（含答案出现处）；找不到返回空串。',
      '标出答案前的信号词、说话人的改口（actually / sorry / I mean 等）与干扰信息。',
      '连读弱读只能结合学生反思与文稿推断，必须在字段里注明“推断”。',
      'suggestedReasonId 只能从给定错因 id 列表选择。',
    ],
    outputSchema: {
      locationQuote: 'string 逐字定位句',
      signalWords: 'string[] 信号词（逐字）',
      correction: 'string? 改口/干扰说明，没有给空串',
      suggestedReasonId: 'string',
      advice: 'string 一两句可执行建议',
    },
    schemaHint: '{ "locationQuote": string, "signalWords": [string], "correction": string, "suggestedReasonId": string, "advice": string }',
    buildSystem(t) {
      return [...t.constraints, jsonEnvelope(t.schemaHint)].join('\n')
    },
    buildUser(v) {
      return [
        `题型：${v.questionType}`,
        `题目：${v.question}`,
        `答案册答案：${v.keyAnswer}`,
        `学生答案：${v.userAnswer}`,
        `判题结果（规则判定）：${JSON.stringify(v.judge)}`,
        `学生的反思（可能为中文）：${v.reflection || '（未填写）'}`,
        `可选错因 id：${REASON_IDS('listening').join(', ')}`,
        '',
        `听力文稿：\n${v.transcript}`,
      ].join('\n')
    },
    validate(out0) {
      const out = asObject(out0)
      if (!out) return ['输出不是合法 JSON 对象']
      const errors = []
      optionalString(out, 'locationQuote', errors)
      requireString(out, 'suggestedReasonId', errors)
      requireString(out, 'advice', errors)
      if (!Array.isArray(out.signalWords)) errors.push('signalWords 必须是数组')
      if (out.suggestedReasonId && !REASON_IDS('listening').includes(out.suggestedReasonId)) {
        errors.push('suggestedReasonId 不在错因表内')
      }
      return errors
    },
    verifyOutput(out, vars) {
      return verifyEvidence(vars.transcript, [out.locationQuote].filter(Boolean))
    },
    mock(vars) {
      const quote = locateSentence(vars.transcript, answerKeywords(vars.keyAnswer))
      return {
        locationQuote: quote,
        signalWords: [],
        correction: '【模拟反馈】留意 actually / sorry / I mean / no wait 等改口信号，听到后以后面的信息为准。',
        suggestedReasonId: reasonHint('listening', vars.judge?.errors?.[0]),
        advice: `【模拟反馈】你的答案“${vars.userAnswer}”对应答案“${vars.keyAnswer}”。把定位句精听两遍并跟读，配置模型后可结合你的反思得到讲解。`,
      }
    },
  },

  // ── 写作：分步反馈（intro/overview/body/outline/mock 通用） ──
  'writing-feedback': {
    id: 'writing-feedback',
    version: 1,
    module: 'writing',
    variables: ['stepId', 'prompt', 'text', 'knowledge', 'targetBand', 'strictness'],
    evidenceSourceVar: null,
    evidenceFields: [],
    constraints: [
      '你是写作训练教练：先看任务回应、构思与衔接，再看语言。',
      '最多指出 3 处最值得改的问题；每处给：原句（quote）、改法（suggestion）、原因（reason）。',
      '给 1–2 个考场上能自然使用的表达（expressions）。',
      '绝不整篇重写、绝不代写完整段落；肯定做得好的一处。',
      'outline 步骤只检查逻辑链与切题，不改语言。',
      '不足 150（Task 1）/250（Task 2）词时必须在 wordCountNote 提示。',
      'estimatedBand 只能给文字区间（如 “6.0–6.5”），且必须以“估算”开头；不确定给空串。',
    ],
    outputSchema: {
      taskResponse: 'string 任务回应/构思评价',
      coherence: 'string 衔接评价',
      issues: 'Array<{quote:string, suggestion:string, reason:string}> 最多3条',
      expressions: 'string[] 1–2 条',
      wordCountNote: 'string',
      estimatedBand: 'string 文字估算或空串',
    },
    schemaHint: '{ "taskResponse": string, "coherence": string, "issues": [{ "quote": string, "suggestion": string, "reason": string }], "expressions": [string], "wordCountNote": string, "estimatedBand": string }',
    buildSystem(t) {
      return [...t.constraints, jsonEnvelope(t.schemaHint)].join('\n')
    },
    buildUser(v) {
      return `训练步骤：${v.stepId}\n题目：\n${v.prompt}\n目标分：${v.targetBand || '6.5'}；严格度：${v.strictness || 'standard'}\n可参考的知识卡片：\n${v.knowledge || '（无）'}\n学生提交：\n${v.text}`
    },
    validate(out0) {
      const out = asObject(out0)
      if (!out) return ['输出不是合法 JSON 对象']
      const errors = []
      requireString(out, 'taskResponse', errors)
      requireString(out, 'coherence', errors)
      requireArrayOf(out, 'issues', ['quote', 'suggestion', 'reason'], errors)
      if (Array.isArray(out.issues) && out.issues.length > 3) errors.push('issues 最多 3 条')
      if (!Array.isArray(out.expressions)) errors.push('expressions 必须是数组')
      else if (out.expressions.length < 1 || out.expressions.length > 2) errors.push('expressions 必须 1–2 条')
      estimateText(out, 'estimatedBand', errors)
      if (typeof out.wordCountNote !== 'string') errors.push('wordCountNote 必须是字符串')
      return errors
    },
    verifyOutput: null,
    mock(vars) {
      const words = String(vars.text || '').trim().split(/\s+/).filter(Boolean).length
      const limit = String(vars.stepId).startsWith('mock-t2') || vars.stepId === 't2-body' ? 250 : 150
      return {
        taskResponse: '【模拟反馈】无 key 演示：请检查自己是否直接回应了题目要求，Task 1 是否覆盖主要特征/趋势，Task 2 是否立场清晰。',
        coherence: '【模拟反馈】检查段落顺序与句间连接：每段一个中心，指代和连接词要自然，不要堆砌。',
        issues: [],
        expressions: ['【模拟反馈】配置模型后，这里会给 1–2 个你能直接用上的地道表达。'],
        wordCountNote: words < limit ? `【模拟反馈】当前约 ${words} 词，低于 ${limit} 词要求。` : '',
        estimatedBand: '',
      }
    },
  },

  // ── 中译英：出题 ──
  'translation-challenge': {
    id: 'translation-challenge',
    version: 1,
    module: 'writing',
    variables: ['level'],
    evidenceSourceVar: null,
    evidenceFields: [],
    constraints: [
      '出一句适合中译英训练的中文句子，侧重从句、介词搭配或常用句型；难度与目标水平匹配。',
      'referenceEnglish 给一个自然的参考译法；keyPoints 列出 2–3 个采分点。',
    ],
    outputSchema: { chinese: 'string', focus: 'string', referenceEnglish: 'string', keyPoints: 'string[]' },
    schemaHint: '{ "chinese": string, "focus": string, "referenceEnglish": string, "keyPoints": [string] }',
    buildSystem(t) {
      return [...t.constraints, jsonEnvelope(t.schemaHint)].join('\n')
    },
    buildUser(v) {
      return `目标水平：${v.level || 6.5}`
    },
    validate(out0) {
      const out = asObject(out0)
      if (!out) return ['输出不是合法 JSON 对象']
      const errors = []
      requireString(out, 'chinese', errors)
      requireString(out, 'focus', errors)
      requireString(out, 'referenceEnglish', errors)
      if (!Array.isArray(out.keyPoints)) errors.push('keyPoints 必须是数组')
      else if (out.keyPoints.length < 2 || out.keyPoints.length > 3) errors.push('keyPoints 必须 2–3 条')
      return errors
    },
    verifyOutput: null,
    mock() {
      return {
        chinese: '尽管任务很难，他还是设法在截止日期之前完成了报告。',
        focus: '让步状语从句 + manage to do + 介词搭配',
        referenceEnglish: 'Although the task was difficult, he managed to finish the report before the deadline.',
        keyPoints: ['Although + 从句（不与 but 连用）', 'manage to do sth', 'before the deadline'],
      }
    },
  },

  // ── 中译英：纠错 ──
  'translation-feedback': {
    id: 'translation-feedback',
    version: 1,
    module: 'writing',
    variables: ['chinese', 'referenceEnglish', 'userTranslation'],
    evidenceSourceVar: null,
    evidenceFields: [],
    constraints: [
      '针对语法、介词搭配、句型三处纠错，最多 3 条；每条给原片段、改法与原因。',
      '不代写整句；给一个更自然的说法（better）。',
    ],
    outputSchema: {
      issues: 'Array<{quote:string, suggestion:string, reason:string}>',
      better: 'string 更自然的说法',
    },
    schemaHint: '{ "issues": [{ "quote": string, "suggestion": string, "reason": string }], "better": string }',
    buildSystem(t) {
      return [...t.constraints, jsonEnvelope(t.schemaHint)].join('\n')
    },
    buildUser(v) {
      return `中文原句：${v.chinese}\n参考译法：${v.referenceEnglish}\n学生译文：${v.userTranslation}`
    },
    validate(out0) {
      const out = asObject(out0)
      if (!out) return ['输出不是合法 JSON 对象']
      const errors = []
      requireArrayOf(out, 'issues', ['quote', 'suggestion', 'reason'], errors)
      requireString(out, 'better', errors)
      return errors
    },
    verifyOutput: null,
    mock(vars) {
      return {
        issues: [],
        better: `【模拟反馈】参考：${vars.referenceEnglish}。配置模型后会针对你的译文逐处纠错。`,
      }
    },
  },

  // ── 口语：出题（P1/P2/P3；P3 接 P2 话题） ──
  'speaking-prompt': {
    id: 'speaking-prompt',
    version: 1,
    module: 'speaking',
    variables: ['part', 'topic', 'part2Topic'],
    evidenceSourceVar: null,
    evidenceFields: [],
    constraints: [
      '按 IELTS 口语真实风格出题：Part 1 日常简短题；Part 2 给 cue card（题干 + 4 个提示点）；Part 3 必须承接 part2Topic 做抽象追问。',
      '题目英文；cueCard 字段仅 Part 2 使用。',
    ],
    outputSchema: { question: 'string', cueCard: 'string[] P2 的 4 个提示点，其他部分空数组' },
    schemaHint: '{ "question": string, "cueCard": [string] }',
    buildSystem(t) {
      return [...t.constraints, jsonEnvelope(t.schemaHint)].join('\n')
    },
    buildUser(v) {
      return `Part：${v.part}\n话题：${v.topic}${v.part2Topic ? `\n承接的 Part 2 话题：${v.part2Topic}` : ''}`
    },
    validate(out0) {
      const out = asObject(out0)
      if (!out) return ['输出不是合法 JSON 对象']
      const errors = []
      requireString(out, 'question', errors)
      if (!Array.isArray(out.cueCard)) errors.push('cueCard 必须是数组')
      else if (out.cueCard.length > 4) errors.push('cueCard 最多 4 个提示点')
      return errors
    },
    verifyOutput: null,
    mock(vars) {
      const part = String(vars.part || 1)
      if (part === '2') {
        return {
          question: `Describe ${vars.topic || 'a place you like to visit'}. You should say:`,
          cueCard: ['where it is', 'when you go there', 'what you do there', 'and explain why you like it'],
        }
      }
      if (part === '3') {
        return {
          question: `Do you think people's relationship with ${vars.part2Topic || vars.topic || 'this topic'} has changed in recent years? Why?`,
          cueCard: [],
        }
      }
      return { question: `Do you like ${vars.topic || 'your hometown'}? [模拟题]`, cueCard: [] }
    },
  },

  // ── 口语：反馈 ──
  'speaking-feedback': {
    id: 'speaking-feedback',
    version: 1,
    module: 'speaking',
    variables: ['part', 'question', 'answer'],
    evidenceSourceVar: null,
    evidenceFields: [],
    constraints: [
      '像人和人聊天：先给 3–5 个关键词/地道词块（chunks，含中文意思），告诉学生这个意思母语者常怎么说。',
      '再给一两句简短、自然、口语化的示范（modelLines），不用书面大词、不写长篇。',
      '语法只改影响理解或明显错误，最多 2 处（grammarFixes），一句话说原因。',
      'interaction 评价：是否直接回应、是否自然展开、句子是否衔接。',
      'estimates 只给 fc/lr/gra 三项文字估算，每项以“估算”开头；不给发音分，不输出总分。',
    ],
    outputSchema: {
      chunks: 'Array<{meaning:string, native:string}> 3–5 条',
      modelLines: 'string[] 1–2 句',
      grammarFixes: 'Array<{quote:string, fix:string, reason:string}> 最多2条',
      interaction: 'string',
      estimates: '{ fc:string, lr:string, gra:string }',
    },
    schemaHint: '{ "chunks": [{ "meaning": string, "native": string }], "modelLines": [string], "grammarFixes": [{ "quote": string, "fix": string, "reason": string }], "interaction": string, "estimates": { "fc": string, "lr": string, "gra": string } }',
    buildSystem(t) {
      return [...t.constraints, jsonEnvelope(t.schemaHint)].join('\n')
    },
    buildUser(v) {
      return `Part ${v.part}\n考官问题：${v.question}\n学生作答（文字转写）：\n${v.answer}`
    },
    validate(out0) {
      const out = asObject(out0)
      if (!out) return ['输出不是合法 JSON 对象']
      const errors = []
      requireArrayOf(out, 'chunks', ['meaning', 'native'], errors)
      if (Array.isArray(out.chunks) && (out.chunks.length < 3 || out.chunks.length > 5)) {
        errors.push('chunks 应为 3–5 条')
      }
      if (!Array.isArray(out.modelLines)) errors.push('modelLines 必须是数组')
      else if (out.modelLines.length < 1 || out.modelLines.length > 2) errors.push('modelLines 必须 1–2 条')
      requireArrayOf(out, 'grammarFixes', ['quote', 'fix', 'reason'], errors)
      if (Array.isArray(out.grammarFixes) && out.grammarFixes.length > 2) errors.push('grammarFixes 最多 2 条')
      requireString(out, 'interaction', errors)
      if (!out.estimates || typeof out.estimates !== 'object') errors.push('estimates 必须是对象')
      else {
        for (const forbidden of ['pronunciation', 'pron', 'total', 'overall', 'p']) {
          if (forbidden in out.estimates) errors.push('estimates 不允许发音/总分字段')
        }
        for (const k of ['fc', 'lr', 'gra']) estimateText(out.estimates, k, errors)
        for (const k of Object.keys(out.estimates)) {
          if (!['fc', 'lr', 'gra'].includes(k)) errors.push(`estimates 含未知字段：${k}`)
        }
      }
      return errors
    },
    verifyOutput: null,
    mock() {
      return {
        chunks: [
          { meaning: '【模拟】表达喜好', native: 'I’m really into ...' },
          { meaning: '【模拟】举例展开', native: 'For instance, ... / Take ... as an example' },
          { meaning: '【模拟】补充细节', native: 'What I especially like is ...' },
        ],
        modelLines: ['【模拟反馈】Well, I’m really into it, mainly because it helps me relax after a long day.'],
        grammarFixes: [],
        interaction: '【模拟反馈】无 key 模式：真实反馈会评价你是否直接回应问题、展开是否自然、衔接是否顺畅。',
        estimates: { fc: '', lr: '', gra: '' },
      }
    },
  },
}

/** @param {string} id @returns {object | undefined} */
export function getTemplate(id) {
  return TEMPLATES[id]
}

export const TEMPLATE_IDS = Object.keys(TEMPLATES)
