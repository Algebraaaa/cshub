// 组成原理生成器正确性。口径：唐朔飞《计算机组成原理》（缓存映射、IEEE 754、
// 五级流水线 load-use 冒险）；IEEE 754-2008。
import { describe, test, expect } from 'vitest'
import { cacheMapping, cacheDirect, cacheSet, cacheFully } from './co/cacheMap.js'
import { ieee754 } from './co/ieee754.js'
import { fiveStagePipeline, pipelineIdeal, pipelineHazard } from './co/pipeline.js'

// 参考：直接映射 index=(block>>2)&7, tag=block>>3
function refDirect(accesses) {
  const lines = new Array(8).fill(null)
  let hits = 0
  for (const a of accesses) {
    const block = a >> 2
    const idx = block & 7
    if (lines[idx] === block >> 3) hits++
    lines[idx] = block >> 3
  }
  return hits
}

describe('Cache 映射', () => {
  const SEQ = [0x00, 0x04, 0x10, 0x14, 0x00, 0x20, 0x04, 0x30]

  test('默认序列：直接映射 2 命中（0x00 与 0x04 回访）', () => {
    const steps = cacheDirect({ accesses: SEQ })
    const last = steps.at(-1).stats
    expect(last.hits).toBe(2)
    expect(last.misses).toBe(6)
    expect(last.hitRate).toBe('25.0')
  })

  test('直接映射与参考实现对拍（随机序列）', () => {
    let seed = 99
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % 256 }
    const seq = Array.from({ length: 300 }, rand)
    expect(cacheDirect({ accesses: seq }).at(-1).stats.hits).toBe(refDirect(seq))
  })

  test('地址切分：tag/index/offset 与位数一致', () => {
    const steps = cacheMapping({ mode: 'direct', accesses: [0x14] })
    const s = steps[1]
    expect(s.offset).toBe(0)
    expect(s.index).toBe(5) // block 5
    expect(s.tag).toBe(0)
    expect(s.tagBits + s.indexBits + s.offsetBits).toBe(8)
  })

  test('2 路组相联命中数 ≥ 直接映射（冲突更少）', () => {
    const direct = cacheDirect({ accesses: SEQ }).at(-1).stats.hits
    const set = cacheSet({ accesses: SEQ }).at(-1).stats.hits
    expect(set).toBeGreaterThanOrEqual(direct)
  })

  test('全相联 LRU 对块冲突免疫（默认序列命中更高）', () => {
    const fully = cacheFully({ accesses: SEQ }).at(-1).stats
    // 6 个不同块全装进 8 行，两次回访（0x00、0x04）都命中
    expect(fully.hits).toBe(2)
  })

  test('边界：空序列零统计', () => {
    const steps = cacheMapping({ mode: 'direct', accesses: [] })
    expect(steps).toHaveLength(1)
    expect(steps[0].stats).toMatchObject({ hits: 0, misses: 0 })
  })
})

describe('IEEE 754 单精度', () => {
  test('13.625：1101.101 → 1.101101×2^3，阶码 130', () => {
    const steps = ieee754({ value: 13.625 })
    const norm = steps.find((s) => s.phase === 'normalize')
    expect(norm.unbiasedExp).toBe(3)
    expect(norm.normalizedSig).toContain('1.101101')
    const bias = steps.find((s) => s.phase === 'bias')
    expect(bias.biasedExp).toBe(130)
    expect(bias.exponentBits).toBe('10000010')
    const m = steps.find((s) => s.phase === 'mantissa')
    expect(m.mantissaBits.startsWith('101101')).toBe(true)
    // 与 JS 原生 DataView 编码一致
    const buf = new ArrayBuffer(4)
    new DataView(buf).setFloat32(0, 13.625)
    const u32 = new DataView(buf).getUint32(0)
    expect(parseInt(`${steps.find((s) => s.phase === 'mantissa').sign}${bias.exponentBits}${m.mantissaBits}`, 2)).toBe(u32)
  })

  test('负数符号位为 1；1.0 编码标准', () => {
    const steps = ieee754({ value: -2.5 })
    expect(steps.find((s) => s.phase === 'sign').sign).toBe(1)
    const one = ieee754({ value: 1 })
    const f = one.find((s) => s.phase === 'final')
    expect(f.exponentBits).toBe('01111111')
    expect(f.mantissaBits).toBe('0'.repeat(23))
  })

  test('特殊值：0 / ∞ / NaN 走特殊编码', () => {
    expect(ieee754({ value: 0 })[1].phase).toBe('special')
    const inf = ieee754({ value: Infinity })
    expect(inf[1]).toMatchObject({ phase: 'special', biasedExp: 255 })
    expect(ieee754({ value: NaN })[1].phase).toBe('special')
  })
})

describe('五级流水线', () => {
  test('理想：n 条指令 n+4 周期完成，无 STALL', () => {
    const steps = pipelineIdeal()
    const sched = steps[0].schedule
    expect(steps[0].totalCycles).toBe(5 + 4)
    expect(sched.flat().filter((x) => x === 'STALL')).toHaveLength(0)
    // 每周期流水线段数在填充期后稳定为 5
    const cycle4 = steps[0].schedule.map((row) => row[4]).filter(Boolean).length
    expect(cycle4).toBe(5)
  })

  test('load-use：总周期 9（比理想多 1），含 STALL 与转发标注', () => {
    const steps = pipelineHazard()
    expect(steps[0].totalCycles).toBe(9)
    const cells = steps[0].schedule.flat().filter((x) => x === 'STALL')
    expect(cells.length).toBe(3) // I1 一个气泡，后续两条各顺延一格
    const fwd = steps.filter((s) => s.forwarding).map((s) => s.forwarding)
    expect(fwd).toContain('MEM→EX (inst 0 → inst 1)')
    expect(fwd).toContain('EX→EX (inst 1 → inst 2)')
  })

  test('两个导出口径一致', () => {
    expect(fiveStagePipeline({ scenario: 'ideal' })).toHaveLength(pipelineIdeal().length)
  })
})
