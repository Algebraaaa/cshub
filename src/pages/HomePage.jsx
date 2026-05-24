import { useCallback, useEffect, useRef, useState } from 'react'
import HeroSection from '../components/home/HeroSection'
import IntroSection from '../components/home/IntroSection'
import FrameEdgeDecor from '../components/home/FrameEdgeDecor'

// ─────────────────────────────────────────────────────────────
// HomePage · 全屏翻页（fullPage 风格）
//   - 鼠标滚轮 / 触控板 / 方向键 / PgUp·PgDn / 右侧页码圆点 触发翻页
//   - 翻页动画期间锁 800ms，避免连续滚轮触发多次跳页
//   - 连续滚动（trackpad）按 200ms 静默期判定为「同一手势」，只触发一次
// ─────────────────────────────────────────────────────────────

const PAGES = 2
const ANIM_MS = 800
const LOCK_MS = ANIM_MS + 220
const WHEEL_THRESHOLD = 28
const GESTURE_GAP_MS = 220

export default function HomePage() {
  const [page, setPage] = useState(0)
  const containerRef = useRef(null)
  const lockRef = useRef(false)
  const accumRef = useRef(0)
  const lastWheelRef = useRef(0)
  const pageRef = useRef(0)
  const touchStartRef = useRef(0)
  useEffect(() => { pageRef.current = page }, [page])

  const goTo = useCallback((next) => {
    if (lockRef.current) return
    const target = Math.max(0, Math.min(PAGES - 1, next))
    setPage(prev => {
      if (prev === target) return prev
      lockRef.current = true
      setTimeout(() => { lockRef.current = false }, LOCK_MS)
      return target
    })
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (e) => {
      e.preventDefault()
      const now = Date.now()
      if (now - lastWheelRef.current > GESTURE_GAP_MS) accumRef.current = 0
      lastWheelRef.current = now

      if (lockRef.current) return
      accumRef.current += e.deltaY
      if (Math.abs(accumRef.current) < WHEEL_THRESHOLD) return

      const dir = accumRef.current > 0 ? 1 : -1
      accumRef.current = 0
      goTo(pageRef.current + dir)
    }

    const onKey = (e) => {
      const k = e.key
      if (k === 'ArrowDown' || k === 'PageDown' || k === ' ') {
        e.preventDefault()
        goTo(pageRef.current + 1)
      } else if (k === 'ArrowUp' || k === 'PageUp') {
        e.preventDefault()
        goTo(pageRef.current - 1)
      } else if (k === 'Home') {
        e.preventDefault()
        goTo(0)
      } else if (k === 'End') {
        e.preventDefault()
        goTo(PAGES - 1)
      }
    }

    const onTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientY
    }

    const onTouchEnd = (e) => {
      if (lockRef.current) return
      const deltaY = touchStartRef.current - e.changedTouches[0].clientY
      if (Math.abs(deltaY) < 40) return
      goTo(pageRef.current + (deltaY > 0 ? 1 : -1))
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }
  }, [goTo])

  return (
    <div
      ref={containerRef}
      className="home-unified-page home-snap-pager"
      style={{ height: '100vh', minHeight: '100vh', paddingBottom: 0 }}
    >
      <div
        className="home-snap-track"
        style={{
          position: 'relative',
          width: '100%',
          height: `${PAGES * 100}vh`,
          transform: `translate3d(0, -${page * 100}vh, 0)`,
          transition: `transform ${ANIM_MS}ms cubic-bezier(0.86, 0, 0.07, 1)`,
          willChange: 'transform',
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
          <FrameEdgeDecor />
          <HeroSection onScrollDown={() => goTo(1)} />
        </div>
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
          <IntroSection />
        </div>
      </div>
      <PageDots count={PAGES} active={page} onSelect={goTo} />
    </div>
  )
}

function PageDots({ count, active, onSelect }) {
  return (
    <div
      aria-label="页面导航"
      style={{
        position: 'fixed',
        right: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 40,
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active
        return (
          <button
            key={i}
            type="button"
            aria-label={`跳到第 ${i + 1} 屏`}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => onSelect(i)}
            style={{
              width: isActive ? 12 : 10,
              height: isActive ? 12 : 10,
              padding: 0,
              borderRadius: 999,
              border: '1.5px solid var(--text-secondary)',
              background: isActive
                ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                : 'transparent',
              borderColor: isActive ? 'transparent' : 'var(--text-tertiary)',
              boxShadow: isActive ? '0 6px 18px rgba(168,85,247,0.45)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          />
        )
      })}
    </div>
  )
}
