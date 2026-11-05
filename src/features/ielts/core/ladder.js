// ─────────────────────────────────────────────────────────────
// ladder · 写作训练路径（固定定义，网页与对话插件共用同一份）
//
// 解锁规则（产品定稿第六节）：
//   t1-intro → t1-overview → t1-body → mock-t1
//   t2-intro、t2-conclusion（各自独立解锁）→ t2-outline → t2-body → mock-t2
//   mock-t1 + mock-t2 → mock-full
//   translation 随时可练
// ─────────────────────────────────────────────────────────────

/**
 * @typedef {Object} LadderItem
 * @property {string} id
 * @property {string} title
 * @property {'task1'|'task2'|'integrated'|'foundation'} track
 * @property {string[]} requires 必须先完成的练习项 id
 * @property {boolean} timed 是否限时项
 * @property {number} [defaultMinutes] 限时项的默认分钟数
 * @property {'step'|'mock'} kind
 */

/** @type {LadderItem[]} */
const ITEMS = [
  { id: 't1-intro', title: 'Task 1 开头改写', track: 'task1', requires: [], timed: false, kind: 'step' },
  { id: 't1-overview', title: 'Task 1 overview', track: 'task1', requires: ['t1-intro'], timed: false, kind: 'step' },
  { id: 't1-body', title: 'Task 1 主体段数据描述', track: 'task1', requires: ['t1-overview'], timed: false, kind: 'step' },
  { id: 'mock-t1', title: '20 分钟小作文限时', track: 'task1', requires: ['t1-body'], timed: true, defaultMinutes: 20, kind: 'mock' },
  { id: 't2-intro', title: 'Task 2 开头改写', track: 'task2', requires: [], timed: false, kind: 'step' },
  { id: 't2-conclusion', title: 'Task 2 结尾总结', track: 'task2', requires: [], timed: false, kind: 'step' },
  { id: 't2-outline', title: 'Task 2 构思框架', track: 'task2', requires: ['t2-intro', 't2-conclusion'], timed: true, defaultMinutes: 10, kind: 'step' },
  { id: 't2-body', title: 'Task 2 主体段展开', track: 'task2', requires: ['t2-outline'], timed: false, kind: 'step' },
  { id: 'mock-t2', title: '40 分钟大作文限时', track: 'task2', requires: ['t2-body'], timed: true, defaultMinutes: 40, kind: 'mock' },
  { id: 'mock-full', title: '60 分钟全套限时', track: 'integrated', requires: ['mock-t1', 'mock-t2'], timed: true, defaultMinutes: 60, kind: 'mock' },
  { id: 'translation', title: '中译英句型', track: 'foundation', requires: [], timed: false, kind: 'step' },
]

const ITEM_MAP = new Map(ITEMS.map((item) => [item.id, item]))

/**
 * @returns {LadderItem[]} 训练路径定义（顺序即建议练习顺序）
 */
export function getWritingLadder() {
  return ITEMS.map((item) => ({ ...item, requires: [...item.requires] }))
}

/**
 * 能否开始某个练习项。未知 id 返回 false；直接输入地址也由它拦截。
 * @param {{ completed: string[] }} progress
 * @param {string} itemId
 * @returns {boolean}
 */
export function canStart(progress, itemId) {
  const item = ITEM_MAP.get(itemId)
  if (!item) return false
  if (!progress || !Array.isArray(progress.completed)) return false
  const done = new Set(progress.completed)
  return item.requires.every((req) => done.has(req))
}
