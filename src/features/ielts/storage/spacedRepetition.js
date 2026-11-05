// 间隔复习（SM-2 简化版）：错题、“我的替换库”、收藏词块统一排期。
// 规则（见 docs/ielts/REPETITION.md）：
//   新条目：stage 0，立即到期（今天就要复习）
//   忘了(0) ：stage 归 0，间隔 1 天，lapses+1
//   困难(1) ：间隔 ×1.5（至少 1 天），stage 不变
//   正常(2) ：stage+1，间隔取 GOOD_STEPS（1/2/4/7/15/30/60 天，封顶 60）
//   简单(3) ：stage+2，间隔取下一档后 ×1.5
// 状态持久化在 localStorage；只存排期元数据，不存题干/词块正文。
import { readJSON, writeJSON } from '../../../services/storage/LocalStore.js'

export const SR_KEY = 'cshub-ielts-sr-v1'
export const GOOD_STEPS = [1, 2, 4, 7, 15, 30, 60]
export const MAX_INTERVAL_DAYS = 60
export const DAY_MS = 24 * 3600 * 1000

export const KIND_LABELS = { mistake: '错题', para: '同义替换', vocab: '词块' }

export function itemKey(kind, refId) {
  return `${kind}:${refId}`
}

export function getSrMap() {
  const v = readJSON(SR_KEY, {})
  return v && typeof v === 'object' ? v : {}
}

function save(map) {
  writeJSON(SR_KEY, map)
}

export function makeItem(kind, refId, now = Date.now()) {
  return {
    kind,
    refId: String(refId),
    stage: 0,
    intervalDays: GOOD_STEPS[0],
    dueAt: now, // 新条目立即到期
    lastAt: null,
    reps: 0,
    lapses: 0,
    createdAt: now,
  }
}

export function ensureItem(kind, refId, now = Date.now()) {
  const map = getSrMap()
  const key = itemKey(kind, refId)
  if (!map[key]) {
    map[key] = makeItem(kind, refId, now)
    save(map)
  }
  return map[key]
}

export function ensureMany(kind, refIds, now = Date.now()) {
  const map = getSrMap()
  let changed = false
  for (const id of refIds) {
    const key = itemKey(kind, id)
    if (!map[key]) { map[key] = makeItem(kind, id, now); changed = true }
  }
  if (changed) save(map)
}

export function removeItem(kind, refId) {
  const map = getSrMap()
  const key = itemKey(kind, refId)
  if (map[key]) { delete map[key]; save(map); return true }
  return false
}

// 纯函数：给定当前状态与评分，返回下一状态（不写存储）。
export function nextState(item, grade, now = Date.now()) {
  const cur = { ...item }
  cur.reps += 1
  cur.lastAt = now
  if (grade === 0) {
    cur.stage = 0
    cur.intervalDays = GOOD_STEPS[0]
    cur.lapses += 1
  } else if (grade === 1) {
    cur.intervalDays = Math.min(MAX_INTERVAL_DAYS, Math.max(1, Math.round(cur.intervalDays * 1.5)))
  } else if (grade === 3) {
    cur.stage = Math.min(GOOD_STEPS.length, cur.stage + 2)
    cur.intervalDays = Math.min(MAX_INTERVAL_DAYS, Math.round(GOOD_STEPS[cur.stage - 1] * 1.5))
  } else {
    cur.stage = Math.min(GOOD_STEPS.length, cur.stage + 1)
    cur.intervalDays = GOOD_STEPS[cur.stage - 1]
  }
  cur.dueAt = now + cur.intervalDays * DAY_MS
  return cur
}

export function gradeItem(kind, refId, grade, now = Date.now()) {
  const map = getSrMap()
  const key = itemKey(kind, refId)
  const current = map[key] || makeItem(kind, refId, now)
  const next = nextState(current, grade, now)
  map[key] = next
  save(map)
  return next
}

export function getAllItems() {
  return Object.values(getSrMap())
}

export function dueItems(now = Date.now(), kind = null) {
  return getAllItems()
    .filter((it) => (!kind || it.kind === kind) && it.dueAt <= now)
    .sort((a, b) => a.dueAt - b.dueAt)
}

export function dueSummary(now = Date.now()) {
  const items = getAllItems()
  const summary = { total: items.length, due: 0, byKind: { mistake: 0, para: 0, vocab: 0 } }
  for (const it of items) {
    if (it.dueAt <= now) {
      summary.due += 1
      summary.byKind[it.kind] = (summary.byKind[it.kind] || 0) + 1
    }
  }
  return summary
}

// 清除已不存在的引用（错题被删、词块取消收藏时对账）。
export function pruneItems(existing) {
  const map = getSrMap()
  let removed = 0
  for (const [key, it] of Object.entries(map)) {
    const alive = existing[it.kind] instanceof Set ? existing[it.kind].has(it.refId) : false
    if (!alive) { delete map[key]; removed += 1 }
  }
  if (removed) save(map)
  return removed
}
