// ielts:check-harness —— 确认 dist-harness 里的系统提示词与命令表确实
// 来自网页版同一份定义（重新生成并逐字节比较；漂移即失败）。
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildSystemPrompt, buildCommandsJson } from './export-harness.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const dir = resolve(here, '..', '..', 'dist-harness', 'ielts')

function check(file, expected) {
  const path = join(dir, file)
  if (!existsSync(path)) {
    console.error(`[ielts:check-harness] missing ${path}，请先运行 npm run ielts:export-harness`)
    process.exit(1)
  }
  const actual = readFileSync(path, 'utf8')
  if (actual !== expected) {
    console.error(`[ielts:check-harness] ${file} 与模板注册表/训练路径定义不一致，请重新导出`)
    process.exit(1)
  }
  console.log(`[ielts:check-harness] OK ${file}`)
}

check('system-prompt.md', buildSystemPrompt())
check('commands.json', `${JSON.stringify(buildCommandsJson(), null, 2)}\n`)
