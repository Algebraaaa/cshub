// ─────────────────────────────────────────────────────────────
// AI 课程章节按需装载器
//   - 章节正文 dynamic import → 每章独立 chunk,目录页零正文加载
//   - Promise 缓存:React 19 use() 要求同一 id 返回同一 Promise 实例
//     (否则每次渲染新 Promise → 无限 suspend);同时保证 enrichChapter
//     的原位 mutate 只执行一次
//   - 本文件静态 import enrichLessons(补全数据 ~1600 行),只会进
//     AILessonPage 一侧的 chunk;AIPage 目录页不得 import 本文件
//     (预热请用 import('./loadChapter') 动态引)
// ─────────────────────────────────────────────────────────────
import { AI_CHAPTER_INDEX, AI_LESSON_INDEX } from './curriculumIndex'
import { enrichChapter } from './enrichLessons'

// 显式映射(章节文件导出名不规则,如 INFO_THEORY_LESSONS,不用 glob)
const CHAPTER_MODULES = {
  optim: () => import('./chapters/optim').then(m => m.OPTIM_LESSONS),
  ml: () => import('./chapters/ml').then(m => m.ML_LESSONS),
  dl: () => import('./chapters/dl').then(m => m.DL_LESSONS),
  or: () => import('./chapters/or').then(m => m.OR_LESSONS),
  feature: () => import('./chapters/feature').then(m => m.FEATURE_LESSONS),
  it: () => import('./chapters/it').then(m => m.INFO_THEORY_LESSONS),
  nlp: () => import('./chapters/nlp').then(m => m.NLP_LESSONS),
  cv: () => import('./chapters/cv').then(m => m.CV_LESSONS),
  rl: () => import('./chapters/rl').then(m => m.RL_LESSONS),
  llm: () => import('./chapters/llm').then(m => m.LLM_LESSONS),
}

const chapterCache = new Map() // chapterId → Promise<chapter>
const lessonCache = new Map()  // lessonId → Promise<lesson>

/** 加载并补全一个章节,返回 { id, title, lessons }(缓存 Promise) */
export function loadChapter(chapterId) {
  if (chapterCache.has(chapterId)) return chapterCache.get(chapterId)
  const loader = CHAPTER_MODULES[chapterId]
  if (!loader) return Promise.reject(new Error(`未知 AI 章节: ${chapterId}`))
  const meta = AI_CHAPTER_INDEX.find(ch => ch.id === chapterId)
  const promise = loader()
    .then(lessons => enrichChapter({ id: chapterId, title: meta?.title || chapterId, lessons }))
    .catch(err => { chapterCache.delete(chapterId); throw err }) // 失败允许重试
  chapterCache.set(chapterId, promise)
  return promise
}

/** 按课节 id 加载(经章节缓存),返回补全后的 lesson 对象(缓存 Promise) */
export function loadLesson(lessonId) {
  if (lessonCache.has(lessonId)) return lessonCache.get(lessonId)
  const entry = AI_LESSON_INDEX[lessonId]
  if (!entry) return Promise.reject(new Error(`未知 AI 课节: ${lessonId}`))
  const promise = loadChapter(entry.chapterId)
    .then(chapter => {
      const lesson = chapter.lessons.find(l => l.id === lessonId)
      if (!lesson) throw new Error(`章节 ${entry.chapterId} 中缺少课节 ${lessonId}(索引漂移,请重跑 npm run generate:ai-index)`)
      return lesson
    })
    .catch(err => { lessonCache.delete(lessonId); throw err })
  lessonCache.set(lessonId, promise)
  return promise
}

/** 全量装载(测试/搜索用途;页面不要调用,会拉全部 10 个章节 chunk) */
export async function loadFullCurriculum() {
  const chapters = await Promise.all(AI_CHAPTER_INDEX.map(ch => loadChapter(ch.id)))
  return { chapters }
}
