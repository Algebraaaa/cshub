import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getSupabase, hasSupabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useProgress } from './ProgressContext'
import { ACHIEVEMENTS, ACHIEVEMENT_LIST, evaluateAchievements } from '../data/achievements'

const AchievementsContext = createContext(null)

const STREAK_KEY = 'algoviz-streak'
const ACHIEVEMENTS_KEY = 'algoviz-achievements'

function loadStreak() {
  if (typeof window === 'undefined') return { currentStreak: 0, longestStreak: 0, lastActiveDate: null }
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) return { currentStreak: 0, longestStreak: 0, lastActiveDate: null }
    return JSON.parse(raw)
  } catch { return { currentStreak: 0, longestStreak: 0, lastActiveDate: null } }
}

function saveStreak(s) {
  try { localStorage.setItem(STREAK_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

function loadAchSet() {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return new Set(Array.isArray(arr) ? arr : [])
  } catch { return new Set() }
}

function saveAchSet(set) {
  try { localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify([...set])) } catch { /* ignore */ }
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysBetween(a, b) {
  if (!a || !b) return Infinity
  const d1 = new Date(a + 'T00:00:00')
  const d2 = new Date(b + 'T00:00:00')
  return Math.round((d2 - d1) / 86400000)
}

export function AchievementsProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id
  const { completed, favorites, quizScores } = useProgress()
  const [streak, setStreak] = useState(() => loadStreak())
  const [unlocked, setUnlocked] = useState(() => loadAchSet())
  const [newlyUnlocked, setNewlyUnlocked] = useState([]) // toast queue
  const [subjectStats, setSubjectStats] = useState({})
  const [totalAlgorithms, setTotalAlgorithms] = useState(0)
  const skipNextEvalRef = useRef(true)
  // 镜像当前 unlocked 到 ref，供 achievement 评估定时器同步读取，
  // 避免把 unlocked 加入 effect deps（会造成无限循环）
  const unlockedRef = useRef(unlocked)

  // 镜像到 localStorage
  useEffect(() => { saveStreak(streak) }, [streak])
  useEffect(() => {
    unlockedRef.current = unlocked
    saveAchSet(unlocked)
  }, [unlocked])

  // ─── 拉云端 streak/achievements ──
  useEffect(() => {
    if (!hasSupabase || !userId) return
    let cancelled = false
    ;(async () => {
      const client = await getSupabase()
      if (!client) return
      const [streakRes, achRes] = await Promise.all([
        client.from('user_streaks').select('*').eq('user_id', userId).maybeSingle(),
        client.from('user_achievements').select('achievement_id').eq('user_id', userId),
      ])
      if (cancelled) return
      if (streakRes.data) {
        setStreak(prev => {
          // 取较新者
          const remote = {
            currentStreak: streakRes.data.current_streak || 0,
            longestStreak: streakRes.data.longest_streak || 0,
            lastActiveDate: streakRes.data.last_active_date || null,
          }
          if (!prev.lastActiveDate) return remote
          if (!remote.lastActiveDate) return prev
          return remote.lastActiveDate > prev.lastActiveDate ? remote : {
            ...prev,
            longestStreak: Math.max(prev.longestStreak, remote.longestStreak),
          }
        })
      }
      if (achRes.data) {
        setUnlocked(prev => {
          const next = new Set(prev)
          for (const row of achRes.data) next.add(row.achievement_id)
          return next
        })
      }
    })()
    return () => { cancelled = true }
  }, [userId])

  // ─── 触发打卡 ──
  const ping = useCallback(() => {
    setStreak(prev => {
      const today = todayStr()
      if (prev.lastActiveDate === today) return prev
      const gap = daysBetween(prev.lastActiveDate, today)
      const nextCurrent = gap === 1 ? (prev.currentStreak || 0) + 1 : 1
      const nextLongest = Math.max(prev.longestStreak || 0, nextCurrent)
      const next = { currentStreak: nextCurrent, longestStreak: nextLongest, lastActiveDate: today }
      if (hasSupabase && userId) {
        getSupabase().then(client => client?.from('user_streaks').upsert({
            user_id: userId,
            current_streak: next.currentStreak,
            longest_streak: next.longestStreak,
            last_active_date: next.lastActiveDate,
          }, { onConflict: 'user_id' }))
      }
      return next
    })
  }, [userId])

  // ─── 计算 subjectStats（依赖 completed；动态加载轻量索引，避免塞进首屏入口）──
  useEffect(() => {
    let cancelled = false
    Promise.all([
      import('../data/subjects'),
      import('../data/algorithmMeta'),
    ]).then(([subjects, meta]) => {
      if (cancelled) return
      const out = {}
      for (const s of subjects.SUBJECT_LIST) out[s.id] = subjects.getSubjectStats(s.id, completed)
      setSubjectStats(out)
      setTotalAlgorithms(meta.ALGORITHM_LIBRARY_LIST.length)
    })
    return () => { cancelled = true }
  }, [completed])

  // ─── 自动评徽章（初始立即评，后续 300ms debounce 合并连续变更）──
  // 规则：state updater 函数必须是纯函数（React 并发模式可能多次调用）。
  // 所有 side-effect（setNewlyUnlocked / Supabase upsert）放在 updater 外部，
  // 通过 unlockedRef 同步读取当前值来计算 diff，避免把 unlocked 加入 deps。
  useEffect(() => {
    if (skipNextEvalRef.current) {
      skipNextEvalRef.current = false
      const initial = evaluateAchievements({
        completed, favorites, quizScores, streak, subjectStats, totalAlgorithms,
      })
      setUnlocked(prev => new Set([...prev, ...initial]))
      return
    }

    const timer = setTimeout(() => {
      const next = evaluateAchievements({
        completed, favorites, quizScores, streak, subjectStats, totalAlgorithms,
      })

      // 用 ref 同步读取当前已解锁集合，计算本次新增 —— 不在 updater 内部做
      const fresh = [...next].filter(id => !unlockedRef.current.has(id))
      if (fresh.length === 0) return

      // 1. 更新解锁集合（pure updater，无 side effects）
      setUnlocked(prev => new Set([...prev, ...fresh]))

      // 2. 显示 toast（独立 setState，不嵌套在其他 updater 内）
      setNewlyUnlocked(q => [...q, ...fresh.map(id => ACHIEVEMENTS[id]).filter(Boolean)])

      // 3. 云端持久化（异步 side-effect，在 updater 外部执行）
      if (hasSupabase && userId) {
        for (const id of fresh) {
          getSupabase().then(client => client?.from('user_achievements').upsert({
            user_id: userId,
            achievement_id: id,
            unlocked_at: new Date().toISOString(),
          }, { onConflict: 'user_id,achievement_id' }))
        }
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [completed, favorites, quizScores, streak, subjectStats, totalAlgorithms, userId])

  const dismissToast = useCallback((id) => {
    setNewlyUnlocked(q => q.filter(a => a.id !== id))
  }, [])

  const value = useMemo(() => ({
    streak,
    unlocked,
    achievementList: ACHIEVEMENT_LIST,
    subjectStats,
    newlyUnlocked,
    dismissToast,
    ping,
  }), [streak, unlocked, subjectStats, newlyUnlocked, dismissToast, ping])

  return (
    <AchievementsContext.Provider value={value}>
      {children}
      <AchievementToasts toasts={newlyUnlocked} onDismiss={dismissToast} />
    </AchievementsContext.Provider>
  )
}

function AchievementToasts({ toasts, onDismiss }) {
  useEffect(() => {
    if (toasts.length === 0) return
    const t = setTimeout(() => onDismiss(toasts[0].id), 4500)
    return () => clearTimeout(t)
  }, [toasts, onDismiss])

  if (toasts.length === 0) return null
  return (
    <div style={{
      position: 'fixed',
      right: 24,
      bottom: 24,
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.slice(0, 3).map(a => (
        <div key={a.id}
          onClick={() => onDismiss(a.id)}
          style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px',
            background: 'var(--bg-elev)',
            border: `1px solid ${a.color}55`,
            borderRadius: 14,
            boxShadow: `0 12px 32px ${a.color}33, var(--shadow-lg)`,
            cursor: 'pointer',
            minWidth: 260,
            animation: 'paletteIn 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: `${a.color}22`, color: a.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>{a.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: a.color, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              徽章解锁
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{a.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{a.desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function useAchievements() {
  const ctx = useContext(AchievementsContext)
  if (!ctx) throw new Error('useAchievements must be used within AchievementsProvider')
  return ctx
}
