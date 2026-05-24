import { Link } from 'react-router-dom'

function flattenLessons(curriculum) {
  return curriculum.chapters.flatMap(ch => ch.lessons)
}

export default function ChapterNav({ curriculum, lessonId, basePath }) {
  const lessons = flattenLessons(curriculum)
  const idx = lessons.findIndex(l => l.id === lessonId)
  const prev = idx > 0 ? lessons[idx - 1] : null
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null

  if (!prev && !next) return null

  return (
    <div className="flex justify-between items-start gap-4 pt-6 mt-6 border-t border-border-soft">
      {prev ? (
        <Link
          to={`${basePath}/lesson/${prev.id}`}
          className="flex flex-col gap-0.5 max-w-[45%] group"
        >
          <span className="text-[10px] font-bold tracking-widest uppercase text-fg-faint group-hover:text-accent transition-colors">
            ← 上一节
          </span>
          <span className="text-sm font-semibold text-fg-muted group-hover:text-fg transition-colors truncate">
            {prev.title}
          </span>
        </Link>
      ) : <div />}

      {next ? (
        <Link
          to={`${basePath}/lesson/${next.id}`}
          className="flex flex-col gap-0.5 items-end max-w-[45%] group"
        >
          <span className="text-[10px] font-bold tracking-widest uppercase text-fg-faint group-hover:text-accent transition-colors">
            下一节 →
          </span>
          <span className="text-sm font-semibold text-fg-muted group-hover:text-fg transition-colors truncate">
            {next.title}
          </span>
        </Link>
      ) : <div />}
    </div>
  )
}
