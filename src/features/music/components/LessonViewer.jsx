import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function LessonViewer({ lesson, completed, onComplete, exerciseSlot }) {
  if (!lesson) return null

  return (
    <article className="max-w-2xl mx-auto pb-16">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-fg mb-1">{lesson.title}</h1>
        {lesson.summary && (
          <p className="text-fg-muted text-sm">{lesson.summary}</p>
        )}
      </header>

      {lesson.theory && (
        <div className="prose-lesson mb-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.theory}</ReactMarkdown>
        </div>
      )}

      {exerciseSlot && (
        <section className="mb-8 p-4 rounded-xl bg-surface border border-border-soft">
          <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-3">
            互动练习
          </div>
          {exerciseSlot}
        </section>
      )}

      {lesson.song && (
        <section className="mb-8 p-4 rounded-xl bg-surface border border-border-soft">
          <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-2">
            配套曲目
          </div>
          <a
            href={lesson.song.href}
            className="inline-flex items-center gap-2 text-accent font-semibold text-sm hover:underline"
          >
            🎵 {lesson.song.label} →
          </a>
        </section>
      )}

      <div className="pt-6 border-t border-border-soft flex items-center gap-4">
        {completed ? (
          <span className="inline-flex items-center gap-2 text-success text-sm font-semibold">
            <span className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-xs">✓</span>
            已完成
          </span>
        ) : (
          <button
            onClick={onComplete}
            className="btn-primary text-sm px-5 py-2"
          >
            完成本节 ✓
          </button>
        )}
      </div>
    </article>
  )
}
