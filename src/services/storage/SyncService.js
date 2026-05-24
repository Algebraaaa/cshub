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
//     绑定 ./LocalStore 与 ./RemoteStore；单元测试注入纯 stub）。这样 SyncService
//     模块本身不静态依赖 Vite-only 模块（如 import.meta.env），可以在 Node test
//     中直接 import 而无需 mock。
//   - userId 通过函数 getUserId 动态读取，避免服务实例需要随 userId 重建。
//   - debounce 计时器 + initSynced 标志位是闭包内的私有状态。
// ─────────────────────────────────────────────────────────────

export function mergeProgress(local, remote) {
  const favorites = new Set([...remote.favorites, ...local.favorites])
  const completed = new Set([...remote.completed, ...local.completed])
  const quizScores = { ...remote.quizScores }
  for (const [slug, l] of Object.entries(local.quizScores)) {
    const r = quizScores[slug]
    if (!r || (l.lastAt || 0) > (r.lastAt || 0) || (l.correct || 0) > (r.correct || 0)) {
      quizScores[slug] = {
        attempted: Math.max(r?.attempted || 0, l.attempted || 0),
        correct: Math.max(r?.correct || 0, l.correct || 0),
        total: l.total || r?.total || 0,
        lastAt: Math.max(r?.lastAt || 0, l.lastAt || 0),
      }
    }
  }
  return { favorites, completed, quizScores }
}

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
  const pendingProgress = new Map()
  const pendingQuiz = new Map()
  let flushTimer = null

  function scheduleFlush() {
    if (!remote.enabled || !getUserId() || !initSynced) return
    if (flushTimer) clearTimeout(flushTimer)
    flushTimer = setTimeout(flush, debounceMs)
  }

  async function flush() {
    const userId = getUserId()
    if (!userId) return
    const progEntries = [...pendingProgress.entries()]
    const quizEntries = [...pendingQuiz.entries()]
    pendingProgress.clear()
    pendingQuiz.clear()
    const tasks = []
    for (const [slug, payload] of progEntries) {
      tasks.push(remote.pushProgressRow(userId, slug, payload))
    }
    for (const [slug, score] of quizEntries) {
      tasks.push(remote.pushQuizRow(userId, slug, score))
    }
    await Promise.allSettled(tasks)
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

    /** 登录后调用：拉云端 → 合并本地 → 推回 diff → 返回 merged state */
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
      const allSlugs = new Set([...merged.favorites, ...merged.completed])
      for (const slug of allSlugs) {
        tasks.push(remote.pushProgressRow(userId, slug, {
          completed: merged.completed.has(slug),
          favorited: merged.favorites.has(slug),
        }))
      }
      for (const [slug, score] of Object.entries(merged.quizScores)) {
        tasks.push(remote.pushQuizRow(userId, slug, score))
      }
      await Promise.allSettled(tasks)
      initSynced = true
      return merged
    },

    /** 注销 / 切换用户时重置同步标志 */
    resetSyncFlag() {
      initSynced = false
    },

    /** 单个 slug 的进度变更入队（防抖推送到云端） */
    enqueueProgress(slug, payload) {
      pendingProgress.set(slug, payload)
      scheduleFlush()
    },

    enqueueQuiz(slug, score) {
      pendingQuiz.set(slug, score)
      scheduleFlush()
    },

    /** 清空本地 + 云端所有进度 */
    async clearAll() {
      local.clearProgress()
      const userId = getUserId()
      if (remote.enabled && userId) {
        await remote.clearAll(userId)
      }
    },

    isCloudEnabled() {
      return remote.enabled && !!getUserId()
    },

    // 测试钩子
    _internals: { flush, isInitSynced: () => initSynced },
  }
}
