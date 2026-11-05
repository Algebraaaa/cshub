// p0Topics 中属于五门课的脚本化生成器：组成（CO）、OS、网络。
// 内容是固定教学步骤，测试形状、数量与关键事实（如 load-use 停顿 9 周期、
// IPv4 分片偏移 185/370）。
import { describe, test, expect } from 'vitest'
import {
  p0PipelineHazard, memoryTopic, osTopic, protocolTopic,
} from './p0Topics.js'

describe('组成原理：五级流水线 load-use 冒险', () => {
  test('经典停顿排程：4 条指令 9 周期，第 4 周期存在 STALL 气泡', () => {
    const steps = p0PipelineHazard()
    expect(steps[0].totalCycles).toBe(9)
    // 排程矩阵与唐朔飞《计算机组成原理》load-use 图一致
    const sched = steps[0].schedule
    expect(sched[1].slice(0, 5)).toEqual([null, 'IF', 'ID', 'STALL', 'EX'])
    expect(sched[3]).toEqual([null, null, null, 'IF', 'STALL', 'ID', 'EX', 'MEM', 'WB'])
    // 每条指令恰好经过 5 个流水段
    for (const row of sched) {
      expect(row.filter((x) => x && x !== 'STALL')).toHaveLength(5)
    }
    // 周期 4（index 4）有转发标注
    expect(steps[5].forwarding).toBe('MEM -> EX')
  })
})

describe('CO/OS 脚本化主题步骤', () => {
  const memorySlugs = ['instructioncycle', 'mainmemorydecode', 'tlbtranslation', 'virtualphysical', 'contiguousfit', 'buddy']
  for (const slug of memorySlugs) {
    test(`memoryTopic('${slug}') 步骤齐全且 active 递增`, () => {
      const steps = memoryTopic(slug)()
      expect(steps.length).toBeGreaterThan(1)
      steps.forEach((s, i) => {
        expect(s.active).toBe(i)
        expect(typeof s.description).toBe('string')
        expect(Array.isArray(s.facts)).toBe(true)
        expect(s.title).toBeTruthy()
      })
    })
  }

  test('连续分配：First/Best/Worst Fit 选择数字与教材一致', () => {
    const steps = memoryTopic('contiguousfit')()
    expect(steps[1].facts).toContain('choose=500K')
    expect(steps[2].facts).toContain('choose=300K')
    expect(steps[3].facts).toContain('choose=600K')
  })

  const osSlugs = ['deadlockgraph', 'producerconsumer', 'readerswriters']
  for (const slug of osSlugs) {
    test(`osTopic('${slug}') 步骤齐全`, () => {
      const steps = osTopic(slug)()
      expect(steps.length).toBeGreaterThan(1)
      expect(steps.every((s) => s.actors.length >= 2)).toBe(true)
    })
  }

  test('生产者消费者：信号量顺序 empty→full 不颠倒', () => {
    const text = osTopic('producerconsumer')().map((s) => s.description).join('|')
    expect(text).toMatch(/wait\(empty\).*signal\(full\).*wait\(full\)/s)
  })
})

describe('网络脚本化主题', () => {
  const netSlugs = ['dnsresolve', 'httpflow', 'tlshandshake', 'ipv4fragment', 'ripdistance']
  for (const slug of netSlugs) {
    test(`protocolTopic('${slug}') 步骤与消息齐全`, () => {
      const steps = protocolTopic(slug)()
      expect(steps.length).toBeGreaterThan(1)
      expect(steps.every((s) => typeof s.message === 'string' && s.message.length > 0)).toBe(true)
    })
  }

  test('IPv4 分片偏移 0/185/370（1500 MTU，1480/8=185）', () => {
    const steps = protocolTopic('ipv4fragment')()
    expect(steps[2].message).toContain('offset=0/185/370')
  })

  test('DNS：迭代顺序 根→顶级域→权威，且权威返回 IP', () => {
    const steps = protocolTopic('dnsresolve')()
    expect(steps[1].message).toMatch(/本地 DNS -> 根 DNS/)
    expect(steps[3].message).toMatch(/93\.184\.216\.34/)
  })
})
