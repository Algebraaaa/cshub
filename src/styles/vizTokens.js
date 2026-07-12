// ─────────────────────────────────────────────────────────────
// vizTokens · 算法可视化语义颜色 token
//
// 项目内 50+ 处 hex 颜色重复（#ef4444, #f59e0b, #10b981, #8b5cf6, #ec4899...），
// 含义其实只有几种语义角色。把它们集中在这里：
//
//   - 算法语义色：compare / swap / sorted / pivot / merge / found / dim / inactive
//   - 角色色：current / visited / target / source / path / cycle
//   - 算法专用面板色：edge / weight / heap / queue / stack
//   - 桶分组色：BUCKET_COLORS 数组（计数排序、基数排序、桶排序）
//
// 推荐用法：
//
//   import { VIZ_COLORS, BUCKET_COLORS } from '../styles/vizTokens'
//
//   barColor(i) {
//     if (sortedSet.has(i))     return VIZ_COLORS.sorted
//     if (swappedSet.has(i))    return VIZ_COLORS.swap
//     if (comparingSet.has(i))  return VIZ_COLORS.compare
//     return VIZ_COLORS.idle
//   }
//
//   // Legend 标准三色（排序类算法）
//   import { SORTING_LEGEND } from '../styles/vizTokens'
//   <Legend items={SORTING_LEGEND} />
//
// 为什么用 CSS var 而不是直接写 hex？
//   - 跟随主题（light/dark）自动切换
//   - 修改全站色系只改 index.css 一处
//   - 与 Tailwind token 的 text-success / text-warning 等保持一致
//
// 但有些颜色没有对应的 CSS var（例如桶分组），仍用 hex。
// ─────────────────────────────────────────────────────────────

/**
 * 算法步骤语义颜色 —— 对应"算法在做什么"
 *
 * 推荐用于：节点 fill / 单元格 background / 状态标识等
 */
export const VIZ_COLORS = {
  // ── 排序 / 比较类 ──
  compare:  'var(--yellow)',          // 正在比较
  swap:     'var(--red)',             // 正在交换
  sorted:   'var(--green)',           // 已排序 / 完成
  pivot:    'var(--pink)',            // pivot / 当前 key
  merge:    'var(--blue)',            // 归并区间 / 左右半区
  idle:     'var(--bar-default)',     // 未处理（默认色）
  inactive: 'var(--bar-inactive)',    // 堆外 / 区间外（弱化）

  // ── 图 / 树类 ──
  current:  'var(--yellow)',          // 当前访问节点
  visited:  'var(--accent)',          // 已访问
  found:    'var(--green)',           // 命中 / 答案
  source:   '#10b981',                // 起点 S
  target:   '#ec4899',                // 终点 T
  path:     '#8b5cf6',                // 路径 / 回溯路径
  edge:     'var(--border)',          // 默认边
  mst:      'var(--accent)',          // 最小生成树边

  // ── DP / 表格类 ──
  cellActive:  'var(--yellow)',       // 当前更新格
  cellFilled:  'rgba(139,92,246,0.15)', // 已计算
  cellMatch:   'rgba(16,185,129,0.4)',  // 字符相同 / 匹配
  cellInf:     'var(--surface-2)',    // 无解 / ∞

  // ── 状态机 / 高亮 ──
  active:   '#f59e0b',                // 通用 active（不属上述任意类时）
  warning:  'var(--yellow)',          // 警告
  danger:   'var(--red)',             // 错误 / 死锁 / miss
  success:  'var(--green)',           // 成功 / hit
  info:     'var(--blue)',            // 提示
}

/**
 * 桶分组色 —— 桶排序 / 基数排序 / 散列桶等
 *
 * 用法：const color = BUCKET_COLORS[idx % BUCKET_COLORS.length]
 *
 * 12 色一组，与项目内若干 Playground 原本各自硬编码的颜色保持一致，
 * 避免一次性迁移引起视觉差异。
 */
export const BUCKET_COLORS = [
  '#8b5cf6', // 紫
  '#3b82f6', // 蓝
  '#10b981', // 绿
  '#f59e0b', // 橙
  '#ef4444', // 红
  '#ec4899', // 粉
  '#14b8a6', // 青
  '#f97316', // 深橙
  '#6366f1', // 靛
  '#84cc16', // 黄绿
  '#a78bfa', // 浅紫
  '#60a5fa', // 浅蓝
]

/**
 * Legend 预设 —— 直接传给 <Legend items={...} /> 即可。
 * 自定义时请优先复用其中部分项再追加。
 */
// symbol 是给红绿色盲的非颜色线索：比较◇ / 交换⇄ / 完成✓
export const SORTING_LEGEND = [
  { color: VIZ_COLORS.compare, label: '比较中', symbol: '◇' },
  { color: VIZ_COLORS.swap,    label: '交换',   symbol: '⇄' },
  { color: VIZ_COLORS.sorted,  label: '已排序', symbol: '✓' },
]

export const GRAPH_LEGEND = [
  { color: VIZ_COLORS.current, label: '当前节点' },
  { color: VIZ_COLORS.visited, label: '已访问' },
  { color: VIZ_COLORS.idle,    label: '未访问' },
]

export const DP_LEGEND = [
  { color: VIZ_COLORS.cellActive,  label: '当前更新格' },
  { color: VIZ_COLORS.cellFilled,  label: '已计算' },
  { color: VIZ_COLORS.cellInf,     label: '∞（未解）' },
]
