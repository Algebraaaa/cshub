import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const PAGE_TINTS = [
  { test: p => p === '/' || p === '', tint: '#a855f7' },
  { test: p => p.startsWith('/algo') || p.startsWith('/compare'), tint: '#8b5cf6' },
  { test: p => p.startsWith('/learn') || p.startsWith('/path'), tint: '#2f6fed' },
  { test: p => p.startsWith('/profile'), tint: '#22c55e' },
  { test: p => p.startsWith('/finance'), tint: '#10b981' },
  { test: p => p.startsWith('/books'),   tint: '#d7b56d' },
  { test: p => p.startsWith('/health'),  tint: '#4ade80' },
  { test: p => p.startsWith('/growth'), tint: '#f97316' },
  { test: p => p.startsWith('/logic'), tint: '#0ea5e9' },
  { test: p => p.startsWith('/roadmap'), tint: '#10b981' },
  { test: p => p.startsWith('/projects'), tint: '#a855f7' },
  { test: p => p.startsWith('/interview'), tint: '#f59e0b' },
  { test: p => p.startsWith('/toolbox'), tint: '#60a5fa' },
  { test: p => p.startsWith('/ai'), tint: '#f472b6' },
  { test: p => p.startsWith('/setup'), tint: '#06b6d4' },
]

function pickTint(pathname) {
  for (const rule of PAGE_TINTS) {
    if (rule.test(pathname)) return rule.tint
  }
  return '#a855f7'
}

function hexToRgb(hex) {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return '168,85,247'
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)].join(',')
}

function pickIslandTheme(pathname, tintRgb) {
  const base = {
    vars: {},
    background: `
      linear-gradient(180deg, rgba(${tintRgb}, 0.10) 0%, rgba(${tintRgb}, 0.04) 100%),
      var(--island-bg)
    `,
    border: '1px solid var(--island-border)',
    boxShadow: [
      'var(--island-shadow-outer)',
      'inset 0 1px 0 var(--island-highlight-top)',
      'inset 0 -1px 0 var(--island-highlight-bottom)',
      'inset 0 0 22px rgba(255,255,255,0.06)',
      `0 14px 30px rgba(${tintRgb}, 0.10)`,
    ].join(', '),
  }

  const isLearning =
    pathname.startsWith('/learn') ||
    pathname.startsWith('/path') ||
    ['/roadmap', '/projects', '/interview', '/toolbox', '/setup'].some(path => pathname.startsWith(path))

  if (isLearning) {
    return {
      vars: {
        '--text-primary': '#17212f',
        '--text-secondary': 'rgba(23, 33, 47, 0.72)',
        '--text-tertiary': 'rgba(23, 33, 47, 0.45)',
        '--glass-bg': 'rgba(255, 255, 255, 0.56)',
        '--glass-bg-mid': 'rgba(47, 111, 237, 0.08)',
        '--glass-bg-strong': 'rgba(244, 240, 230, 0.88)',
        '--glass-border': 'rgba(47, 111, 237, 0.18)',
        '--glass-shine': 'inset 0 1px 0 rgba(255,255,255,0.72)',
        '--accent-border': 'rgba(47, 111, 237, 0.28)',
        /* 实色 + 同色光晕：避免渐变两端亮度差 + 异色光晕造成的"视觉倾斜"错觉 */
        '--topbar-active': '#2f6fed',
        '--topbar-active-shadow': '0 0 12px rgba(47, 111, 237, 0.28)',
        '--topbar-github-bg': 'rgba(255, 255, 255, 0.72)',
        '--topbar-github-border': 'rgba(23, 33, 47, 0.12)',
        '--topbar-github-fg': '#17212f',
        '--topbar-github-shadow': '0 8px 22px rgba(23, 33, 47, 0.10)',
        '--topbar-github-hover-shadow': '0 12px 28px rgba(47, 111, 237, 0.16)',
        '--topbar-logo-a': '#2f6fed',
        '--topbar-logo-b': '#13a38b',
        '--topbar-logo-c': '#d15d34',
        '--topbar-avatar-bg': 'linear-gradient(135deg, #2f6fed, #13a38b)',
      },
      background: `
        linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(244, 240, 230, 0.62)),
        linear-gradient(90deg, rgba(47, 111, 237, 0.08), rgba(19, 163, 139, 0.06), rgba(209, 93, 52, 0.07))
      `,
      border: '1px solid rgba(23, 33, 47, 0.12)',
      boxShadow: [
        '0 18px 38px rgba(23, 33, 47, 0.12)',
        'inset 0 1px 0 rgba(255, 255, 255, 0.78)',
        'inset 0 -1px 0 rgba(47, 111, 237, 0.06)',
        '0 12px 30px rgba(47, 111, 237, 0.08)',
      ].join(', '),
    }
  }

  if (pathname.startsWith('/finance') || pathname.startsWith('/books')) {
    return {
      vars: {
        '--text-primary': '#f7efd8',
        '--text-secondary': 'rgba(247, 239, 216, 0.76)',
        '--text-tertiary': 'rgba(247, 239, 216, 0.52)',
        '--glass-bg': 'rgba(247, 239, 216, 0.075)',
        '--glass-bg-mid': 'rgba(247, 239, 216, 0.13)',
        '--glass-bg-strong': 'rgba(247, 239, 216, 0.18)',
        '--glass-border': 'rgba(215, 181, 109, 0.28)',
        '--glass-shine': 'inset 0 1px 0 rgba(247, 239, 216, 0.14)',
        '--accent-border': 'rgba(215, 181, 109, 0.42)',
        '--topbar-active': '#8fcf8a',
        '--topbar-active-shadow': '0 0 12px rgba(143, 207, 138, 0.38)',
        '--topbar-github-bg': 'rgba(247, 239, 216, 0.12)',
        '--topbar-github-border': 'rgba(215, 181, 109, 0.32)',
        '--topbar-github-fg': '#f7efd8',
        '--topbar-github-shadow': '0 2px 10px rgba(0,0,0,0.18)',
        '--topbar-github-hover-shadow': '0 6px 18px rgba(0,0,0,0.28)',
        '--topbar-logo-a': '#d7b56d',
        '--topbar-logo-b': '#4c9769',
        '--topbar-logo-c': '#f7efd8',
        '--topbar-avatar-bg': 'linear-gradient(135deg, #d7b56d, #4c9769)',
      },
      background: `
        linear-gradient(180deg, rgba(215, 181, 109, 0.13), rgba(76, 151, 105, 0.07)),
        rgba(7, 20, 15, 0.74)
      `,
      border: '1px solid rgba(215, 181, 109, 0.26)',
      boxShadow: [
        '0 18px 38px rgba(0, 0, 0, 0.28)',
        'inset 0 1px 0 rgba(247, 239, 216, 0.12)',
        'inset 0 -1px 0 rgba(215, 181, 109, 0.08)',
        '0 12px 30px rgba(76, 151, 105, 0.10)',
      ].join(', '),
    }
  }

  if (pathname.startsWith('/logic')) {
    return {
      vars: {
        '--text-primary': '#f2eee2',
        '--text-secondary': 'rgba(242, 238, 226, 0.72)',
        '--text-tertiary': 'rgba(242, 238, 226, 0.46)',
        '--glass-bg': 'rgba(242, 238, 226, 0.055)',
        '--glass-bg-mid': 'rgba(184, 154, 84, 0.13)',
        '--glass-bg-strong': 'rgba(184, 154, 84, 0.18)',
        '--glass-border': 'rgba(184, 154, 84, 0.28)',
        '--glass-shine': 'inset 0 1px 0 rgba(242, 238, 226, 0.12)',
        '--accent-border': 'rgba(184, 154, 84, 0.42)',
        '--topbar-active': '#b89a54',
        '--topbar-active-shadow': '0 0 12px rgba(184, 154, 84, 0.44)',
        '--topbar-github-bg': 'rgba(242, 238, 226, 0.08)',
        '--topbar-github-border': 'rgba(184, 154, 84, 0.32)',
        '--topbar-github-fg': '#f2eee2',
        '--topbar-github-shadow': '0 2px 10px rgba(0,0,0,0.24)',
        '--topbar-github-hover-shadow': '0 6px 18px rgba(0,0,0,0.34)',
        '--topbar-logo-a': '#b89a54',
        '--topbar-logo-b': '#c24a3e',
        '--topbar-logo-c': '#f2eee2',
        '--topbar-avatar-bg': 'linear-gradient(135deg, #b89a54, #c24a3e)',
      },
      background: `
        linear-gradient(180deg, rgba(184, 154, 84, 0.12), rgba(194, 74, 62, 0.06)),
        rgba(18, 20, 22, 0.76)
      `,
      border: '1px solid rgba(184, 154, 84, 0.30)',
      boxShadow: [
        '0 18px 38px rgba(0, 0, 0, 0.34)',
        'inset 0 1px 0 rgba(242, 238, 226, 0.10)',
        'inset 0 -1px 0 rgba(184, 154, 84, 0.08)',
        '0 12px 30px rgba(194, 74, 62, 0.10)',
      ].join(', '),
    }
  }

  return base
}

export default function DynamicIsland({ children }) {
  const { pathname } = useLocation()
  const autoHidden = useTopBarVisibility()
  const hidden = pathname === '/' ? false : autoHidden
  const tint = pickTint(pathname)
  const tintRgb = hexToRgb(tint)
  const islandTheme = pickIslandTheme(pathname, tintRgb)

  return (
    <>
      <div
        aria-hidden="true"
        className="topbar-reveal-zone"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 18,
          zIndex: 99,
          background: 'transparent',
          pointerEvents: 'none',
        }}
      />
      <header
        className="topbar topbar-island"
        style={{
          position: 'fixed',
          top: 12,
          left: '50%',
          zIndex: 100,
          maxWidth: 'calc(100% - 32px)',
          width: 'min(1240px, calc(100% - 32px))',
          height: 60,
          padding: '0 16px 0 18px',
          borderRadius: 999,
          boxSizing: 'border-box',
          background: islandTheme.background,
          backdropFilter: 'blur(40px) saturate(200%) brightness(1.04)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(1.04)',
          border: islandTheme.border,
          boxShadow: islandTheme.boxShadow,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minWidth: 0,
          whiteSpace: 'nowrap',
          transform: hidden ? 'translate(-50%, calc(-100% - 24px))' : 'translate(-50%, 0)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s',
          ...islandTheme.vars,
        }}
      >
        {children}
      </header>
    </>
  )
}

function useTopBarVisibility() {
  const [hidden, setHidden] = useState(() => {
    if (typeof window === 'undefined') return false
    return !window.matchMedia('(hover: none), (pointer: coarse)').matches
  })

  useEffect(() => {
    const canHover = !window.matchMedia('(hover: none), (pointer: coarse)').matches
    if (!canHover) {
      setHidden(false)
      return undefined
    }

    let hideTimer = null
    function queueHide() {
      window.clearTimeout(hideTimer)
      hideTimer = window.setTimeout(() => setHidden(true), 180)
    }

    function handleMouse(e) {
      const insideTopBar = e.target?.closest?.('.topbar-island')
      if (e.clientY <= 84 || insideTopBar) {
        window.clearTimeout(hideTimer)
        setHidden(false)
      } else {
        queueHide()
      }
    }

    function handleFocus(e) {
      if (e.target?.closest?.('.topbar-island')) {
        window.clearTimeout(hideTimer)
        setHidden(false)
      }
    }

    document.addEventListener('mousemove', handleMouse, { passive: true })
    document.addEventListener('focusin', handleFocus)
    return () => {
      window.clearTimeout(hideTimer)
      document.removeEventListener('mousemove', handleMouse)
      document.removeEventListener('focusin', handleFocus)
    }
  }, [])

  return hidden
}

export function IslandDivider() {
  return (
    <span
      aria-hidden
      style={{
        flexShrink: 0,
        width: 1,
        height: 22,
        background: 'currentColor',
        opacity: 0.16,
        margin: '0 6px',
      }}
    />
  )
}
