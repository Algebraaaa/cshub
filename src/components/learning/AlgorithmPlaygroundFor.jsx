import { lazy, Suspense } from 'react'
import { PLAYGROUND_LOADERS } from './playgroundRegistry'

const PLAYGROUND_COMPONENTS = Object.fromEntries(
  Object.entries(PLAYGROUND_LOADERS).map(([viz, loader]) => [viz, lazy(loader)])
)

function PlaygroundFallback() {
  return <div style={{ minHeight: 260 }} aria-busy="true" />
}

export default function PlaygroundFor({ algo }) {
  const Playground = PLAYGROUND_COMPONENTS[algo.viz]
  const props = { algoFn: algo.fn, algoSlug: algo.slug, viz: algo.viz }

  if (!Playground) {
    return <div>Unknown visualization type: {algo.viz}</div>
  }

  return (
    <Suspense fallback={<PlaygroundFallback />}>
      <Playground {...props} />
    </Suspense>
  )
}
