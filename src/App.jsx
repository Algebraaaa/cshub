import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import ErrorBoundary from './components/ErrorBoundary'

const HomePage = lazy(() => import('./pages/HomePage'))
const AlgorithmPage = lazy(() => import('./pages/AlgorithmPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const PathPage = lazy(() => import('./pages/PathPage'))
const LearningCenterPage = lazy(() => import('./pages/LearningCenterPage'))
const LogicPage = lazy(() => import('./pages/LogicPage'))
const AlgorithmComparePage = lazy(() => import('./pages/AlgorithmComparePage'))
const GitHubGuidePage = lazy(() => import('./pages/GitHubGuidePage'))
const AIGuidePage = lazy(() => import('./pages/AIGuidePage'))
const FinancePage = lazy(() => import('./pages/FinancePage'))
const InterviewGuidePage = lazy(() => import('./pages/InterviewGuidePage'))
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'))
const ToolboxPage = lazy(() => import('./pages/ToolboxPage'))
const ProjectsGuidePage = lazy(() => import('./pages/ProjectsGuidePage'))
const SetupGuidePage = lazy(() => import('./pages/SetupGuidePage'))
const PersonalGrowthPage = lazy(() => import('./pages/PersonalGrowthPage'))
const PianoPage = lazy(() => import('./pages/PianoPage'))
const PianoLessonPage = lazy(() => import('./pages/PianoLessonPage'))
const PianoPracticePage = lazy(() => import('./pages/PianoPracticePage'))
const PianoPlaygroundPage = lazy(() => import('./pages/PianoPlaygroundPage'))
const GuitarPage = lazy(() => import('./pages/GuitarPage'))
const GuitarLessonPage = lazy(() => import('./pages/GuitarLessonPage'))
const ViolinPage = lazy(() => import('./pages/ViolinPage'))
const ViolinLessonPage = lazy(() => import('./pages/ViolinLessonPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageFallback() {
  return (
    <div style={{
      minHeight: '55vh',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--text-tertiary)',
      fontWeight: 700,
    }}>
      Loading...
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <Suspense fallback={<PageFallback />}>
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
            <Route path="/interview" element={<InterviewGuidePage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/toolbox" element={<ToolboxPage />} />
            <Route path="/projects" element={<ProjectsGuidePage />} />
            <Route path="/setup" element={<SetupGuidePage />} />
            <Route path="/growth" element={<PersonalGrowthPage />} />
            <Route path="/piano" element={<PianoPage />} />
            <Route path="/piano/lesson/:lessonId" element={<PianoLessonPage />} />
            <Route path="/piano/practice/:slug" element={<PianoPracticePage />} />
            <Route path="/piano/song/:slug" element={<PianoPracticePage />} />
            <Route path="/piano/legacy" element={<PianoPlaygroundPage />} />
            <Route path="/guitar" element={<GuitarPage />} />
            <Route path="/guitar/lesson/:lessonId" element={<GuitarLessonPage />} />
            <Route path="/violin" element={<ViolinPage />} />
            <Route path="/violin/lesson/:lessonId" element={<ViolinLessonPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
