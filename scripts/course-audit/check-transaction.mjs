// Check the page's actual examples against the generator's dirty-read scenario.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { txnIsolation } from '../../src/algorithms/database/transaction.js'

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const source = readFileSync(join(root, 'src/data/algorithms/db.js'), 'utf8')
const match = source.match(/txnIsolation:\s*\{[\s\S]*?cpp:\s*`([^`]*)`,\s*python:\s*`([^`]*)`/)
if (!match) throw new Error('Could not find transaction examples')
// The examples are JS template literals; unescape the backslashes in their contents.
const cpp = match[1].replace(/\\\\/g, '\\')
const python = match[2].replace(/\\\\/g, '\\')
const levels = ['read-uncommitted', 'read-committed', 'repeatable-read', 'serializable']
const expected = levels.map((level) => txnIsolation('dirty', level)
  .find((step) => step.focusTxn === 'T2' && step.actionKind === 'read').seen.T2.at(-1).value)
const temp = mkdtempSync(join(tmpdir(), 'cshub-transaction-'))
try {
  const cppPath = join(temp, 'example.cpp')
  const pyPath = join(temp, 'example.py')
  const binPath = join(temp, 'example')
  writeFileSync(cppPath, cpp)
  writeFileSync(pyPath, python)
  execFileSync('g++', ['-std=c++17', cppPath, '-o', binPath], { timeout: 30000 })
  for (const [command, args] of [[binPath, []], ['python3', ['-I', pyPath]]]) {
    const actual = execFileSync(command, args, { encoding: 'utf8', timeout: 5000 }).trim().split(/\s+/).map(Number)
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${command}: ${actual} differs from generator ${expected}`)
    }
  }
  console.log('Transaction examples compile/run and match the four dirty-read cases:', expected.join(', '))
} finally {
  rmSync(temp, { recursive: true, force: true })
}
