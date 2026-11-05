// ─────────────────────────────────────────────────────────────
// ieltsStore · 雅思模块本地数据（第九节：本期只存本地，可导出/清空）
//
// 统一走存储层 services/storage/LocalStore 的 JSON KV；API key 也只
// 存 localStorage，不进仓库/构建产物，导出默认不含 key。
// ─────────────────────────────────────────────────────────────

import { readJSON, writeJSON, removeKey } from '../../../services/storage/LocalStore.js'
import { rawToBand } from '../core/index.js'
import { ensureItem as ensureSrItem, SR_KEY } from './spacedRepetition.js'
import { CALL_LOG_KEY } from '../llm/callLog.js'
import { listIeltsMistakes, replaceMistakeState, getMistakeState } from '../../../services/storage/mistakeStore.js'

export const IELTS_KEYS = {
  settings: 'cshub-ielts-settings',
  writingProgress: 'cshub-ielts-writing-progress',
  sessions: 'cshub-ielts-sessions',
  knowledgeNotes: 'cshub-ielts-knowledge-notes',
  speakingTopics: 'cshub-ielts-speaking-topics',
  speakingHistory: 'cshub-ielts-speaking-history',
  vocabCustom: 'cshub-ielts-vocab-custom',
  vocabFavorites: 'cshub-ielts-vocab-favorites',
  paraphrases: 'cshub-ielts-paraphrases',
}

export const DEFAULT_SETTINGS = {
  targetBand: '6.5', // 6.0 / 6.5 / 7.0+
  strictness: 'standard', // gentle / standard / strict
  provider: 'deepseek', // deepseek / openai-compat / proxy
  baseUrl: 'https://api.deepseek.com/chat/completions',
  apiKey: '',
  model: 'deepseek-chat',
}

export const PROVIDER_PRESETS = {
  deepseek: { label: 'DeepSeek（默认，OpenAI 兼容）', baseUrl: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat' },
  'openai-compat': { label: '其他 OpenAI 兼容服务商', baseUrl: '', model: '' },
  proxy: { label: '同源中转 /api/ielts/llm（Vercel Serverless）', baseUrl: '/api/ielts/llm', model: 'deepseek-chat' },
}

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...readJSON(IELTS_KEYS.settings, {}) }
}
export function saveSettings(next) {
  writeJSON(IELTS_KEYS.settings, next)
}

export function getWritingProgress() {
  const v = readJSON(IELTS_KEYS.writingProgress, null)
  return v && typeof v === 'object' ? v : { completed: [], attempts: {} }
}
export function saveWritingProgress(next) {
  writeJSON(IELTS_KEYS.writingProgress, next)
}

/**
 * 记录一次训练步骤完成：写入 attempts 并把步骤加入 completed（解锁下一步）。
 * @param {string} stepId
 * @param {object} attempt {taskId, taskTitle, text, feedback, simulated, at}
 */
export function recordWritingAttempt(stepId, attempt) {
  const progress = getWritingProgress()
  const list = progress.attempts[stepId] || []
  list.unshift({ ...attempt, at: attempt.at || Date.now() })
  progress.attempts[stepId] = list.slice(0, 20)
  if (!progress.completed.includes(stepId)) progress.completed.push(stepId)
  saveWritingProgress(progress)
  return progress
}

export function getSessions() {
  const v = readJSON(IELTS_KEYS.sessions, [])
  return Array.isArray(v) ? v : []
}
export function saveSession(session) {
  const list = getSessions()
  const idx = list.findIndex((s) => s.id === session.id)
  if (idx >= 0) list[idx] = session
  else list.unshift(session)
  writeJSON(IELTS_KEYS.sessions, list.slice(0, 200))
}
export function deleteSession(id) {
  writeJSON(IELTS_KEYS.sessions, getSessions().filter((s) => s.id !== id))
}

export function getKnowledgeNotes() {
  const v = readJSON(IELTS_KEYS.knowledgeNotes, [])
  return Array.isArray(v) ? v : []
}
export function saveKnowledgeNotes(notes) {
  writeJSON(IELTS_KEYS.knowledgeNotes, notes)
}

export function getCustomSpeakingTopics() {
  const v = readJSON(IELTS_KEYS.speakingTopics, [])
  return Array.isArray(v) ? v : []
}
export function saveCustomSpeakingTopics(topics) {
  writeJSON(IELTS_KEYS.speakingTopics, topics)
}
export function getSpeakingHistory() {
  const v = readJSON(IELTS_KEYS.speakingHistory, [])
  return Array.isArray(v) ? v : []
}
export function addSpeakingHistory(entry) {
  const list = getSpeakingHistory()
  list.unshift({ ...entry, at: Date.now(), id: `sph-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })
  writeJSON(IELTS_KEYS.speakingHistory, list.slice(0, 100))
}

export function getCustomVocab() {
  const v = readJSON(IELTS_KEYS.vocabCustom, [])
  return Array.isArray(v) ? v : []
}
export function saveCustomVocab(list) {
  writeJSON(IELTS_KEYS.vocabCustom, list)
}
export function getVocabFavorites() {
  const v = new Set(readJSON(IELTS_KEYS.vocabFavorites, []))
  return v
}
export function saveVocabFavorites(set) {
  writeJSON(IELTS_KEYS.vocabFavorites, [...set])
}

/** 我的替换库：从阅读/听力复盘一键收藏的同义替换。 */
export function getParaphrases() {
  const v = readJSON(IELTS_KEYS.paraphrases, [])
  return Array.isArray(v) ? v : []
}
export function addParaphrase(entry) {
  const list = getParaphrases()
  const item = {
    id: `mp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: Date.now(),
    module: entry.module || 'reading',
    sourceLabel: entry.sourceLabel || '',
    questionPhrase: entry.questionPhrase || '',
    passagePhrase: entry.passagePhrase || '',
  }
  list.unshift(item)
  writeJSON(IELTS_KEYS.paraphrases, list)
  ensureSrItem('para', item.id)
  return item
}
export function deleteParaphrase(id) {
  writeJSON(IELTS_KEYS.paraphrases, getParaphrases().filter((p) => p.id !== id))
}

/**
 * 导出全部雅思个人数据（默认不含 API key）。
 * @param {{includeKey?: boolean}} [opts]
 */
export function exportIeltsData(opts = {}) {
  const doc = {
    exportedAt: new Date().toISOString(),
    version: 1,
    settings: opts.includeKey ? getSettings() : { ...getSettings(), apiKey: '' },
    writingProgress: getWritingProgress(),
    sessions: getSessions(),
    knowledgeNotes: getKnowledgeNotes(),
    speakingTopics: getCustomSpeakingTopics(),
    speakingHistory: getSpeakingHistory(),
    vocabCustom: getCustomVocab(),
    vocabFavorites: [...getVocabFavorites()],
    paraphrases: getParaphrases(),
    spacedRepetition: readJSON(SR_KEY, {}),
    llmCallLogs: readJSON(CALL_LOG_KEY, []),
    mistakes: getMistakeState(),
  }
  return doc
}

/** 导入：整体写回（错题走 mistakeStore，避免绕过迁移结构）。 */
export function importIeltsData(doc) {
  if (!doc || typeof doc !== 'object') throw new Error('导入文件格式不正确')
  if (doc.settings) writeJSON(IELTS_KEYS.settings, { ...DEFAULT_SETTINGS, ...doc.settings })
  if (doc.writingProgress) writeJSON(IELTS_KEYS.writingProgress, doc.writingProgress)
  if (Array.isArray(doc.sessions)) writeJSON(IELTS_KEYS.sessions, doc.sessions)
  if (Array.isArray(doc.knowledgeNotes)) writeJSON(IELTS_KEYS.knowledgeNotes, doc.knowledgeNotes)
  if (Array.isArray(doc.speakingTopics)) writeJSON(IELTS_KEYS.speakingTopics, doc.speakingTopics)
  if (Array.isArray(doc.speakingHistory)) writeJSON(IELTS_KEYS.speakingHistory, doc.speakingHistory)
  if (Array.isArray(doc.vocabCustom)) writeJSON(IELTS_KEYS.vocabCustom, doc.vocabCustom)
  if (Array.isArray(doc.vocabFavorites)) writeJSON(IELTS_KEYS.vocabFavorites, doc.vocabFavorites)
  if (Array.isArray(doc.paraphrases)) writeJSON(IELTS_KEYS.paraphrases, doc.paraphrases)
  if (doc.spacedRepetition && typeof doc.spacedRepetition === 'object') writeJSON(SR_KEY, doc.spacedRepetition)
  if (Array.isArray(doc.llmCallLogs)) writeJSON(CALL_LOG_KEY, doc.llmCallLogs)
  if (doc.mistakes && typeof doc.mistakes === 'object') replaceMistakeState(doc.mistakes)
}

/** 清空全部雅思个人数据（不动算法进度与课后题）。 */
export function clearIeltsData() {
  for (const key of Object.values(IELTS_KEYS)) removeKey(key)
  removeKey(SR_KEY)
  removeKey(CALL_LOG_KEY)
  clearIeltsMistakesOnly()
}

/** 只清雅思错题，算法错题保持不动。 */
export function clearIeltsMistakesOnly() {
  const state = getMistakeState()
  replaceMistakeState({ algo: state.algo, ielts: [] })
}

export { listIeltsMistakes }

/**
 * 整套估算：按来源标签把会话分组（用户给同一套题的各 Part/各篇填同一标签），
 * 听力 4 个 Part、阅读 3 篇齐了就给整套近似换算；只是按官方锚点的估算。
 * @returns {Array<{key:string,module:string,sourceLabel:string,sessions:number,raw:number,band:number,label:string}>}
 */
export function getCompletedSets() {
  const groups = {}
  for (const s of getSessions()) {
    if (!s.module || !s.sourceLabel || typeof s.correct !== 'number') continue
    const key = `${s.module}::${s.sourceLabel}`
    ;(groups[key] ||= { module: s.module, sourceLabel: s.sourceLabel, correct: 0, total: 0, sessions: 0 })
    groups[key].correct += s.correct
    groups[key].total += s.total
    groups[key].sessions += 1
  }
  const out = []
  for (const g of Object.values(groups)) {
    const need = g.module === 'listening' ? 4 : 3
    if (g.sessions < need || !g.total) continue
    const raw = Math.round((g.correct / g.total) * 40)
    const moduleKey = g.module === 'listening' ? 'listening' : 'reading-academic'
    out.push({
      key: `${g.module}::${g.sourceLabel}`,
      module: g.module, sourceLabel: g.sourceLabel, sessions: g.sessions,
      raw, band: rawToBand(moduleKey, raw),
      label: `${g.module === 'listening' ? '听力' : '阅读'}整套估算（${g.sourceLabel}，按官方锚点近似换算，非官方成绩）`,
    })
  }
  return out
}

/** 一键删除所有随会话保存的原文/文稿全文（错题里的定位句保留）。 */
export function stripSavedPassages() {
  const list = getSessions().map((s) => (s.passage ? { ...s, passage: null } : s))
  writeJSON(IELTS_KEYS.sessions, list)
  return list
}

export function hasSavedPassages() {
  return getSessions().some((s) => Boolean(s.passage))
}
