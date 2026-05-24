import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import TopBar from './TopBar'
import { useIsMobile } from '../hooks/useMediaQuery'

const Sidebar = lazy(() => import('./Sidebar'))

const GUIDE_PATHS = ['/learn', '/github', '/ai', '/finance', '/interview', '/roadmap', '/toolbox', '/projects', '/setup', '/growth', '/logic']

export default function AppLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isAlgo = pathname.startsWith('/algo') || pathname.startsWith('/compare')
  const isGuide = GUIDE_PATHS.some(path => pathname.startsWith(path))
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const mainRef = useRef(null)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  useEffect(() => { setSidebarOpen(false) }, [pathname, isMobile])
  // useLayoutEffect (not useEffect) so the scroll reset happens before the browser
  // paints the new page — otherwise the user briefly sees the new page at the prior
  // scroll position before it snaps to 0.
  useLayoutEffect(() => { mainRef.current?.scrollTo(0, 0) }, [pathname])

  const showGlobalSidebarInline = isAlgo && !isMobile
  const showGlobalSidebarDrawer = isAlgo && isMobile
  const showToggleButton = (isAlgo || isGuide) && !isMobile
  const showMenuButton = (isAlgo || isGuide) && isMobile

  return (
    <div style={{ height: isHome ? 'auto' : '100vh', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Animated background orbs */}
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      {/* FrameEdgeDecor 已迁移到 HomePage 第 1 屏内（components/home/FrameEdgeDecor.jsx），
          作为 Hero 一体的装饰，会随翻页一起滑出，不再放在 AppLayout 外层。 */}

      {/* TopBar 不再承载侧边栏切换——切换按钮改为贴在 Sidebar 右边缘的 rail tab，
          见下方 SidebarRailToggle。TopBar 只保留移动端的汉堡菜单。 */}
      <TopBar
        showMenuButton={showMenuButton}
        onMenuClick={() => setSidebarOpen(o => !o)}
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative', zIndex: 1 }}>
        {showGlobalSidebarInline && (
          <div style={{
            transition: 'width 0.3s ease',
            width: sidebarCollapsed ? 0 : 248,
            overflow: 'hidden',
            height: '100%',
            flexShrink: 0,
          }}>
            <Suspense fallback={null}>
              <Sidebar />
            </Suspense>
          </div>
        )}
        {showToggleButton && !isMobile && showGlobalSidebarInline && (
          <SidebarRailToggle
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(c => !c)}
          />
        )}
        {showGlobalSidebarDrawer && (
          <Suspense fallback={null}>
            <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          </Suspense>
        )}
        <main ref={mainRef} style={{
          flex: 1,
          overflowY: isHome ? 'visible' : (isGuide ? 'hidden' : 'auto'),
          scrollbarGutter: 'stable',
          minHeight: 0,
          background: 'transparent',
        }}>
          <div
            className={isHome ? 'page-container page-home' : (isGuide ? 'page-container page-guide' : 'page-container page-algo')}
            style={{
              maxWidth: isHome ? 1180 : 'none',
              margin: '0 auto',
              width: '100%',
              height: isGuide ? '100%' : 'auto',
              minHeight: isGuide ? 0 : undefined,
              overflow: isGuide ? 'hidden' : undefined,
              paddingLeft: (isHome || isGuide) ? 0 : 16,
              paddingRight: (isHome || isGuide) ? 0 : 16,
            }}>
            <Outlet context={{ sidebarCollapsed, sidebarOpen, closeSidebar, isMobile }} />
          </div>
        </main>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SidebarRailToggle · Sidebar 右边缘的小型箭头拉手
//   尺寸：14 × 38，**四角对称圆角**（borderRadius 999 药丸形），默认就显示箭头让语义一目了然。
//   箭头方向跟随状态：展开时朝左（← 暗示「往里收」），收起时朝右（→ 暗示「往外展」）。
//   位置：展开时 left=234，让药丸一半压在 Sidebar 边缘上、一半探出，视觉锚定到 Sidebar；
//        收起时 left=6，从屏幕左缘外侧 6px 处探出。
// ─────────────────────────────────────────────────────────────
function SidebarRailToggle({ collapsed, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={collapsed ? '展开侧栏' : '收起侧栏'}
      title={collapsed ? '展开侧栏' : '收起侧栏'}
      className="sidebar-rail-toggle"
      data-collapsed={collapsed ? 'true' : 'false'}
      style={{
        position: 'absolute',
        top: '50%',
        left: collapsed ? 6 : 234,
        transform: 'translateY(-50%)',
        width: 14,
        height: 38,
        padding: 0,
        borderRadius: 999,
        background: 'var(--glass-bg-strong)',
        backdropFilter: 'blur(18px) saturate(180%)',
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        color: 'var(--text-tertiary)',
        cursor: 'pointer',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'left 0.3s ease, background 0.18s, color 0.18s, border-color 0.18s',
      }}
    >
      <svg
        width="12" height="12" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden
        style={{
          transform: collapsed ? 'none' : 'scaleX(-1)',
          transition: 'transform 0.25s ease',
        }}
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
}
