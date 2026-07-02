// AI 课程数据完整性验收
// curriculum.js 已按章节拆分到 ./chapters/*.js（2026-06）；
// 本测试锁住拆分后的结构不变量：章节顺序、课节数、补全注入是否生效。
import { test, expect } from 'vitest'
import { AI_CURRICULUM, AI_LESSON_MAP, AI_LESSON_ALIASES, AI_TOTAL_LESSONS } from './curriculum.js'

const EXPECTED_CHAPTERS = ['optim', 'ml', 'dl', 'or', 'feature', 'it', 'nlp', 'cv', 'rl', 'llm']

test('章节顺序与数量保持拆分前的状态', () => {
  expect(AI_CURRICULUM.chapters.map(c => c.id)).toEqual(EXPECTED_CHAPTERS)
  for (const ch of AI_CURRICULUM.chapters) {
    expect(ch.lessons.length, `章节 ${ch.id} 不应为空`).toBeGreaterThan(0)
    expect(typeof ch.title).toBe('string')
  }
})

test('课节总数与扁平索引一致', () => {
  expect(AI_TOTAL_LESSONS).toBe(Object.keys(AI_LESSON_MAP).length)
  // 信息论 14 节由模块表生成
  const it = AI_CURRICULUM.chapters.find(c => c.id === 'it')
  expect(it.lessons.length).toBe(14)
  expect(it.lessons.every(l => l.displayMode === 'visualFirst')).toBe(true)
})

test('每个课节有 id/title，id 全局唯一', () => {
  const seen = new Set()
  for (const ch of AI_CURRICULUM.chapters) {
    for (const lesson of ch.lessons) {
      expect(typeof lesson.id).toBe('string')
      expect(typeof lesson.title).toBe('string')
      expect(seen.has(lesson.id), `课节 id 重复：${lesson.id}`).toBe(false)
      seen.add(lesson.id)
    }
  }
})

test('LATE_COURSE_CODE 注入在拆分后仍然生效', () => {
  // 这些课节的 code/pseudocode 由 curriculum.js 的注入循环补上，
  // 拆分时若丢了 mutate 逻辑，这里会立刻红。
  for (const id of ['rl-qlearning', 'rl-policy-gradient', 'llm-pretraining', 'llm-rag', 'llm-agent', 'nlp-word-embedding', 'nlp-transformer', 'cv-image-classification', 'cv-object-detection']) {
    const lesson = AI_LESSON_MAP[id]
    expect(lesson, `缺少课节 ${id}`).toBeTruthy()
    expect(typeof lesson.code?.python, `${id} 缺 python 代码（注入失败）`).toBe('string')
    expect(typeof lesson.pseudocode, `${id} 缺伪代码（注入失败）`).toBe('string')
  }
})

test('completeAILessonMetadata 补全在拆分后仍然生效', () => {
  for (const ch of AI_CURRICULUM.chapters) {
    for (const lesson of ch.lessons) {
      if (lesson.exercise?.type !== 'playground') continue
      expect(lesson.variablesSnapshot, `${lesson.id} 缺 variablesSnapshot`).toBeTruthy()
      expect(lesson.bigO, `${lesson.id} 缺 bigO`).toBeTruthy()
      expect(Array.isArray(lesson.quiz) && lesson.quiz.length > 0, `${lesson.id} 缺 quiz`).toBe(true)
    }
  }
})

test('课节别名指向真实课节', () => {
  for (const [alias, target] of Object.entries(AI_LESSON_ALIASES)) {
    expect(AI_LESSON_MAP[target], `别名 ${alias} → ${target} 失效`).toBeTruthy()
  }
})
