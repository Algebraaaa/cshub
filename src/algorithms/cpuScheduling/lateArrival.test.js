import { describe, expect, test } from 'vitest'
import { cpuSchedule } from './nonPreemptive.js'

describe('CPU scheduling with an idle gap', () => {
  test.each(['fcfs', 'sjf', 'srtn'])('%s finishes a process arriving after a long idle period', (algo) => {
    const processList = [
      { id: 'P1', arrival: 0, burst: 2 },
      { id: 'P2', arrival: 137, burst: 3 },
    ]
    const final = cpuSchedule({ algo, processList }).at(-1)
    expect(final.stats.find((p) => p.id === 'P2').finish).toBe(140)
    expect(final.completed).toEqual(['P1', 'P2'])
  })
})
