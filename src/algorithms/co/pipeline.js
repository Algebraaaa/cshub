// MIPS 5-stage pipeline visualization step generator.
// Stages: IF, ID, EX, MEM, WB.
// Demonstrates two scenarios:
//   1) Ideal pipeline (no hazards)
//   2) Data hazard with forwarding (and a stall when forwarding cannot cover load-use)
//
// Step shape:
// { cycle, instructions, schedule, mode, event, description, forwarding, stall }
//   schedule: 2D matrix [instruction_idx][cycle] = 'IF'|'ID'|'EX'|'MEM'|'WB'|'STALL'|null

const STAGES = ['IF', 'ID', 'EX', 'MEM', 'WB']
const NUM_STAGES = STAGES.length

const INSTRUCTIONS_IDEAL = [
  { idx: 0, asm: 'add $t0, $s1, $s2',  desc: '相互独立，无依赖' },
  { idx: 1, asm: 'sub $t1, $s3, $s4',  desc: '相互独立' },
  { idx: 2, asm: 'and $t2, $t1, $s5',  desc: '相互独立' },
  { idx: 3, asm: 'or  $t3, $t2, $s6',  desc: '相互独立' },
  { idx: 4, asm: 'sll $t4, $t3, 2',    desc: '相互独立' },
]

const INSTRUCTIONS_HAZARD = [
  { idx: 0, asm: 'lw  $t0, 0($s1)',    desc: 'Load $t0' },
  { idx: 1, asm: 'add $t1, $t0, $s2',  desc: '使用 $t0 → load-use 冒险' },
  { idx: 2, asm: 'sub $t2, $t1, $s3',  desc: '使用 $t1 → 数据冒险（可转发）' },
  { idx: 3, asm: 'and $t3, $s4, $s5',  desc: '相互独立' },
]

function buildIdealSchedule(instructions) {
  const n = instructions.length
  const totalCycles = n + NUM_STAGES - 1
  const schedule = Array.from({ length: n }, () => new Array(totalCycles).fill(null))
  for (let i = 0; i < n; i++) {
    for (let s = 0; s < NUM_STAGES; s++) {
      schedule[i][i + s] = STAGES[s]
    }
  }
  return { schedule, totalCycles }
}

function buildHazardSchedule(instructions) {
  // Instruction 0: lw, target $t0 (loads in MEM, value ready at end of MEM)
  // Instruction 1: depends on $t0 — load-use hazard, MUST stall 1 cycle, then forward MEM→EX
  // Instruction 2: depends on $t1 (from inst 1, computed in EX), forward EX→EX
  // Instruction 3: independent
  const n = instructions.length
  const totalCycles = 11
  const schedule = Array.from({ length: n }, () => new Array(totalCycles).fill(null))
  // Inst 0: IF ID EX MEM WB at cycles 0,1,2,3,4
  schedule[0][0] = 'IF'; schedule[0][1] = 'ID'; schedule[0][2] = 'EX'; schedule[0][3] = 'MEM'; schedule[0][4] = 'WB'
  // Inst 1: normally IF@1, ID@2, EX@3, MEM@4, WB@5
  // But needs to stall 1 cycle because $t0 only ready at end of MEM (cycle 3)
  // After stall: IF@1, ID@2 (then bubble at 3), EX@4 (forwarded), MEM@5, WB@6
  schedule[1][1] = 'IF'; schedule[1][2] = 'ID'; schedule[1][3] = 'STALL'; schedule[1][4] = 'EX'; schedule[1][5] = 'MEM'; schedule[1][6] = 'WB'
  // Inst 2: depends on $t1 (in EX at cycle 4 for inst 1). Forward EX→EX.
  // IF@2, ID@3 (stall@4 because inst 1 stalled), EX@5 (forwarded), MEM@6, WB@7
  schedule[2][2] = 'IF'; schedule[2][3] = 'ID'; schedule[2][4] = 'STALL'; schedule[2][5] = 'EX'; schedule[2][6] = 'MEM'; schedule[2][7] = 'WB'
  // Inst 3: independent. IF@3, then stall at 4, ID@5, EX@6, MEM@7, WB@8
  schedule[3][3] = 'IF'; schedule[3][4] = 'STALL'; schedule[3][5] = 'ID'; schedule[3][6] = 'EX'; schedule[3][7] = 'MEM'; schedule[3][8] = 'WB'
  return { schedule, totalCycles }
}

function snapshot(steps, instructions, schedule, totalCycles, mode, cycle, extra) {
  steps.push({
    cycle,
    totalCycles,
    instructions,
    schedule: schedule.map(row => row.slice()),
    mode,
    ...extra,
  })
}

export function fiveStagePipeline({ scenario = 'ideal' } = {}) {
  const instructions = scenario === 'ideal' ? INSTRUCTIONS_IDEAL : INSTRUCTIONS_HAZARD
  const { schedule, totalCycles } = scenario === 'ideal'
    ? buildIdealSchedule(instructions)
    : buildHazardSchedule(instructions)
  const steps = []

  snapshot(steps, instructions, schedule, totalCycles, scenario, -1, {
    description: scenario === 'ideal'
      ? `理想流水线：${instructions.length} 条无依赖指令，5 级流水（IF→ID→EX→MEM→WB），${totalCycles} 周期完成`
      : `数据冒险场景：第一条 lw 后紧跟使用 $t0 的指令，演示 load-use 冒险 + 转发`,
    phase: 'init',
  })

  for (let c = 0; c < totalCycles; c++) {
    // Build description for this cycle
    const activeInsts = []
    for (let i = 0; i < instructions.length; i++) {
      const stage = schedule[i][c]
      if (stage) activeInsts.push(`I${i}: ${stage}`)
    }
    const hasStall = activeInsts.some(s => s.includes('STALL'))
    snapshot(steps, instructions, schedule, totalCycles, scenario, c, {
      phase: hasStall ? 'stall' : 'normal',
      description: `周期 ${c + 1}：${activeInsts.join(', ') || '空闲'}${hasStall ? '（⚠️ 有 STALL）' : ''}`,
      forwarding: scenario === 'hazard' && c === 4 ? 'MEM→EX (inst 0 → inst 1)' :
                   scenario === 'hazard' && c === 5 ? 'EX→EX (inst 1 → inst 2)' : null,
    })
  }

  // Summary
  const numStalls = scenario === 'hazard' ? 1 : 0
  const speedup = (instructions.length * NUM_STAGES) / totalCycles
  snapshot(steps, instructions, schedule, totalCycles, scenario, totalCycles - 1, {
    phase: 'done',
    description: scenario === 'ideal'
      ? `🎉 完成：${instructions.length} 条指令 × 5 级 = ${instructions.length * NUM_STAGES} 周期（顺序执行），流水后 ${totalCycles} 周期，加速比 = ${speedup.toFixed(2)}×`
      : `🎉 完成：${numStalls} 个 STALL 气泡。如无转发还要再多 2 个 STALL`,
  })

  return steps
}

export function pipelineIdeal()  { return fiveStagePipeline({ scenario: 'ideal' }) }
export function pipelineHazard() { return fiveStagePipeline({ scenario: 'hazard' }) }
