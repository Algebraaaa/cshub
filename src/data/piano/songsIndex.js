import twinkle from './songs/twinkle.json'
import odeToJoy from './songs/ode-to-joy.json'
import castle from './songs/castle-in-the-sky.json'
import turkish from './songs/turkish-march.json'
import mary from './songs/mary-lamb.json'
import frereJacques from './songs/frere-jacques.json'
import hotCrossBuns from './songs/hot-cross-buns.json'
import happyBirthday from './songs/happy-birthday.json'

export const RAW_SONGS = [
  hotCrossBuns,
  twinkle,
  mary,
  frereJacques,
  happyBirthday,
  odeToJoy,
  castle,
  turkish,
]

export const SONGS_BY_ID = Object.fromEntries(RAW_SONGS.map(song => [song.id, song]))

export const DIFFICULTY_BUCKETS = {
  1: { label: '入门', stars: '⭐' },
  2: { label: '初级', stars: '⭐⭐' },
  3: { label: '中级', stars: '⭐⭐⭐' },
  4: { label: '进阶', stars: '⭐⭐⭐⭐' },
}

export function songsByDifficulty() {
  const buckets = { 1: [], 2: [], 3: [], 4: [] }
  for (const song of RAW_SONGS) {
    const tier = song.difficulty ?? 1
    if (buckets[tier]) buckets[tier].push(song)
  }
  return buckets
}
