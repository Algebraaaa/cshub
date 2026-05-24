import { useMemo, useState } from 'react'
import { RAW_SONGS } from '../data/piano/songsIndex'
import PianoHero from '../features/piano/components/PianoHero'
import DifficultyTabs from '../features/piano/components/DifficultyTabs'
import SongCard from '../features/piano/components/SongCard'

export default function PianoGalleryPage() {
  const [tier, setTier] = useState('all')

  const counts = useMemo(() => {
    const c = { all: RAW_SONGS.length, 1: 0, 2: 0, 3: 0, 4: 0 }
    for (const s of RAW_SONGS) c[s.difficulty ?? 1] += 1
    return c
  }, [])

  const filtered = useMemo(() => {
    if (tier === 'all') return RAW_SONGS
    return RAW_SONGS.filter(s => (s.difficulty ?? 1) === tier)
  }, [tier])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff5ec] via-[#fff8f0] to-[#fdebd3]">
      <div className="relative max-w-6xl mx-auto">
        <PianoHero />

        <main className="px-6 pb-24">
          <DifficultyTabs active={tier} onChange={setTier} counts={counts} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(song => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-[#9e7f7f] py-12">这个难度暂时还没有曲目 🌱</p>
          )}
        </main>
      </div>
    </div>
  )
}
