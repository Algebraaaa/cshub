export function lru(pages, capacity = 3) {
  const steps = []
  const frames = []
  let faults = 0
  
  steps.push({
    pages: [...pages],
    frames: [...frames],
    currentIndex: -1,
    fault: false,
    capacity,
    recentlyUsed: [],
    cppLine: 2,
    pythonLine: 2,
    description: '初始化：内存帧为空',
    faults
  })

  const recentlyUsed = []

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    let fault = false
    let replaced = null

    if (!frames.includes(page)) {
      fault = true
      faults++
      if (frames.length < capacity) {
        frames.push(page)
        recentlyUsed.push(page)
      } else {
        replaced = recentlyUsed.shift()
        const index = frames.indexOf(replaced)
        frames[index] = page
        recentlyUsed.push(page)
      }
    } else {
      const ruIndex = recentlyUsed.indexOf(page)
      recentlyUsed.splice(ruIndex, 1)
      recentlyUsed.push(page)
    }

    steps.push({
      pages: [...pages],
      frames: [...frames],
      currentIndex: i,
      fault,
      replaced,
      capacity,
      recentlyUsed: [...recentlyUsed],
      cppLine: fault ? (replaced !== null ? 10 : 18) : 16,
      pythonLine: fault ? (replaced !== null ? 10 : 13) : 12,
      description: `访问页面 ${page}: ${fault ? (replaced !== null ? `缺页退出，淘汰最久未使用的页面 ${replaced}` : '缺页，存入空闲帧') : '缓存命中，更新最近使用记录'}`,
      faults
    })
  }

  steps.push({
    pages: [...pages],
    frames: [...frames],
    currentIndex: pages.length,
    fault: false,
    capacity,
    recentlyUsed: [...recentlyUsed],
    cppLine: 21,
    pythonLine: 15,
    description: `遍历完成，总缺页次数: ${faults}`,
    faults
  })

  return steps
}
