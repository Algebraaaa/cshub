// ─────────────────────────────────────────────────────────────
// SvgCanvas · 通用 SVG 画布容器
//
// 封装了所有 Viz 组件共用的 SVG 容器样式（surface 背景、圆角、边框），
// 并提供 computeViewBox 工具函数，消除 TreeViz / RBTreeViz / 未来新 Viz
// 里重复手写的 viewBox 推算逻辑。
//
// 两种用法：
//
// 1) 手动指定 viewBox（适用于固定坐标系的 GraphViz / FloydViz 等）：
//
//    <SvgCanvas viewBox="0 0 600 360">
//      <line … /> <circle … />
//    </SvgCanvas>
//
// 2) 从 nodes 数组自动推算 viewBox，通过 render prop 注入偏移量
//   （适用于 TreeViz / RBTreeViz 等坐标系随数据变化的场景）：
//
//    <SvgCanvas nodes={nodes} pad={40} minW={400} minH={200}>
//      {({ offsetX, offsetY }) => (
//        <>
//          {edges.map(e => <line x1={a.x + offsetX} …/>)}
//          {nodes.map(n => <g style={{ transform: `translate(${n.x + offsetX}px,…)` }} />)}
//        </>
//      )}
//    </SvgCanvas>
//
// ─────────────────────────────────────────────────────────────

/**
 * 从节点数组推算 SVG viewBox 及坐标偏移量。
 *
 * @param {Array<{x:number,y:number}>} nodes
 * @param {{ pad?: number, minW?: number, minH?: number }} opts
 * @returns {{ viewBox: string, offsetX: number, offsetY: number, W: number, H: number }}
 */
export function computeViewBox(nodes, { pad = 40, minW = 400, minH = 200 } = {}) {
  if (!nodes || nodes.length === 0) {
    return { viewBox: `0 0 ${minW} ${minH}`, offsetX: 0, offsetY: pad, W: minW, H: minH }
  }
  const minX = Math.min(...nodes.map(n => n.x))
  const maxX = Math.max(...nodes.map(n => n.x))
  const maxY = Math.max(...nodes.map(n => n.y))
  const W = Math.max(maxX - minX + pad * 2, minW)
  const H = Math.max(maxY + pad * 2, minH)
  return {
    viewBox: `0 0 ${W} ${H}`,
    offsetX: -minX + pad,
    offsetY: pad,
    W,
    H,
  }
}

/**
 * SvgCanvas — SVG 画布包装器，统一样式并可选自动推算 viewBox。
 *
 * Props：
 *   viewBox  — 手动指定 viewBox 字符串（与 nodes 二选一）
 *   nodes    — 节点数组，用于自动推算 viewBox（与 viewBox 二选一）
 *   pad      — 自动推算时的内边距（默认 40）
 *   minW     — 最小宽度（默认 400）
 *   minH     — 最小高度（默认 200）
 *   style    — 额外 SVG 样式（会覆盖默认值）
 *   children — ReactNode 或 render prop ({ offsetX, offsetY, W, H, viewBox }) => ReactNode
 */
export default function SvgCanvas({
  viewBox,
  nodes,
  pad = 40,
  minW = 400,
  minH = 200,
  style,
  ariaLabel,   // 传入则整块 SVG 变为 role="img" + aria-label，供屏幕阅读器朗读当前状态
  children,
}) {
  const computed = nodes != null ? computeViewBox(nodes, { pad, minW, minH }) : null
  const resolvedViewBox = viewBox ?? computed?.viewBox ?? `0 0 ${minW} ${minH}`

  return (
    <svg
      width="100%"
      viewBox={resolvedViewBox}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      style={{
        background: 'var(--surface)',
        borderRadius: 12,
        border: '1px solid var(--border)',
        minHeight: minH,
        ...style,
      }}
    >
      {typeof children === 'function'
        ? children({ ...(computed ?? { offsetX: 0, offsetY: 0, W: minW, H: minH }), viewBox: resolvedViewBox })
        : children}
    </svg>
  )
}
