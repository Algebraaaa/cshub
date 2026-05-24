// Cache mapping visualization step generator.
// Demonstrates three cache organizations on the same sequence of memory accesses:
//   'direct'        — Direct mapped
//   'set'           — 2-way set associative
//   'fully'         — Fully associative (LRU)
//
// Cache parameters (small for visualization clarity):
//   blockSize = 4 bytes   (offset bits = 2)
//   numBlocks = 8         (3-bit index for direct; 2-bit index for 2-way set)
//   addressBits = 8       (8-bit memory address)
//
// Step shape:
// { mode, accesses, currentIdx, address, addrBits, tag, index, offset,
//   cache, hit, stats, description }

const BLOCK_SIZE = 4
const NUM_BLOCKS = 8
const ADDR_BITS = 8

function toBin(n, w) { let s = n.toString(2); while (s.length < w) s = '0' + s; return s }

function splitAddress(addr, mode) {
  const offsetBits = Math.log2(BLOCK_SIZE)  // 2
  const blockAddr = addr >> offsetBits

  if (mode === 'direct') {
    // 3-bit index, rest is tag
    const indexBits = Math.log2(NUM_BLOCKS)  // 3
    const index = blockAddr & ((1 << indexBits) - 1)
    const tag = blockAddr >> indexBits
    return { tag, index, offset: addr & ((1 << offsetBits) - 1), tagBits: ADDR_BITS - indexBits - offsetBits, indexBits, offsetBits }
  }
  if (mode === 'set') {
    // 4 sets × 2 ways. 2-bit index.
    const indexBits = Math.log2(NUM_BLOCKS / 2)  // 2
    const index = blockAddr & ((1 << indexBits) - 1)
    const tag = blockAddr >> indexBits
    return { tag, index, offset: addr & ((1 << offsetBits) - 1), tagBits: ADDR_BITS - indexBits - offsetBits, indexBits, offsetBits }
  }
  // fully associative: no index, all tag
  return { tag: blockAddr, index: -1, offset: addr & ((1 << offsetBits) - 1), tagBits: ADDR_BITS - offsetBits, indexBits: 0, offsetBits }
}

function emptyCache(mode) {
  if (mode === 'direct') return Array.from({ length: NUM_BLOCKS }, () => ({ valid: false, tag: -1 }))
  if (mode === 'set')    return Array.from({ length: NUM_BLOCKS / 2 }, () => [
    { valid: false, tag: -1, age: 0 },
    { valid: false, tag: -1, age: 0 },
  ])
  return Array.from({ length: NUM_BLOCKS }, () => ({ valid: false, tag: -1, age: 0 }))
}

function tryAccess(cache, mode, parts) {
  const { tag, index } = parts
  if (mode === 'direct') {
    const line = cache[index]
    if (line.valid && line.tag === tag) return { hit: true, way: 0 }
    line.valid = true
    line.tag = tag
    return { hit: false, way: 0, evicted: false }
  }
  if (mode === 'set') {
    const set = cache[index]
    // increment age of all
    for (const way of set) way.age++
    for (let w = 0; w < set.length; w++) {
      if (set[w].valid && set[w].tag === tag) {
        set[w].age = 0
        return { hit: true, way: w }
      }
    }
    // miss: pick LRU (highest age) or invalid
    let target = set.findIndex(w => !w.valid)
    if (target < 0) {
      let maxAge = -1
      for (let w = 0; w < set.length; w++) {
        if (set[w].age > maxAge) { maxAge = set[w].age; target = w }
      }
    }
    const evicted = set[target].valid
    set[target] = { valid: true, tag, age: 0 }
    return { hit: false, way: target, evicted }
  }
  // fully associative
  for (const line of cache) line.age++
  for (let i = 0; i < cache.length; i++) {
    if (cache[i].valid && cache[i].tag === tag) {
      cache[i].age = 0
      return { hit: true, way: i }
    }
  }
  let target = cache.findIndex(l => !l.valid)
  if (target < 0) {
    let maxAge = -1
    for (let i = 0; i < cache.length; i++) {
      if (cache[i].age > maxAge) { maxAge = cache[i].age; target = i }
    }
  }
  const evicted = cache[target].valid
  cache[target] = { valid: true, tag, age: 0 }
  return { hit: false, way: target, evicted }
}

function cloneCache(cache, mode) {
  if (mode === 'set') return cache.map(set => set.map(w => ({ ...w })))
  return cache.map(line => ({ ...line }))
}

export function cacheMapping({ mode = 'direct', accesses = [0x00, 0x04, 0x10, 0x14, 0x00, 0x20, 0x04, 0x30] } = {}) {
  const cache = emptyCache(mode)
  const steps = []
  let hits = 0, misses = 0

  steps.push({
    mode, accesses, currentIdx: -1,
    address: -1, addrBits: '', tag: -1, index: -1, offset: -1,
    cache: cloneCache(cache, mode), hit: null,
    stats: { hits, misses, total: 0 },
    description: `初始化 ${modeLabel(mode)}：${NUM_BLOCKS} 个块，块大小 ${BLOCK_SIZE} 字节，地址 ${ADDR_BITS} 位`,
  })

  for (let i = 0; i < accesses.length; i++) {
    const addr = accesses[i]
    const parts = splitAddress(addr, mode)
    const result = tryAccess(cache, mode, parts)

    if (result.hit) hits++
    else misses++

    steps.push({
      mode, accesses, currentIdx: i,
      address: addr,
      addrBits: toBin(addr, ADDR_BITS),
      tag: parts.tag, index: parts.index, offset: parts.offset,
      tagBits: parts.tagBits, indexBits: parts.indexBits, offsetBits: parts.offsetBits,
      cache: cloneCache(cache, mode),
      hit: result.hit,
      way: result.way,
      evicted: result.evicted,
      stats: { hits, misses, total: i + 1, hitRate: ((hits / (i + 1)) * 100).toFixed(1) },
      description: `访问地址 0x${addr.toString(16).toUpperCase().padStart(2, '0')}：${result.hit ? '✅ HIT' : '❌ MISS'}${result.evicted ? '（替换旧块）' : ''}（tag=${parts.tag}${parts.index >= 0 ? `, index=${parts.index}` : ''}）`,
    })
  }

  return steps
}

function modeLabel(mode) {
  return { direct: '直接映射', set: '2 路组相联', fully: '全相联 (LRU)' }[mode] || mode
}

export function cacheDirect(opts) { return cacheMapping({ ...opts, mode: 'direct' }) }
export function cacheSet(opts)    { return cacheMapping({ ...opts, mode: 'set' }) }
export function cacheFully(opts)  { return cacheMapping({ ...opts, mode: 'fully' }) }
