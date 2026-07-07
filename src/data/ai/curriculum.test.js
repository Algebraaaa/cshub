// AI 课程数据完整性验收
// curriculum.js 已拆为 curriculumIndex(轻量目录)+ loadChapter(按章动态加载)
// + enrichLessons(补全注入)。本测试锁住拆分后的结构不变量:章节顺序、
// 课节数、补全注入是否生效,以及生成的索引与实际章节数据的一致性
// (索引漂移时重跑 npm run generate:ai-index)。
import { test, expect } from 'vitest'
import { AI_CHAPTER_INDEX, AI_LESSON_INDEX, AI_LESSON_ALIASES, AI_TOTAL_LESSONS } from './curriculumIndex.js'
import { loadFullCurriculum } from './loadChapter.js'

const AI_CURRICULUM = await loadFullCurriculum()
const AI_LESSON_MAP = Object.fromEntries(
  AI_CURRICULUM.chapters.flatMap(ch => ch.lessons.map(l => [l.id, l]))
)

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
  // 这些课节的 code/pseudocode 由 enrichLessons.js 的注入逻辑补上，
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

test('NLP/CV/RL/LLM 补齐课节存在且内容完整（2026-07 课程补全）', () => {
  const REQUIRED = [
    // NLP：词嵌入训练、多头注意力、掩码机制、Transformer
    'nlp-word-embedding', 'nlp-glove', 'nlp-multihead-attention',
    'nlp-masked-attention', 'nlp-positional-encoding', 'nlp-transformer', 'nlp-bert-gpt',
    // CV：CNN 演进、IoU、NMS、锚框
    'cv-cnn-evolution', 'cv-iou', 'cv-nms', 'cv-anchor-box', 'cv-yolo',
    // RL：Q 学习、经验回放、策略梯度、Actor-Critic、DQN
    'rl-mdp', 'rl-bellman', 'rl-qlearning', 'rl-experience-replay',
    'rl-policy-gradient', 'rl-actor-critic', 'rl-dqn',
    // LLM：预训练、MLM、RAG、工具调用、思维链
    'llm-pretraining', 'llm-mlm', 'llm-rag', 'llm-tool-calling', 'llm-chain-of-thought',
  ]
  for (const id of REQUIRED) {
    const lesson = AI_LESSON_MAP[id]
    expect(lesson, `缺少课节 ${id}`).toBeTruthy()
    expect(typeof lesson.theory, `${id} 缺理论内容`).toBe('string')
    expect(lesson.theory.length, `${id} 理论内容过短`).toBeGreaterThan(200)
    expect(typeof lesson.code?.python, `${id} 缺 python 代码`).toBe('string')
    expect(typeof lesson.pseudocode, `${id} 缺伪代码`).toBe('string')
    expect(lesson.bigO, `${id} 缺复杂度分析`).toBeTruthy()
    expect(Array.isArray(lesson.compare) && lesson.compare.length > 0, `${id} 缺知识点对比`).toBe(true)
    expect(Array.isArray(lesson.quiz) && lesson.quiz.length > 0, `${id} 缺随堂测验`).toBe(true)
  }
})

// ── 索引一致性(防生成产物与章节数据漂移)────────────────────
test('curriculumIndex 与实际章节数据逐项一致', () => {
  expect(AI_CHAPTER_INDEX.map(c => c.id)).toEqual(AI_CURRICULUM.chapters.map(c => c.id))
  for (let i = 0; i < AI_CHAPTER_INDEX.length; i++) {
    const idx = AI_CHAPTER_INDEX[i]
    const real = AI_CURRICULUM.chapters[i]
    expect(idx.title).toBe(real.title)
    expect(idx.lessons.length, `章节 ${idx.id} 课节数漂移`).toBe(real.lessons.length)
    for (let j = 0; j < idx.lessons.length; j++) {
      const li = idx.lessons[j]
      const lr = real.lessons[j]
      expect(li.id, `${idx.id}[${j}] id 漂移`).toBe(lr.id)
      expect(li.title, `${li.id} title 漂移`).toBe(lr.title)
      expect(li.summary ?? null, `${li.id} summary 漂移`).toBe(lr.summary ?? null)
      expect(li.hasExercise, `${li.id} hasExercise 漂移`).toBe(!!lr.exercise)
    }
  }
})

test('AI_LESSON_INDEX 指向有效章节且总数一致', () => {
  expect(AI_TOTAL_LESSONS).toBe(Object.keys(AI_LESSON_INDEX).length)
  const chapterIds = new Set(AI_CHAPTER_INDEX.map(c => c.id))
  for (const [lessonId, entry] of Object.entries(AI_LESSON_INDEX)) {
    expect(chapterIds.has(entry.chapterId), `${lessonId} 的 chapterId 无效`).toBe(true)
  }
})
