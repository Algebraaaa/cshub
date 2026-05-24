// StrumPattern: renders a row of down/up arrows representing a strumming pattern.
// pattern: array of 'D' (down), 'U' (up), or '-' (skip/mute)
// beat: current beat index for playback highlight (optional)

export default function StrumPattern({ pattern = [], beat = -1, label = '' }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="text-[10px] font-bold tracking-widest uppercase text-fg-faint">{label}</div>
      )}
      <div className="flex gap-1 items-end">
        {pattern.map((stroke, i) => {
          const isActive = i === beat
          const isSkip = stroke === '-'
          return (
            <div
              key={i}
              className="flex flex-col items-center gap-0.5"
            >
              <StrokeArrow stroke={stroke} active={isActive} />
              <span
                className="text-[9px] font-mono text-fg-faint"
                style={{ opacity: isSkip ? 0.3 : 0.6 }}
              >
                {i + 1}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StrokeArrow({ stroke, active }) {
  const base = 'w-7 h-8 flex items-center justify-center rounded text-base transition-all'
  if (stroke === '-') {
    return (
      <div className={`${base} text-fg-faint opacity-30`}>·</div>
    )
  }
  const isDown = stroke === 'D'
  return (
    <div
      className={[
        base,
        active ? 'bg-accent text-white scale-110' : 'bg-surface text-fg-muted',
      ].join(' ')}
    >
      {isDown ? '↓' : '↑'}
    </div>
  )
}
