import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AI_CURRICULUM, AI_TOTAL_LESSONS } from '../data/ai/curriculum'
import { useCourseProgress } from '../features/music/hooks/useCourseProgress'

const LEFT_FORMULAS = [
  'θ ← θ - α ∇_θ J(θ)',
  'J(θ) = 1/(2m) Σᵢ (h_θ(xᵢ) - yᵢ)²',
  'σ(x) = 1 / (1 + e^{-x})',
  'ReLU(x) = max(0, x)',
]

const RIGHT_FORMULAS = [
  'Attention(Q,K,V) = softmax(QKᵀ / √dₖ) V',
  'softmax(z)ᵢ = e^{zᵢ} / Σⱼ e^{zⱼ}',
  'L = -Σᵢ yᵢ log(pᵢ)',
  '∂L/∂W = (∂L/∂z) aᵀ',
]

const AI_SNAP_PAGES = 2
const AI_SLIDE_MS = 820
const AI_LOCK_MS = AI_SLIDE_MS + 180
const AI_WHEEL_THRESHOLD = 30
const AI_GESTURE_GAP_MS = 220

const PARTICLES = [
  ['7%', '16%', 2, '#f8cfe9', 0.42, '0s', '7.2s'], ['10%', '52%', 3, '#c4b5fd', 0.5, '1.1s', '8.4s'],
  ['12%', '82%', 1, '#fde68a', 0.38, '2.2s', '6.8s'], ['16%', '28%', 4, '#f0abfc', 0.45, '0.7s', '9s'],
  ['19%', '68%', 2, '#dbeafe', 0.48, '1.8s', '7.6s'], ['23%', '12%', 1, '#fdf2f8', 0.55, '3.1s', '8.8s'],
  ['25%', '76%', 3, '#e9d5ff', 0.34, '2.6s', '7.4s'], ['29%', '38%', 2, '#f9a8d4', 0.46, '0.4s', '8.2s'],
  ['32%', '18%', 1, '#bfdbfe', 0.36, '1.4s', '6.9s'], ['35%', '86%', 2, '#fff7ed', 0.42, '2.9s', '8.7s'],
  ['39%', '25%', 3, '#f5d0fe', 0.32, '0.9s', '9.2s'], ['42%', '64%', 1, '#c7d2fe', 0.5, '3.7s', '7.1s'],
  ['46%', '14%', 2, '#fbcfe8', 0.36, '1.7s', '8.5s'], ['49%', '74%', 4, '#ddd6fe', 0.3, '2.4s', '9.6s'],
  ['52%', '30%', 1, '#fef3c7', 0.46, '0.6s', '6.6s'], ['55%', '88%', 2, '#f8cfe9', 0.34, '1.9s', '8.1s'],
  ['59%', '18%', 3, '#c4b5fd', 0.39, '2.8s', '9.3s'], ['62%', '60%', 1, '#e0f2fe', 0.5, '0.3s', '7.8s'],
  ['65%', '78%', 2, '#f0abfc', 0.36, '1.5s', '8.9s'], ['68%', '34%', 4, '#fdf2f8', 0.28, '3.4s', '10s'],
  ['71%', '12%', 1, '#fde68a', 0.45, '0.8s', '7.3s'], ['73%', '70%', 2, '#d8b4fe', 0.42, '2.1s', '8.6s'],
  ['76%', '24%', 3, '#f9a8d4', 0.34, '1.2s', '9.1s'], ['79%', '84%', 1, '#dbeafe', 0.5, '2.7s', '6.7s'],
  ['82%', '44%', 2, '#fff7ed', 0.38, '0.1s', '8.3s'], ['85%', '18%', 3, '#f5d0fe', 0.44, '1.6s', '9.4s'],
  ['87%', '63%', 1, '#bfdbfe', 0.46, '3.2s', '7.7s'], ['90%', '35%', 4, '#fbcfe8', 0.32, '2.5s', '10.2s'],
  ['92%', '76%', 2, '#e9d5ff', 0.4, '0.5s', '8s'], ['94%', '12%', 1, '#fef3c7', 0.48, '3.8s', '7s'],
  ['14%', '43%', 1, '#f8cfe9', 0.3, '4.1s', '9.5s'], ['21%', '90%', 2, '#c7d2fe', 0.34, '4.4s', '8.4s'],
  ['31%', '58%', 1, '#fde68a', 0.28, '4.7s', '7.9s'], ['57%', '44%', 2, '#f9a8d4', 0.26, '5s', '9.8s'],
  ['69%', '92%', 1, '#fdf2f8', 0.34, '5.4s', '7.2s'], ['88%', '52%', 2, '#dbeafe', 0.3, '5.9s', '8.6s'],
]

export default function AIPage() {
  const { progress, isCompleted } = useCourseProgress(AI_CURRICULUM.id, AI_TOTAL_LESSONS)
  const [snapPage, setSnapPage] = useState(0)
  const rootRef = useRef(null)
  const chaptersScrollRef = useRef(null)
  const lockRef = useRef(false)
  const accumRef = useRef(0)
  const lastWheelRef = useRef(0)
  const pageRef = useRef(0)
  const touchStartRef = useRef(0)

  const firstLesson = AI_CURRICULUM.chapters[0].lessons[0]
  const nextLesson = findNextLesson(AI_CURRICULUM, isCompleted)

  useEffect(() => {
    pageRef.current = snapPage
  }, [snapPage])

  const goToSnapPage = useCallback((next) => {
    if (lockRef.current) return
    const target = Math.max(0, Math.min(AI_SNAP_PAGES - 1, next))
    setSnapPage(prev => {
      if (prev === target) return prev
      lockRef.current = true
      if (target === 0 && chaptersScrollRef.current) {
        chaptersScrollRef.current.scrollTop = 0
      }
      window.setTimeout(() => {
        lockRef.current = false
      }, AI_LOCK_MS)
      return target
    })
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const onWheel = (event) => {
      event.preventDefault()
      const now = Date.now()
      if (now - lastWheelRef.current > AI_GESTURE_GAP_MS) accumRef.current = 0
      lastWheelRef.current = now
      if (lockRef.current) return

      if (pageRef.current === 1) {
        const inner = chaptersScrollRef.current
        if (inner) {
          const canScrollDown = inner.scrollTop < inner.scrollHeight - inner.clientHeight - 1
          const canScrollUp = inner.scrollTop > 1
          if ((event.deltaY > 0 && canScrollDown) || (event.deltaY < 0 && canScrollUp)) {
            inner.scrollTop += event.deltaY
            return
          }
        }
      }

      accumRef.current += event.deltaY
      if (Math.abs(accumRef.current) < AI_WHEEL_THRESHOLD) return
      const direction = accumRef.current > 0 ? 1 : -1
      accumRef.current = 0
      goToSnapPage(pageRef.current + direction)
    }

    const onTouchStart = (event) => {
      touchStartRef.current = event.touches[0].clientY
    }

    const onTouchEnd = (event) => {
      if (lockRef.current) return
      const deltaY = touchStartRef.current - event.changedTouches[0].clientY
      if (Math.abs(deltaY) < 42) return

      if (pageRef.current === 1) {
        const inner = chaptersScrollRef.current
        if (inner) {
          const canScrollDown = inner.scrollTop < inner.scrollHeight - inner.clientHeight - 1
          const canScrollUp = inner.scrollTop > 1
          if ((deltaY > 0 && canScrollDown) || (deltaY < 0 && canScrollUp)) return
        }
      }

      goToSnapPage(pageRef.current + (deltaY > 0 ? 1 : -1))
    }

    const onKeyDown = (event) => {
      const keys = ['ArrowDown', 'PageDown', ' ', 'ArrowUp', 'PageUp', 'Home', 'End']
      if (!keys.includes(event.key)) return
      event.preventDefault()
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
        goToSnapPage(pageRef.current + 1)
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        goToSnapPage(pageRef.current - 1)
      } else if (event.key === 'Home') {
        goToSnapPage(0)
      } else if (event.key === 'End') {
        goToSnapPage(AI_SNAP_PAGES - 1)
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKeyDown)

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [goToSnapPage])

  return (
    <div ref={rootRef} className="ai-course-snap-root">
      <div
        className="ai-course-snap-track"
        style={{
          transform: `translate3d(0, -${snapPage * 100}%, 0)`,
          transition: `transform ${AI_SLIDE_MS}ms cubic-bezier(0.86, 0, 0.07, 1)`,
        }}
      >
        <div className="ai-course-snap-page">
          <AIHero
            progress={progress}
            firstLesson={firstLesson}
            nextLesson={nextLesson}
            onScrollDown={() => goToSnapPage(1)}
          />
        </div>

        <div className="ai-course-snap-page">
          {/* Chapters */}
          <div
            ref={chaptersScrollRef}
            id="ai-course-chapters"
            className="ai-course-chapters-scroll px-6 py-14"
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              {AI_CURRICULUM.chapters.map((chapter, ci) => {
                const chapterDone = chapter.lessons.filter(l => isCompleted(l.id)).length
                return (
                  <section key={chapter.id} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-0.5">
                          第 {ci + 1} 章
                        </div>
                        <h2 className="text-lg font-bold text-fg">{chapter.title}</h2>
                      </div>
                      <span className="text-xs text-fg-faint font-mono">
                        {chapterDone}/{chapter.lessons.length}
                      </span>
                    </div>

                    <ul className="flex flex-col gap-1">
                      {chapter.lessons.map((lesson, li) => {
                        const done = isCompleted(lesson.id)
                        return (
                          <li key={lesson.id}>
                            <Link
                              to={`/ai-course/lesson/${lesson.id}`}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors group"
                            >
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-colors"
                                style={{
                                  background: done ? '#8b5cf622' : 'var(--surface)',
                                  color: done ? '#8b5cf6' : 'var(--text-tertiary)',
                                  border: `1px solid ${done ? '#8b5cf644' : 'var(--border)'}`,
                                }}
                              >
                                {done ? '✓' : `${ci + 1}.${li + 1}`}
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-fg group-hover:text-accent transition-colors">
                                  {lesson.title}
                                </span>
                                {lesson.summary && (
                                  <span className="block text-xs text-fg-faint truncate mt-0.5">
                                    {lesson.summary}
                                  </span>
                                )}
                              </span>
                              {lesson.exercise && (
                                <span className="text-xs text-fg-faint flex-shrink-0">🎮</span>
                              )}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="ai-course-snap-dots" aria-label="页面导航">
        {Array.from({ length: AI_SNAP_PAGES }).map((_, index) => {
          const isActive = index === snapPage
          return (
            <button
              key={index}
              type="button"
              aria-label={`跳到第 ${index + 1} 屏`}
              aria-current={isActive ? 'true' : undefined}
              className={isActive ? 'is-active' : undefined}
              onClick={() => goToSnapPage(index)}
            />
          )
        })}
      </div>
    </div>
  )
}

function AIHero({ progress, firstLesson, nextLesson, onScrollDown }) {
  const startLabel = progress.count === 0 ? '开始系统学习' : '继续系统学习'

  return (
    <section className="ai-course-hero relative h-full min-h-full overflow-hidden px-6 text-center">
      <HeroStyles />
      <div className="ai-course-hero-bg" aria-hidden="true" />
      <div className="ai-course-grid" aria-hidden="true" />
      <div className="ai-course-glow ai-course-glow-main" aria-hidden="true" />
      <div className="ai-course-glow ai-course-glow-side" aria-hidden="true" />
      <ScanLights />
      <FormulaWall side="left" formulas={LEFT_FORMULAS} />
      <FormulaWall side="right" formulas={RIGHT_FORMULAS} />
      <ParticleField />
      <HeroTrajectories />

      <div className="relative z-10 mx-auto flex min-h-full max-w-5xl flex-col items-center justify-center pb-20 pt-24">
        <div
          className="ai-hero-kicker text-[10px] font-bold uppercase text-[#f4b8df]/70"
          style={{ animationDelay: '0.08s' }}
        >
          PROFESSIONAL CURRICULUM · 30+ INTERACTIVE VISUALIZATIONS
        </div>

        <h1 className="ai-hero-title mt-8 flex flex-col items-center leading-none" style={{ animationDelay: '0.32s' }}>
          <span className="ai-hero-title-ai">AI</span>
          <span className="ai-hero-title-cn">专业课</span>
        </h1>

        <p className="ai-hero-copy mt-8 text-[20px] leading-[2.05] text-[#f8dbc2]/88 sm:text-[23px]" style={{ animationDelay: '0.64s' }}>
          从优化理论到大语言模型。<br />
          用可视化真正理解现代人工智能。
        </p>

        <div className="ai-hero-progress mt-9 w-full max-w-[680px]" style={{ animationDelay: '0.9s' }}>
          <div className="ai-hero-progress-meta mb-2 flex items-center justify-between text-xs font-semibold text-[#f8cfe9]/70">
            <span>学习进度</span>
            <span>{progress.count} / {progress.total}</span>
          </div>
          <div className="ai-hero-progress-track h-2 overflow-hidden rounded-full border border-white/10 bg-black/35 shadow-[inset_0_1px_10px_rgba(0,0,0,0.55)]">
            <div
              className="ai-hero-progress-bar h-full rounded-full bg-gradient-to-r from-[#d946ef] via-[#f472b6] to-[#fb7185] shadow-[0_0_22px_rgba(244,114,182,0.55)] transition-all duration-500"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </div>

        <div className="ai-hero-actions mt-8 flex flex-wrap justify-center gap-4" style={{ animationDelay: '1.08s' }}>
          <Link
            to={`/ai-course/lesson/${nextLesson.id}`}
            className="ai-hero-primary inline-flex items-center justify-center rounded-2xl px-8 py-4 text-sm font-extrabold text-white"
          >
            {startLabel} →
          </Link>
          <Link
            to={`/ai-course/lesson/${firstLesson.id}`}
            className="ai-hero-secondary inline-flex items-center justify-center rounded-2xl px-7 py-4 text-sm font-bold text-[#f7d9ee]"
          >
            从第一课开始
          </Link>
        </div>
      </div>

      <button
        type="button"
        className="ai-hero-scroll absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-[#f4b8df]/70"
        onClick={onScrollDown}
      >
        <span>Scroll</span>
        <span aria-hidden="true">↓</span>
      </button>
    </section>
  )
}

function FormulaWall({ side, formulas }) {
  return (
    <div className={`ai-formula-wall ai-formula-wall-${side} hidden lg:block`} aria-hidden="true">
      {formulas.map((formula, index) => (
        <div
          key={formula}
          className="ai-formula"
          style={{
            animationDelay: `${index * 0.7}s`,
            animationDuration: `${8.8 + index * 0.7}s`,
            '--formula-offset': `${index % 2 === 0 ? 0 : 18}px`,
            '--formula-rotate': `${side === 'left' ? -3 : 3}deg`,
            '--formula-x-start': side === 'left' ? '-8px' : '8px',
            '--formula-x-end': side === 'left' ? '8px' : '-8px',
          }}
        >
          {formula}
        </div>
      ))}
    </div>
  )
}

function ParticleField() {
  return (
    <div className="ai-particles" aria-hidden="true">
      {PARTICLES.map(([left, top, size, color, opacity, delay, duration], index) => (
        <span
          key={index}
          className={index > 27 ? 'ai-particle-extra' : undefined}
          style={{
            left,
            top,
            width: size,
            height: size,
            background: color,
            opacity,
            animationDelay: delay,
            animationDuration: duration,
            '--particle-opacity': opacity,
            '--particle-x': index % 3 === 0 ? '10px' : index % 3 === 1 ? '-7px' : '5px',
            '--particle-y': index % 4 === 0 ? '-22px' : index % 4 === 1 ? '-15px' : '-18px',
            boxShadow: `0 0 ${8 + size * 4}px ${color}`,
          }}
        />
      ))}
    </div>
  )
}

function ScanLights() {
  return (
    <div className="ai-scan-lights" aria-hidden="true">
      <div className="ai-scan ai-scan-diagonal" />
      <div className="ai-scan ai-scan-horizontal" />
    </div>
  )
}

function HeroTrajectories() {
  return (
    <svg className="ai-hero-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M4 72 C 22 54, 36 86, 54 61 S 78 35, 96 52" />
      <path d="M7 34 C 28 17, 41 42, 62 28 S 84 10, 96 23" />
      <path d="M16 90 C 35 74, 58 76, 86 64" />
      <path d="M1 56 C 18 42, 30 46, 45 34 S 75 17, 99 30" />
      <path d="M10 18 C 31 35, 48 10, 67 24 S 86 47, 99 38" />
      <path d="M2 86 C 24 70, 46 94, 69 78 S 88 58, 99 66" />
    </svg>
  )
}

function HeroStyles() {
  return (
    <style>{`
      .ai-course-snap-root {
        position: relative;
        height: calc(100dvh - 56px);
        min-height: 720px;
        overflow: hidden;
        isolation: isolate;
      }

      .ai-course-snap-track {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
        will-change: transform;
      }

      .ai-course-snap-page {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .ai-course-chapters-scroll {
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: rgba(216, 180, 254, 0.28) transparent;
        background:
          radial-gradient(circle at 20% 10%, rgba(168, 85, 247, 0.12), transparent 28%),
          radial-gradient(circle at 78% 20%, rgba(244, 114, 182, 0.08), transparent 30%),
          linear-gradient(180deg, rgba(8, 7, 19, 0.92), rgba(10, 8, 24, 0.98));
      }

      .ai-course-chapters-scroll::-webkit-scrollbar {
        width: 8px;
      }

      .ai-course-chapters-scroll::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: rgba(216, 180, 254, 0.28);
      }

      .ai-course-chapters-scroll .glass-card {
        animation: aiChapterRise 0.72s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .ai-course-chapters-scroll .glass-card:nth-child(2) { animation-delay: 0.06s; }
      .ai-course-chapters-scroll .glass-card:nth-child(3) { animation-delay: 0.12s; }
      .ai-course-chapters-scroll .glass-card:nth-child(4) { animation-delay: 0.18s; }
      .ai-course-chapters-scroll .glass-card:nth-child(5) { animation-delay: 0.24s; }
      .ai-course-chapters-scroll .glass-card:nth-child(6) { animation-delay: 0.3s; }

      .ai-course-snap-dots {
        position: absolute;
        right: clamp(14px, 2.3vw, 28px);
        top: 50%;
        z-index: 40;
        display: flex;
        flex-direction: column;
        gap: 12px;
        transform: translateY(-50%);
      }

      .ai-course-snap-dots button {
        width: 10px;
        height: 10px;
        padding: 0;
        border-radius: 999px;
        border: 1.5px solid rgba(248, 207, 233, 0.44);
        background: rgba(8, 7, 19, 0.34);
        box-shadow: 0 0 14px rgba(168, 85, 247, 0);
        cursor: pointer;
        transition: all 0.25s ease;
      }

      .ai-course-snap-dots button.is-active {
        width: 12px;
        height: 12px;
        border-color: transparent;
        background: linear-gradient(135deg, #d946ef, #f472b6);
        box-shadow: 0 0 18px rgba(244, 114, 182, 0.48);
      }

      .ai-course-hero {
        background:
          radial-gradient(circle at 50% 34%, rgba(168, 85, 247, 0.22), transparent 34%),
          radial-gradient(circle at 24% 22%, rgba(236, 72, 153, 0.16), transparent 28%),
          radial-gradient(circle at 78% 18%, rgba(129, 140, 248, 0.16), transparent 30%),
          linear-gradient(180deg, #080713 0%, #0c0818 48%, #070610 100%);
        color: white;
        isolation: isolate;
      }

      .ai-course-hero-bg {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 50% 44%, rgba(255,255,255,0.06), transparent 18%),
          radial-gradient(circle at 50% 108%, rgba(244,114,182,0.11), transparent 30%);
        pointer-events: none;
      }

      .ai-course-grid {
        position: absolute;
        inset: 0;
        opacity: 0.22;
        background-image:
          linear-gradient(rgba(255, 215, 238, 0.11) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 215, 238, 0.11) 1px, transparent 1px);
        background-size: 42px 42px;
        mask-image: radial-gradient(ellipse at center, black 0%, black 54%, transparent 86%);
        -webkit-mask-image: radial-gradient(ellipse at center, black 0%, black 54%, transparent 86%);
      }

      .ai-course-glow {
        position: absolute;
        border-radius: 999px;
        filter: blur(72px);
        opacity: 0.55;
        mix-blend-mode: screen;
        animation: glowBreath 6.4s ease-in-out infinite;
        pointer-events: none;
      }

      .ai-course-glow-main {
        width: 620px;
        height: 620px;
        left: calc(50% - 310px);
        top: 14%;
        background:
          radial-gradient(circle, rgba(244, 114, 182, 0.12), rgba(168, 85, 247, 0.08) 46%, transparent 72%);
      }

      .ai-course-glow-side {
        width: 360px;
        height: 360px;
        right: 8%;
        bottom: 7%;
        background: rgba(96, 165, 250, 0.1);
        animation-delay: 1.2s;
      }

      .ai-scan-lights {
        position: absolute;
        inset: -18%;
        z-index: 1;
        overflow: hidden;
        pointer-events: none;
      }

      .ai-scan {
        position: absolute;
        left: -12%;
        width: 128%;
        opacity: 0;
        filter: blur(8px);
        mix-blend-mode: screen;
        transform: translateX(-30%) rotate(var(--scan-rotate, 0deg));
        animation: scanLine 8s ease-in-out infinite;
      }

      .ai-scan-diagonal {
        --scan-rotate: -14deg;
        bottom: 24%;
        height: 3px;
        background: linear-gradient(90deg, transparent 0%, rgba(147, 197, 253, 0.08) 34%, rgba(244, 114, 182, 0.28) 50%, rgba(168, 85, 247, 0.1) 66%, transparent 100%);
      }

      .ai-scan-horizontal {
        --scan-rotate: 0deg;
        top: 36%;
        height: 2px;
        background: linear-gradient(90deg, transparent 0%, rgba(216, 180, 254, 0.1) 36%, rgba(236, 171, 255, 0.24) 52%, rgba(96, 165, 250, 0.1) 68%, transparent 100%);
        animation-delay: 3.2s;
        animation-duration: 10.5s;
      }

      .ai-formula-wall {
        position: absolute;
        top: 13%;
        z-index: 1;
        width: min(38vw, 640px);
        color: rgba(255, 225, 244, 0.36);
        font-family: "Times New Roman", Georgia, serif;
        text-align: left;
        text-shadow:
          0 0 18px rgba(244, 114, 182, 0.3),
          0 0 34px rgba(168, 85, 247, 0.16);
        filter: blur(0.12px);
        pointer-events: none;
        will-change: transform;
      }

      .ai-formula-wall-left {
        left: max(28px, 3vw);
        animation: wallDriftLeft 14s ease-in-out infinite;
      }

      .ai-formula-wall-right {
        right: max(28px, 3vw);
        text-align: right;
        animation: wallDriftRight 15.5s ease-in-out infinite;
      }

      .ai-formula {
        --formula-offset: 0px;
        --formula-rotate: 0deg;
        --formula-x-start: -8px;
        --formula-x-end: 8px;
        margin: 30px 0;
        font-size: clamp(26px, 2.6vw, 46px);
        line-height: 1.18;
        letter-spacing: 0.015em;
        overflow: visible;
        text-wrap: balance;
        opacity: 0.32;
        animation-name: formulaDrift;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        will-change: transform, opacity;
      }

      .ai-particles {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
      }

      .ai-particles span {
        position: absolute;
        --particle-opacity: 0.42;
        --particle-x: 8px;
        --particle-y: -18px;
        width: 4px;
        height: 4px;
        border-radius: 999px;
        background: rgba(244, 184, 223, 0.6);
        box-shadow: 0 0 16px rgba(244, 114, 182, 0.8);
        animation-name: floatParticle;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
        will-change: transform, opacity;
      }

      .ai-hero-lines {
        position: absolute;
        inset: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        opacity: 0.34;
        pointer-events: none;
        animation: orbitDrift 16s ease-in-out infinite;
      }

      .ai-hero-lines path {
        fill: none;
        stroke: rgba(236, 171, 255, 0.14);
        stroke-width: 0.22;
        stroke-dasharray: 18 30;
        stroke-linecap: round;
        filter: drop-shadow(0 0 10px rgba(244, 114, 182, 0.2));
        animation: linePulse 7.5s ease-in-out infinite;
      }

      .ai-hero-lines path:nth-child(2n) {
        animation-delay: 1.4s;
        opacity: 0.72;
      }

      .ai-hero-lines path:nth-child(3n) {
        animation-delay: 2.6s;
        opacity: 0.55;
      }

      .ai-hero-kicker,
      .ai-hero-title,
      .ai-hero-copy,
      .ai-hero-progress,
      .ai-hero-actions {
        opacity: 0;
        animation: fadeUp 0.95s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }

      .ai-hero-kicker {
        letter-spacing: 0.45em;
      }

      .ai-hero-title {
        text-shadow:
          0 0 28px rgba(255, 180, 230, 0.35),
          0 0 60px rgba(168, 85, 247, 0.25),
          0 14px 56px rgba(0, 0, 0, 0.55);
      }

      .ai-hero-title-ai,
      .ai-hero-title-cn {
        animation: titleGlow 5.8s ease-in-out 1.15s infinite;
      }

      .ai-hero-title-ai {
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(84px, 9vw, 128px);
        font-weight: 700;
        letter-spacing: 0.02em;
        background: linear-gradient(180deg, #fff8ef 0%, #ffd8ee 44%, #d8b4fe 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      .ai-hero-title-cn {
        margin-top: -0.08em;
        font-family: "KaiTi", "STKaiti", "Kaiti SC", "楷体", serif;
        font-size: clamp(72px, 8vw, 118px);
        font-weight: 700;
        letter-spacing: 0.05em;
        background: linear-gradient(180deg, #fff7e8 0%, #f8cfe9 54%, #d8b4fe 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }

      .ai-hero-copy {
        font-family: "Songti SC", "STSong", Georgia, serif;
        text-shadow: 0 0 18px rgba(244, 114, 182, 0.16);
      }

      .ai-hero-primary {
        background: linear-gradient(135deg, #c026d3, #ec4899 48%, #fb7185);
        border: 1px solid rgba(255,255,255,0.18);
        box-shadow:
          0 0 34px rgba(236, 72, 153, 0.38),
          0 16px 42px rgba(0, 0, 0, 0.42),
          inset 0 1px 0 rgba(255,255,255,0.24);
        transition: transform 0.18s ease, box-shadow 0.18s ease;
        animation: pulseGlow 4.8s ease-in-out infinite;
      }

      .ai-hero-primary:hover {
        transform: translateY(-2px);
        box-shadow:
          0 0 44px rgba(236, 72, 153, 0.52),
          0 18px 48px rgba(0, 0, 0, 0.48),
          inset 0 1px 0 rgba(255,255,255,0.28);
      }

      .ai-hero-secondary {
        background: rgba(12, 8, 24, 0.46);
        border: 1px solid rgba(248, 207, 233, 0.22);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.09);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
      }

      .ai-hero-secondary:hover {
        transform: translateY(-2px);
        border-color: rgba(244, 114, 182, 0.62);
        box-shadow: 0 0 28px rgba(168, 85, 247, 0.24), inset 0 1px 0 rgba(255,255,255,0.12);
      }

      .ai-hero-scroll {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        border: 0;
        background: transparent;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.22em;
        cursor: pointer;
        opacity: 0;
        animation: scrollHint 1.9s ease-in-out 1.55s infinite;
        will-change: transform, opacity;
      }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes aiChapterRise {
        from {
          opacity: 0;
          transform: translateY(28px) scale(0.985);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes floatSlow {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-14px); }
      }

      @keyframes floatParticle {
        0%, 100% {
          transform: translate3d(0, 0, 0) scale(0.85);
          opacity: calc(var(--particle-opacity) * 0.66);
        }
        50% {
          transform: translate3d(var(--particle-x), var(--particle-y), 0) scale(1.24);
          opacity: min(0.86, calc(var(--particle-opacity) + 0.22));
        }
      }

      @keyframes formulaDrift {
        0%, 100% {
          transform: translate3d(var(--formula-x-start), 10px, 0) translateY(var(--formula-offset)) rotate(var(--formula-rotate));
          opacity: 0.28;
        }
        50% {
          transform: translate3d(var(--formula-x-end), -10px, 0) translateY(var(--formula-offset)) rotate(var(--formula-rotate));
          opacity: 0.48;
        }
      }

      @keyframes scanLine {
        0% {
          transform: translateX(-30%) rotate(var(--scan-rotate, 0deg));
          opacity: 0;
        }
        45% {
          opacity: 0.35;
        }
        100% {
          transform: translateX(30%) rotate(var(--scan-rotate, 0deg));
          opacity: 0;
        }
      }

      @keyframes orbitDrift {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(0.8%, -1.2%, 0) scale(1.015); }
      }

      @keyframes linePulse {
        0%, 100% {
          stroke-dashoffset: 0;
          opacity: 0.44;
        }
        50% {
          stroke-dashoffset: -24;
          opacity: 0.9;
        }
      }

      @keyframes wallDriftLeft {
        0%, 100% { transform: translate3d(0, 0, 0); }
        50% { transform: translate3d(-8px, -12px, 0); }
      }

      @keyframes wallDriftRight {
        0%, 100% { transform: translate3d(0, 0, 0); }
        50% { transform: translate3d(8px, -10px, 0); }
      }

      @keyframes titleGlow {
        0%, 100% {
          filter: drop-shadow(0 0 10px rgba(255, 180, 230, 0.18));
        }
        50% {
          filter: drop-shadow(0 0 24px rgba(244, 114, 182, 0.34)) drop-shadow(0 0 34px rgba(168, 85, 247, 0.2));
        }
      }

      @keyframes glowBreath {
        0%, 100% {
          opacity: 0.42;
          transform: scale(0.98);
        }
        50% {
          opacity: 0.62;
          transform: scale(1.04);
        }
      }

      @keyframes pulseGlow {
        0%, 100% { opacity: 0.82; filter: brightness(1); }
        50% { opacity: 1; filter: brightness(1.12); }
      }

      @keyframes scrollHint {
        0%, 100% { transform: translate(-50%, 0); opacity: 0.58; }
        50% { transform: translate(-50%, 8px); opacity: 0.95; }
      }

      @media (max-width: 767px) {
        .ai-course-snap-root {
          height: calc(100dvh - 56px);
          min-height: 640px;
        }
        .ai-course-snap-dots {
          right: 10px;
        }
        .ai-course-hero {
          min-height: 100%;
        }
        .ai-hero-kicker {
          letter-spacing: 0.22em;
          line-height: 1.8;
        }
        .ai-hero-title-ai {
          font-size: 72px;
        }
        .ai-hero-title-cn {
          font-size: 64px;
        }
        .ai-hero-copy {
          font-size: 17px;
        }
        .ai-particle-extra {
          display: none;
        }
        .ai-scan-diagonal {
          opacity: 0.65;
        }
      }

      [data-theme="light"] .ai-course-chapters-scroll {
        scrollbar-color: rgba(124, 58, 237, 0.22) transparent;
        background:
          radial-gradient(circle at 20% 10%, rgba(124, 58, 237, 0.10), transparent 28%),
          radial-gradient(circle at 78% 20%, rgba(219, 39, 119, 0.08), transparent 30%),
          linear-gradient(180deg, #fbfaff 0%, #f6f3ff 48%, #fff7fb 100%);
      }

      [data-theme="light"] .ai-course-chapters-scroll::-webkit-scrollbar-thumb {
        background: rgba(124, 58, 237, 0.22);
      }

      [data-theme="light"] .ai-course-snap-dots button {
        border-color: rgba(124, 58, 237, 0.25);
        background: rgba(255, 255, 255, 0.70);
        box-shadow: 0 8px 18px rgba(124, 58, 237, 0.08);
      }

      [data-theme="light"] .ai-course-snap-dots button.is-active {
        background: linear-gradient(135deg, #7c3aed, #db2777);
        box-shadow: 0 0 18px rgba(124, 58, 237, 0.24);
      }

      [data-theme="light"] .ai-course-hero {
        background:
          radial-gradient(circle at 50% 34%, rgba(124, 58, 237, 0.12), transparent 36%),
          radial-gradient(circle at 24% 22%, rgba(219, 39, 119, 0.09), transparent 30%),
          radial-gradient(circle at 78% 18%, rgba(99, 102, 241, 0.09), transparent 30%),
          linear-gradient(135deg, #ffffff 0%, #f5f1ff 50%, #fff1f7 100%);
        color: #0f172a;
      }

      [data-theme="light"] .ai-course-hero-bg {
        background:
          radial-gradient(circle at 50% 44%, rgba(124, 58, 237, 0.08), transparent 20%),
          radial-gradient(circle at 50% 108%, rgba(219, 39, 119, 0.08), transparent 34%);
      }

      [data-theme="light"] .ai-course-grid {
        opacity: 0.32;
        background-image:
          linear-gradient(rgba(124, 58, 237, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124, 58, 237, 0.08) 1px, transparent 1px);
      }

      [data-theme="light"] .ai-course-glow {
        opacity: 0.28;
        filter: blur(82px) saturate(0.72);
        mix-blend-mode: multiply;
      }

      [data-theme="light"] .ai-course-glow-main {
        background:
          radial-gradient(circle, rgba(219, 39, 119, 0.12), rgba(124, 58, 237, 0.10) 46%, transparent 72%);
      }

      [data-theme="light"] .ai-course-glow-side {
        background: rgba(99, 102, 241, 0.10);
      }

      [data-theme="light"] .ai-scan {
        filter: blur(10px) saturate(0.75);
        mix-blend-mode: multiply;
      }

      [data-theme="light"] .ai-scan-diagonal {
        background: linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.08) 34%, rgba(219, 39, 119, 0.18) 50%, rgba(124, 58, 237, 0.08) 66%, transparent 100%);
      }

      [data-theme="light"] .ai-scan-horizontal {
        background: linear-gradient(90deg, transparent 0%, rgba(124, 58, 237, 0.08) 36%, rgba(219, 39, 119, 0.14) 52%, rgba(99, 102, 241, 0.08) 68%, transparent 100%);
      }

      [data-theme="light"] .ai-formula-wall {
        color: rgba(76, 29, 149, 0.20);
        text-shadow:
          0 0 14px rgba(124, 58, 237, 0.08),
          0 0 24px rgba(219, 39, 119, 0.05);
      }

      [data-theme="light"] .ai-formula {
        opacity: 0.24;
      }

      [data-theme="light"] .ai-particles {
        opacity: 0.42;
        filter: saturate(0.62);
      }

      [data-theme="light"] .ai-hero-lines {
        opacity: 0.28;
      }

      [data-theme="light"] .ai-hero-lines path {
        stroke: rgba(124, 58, 237, 0.16);
        filter: drop-shadow(0 0 8px rgba(124, 58, 237, 0.08));
      }

      [data-theme="light"] .ai-hero-kicker {
        color: rgba(109, 40, 217, 0.72);
      }

      [data-theme="light"] .ai-hero-title {
        text-shadow:
          0 10px 34px rgba(124, 58, 237, 0.12),
          0 1px 0 rgba(255, 255, 255, 0.85);
      }

      [data-theme="light"] .ai-hero-title-ai {
        background: linear-gradient(180deg, #0f172a 0%, #4c1d95 46%, #7c3aed 100%);
        -webkit-background-clip: text;
        background-clip: text;
      }

      [data-theme="light"] .ai-hero-title-cn {
        background: linear-gradient(180deg, #581c87 0%, #7e22ce 46%, #be185d 100%);
        -webkit-background-clip: text;
        background-clip: text;
      }

      [data-theme="light"] .ai-hero-copy {
        color: rgba(51, 65, 85, 0.88);
        text-shadow: none;
      }

      [data-theme="light"] .ai-hero-progress-meta {
        color: rgba(71, 85, 105, 0.76);
      }

      [data-theme="light"] .ai-hero-progress-track {
        border-color: rgba(124, 58, 237, 0.18);
        background: rgba(255, 255, 255, 0.72);
        box-shadow:
          inset 0 1px 8px rgba(124, 58, 237, 0.10),
          0 8px 26px rgba(124, 58, 237, 0.10);
      }

      [data-theme="light"] .ai-hero-progress-bar {
        box-shadow: 0 0 18px rgba(219, 39, 119, 0.26);
      }

      [data-theme="light"] .ai-hero-primary {
        border-color: rgba(255, 255, 255, 0.68);
        box-shadow:
          0 14px 34px rgba(124, 58, 237, 0.22),
          inset 0 1px 0 rgba(255,255,255,0.32);
      }

      [data-theme="light"] .ai-hero-primary:hover {
        box-shadow:
          0 16px 38px rgba(124, 58, 237, 0.28),
          inset 0 1px 0 rgba(255,255,255,0.36);
      }

      [data-theme="light"] .ai-hero-secondary {
        color: #5b21b6;
        background: rgba(255, 255, 255, 0.68);
        border-color: rgba(124, 58, 237, 0.22);
        box-shadow: 0 10px 30px rgba(124, 58, 237, 0.10), inset 0 1px 0 rgba(255,255,255,0.75);
      }

      [data-theme="light"] .ai-hero-secondary:hover {
        border-color: rgba(124, 58, 237, 0.36);
        box-shadow: 0 12px 32px rgba(124, 58, 237, 0.14), inset 0 1px 0 rgba(255,255,255,0.85);
      }

      [data-theme="light"] .ai-hero-scroll {
        color: rgba(109, 40, 217, 0.66);
      }
    `}</style>
  )
}

function findNextLesson(curriculum, isCompleted) {
  for (const ch of curriculum.chapters) {
    for (const lesson of ch.lessons) {
      if (!isCompleted(lesson.id)) return lesson
    }
  }
  return curriculum.chapters[0].lessons[0]
}
