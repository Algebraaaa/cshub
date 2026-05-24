import { test, expect } from 'vitest'
import { createSyncService, mergeProgress } from './SyncService.js'

// ─── In-memory stubs ──────────────────────────────────────────
function stubLocal() {
  let state = { favorites: new Set(), completed: new Set(), quizScores: {} }
  let listener = null
  return {
    state,
    loadProgress: () => ({
      favorites: new Set(state.favorites),
      completed: new Set(state.completed),
      quizScores: { ...state.quizScores },
    }),
    saveProgress: (next) => { state = { ...next } },
    clearProgress: () => { state = { favorites: new Set(), completed: new Set(), quizScores: {} } },
    subscribeCrossTab: (h) => { listener = h; return () => { listener = null } },
    _emit: (patch) => listener?.(patch),
    _snapshot: () => state,
  }
}

function stubRemote({ enabled = true, fixture = null } = {}) {
  const calls = { fetch: 0, pushProg: [], pushQuiz: [], clearAll: 0, subscribe: 0 }
  return {
    enabled,
    fetchProgress: async () => { calls.fetch++; return fixture },
    pushProgressRow: async (uid, slug, payload) => { calls.pushProg.push({ uid, slug, payload }) },
    pushQuizRow: async (uid, slug, score) => { calls.pushQuiz.push({ uid, slug, score }) },
    clearAll: async () => { calls.clearAll++ },
    subscribeRealtime: () => { calls.subscribe++; return () => {} },
    _calls: () => calls,
  }
}

test('mergeProgress: takes union of favorites + completed, keeps better quiz score', () => {
  const local = {
    favorites: new Set(['a']),
    completed: new Set(['b']),
    quizScores: { q1: { attempted: 2, correct: 1, total: 3, lastAt: 100 } },
  }
  const remote = {
    favorites: new Set(['c']),
    completed: new Set(['a']),
    quizScores: { q1: { attempted: 1, correct: 3, total: 3, lastAt: 50 } },
  }
  const merged = mergeProgress(local, remote)
  expect([...merged.favorites].sort()).toEqual(['a', 'c'])
  expect([...merged.completed].sort()).toEqual(['a', 'b'])
  expect(merged.quizScores.q1.correct).toBe(3)
  expect(merged.quizScores.q1.attempted).toBe(2)
  expect(merged.quizScores.q1.lastAt).toBe(100)
})

test('offline mode: enqueue does NOT call remote.push (remote.enabled=false)', async () => {
  const local = stubLocal()
  const remote = stubRemote({ enabled: false })
  const sync = createSyncService({ local, remote, getUserId: () => null, debounceMs: 10 })
  sync.enqueueProgress('foo', { favorited: true, completed: false })
  await new Promise(r => setTimeout(r, 50))
  expect(remote._calls().pushProg.length).toBe(0)
})

test('online mode: syncWithRemote merges, pushes diff, marks initSynced', async () => {
  const local = stubLocal()
  local.saveProgress({ favorites: new Set(['a']), completed: new Set(), quizScores: {} })
  const remote = stubRemote({
    enabled: true,
    fixture: { favorites: new Set(['b']), completed: new Set(['a']), quizScores: {} },
  })
  const sync = createSyncService({ local, remote, getUserId: () => 'user-1', debounceMs: 5 })
  const merged = await sync.syncWithRemote()
  expect(merged).toBeTruthy()
  expect([...merged.favorites].sort()).toEqual(['a', 'b'])
  expect([...merged.completed].sort()).toEqual(['a'])
  const pushedSlugs = remote._calls().pushProg.map(c => c.slug).sort()
  expect(pushedSlugs).toEqual(['a', 'b'])
  const localNow = local.loadProgress()
  expect([...localNow.favorites].sort()).toEqual(['a', 'b'])
  expect(sync._internals.isInitSynced()).toBe(true)
})

test('online mode: pre-init enqueue stays buffered until syncWithRemote, then flushes', async () => {
  const local = stubLocal()
  const remote = stubRemote({ enabled: true, fixture: { favorites: new Set(), completed: new Set(), quizScores: {} } })
  const sync = createSyncService({ local, remote, getUserId: () => 'user-1', debounceMs: 10 })
  sync.enqueueProgress('preinit', { favorited: true, completed: false })
  await new Promise(r => setTimeout(r, 30))
  expect(remote._calls().pushProg.length).toBe(0)
  await sync.syncWithRemote()
  expect(remote._calls().pushProg.length).toBe(0)
  sync.enqueueProgress('x', { favorited: true, completed: false })
  sync.enqueueProgress('y', { favorited: false, completed: true })
  await new Promise(r => setTimeout(r, 40))
  const newSlugs = remote._calls().pushProg.map(c => c.slug).sort()
  expect(newSlugs).toEqual(['preinit', 'x', 'y'])
})

test('online mode: same slug enqueued twice keeps only latest payload', async () => {
  const local = stubLocal()
  const remote = stubRemote({ enabled: true, fixture: { favorites: new Set(), completed: new Set(), quizScores: {} } })
  const sync = createSyncService({ local, remote, getUserId: () => 'user-1', debounceMs: 10 })
  await sync.syncWithRemote()
  const baseline = remote._calls().pushProg.length
  sync.enqueueProgress('z', { favorited: true, completed: false })
  sync.enqueueProgress('z', { favorited: false, completed: true })
  await new Promise(r => setTimeout(r, 40))
  const newCalls = remote._calls().pushProg.slice(baseline)
  expect(newCalls.length).toBe(1)
  expect(newCalls[0].payload).toEqual({ favorited: false, completed: true })
})

test('clearAll: wipes local AND remote when cloud enabled', async () => {
  const local = stubLocal()
  local.saveProgress({ favorites: new Set(['a']), completed: new Set(['b']), quizScores: { x: { attempted: 1, correct: 1, total: 1, lastAt: 1 } } })
  const remote = stubRemote({ enabled: true })
  const sync = createSyncService({ local, remote, getUserId: () => 'user-1' })
  await sync.clearAll()
  expect(remote._calls().clearAll).toBe(1)
  const after = local.loadProgress()
  expect(after.favorites.size).toBe(0)
  expect(after.completed.size).toBe(0)
  expect(after.quizScores).toEqual({})
})

test('clearAll: in offline mode wipes local without touching remote', async () => {
  const local = stubLocal()
  local.saveProgress({ favorites: new Set(['a']), completed: new Set(), quizScores: {} })
  const remote = stubRemote({ enabled: false })
  const sync = createSyncService({ local, remote, getUserId: () => null })
  await sync.clearAll()
  expect(remote._calls().clearAll).toBe(0)
  expect(local.loadProgress().favorites.size).toBe(0)
})

test('isCloudEnabled reflects remote.enabled AND userId presence', () => {
  let uid = null
  const sync = createSyncService({ local: stubLocal(), remote: stubRemote({ enabled: true }), getUserId: () => uid })
  expect(sync.isCloudEnabled()).toBe(false)
  uid = 'u1'
  expect(sync.isCloudEnabled()).toBe(true)
  const offlineSync = createSyncService({ local: stubLocal(), remote: stubRemote({ enabled: false }), getUserId: () => 'u1' })
  expect(offlineSync.isCloudEnabled()).toBe(false)
})

test('resetSyncFlag: after reset, enqueue does NOT push until syncWithRemote runs again', async () => {
  const local = stubLocal()
  const remote = stubRemote({ enabled: true, fixture: { favorites: new Set(), completed: new Set(), quizScores: {} } })
  const sync = createSyncService({ local, remote, getUserId: () => 'u1', debounceMs: 5 })
  await sync.syncWithRemote()
  sync.resetSyncFlag()
  sync.enqueueProgress('x', { favorited: true, completed: false })
  await new Promise(r => setTimeout(r, 30))
  expect(remote._calls().pushProg.length).toBe(0)
})
