// 欧拉筛（Euler Sieve / 线性筛）
// 每个合数只被其最小质因子筛去一次
// 时间复杂度 O(n)

export function eulerSieve(n = 30) {
  const steps = []
  n = Math.max(2, Math.min(n, 200))

  const isPrime = new Array(n + 1).fill(true)
  isPrime[0] = isPrime[1] = false
  const primes = []

  steps.push({
    n,
    isPrime: [...isPrime],
    primes: [],
    current: -1,
    currentPrime: -1,
    composite: -1,
    phase: 'init',
    highlightIdx: -1,
    cppLine: 4,
    pythonLine: 3,
    description: `初始化：将 2..${n} 全部标记为质数，primes 列表为空`,
  })

  for (let i = 2; i <= n; i++) {
    if (isPrime[i]) {
      primes.push(i)
      steps.push({
        n,
        isPrime: [...isPrime],
        primes: [...primes],
        current: i,
        currentPrime: i,
        composite: -1,
        phase: 'check',
        highlightIdx: i,
        cppLine: 7,
        pythonLine: 6,
        description: `i=${i}：isPrime[${i}]=true → ${i} 是质数，加入 primes 列表`,
      })
    } else {
      steps.push({
        n,
        isPrime: [...isPrime],
        primes: [...primes],
        current: i,
        currentPrime: -1,
        composite: -1,
        phase: 'check',
        highlightIdx: i,
        cppLine: 7,
        pythonLine: 6,
        description: `i=${i}：isPrime[${i}]=false → ${i} 是合数，跳过`,
      })
    }

    for (let j = 0; j < primes.length; j++) {
      const p = primes[j]
      const cp = i * p

      if (cp > n) {
        steps.push({
          n,
          isPrime: [...isPrime],
          primes: [...primes],
          current: i,
          currentPrime: p,
          composite: cp,
          phase: 'sieve',
          highlightIdx: -1,
          cppLine: 10,
          pythonLine: 9,
          description: `i=${i}, p=${p}：i×p=${cp} > ${n}，越界退出内循环`,
        })
        break
      }

      isPrime[cp] = false

      steps.push({
        n,
        isPrime: [...isPrime],
        primes: [...primes],
        current: i,
        currentPrime: p,
        composite: cp,
        phase: 'sieve',
        highlightIdx: cp,
        cppLine: 11,
        pythonLine: 10,
        description: `i=${i}, p=${p}：标记 ${i}×${p}=${cp} 为合数（${cp} 的最小质因子是 ${p}）`,
      })

      if (i % p === 0) {
        steps.push({
          n,
          isPrime: [...isPrime],
          primes: [...primes],
          current: i,
          currentPrime: p,
          composite: cp,
          phase: 'sieve',
          highlightIdx: cp,
          cppLine: 12,
          pythonLine: 11,
          description: `关键：${i} % ${p} == 0 → 退出内循环。保证 ${cp} 之后的合数（如 ${i}×${primes[j + 1] || '?'}）会被更大的 i 用 ${p} 来筛`,
        })
        break
      }
    }
  }

  steps.push({
    n,
    isPrime: [...isPrime],
    primes: [...primes],
    current: -1,
    currentPrime: -1,
    composite: -1,
    phase: 'done',
    highlightIdx: -1,
    cppLine: 14,
    pythonLine: 13,
    description: `欧拉筛完成：2..${n} 中共有 ${primes.length} 个质数：[${primes.join(', ')}]`,
  })

  return steps
}
