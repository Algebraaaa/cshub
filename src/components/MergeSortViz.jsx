const NODE = 38
const UNIT_W = 52      // 每个叶子位置的水平宽度
const LEVEL_H = 64     // 每层的垂直间距
const TOP_PAD = 12
const SLOT_H = NODE + 10  // 槽位高度
const PAD_X = 16

export default function MergeSortViz({ stepData }) {
  if (!stepData) return null
  const {
    arr, elementLevel, elementPos,
    leftRange, rightRange, level: activeLevel,
    kPos,
    comparingIds, chosenId, chosenSide,
    tree, maxDepth,
    phase,
  } = stepData

  const n = arr.length
  const totalW = n * UNIT_W
  const totalH = (maxDepth + 1) * LEVEL_H + TOP_PAD + 50

  const isSplitPhase = phase === 'split' || phase === 'split-enter'

  // Active = parent slot; suppressed during 'split' (only children highlighted then)
  const isActiveSlot = (s) =>
    leftRange && rightRange &&
    phase !== 'split' &&
    s.level === activeLevel &&
    s.left === leftRange[0] && s.right === rightRange[1]

  const isChildLeftSlot = (s) =>
    leftRange &&
    s.level === activeLevel + 1 &&
    s.left === leftRange[0] && s.right === leftRange[1]

  const isChildRightSlot = (s) =>
    rightRange &&
    s.level === activeLevel + 1 &&
    s.left === rightRange[0] && s.right === rightRange[1]

  function nodeColor(el) {
    const lvl = elementLevel[el.id]
    const pos = elementPos[el.id]
    const isComparing = comparingIds?.includes(el.id)
    const isChosen = chosenId === el.id
    const isInLeftHalf  = leftRange  && lvl === activeLevel + 1 && pos >= leftRange[0]  && pos <= leftRange[1]
    const isInRightHalf = rightRange && lvl === activeLevel + 1 && pos >= rightRange[0] && pos <= rightRange[1]
    // isJustMerged only applies in merge phases
    const isJustMerged  = !isSplitPhase && leftRange && rightRange &&
                          lvl === activeLevel && pos >= leftRange[0] && pos <= rightRange[1]

    let bg, border, ring
    if (phase === 'done') {
      bg = 'linear-gradient(135deg, #34d399, #059669)'
      border = '#10b981'
    } else if (isInLeftHalf) {
      bg = 'linear-gradient(135deg, #60a5fa, #3b82f6)'
      border = '#3b82f6'
    } else if (isInRightHalf) {
      bg = 'linear-gradient(135deg, #f472b6, #ec4899)'
      border = '#ec4899'
    } else if (isJustMerged) {
      bg = 'linear-gradient(135deg, #c4b5fd, #8b5cf6)'
      border = '#8b5cf6'
    } else {
      bg = 'linear-gradient(135deg, #6b7280, #4b5563)'
      border = '#4b5563'
    }

    if (isComparing) {
      const c = isInLeftHalf ? '#60a5fa' : '#f472b6'
      ring = `0 0 0 4px ${c}66, 0 0 22px ${c}cc`
    } else if (isChosen) {
      ring = '0 0 0 4px rgba(255,255,255,0.7), 0 0 28px rgba(196,181,253,0.7)'
    }

    return { bg, border, ring }
  }

  return (
    <div style={{
      position: 'relative',
      width: totalW + PAD_X * 2,
      height: totalH,
      margin: '0 auto',
      padding: `${TOP_PAD}px ${PAD_X}px 0`,
      boxSizing: 'content-box',
    }}>
      {/* 树骨架：所有 slot 的虚线方框 */}
      {tree.map((s) => {
        const x = s.left * UNIT_W + PAD_X
        const y = s.level * LEVEL_H + TOP_PAD
        const w = (s.right - s.left + 1) * UNIT_W - 6
        const active = isActiveSlot(s)
        const childL = isChildLeftSlot(s)
        const childR = isChildRightSlot(s)

        const splitEnterActive = active && phase === 'split-enter'
        const mergeActive = active && !isSplitPhase

        const accent = splitEnterActive ? '#f59e0b'
                     : mergeActive ? 'var(--accent-light)'
                     : childL ? '#3b82f6'
                     : childR ? '#ec4899'
                     : null

        const glowColor = splitEnterActive ? 'rgba(245,158,11,0.35)'
                        : mergeActive ? 'rgba(167,139,250,0.35)'
                        : 'none'

        const bgColor = splitEnterActive ? 'rgba(245,158,11,0.07)'
                      : mergeActive ? 'rgba(167,139,250,0.06)'
                      : 'transparent'

        return (
          <div key={`${s.level}-${s.left}-${s.right}`} style={{
            position: 'absolute',
            left: x, top: y,
            width: w, height: SLOT_H,
            border: `${accent ? 2 : 1}px ${accent ? 'solid' : 'dashed'} ${accent || 'rgba(255,255,255,0.08)'}`,
            borderRadius: 8,
            boxShadow: accent ? `0 0 24px ${glowColor}` : 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            pointerEvents: 'none',
            background: bgColor,
          }} />
        )
      })}

      {/* 树连接线 */}
      <svg style={{
        position: 'absolute', left: 0, top: 0,
        width: totalW + PAD_X * 2, height: totalH,
        pointerEvents: 'none',
      }}>
        {tree.filter(s => s.left < s.right).flatMap(s => {
          const mid = Math.floor((s.left + s.right) / 2)
          const parentX = (s.left + s.right + 1) / 2 * UNIT_W + PAD_X
          const parentY = s.level * LEVEL_H + TOP_PAD + SLOT_H
          const leftChildX = (s.left + mid + 1) / 2 * UNIT_W + PAD_X
          const rightChildX = (mid + 1 + s.right + 1) / 2 * UNIT_W + PAD_X
          const childY = (s.level + 1) * LEVEL_H + TOP_PAD
          return [
            <line key={`L-${s.level}-${s.left}-${s.right}`}
              x1={parentX} y1={parentY} x2={leftChildX} y2={childY}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1" />,
            <line key={`R-${s.level}-${s.left}-${s.right}`}
              x1={parentX} y1={parentY} x2={rightChildX} y2={childY}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1" />,
          ]
        })}
      </svg>

      {/* 元素圆 */}
      {arr.map(el => {
        const lvl = elementLevel[el.id]
        const pos = elementPos[el.id]
        const x = pos * UNIT_W + PAD_X + (UNIT_W - NODE) / 2
        const y = lvl * LEVEL_H + TOP_PAD + (SLOT_H - NODE) / 2
        const { bg, border, ring } = nodeColor(el)
        return (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: 0, top: 0,
              width: NODE, height: NODE,
              transform: `translate(${x}px, ${y}px)`,
              transition: 'transform 0.55s cubic-bezier(0.34, 1.15, 0.64, 1), box-shadow 0.25s, background 0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%',
              color: 'white',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 14,
              border: `2px solid ${border}`,
              background: bg,
              boxShadow: ring || '0 4px 12px rgba(0,0,0,0.4)',
              zIndex: chosenId === el.id ? 10 : 1,
            }}
          >
            {el.value}
          </div>
        )
      })}

      {/* 比较读数（底部） */}
      {comparingIds && (
        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          bottom: 6,
          display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center', fontSize: 13,
        }}>
          <Chip label="L"
            value={arr.find(e => e.id === comparingIds[0])?.value}
            color="#3b82f6" highlight={chosenSide === 'L'} />
          <span style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            {chosenSide === 'L' ? '≤' : chosenSide === 'R' ? '>' : 'vs'}
          </span>
          <Chip label="R"
            value={arr.find(e => e.id === comparingIds[1])?.value}
            color="#ec4899" highlight={chosenSide === 'R'} />
        </div>
      )}

      {/* k 写入指针 */}
      {kPos != null && rightRange && kPos <= rightRange[1] && (
        <div style={{
          position: 'absolute',
          left: kPos * UNIT_W + PAD_X + (UNIT_W - 14) / 2,
          top: activeLevel * LEVEL_H + TOP_PAD - 18,
          transition: 'left 0.55s cubic-bezier(0.34, 1.15, 0.64, 1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <span style={{
            fontSize: 9, color: '#a78bfa', fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            marginBottom: 1,
          }}>k</span>
          <svg width="14" height="10" viewBox="0 0 14 10">
            <path d="M7 10 L13 2 L1 2 Z" fill="#a78bfa" />
          </svg>
        </div>
      )}

      {/* Phase badge */}
      {isSplitPhase && (
        <div style={{
          position: 'absolute', top: 4, right: PAD_X,
          fontSize: 10, fontWeight: 700, color: '#f59e0b',
          letterSpacing: '0.08em', fontFamily: 'var(--font-mono)',
        }}>▼ 划分</div>
      )}
      {!isSplitPhase && phase !== 'done' && phase !== 'enter' && (
        <div style={{
          position: 'absolute', top: 4, right: PAD_X,
          fontSize: 10, fontWeight: 700, color: 'var(--accent-light)',
          letterSpacing: '0.08em', fontFamily: 'var(--font-mono)',
        }}>▲ 归并</div>
      )}
    </div>
  )
}

function Chip({ label, value, color, highlight }) {
  return (
    <span style={{
      padding: '4px 12px',
      borderRadius: 8,
      background: highlight ? color : 'var(--surface)',
      color: highlight ? 'white' : color,
      border: `1px solid ${color}`,
      fontFamily: 'var(--font-mono)',
      fontWeight: 600, fontSize: 13,
      transition: 'all 0.2s',
    }}>
      {label} = {value}
    </span>
  )
}
