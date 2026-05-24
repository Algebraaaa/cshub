import { useMemo } from 'react'

/**
 * SVG 瀑布流：音符从上往下落，落到底线时正好是 currentBeat。
 *
 * 视觉：每个音符是圆角矩形，高度按 durationBeat 与 fallBeats 的比例。
 * 右手 = 暖橙，左手 = 暖紫。
 *
 * Props:
 *   notes: { id, note, startBeat, durationBeat, hand }[]
 *   currentBeat: 当前播放头位置
 *   visibleKeys: 决定横向 lane 数量
 *   fallBeats: 从屏幕顶部落到底线需要的拍数（默认 6）
 */
export default function NoteWaterfall({ notes, currentBeat, visibleKeys, fallBeats = 6, height = 320 }) {
  const whiteKeys = useMemo(() => visibleKeys.filter(k => !k.isBlack), [visibleKeys])
  const WHITE_W = 100
  const GAP = 4
  const BLACK_W = 60
  const totalWidth = whiteKeys.length * (WHITE_W + GAP) - GAP

  const whiteIndex = useMemo(() => new Map(whiteKeys.map((k, i) => [k.note, i])), [whiteKeys])

  function laneX(note) {
    const key = visibleKeys.find(k => k.note === note)
    if (!key) return null
    if (!key.isBlack) {
      const idx = whiteIndex.get(key.note)
      return { x: idx * (WHITE_W + GAP), w: WHITE_W }
    }
    const prevWhite = whiteKeys.find(w => w.midi === key.midi - 1)
    if (!prevWhite) return null
    const idx = whiteIndex.get(prevWhite.note)
    return {
      x: idx * (WHITE_W + GAP) + WHITE_W - BLACK_W / 2 + GAP / 2,
      w: BLACK_W,
    }
  }

  const beatsAhead = fallBeats
  const upcomingNotes = notes.filter(
    n => n.startBeat + n.durationBeat > currentBeat - 0.5 && n.startBeat < currentBeat + beatsAhead,
  )

  return (
    <div className="w-full overflow-hidden rounded-3xl border-2 border-[#f5d9b8] bg-gradient-to-b from-[#fff4e6] via-[#fff7ed] to-[#fdebd3]" style={{ height }}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        preserveAspectRatio="none"
        className="block"
        style={{ width: '100%', height: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lane-stripe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(232,108,93,0)" />
            <stop offset="100%" stopColor="rgba(232,108,93,0.06)" />
          </linearGradient>
          <filter id="wf-rough" x="-3%" y="-3%" width="106%" height="106%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="11" />
            <feDisplacementMap in="SourceGraphic" scale="1.5" />
          </filter>
        </defs>

        {/* Lane stripes (subtle vertical lines between keys) */}
        {whiteKeys.map((k, i) => (
          <line
            key={`lane-${k.note}`}
            x1={i * (WHITE_W + GAP) + WHITE_W + GAP / 2}
            x2={i * (WHITE_W + GAP) + WHITE_W + GAP / 2}
            y1={0}
            y2={height}
            stroke="rgba(232,108,93,0.10)"
            strokeWidth="1"
          />
        ))}

        {/* Hit line at bottom */}
        <line
          x1={0}
          x2={totalWidth}
          y1={height - 4}
          y2={height - 4}
          stroke="#e86c5d"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <line
          x1={0}
          x2={totalWidth}
          y1={height - 2}
          y2={height - 2}
          stroke="#f6d057"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.6}
        />

        {/* Falling notes */}
        {upcomingNotes.map((note) => {
          const lane = laneX(note.note)
          if (!lane) return null
          const beatsUntilHit = note.startBeat - currentBeat
          // 1 beat = (height / fallBeats) px down
          const pxPerBeat = height / beatsAhead
          const yBottom = (height - 4) - beatsUntilHit * pxPerBeat
          const noteHeight = Math.max(14, note.durationBeat * pxPerBeat * 0.92)
          const yTop = yBottom - noteHeight
          if (yBottom < -20 || yTop > height) return null

          const isRight = note.hand !== 'left'
          const fill = isRight ? '#ffb287' : '#c8a4e8'
          const stroke = isRight ? '#e86c5d' : '#8b5cf6'
          const isActive = note.startBeat <= currentBeat && note.startBeat + note.durationBeat > currentBeat

          return (
            <g key={note.id} opacity={isActive ? 1 : 0.86}>
              <rect
                x={lane.x + 4}
                y={yTop}
                width={lane.w - 8}
                height={noteHeight}
                rx={8}
                ry={8}
                fill={fill}
                stroke={stroke}
                strokeWidth={isActive ? 3 : 2}
                filter="url(#wf-rough)"
              />
              {noteHeight > 24 && (
                <text
                  x={lane.x + lane.w / 2}
                  y={yBottom - 8}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={700}
                  fill="#fff5e1"
                  pointerEvents="none"
                >
                  {note.note}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
