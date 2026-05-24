// SVG four-string diagram for violin.
// Shows the four strings with highlighted finger positions.
// Props:
//   activeString: 0-3 (G=0, D=1, A=2, E=3) or null for all
//   activeFinger: 0-4 (0=open) or null
//   highlightNotes: string[] e.g. ['G3', 'A3']
//   onStringClick: (stringIndex) => void

import { STRING_LABELS, STRING_COLORS, FIRST_POSITION, fingerToNote } from '../lib/violinMath'
import { useViolinAudio } from '../hooks/useViolinAudio'

export default function StringDiagram({
  activeString = null,
  activeFinger = null,
  highlightNotes = [],
  onStringClick,
  showFingers = true,
}) {
  const { playNote } = useViolinAudio()

  const W = 280
  const H = 160
  const padX = 30
  const padY = 30
  const spacing = (W - padX * 2) / 3
  const fingerH = (H - padY * 2) / 4
  const fingerLabels = ['0', '1', '2', '3', '4']

  const highlightSet = new Set(highlightNotes)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 320 }} xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect x={padX - 6} y={padY - 6} width={(W - padX * 2) + 12} height={(H - padY * 2) + 12}
        rx={8} fill="var(--surface)" stroke="var(--border)" strokeWidth={1} />

      {/* String lines */}
      {STRING_LABELS.map((label, si) => {
        const x = padX + si * spacing
        const isActive = activeString === si
        const color = STRING_COLORS[si]
        return (
          <g key={si} style={{ cursor: 'pointer' }} onClick={() => {
            onStringClick?.(si)
            const openNote = fingerToNote(si, 0)
            playNote(openNote)
          }}>
            <line
              x1={x} y1={padY}
              x2={x} y2={H - padY}
              stroke={isActive ? color : 'var(--text-tertiary)'}
              strokeWidth={isActive ? 2.5 : 1.5}
              opacity={isActive ? 1 : 0.5}
            />
            {/* String label */}
            <text x={x} y={padY - 8} textAnchor="middle" fontSize={11}
              fill={color} fontWeight="700" fontFamily="monospace">
              {label}
            </text>
          </g>
        )
      })}

      {/* Fret lines */}
      {[0, 1, 2, 3, 4].map(fi => (
        <line key={fi}
          x1={padX} y1={padY + fi * fingerH}
          x2={padX + 3 * spacing} y2={padY + fi * fingerH}
          stroke="var(--border)" strokeWidth={fi === 0 ? 2 : 1}
          opacity={0.6}
        />
      ))}

      {/* Finger labels on left */}
      {showFingers && fingerLabels.map((label, fi) => (
        <text key={fi}
          x={padX - 10}
          y={padY + (fi === 0 ? -2 : fi * fingerH - fingerH * 0.3)}
          textAnchor="middle"
          fontSize={9}
          fill="var(--text-faint)"
          fontFamily="monospace"
        >
          {label}
        </text>
      ))}

      {/* Highlighted note dots */}
      {STRING_LABELS.map((_, si) =>
        FIRST_POSITION[si].map(({ finger, note }) => {
          if (finger === 0) return null
          const inHighlight = highlightSet.has(note)
          const isActiveDot = activeString === si && activeFinger === finger
          if (!inHighlight && !isActiveDot) return null
          const cx = padX + si * spacing
          const cy = padY + finger * fingerH - fingerH * 0.5
          const color = STRING_COLORS[si]
          return (
            <circle key={`${si}-${finger}`}
              cx={cx} cy={cy} r={7}
              fill={color}
              opacity={0.9}
              style={{ cursor: 'pointer' }}
              onClick={() => playNote(note)}
            >
              <title>{note}</title>
            </circle>
          )
        })
      )}

      {/* Open string dots for activeString */}
      {activeString !== null && activeFinger === 0 && (
        <circle
          cx={padX + activeString * spacing}
          cy={padY - 16}
          r={5}
          fill="none"
          stroke={STRING_COLORS[activeString]}
          strokeWidth={1.5}
        />
      )}
    </svg>
  )
}
