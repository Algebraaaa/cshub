import { Link } from 'react-router-dom'

export default function CurriculumIndex({ curriculum, basePath, isCompleted, currentLessonId }) {
  return (
    <nav className="flex flex-col gap-4">
      {curriculum.chapters.map((chapter, ci) => (
        <div key={chapter.id}>
          <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-1 px-2">
            {String(ci + 1).padStart(2, '0')} / {chapter.title}
          </div>
          <ul className="flex flex-col gap-0.5">
            {chapter.lessons.map((lesson) => {
              const done = isCompleted(lesson.id)
              const active = lesson.id === currentLessonId
              return (
                <li key={lesson.id}>
                  <Link
                    to={`${basePath}/lesson/${lesson.id}`}
                    data-active={active ? 'true' : undefined}
                    className={[
                      'flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] transition-colors',
                      active
                        ? 'bg-accent-soft text-fg font-semibold border-l-2 border-accent-border pl-[6px]'
                        : 'text-fg-muted hover:bg-surface hover:text-fg',
                    ].join(' ')}
                  >
                    <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-[10px]">
                      {done ? '✓' : <span className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />}
                    </span>
                    <span className="truncate">{lesson.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
