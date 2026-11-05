// ─────────────────────────────────────────────────────────────
// ielts:export-harness
// 从网页版同一份模板注册表（src/features/ielts/llm/templates.js）和
// 训练路径（core/ladder.js）生成对话式客户端插件所需的：
//   dist-harness/ielts/system-prompt.md
//   dist-harness/ielts/commands.json
// 覆盖：阅读复盘、听力复盘、写作、口语、词块、重置。
// ─────────────────────────────────────────────────────────────
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TEMPLATES, TEMPLATE_IDS } from '../../src/features/ielts/llm/templates.js'
import { getWritingLadder, ERROR_REASONS } from '../../src/features/ielts/core/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, '..', '..', 'dist-harness', 'ielts')

export const COMMANDS = [
  {
    command: '/review-reading',
    mode: 'reading-review',
    description: '阅读一篇复盘：粘贴原文、题目、答案册、自己的答案；判题后逐题讲解并归因。',
    templates: ['reading-explain', 'reading-followup', 'session-summary'],
    input: { passage: '原文', questions: '题目', keys: '答案册', answers: '用户答案', sourceLabel: '来源标签（可选）' },
  },
  {
    command: '/review-listening',
    mode: 'listening-review',
    description: '听力一个 Part 复盘：文稿、题目、答案册、答案与用户反思；定位信号词/改口/干扰。',
    templates: ['listening-explain', 'session-summary'],
    input: { transcript: '听力文稿', questions: '题目', keys: '答案册', answers: '用户答案', reflection: '我的反思' },
  },
  {
    command: '/writing',
    mode: 'writing',
    description: '写作分步训练，路径锁定与网页版一致（ladder）。',
    templates: ['writing-feedback', 'translation-challenge', 'translation-feedback'],
    ladder: getWritingLadder().map((i) => ({ id: i.id, title: i.title, requires: i.requires, timed: i.timed, defaultMinutes: i.defaultMinutes })),
  },
  {
    command: '/speaking',
    mode: 'speaking',
    description: '口语 Part 1/2/3 出题与反馈；Part 3 承接 Part 2 话题；不评发音。',
    templates: ['speaking-prompt', 'speaking-feedback'],
  },
  {
    command: '/vocab',
    mode: 'vocab',
    description: '查询/收藏四类词块与“我的替换库”（词块库在本地维护，模型不参与判分）。',
    templates: [],
  },
  {
    command: '/reset',
    mode: 'reset',
    description: '清空当前会话上下文与待复盘材料；不删除本地错题库（删除需用户在设置页确认）。',
    templates: [],
  },
]

function renderTemplateSection(id) {
  const t = TEMPLATES[id]
  return [
    `### 模板 \`${t.id}\` (v${t.version})`,
    '',
    `- 变量：${t.variables.map((v) => `\`${v}\``).join(', ')}`,
    `- 输出 JSON：\`\`\`json\n${JSON.stringify(t.outputSchema, null, 2)}\n\`\`\``,
    ...(t.evidenceFields.length ? [`- 证据校验字段：${t.evidenceFields.map((f) => `\`${f}\``).join(', ')} 必须逐字来自 \`${t.evidenceSourceVar}\`，失败即标“讲解不可靠”。`] : ['- 无引用原文字段，不做证据校验。']),
    '- 不可移除的约束：',
    ...t.constraints.map((c) => `  - ${c}`),
    '',
  ].join('\n')
}

export function buildSystemPrompt() {
  const lines = []
  lines.push('# IELTS 复盘与刻意练习 · 对话客户端系统提示词')
  lines.push('')
  lines.push('> 本文件由 `npm run ielts:export-harness` 从网页版同一份模板注册表生成，请勿手改。')
  lines.push('')
  lines.push('## 角色与铁律')
  lines.push('')
  lines.push('- 你是雅思复盘教练，不是考生：不重新做题、不推翻答案册。')
  lines.push('- 讲解只依据用户粘贴的原文/文稿与答案册；引用必须逐字，做不到就明说而不是编造。')
  lines.push('- 严格区分：规则判定（确定）/ 模型建议（用户可改）/ 估算分数（非官方成绩）。')
  lines.push('- 不代写整篇作文；口语反馈像真人聊天，发音仅凭文字无法评估。')
  lines.push('- 无 API key 或用户要求演示时，输出必须以【模拟反馈】开头，不得冒充真实讲解。')
  lines.push('')
  lines.push('## 斜杠命令')
  lines.push('')
  for (const c of COMMANDS) {
    lines.push(`- \`${c.command}\` — ${c.description}`)
  }
  lines.push('')
  lines.push('## 固定错因表')
  lines.push('')
  for (const r of ERROR_REASONS) {
    lines.push(`- [${r.module}${r.inferred ? '/推断' : ''}] \`${r.id}\` ${r.label}（${r.source === 'rule' ? '规则可判定' : '模型建议'}）`)
  }
  lines.push('')
  lines.push('## 写作训练路径（锁定规则）')
  lines.push('')
  for (const item of getWritingLadder()) {
    lines.push(`- \`${item.id}\` ${item.title}${item.requires.length ? `，前置：${item.requires.join(' + ')}` : '，直接可练'}`)
  }
  lines.push('')
  lines.push('## 模板定义（与网页版一致）')
  lines.push('')
  for (const id of TEMPLATE_IDS) lines.push(renderTemplateSection(id))
  return lines.join('\n')
}

export function buildCommandsJson() {
  return {
    version: 1,
    generatedFrom: 'src/features/ielts/llm/templates.js + src/features/ielts/core/ladder.js',
    commands: COMMANDS,
    templates: TEMPLATE_IDS.map((id) => {
      const t = TEMPLATES[id]
      return {
        id: t.id, version: t.version, variables: t.variables,
        outputSchema: t.outputSchema, constraints: t.constraints,
        evidenceSourceVar: t.evidenceSourceVar, evidenceFields: t.evidenceFields,
      }
    }),
  }
}

function main() {
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'system-prompt.md'), buildSystemPrompt())
  writeFileSync(join(outDir, 'commands.json'), `${JSON.stringify(buildCommandsJson(), null, 2)}\n`)
  console.log(`[ielts:export-harness] wrote ${outDir}/system-prompt.md and commands.json`)
}

if (import.meta.url === `file://${process.argv[1]}`) main()
