import { useMemo } from 'react'

/**
 * SVG 88/49/37 键钢琴键盘。
 *
 * Props:
 *   visibleKeys: ALL_KEYS 子集
 *   activeNotes: Set<string> 当前按下的音名
 *   targetNote: string | null 跟弹目标音（高亮呼吸）
 *   onPress: (key) => void
 *   showLabels: boolean 是否显示音名/QWERTY 提示
 */
export default function PianoKeyboard({ visibleKeys, activeNotes, targetNote, onPress, showLabels = true }) {
  const whiteKeys = useMemo(() => visibleKeys.filter(k => !k.isBlack), [visibleKeys])
  const blackKeys = useMemo(() => visibleKeys.filter(k => k.isBlack), [visibleKeys])

  const WHITE_W = 100
  const WHITE_H = 360
  const BLACK_W = 60
  const BLACK_H = 220
  const GAP = 4

  const whiteIndex = new Map(whiteKeys.map((k, i) => [k.note, i]))

  // 黑键相对它前面的白键的位置（向右偏 ~70%）
  function blackKeyX(blackKey) {
    const blackMidi = blackKey.midi
    const prevWhite = whiteKeys.find(w => w.midi === blackMidi - 1)
    if (!prevWhite) return 0
    const idx = whiteIndex.get(prevWhite.note)
    return idx * (WHITE_W + GAP) + WHITE_W - BLACK_W / 2 + GAP / 2
  }

  const totalWidth = whiteKeys.length * (WHITE_W + GAP) - GAP

  return (
    <div className="w-full overflow-x-auto pb-2">
      <svg
        viewBox={`0 0 ${totalWidth} ${WHITE_H + 24}`}
        className="block mx-auto"
        style={{ width: '100%', minWidth: Math.min(totalWidth, 1600), maxWidth: totalWidth }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="key-white" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffaf3" />
            <stop offset="100%" stopColor="#f5e8d6" />
          </linearGradient>
          <linearGradient id="key-white-active" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd5b8" />
            <stop offset="100%" stopColor="#e86c5d" />
          </linearGradient>
          <linearGradient id="key-white-target" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff2cc" />
            <stop offset="100%" stopColor="#f6d057" />
          </linearGradient>
          <linearGradient id="key-black" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a2d2a" />
            <stop offset="100%" stopColor="#1a1212" />
          </linearGradient>
          <linearGradient id="key-black-active" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8a78" />
            <stop offset="100%" stopColor="#c23e30" />
          </linearGradient>
          <linearGradient id="key-black-target" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6d057" />
            <stop offset="100%" stopColor="#c89a32" />
          </linearGradient>
          <filter id="key-shadow" x="-2%" y="-2%" width="104%" height="108%">
            <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#7a4030" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* White keys */}
        {whiteKeys.map((key, i) => {
          const isActive = activeNotes.has(key.note)
          const isTarget = targetNote === key.note
          const fill = isActive
            ? 'url(#key-white-active)'
            : isTarget
              ? 'url(#key-white-target)'
              : 'url(#key-white)'
          return (
            <g
              key={key.note}
              transform={`translate(${i * (WHITE_W + GAP)},${isActive ? 4 : 0})`}
              onClick={() => onPress?.(key)}
              onTouchStart={(e) => { e.preventDefault(); onPress?.(key) }}
              style={{ cursor: 'pointer', transition: 'transform 0.08s ease-out' }}
            >
              <rect
                width={WHITE_W}
                height={WHITE_H}
                rx={10}
                ry={10}
                fill={fill}
                stroke={isTarget ? '#e8a432' : '#d8c0a8'}
                strokeWidth={isTarget ? 3 : 1.5}
                filter="url(#key-shadow)"
              />
              {isTarget && (
                <rect
                  width={WHITE_W}
                  height={WHITE_H}
                  rx={10}
                  ry={10}
                  fill="none"
                  stroke="#e86c5d"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  opacity={0.7}
                >
                  <animate attributeName="stroke-dashoffset" from={0} to={20} dur="1.2s" repeatCount="indefinite" />
                </rect>
              )}
              {showLabels && (
                <>
                  {key.keyboardKey && (
                    <text
                      x={WHITE_W / 2}
                      y={WHITE_H - 50}
                      textAnchor="middle"
                      fontSize={20}
                      fontWeight={700}
                      fill={isActive ? '#fff5e1' : '#9a6f55'}
                      pointerEvents="none"
                    >
                      {key.keyboardKey}
                    </text>
                  )}
                  <text
                    x={WHITE_W / 2}
                    y={WHITE_H - 22}
                    textAnchor="middle"
                    fontSize={16}
                    fontWeight={600}
                    fill={isActive ? '#fff5e1' : '#b78a6e'}
                    pointerEvents="none"
                  >
                    {key.note}
                  </text>
                </>
              )}
            </g>
          )
        })}

        {/* Black keys (drawn last to overlay) */}
        {blackKeys.map((key) => {
          const isActive = activeNotes.has(key.note)
          const isTarget = targetNote === key.note
          const x = blackKeyX(key)
          const fill = isActive
            ? 'url(#key-black-active)'
            : isTarget
              ? 'url(#key-black-target)'
              : 'url(#key-black)'
          return (
            <g
              key={key.note}
              transform={`translate(${x},${isActive ? 4 : 0})`}
              onClick={(e) => { e.stopPropagation(); onPress?.(key) }}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); onPress?.(key) }}
              style={{ cursor: 'pointer', transition: 'transform 0.08s ease-out' }}
            >
              <rect
                width={BLACK_W}
                height={BLACK_H}
                rx={8}
                ry={8}
                fill={fill}
                stroke={isTarget ? '#e8a432' : '#0a0606'}
                strokeWidth={isTarget ? 3 : 1}
                filter="url(#key-shadow)"
              />
              {isTarget && (
                <rect
                  width={BLACK_W}
                  height={BLACK_H}
                  rx={8}
                  ry={8}
                  fill="none"
                  stroke="#f6d057"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  opacity={0.8}
                >
                  <animate attributeName="stroke-dashoffset" from={0} to={16} dur="1s" repeatCount="indefinite" />
                </rect>
              )}
              {showLabels && key.keyboardKey && (
                <text
                  x={BLACK_W / 2}
                  y={BLACK_H - 18}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight={700}
                  fill={isActive ? '#fff5e1' : '#d4baa0'}
                  pointerEvents="none"
                >
                  {key.keyboardKey}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
