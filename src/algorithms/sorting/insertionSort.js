// Steps: { array, comparing, swapped, sorted, description }
// C++ code line mapping: 3:for(int i=1...) 4:int key=arr[i] 5:int j=i-1 6:while(j>=0...) 7:arr[j+1]=arr[j] 8:j-- 9:arr[j+1]=key
// Python code line mapping: 3:for i in range(1,n): 4:key=arr[i] 5:j=i-1 6:while j>=0 and arr[j]>key: 7:arr[j+1]=arr[j] 8:j-=1 9:arr[j+1]=key
export function insertionSort(input) {
  const steps = []
  const arr = [...input]
  const n = arr.length
  const sorted = new Set([0])

  // 边界情况：空数组或单元素
  if (n <= 1) {
    if (n === 1) {
      sorted.add(0)
      steps.push({
        array: arr,
        sorted,
        comparing: [],
        shifted: [],
        inserted: [],
        cppLine: 1,
        pythonLine: 1,
        phase: 'done',
        description: n === 0 ? '空数组，无需排序' : '单元素数组，已排序',
      })
    }
    return steps
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sorted: [...sorted],
    cppLine: 3,
    pythonLine: 2,
    description: '把第一个元素视为已排序的"手牌"',
  })

  for (let i = 1; i < n; i++) {
    const key = arr[i]
    let j = i - 1
    steps.push({
      array: [...arr],
      comparing: [i],
      swapped: [],
      sorted: [...sorted],
      cppLine: 4, pythonLine: 3,
      description: `取第 ${i} 个元素 ${key}，准备插入到左侧已排序区`,
    })

    while (j >= 0 && arr[j] > key) {
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapped: [],
        sorted: [...sorted],
        cppLine: 6, pythonLine: 5,
        description: `比较 arr[${j}]=${arr[j]} 与 key=${key}：更大，需要后移`,
      })
      arr[j + 1] = arr[j]
      steps.push({
        array: [...arr],
        comparing: [],
        swapped: [j + 1],
        sorted: [...sorted],
        cppLine: 7, pythonLine: 6,
        description: `arr[${j}] 后移到位置 ${j + 1}`,
      })
      j--
    }
    arr[j + 1] = key
    sorted.add(i)
    steps.push({
      array: [...arr],
      comparing: [],
      swapped: [j + 1],
      sorted: [...sorted],
      cppLine: 10, pythonLine: 8,
      description: `把 ${key} 插入到位置 ${j + 1}，前 ${i + 1} 个元素已有序`,
    })
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sorted: [...Array(n).keys()],
    cppLine: 12,
    pythonLine: 9,
    description: '排序完成',
  })
  return steps
}
