// ─────────────────────────────────────────────────────────────
// LocalStore · localStorage 适配层（Facade）
//
// 把 favorites / completed / quizScores / progressMeta 四个 KV 的读写、
// JSON 容错与跨标签事件订阅封装在这里。SyncService 与 ProgressContext
// 都不直接操作 localStorage——换存储介质（如 IndexedDB）只需改本文件。
//
// progressMeta（2026-07 新增）：{ slug: 最后本地修改时刻 ms }，
// 供 SyncService 的 LWW 合并使用——没有它，"取消收藏"无法跨设备传播。
//
// 写失败可见化（审计 #7）：Safari 隐私模式 / QuotaExceeded 下写入
// 静默失败会让用户"做了 quiz 刷新就没了"且毫无线索。首次失败时
// console.warn + 上报 monitoring（动态 import，避免测试环境耦合）。
// ─────────────────────────────────────────────────────────────

export const KEYS = {
  FAV: 'algoviz-favorites',
  DONE: 'algoviz-completed',
  QUIZ: 'algoviz-quiz-scores',
  META: 'algoviz-progress-meta',
}

let warnedWriteFailure = false
function onWriteFailure(err) {
  if (warnedWriteFailure) return
  warnedWriteFailure = true
  console.warn('[LocalStore] localStorage 写入失败（隐私模式或配额已满），本次会话的进度将无法持久化：', err?.message)
  import('../../lib/monitoring.js')
    .then(m => m.reportError(err || new Error('localStorage write failed'), { source: 'storage-write' }))
    .catch(() => {})
}

function loadSet(key) {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function saveSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]))
  } catch (err) {
    onWriteFailure(err)
  }
}

function loadObj(key) {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    const obj = JSON.parse(raw)
    return obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : {}
  } catch {
    return {}
  }
}

function saveObj(key, obj) {
  try {
    localStorage.setItem(key, JSON.stringify(obj))
  } catch (err) {
    onWriteFailure(err)
  }
}

export function loadProgress() {
  return {
    favorites: loadSet(KEYS.FAV),
    completed: loadSet(KEYS.DONE),
    quizScores: loadObj(KEYS.QUIZ),
    progressMeta: loadObj(KEYS.META),
  }
}

export function saveProgress({ favorites, completed, quizScores, progressMeta }) {
  saveSet(KEYS.FAV, favorites)
  saveSet(KEYS.DONE, completed)
  saveObj(KEYS.QUIZ, quizScores)
  saveObj(KEYS.META, progressMeta || {})
}

export function clearProgress() {
  try {
    localStorage.removeItem(KEYS.FAV)
    localStorage.removeItem(KEYS.DONE)
    localStorage.removeItem(KEYS.QUIZ)
    localStorage.removeItem(KEYS.META)
  } catch {
    /* ignore */
  }
}

// 监听跨标签变更（其它标签改了 localStorage 时本标签收到事件）。
// handler 收到的是部分 patch：{ favorites? } / { completed? } / { quizScores? } / { progressMeta? }
export function subscribeCrossTab(handler) {
  if (typeof window === 'undefined') return () => {}
  const onStorage = (e) => {
    if (e.key === KEYS.FAV) handler({ favorites: loadSet(KEYS.FAV) })
    else if (e.key === KEYS.DONE) handler({ completed: loadSet(KEYS.DONE) })
    else if (e.key === KEYS.QUIZ) handler({ quizScores: loadObj(KEYS.QUIZ) })
    else if (e.key === KEYS.META) handler({ progressMeta: loadObj(KEYS.META) })
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}

// ─────────────────────────────────────────────────────────────
// 通用 JSON KV（新模块接入存储层的统一入口）
// 复用上面的容错与写失败可见化逻辑；不与四个进度 KV 耦合。
// ─────────────────────────────────────────────────────────────

/** 读取任意 JSON 键，缺失/损坏时返回 fallback。 */
export function readJSON(key, fallback = null) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

/** 写入任意 JSON 键，返回是否成功。 */
export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    onWriteFailure(err)
    return false
  }
}

/** 删除任意键。 */
export function removeKey(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
