// ─────────────────────────────────────────────────────────────
// mistakeStore · 算法课后题与雅思复盘共用的错题存储（统一存储层）
//
// 键 cshub-mistakes-v1：
// {
//   version: 1,
//   algo:  { [slug]: { wrongIndices:number[], correct?:number, total?:number, lastAt?:number } },
//   ielts: IeltsMistake[]
// }
//
// 迁移（无损、幂等）：老键 algoviz-wrong-questions 与 algoviz-quiz-scores
// 在首次访问时并入 algo；老键不删除（只读保留），迁移标记防止重复执行。
// ─────────────────────────────────────────────────────────────

import { readJSON, writeJSON, removeKey } from './LocalStore.js'

export const MISTAKE_KEY = 'cshub-mistakes-v1'
export const MIGRATION_FLAG = 'cshub-mistakes-migrated-v1'
export const LEGACY_WRONG_KEY = 'algoviz-wrong-questions'
export const LEGACY_QUIZ_KEY = 'algoviz-quiz-scores'

function emptyState() {
  return { version: 1, algo: {}, ielts: [] }
}

/**
 * 读取错题总状态（必要时先执行迁移）。
 * @returns {{version:number, algo:Record<string,object>, ielts:object[]}}
 */
export function getMistakeState() {
  migrateLegacyMistakes()
  const state = readJSON(MISTAKE_KEY, null)
  if (!state || typeof state !== 'object') return emptyState()
  return {
    version: 1,
    algo: state.algo && typeof state.algo === 'object' ? state.algo : {},
    ielts: Array.isArray(state.ielts) ? state.ielts : [],
  }
}

function save(state) {
  writeJSON(MISTAKE_KEY, state)
  return state
}

/**
 * 把两个老键并入新存储。幂等：用迁移标记保护；老键保留不删。
 * 纯函数版本也导出（migrateInto），便于无 DOM 单测。
 */
export function migrateLegacyMistakes() {
  if (typeof window === 'undefined') return
  try {
    if (localStorage.getItem(MIGRATION_FLAG)) return
  } catch {
    return
  }
  const legacyWrong = readJSON(LEGACY_WRONG_KEY, {})
  const legacyQuiz = readJSON(LEGACY_QUIZ_KEY, {})
  const state = getMistakeStateWithoutMigration()
  const next = migrateInto(state, legacyWrong, legacyQuiz)
  writeJSON(MISTAKE_KEY, next)
  try { localStorage.setItem(MIGRATION_FLAG, String(Date.now())) } catch { /* ignore */ }
}

function getMistakeStateWithoutMigration() {
  const state = readJSON(MISTAKE_KEY, null)
  return state && typeof state === 'object' ? { ...emptyState(), ...state } : emptyState()
}

/**
 * 纯迁移逻辑（无 DOM 依赖，便于测试）。
 * 已有 cshub 数据不覆盖：只填补缺失 slug，wrongIndices 优先取老错题键。
 * @param {{algo:Record<string,object>,ielts:object[]}} state
 * @param {Record<string,number[]>} legacyWrong
 * @param {Record<string,{correct?:number,total?:number,lastAt?:number}>} legacyQuiz
 */
export function migrateInto(state, legacyWrong, legacyQuiz) {
  const algo = { ...(state.algo || {}) }
  const wrongMap = legacyWrong && typeof legacyWrong === 'object' ? legacyWrong : {}
  const quizMap = legacyQuiz && typeof legacyQuiz === 'object' ? legacyQuiz : {}
  const slugs = new Set([...Object.keys(wrongMap), ...Object.keys(quizMap)])
  for (const slug of slugs) {
    const indices = Array.isArray(wrongMap[slug]) ? wrongMap[slug] : (algo[slug]?.wrongIndices || [])
    const quiz = quizMap[slug] && typeof quizMap[slug] === 'object' ? quizMap[slug] : {}
    const existing = algo[slug] || {}
    algo[slug] = {
      wrongIndices: Array.isArray(indices) ? [...indices] : [],
      correct: typeof quiz.correct === 'number' ? quiz.correct : existing.correct,
      total: typeof quiz.total === 'number' ? quiz.total : existing.total,
      lastAt: typeof quiz.lastAt === 'number' ? quiz.lastAt : existing.lastAt,
    }
  }
  return { version: 1, algo, ielts: Array.isArray(state.ielts) ? state.ielts : [] }
}

// ── 算法课后题 ──

/** @returns {Record<string, number[]>} slug → 错题序号（保持老组件数据形状） */
export function getAlgoWrongMap() {
  const { algo } = getMistakeState()
  /** @type {Record<string, number[]>} */
  const map = {}
  for (const [slug, rec] of Object.entries(algo)) {
    map[slug] = Array.isArray(rec.wrongIndices) ? [...rec.wrongIndices] : []
  }
  return map
}

/**
 * 记录一次算法课后题结果。
 * @param {string} slug
 * @param {{correct?:number, total?:number, wrongIndices?:number[]}} result
 */
export function recordAlgoQuiz(slug, { correct, total, wrongIndices = [] } = {}) {
  const state = getMistakeState()
  // 与旧 algoviz-wrong-questions 行为一致：全对即删除该 slug
  // （满分记录仍由 algoviz-quiz-scores / ProgressContext 保留）。
  if (wrongIndices.length === 0) {
    delete state.algo[slug]
    save(state)
    return
  }
  state.algo[slug] = {
    wrongIndices: [...wrongIndices],
    ...(typeof correct === 'number' ? { correct } : {}),
    ...(typeof total === 'number' ? { total } : {}),
    lastAt: Date.now(),
  }
  return save(state)
}

// ── 雅思错题 ──

/**
 * @typedef {Object} IeltsMistake
 * @property {string} id
 * @property {'reading'|'listening'} module
 * @property {string} questionType
 * @property {string} sourceLabel
 * @property {string} questionSummary
 * @property {string} userAnswer
 * @property {string} keyAnswer
 * @property {string} reasonId 错因 id（core/reasons）
 * @property {'rule'|'model'} reasonSource 规则判定 / 模型建议
 * @property {string} locationQuote 定位句（已通过 verifyEvidence 才存）
 * @property {string} explanation 讲解摘要
 * @property {string} reflection 用户反思（听力）
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/** @returns {IeltsMistake[]} */
export function listIeltsMistakes() {
  return getMistakeState().ielts
}

/** @param {Omit<IeltsMistake,'id'|'createdAt'|'updatedAt'>} record @returns {IeltsMistake} */
export function addIeltsMistake(record) {
  const state = getMistakeState()
  const now = Date.now()
  const entry = { ...record, id: `im-${now}-${Math.random().toString(36).slice(2, 8)}`, createdAt: now, updatedAt: now }
  state.ielts.unshift(entry)
  save(state)
  return entry
}

/** @param {string} id @param {Partial<IeltsMistake>} patch */
export function updateIeltsMistake(id, patch) {
  const state = getMistakeState()
  const idx = state.ielts.findIndex((m) => m.id === id)
  if (idx < 0) return null
  state.ielts[idx] = { ...state.ielts[idx], ...patch, updatedAt: Date.now() }
  save(state)
  return state.ielts[idx]
}

/** @param {string} id */
export function deleteIeltsMistake(id) {
  const state = getMistakeState()
  const next = state.ielts.filter((m) => m.id !== id)
  const removed = next.length !== state.ielts.length
  state.ielts = next
  save(state)
  return removed
}

export function clearIeltsMistakes() {
  const state = getMistakeState()
  state.ielts = []
  save(state)
}

/** 仅供测试/数据导入：整体替换。 */
export function replaceMistakeState(next) {
  save({ version: 1, algo: next.algo || {}, ielts: next.ielts || [] })
}

/** 清空全部个人数据时调用（设置页"清空"）。 */
export function resetMistakeStore() {
  removeKey(MISTAKE_KEY)
  removeKey(MIGRATION_FLAG)
}

/** @param {string} slug 删除某算法的错题记录（全对时） */
export function deleteAlgoMistake(slug) {
  const state = getMistakeState()
  if (slug in state.algo) {
    delete state.algo[slug]
    save(state)
  }
}
