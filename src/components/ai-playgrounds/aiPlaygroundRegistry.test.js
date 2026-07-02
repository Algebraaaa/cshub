// AI Playground 注册表验收
// 1. 每个 viz key 指向的组件文件必须真实存在（防 rename/删除后悬空）。
// 2. 9 个原 AIConcept 概念流图 viz 已替换为真实演算可视化，不允许回退。
import { test, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { AI_VIZ_TO_NAME } from './aiPlaygroundRegistry.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test('every AI viz key points to an existing Playground file', () => {
  const present = new Set(
    fs.readdirSync(__dirname)
      .filter(f => f.endsWith('Playground.jsx'))
      .map(f => f.replace(/\.jsx$/, ''))
  )
  const missing = []
  for (const [viz, name] of Object.entries(AI_VIZ_TO_NAME)) {
    if (!present.has(`${name}Playground`)) missing.push(`${viz} → ${name}Playground.jsx`)
  }
  expect(missing).toEqual([])
})

test('概念流图占位（AIConcept）已全部替换为真实演算可视化', () => {
  const conceptKeys = Object.entries(AI_VIZ_TO_NAME)
    .filter(([, name]) => name === 'AIConcept')
    .map(([viz]) => viz)
  expect(conceptKeys).toEqual([])
  // 9 个曾经的占位 viz 现在各自有专属组件
  expect(AI_VIZ_TO_NAME.wordEmbedding).toBe('WordEmbedding')
  expect(AI_VIZ_TO_NAME.transformer).toBe('Transformer')
  expect(AI_VIZ_TO_NAME.imageClassification).toBe('ImageClassification')
  expect(AI_VIZ_TO_NAME.objectDetection).toBe('ObjectDetection')
  expect(AI_VIZ_TO_NAME.qlearning).toBe('QLearning')
  expect(AI_VIZ_TO_NAME.policyGradient).toBe('PolicyGradient')
  expect(AI_VIZ_TO_NAME.pretraining).toBe('Pretraining')
  expect(AI_VIZ_TO_NAME.rag).toBe('RAG')
  expect(AI_VIZ_TO_NAME.agent).toBe('AgentLoop')
})

test('curriculum 引用的每个 viz key 都已注册', async () => {
  const { loadFullCurriculum } = await import('../../data/ai/curriculum.js')
  const AI_CURRICULUM = await loadFullCurriculum()
  const missing = []
  for (const ch of AI_CURRICULUM.chapters) {
    for (const lesson of ch.lessons) {
      const viz = lesson.exercise?.viz
      if (viz && !AI_VIZ_TO_NAME[viz]) missing.push(`${lesson.id} → viz "${viz}"`)
    }
  }
  expect(missing).toEqual([])
})
