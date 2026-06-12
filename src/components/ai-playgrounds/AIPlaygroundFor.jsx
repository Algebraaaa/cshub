import { lazy, Suspense } from 'react'
import { AI_PLAYGROUND_LOADERS } from './aiPlaygroundRegistry'
import { AIPlaygroundTelemetryProvider } from './AIPlaygroundTelemetryContext'

const AI_PLAYGROUND_COMPONENTS = Object.fromEntries(
  Object.entries(AI_PLAYGROUND_LOADERS)
    .filter(([, loader]) => typeof loader === 'function')
    .map(([viz, loader]) => [viz, lazy(loader)])
)

function PlaygroundFallback() {
  return <div style={{ minHeight: 260 }} aria-busy="true" />
}

function AIPlaygroundUnavailable({ viz, lesson }) {
  return (
    <div className="rounded-xl border border-border-soft bg-surface p-6 text-left">
      <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint mb-2">
        建设中
      </div>
      <h2 className="text-lg font-bold text-fg mb-2">{lesson?.title || 'AI 课节'}</h2>
      <p className="text-sm leading-7 text-fg-muted mb-3">
        本节内容正在建设中。
      </p>
      <div className="grid gap-2 text-xs text-fg-muted sm:grid-cols-2">
        <div className="rounded-lg border border-border-soft bg-[var(--bg)] px-3 py-2">
          lesson id: <span className="font-mono text-accent">{lesson?.id || '-'}</span>
        </div>
        <div className="rounded-lg border border-border-soft bg-[var(--bg)] px-3 py-2">
          viz: <span className="font-mono text-accent">{viz || '-'}</span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-7 text-fg-muted">
        后续会补充：原理、伪代码、复杂度、可视化、测验、笔记。
      </p>
    </div>
  )
}

export default function AIPlaygroundFor({ viz, lesson, onSnapshotChange }) {
  const Playground = AI_PLAYGROUND_COMPONENTS[viz]

  if (!Playground) {
    return <AIPlaygroundUnavailable viz={viz} lesson={lesson} />
  }

  return (
    <Suspense fallback={<PlaygroundFallback />}>
      <AIPlaygroundTelemetryProvider onSnapshotChange={onSnapshotChange}>
        <Playground viz={viz} lesson={lesson} />
      </AIPlaygroundTelemetryProvider>
    </Suspense>
  )
}
