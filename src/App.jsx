import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import AppLayout from './layout/AppLayout'
import ErrorBoundary from './components/ErrorBoundary'
import PageSkeleton from './components/PageSkeleton'
import { ROUTE_LOADERS, NOT_FOUND_LOADER } from './routeLoaders'

// lazy 工厂统一收敛到 routeLoaders.js(同时供 hover 预热使用,
// 同一路径的 import() 命中同一模块缓存,预热与 lazy 共享请求)
const HomePage = lazy(ROUTE_LOADERS['/'])
const AlgorithmPage = lazy(ROUTE_LOADERS['/algo'])
const ProfilePage = lazy(ROUTE_LOADERS['/profile'])
const PathPage = lazy(ROUTE_LOADERS['/path'])
const LearningCenterPage = lazy(ROUTE_LOADERS['/learn'])
const LogicPage = lazy(ROUTE_LOADERS['/logic'])
const AlgorithmComparePage = lazy(ROUTE_LOADERS['/compare'])
const GitHubGuidePage = lazy(ROUTE_LOADERS['/github'])
const AIGuidePage = lazy(ROUTE_LOADERS['/ai'])
const FinancePage = lazy(ROUTE_LOADERS['/finance'])
const StockMarketPage = lazy(ROUTE_LOADERS['/finance/stocks'])
const InterviewGuidePage = lazy(ROUTE_LOADERS['/interview'])
const RoadmapPage = lazy(ROUTE_LOADERS['/roadmap'])
const ToolboxPage = lazy(ROUTE_LOADERS['/toolbox'])
const ProjectsGuidePage = lazy(ROUTE_LOADERS['/projects'])
const SetupGuidePage = lazy(ROUTE_LOADERS['/setup'])
const PersonalGrowthPage = lazy(ROUTE_LOADERS['/growth'])
const HealthPage = lazy(ROUTE_LOADERS['/health'])
const BookNotesPage = lazy(ROUTE_LOADERS['/books'])
const PianoPage = lazy(ROUTE_LOADERS['/piano'])
const PianoLessonPage = lazy(ROUTE_LOADERS['/piano/lesson'])
const PianoPracticePage = lazy(ROUTE_LOADERS['/piano/practice'])
const PianoPlaygroundPage = lazy(ROUTE_LOADERS['/piano/legacy'])
const GuitarPage = lazy(ROUTE_LOADERS['/guitar'])
const GuitarLessonPage = lazy(ROUTE_LOADERS['/guitar/lesson'])
const ViolinPage = lazy(ROUTE_LOADERS['/violin'])
const ViolinLessonPage = lazy(ROUTE_LOADERS['/violin/lesson'])
const AIPage = lazy(ROUTE_LOADERS['/ai-course'])
const AILessonPage = lazy(ROUTE_LOADERS['/ai-course/lesson'])
const NotFoundPage = lazy(NOT_FOUND_LOADER)

// 路由 → document.title(最长前缀匹配)。浏览器历史/书签/搜索结果
// 不再是清一色 "algo-viz"(审计 #11)。算法/课节等详情页用栏目名兜底,
// 更细粒度的标题可由页面自身覆盖。
const BASE_TITLE = 'CS Hub · 算法可视化学习平台'
const ROUTE_TITLES = {
  '/algo': '算法库',
  '/compare': '算法对比',
  '/learn': '资源导航',
  '/logic': '逻辑学',
  '/finance': '理财',
  '/growth': '个人成长',
  '/ai-course': 'AI 专业课',
  '/path': '学习路径',
  '/profile': '个人主页',
  '/piano': '钢琴',
  '/guitar': '吉他',
  '/violin': '小提琴',
  '/roadmap': '学习路线图',
  '/interview': '面试与求职',
  '/toolbox': '开发者工具箱',
}
const TITLE_KEYS = Object.keys(ROUTE_TITLES).sort((a, b) => b.length - a.length)

function DocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    const key = TITLE_KEYS.find(k => pathname === k || pathname.startsWith(k + '/'))
    document.title = key ? `${ROUTE_TITLES[key]} · CS Hub` : BASE_TITLE
  }, [pathname])
  return null
}

function AppRoutes() {
  // resetKey 让 ErrorBoundary 在路由变化时自动恢复（见 ErrorBoundary.componentDidUpdate）
  const location = useLocation()
  return (
    <ErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/path" element={<PathPage />} />
            <Route path="/path/:pathId" element={<PathPage />} />
            <Route path="/learn" element={<LearningCenterPage />} />
            <Route path="/logic" element={<LogicPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/algo/:slug" element={<AlgorithmPage />} />
            <Route path="/compare" element={<AlgorithmComparePage />} />
            <Route path="/github" element={<GitHubGuidePage />} />
            <Route path="/ai" element={<AIGuidePage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/finance/stocks" element={<StockMarketPage />} />
            <Route path="/interview" element={<InterviewGuidePage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/toolbox" element={<ToolboxPage />} />
            <Route path="/projects" element={<ProjectsGuidePage />} />
            <Route path="/setup" element={<SetupGuidePage />} />
            <Route path="/growth" element={<PersonalGrowthPage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/books/:slug" element={<BookNotesPage />} />
            <Route path="/piano" element={<PianoPage />} />
            <Route path="/piano/lesson/:lessonId" element={<PianoLessonPage />} />
            <Route path="/piano/practice/:slug" element={<PianoPracticePage />} />
            <Route path="/piano/song/:slug" element={<PianoPracticePage />} />
            <Route path="/piano/legacy" element={<PianoPlaygroundPage />} />
            <Route path="/guitar" element={<GuitarPage />} />
            <Route path="/guitar/lesson/:lessonId" element={<GuitarLessonPage />} />
            <Route path="/violin" element={<ViolinPage />} />
            <Route path="/violin/lesson/:lessonId" element={<ViolinLessonPage />} />
            <Route path="/ai-course" element={<AIPage />} />
            <Route path="/ai-course/lesson/:lessonId" element={<AILessonPage />} />
            <Route path="/information-theory" element={<Navigate to="/ai-course?chapter=it" replace />} />
            <Route path="/information-theory/*" element={<Navigate to="/ai-course?chapter=it" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <DocumentTitle />
      <AppRoutes />
    </BrowserRouter>
  )
}
