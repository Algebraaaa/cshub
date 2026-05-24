// FingeringChart: table of finger positions for each string in first position
import { STRING_LABELS, STRING_COLORS, FIRST_POSITION } from '../lib/violinMath'
import { useViolinAudio } from '../hooks/useViolinAudio'

export default function FingeringChart({ highlightNotes = [] }) {
  const { playNote } = useViolinAudio()
  const highlightSet = new Set(highlightNotes)

  return (
    <div className="overflow-x-auto">
      <table className="text-center text-xs border-collapse w-full max-w-xs mx-auto">
        <thead>
          <tr>
            <th className="py-1 px-2 text-fg-faint font-mono text-[10px]">指</th>
            {STRING_LABELS.map((label, si) => (
              <th key={si} className="py-1 px-3"
                style={{ color: STRING_COLORS[si], fontWeight: 700, fontFamily: 'monospace' }}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2, 3, 4].map(fi => (
            <tr key={fi} className="border-t border-border-soft">
              <td className="py-1 px-2 text-fg-faint font-mono font-bold">{fi}</td>
              {STRING_LABELS.map((_, si) => {
                const { note } = FIRST_POSITION[si][fi]
                const isHighlight = highlightSet.has(note)
                return (
                  <td key={si} className="py-1 px-2">
                    <button
                      onClick={() => playNote(note)}
                      className="font-mono text-[11px] px-1.5 py-0.5 rounded transition-all hover:scale-110"
                      style={{
                        color: isHighlight ? STRING_COLORS[si] : 'var(--text-secondary)',
                        background: isHighlight ? `${STRING_COLORS[si]}18` : 'transparent',
                        fontWeight: isHighlight ? 700 : 400,
                      }}
                      title={`点击试听 ${note}`}
                    >
                      {note}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-fg-faint text-center mt-2">点击任意音名可试听音高</p>
    </div>
  )
}
