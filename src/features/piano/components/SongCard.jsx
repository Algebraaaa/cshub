import { Link } from 'react-router-dom'

const TIER_COLORS = {
  1: { bg: '#fdf2e3', border: '#f5c842', accent: '#c89432' },
  2: { bg: '#ffe8d8', border: '#f5a86e', accent: '#c46a3a' },
  3: { bg: '#fde0d8', border: '#e86c5d', accent: '#a83a30' },
  4: { bg: '#f3e3f5', border: '#b07ec8', accent: '#6a3a82' },
}

function pickEmoji(song) {
  const tags = song.tags ?? []
  if (tags.includes('studio-ghibli')) return '🏰'
  if (tags.includes('classical')) return '🎼'
  if (tags.includes('two-hand')) return '🤝'
  if (tags.includes('beginner') || tags.includes('starter')) return '🌱'
  if (tags.includes('folk')) return '🎶'
  return '🎹'
}

function formatDuration(sec) {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}

export default function SongCard({ song }) {
  const tier = TIER_COLORS[song.difficulty ?? 1] ?? TIER_COLORS[1]
  const emoji = pickEmoji(song)

  return (
    <Link
      to={`/piano/song/${song.id}`}
      className="group block rounded-3xl border-2 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(232,140,140,0.18)]"
      style={{ borderColor: tier.border }}
    >
      <div
        className="flex items-center justify-center mb-3 rounded-2xl text-5xl h-24"
        style={{ background: tier.bg }}
      >
        {emoji}
      </div>
      <h3 className="text-lg font-black text-[#3d2a2a] leading-tight">{song.title}</h3>
      {song.titleEn && (
        <p className="text-xs font-semibold text-[#c79b9b] mb-1.5">{song.titleEn}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-bold" style={{ color: tier.accent }}>
          {'⭐'.repeat(song.difficulty ?? 1)}
        </span>
        <span className="text-xs font-semibold text-[#9e7f7f]">
          BPM {song.bpm} · {formatDuration(song.durationSec)}
        </span>
      </div>
      {song.composer && (
        <p className="mt-2 text-xs font-semibold text-[#b78a6e]">— {song.composer}</p>
      )}
      <p className="mt-2 text-xs leading-relaxed text-[#9e7f7f] line-clamp-2">{song.subtitle}</p>
      <div
        className="mt-3 text-xs font-black tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: tier.accent }}
      >
        进入练习 →
      </div>
    </Link>
  )
}
