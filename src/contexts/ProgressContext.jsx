import { createContext, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import * as LocalStore from '../services/storage/LocalStore.js'
import * as RemoteStore from '../services/storage/RemoteStore.js'
import { createSyncService } from '../services/storage/SyncService.js'
import { useAuth } from './AuthContext'

// ── 架构说明(2026-07 P0 重渲染治理)────────────────────────────
// 状态从 Provider 的 useState 迁到 ref store + useSyncExternalStore
// (与 StepContext 同款模式):
//   - Context value = { store, actions },引用永久稳定 → Provider 不再
//     因状态变化重渲染,children 不级联
//   - useProgress() 内部订阅 store,返回值构造与旧实现逐字相同,
//     8 处既有消费者行为/时机完全不变(零迁移)
//   - useProgressActions():只要 actions(如 Quiz),状态变化零重渲染
//   - useProgressSelector(fn):精准订阅(P1 迁移 Sidebar/PathPage 用)
// 注意:actions 里的 setState 已脱离 React,updater 必须纯同步,
// 不可依赖 React 批处理语义。
const ProgressContext = createContext(null)

// SyncService 是应用级单例（module-level），持有 debounce 队列与同步标志。
// 通过 getUserId() 闭包动态读取当前用户，避免随 userId 变化而重建实例。
//
// _syncUserId：类 React ref 的轻量替代。不使用 useRef 是因为 sync 单例
// 在模块初始化时就需要捕获这个 getter，而 useRef 只能在组件内部调用。
// 模块内可变变量的代价：测试需要在用例间手动 reset；HMR 重载时保留旧值
// （无害，下一次 useEffect 会立即写入正确值）。
let _syncUserId = null
const sync = createSyncService({
  local: LocalStore,
  remote: RemoteStore,
  getUserId: () => _syncUserId,
})

function applyRealtimePatch(prev, patch) {
  if (patch.progress) {
    const { slug, favorited, completed, at } = patch.progress
    const favorites = new Set(prev.favorites)
    const completedSet = new Set(prev.completed)
    if (patch.event === 'DELETE') {
      favorites.delete(slug)
      completedSet.delete(slug)
    } else {
      favorited ? favorites.add(slug) : favorites.delete(slug)
      completed ? completedSet.add(slug) : completedSet.delete(slug)
    }
    // 记下远端时间戳：本设备后续 LWW 合并时不会用旧状态盖掉这次远端变更
    const progressMeta = { ...prev.progressMeta, [slug]: at || Date.now() }
    return { ...prev, favorites, completed: completedSet, progressMeta }
  }
  if (patch.quiz) {
    const { slug, ...score } = patch.quiz
    return { ...prev, quizScores: { ...prev.quizScores, [slug]: score } }
  }
  return prev
}

// store 放 Provider 内(useRef)而非模块级:模块级会跨测试用例泄漏状态
function createProgressStore(initial) {
  let snapshot = initial
  const listeners = new Set()
  return {
    getSnapshot: () => snapshot,
    subscribe: (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    setState: (updater) => {
      snapshot = updater(snapshot)
      listeners.forEach(l => l())
    },
  }
}

export function ProgressProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id

  // 保持最新 userId 给 SyncService 闭包同步读取（见模块顶部注释）
  useEffect(() => {
    _syncUserId = userId ?? null
  }, [userId])

  const storeRef = useRef(null)
  if (!storeRef.current) storeRef.current = createProgressStore(sync.initial())
  const store = storeRef.current

  // 始终镜像到 localStorage（即使登录，离线也能用）：挂载写一次 + 订阅驱动
  useEffect(() => {
    sync.persistLocal(store.getSnapshot())
    return store.subscribe(() => sync.persistLocal(store.getSnapshot()))
  }, [store])

  // 未登录：监听跨标签变更
  useEffect(() => {
    if (userId) return
    return sync.subscribeCrossTab(patch => {
      store.setState(prev => ({ ...prev, ...patch }))
    })
  }, [userId, store])

  // 登录态变化：拉云端 + 合并本地 → 推回云端
  useEffect(() => {
    if (!userId) {
      sync.resetSyncFlag()
      return
    }
    let cancelled = false
    sync.syncWithRemote().then(merged => {
      if (cancelled) return
      if (merged) store.setState(() => merged)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [userId, store])

  // 页面隐藏 / 卸载时立即冲刷防抖队列，避免刚产生的进度变更丢在 pending 里。
  // pagehide 在移动端比 beforeunload 更可靠；flush 是 best-effort，失败也不影响
  // 本地副本（下次登录 syncWithRemote 会整体合并推回）。
  useEffect(() => {
    if (!userId) return
    const onPageHide = () => { sync.flushNow() }
    window.addEventListener('pagehide', onPageHide)
    return () => window.removeEventListener('pagehide', onPageHide)
  }, [userId])

  // 登录态下订阅 realtime
  useEffect(() => {
    if (!userId) return
    return sync.subscribeRealtime(userId, patch => {
      store.setState(prev => applyRealtimePatch(prev, patch))
    })
  }, [userId, store])

  // actions 引用永久稳定;内部逻辑与旧 useCallback 版本逐字一致,
  // 仅 setState 换成 store.setState(updater 只执行一次,sync.enqueue* 不重复入队)
  const actions = useMemo(() => ({
    toggleFavorite(slug) {
      store.setState(prev => {
        const favorites = new Set(prev.favorites)
        const has = favorites.has(slug)
        has ? favorites.delete(slug) : favorites.add(slug)
        const at = Date.now()  // LWW 时间戳：让"取消收藏"能跨设备传播
        sync.enqueueProgress(slug, {
          favorited: !has,
          completed: prev.completed.has(slug),
          at,
        })
        return { ...prev, favorites, progressMeta: { ...prev.progressMeta, [slug]: at } }
      })
    },
    toggleCompleted(slug) {
      store.setState(prev => {
        const completed = new Set(prev.completed)
        const has = completed.has(slug)
        has ? completed.delete(slug) : completed.add(slug)
        const at = Date.now()
        sync.enqueueProgress(slug, {
          completed: !has,
          favorited: prev.favorites.has(slug),
          at,
        })
        return { ...prev, completed, progressMeta: { ...prev.progressMeta, [slug]: at } }
      })
    },
    recordQuiz(slug, correct, total) {
      if (!slug || typeof correct !== 'number' || typeof total !== 'number' || total <= 0) return
      store.setState(prev => {
        const prior = prev.quizScores[slug]
        const next = {
          attempted: (prior?.attempted || 0) + 1,
          correct: Math.max(prior?.correct || 0, correct),
          total,
          lastAt: Date.now(),
        }
        sync.enqueueQuiz(slug, next)
        return { ...prev, quizScores: { ...prev.quizScores, [slug]: next } }
      })
    },
    async clearAll() {
      store.setState(() => ({ favorites: new Set(), completed: new Set(), quizScores: {}, progressMeta: {} }))
      await sync.clearAll()
    },
  }), [store])

  const value = useMemo(() => ({ store, actions }), [store, actions])

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}

function useProgressContext(hookName) {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error(`${hookName} must be used within ProgressProvider`)
  return ctx
}

/** 完整进度 API(与拆分前完全同形):订阅全部状态,任何进度变化都重渲染。 */
export function useProgress() {
  const { store, actions } = useProgressContext('useProgress')
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot)

  return useMemo(() => {
    const { favorites, completed, quizScores } = state
    const entries = Object.entries(quizScores)
    const totalAttempted = entries.length
    const totalCorrect = entries.reduce((sum, [, s]) => sum + (s.correct || 0), 0)
    const totalQuestions = entries.reduce((sum, [, s]) => sum + (s.total || 0), 0)
    const accuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0
    return {
      favorites,
      completed,
      quizScores,
      isFavorite: (slug) => favorites.has(slug),
      isCompleted: (slug) => completed.has(slug),
      getQuizState: (slug) => {
        const s = quizScores[slug]
        if (!s) return 'unanswered'
        if (s.correct === s.total) return 'perfect'
        return 'partial'
      },
      getQuizScore: (slug) => quizScores[slug] || null,
      quizStats: { totalAttempted, totalCorrect, totalQuestions, accuracy },
      toggleFavorite: actions.toggleFavorite,
      toggleCompleted: actions.toggleCompleted,
      recordQuiz: actions.recordQuiz,
      clearAll: actions.clearAll,
    }
  }, [state, actions])
}

/** 只取 actions(引用永久稳定):进度状态变化时组件零重渲染。适合 Quiz 这类只写不读的消费者。 */
export function useProgressActions() {
  return useProgressContext('useProgressActions').actions
}

/**
 * 精准订阅:仅当 selector 返回值(Object.is 比较)变化时重渲染。
 * ⚠️ selector 只能返回原始值(如 `s => s.favorites.has(slug)`),
 * 返回新建对象/数组会每次都不等 → 失去去抖效果。
 */
export function useProgressSelector(selector) {
  const { store } = useProgressContext('useProgressSelector')
  return useSyncExternalStore(store.subscribe, () => selector(store.getSnapshot()))
}
