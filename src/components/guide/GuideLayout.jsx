import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'

/**
 * 通用章节式教程布局 - 全新重排版
 * 横幅、侧边栏、内容完全融合，无分割线，风格统一
 */
export default function GuideLayout({ meta, sections }) {
  const [activeSection, setActiveSection] = useState(0)
  const [readProgress, setReadProgress] = useState(0)
  const contentRef = useRef(null)
  const sectionRefs = useRef([])
  const outletContext = useOutletContext()
  const sidebarCollapsed = outletContext?.sidebarCollapsed || false
  const sidebarOpen = outletContext?.sidebarOpen || false
  const closeSidebar = outletContext?.closeSidebar
  const isMobile = outletContext?.isMobile || false
  const storageKey = `cshub-guide-pos-${meta.title}`

  // Restore scroll position on mount
  useEffect(() => {
    const saved = parseInt(localStorage.getItem(storageKey) || '0', 10)
    if (saved > 0 && sectionRefs.current[saved]) {
      setTimeout(() => {
        sectionRefs.current[saved]?.scrollIntoView({ block: 'start' })
      }, 80)
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return
      const el = contentRef.current
      const totalScrollable = el.scrollHeight - el.clientHeight
      if (totalScrollable > 0) setReadProgress(Math.round((el.scrollTop / totalScrollable) * 100))

      const offsets = sectionRefs.current.map(r => r?.offsetTop ?? Infinity)
      const scrollTop = el.scrollTop + 100
      let active = 0
      offsets.forEach((off, i) => { if (scrollTop >= off) active = i })
      setActiveSection(active)
    }
    const el = contentRef.current
    el?.addEventListener('scroll', handleScroll, { passive: true })
    return () => el?.removeEventListener('scroll', handleScroll)
  }, [])

  // Persist section index
  useEffect(() => {
    try { localStorage.setItem(storageKey, String(activeSection)) } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
  }, [activeSection, storageKey])

  function scrollToSection(idx) {
    sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    closeSidebar?.()
  }

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0, overflow: 'hidden' }}>

      {isMobile && sidebarOpen && (
        <div onClick={closeSidebar} style={{
          position: 'fixed',
          inset: 0,
          top: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 80,
        }} />
      )}

      {/* ── Left sidebar ── */}
      <div style={{
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        width: isMobile ? 0 : (sidebarCollapsed ? 0 : 248),
        overflow: isMobile ? 'visible' : 'hidden',
        flexShrink: 0,
      }}>
        <aside
          className={isMobile && sidebarOpen ? 'sidebar sidebar-open' : 'sidebar'}
          style={{
          width: 248,
          minHeight: 0,
          borderRight: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          padding: '20px 10px',
          height: isMobile ? '100vh' : '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: isMobile ? 'fixed' : 'relative',
          top: isMobile ? 0 : undefined,
          left: isMobile ? 0 : undefined,
          bottom: isMobile ? 0 : undefined,
          zIndex: isMobile ? 90 : undefined,
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: isMobile ? 'transform 0.25s cubic-bezier(0.4,0,0.2,1)' : undefined,
        }}>
          <GuideSidebarAmbient />

          {/* Module identity */}
          <div style={{ padding: '4px 10px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 11, flexShrink: 0,
              background: `linear-gradient(135deg, ${meta.gradientFrom}, ${meta.gradientTo})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
              boxShadow: `0 4px 14px ${meta.gradientFrom}55`,
            }}>
              {meta.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{meta.title}</div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{meta.tag}</div>
            </div>
          </div>

          <div style={{ padding: '0 10px 10px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              章节目录
            </div>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}>
            {sections.map((s, i) => {
              const isActive = activeSection === i
              return (
                <li key={i}>
                  <button onClick={() => scrollToSection(i)} style={{
                    width: '100%', textAlign: 'left',
                    padding: '8px 10px',
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: isActive ? 'var(--accent-soft)' : 'transparent',
                    borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderRadius: 'var(--r-sm)',
                    marginLeft: 4,
                    fontSize: 12.5, fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.15s',
                    border: 'none', cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--glass-bg-mid)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }
                  }}>
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{s.icon}</span>
                    <span style={{ lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Read progress */}
          <div style={{ margin: '16px 10px 0', padding: '12px 14px', background: 'var(--glass-bg-mid)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>阅读进度</div>
              <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{readProgress}%</div>
            </div>
            <div style={{ height: 5, background: 'var(--surface-3)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${readProgress}%`,
                background: `linear-gradient(90deg, ${meta.gradientFrom}, ${meta.gradientTo})`,
                borderRadius: 99, transition: 'width 0.3s',
              }} />
            </div>
          </div>
        </aside>
      </div>

      {/* ── Main scrollable area ── */}
      <main ref={contentRef} style={{ flex: 1, overflowY: 'auto', minHeight: 0, height: '100%' }}>

        {/* Page hero — same transparent background as the rest */}
        <div className="guide-hero" style={{ padding: '56px 56px 32px', position: 'relative', overflow: 'hidden' }}>
          {/* Soft ambient glow orbs */}
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 320, height: 320, borderRadius: '50%',
            background: `radial-gradient(circle, ${meta.gradientFrom}18, transparent 70%)`,
            filter: 'blur(50px)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: 20, left: '30%',
            width: 280, height: 280, borderRadius: '50%',
            background: `radial-gradient(circle, ${meta.gradientTo}12, transparent 70%)`,
            filter: 'blur(60px)', pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Tag pill */}
            <div style={{ marginBottom: 16 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                background: 'var(--glass-bg-mid)',
                border: '1px solid var(--glass-border)',
                padding: '5px 14px', borderRadius: 99,
                backdropFilter: 'blur(20px)',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${meta.gradientFrom}, ${meta.gradientTo})`,
                  display: 'inline-block',
                }} />
                {meta.tag}
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em',
              color: 'var(--text-primary)', margin: '0 0 16px',
              lineHeight: 1.1, textAlign: 'center',
            }}>
              {meta.icon} {meta.title}
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 17, color: 'var(--text-secondary)',
              lineHeight: 1.7, margin: '0 0 28px',
              maxWidth: 640, fontWeight: 400, textAlign: 'center',
            }}>
              {meta.subtitle}
            </p>

            {/* Stats chips */}
            {meta.stats?.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                {meta.stats.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px',
                    background: 'var(--glass-bg-mid)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 99,
                    backdropFilter: 'blur(20px)',
                    fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600,
                  }}>
                    <span style={{ fontSize: 14 }}>{s.icon}</span>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>



        {/* Content */}
        <div className="guide-section" style={{ padding: '48px 56px 100px', maxWidth: 900, margin: '0 auto' }}>
          {sections.map((section, i) => (
            <section
              key={i}
              ref={el => sectionRefs.current[i] = el}
              style={{ marginBottom: 72, scrollMarginTop: 24 }}
            >
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                  background: `linear-gradient(135deg, ${meta.gradientFrom}22, ${meta.gradientTo}22)`,
                  border: `1px solid ${meta.gradientFrom}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>
                  {section.icon}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>
                    第 {i + 1} 章
                  </div>
                  <h2 className="guide-section-title" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                    {section.title}
                  </h2>
                </div>
              </div>

              {/* Section content */}
              <div className="guide-content">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}

function GuideSidebarAmbient() {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      opacity: 0.28,
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: [
          'linear-gradient(rgba(168,85,247,0.08) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '42px 42px',
        maskImage: 'linear-gradient(to bottom, transparent 0, black 70px, black 88%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, black 70px, black 88%, transparent 100%)',
      }} />
      <div style={{
        position: 'absolute',
        left: -72,
        top: 120,
        width: 220,
        height: 360,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.22), transparent 68%)',
        filter: 'blur(22px)',
      }} />
      <div style={{
        position: 'absolute',
        right: -96,
        top: 450,
        width: 240,
        height: 340,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.18), transparent 70%)',
        filter: 'blur(24px)',
      }} />
    </div>
  )
}
