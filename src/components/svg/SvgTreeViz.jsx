import SvgCanvas from './SvgCanvas'

// ─────────────────────────────────────────────────────────────
// SvgTreeViz · 多态树形 SVG 渲染器（Strategy 模式）
//
// 将原来 TreeViz.jsx 和 RBTreeViz.jsx 90% 重复的代码合并：
//   - 边渲染（line + transition）
//   - 节点渲染（g + transform + 高亮脉冲 circle + 主 circle + 文本）
//   - viewBox 自动推算（委托给 SvgCanvas）
//
// 差异点通过 `getNodeStyle` 策略函数注入，调用者只需实现：
//   getNodeStyle(node, isHighlighted) → { fill, stroke, strokeWidth }
//
// 内置两种策略可直接按需引用：
//   DEFAULT_NODE_STYLE — 通用树（blue accent）
//   RB_NODE_STYLE      — 红黑树（红色 / 深灰）
//
// 使用示例：
//
//   // 普通 BST / AVL / Treap
//   <SvgTreeViz stepData={current} />
//
//   // 红黑树
//   <SvgTreeViz stepData={current} getNodeStyle={RB_NODE_STYLE} transition="0.5s" />
//
//   // 完全自定义配色
//   <SvgTreeViz stepData={current} getNodeStyle={(n, hl) => ({
//     fill: hl ? 'orange' : n.visited ? 'green' : 'gray',
//     stroke: 'white',
//     strokeWidth: 2,
//   })} />
// ─────────────────────────────────────────────────────────────

/** 通用树节点样式策略 */
export function DEFAULT_NODE_STYLE(_node, isHighlighted) {
  return {
    fill: isHighlighted ? 'var(--yellow)' : 'var(--accent)',
    stroke: 'var(--border)',
    strokeWidth: 1.5,
  }
}

/** 红黑树节点样式策略（不依赖高亮状态，红黑色仅由 node.color 决定）。
 *  badge：R/B 字母角标——红黑是纯颜色语义，红绿色盲难辨红 vs 深灰，
 *  用字母提供非颜色通道。 */
// eslint-disable-next-line no-unused-vars
export function RB_NODE_STYLE(node, _isHighlighted) {
  const isRed = node.color === 'R'
  return {
    fill: isRed ? '#ef4444' : '#1f2937',
    stroke: isRed ? '#fca5a5' : '#6b7280',
    strokeWidth: 2,
    badge: isRed ? 'R' : 'B',
  }
}

/**
 * SvgTreeViz — 可复用的树形可视化 SVG 组件。
 *
 * Props（全部可选，有默认值）：
 *   stepData      — 当前步骤数据 { nodes, edges, highlight }
 *   getNodeStyle  — 节点颜色策略函数，默认 DEFAULT_NODE_STYLE
 *   pad           — viewBox 内边距（默认 40）
 *   minH          — SVG 最小高度（默认 200）
 *   transition    — CSS 过渡时长字符串（默认 '0.4s'）
 *   nodeRadius    — 节点圆半径（默认 20）
 *   pulseRadius   — 高亮脉冲圆最大半径（默认 26）
 *   emptyLabel    — 空树时显示的文字（默认 '空树'）
 *   svgStyle      — 额外 SVG 样式覆盖
 */
export default function SvgTreeViz({
  stepData,
  getNodeStyle = DEFAULT_NODE_STYLE,
  pad = 40,
  minH = 200,
  transition = '0.4s',
  nodeRadius = 20,
  pulseRadius = 26,
  emptyLabel = '空树',
  svgStyle,
  ariaLabel,
}) {
  // 空树 fallback
  if (!stepData || !stepData.nodes?.length) {
    return (
      <SvgCanvas minH={300} style={svgStyle} ariaLabel={ariaLabel || emptyLabel}>
        <text
          x="50%" y="50%"
          textAnchor="middle"
          fill="var(--text-tertiary)"
          fontSize={14}
        >
          {emptyLabel}
        </text>
      </SvgCanvas>
    )
  }

  const { nodes, edges, highlight } = stepData

  // 预建 id → node 映射，避免在 edges.map 内部重复 find
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))

  const easing = `cubic-bezier(0.4, 0, 0.2, 1)`
  const resolvedAria = ariaLabel
    || `树可视化，共 ${nodes.length} 个节点` + (highlight != null ? `，高亮节点 ${highlight}` : '')

  return (
    <SvgCanvas nodes={nodes} pad={pad} minH={minH} style={svgStyle} ariaLabel={resolvedAria}>
      {({ offsetX, offsetY }) => (
        <>
          {/* ── 边 ── */}
          {edges.map((e) => {
            const a = nodeMap[e.from]
            const b = nodeMap[e.to]
            if (!a || !b) return null
            return (
              <line
                key={`e-${e.from}-${e.to}`}
                x1={a.x + offsetX} y1={a.y + offsetY}
                x2={b.x + offsetX} y2={b.y + offsetY}
                stroke="var(--border)"
                strokeWidth={1.5}
                style={{ transition: `all ${transition} ${easing}` }}
              />
            )
          })}

          {/* ── 节点 ── */}
          {nodes.map(n => {
            const isHL = highlight === n.id
            const ns = getNodeStyle(n, isHL)
            return (
              <g
                key={n.id}
                style={{
                  transform: `translate(${n.x + offsetX}px, ${n.y + offsetY}px)`,
                  transition: `transform ${transition} ${easing}`,
                }}
              >
                {/* 高亮脉冲圈 */}
                {isHL && (
                  <circle
                    r={pulseRadius}
                    fill="none"
                    stroke="var(--yellow)"
                    strokeWidth={ns.strokeWidth + 1}
                    opacity={0.7}
                  >
                    <animate
                      attributeName="r"
                      values={`${nodeRadius};${pulseRadius};${nodeRadius}`}
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.7;0.15;0.7"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* 主体圆 */}
                <circle
                  r={nodeRadius}
                  fill={ns.fill}
                  stroke={ns.stroke}
                  strokeWidth={ns.strokeWidth}
                  style={{ transition: `fill ${transition}, stroke ${transition}` }}
                />

                {/* 节点标签 */}
                <text
                  textAnchor="middle"
                  y={5}
                  fill="white"
                  fontSize={nodeRadius < 18 ? 10 : 12}
                  fontWeight="bold"
                >
                  {n.value}
                </text>

                {/* 非颜色角标（如红黑树 R/B）：右上角小圆 + 字母 */}
                {ns.badge && (
                  <g transform={`translate(${nodeRadius * 0.72}, ${-nodeRadius * 0.72})`}>
                    <circle r={7} fill="var(--surface)" stroke={ns.stroke} strokeWidth={1} />
                    <text textAnchor="middle" y={3} fill="var(--text-primary)" fontSize={9} fontWeight="bold">
                      {ns.badge}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </>
      )}
    </SvgCanvas>
  )
}
