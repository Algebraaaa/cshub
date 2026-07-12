// ─────────────────────────────────────────────────────────────
// 通用排序可视化(冒泡/选择/插入/希尔共用)
//
// 2026-07 动画升级,对齐 VisuAlgo(NUS)/ USFCA Galles / Sedgewick
// (Princeton) 排序动画的公认教学惯例:
//   1. 元素带稳定 id(attachStableIds 预计算),交换/移位时柱子
//      **实际滑过彼此**——学习者能追踪"同一个元素的旅程",
//      而不是看两根柱子原地互变高度
//   2. 活跃元素上浮抬起(比较=黄、交换=红),视线自然锁定动作点
//   3. 底部索引行 + 比较/交换位置的 ▲ 指针(CLRS 板书风格),
//      强化"位置 vs 元素"的区分
//   4. 动画时长跟随播放速度自适应:慢速细品,快速不拖沓
//   5. 百分比布局,任意数组长度自适应宽度
// ─────────────────────────────────────────────────────────────

/**
 * 为步骤序列附加稳定元素 id(纯函数,SortingPlayground 在 computeSteps 里调用)。
 * 相邻步骤间按"值的第 k 次出现"匹配——重复值也能稳定追踪,
 * 且与稳定排序的语义一致(相等元素不互换)。
 * 产出:每步新增 ids 数组,ids[i] = 当前下标 i 处元素的身份。
 */
export function attachStableIds(steps) {
  if (!steps?.length || !steps[0].array) return steps
  let ids = steps[0].array.map((_, i) => i)
  let prev = steps[0].array
  let nextFresh = prev.length            // 新值(如有)的后备 id
  return steps.map((s, k) => {
    if (k > 0 && s.array) {
      const buckets = new Map()          // 值 → 该值在上一步的 id 队列
      prev.forEach((v, i) => {
        if (!buckets.has(v)) buckets.set(v, [])
        buckets.get(v).push(ids[i])
      })
      ids = s.array.map(v => {
        const q = buckets.get(v)
        return q && q.length ? q.shift() : nextFresh++
      })
      prev = s.array
    }
    return { ...s, ids }
  })
}

export default function SortingViz({ stepData, maxVal, speedMs = 1000 }) {
  if (!stepData) return null
  const { array, ids, comparing = [], swapped = [], sorted = [], mergeRange = [], pivot } = stepData
  const max = maxVal || Math.max(...array)
  const n = array.length

  // 动画时长跟随播放速度:快速播放时动作利落,慢速时舒展可品
  const dur = Math.max(120, Math.min(450, speedMs * 0.45))

  function barState(i) {
    if (swapped.includes(i))  return { color: 'var(--red)',          lift: true,  glow: 'rgba(248,113,113,0.45)' }
    if (comparing.includes(i)) return { color: 'var(--yellow)',      lift: true,  glow: 'rgba(250,204,21,0.4)' }
    if (pivot === i)          return { color: 'var(--accent-light)', lift: false, glow: 'var(--accent-soft)' }
    if (sorted.includes(i))   return { color: 'var(--green)',        lift: false, glow: null }
    if (mergeRange.length === 2 && i >= mergeRange[0] && i <= mergeRange[1])
      return { color: 'var(--blue)', lift: false, glow: null }
    return { color: 'var(--bar-default)', lift: false, glow: null }
  }

  // 指针行:按状态返回 {色, 形}。形状是给红绿色盲的非颜色线索——
  // 交换⇄ 与 比较◇ 即使在灰度下也能区分(交换优先,红色信息量大)。
  const pointerAt = (i) =>
    swapped.includes(i) ? { color: 'var(--red)', glyph: '⇄' }
    : comparing.includes(i) ? { color: 'var(--yellow)', glyph: '◇' }
    : null

  const slotPct = 100 / n

  return (
    <div style={{ padding: '0 12px' }}>
      {/* 柱区:相对定位容器,柱子按当前下标绝对定位。
          key 用稳定 id → 下标变化时 left 过渡,柱子平滑滑到新位置 */}
      <div style={{ position: 'relative', height: 236, overflow: 'hidden' }}>
        {array.map((val, i) => {
          const { color, lift, glow } = barState(i)
          const id = ids ? ids[i] : i    // 无 ids 时退回位置 key(兼容旧数据)
          return (
            <div
              key={id}
              style={{
                position: 'absolute',
                left: `${i * slotPct}%`,
                width: `${slotPct}%`,
                bottom: 0,
                height: '100%',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'flex-end',
                transition: `left ${dur}ms cubic-bezier(0.34, 1.15, 0.64, 1)`,
                // 活跃元素抬起 + 提到最上层,滑动交错时不被遮挡
                transform: lift ? 'translateY(-8px)' : 'translateY(0)',
                transitionProperty: 'left, transform',
                transitionDuration: `${dur}ms, ${Math.min(dur, 200)}ms`,
                zIndex: lift ? 2 : 1,
              }}
            >
              <span style={{
                fontSize: 11, marginBottom: 4,
                fontFamily: 'var(--font-mono)',
                fontWeight: lift ? 800 : 500,
                color: lift ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: `color ${dur}ms`,
              }}>{val}</span>
              <div style={{
                width: 'min(70%, 38px)',
                height: `${Math.max((val / max) * 190, 4)}px`,
                background: color,
                borderRadius: '4px 4px 0 0',
                boxShadow: glow ? `0 0 12px ${glow}` : 'none',
                transition: `height ${dur}ms cubic-bezier(0.34, 1.15, 0.64, 1), background ${Math.min(dur, 250)}ms, box-shadow ${Math.min(dur, 250)}ms`,
              }} />
            </div>
          )
        })}
      </div>

      {/* 指针行 + 索引行:▲ 指向正在比较/交换的位置(CLRS 板书风格) */}
      <div style={{ position: 'relative', height: 30, marginTop: 2 }}>
        {array.map((_, i) => {
          const p = pointerAt(i)
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${i * slotPct}%`,
              width: `${slotPct}%`,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              lineHeight: 1.1,
            }}>
              <span style={{
                fontSize: 11,
                color: p ? p.color : 'transparent',
                textShadow: p ? `0 0 6px ${p.color}` : 'none',
                transition: 'color 0.15s',
                fontWeight: 800, lineHeight: 1,
              }} aria-hidden>{p ? p.glyph : '▲'}</span>
              <span style={{
                fontSize: 9.5,
                fontFamily: 'var(--font-mono)',
                color: sorted.includes(i) ? 'var(--green)' : 'var(--text-tertiary)',
                opacity: 0.85,
              }}>{sorted.includes(i) ? `✓${i}` : i}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
