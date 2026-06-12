// ─────────────────────────────────────────────────────────────
// 主导航数据源 · TopBar (桌面/iPad) 与 MobileBottomNav (手机) 共用
//   - label     : 桌面 TopBar 显示的中文名
//   - shortLabel: 移动底部导航显示（≤640px 宽度紧张，用 2 字）
//   - icon      : emoji 图标（两处通用）
//   - match     : (pathname) => boolean，判断当前路由是否归属此 tab
// ─────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  {
    id: 'home',
    to: '/',
    label: '首页',
    shortLabel: '首页',
    icon: '🏠',
    match: pathname => pathname === '/',
  },
  {
    id: 'learn',
    to: '/learn',
    label: '资源导航',
    shortLabel: '导航',
    icon: '🧭',
    match: pathname =>
      pathname === '/learn' ||
      pathname === '/path' ||
      pathname.startsWith('/path/') ||
      ['/roadmap', '/projects', '/interview', '/toolbox', '/setup'].some(p => pathname === p || pathname.startsWith(p + '/')),
  },
  {
    id: 'algo',
    to: '/algo/bubblesort',
    label: '算法库',
    shortLabel: '算法',
    icon: '📊',
    match: pathname => pathname.startsWith('/algo/') || pathname.startsWith('/compare'),
  },
  {
    id: 'logic',
    to: '/logic',
    label: '逻辑学',
    shortLabel: '逻辑',
    icon: '🧠',
    match: pathname => pathname === '/logic' || pathname.startsWith('/logic/'),
  },
  {
    id: 'finance',
    to: '/finance',
    label: '理财',
    shortLabel: '理财',
    icon: '💰',
    match: pathname => pathname === '/finance' || pathname.startsWith('/finance/'),
  },
  {
    id: 'growth',
    to: '/growth',
    label: '个人成长',
    shortLabel: '成长',
    icon: '🌱',
    match: pathname => pathname === '/growth' || pathname.startsWith('/growth/'),
  },
  {
    id: 'ai-course',
    to: '/ai-course',
    label: 'AI 专业课',
    shortLabel: 'AI',
    icon: '🤖',
    match: pathname =>
      (pathname === '/ai-course' || pathname.startsWith('/ai-course/')) &&
      !pathname.startsWith('/ai-course/lesson/it-'),
  },
  {
    id: 'information-theory',
    to: '/ai-course?chapter=it',
    label: '信息论',
    shortLabel: '信息',
    icon: '📡',
    match: pathname =>
      pathname === '/information-theory' ||
      pathname.startsWith('/information-theory/') ||
      pathname.startsWith('/ai-course/lesson/it-'),
  },
]
