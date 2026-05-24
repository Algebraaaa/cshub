// Dining Philosophers visualization step generator.
// Demonstrates two scenarios in sequence:
//   1) Naive solution: all pick up left fork simultaneously → DEADLOCK
//   2) Resource ordering solution: pick up lower-index fork first → safe
//
// Step shape:
// { philosophers: [{state}], forks: [owner], mode, currentPhilosopher,
//   description, phase }

const N = 5
const STATE = {
  THINKING: 'thinking',
  HUNGRY: 'hungry',
  HAS_LEFT: 'has_left',
  HAS_RIGHT: 'has_right',
  EATING: 'eating',
  WAITING: 'waiting',
}

export function diningPhilosophers() {
  const steps = []

  function snap(philosophers, forks, mode, currentPhilosopher, description, phase) {
    steps.push({
      philosophers: philosophers.map(s => ({ state: s })),
      forks: forks.slice(),
      mode, currentPhilosopher,
      description, phase,
      n: N,
    })
  }

  // ─── Scenario 1: Naive (DEADLOCK) ─────────────────────────────────
  let phils = new Array(N).fill(STATE.THINKING)
  let forks = new Array(N).fill(-1)

  snap(phils, forks, 'naive', -1, '【场景 1】朴素解法：所有哲学家先拿左叉、再拿右叉。所有人初始 thinking', 'init')

  phils = phils.map(() => STATE.HUNGRY)
  snap(phils, forks, 'naive', -1, '🍽️ 所有哲学家同时变饥饿，都想吃面', 'all_hungry')

  // All pick up left fork
  for (let i = 0; i < N; i++) {
    forks[i] = i           // left fork of philosopher i is fork[i]
    phils[i] = STATE.HAS_LEFT
  }
  snap(phils, forks, 'naive', -1, '⚠️ 全部同时拿起左叉（fork[i]）', 'pick_left')

  // Now everyone tries to pick right fork, all blocked
  for (let i = 0; i < N; i++) {
    phils[i] = STATE.WAITING
  }
  snap(phils, forks, 'naive', -1, '🚨 死锁！每人都等右邻居放下叉子，而右邻居也在等。循环等待 → DEADLOCK', 'deadlock')

  // ─── Scenario 2: Resource ordering ─────────────────────────────────
  phils = new Array(N).fill(STATE.THINKING)
  forks = new Array(N).fill(-1)

  snap(phils, forks, 'ordered', -1, '【场景 2】资源序号解法：每人按 min(left, right) 先拿，破除循环等待', 'reset')

  // Round 1: P0..P3 eat (P4 must let P0 go first due to ordering)
  // For philosopher i: left = i, right = (i+1) % N
  // Rule: pick min(left, right) first. For P0..P3, left < right. For P4, left=4, right=0 → 0 first.

  // Each philosopher's lower-numbered fork
  // Step through round 1: P0, P1, P2, P3 take their lower fork in turn
  phils = phils.map(() => STATE.HUNGRY)
  snap(phils, forks, 'ordered', -1, '所有人饥饿，开始按"先拿编号小的叉子"规则争夺', 'hungry')

  // P0 grabs fork 0 (lower)
  forks[0] = 0; phils[0] = STATE.HAS_LEFT
  snap(phils, forks, 'ordered', 0, 'P0 拿起 fork[0]（左叉，也是较小编号）', 'pick')

  // P1 grabs fork 1 (lower)
  forks[1] = 1; phils[1] = STATE.HAS_LEFT
  snap(phils, forks, 'ordered', 1, 'P1 拿起 fork[1]', 'pick')

  // P2 grabs fork 2 (lower)
  forks[2] = 2; phils[2] = STATE.HAS_LEFT
  snap(phils, forks, 'ordered', 2, 'P2 拿起 fork[2]', 'pick')

  // P3 grabs fork 3 (lower)
  forks[3] = 3; phils[3] = STATE.HAS_LEFT
  snap(phils, forks, 'ordered', 3, 'P3 拿起 fork[3]', 'pick')

  // P4 wants fork 0 (lower) but it's taken by P0 → wait
  phils[4] = STATE.WAITING
  snap(phils, forks, 'ordered', 4, 'P4 需要先拿 fork[0]（较小），但被 P0 占用 → 等待。⚡ 关键：因为 P4 没拿任何叉，循环被打破', 'wait')

  // P0 grabs fork 1 (higher)... wait P1 holds it. Hmm we need a different example.
  // Let's redesign: do it sequentially based on which can complete.

  // Reset for cleaner demonstration
  phils = new Array(N).fill(STATE.THINKING).map(() => STATE.HUNGRY)
  forks = new Array(N).fill(-1)
  snap(phils, forks, 'ordered', -1, '🔄 重置场景：让我们演示一个能完成的执行序列', 'restart')

  // P0 picks lower (fork 0), then higher (fork 1)
  forks[0] = 0; phils[0] = STATE.HAS_LEFT
  snap(phils, forks, 'ordered', 0, 'P0 先拿 fork[0]', 'pick')
  forks[1] = 0; phils[0] = STATE.EATING
  snap(phils, forks, 'ordered', 0, '✅ P0 拿到 fork[1]，开始吃面 🍝', 'eat')

  // P2 picks lower (fork 2), then higher (fork 3)
  forks[2] = 2; phils[2] = STATE.HAS_LEFT
  snap(phils, forks, 'ordered', 2, 'P2 拿 fork[2]（P1/P3 仍饥饿等待）', 'pick')
  forks[3] = 2; phils[2] = STATE.EATING
  snap(phils, forks, 'ordered', 2, '✅ P2 拿到 fork[3]，开始吃面 🍝', 'eat')

  // P0 finishes
  forks[0] = -1; forks[1] = -1; phils[0] = STATE.THINKING
  snap(phils, forks, 'ordered', 0, 'P0 吃完，放下 fork[0] 和 fork[1]，回到 thinking', 'release')

  // P1 can now eat
  forks[1] = 1; phils[1] = STATE.HAS_LEFT
  snap(phils, forks, 'ordered', 1, 'P1 拿 fork[1]', 'pick')
  // P1 needs fork 2 but P2 still eating → wait briefly
  phils[1] = STATE.WAITING
  snap(phils, forks, 'ordered', 1, 'P1 等待 fork[2]（被 P2 占用）', 'wait')

  // P2 finishes
  forks[2] = -1; forks[3] = -1; phils[2] = STATE.THINKING
  snap(phils, forks, 'ordered', 2, 'P2 吃完，放下 fork[2] 和 fork[3]', 'release')

  // P1 grabs fork 2
  forks[2] = 1; phils[1] = STATE.EATING
  snap(phils, forks, 'ordered', 1, '✅ P1 拿到 fork[2]，开始吃面 🍝', 'eat')

  // P3 takes lower (fork 3), then higher (fork 4)
  forks[3] = 3; phils[3] = STATE.HAS_LEFT
  snap(phils, forks, 'ordered', 3, 'P3 拿 fork[3]', 'pick')
  forks[4] = 3; phils[3] = STATE.EATING
  snap(phils, forks, 'ordered', 3, '✅ P3 拿到 fork[4]，开始吃面 🍝', 'eat')

  // P4 takes its lower (fork 0)
  forks[0] = 4; phils[4] = STATE.HAS_LEFT
  snap(phils, forks, 'ordered', 4, 'P4 拿 fork[0]（注意 P4 的较小编号是 0）', 'pick')
  // P4 still needs fork 4, but P3 holds it
  phils[4] = STATE.WAITING
  snap(phils, forks, 'ordered', 4, 'P4 等待 fork[4]', 'wait')

  // P3 finishes
  forks[3] = -1; forks[4] = -1; phils[3] = STATE.THINKING
  snap(phils, forks, 'ordered', 3, 'P3 吃完释放', 'release')

  forks[4] = 4; phils[4] = STATE.EATING
  snap(phils, forks, 'ordered', 4, '✅ P4 拿到 fork[4]，开始吃面 🍝', 'eat')

  // Everyone eventually gets to eat
  forks[1] = -1; forks[2] = -1; phils[1] = STATE.THINKING
  forks[0] = -1; forks[4] = -1; phils[4] = STATE.THINKING
  snap(phils, forks, 'ordered', -1, '🎉 资源序号策略下，所有哲学家轮流吃到面，无死锁', 'done')

  return steps
}
