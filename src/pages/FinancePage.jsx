import { useCallback, useEffect, useRef, useState } from 'react'

// ─────────────────────────────────────────────────────────────
// 理财 · 人赚不到认知以外的钱
//   - 全屏翻页（fullPage 风格），与首页逻辑学一致
//   - 第 1 屏：Hero（理财 + 宣言 + 信号柱）
//   - 第 2 屏：Content（免责声明 + 三步内容）
//   - 在第 2 屏内，若内容超出视口高度，先让内层 div 消化滚动，
//     滚到底/顶后才触发翻页（使用 contentScrollRef 边界判断）
// ─────────────────────────────────────────────────────────────

const BOOKS = [
  { title: '《金钱心理学》',              mark: 'MONEY',  tone: 'amber' },
  { title: '《拿工薪，三十几岁你也能赚到600万》', mark: 'SALARY', tone: 'green' },
  { title: '《聪明的投资者》',            mark: 'VALUE',  tone: 'blue'  },
]

const STEPS = [
  {
    number: '01',
    title: '财务自由的第一步：提高认知',
    body: '先提高认知，再谈机会。认知决定你看得懂什么、拿得住什么，也决定你能避开什么。',
  },
  {
    number: '02',
    title: '第二步：长期持有，永不卖出',
    body: '把注意力从短期涨跌里拿回来。长期持有的难点不是计算，而是纪律、耐心和对资产的理解。',
  },
  {
    number: '03',
    title: '第三步：保持身体健康',
    body: '保持身体健康，长生不老，永远不死。时间是复利的燃料，健康是长期主义的本金。',
  },
]

const PAGES    = 2
const ANIM_MS  = 800
const LOCK_MS  = ANIM_MS + 220
const WHEEL_THRESHOLD = 28
const GESTURE_GAP_MS  = 220

export default function FinancePage() {
  const [page, setPage]             = useState(0)
  const [contentKey, setContentKey] = useState(0)
  const containerRef                = useRef(null)
  const contentScrollRef            = useRef(null)   // inner scroll on page 2
  const lockRef                     = useRef(false)
  const accumRef                    = useRef(0)
  const lastWheelRef                = useRef(0)
  const pageRef                     = useRef(0)
  const touchStartRef               = useRef(0)
  useEffect(() => { pageRef.current = page }, [page])
  // Re-mount page-2 content each time it becomes visible → CSS animations replay
  useEffect(() => { if (page === 1) setContentKey(k => k + 1) }, [page])

  const goTo = useCallback((next) => {
    if (lockRef.current) return
    const target = Math.max(0, Math.min(PAGES - 1, next))
    setPage(prev => {
      if (prev === target) return prev
      lockRef.current = true
      // reset inner scroll when going back to hero
      if (target === 0 && contentScrollRef.current) {
        contentScrollRef.current.scrollTop = 0
      }
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

      // 翻页动画期间冻结所有输入（含内层滚动），防止手势残留把第二页顶部滚走
      if (lockRef.current) return

      // 在内容页：先让内层 div 消化滚轮，到顶/底边界才触发翻页
      if (pageRef.current === 1) {
        const inner = contentScrollRef.current
        if (inner) {
          const canScrollDown = inner.scrollTop < inner.scrollHeight - inner.clientHeight - 1
          const canScrollUp   = inner.scrollTop > 1
          if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
            inner.scrollTop += e.deltaY
            return
          }
        }
      }
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

      // On page 2, only flip when inner scroll has hit its boundary
      if (pageRef.current === 1) {
        const inner = contentScrollRef.current
        if (inner) {
          const canScrollDown = inner.scrollTop < inner.scrollHeight - inner.clientHeight - 1
          const canScrollUp   = inner.scrollTop > 1
          if ((deltaY > 0 && canScrollDown) || (deltaY < 0 && canScrollUp)) return
        }
      }
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
    <div ref={containerRef} className="finance-page finance-snap-pager">
      <div className="finance-backdrop" aria-hidden="true" />

      <div
        className="finance-snap-track"
        style={{
          transform: `translate3d(0, -${page * 100}vh, 0)`,
          transition: `transform ${ANIM_MS}ms cubic-bezier(0.86, 0, 0.07, 1)`,
        }}
      >
        {/* ── Page 1: Hero ── */}
        <div className="finance-snap-page">
          <section className="finance-hero">
            <div className="finance-hero-inner">
              <div className="finance-kicker">WEALTH OS / COGNITION FIRST</div>
              <h1 className="finance-title">理财</h1>
              <p className="finance-manifesto">人赚不到认知以外的钱</p>
              <div className="finance-signal" aria-hidden="true">
                <span /><span /><span />
              </div>
            </div>
          </section>

          <button
            type="button"
            onClick={() => goTo(1)}
            aria-label="向下翻页"
            className="finance-hero-chevron"
          >
            <span className="finance-hero-chevron-label">Scroll</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* ── Page 2: Content ── */}
        <div className="finance-snap-page">
          <main
            key={contentKey}
            ref={contentScrollRef}
            className="finance-content finance-content-scrollable"
            aria-label="理财三步"
          >
            <section className="finance-disclaimer" aria-label="免责声明">
              <strong>免责声明</strong>
              <p>
                本章节只用于学习、阅读和认知提升，不构成任何投资建议、收益承诺或买卖指令。所有投资决策都应结合个人风险承受能力，并自行承担结果。
              </p>
            </section>

            <section className="finance-step finance-step-featured">
              <div className="finance-step-index">01</div>
              <div className="finance-step-copy">
                <h2>财务自由的第一步：提高认知</h2>
                <p>
                  先提高认知，再谈机会。认知决定你看得懂什么、拿得住什么，也决定你能避开什么。
                </p>
              </div>
              <div className="finance-books" aria-label="推荐书单">
                {BOOKS.map((book, index) => (
                  <article className="finance-book" key={book.title}>
                    <div
                      className={`finance-book-cover finance-book-cover-${book.tone}`}
                      role="img"
                      aria-label={`${book.title} 书籍封面`}
                    >
                      <span>{book.mark}</span>
                      <em>{String(index + 1).padStart(2, '0')}</em>
                    </div>
                    <strong>{book.title}</strong>
                  </article>
                ))}
              </div>
            </section>

            <div className="finance-step-grid">
              {STEPS.slice(1).map(step => (
                <section className="finance-step" key={step.number}>
                  <div className="finance-step-index">{step.number}</div>
                  <div className="finance-step-copy">
                    <h2>{step.title}</h2>
                    <p>{step.body}</p>
                  </div>
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>

      <FinancePageDots count={PAGES} active={page} onSelect={goTo} />
    </div>
  )
}

function FinancePageDots({ count, active, onSelect }) {
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
              border: '1.5px solid',
              background: isActive ? 'var(--finance-gold, #d7b56d)' : 'transparent',
              borderColor: isActive ? 'transparent' : 'rgba(215, 181, 109, 0.45)',
              boxShadow: isActive ? '0 6px 18px rgba(215, 181, 109, 0.45)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
          />
        )
      })}
    </div>
  )
}
