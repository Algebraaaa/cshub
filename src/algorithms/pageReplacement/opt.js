export function opt(pages, capacity = 3) {
  const steps = []
  const frames = []
  let faults = 0
  
  steps.push({
    pages: [...pages],
    frames: [...frames],
    currentIndex: -1,
    fault: false,
    capacity,
    cppLine: 2,
    pythonLine: 2,
    description: '初始化：内存帧为空',
    faults
  })

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    let fault = false
    let replaced = null

    if (!frames.includes(page)) {
      fault = true
      faults++
      if (frames.length < capacity) {
        frames.push(page)
      } else {
        let farthestIndex = -1
        let replaceIndexInFrames = -1
        for (let j = 0; j < frames.length; j++) {
            const nextUse = pages.indexOf(frames[j], i + 1)
            if (nextUse === -1) {
                replaceIndexInFrames = j
                break
            } else if (nextUse > farthestIndex) {
                farthestIndex = nextUse
                replaceIndexInFrames = j
            }
        }
        replaced = frames[replaceIndexInFrames]
        frames[replaceIndexInFrames] = page
      }
    }

    steps.push({
      pages: [...pages],
      frames: [...frames],
      currentIndex: i,
      fault,
      replaced,
      capacity,
      cppLine: fault ? (replaced !== null ? 30 : 10) : 7,
      pythonLine: fault ? (replaced !== null ? 24 : 10) : 7,
      description: `访问页面 ${page}: ${fault ? (replaced !== null ? `缺页退出，淘汰未来最久不使用的页面 ${replaced}` : '缺页，存入空闲帧') : '缓存命中'}`,
      faults
    })
  }

  steps.push({
    pages: [...pages],
    frames: [...frames],
    currentIndex: pages.length,
    fault: false,
    capacity,
    cppLine: 34,
    pythonLine: 26,
    description: `遍历完成，总缺页次数: ${faults}`,
    faults
  })

  return steps
}
