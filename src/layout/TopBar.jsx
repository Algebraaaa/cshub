import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useViewport } from '../hooks/useMediaQuery'
import DynamicIsland, { IslandDivider } from './DynamicIsland'
import { NAV_ITEMS } from './navItems'

const SearchPalette = lazy(() => import('../components/SearchPalette'))
const NAV_INDICATOR_WIDTH = 42

export default function TopBar({ showMenuButton = false, onMenuClick, sidebarOpen = false }) {
  const { pathname } = useLocation()
  const viewport = useViewport()
  const isPhone = viewport === 'phone'
  const [searchOpen, setSearchOpen] = useState(false)
  const navRef = useRef(null)
  const activeNavId = NAV_ITEMS.find(item => item.match(pathname))?.id
  const [navIndicator, setNavIndicator] = useState({ left: 0, ready: false })

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(o => !o)
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav || !activeNavId) {
      setNavIndicator(prev => ({ ...prev, ready: false }))
      return undefined
    }

    let frame = 0
    let resizeObserver = null

    const updateIndicator = () => {
      const activeLink = nav.querySelector(`[data-nav-id="${activeNavId}"]`)
      if (!activeLink) return

      const navRect = nav.getBoundingClientRect()
      const linkRect = activeLink.getBoundingClientRect()
      // Math.round 必要：translate3d 拿到小数 px（如 294.75）会触发亚像素抗锯齿，
      // 3px 高的渐变条 + 12px 模糊投影在分像素位置上会把颜色不均地分到上下两行像素，
      // 视觉上呈现为"线条歪斜"。整数位移可消除此错觉。
      const rawLeft = linkRect.left - navRect.left + (linkRect.width - NAV_INDICATOR_WIDTH) / 2
      setNavIndicator({
        left: Math.round(rawLeft),
        ready: true,
      })
    }

    updateIndicator()
    frame = window.requestAnimationFrame(updateIndicator)

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(updateIndicator)
      resizeObserver.observe(nav)
      const activeLink = nav.querySelector(`[data-nav-id="${activeNavId}"]`)
      if (activeLink) resizeObserver.observe(activeLink)
    }
    window.addEventListener('resize', updateIndicator)

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateIndicator)
    }
  }, [activeNavId])

  return (
    <>
      {/* 整个浮动岛壳子（玻璃 + 自动隐藏 + 按页面注入主题色调）放在 DynamicIsland 里。
          TopBar 本身只关心"塞什么进岛里"：logo / nav / actions，用 IslandDivider 分组。 */}
      <DynamicIsland>
        {/* 仅移动端保留汉堡菜单；桌面端的侧栏折叠按钮已迁到 SidebarRailToggle */}
        {showMenuButton && (
          <GlassBtn onClick={onMenuClick} aria-label={sidebarOpen ? '关闭侧边栏' : '打开侧边栏'} aria-expanded={sidebarOpen} aria-controls="main-sidebar">
            <MenuIcon />
          </GlassBtn>
        )}

        {/* Logo + 品牌字 · CS Hub 强制不换行；手机端隐藏文字仅留 logo 节省横向空间 */}
        <Link
          to="/"
          aria-label="CS Hub 首页"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          <Logo />
          <span
            className="topbar-brand-text"
            style={{
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: 0,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
            }}
          >
            CS Hub
          </span>
        </Link>

        {/* logo 和主导航之间的分隔线：手机端导航整组隐藏时，此分隔线也随之隐藏 */}
        {!isPhone && (
          <span aria-hidden className="topbar-nav-divider" style={{
            flexShrink: 0, width: 1, height: 22,
            background: 'currentColor', opacity: 0.16, margin: '0 6px',
          }} />
        )}

        {/* iPad Dock 中央：主导航 */}
        <nav ref={navRef} className="topbar-nav" style={{ position: 'relative', display: 'flex', gap: 2, flex: '1 1 auto', flexWrap: 'nowrap', whiteSpace: 'nowrap', minWidth: 0 }}>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.id} id={item.id} to={item.to} active={item.id === activeNavId} icon={item.icon}>{item.label}</NavLink>
          ))}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              bottom: -4,
              width: NAV_INDICATOR_WIDTH,
              height: 3,
              borderRadius: 3,
              background: 'var(--topbar-active, linear-gradient(90deg, #a855f7, #ec4899))',
              boxShadow: 'var(--topbar-active-shadow, 0 0 10px rgba(168,85,247,0.55))',
              opacity: navIndicator.ready ? 1 : 0,
              transform: `translate3d(${navIndicator.left}px, 0, 0)`,
              transition: [
                'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
                'opacity 0.18s ease',
                'background 0.28s ease',
                'box-shadow 0.28s ease',
              ].join(', '),
              willChange: 'transform, width',
              pointerEvents: 'none',
            }}
          />
        </nav>

        {/* Dock 右段：搜索 / 主题 / 用户 / GitHub */}
        <div className="topbar-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: '0 1 auto' }}>
          <SearchBox onClick={() => setSearchOpen(true)} />
          <IslandDivider />
          <ThemeToggle />
          <AuthMenu />
          <a
            href="https://github.com/Algebraaaa"
            target="_blank"
            rel="noreferrer"
            className="topbar-github"
            style={githubStyle}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = 'var(--topbar-github-hover-shadow, 0 6px 16px rgba(0,0,0,0.18))'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--topbar-github-shadow, 0 2px 6px rgba(0,0,0,0.10))'
            }}
          >
            <GitHubIcon />
            <span className="topbar-github-label" style={{ whiteSpace: 'nowrap' }}>GitHub</span>
          </a>
        </div>
      </DynamicIsland>

      {searchOpen && (
        <Suspense fallback={null}>
          <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </>
  )
}

function AuthMenu() {
  const { enabled, user, loading, signInWithGitHub, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  if (loading) return null

  const avatar = user?.user_metadata?.avatar_url
  const name = user?.user_metadata?.full_name || user?.user_metadata?.user_name || user?.email

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title={name || '本地访客'}
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: '1px solid var(--glass-border)',
          background: avatar ? `center/cover no-repeat url(${avatar})` : 'var(--topbar-avatar-bg, linear-gradient(135deg, rgba(168,85,247,0.95), rgba(56,189,248,0.95)))',
          color: 'white',
          fontWeight: 800,
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--glass-shine)',
          padding: 0,
        }}
      >
        {!avatar && (user ? <UserInitial name={name} /> : <LocalUserIcon />)}
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 8px)',
          minWidth: 230,
          background: 'var(--bg-elev)',
          border: '1px solid var(--border-strong)',
          borderRadius: 12,
          boxShadow: 'var(--shadow-lg)',
          padding: 8,
          zIndex: 200,
        }}>
          <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name || '本地访客'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
              {user ? '已开启云端同步' : enabled ? '未登录 · 本地保存' : '单机模式'}
            </div>
          </div>
          <button onClick={() => { navigate('/profile'); setOpen(false) }} style={menuItemStyle}>
            <span>👤</span> 个人主页
          </button>
          {enabled && !user && (
            <>
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <button onClick={async () => { await signInWithGitHub(); setOpen(false) }} style={menuItemStyle}>
                <span>🐙</span> GitHub 登录
              </button>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', padding: '6px 10px 2px' }}>
                登录后跨设备同步学习进度
              </div>
            </>
          )}
          {user && (
            <>
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <button onClick={async () => { await signOut(); setOpen(false) }} style={menuItemStyle}>
                <span>👋</span> 登出
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function UserInitial({ name }) {
  return <span>{String(name || '').trim().charAt(0).toUpperCase()}</span>
}

function LocalUserIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  )
}

function GlassBtn({ children, onClick, ...props }) {
  return (
    <button
      onClick={onClick}
      {...props}
      style={glassBtnStyle}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--glass-bg-mid)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--glass-bg)'
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
    >
      {children}
    </button>
  )
}

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      title={isDark ? '切换浅色' : '切换深色'}
      style={{
        ...glassBtnStyle,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--glass-bg-mid)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--glass-bg)'
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
    >
      <span style={{
        position: 'absolute',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.25s',
        transform: isDark ? 'translateY(0)' : 'translateY(-34px)',
        opacity: isDark ? 1 : 0,
      }}>
        <SunIcon />
      </span>
      <span style={{
        position: 'absolute',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.25s',
        transform: !isDark ? 'translateY(0)' : 'translateY(34px)',
        opacity: !isDark ? 1 : 0,
      }}>
        <MoonIcon />
      </span>
    </button>
  )
}

function NavLink({ id, to, active, icon, children }) {
  // 参考图风格：图标 + 中文标签 + 活跃项底部紫色下划线
  return (
    <Link
      to={to}
      data-nav-id={id}
      data-active={active ? 'true' : 'false'}
      title={typeof children === 'string' ? children : undefined}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 13.5,
        fontWeight: active ? 700 : 500,
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: 'transparent',
        whiteSpace: 'nowrap',          // 整条链接不换行
        minWidth: active ? 'max-content' : 0,
        overflow: active ? 'visible' : 'hidden',
        flexShrink: active ? 0 : 1,
        transition: 'color 0.24s ease, font-weight 0.24s ease',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)' }}
    >
      {icon && <span style={{ fontSize: 13.5, lineHeight: 1, flexShrink: 0 }} aria-hidden>{icon}</span>}
      <span className="topbar-nav-label" style={{ whiteSpace: 'nowrap' }}>{children}</span>
    </Link>
  )
}

function SearchBox({ onClick }) {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
  return (
    <button
      onClick={onClick}
      className="topbar-search"
      style={searchBoxStyle}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent-border)'
        e.currentTarget.style.background = 'var(--glass-bg-mid)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--glass-border)'
        e.currentTarget.style.background = 'var(--glass-bg)'
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)' }}>
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <span className="topbar-search-label" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-tertiary)' }}>搜索算法、指南、项目...</span>
      <kbd className="topbar-search-kbd" style={{ ...kbdStyle, flexShrink: 0 }}>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
    </button>
  )
}

function MenuIcon({ mirrored = false }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ transform: mirrored ? 'scaleX(-1)' : 'none' }}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function Logo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--topbar-logo-a, #a855f7)" />
          <stop offset="0.5" stopColor="var(--topbar-logo-b, #818cf8)" />
          <stop offset="1" stopColor="var(--topbar-logo-c, #ec4899)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#lg)" opacity="0.9" />
      <path d="M7 16 L11 8 L13 12 L17 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2m-7.07-14.07 1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2m-4.93-7.07-1.41 1.41M6.34 17.66l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

// useTopBarVisibility 已迁出到 ./DynamicIsland 模块（与岛壳容器在一起，
// 因为隐藏 / 唤出本质是岛体的视觉行为，与具体内容无关）。

function GitHubIcon() {
  // GitHub mark：简化版章鱼猫轮廓
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.79-.25.79-.55v-1.93c-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.27-1.7-1.27-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 2.89-.39c.98 0 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.07.78 2.15v3.18c0 .31.21.66.79.55C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  )
}

const glassBtnStyle = {
  width: 34,
  height: 34,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--r-sm)',
  background: 'var(--glass-bg)',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: '1px solid var(--glass-border)',
  boxShadow: 'var(--glass-shine)',
  color: 'var(--text-secondary)',
  transition: 'all 0.18s',
}

const searchBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 14px',
  borderRadius: 999,
  background: 'var(--glass-bg)',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: '1px solid var(--glass-border)',
  boxShadow: 'var(--glass-shine)',
  width: 'clamp(44px, 18vw, 280px)',
  maxWidth: 280,
  minWidth: 44,
  flexShrink: 1,
  overflow: 'hidden',
  fontSize: 12.5,
  textAlign: 'left',
  transition: 'all 0.18s',
}

const kbdStyle = {
  padding: '1px 6px',
  fontSize: 10,
  background: 'var(--glass-bg-strong)',
  border: '1px solid var(--glass-border)',
  borderRadius: 5,
  fontFamily: 'inherit',
  color: 'var(--text-tertiary)',
}

// 参考图：白底 + 暗字 + Octocat 图标，与其它玻璃按钮形成对比，强化品牌动作
const githubStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  padding: '7px 16px',
  borderRadius: 999,
  background: 'var(--topbar-github-bg, #ffffff)',
  border: '1px solid var(--topbar-github-border, rgba(0,0,0,0.08))',
  boxShadow: 'var(--topbar-github-shadow, 0 2px 6px rgba(0,0,0,0.10))',
  color: 'var(--topbar-github-fg, #0d1117)',
  fontSize: 13,
  fontWeight: 700,
  flexShrink: 0,
  transition: 'all 0.18s',
}

const menuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '8px 10px',
  border: 'none',
  background: 'transparent',
  borderRadius: 8,
  fontSize: 13,
  color: 'var(--text-primary)',
  cursor: 'pointer',
  textAlign: 'left',
}
