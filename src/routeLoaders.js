// ─────────────────────────────────────────────────────────────
// 路由 chunk 的 import 工厂 · 单一事实源
//   - App.jsx 用它构造 React.lazy(保持代码分割)
//   - useRoutePreload 用它做 hover/focus 预热
//   同一路径的 import() 命中同一模块缓存,预热与 lazy 天然共享请求。
//
//   key 是路径前缀;preloadRoute 按 key 长度降序做最长前缀匹配,
//   因此 '/ai-course/lesson' 会先于 '/ai-course' 命中。
// ─────────────────────────────────────────────────────────────
export const ROUTE_LOADERS = {
  '/': () => import('./pages/HomePage'),
  '/algo': () => import('./pages/AlgorithmPage'),
  '/profile': () => import('./pages/ProfilePage'),
  '/path': () => import('./pages/PathPage'),
  '/learn': () => import('./pages/LearningCenterPage'),
  '/logic': () => import('./pages/LogicPage'),
  '/compare': () => import('./pages/AlgorithmComparePage'),
  '/github': () => import('./pages/GitHubGuidePage'),
  '/ai': () => import('./pages/AIGuidePage'),
  '/finance/stocks': () => import('./pages/StockMarketPage'),
  '/finance': () => import('./pages/FinancePage'),
  '/interview': () => import('./pages/InterviewGuidePage'),
  '/roadmap': () => import('./pages/RoadmapPage'),
  '/toolbox': () => import('./pages/ToolboxPage'),
  '/projects': () => import('./pages/ProjectsGuidePage'),
  '/setup': () => import('./pages/SetupGuidePage'),
  '/growth': () => import('./pages/PersonalGrowthPage'),
  '/ielts/reading': () => import('./pages/IeltsReadingPage'),
  '/ielts/listening': () => import('./pages/IeltsListeningPage'),
  '/ielts/mistakes': () => import('./pages/IeltsMistakesPage'),
  '/ielts/writing': () => import('./pages/IeltsWritingPage'),
  '/ielts/speaking': () => import('./pages/IeltsSpeakingPage'),
  '/ielts/vocab': () => import('./pages/IeltsVocabPage'),
  '/ielts/settings': () => import('./pages/IeltsSettingsPage'),
  '/ielts/sets': () => import('./pages/IeltsSetsPage'),
  '/ielts': () => import('./pages/IeltsPage'),
  '/health': () => import('./pages/HealthPage'),
  '/books': () => import('./pages/BookNotesPage'),
  '/piano/lesson': () => import('./pages/PianoLessonPage'),
  '/piano/practice': () => import('./pages/PianoPracticePage'),
  '/piano/song': () => import('./pages/PianoPracticePage'),
  '/piano/legacy': () => import('./pages/PianoPlaygroundPage'),
  '/piano': () => import('./pages/PianoPage'),
  '/guitar/lesson': () => import('./pages/GuitarLessonPage'),
  '/guitar': () => import('./pages/GuitarPage'),
  '/violin/lesson': () => import('./pages/ViolinLessonPage'),
  '/violin': () => import('./pages/ViolinPage'),
  '/ai-course/lesson': () => import('./pages/AILessonPage'),
  '/ai-course': () => import('./pages/AIPage'),
}

export const NOT_FOUND_LOADER = () => import('./pages/NotFoundPage')

// 按 key 长度降序,保证最长前缀优先(模块加载时算一次)
export const LOADER_KEYS_BY_LENGTH = Object.keys(ROUTE_LOADERS).sort((a, b) => b.length - a.length)
