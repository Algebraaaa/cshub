import { Link, useParams } from 'react-router-dom'
import { GUITAR_CURRICULUM, GUITAR_LESSON_MAP, GUITAR_TOTAL_LESSONS } from '../data/guitar/curriculum'
import { GUITAR_CHORDS } from '../data/guitar/chords'
import { useCourseProgress } from '../features/music/hooks/useCourseProgress'
import LessonViewer from '../features/music/components/LessonViewer'
import CurriculumIndex from '../features/music/components/CurriculumIndex'
import ChapterNav from '../features/music/components/ChapterNav'
import ChordCard from '../features/guitar/components/ChordCard'
import StrumPattern from '../features/guitar/components/StrumPattern'
import FretboardDiagram from '../features/guitar/components/FretboardDiagram'

function GuitarExercise({ exercise }) {
  if (!exercise) return null

  if (exercise.type === 'chord-diagram') {
    const chords = exercise.chords.map(name => GUITAR_CHORDS[name]).filter(Boolean)
    return (
      <div className="flex flex-wrap gap-4 justify-center">
        {chords.map(chord => (
          <ChordCard key={chord.name} chord={chord} size="md" />
        ))}
      </div>
    )
  }

  if (exercise.type === 'strum-pattern') {
    return (
      <div className="flex flex-col gap-3">
        <StrumPattern pattern={exercise.pattern} label="扫弦节奏型" />
        <p className="text-xs text-fg-faint">↓ = 向下扫弦 &nbsp;·&nbsp; ↑ = 向上扫弦 &nbsp;·&nbsp; - = 跳过</p>
      </div>
    )
  }

  if (exercise.type === 'open-strings') {
    const openShape = [0, 0, 0, 0, 0, 0]
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-fg-muted">六根开放弦，从低到高：E A D G B e</p>
        <FretboardDiagram shape={openShape} frets={3} size="lg" />
      </div>
    )
  }

  return null
}

export default function GuitarLessonPage() {
  const { lessonId } = useParams()
  const lesson = GUITAR_LESSON_MAP[lessonId]
  const { isCompleted, markComplete, progress } = useCourseProgress(
    GUITAR_CURRICULUM.id,
    GUITAR_TOTAL_LESSONS
  )

  if (!lesson) {
    return (
      <div className="p-10 text-center text-fg-muted">
        课节不存在。<Link to="/guitar" className="text-accent hover:underline">返回课程首页</Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 border-r border-border-soft px-3 py-6 overflow-y-auto">
        <Link
          to="/guitar"
          className="flex items-center gap-2 text-fg-muted hover:text-fg text-sm mb-5 transition-colors"
        >
          <span>←</span> <span className="text-xs font-semibold">{GUITAR_CURRICULUM.title}</span>
        </Link>

        <div className="mb-4 px-2">
          <div className="flex justify-between text-[10px] text-fg-faint mb-1">
            <span>进度</span>
            <span>{progress.count}/{progress.total}</span>
          </div>
          <div className="h-1 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress.pct}%`, background: '#10b981' }}
            />
          </div>
        </div>

        <CurriculumIndex
          curriculum={GUITAR_CURRICULUM}
          basePath="/guitar"
          isCompleted={isCompleted}
          currentLessonId={lessonId}
        />
      </aside>

      {/* Main */}
      <main className="flex-1 px-6 py-8 overflow-y-auto">
        <Link
          to="/guitar"
          className="lg:hidden flex items-center gap-1 text-fg-muted hover:text-fg text-sm mb-6 transition-colors"
        >
          ← 课程目录
        </Link>

        <LessonViewer
          lesson={lesson}
          completed={isCompleted(lessonId)}
          onComplete={() => markComplete(lessonId)}
          exerciseSlot={lesson.exercise ? <GuitarExercise exercise={lesson.exercise} /> : null}
        />

        <ChapterNav
          curriculum={GUITAR_CURRICULUM}
          lessonId={lessonId}
          basePath="/guitar"
        />
      </main>
    </div>
  )
}
