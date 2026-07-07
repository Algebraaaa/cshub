// ─────────────────────────────────────────────────────────────
// SyncService · 本地 + 云端进度同步协调器（Facade）
//
// 职责：
//   - 提供"获取初始状态 / 持久化本地 / 跨标签订阅"等本地侧门面
//   - 提供"按 userId 拉取并合并 → 推回 diff"的登录态同步流程
//   - 维护 debounce 上传队列（避免频繁 toggle 击穿 Supabase）
//   - 转发 realtime 订阅（Supabase 推送 → 用户业务层 patch）
//
// 设计要点：
//   - local / remote 必须通过构造参数注入（生产代码在 ProgressContext 里显式
//     绑定 ./LocalStore 与 ./RemoteStore；单元测试注入纯 stub）。
//   - userId 通过函数 getUserId 动态读取，避免服务实例需要随 userId 重建。
//
// 2026-07 竞态修复（安全审计高危 1-4）：
//   1. flush 失败不再丢数据：条目保留在队列，指数退避重试（上限 10 次）
//   2. 跨账号防护：enqueue 时捕获当时的 userId，flush 只推送
//      属于当前用户的条目，其余丢弃（A 登出→B 登录不会带走 A 的队列）
//   3. clearAll 防"僵尸数据"：取消防抖定时器、清空队列、等待
//      in-flight flush 落地后再清远端，清完的数据不会被旧请求复活
//   4. 删除可传播：favorites/completed 改用 LWW（Last-Write-Wins）合并
//      —— 本地按 progressMeta[slug] 记录修改时刻，远端按 updated_at，
//      新的一方获胜；双方都无时间戳（历史数据）时退回并集。
//      设备 A 取消收藏后，设备 B 同步不再把它"复活"。
// ─────────────────────────────────────────────────────────────

/**
 * LWW 合并本地与远端进度。
 * local:  { favorites:Set, completed:Set, quizScores, progressMeta?:{slug:ms} }
 * remote: { favorites:Set, completed:Set, quizScores, rows?:{slug:{favorited,completed,at}} }
 * 返回 { favorites, completed, quizScores, progressMeta, changedSlugs }
 * changedSlugs = 合并结果与远端行不一致、需要推回云端的 slug 列表。
 */
export function mergeProgress(local, remote) {
  const localMeta = local.progressMeta || {}
  // 兼容旧 remote 形态（无 rows）：由集合合成 at=0 的行
  let rows = remote.rows
  if (!rows) {
    rows = {}
    for (const slug of remote.favorites) rows[slug] = { favorited: true, completed: false, at: 0 }
    for (const slug of remote.completed) {
      rows[slug] = { ...(rows[slug] || { favorited: false }), completed: true, at: 0 }
    }
  }

  const slugs = new Set([
    ...local.favorites, ...local.completed,
    ...Object.keys(localMeta), ...Object.keys(rows),
  ])

  const favorites = new Set()
  const completed = new Set()
  const progressMeta = {}
  const changedSlugs = []

  for (const slug of slugs) {
    const localAt = localMeta[slug] || 0
    const row = rows[slug]
    const remoteAt = row?.at || 0
    const lFav = local.favorites.has(slug)
    const lDone = local.completed.has(slug)

    let fav, done
    if (!row) {
      // 远端不知道这个 slug：本地为准
      fav = lFav; done = lDone
    } else if (localAt > remoteAt) {
      fav = lFav; done = lDone                    // 本地更新 → 本地赢（含删除）
    } else if (remoteAt > localAt) {
      fav = !!row.favorited; done = !!row.completed  // 远端更新 → 远端赢
    } else {
      // 平手（双方都无时间戳的历史数据）：并集，宁多勿丢
      fav = lFav || !!row.favorited
      done = lDone || !!row.completed
    }

    if (fav) favorites.add(slug)
    if (done) completed.add(slug)
    const at = Math.max(localAt, remoteAt)
    if (at > 0) progressMeta[slug] = at
    // 与远端行不一致才需要推回（远端没有行且本地有状态，也要推）
    const remoteFav = !!row?.favorited
    const remoteDone = !!row?.completed
    if (fav !== remoteFav || done !== remoteDone) changedSlugs.push(slug)
  }

  const quizScores = { ...remote.quizScores }
  for (const [slug, l] of Object.entries(local.quizScores)) {
    const r = quizScores[slug]
    // 本地在任一维度（时间 / 正确数 / 尝试数）更新时合并；各字段取最大值，
    // 避免旧逻辑漏掉"仅 attempted 增加"的场景导致尝试次数统计回退。
    if (!r
      || (l.lastAt || 0) > (r.lastAt || 0)
      || (l.correct || 0) > (r.correct || 0)
      || (l.attempted || 0) > (r.attempted || 0)) {
      quizScores[slug] = {
        attempted: Math.max(r?.attempted || 0, l.attempted || 0),
        correct: Math.max(r?.correct || 0, l.correct || 0),
        total: Math.max(r?.total || 0, l.total || 0),
        lastAt: Math.max(r?.lastAt || 0, l.lastAt || 0),
      }
    }
  }

  return { favorites, completed, quizScores, progressMeta, changedSlugs }
}

const MAX_RETRY = 10           // 单条目重试上限（防对着永久性错误无限打）
const MAX_BACKOFF_MS = 30_000  // 退避上限

export function createSyncService({
  local,
  remote,
  getUserId = () => null,
  debounceMs = 600,
} = {}) {
  if (!local || !remote) {
    throw new Error('createSyncService: `local` 与 `remote` 必须显式注入。生产代码请从 ./LocalStore 与 ./RemoteStore import。')
  }
  let initSynced = false
  // slug → { payload, uid, attempts }；uid 在入队时捕获（跨账号防护）
  const pendingProgress = new Map()
  const pendingQuiz = new Map()
  let flushTimer = null
  let flushing = null            // in-flight flush 的 promise（串行化 + clearAll 等待）
  let consecutiveFailures = 0

  function cancelTimer() {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null }
  }

  function scheduleFlush(delay = debounceMs) {
    if (!remote.enabled || !getUserId() || !initSynced) return
    cancelTimer()
    flushTimer = setTimeout(() => { flushTimer = null; runFlush() }, delay)
  }

  function runFlush() {
    // 串行化：上一轮还在网络中就排队等它完成再跑
    flushing = (flushing || Promise.resolve()).then(flush).finally(() => { flushing = null })
    return flushing
  }

  // 立即冲刷 pending 队列（页面卸载 / 登出等场景），跳过防抖等待。
  // 与 scheduleFlush 保持同一前置条件：初始合并完成前不上推（本地副本不丢，下次登录会合并）。
  async function flushNow() {
    if (flushTimer) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
    if (!remote.enabled || !getUserId() || !initSynced) return
    if (pendingProgress.size === 0 && pendingQuiz.size === 0) return
    await runFlush()   // 经串行化入口，避免与 in-flight flush 并发
  }

  async function flush() {
    const userId = getUserId()
    if (!userId) {
      // 无人登录：队列里的条目属于已结束的会话，丢弃（防跨账号泄漏）
      pendingProgress.clear()
      pendingQuiz.clear()
      return
    }

    // 只取属于当前用户的条目；其他用户残留的条目直接丢弃
    const progEntries = []
    for (const [slug, entry] of pendingProgress) {
      if (entry.uid === userId) progEntries.push([slug, entry])
      else pendingProgress.delete(slug)
    }
    const quizEntries = []
    for (const [slug, entry] of pendingQuiz) {
      if (entry.uid === userId) quizEntries.push([slug, entry])
      else pendingQuiz.delete(slug)
    }
    if (!progEntries.length && !quizEntries.length) return

    const tasks = [
      ...progEntries.map(([slug, e]) =>
        remote.pushProgressRow(userId, slug, e.payload)
          .then(() => ({ ok: true, map: pendingProgress, slug, e }))
          .catch(() => ({ ok: false, map: pendingProgress, slug, e }))),
      ...quizEntries.map(([slug, e]) =>
        remote.pushQuizRow(userId, slug, e.payload)
          .then(() => ({ ok: true, map: pendingQuiz, slug, e }))
          .catch(() => ({ ok: false, map: pendingQuiz, slug, e }))),
    ]
    const results = await Promise.all(tasks)

    let failed = 0
    for (const r of results) {
      if (r.ok) {
        // 成功：仅当队列里仍是同一个条目才删（期间可能被更新的入队覆盖）
        if (r.map.get(r.slug) === r.e) r.map.delete(r.slug)
      } else {
        failed++
        r.e.attempts = (r.e.attempts || 0) + 1
        if (r.e.attempts >= MAX_RETRY) {
          r.map.delete(r.slug)   // 放弃这条（本地副本仍在，不算彻底丢失）
          console.warn(`[sync] ${r.slug} 推送重试 ${MAX_RETRY} 次仍失败，放弃云端同步（本地已保存）`)
        }
      }
    }

    if (failed > 0) {
      // 指数退避重试：失败条目还在队列里
      consecutiveFailures++
      const backoff = Math.min(debounceMs * 2 ** consecutiveFailures, MAX_BACKOFF_MS)
      scheduleFlush(backoff)
    } else {
      consecutiveFailures = 0
    }
  }

  return {
    /** 业务状态初值（本地优先） */
    initial() {
      return local.loadProgress()
    },

    /** 把内存状态镜像到 localStorage（始终调用，登录后仍保留本地副本） */
    persistLocal(state) {
      local.saveProgress(state)
    },

    /** 监听跨标签 localStorage 变更（未登录时使用） */
    subscribeCrossTab(handler) {
      return local.subscribeCrossTab(handler)
    },

    /** 监听 Supabase realtime（登录时使用） */
    subscribeRealtime(userId, handler) {
      return remote.subscribeRealtime(userId, handler)
    },

    /** 登录后调用：拉云端 → LWW 合并 → 只推回有差异的行 → 返回 merged state */
    async syncWithRemote() {
      const userId = getUserId()
      if (!remote.enabled || !userId) {
        initSynced = false
        return null
      }
      const localState = local.loadProgress()
      const remoteState = await remote.fetchProgress(userId)
      if (!remoteState) {
        initSynced = false
        return null
      }
      const merged = mergeProgress(localState, remoteState)
      local.saveProgress(merged)

      const tasks = []
      for (const slug of merged.changedSlugs) {
        tasks.push(remote.pushProgressRow(userId, slug, {
          completed: merged.completed.has(slug),
          favorited: merged.favorites.has(slug),
          at: merged.progressMeta[slug] || Date.now(),
        }))
      }
      for (const [slug, score] of Object.entries(merged.quizScores)) {
        tasks.push(remote.pushQuizRow(userId, slug, score))
      }
      await Promise.allSettled(tasks)
      initSynced = true
      return merged
    },

    /** 注销 / 切换用户时调用：重置同步标志并清空队列（跨账号防护） */
    resetSyncFlag() {
      initSynced = false
      cancelTimer()
      pendingProgress.clear()
      pendingQuiz.clear()
    },

    /** 单个 slug 的进度变更入队（防抖推送到云端）。payload 可带 at（修改时刻，LWW 用） */
    enqueueProgress(slug, payload) {
      pendingProgress.set(slug, { payload, uid: getUserId(), attempts: 0 })
      scheduleFlush()
    },

    enqueueQuiz(slug, score) {
      pendingQuiz.set(slug, { payload: score, uid: getUserId(), attempts: 0 })
      scheduleFlush()
    },

    /** 清空本地 + 云端所有进度（防僵尸：先掐掉一切在途推送） */
    async clearAll() {
      cancelTimer()
      pendingProgress.clear()
      pendingQuiz.clear()
      if (flushing) {
        try { await flushing } catch { /* 在途失败无所谓，反正要清 */ }
      }
      local.clearProgress()
      const userId = getUserId()
      if (remote.enabled && userId) {
        await remote.clearAll(userId)
      }
    },

    isCloudEnabled() {
      return remote.enabled && !!getUserId()
    },

    /** 立即同步所有 pending 变更（页面卸载时由 ProgressContext 调用，best-effort） */
    flushNow,

    // 测试钩子
    _internals: {
      flush: runFlush,
      isInitSynced: () => initSynced,
      pendingSize: () => pendingProgress.size + pendingQuiz.size,
    },
  }
}
