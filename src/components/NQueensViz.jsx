export default function NQueensViz({ data }) {
  if (!data) return null

  const { queens = [], row: currentRow, col: currentCol, status, solutionCount, n } = data

  const getCellColor = (r, c) => {
    // Current evaluating cell
    if (r === currentRow && c === currentCol) {
      if (status === 'valid') return 'bg-green-400 dark:bg-green-500'
      if (status === 'invalid') return 'bg-red-400 dark:bg-red-500'
      if (status === 'backtrack') return 'bg-yellow-500 dark:bg-yellow-600'
      return 'bg-yellow-300 dark:bg-yellow-400' // 'trying'
    }

    // Is there a queen placed here?
    // In queens array, index is row, value is col
    if (r < queens.length && queens[r] === c) {
      // In the valid step, the currently adding queen is temporarily set in the queens array
      if (r === currentRow && status === 'valid') {
        return 'bg-green-400 dark:bg-green-500'
      }
      return 'bg-blue-400 dark:bg-blue-500'
    }

    // Default checkerboard background
    const isDark = (r + c) % 2 === 1
    return isDark ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-700'
  }

  const renderBoard = () => {
    const boardSize = n || Math.max(queens.length, currentRow > -1 ? currentRow + 1 : 4) || 4 // fallback
    const cells = []
    
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        const hasQueen = (r < queens.length && queens[r] === c) || 
                         (status === 'valid' && r === currentRow && c === currentCol && queens[r] !== c) // just in case
        
        cells.push(
          <div
            key={`${r}-${c}`}
            className={`w-12 h-12 flex items-center justify-center transition-colors duration-200 ${getCellColor(r, c)}`}
          >
            {hasQueen && (
              <div
                className="text-2xl"
                style={{ animation: 'pop 0.25s ease-out' }}
              >
                ♕
              </div>
            )}
          </div>
        )
      }
    }

    return (
      <div 
        className="grid gap-0 border-2 border-gray-400 dark:border-gray-500 shrink-0" 
        style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
      >
        {cells}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          棋盘状态
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 h-6">
          {status === 'trying' && `尝试在 (${currentRow}, ${currentCol}) 放置皇后...`}
          {status === 'valid' && `位置 (${currentRow}, ${currentCol}) 有效！`}
          {status === 'invalid' && `位置 (${currentRow}, ${currentCol}) 冲突，无效。`}
          {status === 'backtrack' && `回溯：移除 (${currentRow}, ${currentCol}) 的皇后。`}
          {status === 'solved' && <span className="text-green-600 font-bold">🎉 找到一个解！</span>}
          {status === 'finish' && `搜索完成，共找到 ${solutionCount || 0} 个解。`}
        </p>
      </div>
      
      <div className="flex justify-center items-center">
         {renderBoard()}
      </div>

      <div className="mt-6 text-gray-600 dark:text-gray-300">
        已找到解的数量: <span className="font-bold text-blue-600 dark:text-blue-400">{solutionCount || 0}</span>
      </div>
    </div>
  )
}
