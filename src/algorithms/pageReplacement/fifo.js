export function fifo(pages, capacity = 3) {
  const steps = []
  const frames = []
  let faults = 0
  
  steps.push({
    pages: [...pages],
    frames: [...frames],
    currentIndex: -1,
    fault: false,
    capacity,
    queue: [],
    description: '初始化：内存帧为空',
    faults
  })

  const queue = []

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    let fault = false
    let replaced = null

    if (!frames.includes(page)) {
      fault = true
      faults++
      if (frames.length < capacity) {
        frames.push(page)
        queue.push(page)
      } else {
        replaced = queue.shift()
        const index = frames.indexOf(replaced)
        frames[index] = page
        queue.push(page)
      }
    }

    steps.push({
      pages: [...pages],
      frames: [...frames],
      currentIndex: i,
      fault,
      replaced,
      capacity,
      queue: [...queue],
      cppLine: fault ? (replaced !== null ? 10 : 14) : 7,
      pythonLine: fault ? (replaced !== null ? 10 : 12) : 7,
      description: `访问页面 ${page}: ${fault ? (replaced !== null ? `缺页退出，淘汰页面 ${replaced}` : '缺页，存入空闲帧') : '缓存命中'}`,
      faults
    })
  }

  steps.push({
    pages: [...pages],
    frames: [...frames],
    currentIndex: pages.length,
    fault: false,
    capacity,
    queue: [...queue],
    description: `遍历完成，总缺页次数: ${faults}`,
    faults
  })

  return steps
}
