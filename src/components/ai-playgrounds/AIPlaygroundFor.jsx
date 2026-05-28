import { lazy, Suspense } from 'react'
import { AI_PLAYGROUND_LOADERS } from './aiPlaygroundRegistry'
import { AIPlaygroundTelemetryProvider } from './AIPlaygroundTelemetryContext'

const AI_PLAYGROUND_COMPONENTS = Object.fromEntries(
  Object.entries(AI_PLAYGROUND_LOADERS).map(([viz, loader]) => [viz, lazy(loader)])
)

function PlaygroundFallback() {
  return <div style={{ minHeight: 260 }} aria-busy="true" />
}

export default function AIPlaygroundFor({ viz, onSnapshotChange }) {
  const Playground = AI_PLAYGROUND_COMPONENTS[viz]

  if (!Playground) {
    return (
      <div className="p-6 text-center text-fg-muted text-sm">
        可视化组件 "{viz}" 正在开发中...
      </div>
    )
  }

  return (
    <Suspense fallback={<PlaygroundFallback />}>
      <AIPlaygroundTelemetryProvider onSnapshotChange={onSnapshotChange}>
        <Playground />
      </AIPlaygroundTelemetryProvider>
    </Suspense>
  )
}
