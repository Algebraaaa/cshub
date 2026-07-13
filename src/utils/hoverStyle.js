// ─────────────────────────────────────────────────────────────
// hoverStyle · 内联样式 hover 交互工具
//
// 仅适用于保留 inline style 的旧组件。
// 新组件请改用 Tailwind hover:* 工具类，不要在新代码中引入本模块。
//
// 背景：
//   项目内有大量如下重复片段：
//     onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-strong)' }}
//     onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg-mid)'   }}
//   本工具将它们收拢为一个调用，并保持完全相同的语义。
//
// 多键示例（自动恢复 key 列表）：
//   <button {...hoverHandlers(
//     { background: 'var(--glass-bg-strong)', color: 'var(--text-primary)' },
//     { background: 'var(--glass-bg-mid)',    color: 'var(--text-secondary)' },
//   )}>…</button>
//
// 单键简写示例（不提供 base 时，离开后将该属性重置为空字符串）：
//   <a {...hoverHandlers({ color: 'var(--accent)' })}>…</a>
//
// 注意：当组件根据 active 状态条件返回不同的 onMouse* 时，可以：
//   const handlers = active ? {} : hoverHandlers(hover, base)
//   <button {...handlers}>…</button>
// ─────────────────────────────────────────────────────────────

/**
 * 生成 onMouseEnter / onMouseLeave 事件处理器对象。
 *
 * @param {Record<string, string|number>} hover  - 鼠标进入时叠加的样式
 * @param {Record<string, string|number>} [base] - 鼠标离开时恢复的样式
 *   若省略，则将 hover 中每个 key 对应的属性重置为 ''（让 CSS 变量或继承样式接管）。
 * @returns {{ onMouseEnter: function, onMouseLeave: function }}
 */
export function hoverHandlers(hover, base) {
  const leaveStyle = base ?? Object.fromEntries(Object.keys(hover).map(k => [k, '']))
  return {
    onMouseEnter: (e) => Object.assign(e.currentTarget.style, hover),
    onMouseLeave: (e) => Object.assign(e.currentTarget.style, leaveStyle),
  }
}

/**
 * 条件版本 - 当 disabled 为 true 时不附加任何处理器。
 * 常见场景：active 状态下不响应 hover。
 *
 * @param {boolean}      disabled - 为 true 时返回空对象
 * @param {Record<string, string|number>} hover
 * @param {Record<string, string|number>} [base]
 */
export function hoverHandlersIf(disabled, hover, base) {
  if (disabled) return {}
  return hoverHandlers(hover, base)
}
