import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as LocalStore from '../services/storage/LocalStore.js'
import * as RemoteStore from '../services/storage/RemoteStore.js'
import { createSyncService } from '../services/storage/SyncService.js'
import { useAuth } from './AuthContext'

const ProgressContext = createContext(null)

// SyncService 持有 debounce 队列与同步标志，整个 App 共享一个实例即可。
// 它通过 getUserId() 闭包动态读取当前用户，避免随 userId 重建。
let _userIdRef = { current: null }
const sync = createSyncService({
  local: LocalStore,
  remote: RemoteStore,
  getUserId: () => _userIdRef.current,
})

function applyRealtimePatch(prev, patch) {
  if (patch.progress) {
    const { slug, favorited, completed } = patch.progress
    const favorites = new Set(prev.favorites)
    const completedSet = new Set(prev.completed)
    if (patch.event === 'DELETE') {
      favorites.delete(slug)
      completedSet.delete(slug)
    } else {
      favorited ? favorites.add(slug) : favorites.delete(slug)
      completed ? completedSet.add(slug) : completedSet.delete(slug)
    }
    return { ...prev, favorites, completed: completedSet }
  }
  if (patch.quiz) {
    const { slug, ...score } = patch.quiz
    return { ...prev, quizScores: { ...prev.quizScores, [slug]: score } }
  }
  return prev
}

export function ProgressProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id

  // 保持最新 userId 给 SyncService 闭包读取
  useEffect(() => {
    _userIdRef.current = userId || null
  }, [userId])

  const [state, setState] = useState(() => sync.initial())

  // 始终镜像到 localStorage（即使登录，离线也能用）
  useEffect(() => {
    sync.persistLocal(state)
  }, [state])

  // 未登录：监听跨标签变更
  useEffect(() => {
    if (userId) return
    return sync.subscribeCrossTab(patch => {
      setState(prev => ({ ...prev, ...patch }))
    })
  }, [userId])

  // 登录态变化：拉云端 + 合并本地 → 推回云端
  useEffect(() => {
    if (!userId) {
      sync.resetSyncFlag()
      return
    }
    let cancelled = false
    sync.syncWithRemote().then(merged => {
      if (cancelled) return
      if (merged) setState(merged)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [userId])

  // 登录态下订阅 realtime
  useEffect(() => {
    if (!userId) return
    return sync.subscribeRealtime(userId, patch => {
      setState(prev => applyRealtimePatch(prev, patch))
    })
  }, [userId])

  const toggleFavorite = useCallback((slug) => {
    setState(prev => {
      const favorites = new Set(prev.favorites)
      const has = favorites.has(slug)
      has ? favorites.delete(slug) : favorites.add(slug)
      sync.enqueueProgress(slug, {
        favorited: !has,
        completed: prev.completed.has(slug),
      })
      return { ...prev, favorites }
    })
  }, [])

  const toggleCompleted = useCallback((slug) => {
    setState(prev => {
      const completed = new Set(prev.completed)
      const has = completed.has(slug)
      has ? completed.delete(slug) : completed.add(slug)
      sync.enqueueProgress(slug, {
        completed: !has,
        favorited: prev.favorites.has(slug),
      })
      return { ...prev, completed }
    })
  }, [])

  const recordQuiz = useCallback((slug, correct, total) => {
    if (!slug || typeof correct !== 'number' || typeof total !== 'number' || total <= 0) return
    setState(prev => {
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
  }, [])

  const clearAll = useCallback(async () => {
    setState({ favorites: new Set(), completed: new Set(), quizScores: {} })
    await sync.clearAll()
  }, [])

  const value = useMemo(() => {
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
      toggleFavorite,
      toggleCompleted,
      recordQuiz,
      clearAll,
    }
  }, [state, toggleFavorite, toggleCompleted, recordQuiz, clearAll])

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
