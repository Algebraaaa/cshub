/**
 * 改进后的 bubbleSort 算法示例
 * 包含 C++/Python 代码行号映射
 * 
 * C++ 代码行号映射 (1-indexed，按照代码块中的实际行数):
 * Line 2: int n = arr.size();
 * Line 3: for (int i = 0; i < n - 1; i++) {
 * Line 4:     bool swapped = false;
 * Line 5:     for (int j = 0; j < n - i - 1; j++) {
 * Line 6:         if (arr[j] > arr[j + 1]) {
 * Line 7:             swap(arr[j], arr[j + 1]);
 * Line 8:             swapped = true;
 * Line 10:     if (!swapped) break;
 * 
 * Python 代码行号映射 (1-indexed):
 * Line 1: def bubble_sort(arr):
 * Line 2:     n = len(arr)
 * Line 3:     for i in range(n - 1):
 * Line 4:         swapped = False
 * Line 5:         for j in range(n - i - 1):
 * Line 6:             if arr[j] > arr[j + 1]:
 * Line 7:                 arr[j], arr[j + 1] = arr[j + 1], arr[j]
 * Line 8:                 swapped = True
 * Line 10:         if not swapped:
 * Line 11:             break
 */

export function bubbleSortWithCodeLines(input) {
  const steps = []
  const arr = [...input]
  const n = arr.length
  const sortedIndices = new Set()

  for (let i = 0; i < n - 1; i++) {
    let swappedAny = false
    
    // 初始化 swapped = false
    steps.push({
      array: [...arr],
      comparing: [],
      swapped: [],
      sorted: [...sortedIndices],
      pseudoLine: 4,  // 伪代码第4行: swapped ← false
      cppLine: 4,     // C++第4行: bool swapped = false;
      pythonLine: 4,  // Python第4行: swapped = False
      description: `第 ${i + 1} 轮开始，swapped ← false`,
    })
    
    for (let j = 0; j < n - i - 1; j++) {
      // 比较 A[j] 和 A[j+1]
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapped: [],
        sorted: [...sortedIndices],
        pseudoLine: 6,  // 伪代码第6行: if A[i]>A[i+1]
        cppLine: 6,     // C++第6行: if (arr[j] > arr[j + 1]) {
        pythonLine: 6,  // Python第6行: if arr[j] > arr[j + 1]:
        description: `比较 arr[${j}]=${arr[j]} 与 arr[${j + 1}]=${arr[j + 1]}`,
      })
      
      if (arr[j] > arr[j + 1]) {
        // 交换
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swappedAny = true
        
        steps.push({
          array: [...arr],
          comparing: [],
          swapped: [j, j + 1],
          sorted: [...sortedIndices],
          pseudoLine: 7,  // 伪代码第7行: swap
          cppLine: 7,     // C++第7行: swap(arr[j], arr[j + 1]);
          pythonLine: 7,  // Python第7行: arr[j], arr[j + 1] = arr[j + 1], arr[j]
          description: `交换 → arr[${j}]=${arr[j]}, arr[${j + 1}]=${arr[j + 1]}`,
        })
        
        steps.push({
          array: [...arr],
          comparing: [],
          swapped: [j, j + 1],
          sorted: [...sortedIndices],
          pseudoLine: 8,  // 伪代码第8行: swapped ← true
          cppLine: 8,     // C++第8行: swapped = true;
          pythonLine: 8,  // Python第8行: swapped = True
          description: `标记 swapped = true`,
        })
      }
    }
    
    sortedIndices.add(n - 1 - i)
    
    steps.push({
      array: [...arr],
      comparing: [],
      swapped: [],
      sorted: [...sortedIndices],
      pseudoLine: 9,  // 伪代码第9行: n ← n - 1
      cppLine: 3,     // C++外层循环会自动进行（i++在第3行）
      pythonLine: 3,  // Python外层循环会自动进行（i增量在第3行）
      description: `本轮结束，${swappedAny ? '有交换，继续' : '无交换，提前退出'}`,
    })
    
    if (!swappedAny) {
      steps.push({
        array: [...arr],
        comparing: [],
        swapped: [],
        sorted: [...sortedIndices],
        pseudoLine: 10,  // 伪代码第10行: until
        cppLine: 10,     // C++第10行: if (!swapped) break;
        pythonLine: 10,  // Python第10行: if not swapped:
        description: `无交换发生，数组已有序，提前退出`,
      })
      break
    }
  }
  
  sortedIndices.add(0)
  steps.push({
    array: [...arr],
    comparing: [],
    swapped: [],
    sorted: [...Array(n).keys()],
    pseudoLine: 10,
    cppLine: 11,  // C++第11行: }
    pythonLine: 12,  // Python第12行: return arr
    description: '排序完成',
  })
  
  return steps
}

/**
 * 使用说明：
 * 1. 将此函数替换原来的 bubbleSort 函数
 * 2. 或者逐步更新现有函数，逐个步骤添加 cppLine 和 pythonLine
 * 3. 验证行号是否正确对应代码块中的实际行
 * 4. 测试播放动画时 C++ 和 Python 代码是否正确高亮
 */
