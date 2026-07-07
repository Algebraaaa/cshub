import { useCallback, useEffect, useMemo, useState } from 'react'

const key = (courseId) => `algoviz-course-${courseId}`

function load(courseId) {
  try {
    const raw = localStorage.getItem(key(courseId))
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return new Set(Array.isArray(arr) ? arr : [])
  } catch { return new Set() }
}

function save(courseId, set) {
  try { localStorage.setItem(key(courseId), JSON.stringify([...set])) } catch { /* ignore */ }
}

export function useCourseProgress(courseId, totalLessons = 0) {
  const [completed, setCompleted] = useState(() => load(courseId))

  // Cross-tab sync: listen for localStorage changes from other tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key(courseId)) {
        setCompleted(load(courseId))
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [courseId])

  const markComplete = useCallback((lessonId) => {
    setCompleted(prev => {
      if (prev.has(lessonId)) return prev
      const next = new Set(prev)
      next.add(lessonId)
      save(courseId, next)
      return next
    })
  }, [courseId])

  const isCompleted = useCallback((lessonId) => completed.has(lessonId), [completed])

  const progress = useMemo(() => ({
    count: completed.size,
    total: totalLessons,
    pct: totalLessons > 0 ? Math.round((completed.size / totalLessons) * 100) : 0,
  }), [completed, totalLessons])

  return { completed, markComplete, isCompleted, progress }
}
