// SVG fretboard diagram for a single chord (or open strings).
// Props:
//   shape: array[6] of fret numbers or 'x' — index 0 = high e, 5 = low E
//   fingers: array[6] of finger numbers (1-4) or null
//   frets: number of frets to show (default 5)
//   startFret: first fret shown (default 1)
//   size: 'sm' | 'md' | 'lg' (default 'md')

const SIZES = {
  sm: { W: 80,  H: 100, cellW: 14, cellH: 18, r: 6,  fontSize: 8,  labelSize: 7 },
  md: { W: 120, H: 150, cellW: 20, cellH: 26, r: 9,  fontSize: 11, labelSize: 9 },
  lg: { W: 160, H: 200, cellW: 26, cellH: 35, r: 12, fontSize: 14, labelSize: 11 },
}

export default function FretboardDiagram({
  shape,
  fingers = [],
  frets = 5,
  startFret = 1,
  size = 'md',
  highlightStrings = null,
}) {
  const s = SIZES[size] || SIZES.md
  const strings = 6
  const totalW = (strings - 1) * s.cellW
  const totalH = frets * s.cellH
  const padX = 18
  const padY = 20
  const svgW = totalW + padX * 2
  const svgH = totalH + padY + 14

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={s.W}
      height={s.H}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="和弦指法图"
      style={{ overflow: 'visible' }}
    >
      {/* Nut or position marker */}
      {startFret === 1 ? (
        <rect x={padX - 2} y={padY - 5} width={totalW + 4} height={5} rx={2} fill="var(--text-tertiary)" />
      ) : (
        <text x={padX - 14} y={padY + s.cellH * 0.7} fontSize={s.labelSize} fill="var(--text-tertiary)" fontFamily="monospace">
          {startFret}
        </text>
      )}

      {/* Fret lines */}
      {Array.from({ length: frets + 1 }, (_, fi) => (
        <line
          key={fi}
          x1={padX} x2={padX + totalW}
          y1={padY + fi * s.cellH} y2={padY + fi * s.cellH}
          stroke="var(--border)" strokeWidth={fi === 0 ? 0 : 1}
        />
      ))}

      {/* String lines */}
      {Array.from({ length: strings }, (_, si) => {
        const x = padX + si * s.cellW
        const isHighlight = highlightStrings ? highlightStrings.includes(si) : false
        return (
          <line
            key={si}
            x1={x} x2={x}
            y1={padY} y2={padY + totalH}
            stroke={isHighlight ? 'var(--accent)' : 'var(--text-tertiary)'}
            strokeWidth={isHighlight ? 2 : 1}
            opacity={isHighlight ? 1 : 0.5}
          />
        )
      })}

      {/* Open / muted markers above nut */}
      {shape.map((fret, si) => {
        const x = padX + si * s.cellW
        const y = padY - 10
        if (fret === 'x') {
          return (
            <text key={si} x={x} y={y} textAnchor="middle" fontSize={s.labelSize + 1}
              fill="var(--text-tertiary)" fontWeight="700">✕</text>
          )
        }
        if (fret === 0) {
          return (
            <circle key={si} cx={x} cy={y} r={s.r * 0.55}
              fill="none" stroke="var(--text-secondary)" strokeWidth={1.5} />
          )
        }
        return null
      })}

      {/* Finger dots */}
      {shape.map((fret, si) => {
        if (typeof fret !== 'number' || fret === 0) return null
        const relFret = fret - startFret + 1
        if (relFret < 1 || relFret > frets) return null
        const cx = padX + si * s.cellW
        const cy = padY + (relFret - 0.5) * s.cellH
        const fingerNum = fingers[si]
        return (
          <g key={si}>
            <circle cx={cx} cy={cy} r={s.r} fill="var(--accent)" />
            {fingerNum != null && (
              <text x={cx} y={cy + s.fontSize * 0.38} textAnchor="middle"
                fontSize={s.fontSize} fill="white" fontWeight="700">
                {fingerNum}
              </text>
            )}
          </g>
        )
      })}

      {/* String labels at bottom */}
      {['e', 'B', 'G', 'D', 'A', 'E'].map((label, si) => (
        <text
          key={si}
          x={padX + si * s.cellW}
          y={svgH - 1}
          textAnchor="middle"
          fontSize={s.labelSize}
          fill="var(--text-tertiary)"
          fontFamily="monospace"
        >
          {label}
        </text>
      ))}
    </svg>
  )
}
