// AI 课程轻量目录索引生成器
// 用法: npm run generate:ai-index
//
// 从 chapters/*.js 装载全部课节并跑一遍 enrichChapter(与运行时完全同一逻辑),
// 然后只抽取目录页需要的轻字段(id/title/summary/hasExercise)写入
// src/data/ai/curriculumIndex.js。hasExercise 必须从"补全后"的 lesson 上取,
// 因为 enrichment 可能补出 exercise 相关字段。
// 防漂移:curriculum.test.js 的 index↔章节一致性用例红了就重跑本脚本。
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

const { INFO_THEORY_LESSONS } = await import('../src/data/ai/chapters/it.js')
const { OPTIM_LESSONS } = await import('../src/data/ai/chapters/optim.js')
const { ML_LESSONS } = await import('../src/data/ai/chapters/ml.js')
const { DL_LESSONS } = await import('../src/data/ai/chapters/dl.js')
const { OR_LESSONS } = await import('../src/data/ai/chapters/or.js')
const { FEATURE_LESSONS } = await import('../src/data/ai/chapters/feature.js')
const { NLP_LESSONS } = await import('../src/data/ai/chapters/nlp.js')
const { CV_LESSONS } = await import('../src/data/ai/chapters/cv.js')
const { RL_LESSONS } = await import('../src/data/ai/chapters/rl.js')
const { LLM_LESSONS } = await import('../src/data/ai/chapters/llm.js')
const { enrichChapter } = await import('../src/data/ai/enrichLessons.js')

// 章节顺序与标题:与原 curriculum.js 的 AI_CURRICULUM.chapters 一致
const CHAPTERS = [
  { id: 'optim', title: '最优化方法', lessons: OPTIM_LESSONS },
  { id: 'ml', title: '机器学习基础', lessons: ML_LESSONS },
  { id: 'dl', title: '深度学习', lessons: DL_LESSONS },
  { id: 'or', title: '最优化与运筹优化', lessons: OR_LESSONS },
  { id: 'feature', title: '特征工程与模型评估', lessons: FEATURE_LESSONS },
  { id: 'it', title: '信息论与编码', lessons: INFO_THEORY_LESSONS },
  { id: 'nlp', title: '自然语言处理', lessons: NLP_LESSONS },
  { id: 'cv', title: '计算机视觉', lessons: CV_LESSONS },
  { id: 'rl', title: '强化学习', lessons: RL_LESSONS },
  { id: 'llm', title: '大语言模型', lessons: LLM_LESSONS },
]

const ALIASES = {
  'opt-branch-bound': 'or-branch-and-bound',
  'or-branch-bound': 'or-branch-and-bound',
  'dl-attention': 'nlp-attention',
  attention: 'nlp-attention',
}

for (const ch of CHAPTERS) enrichChapter(ch)

const indexChapters = CHAPTERS.map(ch => ({
  id: ch.id,
  title: ch.title,
  lessons: ch.lessons.map(l => ({
    id: l.id,
    title: l.title,
    summary: l.summary ?? null,
    hasExercise: !!l.exercise,
  })),
}))

const out = `// ─────────────────────────────────────────────────────────────
// AI 课程轻量目录索引 · 自动生成,勿手改
// 重新生成: npm run generate:ai-index
// 只含目录页与课节页同步路径需要的轻字段;课节正文经
// loadChapter.js 按章动态加载。一致性由 curriculum.test.js 锁定。
// ─────────────────────────────────────────────────────────────
export const AI_COURSE_META = ${JSON.stringify({ id: 'ai-masters', title: 'AI 专业课', instrument: 'ai', icon: '🤖', color: '#8b5cf6' }, null, 2)}

export const AI_CHAPTER_INDEX = ${JSON.stringify(indexChapters, null, 2)}

export const AI_LESSON_ALIASES = ${JSON.stringify(ALIASES, null, 2)}

// id → { chapterId, title } 扁平查找表(派生)
export const AI_LESSON_INDEX = Object.fromEntries(
  AI_CHAPTER_INDEX.flatMap(ch => ch.lessons.map(l => [l.id, { chapterId: ch.id, title: l.title }]))
)

export const AI_TOTAL_LESSONS = AI_CHAPTER_INDEX.reduce((sum, ch) => sum + ch.lessons.length, 0)
`

const target = path.resolve(here, '../src/data/ai/curriculumIndex.js')
writeFileSync(target, out, 'utf8')
console.log(`Wrote ${target}: ${indexChapters.length} chapters, ${indexChapters.reduce((s, c) => s + c.lessons.length, 0)} lessons`)
