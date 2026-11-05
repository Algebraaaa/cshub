// Run the page's filter and hash-join examples against an independent reference.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const source = readFileSync(join(root, 'src/data/algorithms/db.js'), 'utf8')
const match = source.match(/queryPlan:\s*\{[\s\S]*?cpp:\s*`([^`]*)`,\s*python:\s*`([^`]*)`/)
if (!match) throw new Error('Could not find query plan examples')
const orders = [[1, 150], [1, 80], [2, 200], [4, 150]]
const users = [1, 1, 2, 3]
const expected = [orders.filter(([, amount]) => amount > 100).length,
  orders.reduce((sum, [id]) => sum + users.filter((userId) => userId === id).length, 0)]
const temp = mkdtempSync(join(tmpdir(), 'cshub-query-plan-'))
try {
  const cpp = join(temp, 'example.cpp'), python = join(temp, 'example.py'), binary = join(temp, 'example')
  writeFileSync(cpp, match[1].replace(/\\\\/g, '\\'))
  writeFileSync(python, match[2].replace(/\\\\/g, '\\'))
  execFileSync('g++', ['-std=c++17', cpp, '-o', binary], { timeout: 30000 })
  for (const [command, args] of [[binary, []], ['python3', ['-I', python]]]) {
    const actual = execFileSync(command, args, { encoding: 'utf8', timeout: 5000 }).trim().split(/\s+/).map(Number)
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${command}: ${actual} differs from reference ${expected}`)
    }
  }
  console.log('Query examples match filter and duplicate-key join reference:', expected.join(', '))
} finally {
  rmSync(temp, { recursive: true, force: true })
}
