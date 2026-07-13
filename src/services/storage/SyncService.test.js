import { test, expect } from 'vitest'
import { createSyncService, mergeProgress } from './SyncService.js'

// ─── In-memory stubs ──────────────────────────────────────────
function stubLocal() {
  let state = { favorites: new Set(), completed: new Set(), quizScores: {}, progressMeta: {} }
  let listener = null
  return {
    state,
    loadProgress: () => ({
      favorites: new Set(state.favorites),
      completed: new Set(state.completed),
      quizScores: { ...state.quizScores },
      progressMeta: { ...state.progressMeta },
    }),
    saveProgress: (next) => { state = { progressMeta: {}, ...next } },
    clearProgress: () => { state = { favorites: new Set(), completed: new Set(), quizScores: {}, progressMeta: {} } },
    subscribeCrossTab: (h) => { listener = h; return () => { listener = null } },
    _emit: (patch) => listener?.(patch),
    _snapshot: () => state,
  }
}

function stubRemote({ enabled = true, fixture = null, failPushTimes = 0 } = {}) {
  const calls = { fetch: 0, pushProg: [], pushQuiz: [], clearAll: 0, subscribe: 0 }
  let remainingFailures = failPushTimes
  return {
    enabled,
    fetchProgress: async () => { calls.fetch++; return fixture },
    pushProgressRow: async (uid, slug, payload) => {
      if (remainingFailures > 0) { remainingFailures--; throw new Error('network down') }
      calls.pushProg.push({ uid, slug, payload })
    },
    pushQuizRow: async (uid, slug, score) => { calls.pushQuiz.push({ uid, slug, score }) },
    clearAll: async () => { calls.clearAll++ },
    subscribeRealtime: () => { calls.subscribe++; return () => {} },
    _calls: () => calls,
  }
}

// ─── mergeProgress：LWW 语义 ─────────────────────────────────

test('mergeProgress: 双方无时间戳（历史数据）时退回并集，quiz 取更好成绩', () => {
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

test('mergeProgress: 远端更新的"取消收藏"能删掉本地旧收藏（审计高危 4）', () => {
  // 设备 A 在 t=2000 取消了收藏并推到云端；本设备的本地副本还是 t=1000 时的"已收藏"
  const local = {
    favorites: new Set(['x']),
    completed: new Set(),
    quizScores: {},
    progressMeta: { x: 1000 },
  }
  const remote = {
    favorites: new Set(),         // 云端 favorited=false
    completed: new Set(),
    quizScores: {},
    rows: { x: { favorited: false, completed: false, at: 2000 } },
  }
  const merged = mergeProgress(local, remote)
  expect(merged.favorites.has('x')).toBe(false)   // 取消收藏传播成功，不再复活
  expect(merged.changedSlugs).toEqual([])          // 与远端一致，无需推回
  expect(merged.progressMeta.x).toBe(2000)
})

test('mergeProgress: 本地更新的修改战胜远端旧状态，并列入 changedSlugs 待推', () => {
  const local = {
    favorites: new Set(),          // 本地 t=3000 取消了收藏
    completed: new Set(['x']),
    quizScores: {},
    progressMeta: { x: 3000 },
  }
  const remote = {
    favorites: new Set(['x']),     // 云端还是 t=2000 的"已收藏"
    completed: new Set(),
    quizScores: {},
    rows: { x: { favorited: true, completed: false, at: 2000 } },
  }
  const merged = mergeProgress(local, remote)
  expect(merged.favorites.has('x')).toBe(false)
  expect(merged.completed.has('x')).toBe(true)
  expect(merged.changedSlugs).toEqual(['x'])       // 本地赢 → 需要推回云端
})

// ─── 服务级行为 ──────────────────────────────────────────────

test('offline mode: enqueue does NOT call remote.push (remote.enabled=false)', async () => {
  const local = stubLocal()
  const remote = stubRemote({ enabled: false })
  const sync = createSyncService({ local, remote, getUserId: () => null, debounceMs: 10 })
  sync.enqueueProgress('foo', { favorited: true, completed: false })
  await new Promise(r => setTimeout(r, 50))
  expect(remote._calls().pushProg.length).toBe(0)
})

test('online mode: syncWithRemote 合并后只推真正有差异的行', async () => {
  const local = stubLocal()
  local.saveProgress({ favorites: new Set(['a']), completed: new Set(), quizScores: {}, progressMeta: {} })
  const remote = stubRemote({
    enabled: true,
    fixture: { favorites: new Set(['b']), completed: new Set(['a']), quizScores: {} },
  })
  const sync = createSyncService({ local, remote, getUserId: () => 'user-1', debounceMs: 5 })
  const merged = await sync.syncWithRemote()
  expect(merged).toBeTruthy()
  expect([...merged.favorites].sort()).toEqual(['a', 'b'])
  expect([...merged.completed].sort()).toEqual(['a'])
  // 只有 a 的合并结果(fav+completed)与远端行(仅 completed)不同；b 与远端一致不推
  const pushedSlugs = remote._calls().pushProg.map(c => c.slug).sort()
  expect(pushedSlugs).toEqual(['a'])
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

// ─── 审计高危 1：推送失败重试，数据不丢 ─────────────────────

test('flush 失败的条目保留在队列并退避重试，最终送达（审计高危 1）', async () => {
  const local = stubLocal()
  const remote = stubRemote({
    enabled: true,
    fixture: { favorites: new Set(), completed: new Set(), quizScores: {} },
    failPushTimes: 1,                     // 第一次推送模拟断网
  })
  const sync = createSyncService({ local, remote, getUserId: () => 'u1', debounceMs: 5 })
  await sync.syncWithRemote()
  sync.enqueueProgress('flaky', { favorited: true, completed: false })
  await new Promise(r => setTimeout(r, 15))            // 第一次 flush：失败
  expect(remote._calls().pushProg.length).toBe(0)
  expect(sync._internals.pendingSize()).toBe(1)        // 条目还在，没丢！
  await new Promise(r => setTimeout(r, 60))            // 等退避重试
  expect(remote._calls().pushProg.map(c => c.slug)).toEqual(['flaky'])
  expect(sync._internals.pendingSize()).toBe(0)
})

// ─── 审计高危 2：跨账号防护 ─────────────────────────────────

test('用户 A 的残留队列不会推送到用户 B 的账号（审计高危 2）', async () => {
  const local = stubLocal()
  const remote = stubRemote({ enabled: true, fixture: { favorites: new Set(), completed: new Set(), quizScores: {} } })
  let uid = 'user-A'
  const sync = createSyncService({ local, remote, getUserId: () => uid, debounceMs: 10 })
  await sync.syncWithRemote()
  sync.enqueueProgress('a-secret', { favorited: true, completed: false })
  uid = null                                            // A 在防抖窗口内登出
  await new Promise(r => setTimeout(r, 30))
  expect(remote._calls().pushProg.length).toBe(0)

  uid = 'user-B'                                        // B 登录同一浏览器
  await sync.syncWithRemote()
  sync.enqueueProgress('b-own', { favorited: true, completed: false })
  await new Promise(r => setTimeout(r, 40))
  const pushed = remote._calls().pushProg
  // B 的推送里绝不能出现 A 的 slug，也不能有任何以 A 的 uid 发出的调用
  expect(pushed.some(c => c.slug === 'a-secret')).toBe(false)
  expect(pushed.every(c => c.uid === 'user-B')).toBe(true)
})

test('resetSyncFlag 清空队列：登出后残留条目被丢弃', async () => {
  const local = stubLocal()
  const remote = stubRemote({ enabled: true, fixture: { favorites: new Set(), completed: new Set(), quizScores: {} } })
  const sync = createSyncService({ local, remote, getUserId: () => 'u1', debounceMs: 10 })
  await sync.syncWithRemote()
  sync.enqueueProgress('x', { favorited: true, completed: false })
  sync.resetSyncFlag()                                  // 登出路径
  expect(sync._internals.pendingSize()).toBe(0)
  await new Promise(r => setTimeout(r, 30))
  expect(remote._calls().pushProg.length).toBe(0)
})

// ─── 审计高危 3：clearAll 防僵尸数据 ────────────────────────

test('clearAll 取消在途防抖推送：清空后数据不会复活（审计高危 3）', async () => {
  const local = stubLocal()
  const remote = stubRemote({ enabled: true, fixture: { favorites: new Set(), completed: new Set(), quizScores: {} } })
  const sync = createSyncService({ local, remote, getUserId: () => 'u1', debounceMs: 20 })
  await sync.syncWithRemote()
  sync.enqueueProgress('zombie', { favorited: true, completed: false })
  await sync.clearAll()                                 // 防抖窗口内清空
  await new Promise(r => setTimeout(r, 60))             // 若定时器没被取消，这里会推送
  expect(remote._calls().pushProg.some(c => c.slug === 'zombie')).toBe(false)
  expect(remote._calls().clearAll).toBe(1)
})

test('clearAll: wipes local AND remote when cloud enabled', async () => {
  const local = stubLocal()
  local.saveProgress({ favorites: new Set(['a']), completed: new Set(['b']), quizScores: { x: { attempted: 1, correct: 1, total: 1, lastAt: 1 } }, progressMeta: {} })
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
  local.saveProgress({ favorites: new Set(['a']), completed: new Set(), quizScores: {}, progressMeta: {} })
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

test('mergeProgress: local with only more attempts (same correct/lastAt) still merges attempted', () => {
  const local = {
    favorites: new Set(),
    completed: new Set(),
    quizScores: { q1: { attempted: 5, correct: 2, total: 3, lastAt: 100 } },
  }
  const remote = {
    favorites: new Set(),
    completed: new Set(),
    quizScores: { q1: { attempted: 2, correct: 2, total: 3, lastAt: 100 } },
  }
  const merged = mergeProgress(local, remote)
  expect(merged.quizScores.q1.attempted).toBe(5)
  expect(merged.quizScores.q1.correct).toBe(2)
})

test('flushNow: pushes pending immediately without waiting for debounce', async () => {
  const local = stubLocal()
  const remote = stubRemote({ enabled: true, fixture: { favorites: new Set(), completed: new Set(), quizScores: {} } })
  const sync = createSyncService({ local, remote, getUserId: () => 'u1', debounceMs: 10000 })
  await sync.syncWithRemote()
  sync.enqueueProgress('a', { favorited: true, completed: false })
  sync.enqueueQuiz('a', { attempted: 1, correct: 1, total: 1, lastAt: 1 })
  expect(remote._calls().pushProg.length).toBe(0)
  await sync.flushNow()
  expect(remote._calls().pushProg.map(c => c.slug)).toEqual(['a'])
  expect(remote._calls().pushQuiz.map(c => c.slug)).toEqual(['a'])
})

test('flushNow: before initial sync does NOT push (pre-init queue stays buffered)', async () => {
  const local = stubLocal()
  const remote = stubRemote({ enabled: true, fixture: { favorites: new Set(), completed: new Set(), quizScores: {} } })
  const sync = createSyncService({ local, remote, getUserId: () => 'u1', debounceMs: 10000 })
  sync.enqueueProgress('early', { favorited: true, completed: false })
  await sync.flushNow()
  expect(remote._calls().pushProg.length).toBe(0)
})
