import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ALGORITHM_LIST, ALGORITHMS, CATEGORIES } from '../data/algorithmMeta'
import { useProgress } from '../contexts/ProgressContext'

const SUBJECT_LIST = []
const SUBJECT_ITEMS = SUBJECT_LIST.map(s => ({
  type: 'subject',
  slug: s.id,
  to: null,
  name: s.name,
  icon: s.icon,
  color: s.color,
  desc: s.description + (s.available ? '' : '（敬请期待）'),
}))

const RECENT_KEY = 'algoviz-recent-search'
const RECENT_MAX = 5

function loadRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.slice(0, RECENT_MAX) : []
  } catch { return [] }
}

function pushRecent(item) {
  if (!item) return
  try {
    const prev = loadRecent().filter(x => !(x.type === item.type && x.slug === item.slug))
    const next = [{ type: item.type, slug: item.slug, name: item.name, to: item.to }, ...prev].slice(0, RECENT_MAX)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch { /* ignore */ }
}

const GUIDE_ITEMS = [
  { type: 'guide', slug: 'github', to: '/github', name: 'GitHub 入门', icon: '🐙', color: '#34d399', desc: '账号注册、仓库管理、Pull Request、团队协作全流程。' },
  { type: 'guide', slug: 'ai', to: '/ai', name: 'AI 编程工具', icon: '🤖', color: '#60a5fa', desc: 'Copilot、Claude 等 AI 助手的实战使用技巧。' },
  { type: 'guide', slug: 'finance', to: '/finance', name: '理财', icon: '💹', color: '#fbbf24', desc: '人赚不到认知以外的钱。' },
  { type: 'guide', slug: 'interview', to: '/interview', name: '面试与求职', icon: '💼', color: '#f472b6', desc: 'STAR 简历、高频八股文速查、算法套路总结。' },
  { type: 'guide', slug: 'roadmap', to: '/roadmap', name: 'AI 时代破局路线图', icon: '🗺️', color: '#11998e', desc: 'AI 时代 CS 学习、项目、求职破局路线。' },
  { type: 'guide', slug: 'toolbox', to: '/toolbox', name: '开发者工具箱', icon: '🛠️', color: '#ff7e5f', desc: 'JSON 格式化、Base64 编解码、时间戳转换等常用轻量工具。' },
  { type: 'guide', slug: 'projects', to: '/projects', name: '实战项目库', icon: '🚀', color: '#8E2DE2', desc: '分级的高质量实战项目推荐与核心难点拆解。' },
  { type: 'guide', slug: 'setup', to: '/setup', name: '效率与环境配置', icon: '⚡', color: '#26D0CE', desc: '终端美化 (Zsh)、VS Code 神级配置与快捷键速查。' },
]

export default function SearchPalette({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [recent, setRecent] = useState(() => loadRecent())
  const { favorites } = useProgress()
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()

  // Resolve recent / favorite to full items
  const favoriteItems = useMemo(() => {
    const items = []
    for (const slug of favorites) {
      const algo = ALGORITHMS[slug]
      if (algo) items.push({ ...algo, type: 'algo', _section: 'favorite' })
    }
    return items
  }, [favorites])

  const recentItems = useMemo(() => {
    const favSet = new Set(favoriteItems.map(f => f.slug))
    const out = []
    for (const r of recent) {
      if (r.type === 'algo') {
        const algo = ALGORITHMS[r.slug]
        if (algo && !favSet.has(algo.slug)) out.push({ ...algo, type: 'algo', _section: 'recent' })
      } else if (r.type === 'guide') {
        const g = GUIDE_ITEMS.find(x => x.slug === r.slug)
        if (g) out.push({ ...g, _section: 'recent' })
      } else if (r.type === 'subject') {
        const s = SUBJECT_ITEMS.find(x => x.slug === r.slug)
        if (s) out.push({ ...s, _section: 'recent' })
      }
    }
    return out
  }, [recent, favoriteItems])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()

    // Empty query → favorites + recent + subjects + guides + all algorithms
    if (!q) {
      const usedSlugs = new Set([...favoriteItems, ...recentItems].map(x => `${x.type}-${x.slug}`))
      const guidesLeft = GUIDE_ITEMS.filter(g => !usedSlugs.has(`guide-${g.slug}`))
      const algosLeft = ALGORITHM_LIST
        .filter(a => !usedSlugs.has(`algo-${a.slug}`))
        .map(a => ({ ...a, type: 'algo' }))
      return [...favoriteItems, ...recentItems, ...SUBJECT_ITEMS, ...guidesLeft, ...algosLeft]
    }

    // Subject items
    const subjectResults = SUBJECT_ITEMS.filter(s => [s.name, s.slug, s.desc].join(' ').toLowerCase().includes(q))

    // Guide items
    const guideResults = GUIDE_ITEMS.filter(g => [g.name, g.slug, g.desc].join(' ').toLowerCase().includes(q))

    const score = (a) => {
      const cat = CATEGORIES[a.category]?.name || ''
      const haystack = [a.name, a.nameEn, a.slug, a.difficulty, cat].join(' ').toLowerCase()
      if (a.name.toLowerCase() === q) return 100
      if (a.name.toLowerCase().startsWith(q)) return 80
      if (a.nameEn.toLowerCase().startsWith(q)) return 70
      if (a.slug.startsWith(q)) return 60
      if (haystack.includes(q)) return 40
      let i = 0
      for (const ch of haystack) {
        if (ch === q[i]) i++
        if (i === q.length) return 10
      }
      return 0
    }
    const algoResults = ALGORITHM_LIST
      .map(a => ({ ...a, type: 'algo', s: score(a) }))
      .filter(x => x.s > 0)
      .sort((x, y) => y.s - x.s)

    return [...subjectResults, ...guideResults, ...algoResults]
  }, [query, favoriteItems, recentItems])

  const go = useCallback((target) => {
    if (!target) return
    const to = target.type === 'guide' || target.type === 'subject'
      ? target.to
      : `/algo/${target.slug}`
    pushRecent({ type: target.type, slug: target.slug, name: target.name, to })
    setRecent(loadRecent())
    navigate(to)
    onClose()
  }, [navigate, onClose])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  useEffect(() => { setActive(0) }, [query])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive(i => Math.min(i + 1, Math.max(results.length - 1, 0)))
      }
      else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive(i => Math.max(i - 1, 0))
      }
      else if (e.key === 'Enter') {
        e.preventDefault()
        const target = results[active]
        if (target) {
          go(target)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, active, onClose, go])

  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.querySelector(`[data-idx="${active}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      role="presentation"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="搜索算法和指南"
        style={{
          width: '92%', maxWidth: 560,
          background: 'var(--bg-elev)',
          border: '1px solid var(--border-strong)',
          borderRadius: 12,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'paletteIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索算法名称、分类或英文名…"
            aria-label="搜索算法、英文名或分类"
            aria-autocomplete="list"
            aria-controls="search-palette-list"
            aria-activedescendant={results[active] ? `sp-opt-${results[active].type}-${results[active].slug}` : undefined}
            role="combobox"
            aria-expanded="true"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              fontSize: 15,
              color: 'var(--text-primary)',
              padding: 0,
            }}
          />
          <kbd style={{
            padding: '2px 6px', fontSize: 10,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 3, color: 'var(--text-tertiary)',
          }}>ESC</kbd>
        </div>

        <div
          ref={listRef}
          id="search-palette-list"
          role="listbox"
          aria-label="搜索结果"
          style={{ maxHeight: '52vh', overflowY: 'auto', padding: 8 }}
        >
          {results.length === 0 && (
            <div role="status" aria-live="polite" style={{
              padding: '32px 16px',
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--text-tertiary)',
            }}>
              没有匹配的结果
            </div>
          )}
          {results.map((item, i) => {
            const isActive = i === active
            const isGuide = item.type === 'guide'
            const isSubject = item.type === 'subject'
            const cat = !isGuide && !isSubject ? CATEGORIES[item.category] : null
            const iconBg = isGuide || isSubject ? item.color : cat?.color
            const icon = isGuide || isSubject ? item.icon : cat?.icon
            const label = isGuide || isSubject ? item.desc : `${cat?.name} · ${item.description}`
            const prev = results[i - 1]
            // Section header above the first item of each empty-query section
            let header = null
            if (!query) {
              if (i === 0 && item._section === 'favorite') header = '⭐ 收藏'
              else if ((i === 0 || prev?._section !== 'recent') && item._section === 'recent') header = '🕐 最近访问'
              else if ((i === 0 || prev?._section) && !item._section) header = '全部内容'
            }
            const badge = isSubject
              ? <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: `${item.color}18`, border: `1px solid ${item.color}33`, color: item.color, fontWeight: 700, flexShrink: 0 }}>学科</span>
              : isGuide
              ? <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: `${item.color}18`, border: `1px solid ${item.color}33`, color: item.color, fontWeight: 700, flexShrink: 0 }}>指南</span>
              : <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: 'var(--surface)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{item.timeComplexity?.average}</span>
            return (
              <div key={`wrap-${item.type}-${item.slug}`}>
                {header && (
                  <div role="presentation" style={{
                    padding: '8px 12px 4px',
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                    color: 'var(--text-tertiary)', textTransform: 'uppercase',
                  }}>{header}</div>
                )}
              <div
                id={`sp-opt-${item.type}-${item.slug}`}
                data-idx={i}
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: isActive ? 'var(--accent-soft)' : 'transparent',
                  borderLeft: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                  transition: 'background 0.12s',
                }}
              >
                <div style={{
                  width: 32, height: 32, flexShrink: 0,
                  borderRadius: 8,
                  background: `${iconBg}22`, color: iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                }}>{icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.name}
                    {!isGuide && !isSubject && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>{item.nameEn}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {label}
                  </div>
                </div>
                {badge}
              </div>
              </div>
            )
          })}
        </div>

        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex', gap: 16,
          fontSize: 11,
          color: 'var(--text-tertiary)',
        }}>
          <span><Key>↑↓</Key> 选择</span>
          <span><Key>↵</Key> 打开</span>
          <span style={{ marginLeft: 'auto' }}>{results.length} 个结果</span>
        </div>
      </div>
    </div>
  )
}

function Key({ children }) {
  return (
    <kbd style={{
      padding: '1px 5px',
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 3,
      fontSize: 10,
      fontFamily: 'var(--font-mono)',
      marginRight: 4,
    }}>{children}</kbd>
  )
}
