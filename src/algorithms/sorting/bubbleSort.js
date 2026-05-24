// pseudoLine maps to pseudocode line numbers (1-indexed):
// 1:procedure  2:n←length  3:repeat  4:swapped←false  5:for i
// 6:if A[i]>A[i+1]  7:swap  8:swapped←true  9:n←n-1  10:until
// C++ code line mapping (1-indexed): 2:int n=arr.size(); 3:for(int i...) 4:bool swapped=false; 5:for(int j...) 6:if(arr[j]>arr[j+1]) 7:swap(...) 8:swapped=true; 10:if(!swapped)break;
// Python code line mapping (1-indexed): 2:n=len(arr) 3:for i in range(n-1): 4:swapped=False 5:for j in range(n-i-1): 6:if arr[j]>arr[j+1]: 7:arr[j],arr[j+1]=... 8:swapped=True 10:if not swapped: 11:break
export function bubbleSort(input) {
  const steps = []
  const arr = [...input]
  const n = arr.length
  const sortedIndices = new Set()

  // 边界情况：空数组或单元素
  if (n <= 1) {
    if (n === 1) {
      sortedIndices.add(0)
      steps.push({
        array: arr,
        comparing: [],
        swapped: [],
        sorted: sortedIndices,
        pseudoLine: 1,
        cppLine: 1,
        pythonLine: 1,
        description: n === 0 ? '空数组，无需排序' : '单元素数组，已排序',
      })
    }
    return steps
  }

  for (let i = 0; i < n - 1; i++) {
    let swappedAny = false
    steps.push({
      array: [...arr], comparing: [], swapped: [], sorted: [...sortedIndices],
      i,
      j: null,
      pseudoLine: 4,
      cppLine: 4, pythonLine: 4,
      description: `第 ${i + 1} 轮开始，swapped ← false`,
    })
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        array: [...arr], comparing: [j, j + 1], swapped: [], sorted: [...sortedIndices],
        i,
        j,
        pseudoLine: 6,
        cppLine: 6, pythonLine: 6,
        description: `比较 arr[${j}]=${arr[j]} 与 arr[${j+1}]=${arr[j+1]}${arr[j] === arr[j+1] ? ' （相等，无需交换）' : ''}`,
      })
      if (arr[j] > arr[j + 1]) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swappedAny = true
        steps.push({
          array: [...arr], comparing: [], swapped: [j, j + 1], sorted: [...sortedIndices],
          i,
          j,
          pseudoLine: 7,
          cppLine: 7, pythonLine: 7,
          description: `交换 → arr[${j}]=${arr[j]}, arr[${j+1}]=${arr[j+1]}`,
        })
      }
    }
    sortedIndices.add(n - 1 - i)
    steps.push({
      array: [...arr], comparing: [], swapped: [], sorted: [...sortedIndices],
      i,
      j: null,
      pseudoLine: 9,
      cppLine: 11, pythonLine: 9,
      description: `本轮结束，${swappedAny ? '有交换，继续' : '无交换，提前退出'}`,
    })
    if (!swappedAny) break
  }
  sortedIndices.add(0)
  steps.push({
    array: [...arr], comparing: [], swapped: [], sorted: [...Array(n).keys()],
    pseudoLine: 10,
    cppLine: 13, pythonLine: 11,
    description: '排序完成',
  })
  return steps
}
