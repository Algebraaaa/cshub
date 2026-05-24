// ─────────────────────────────────────────────────────────────
// LocalStore · localStorage 适配层（Facade）
//
// 把 favorites / completed / quizScores 三个 KV 的读写、JSON 容错与
// 跨标签事件订阅封装在这里。SyncService 与 ProgressContext 都不直接
// 操作 localStorage——这样换存储介质（如 IndexedDB）只需改本文件。
// ─────────────────────────────────────────────────────────────

export const KEYS = {
  FAV: 'algoviz-favorites',
  DONE: 'algoviz-completed',
  QUIZ: 'algoviz-quiz-scores',
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
  } catch {
    /* ignore */
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
  } catch {
    /* ignore */
  }
}

export function loadProgress() {
  return {
    favorites: loadSet(KEYS.FAV),
    completed: loadSet(KEYS.DONE),
    quizScores: loadObj(KEYS.QUIZ),
  }
}

export function saveProgress({ favorites, completed, quizScores }) {
  saveSet(KEYS.FAV, favorites)
  saveSet(KEYS.DONE, completed)
  saveObj(KEYS.QUIZ, quizScores)
}

export function clearProgress() {
  try {
    localStorage.removeItem(KEYS.FAV)
    localStorage.removeItem(KEYS.DONE)
    localStorage.removeItem(KEYS.QUIZ)
  } catch {
    /* ignore */
  }
}

// 监听跨标签变更（其它标签改了 localStorage 时本标签收到事件）。
// handler 收到的是部分 patch：{ favorites? } / { completed? } / { quizScores? }
export function subscribeCrossTab(handler) {
  if (typeof window === 'undefined') return () => {}
  const onStorage = (e) => {
    if (e.key === KEYS.FAV) handler({ favorites: loadSet(KEYS.FAV) })
    else if (e.key === KEYS.DONE) handler({ completed: loadSet(KEYS.DONE) })
    else if (e.key === KEYS.QUIZ) handler({ quizScores: loadObj(KEYS.QUIZ) })
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}
