import { Link, useParams } from 'react-router-dom'
import { VIOLIN_CURRICULUM, VIOLIN_LESSON_MAP, VIOLIN_TOTAL_LESSONS } from '../data/violin/curriculum'
import { useCourseProgress } from '../features/music/hooks/useCourseProgress'
import LessonViewer from '../features/music/components/LessonViewer'
import CurriculumIndex from '../features/music/components/CurriculumIndex'
import ChapterNav from '../features/music/components/ChapterNav'
import StringDiagram from '../features/violin/components/StringDiagram'
import FingeringChart from '../features/violin/components/FingeringChart'
import BowingIndicator from '../features/violin/components/BowingIndicator'

function ViolinExercise({ exercise }) {
  if (!exercise) return null

  if (exercise.type === 'string-diagram') {
    return (
      <div className="flex justify-center">
        <StringDiagram
          highlightNotes={exercise.highlightNotes ?? []}
          highlightStrings={exercise.highlightStrings ?? null}
          showFingers
        />
      </div>
    )
  }

  if (exercise.type === 'fingering-chart') {
    return <FingeringChart highlightNotes={exercise.highlightNotes ?? []} />
  }

  if (exercise.type === 'bowing') {
    return (
      <div className="flex gap-6 justify-center flex-wrap">
        <BowingIndicator direction="down" label="下弓" />
        <BowingIndicator direction="up" label="上弓" />
      </div>
    )
  }

  return null
}

export default function ViolinLessonPage() {
  const { lessonId } = useParams()
  const lesson = VIOLIN_LESSON_MAP[lessonId]
  const { isCompleted, markComplete, progress } = useCourseProgress(
    VIOLIN_CURRICULUM.id,
    VIOLIN_TOTAL_LESSONS
  )

  if (!lesson) {
    return (
      <div className="p-10 text-center text-fg-muted">
        课节不存在。<Link to="/violin" className="text-accent hover:underline">返回课程首页</Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 border-r border-border-soft px-3 py-6 overflow-y-auto">
        <Link
          to="/violin"
          className="flex items-center gap-2 text-fg-muted hover:text-fg text-sm mb-5 transition-colors"
        >
          <span>←</span> <span className="text-xs font-semibold">{VIOLIN_CURRICULUM.title}</span>
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
          curriculum={VIOLIN_CURRICULUM}
          basePath="/violin"
          isCompleted={isCompleted}
          currentLessonId={lessonId}
        />
      </aside>

      {/* Main */}
      <main className="flex-1 px-6 py-8 overflow-y-auto">
        <Link
          to="/violin"
          className="lg:hidden flex items-center gap-1 text-fg-muted hover:text-fg text-sm mb-6 transition-colors"
        >
          ← 课程目录
        </Link>

        <LessonViewer
          lesson={lesson}
          completed={isCompleted(lessonId)}
          onComplete={() => markComplete(lessonId)}
          exerciseSlot={lesson.exercise ? <ViolinExercise exercise={lesson.exercise} /> : null}
        />

        <ChapterNav
          curriculum={VIOLIN_CURRICULUM}
          lessonId={lessonId}
          basePath="/violin"
        />
      </main>
    </div>
  )
}
