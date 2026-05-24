import { DIFFICULTY_BUCKETS } from '../../../data/piano/songsIndex'

const TIERS = [
  { id: 'all', label: '全部', stars: '✦' },
  { id: 1, label: DIFFICULTY_BUCKETS[1].label, stars: DIFFICULTY_BUCKETS[1].stars },
  { id: 2, label: DIFFICULTY_BUCKETS[2].label, stars: DIFFICULTY_BUCKETS[2].stars },
  { id: 3, label: DIFFICULTY_BUCKETS[3].label, stars: DIFFICULTY_BUCKETS[3].stars },
  { id: 4, label: DIFFICULTY_BUCKETS[4].label, stars: DIFFICULTY_BUCKETS[4].stars },
]

export default function DifficultyTabs({ active, onChange, counts }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      {TIERS.map(tier => {
        const isActive = active === tier.id
        const count = counts?.[tier.id]
        return (
          <button
            key={tier.id}
            onClick={() => onChange(tier.id)}
            className={
              isActive
                ? 'rounded-full bg-[#e86c5d] px-4 py-2 text-sm font-black text-white shadow-[3px_3px_0_rgba(200,80,80,0.2)]'
                : 'rounded-full border-2 border-[#f5d9b8] bg-white/80 px-4 py-2 text-sm font-bold text-[#9e7f7f] hover:bg-[#fff0e6]'
            }
          >
            <span className="mr-1">{tier.stars}</span>
            {tier.label}
            {typeof count === 'number' && <span className={isActive ? 'ml-1.5 opacity-80' : 'ml-1.5 text-[#c79b9b]'}>{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
