import { describe, expect, test } from 'vitest'
import { tcpHandshake } from './tcpHandshake.js'
import { NETWORK_ALGORITHMS } from '../../data/algorithms/network.js'

describe('TCP animation code highlighting', () => {
  test('every highlighted line exists and handshake does not point to a close transition', () => {
    const steps = tcpHandshake()
    const { python, cpp } = NETWORK_ALGORITHMS.tcphandshake.code
    for (const step of steps) {
      expect(step.pythonLine).toBeGreaterThan(0)
      expect(step.pythonLine).toBeLessThanOrEqual(python.split('\n').length)
      expect(step.cppLine).toBeGreaterThan(0)
      expect(step.cppLine).toBeLessThanOrEqual(cpp.split('\n').length)
    }
    const synAck = steps.find((step) => step.event === 'syn+ack')
    expect(python.split('\n')[synAck.pythonLine - 1]).toContain('SYN_RCVD')
    const fin = steps.find((step) => step.event === 'fin')
    expect(python.split('\n')[fin.pythonLine - 1]).toContain('FIN_WAIT_1')
  })
})
