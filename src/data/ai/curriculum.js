// ─────────────────────────────────────────────────────────────
// AI 专业课数据 · 入口薄壳(2026-07 P0 性能优化后)
//
// 原 1650 行组装器已拆为三块:
//   curriculumIndex.js  轻量目录索引(生成产物,同步导出)——目录/导航用
//   enrichLessons.js    课节补全数据与逻辑(原样搬移)
//   loadChapter.js      章节按需装载(dynamic import + Promise 缓存)
//
// 注意:这里刻意**不再**提供 AI_CURRICULUM / AI_LESSON_MAP 同步导出——
// 它们会把全部 10 章正文(~3200 行)拉回同一个 chunk,是当初的问题本身。
// 页面按需选择:
//   目录/同步路径 → import curriculumIndex
//   课节正文     → loadLesson()(仅测试/搜索用 loadFullCurriculum)
// ─────────────────────────────────────────────────────────────
export {
  AI_COURSE_META,
  AI_CHAPTER_INDEX,
  AI_LESSON_INDEX,
  AI_LESSON_ALIASES,
  AI_TOTAL_LESSONS,
} from './curriculumIndex'
export { loadChapter, loadLesson, loadFullCurriculum } from './loadChapter'
