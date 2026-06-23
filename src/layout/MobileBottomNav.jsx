/**
 * MobileBottomNav — 手机端 (≤640px) 固定底部主导航
 *
 * 仅在 viewport === 'phone' 时由 AppLayout 渲染。
 * 6 个 tab：图标 + 2 字短标签，活跃项顶部细线 + 淡色背景 pill。
 * z-index: 78 — 低于 Sidebar 遮罩 (80)，打开侧栏时底栏被自然遮盖。
 *
 * 数据源来自 layout/navItems.js (与 TopBar 共用)。
 */
import { Link, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'

export default function MobileBottomNav() {
  const { pathname } = useLocation()
  const activeId = NAV_ITEMS.find(t => t.match(pathname))?.id

  return (
    <nav
      aria-label="主导航"
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 78,
        display: 'flex',
        alignItems: 'stretch',
        // 56px 可点击区 + iPhone Home 指示器安全区
        height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxSizing: 'border-box',
        background: 'var(--glass-bg-strong)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderTop: '1px solid var(--glass-border)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
      }}
    >
      {NAV_ITEMS.map(tab => {
        const active = tab.id === activeId
        return (
          <Link
            key={tab.id}
            to={tab.to}
            aria-current={active ? 'page' : undefined}
            aria-label={tab.label}
            className="mobile-bottom-tab"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '4px 2px 6px',
              minWidth: 0,
              textDecoration: 'none',
              color: active ? 'var(--accent)' : 'var(--text-tertiary)',
              transition: 'color 0.18s ease',
              position: 'relative',
              WebkitTapHighlightColor: 'transparent',
              outline: 'none',
            }}
          >
            {/* 顶部细线指示 */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: active ? 28 : 0,
                height: 2.5,
                borderRadius: '0 0 3px 3px',
                background: 'var(--accent)',
                transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />

            {/* 活跃项淡色背景 pill */}
            {active && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: '6px 6px 4px',
                  borderRadius: 10,
                  background: 'var(--accent-soft)',
                  pointerEvents: 'none',
                }}
              />
            )}

            <span
              style={{
                width: 24,
                height: 24,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'transform 0.18s ease',
                transform: active ? 'translateY(-1px)' : 'translateY(0)',
              }}
              aria-hidden
            >
              <TabIcon id={tab.id} />
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                lineHeight: 1,
                position: 'relative',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              {tab.shortLabel}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

function TabIcon({ id }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  switch (id) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V21h13V9.5" />
          <path d="M9.5 21v-6h5v6" />
        </svg>
      )
    case 'learn':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="m14.7 9.3-1.9 5.5-5.5 1.9 1.9-5.5 5.5-1.9Z" />
          <path d="M12 12h.01" />
        </svg>
      )
    case 'algo':
      return (
        <svg {...common}>
          <path d="M5 20V10" />
          <path d="M12 20V4" />
          <path d="M19 20v-7" />
          <path d="M3 20h18" />
        </svg>
      )
    case 'logic':
      return (
        <svg {...common}>
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M8.5 14.5A6 6 0 1 1 15.5 14c-.9.6-1.5 1.7-1.5 3h-4c0-1.1-.5-2-1.5-2.5Z" />
          <path d="M12 7v5l3 1.5" />
        </svg>
      )
    case 'finance':
      return (
        <svg {...common}>
          <path d="M12 2v20" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    case 'growth':
      return (
        <svg {...common}>
          <path d="M12 21V11" />
          <path d="M12 11c0-4 2.5-7 7-8 0 5-3 8-7 8Z" />
          <path d="M12 15c0-3.5-2.5-6-7-7 0 4.5 3 7 7 7Z" />
        </svg>
      )
    case 'ai-course':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <circle cx="9" cy="11" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="15" cy="11" r="1.5" fill="currentColor" stroke="none" />
          <path d="M9 16c1.5 1.5 4.5 1.5 6 0" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      )
  }
}
