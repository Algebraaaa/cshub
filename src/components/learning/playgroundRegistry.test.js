import { test, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPlaygroundLoader, PLAYGROUND_LOADERS, VIZ_TO_NAME } from './playgroundRegistry.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PG_DIR = path.resolve(__dirname, '../playgrounds')

test('resolves known playground loaders without eager imports', () => {
  expect(typeof getPlaygroundLoader('sorting')).toBe('function')
  expect(typeof getPlaygroundLoader('hashJoin')).toBe('function')
  expect(getPlaygroundLoader('missing-viz')).toBeNull()
})

test('keeps tree visualizations sharing the reusable tree playground', () => {
  expect(PLAYGROUND_LOADERS.bst).toBe(PLAYGROUND_LOADERS.rb)
  expect(PLAYGROUND_LOADERS.bst).toBe(PLAYGROUND_LOADERS.avl)
  expect(PLAYGROUND_LOADERS.bst).toBe(PLAYGROUND_LOADERS.treap)
})

test('every viz key in VIZ_TO_NAME points to an existing Playground file', () => {
  const present = new Set(
    fs.readdirSync(PG_DIR)
      .filter(f => f.endsWith('Playground.jsx'))
      .map(f => f.replace(/\.jsx$/, ''))
  )
  const missing = []
  for (const [viz, name] of Object.entries(VIZ_TO_NAME)) {
    if (!present.has(`${name}Playground`)) {
      missing.push(`${viz} → ${name}Playground.jsx`)
    }
  }
  expect(missing).toEqual([], `registry references missing Playground files:\n  ${missing.join('\n  ')}`)
})
