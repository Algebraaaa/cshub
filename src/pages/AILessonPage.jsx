import { lazy, Suspense, use, useCallback, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
// 同步路径(别名解析/404/侧栏目录)走轻量索引;课节正文经 loadLesson 按章动态加载
import { AI_COURSE_META, AI_CHAPTER_INDEX, AI_LESSON_ALIASES, AI_LESSON_INDEX, AI_TOTAL_LESSONS } from '../data/ai/curriculumIndex'
import { loadLesson } from '../data/ai/loadChapter'
import { useCourseProgress } from '../features/music/hooks/useCourseProgress'
import LessonViewer from '../features/music/components/LessonViewer'
import CurriculumIndex from '../features/music/components/CurriculumIndex'
import ChapterNav from '../features/music/components/ChapterNav'
import PageSkeleton from '../components/PageSkeleton'

const AIPlaygroundFor = lazy(() => import('../components/ai-playgrounds/AIPlaygroundFor'))

// CurriculumIndex / ChapterNav 只读 chapters[].lessons[].id/title,索引形状完全兼容
const CURRICULUM_FOR_NAV = { ...AI_COURSE_META, chapters: AI_CHAPTER_INDEX }

function AIExercise({ exercise, lesson, onSnapshotChange }) {
  if (!exercise || exercise.type !== 'playground') return null
  return (
    <Suspense fallback={<div className="h-64 bg-surface rounded-lg animate-pulse" />}>
      <AIPlaygroundFor viz={exercise.viz} lesson={lesson} onSnapshotChange={onSnapshotChange} />
    </Suspense>
  )
}

// 课节正文:use() 挂起等待章节 chunk;loadLesson 按 id 缓存 Promise,
// 重渲染拿到同一实例不会无限 suspend。快照状态属于具体课节,一并放在这里,
// lessonId 变化时组件因 key 重建,状态自然复位。
function LessonBody({ canonicalLessonId, lessonId, isCompleted, markComplete }) {
  const lesson = use(loadLesson(canonicalLessonId))
  const [playgroundSnapshot, setPlaygroundSnapshot] = useState(null)
  const snapshotKeyRef = useRef('')

  const handlePlaygroundSnapshot = useCallback((snapshot) => {
    const current = snapshot?.current || {}
    const key = JSON.stringify({
      lessonId,
      presetId: snapshot?.presetId,
      currentStep: snapshot?.currentStep,
      total: snapshot?.total,
      state: snapshot?.state,
      loss: typeof current.loss === 'number' ? Number(current.loss.toFixed(6)) : current.loss,
      x: typeof current.x === 'number' ? Number(current.x.toFixed(6)) : current.x,
      y: typeof current.y === 'number' ? Number(current.y.toFixed(6)) : current.y,
    })
    if (snapshotKeyRef.current === key) return
    snapshotKeyRef.current = key
    setPlaygroundSnapshot(snapshot)
  }, [lessonId])

  return (
    <>
      <LessonViewer
        lesson={lesson}
        completed={isCompleted(canonicalLessonId)}
        onComplete={() => markComplete(canonicalLessonId)}
        playgroundSnapshot={playgroundSnapshot}
        showDetailTabs
        showIncompleteLessonFallback
        exerciseSlot={lesson.exercise ? (
          <AIExercise exercise={lesson.exercise} lesson={lesson} onSnapshotChange={handlePlaygroundSnapshot} />
        ) : null}
      />

      <ChapterNav
        curriculum={CURRICULUM_FOR_NAV}
        lessonId={canonicalLessonId}
        basePath="/ai-course"
      />
    </>
  )
}

export default function AILessonPage() {
  const { lessonId } = useParams()
  const canonicalLessonId = AI_LESSON_ALIASES[lessonId] || lessonId
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const lessonExists = !!AI_LESSON_INDEX[canonicalLessonId]
  const { isCompleted, markComplete, progress } = useCourseProgress(
    AI_COURSE_META.id,
    AI_TOTAL_LESSONS
  )

  if (canonicalLessonId !== lessonId && lessonExists) {
    return <Navigate to={`/ai-course/lesson/${canonicalLessonId}`} replace />
  }

  if (!lessonExists) {
    return (
      <div className="p-10 text-center text-fg-muted">
        课节不存在。<Link to="/ai-course" className="text-accent hover:underline">返回课程首页</Link>
      </div>
    )
  }

  return (
    <div className="music-lesson-shell">
      <button
        type="button"
        className="music-lesson-sidebar-toggle"
        data-collapsed={sidebarCollapsed ? 'true' : 'false'}
        aria-label={sidebarCollapsed ? '展开课程目录' : '收起课程目录'}
        title={sidebarCollapsed ? '展开课程目录' : '收起课程目录'}
        onClick={() => setSidebarCollapsed(v => !v)}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Sidebar:纯索引数据,立即渲染,不等章节 chunk */}
      <div className="music-lesson-sidebar-frame" data-collapsed={sidebarCollapsed ? 'true' : 'false'}>
        <aside className="flex h-full flex-col w-60 flex-shrink-0 border-r border-border-soft px-3 py-6 overflow-y-auto">
          <Link
            to="/ai-course"
            className="flex items-center gap-2 text-fg-muted hover:text-fg text-sm mb-5 transition-colors"
          >
            <span>←</span> <span className="text-xs font-semibold">{AI_COURSE_META.title}</span>
          </Link>

          <div className="mb-4 px-2">
            <div className="flex justify-between text-[10px] text-fg-faint mb-1">
              <span>进度</span>
              <span>{progress.count}/{progress.total}</span>
            </div>
            <div className="h-1 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress.pct}%`, background: '#8b5cf6' }}
              />
            </div>
          </div>

          <CurriculumIndex
            curriculum={CURRICULUM_FOR_NAV}
            basePath="/ai-course"
            isCompleted={isCompleted}
            currentLessonId={canonicalLessonId}
          />
        </aside>
      </div>

      {/* Main:正文挂起期间显示紧凑骨架 */}
      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-8 sm:px-5 2xl:px-6">
        <Link
          to="/ai-course"
          className="lg:hidden flex items-center gap-1 text-fg-muted hover:text-fg text-sm mb-6 transition-colors"
        >
          ← 课程目录
        </Link>

        <Suspense fallback={<PageSkeleton compact />}>
          <LessonBody
            key={canonicalLessonId}
            canonicalLessonId={canonicalLessonId}
            lessonId={lessonId}
            isCompleted={isCompleted}
            markComplete={markComplete}
          />
        </Suspense>
      </main>
    </div>
  )
}
