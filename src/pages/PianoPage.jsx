import { Link } from 'react-router-dom'
import { PIANO_CURRICULUM, PIANO_TOTAL_LESSONS } from '../data/piano/curriculum'
import { useCourseProgress } from '../features/music/hooks/useCourseProgress'

export default function PianoPage() {
  const { progress, isCompleted } = useCourseProgress(PIANO_CURRICULUM.id, PIANO_TOTAL_LESSONS)

  const firstLesson = PIANO_CURRICULUM.chapters[0].lessons[0]
  const nextLesson = findNextLesson(PIANO_CURRICULUM, isCompleted)

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="relative overflow-hidden px-6 py-16 text-center">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, #f59e0b 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="relative max-w-2xl mx-auto">
          <div className="text-6xl mb-4">🎹</div>
          <h1 className="text-4xl font-bold text-fg mb-3">{PIANO_CURRICULUM.title}</h1>
          <p className="text-fg-muted text-base mb-6 max-w-lg mx-auto">
            从认识琴键到弹出第一首完整曲目，一步一步地建立属于你的钢琴基础。
          </p>

          {/* Progress bar */}
          <div className="max-w-sm mx-auto mb-6">
            <div className="flex justify-between text-xs text-fg-faint mb-1.5">
              <span>学习进度</span>
              <span>{progress.count} / {progress.total} 节</span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress.pct}%`, background: '#f59e0b' }}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to={`/piano/lesson/${nextLesson.id}`}
              className="btn-primary px-6 py-2.5 text-sm font-semibold"
            >
              {progress.count === 0 ? '开始学习' : '继续学习'} →
            </Link>
            <Link
              to={`/piano/lesson/${firstLesson.id}`}
              className="btn-ghost px-6 py-2.5 text-sm"
            >
              从头开始
            </Link>
          </div>
        </div>
      </div>

      {/* Chapters */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex flex-col gap-6">
          {PIANO_CURRICULUM.chapters.map((chapter, ci) => {
            const chapterDone = chapter.lessons.filter(l => isCompleted(l.id)).length
            return (
              <section key={chapter.id} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-0.5">
                      第 {ci + 1} 章
                    </div>
                    <h2 className="text-lg font-bold text-fg">{chapter.title}</h2>
                  </div>
                  <span className="text-xs text-fg-faint font-mono">
                    {chapterDone}/{chapter.lessons.length}
                  </span>
                </div>

                <ul className="flex flex-col gap-1">
                  {chapter.lessons.map((lesson, li) => {
                    const done = isCompleted(lesson.id)
                    return (
                      <li key={lesson.id}>
                        <Link
                          to={`/piano/lesson/${lesson.id}`}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface transition-colors group"
                        >
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-colors"
                            style={{
                              background: done ? '#f59e0b22' : 'var(--surface)',
                              color: done ? '#f59e0b' : 'var(--text-tertiary)',
                              border: `1px solid ${done ? '#f59e0b44' : 'var(--border)'}`,
                            }}
                          >
                            {done ? '✓' : `${ci + 1}.${li + 1}`}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="text-sm font-semibold text-fg group-hover:text-accent transition-colors">
                              {lesson.title}
                            </span>
                            {lesson.summary && (
                              <span className="block text-xs text-fg-faint truncate mt-0.5">
                                {lesson.summary}
                              </span>
                            )}
                          </span>
                          {lesson.song && (
                            <span className="text-xs text-fg-faint flex-shrink-0">🎵</span>
                          )}
                          {lesson.exercise && (
                            <span className="text-xs text-fg-faint flex-shrink-0">🎮</span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>

        {/* Song practice shortcut */}
        <div className="mt-8 p-5 rounded-xl border border-border-soft bg-surface/50">
          <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-3">练习曲库</div>
          <p className="text-sm text-fg-muted mb-3">也可以直接进入曲目练习室，结合瀑布流音符练习跟弹。</p>
          <Link to="/piano/legacy" className="btn-ghost text-sm px-4 py-2">
            进入跟弹练习室 →
          </Link>
        </div>
      </div>
    </div>
  )
}

function findNextLesson(curriculum, isCompleted) {
  for (const ch of curriculum.chapters) {
    for (const lesson of ch.lessons) {
      if (!isCompleted(lesson.id)) return lesson
    }
  }
  return curriculum.chapters[0].lessons[0]
}
