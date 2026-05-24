export function nQueens({ n = 8 }) {
  const steps = []
  const queens = [] 
  let solutionCount = 0

  function isValid(row, col) {
    for (let r = 0; r < row; r++) {
      const c = queens[r]
      if (c === col || Math.abs(c - col) === Math.abs(r - row)) {
        return false
      }
    }
    return true
  }

  function backtrack(row) {
    if (row === n) {
      solutionCount++
      steps.push({
        queens: [...queens],
        row: -1,
        col: -1,
        status: 'solved',
        solutionCount,
        n,
        cppLine: 5,
        pythonLine: 4
      })
      return
    }

    for (let col = 0; col < n; col++) {
      steps.push({
        queens: [...queens],
        row,
        col,
        status: 'trying',
        solutionCount,
        n,
        cppLine: 8,
        pythonLine: 6
      })

      if (isValid(row, col)) {
        steps.push({
          queens: [...queens, col],
          row,
          col,
          status: 'valid',
          solutionCount,
          n,
          cppLine: 10,
          pythonLine: 8
        })
        
        queens.push(col)
        backtrack(row + 1)
        queens.pop()
        
        steps.push({
          queens: [...queens],
          row,
          col,
          status: 'backtrack',
          solutionCount,
          n,
          cppLine: 12,
          pythonLine: 10
        })
      } else {
        steps.push({
          queens: [...queens],
          row,
          col,
          status: 'invalid',
          solutionCount,
          n,
          cppLine: 9,
          pythonLine: 7
        })
      }
    }
  }

  backtrack(0)
  
  steps.push({
    queens: [],
    row: -1,
    col: -1,
    status: 'finish',
    solutionCount,
    n
  })

  return steps
}