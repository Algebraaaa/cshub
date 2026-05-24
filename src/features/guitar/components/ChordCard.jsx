import { useCallback, useState } from 'react'
import FretboardDiagram from './FretboardDiagram'
import { useGuitarAudio } from '../hooks/useGuitarAudio'

export default function ChordCard({ chord, size = 'md' }) {
  const { strumChord } = useGuitarAudio()
  const [strumming, setStrumming] = useState(false)

  const handleStrum = useCallback(async () => {
    setStrumming(true)
    await strumChord(chord.shape)
    setTimeout(() => setStrumming(false), 500)
  }, [chord.shape, strumChord])

  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface border border-border-soft hover:border-border-strong transition-colors">
      <FretboardDiagram
        shape={chord.shape}
        fingers={chord.fingers}
        size={size}
      />

      <div className="text-center">
        <div className="font-bold text-fg text-base leading-tight">{chord.name}</div>
        <div className="text-xs text-fg-faint">{chord.fullName}</div>
      </div>

      {chord.desc && (
        <p className="text-[11px] text-fg-muted text-center max-w-[120px] leading-snug">
          {chord.desc}
        </p>
      )}

      <button
        onClick={handleStrum}
        className={[
          'icon-btn w-8 h-8 rounded-full text-base transition-all',
          strumming ? 'bg-accent text-white scale-90' : 'hover:bg-accent-soft',
        ].join(' ')}
        title="试听和弦"
        aria-label={`试听 ${chord.name} 和弦`}
      >
        🎸
      </button>
    </div>
  )
}
