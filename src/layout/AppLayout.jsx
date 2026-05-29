import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import TopBar from './TopBar'
import MobileBottomNav from './MobileBottomNav'
import { useViewport } from '../hooks/useMediaQuery'

const Sidebar = lazy(() => import('./Sidebar'))

const GUIDE_PATHS = ['/learn', '/github', '/ai', '/finance', '/health', '/interview', '/roadmap', '/toolbox', '/projects', '/setup', '/growth', '/logic', '/books']

const GUIDE_BACK_PATHS = new Set(['/github', '/ai', '/interview', '/roadmap', '/toolbox', '/projects', '/setup'])

function getFloatingBackTarget(pathname) {
  if (pathname.startsWith('/path/')) return '/path'
  if (pathname.startsWith('/piano/lesson/') || pathname.startsWith('/piano/practice/') || pathname.startsWith('/piano/song/') || pathname === '/piano/legacy') return '/piano'
  if (pathname.startsWith('/guitar/lesson/')) return '/guitar'
  if (pathname.startsWith('/violin/lesson/')) return '/violin'
  return null
}

function shouldOffsetFloatingBack(pathname, isPhone, sidebarCollapsed, isAlgo) {
  if (isPhone) return false
  if (pathname.startsWith('/piano/lesson/') || pathname.startsWith('/guitar/lesson/') || pathname.startsWith('/violin/lesson/')) return true
  if (sidebarCollapsed) return false
  return isAlgo || GUIDE_BACK_PATHS.has(pathname)
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const isAlgo = pathname.startsWith('/algo') || pathname.startsWith('/compare')
  const isAICourseHome = pathname === '/ai-course'
  const isGuide = isAICourseHome || GUIDE_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))
  const hasGuideSidebar = GUIDE_BACK_PATHS.has(pathname)
  const floatingBackTarget = getFloatingBackTarget(pathname)
  // 三档断点：phone ≤640 / ipad 641-1024 / desktop >1024
  const viewport = useViewport()
  const isPhone = viewport === 'phone'
  const isIpad = viewport === 'ipad'
  const isDesktop = viewport === 'desktop'
  // 向后兼容：旧代码读取 isMobile 时把 phone 当移动端（iPad 走桌面布局收紧）
  const isMobile = isPhone
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // iPad 默认收起侧栏，给主内容更多空间；桌面默认展开
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => !isDesktop)
  const mainRef = useRef(null)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  useEffect(() => { setSidebarOpen(false) }, [pathname, isPhone])
  // useLayoutEffect (not useEffect) so the scroll reset happens before the browser
  // paints the new page — otherwise the user briefly sees the new page at the prior
  // scroll position before it snaps to 0.
  useLayoutEffect(() => { mainRef.current?.scrollTo(0, 0) }, [pathname])

  // viewport 切换时同步侧栏默认值（桌面→iPad 自动收起；iPad→桌面自动展开）
  useEffect(() => {
    setSidebarCollapsed(!isDesktop)
  }, [isDesktop])

  // iPad 也走桌面端的内嵌侧栏 + RailToggle，仅手机走抽屉
  const showGlobalSidebarInline = isAlgo && !isPhone
  const showGlobalSidebarDrawer = isAlgo && isPhone
  const showToggleButton = (isAlgo || hasGuideSidebar) && !isPhone
  const showMenuButton = (isAlgo || hasGuideSidebar) && isPhone
  const offsetFloatingBack = shouldOffsetFloatingBack(pathname, isPhone, sidebarCollapsed, isAlgo)

  return (
    <div style={{ width: '100%', minWidth: 0, height: isHome ? 'auto' : '100vh', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
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
      {!isPhone && (
        <TopBar
          showMenuButton={showMenuButton}
          onMenuClick={() => setSidebarOpen(o => !o)}
          sidebarOpen={sidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
        />
      )}

      {floatingBackTarget && (
        <Link
          to={floatingBackTarget}
          className={`floating-back-btn${offsetFloatingBack ? ' floating-back-btn--after-sidebar' : ''}`}
          aria-label="返回上级页面"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>返回</span>
        </Link>
      )}

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
        {showToggleButton && !isMobile && (showGlobalSidebarInline || hasGuideSidebar) && (
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
          minWidth: 0,
          width: '100%',
          overflowY: isHome ? 'visible' : (isGuide ? 'hidden' : 'auto'),
          // 当 overflow-y 单独设置为 hidden 时，浏览器会把 overflow-x 从 visible 升级为
          // auto，只要内容有一像素横溢就出现水平滚动条槽（右侧白条）。
          // guide 页面同时锁死 overflow-x，彻底断掉这个升级链。
          overflowX: isGuide ? 'hidden' : undefined,
          // guide/home 页面不需要稳定滚动槽。只有可滚动内容页才加。
          scrollbarGutter: (!isGuide && !isHome) ? 'stable' : undefined,
          minHeight: 0,
          background: 'transparent',
        }}>
          <div
            className={isHome ? 'page-container page-home' : (isGuide ? 'page-container page-guide' : 'page-container page-algo')}
            style={{
              maxWidth: isHome ? 1180 : 'none',
              margin: '0 auto',
              width: '100%',
              minWidth: 0,
              height: isGuide ? '100%' : 'auto',
              minHeight: isGuide ? 0 : undefined,
              overflow: isGuide ? 'hidden' : undefined,
              paddingLeft: (isHome || isGuide) ? 0 : 16,
              paddingRight: (isHome || isGuide) ? 0 : 16,
              // 手机端底部留出底部导航栏高度，内容不被遮挡
              paddingBottom: isPhone && !isGuide
                ? 'calc(56px + env(safe-area-inset-bottom, 0px) + 12px)'
                : undefined,
            }}>
            <Outlet context={{ sidebarCollapsed, sidebarOpen, closeSidebar, isMobile, isPhone, isIpad, viewport }} />
          </div>
        </main>
      </div>

      {/* 手机端底部主导航栏（iPad 走桌面布局，不挂底栏） */}
      {isPhone && <MobileBottomNav />}
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
