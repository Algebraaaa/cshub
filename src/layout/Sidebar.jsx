import { memo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAlgorithmsByCategory } from '../data/algorithmMeta'
import { preloadAlgorithmDetail } from '../data/algorithmDetails'
import { useProgress } from '../contexts/ProgressContext'
import { SUBJECT_LIST, getCategoriesBySubject } from '../data/subjects'
import { preloadPlayground } from '../components/learning/playgroundRegistry'

function preloadAlgorithm(algo) {
  preloadAlgorithmDetail(algo.slug)
  preloadPlayground(algo.viz).catch(() => null)
}

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { slug } = useParams()
  const { isFavorite, isCompleted } = useProgress()
  const [collapsedSubjects, setCollapsedSubjects] = useState(() => new Set())

  const toggleSubject = (sid) => setCollapsedSubjects(prev => {
    const next = new Set(prev)
    next.has(sid) ? next.delete(sid) : next.add(sid)
    return next
  })

  // 仅展示有算法的可用学科；未上线学科保留入口但不展开列表
  const subjects = SUBJECT_LIST
    .map(s => ({ subject: s, cats: getCategoriesBySubject(s.id) }))
    .filter(({ subject, cats }) => subject.available && cats.length > 0)

  return (
    <>
      {mobileOpen && (
        <div onClick={onClose} aria-hidden="true" style={{
          position: 'fixed', inset: 0, top: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 80,
        }} />
      )}
      <aside
        id="main-sidebar"
        className={mobileOpen ? 'sidebar sidebar-open' : 'sidebar'}
        role="navigation"
        aria-label="算法目录"
        {...(mobileOpen ? { 'aria-modal': 'true' } : {})}
        style={{
          width: 248,
          height: '100%',
          minHeight: 0,
          borderRadius: 0,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '8px 0 24px rgba(0,0,0,0.12), inset -1px 0 0 var(--glass-border)',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '20px 10px',
          flexShrink: 0,
          position: 'relative',
        }}>
        <SidebarAmbient />

        {subjects.map(({ subject, cats }) => {
          const subjectCollapsed = collapsedSubjects.has(subject.id)
          return (
            <div key={subject.id} style={{ marginBottom: 14 }}>
              <button
                onClick={() => toggleSubject(subject.id)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px',
                  marginBottom: 4,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderRadius: 'var(--r-sm)',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-mid)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: 7,
                  background: subject.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, flexShrink: 0,
                  boxShadow: `0 2px 6px ${subject.color}44`,
                }}>{subject.icon}</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  {subject.name}
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  style={{ color: 'var(--text-tertiary)', transform: subjectCollapsed ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {!subjectCollapsed && cats.map(cat => {
          const catKey = cat.key
          const algos = getAlgorithmsByCategory(catKey)
          return (
            <div key={catKey} style={{ marginBottom: 12, marginLeft: 6 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 10px',
                fontSize: 11.5,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '-0.01em',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 7,
                  background: 'var(--glass-bg-mid)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, flexShrink: 0,
                }}>{cat.icon}</span>
                <span>{cat.name}</span>
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 10,
                  color: 'var(--text-tertiary)',
                  background: 'var(--glass-bg-mid)',
                  border: '1px solid var(--glass-border)',
                  padding: '1px 7px',
                  borderRadius: 20,
                  fontWeight: 600,
                }}>
                  {algos.length}
                </span>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '2px 0 0' }}>
                {algos.map(a => (
                  <SidebarAlgoItem
                    key={a.slug}
                    algo={a}
                    isActive={slug === a.slug}
                    isFav={isFavorite(a.slug)}
                    isDone={isCompleted(a.slug)}
                    onClose={onClose}
                  />
                ))}
              </ul>
            </div>
          )
        })}
            </div>
          )
        })}
      </aside>
    </>
  )
}

const SidebarAlgoItem = memo(function SidebarAlgoItem({ algo, isActive, isFav, isDone, onClose }) {
  return (
    <li>
      <Link
        to={`/algo/${algo.slug}`}
        onClick={onClose}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 10px 6px 28px',
          fontSize: 12.5,
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          background: isActive ? 'var(--accent-soft)' : 'transparent',
          borderRadius: 'var(--r-sm)',
          borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
          marginLeft: 4,
          fontWeight: isActive ? 600 : 400,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          preloadAlgorithm(algo)
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
        }}
        onFocus={() => preloadAlgorithm(algo)}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, minWidth: 0, overflow: 'hidden' }}>
          {isDone && <DoneDot />}
          {isFav && <FavDot />}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{algo.name}</span>
        </span>
        <DiffBadge level={algo.difficulty} />
      </Link>
    </li>
  )
})

function SidebarAmbient() {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      opacity: 0.34,
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
        background: 'radial-gradient(circle, rgba(168,85,247,0.28), transparent 68%)',
        filter: 'blur(22px)',
      }} />
      <div style={{
        position: 'absolute',
        right: -96,
        top: 450,
        width: 240,
        height: 340,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.22), transparent 70%)',
        filter: 'blur(24px)',
      }} />
    </div>
  )
}

function DoneDot() {
  return (
    <span title="已学完" style={{
      width: 14, height: 14, flexShrink: 0,
      borderRadius: '50%',
      background: 'var(--green-soft)',
      color: 'var(--green)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  )
}

function FavDot() {
  return (
    <svg title="已收藏" width="11" height="11" viewBox="0 0 24 24"
      fill="var(--yellow)" stroke="var(--yellow)" strokeWidth="2" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function DiffBadge({ level }) {
  const colorMap = {
    '基础': { bg: 'var(--green-soft)',  fg: 'var(--green)' },
    '中等': { bg: 'var(--yellow-soft)', fg: 'var(--yellow)' },
    '进阶': { bg: 'var(--red-soft)',    fg: 'var(--red)' },
  }
  const c = colorMap[level] || colorMap['基础']
  return (
    <span style={{
      fontSize: 9, padding: '1px 5px', borderRadius: 4,
      background: c.bg, color: c.fg,
      fontWeight: 700, letterSpacing: '0.02em',
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>{level}</span>
  )
}
