// 自动从 algorithms.js 拆分（1 个算法 · backtracking 学科）
import { nQueens } from '../../algorithms/backtracking/nQueens'

export const BACKTRACKING_ALGORITHMS = {
  nqueens: {
    slug: 'nqueens',
    name: 'N皇后问题',
    nameEn: 'N-Queens',
    category: 'backtracking',
    difficulty: '中等',
    fn: nQueens,
    viz: 'backtracking',
    timeComplexity: { best: 'O(N!)', average: 'O(N!)', worst: 'O(N!)' },
    spaceComplexity: 'O(N)',
    stable: false,
    inPlace: false,
    description: '在 N×N 的棋盘上放置 N 个皇后，使其不能互相攻击。',
    intuition: `N皇后问题是回溯算法的经典应用。我们需要在棋盘上放置皇后，使得没有任何两个皇后占据同一行、同一列或同一对角线。
    
算法采用逐行放置的策略，在每一行尝试所有列，如果放置当前位置不会与之前的皇后冲突，则继续递归放置下一行；如果发生冲突或之后的行无法成功放置，则撤销当前选择（回溯），尝试下一个位置。`,
    pseudocode: `procedure solveNQueens(board, row):
    if row == n:
        add board to solutions
        return
        
    for col from 0 to n-1:
        if isValid(board, row, col):
            place queen at (row, col)
            solveNQueens(board, row + 1)
            remove queen from (row, col)

procedure isValid(board, row, col):
    for i from 0 to row-1:
        if board[i] == col or
           abs(board[i] - col) == abs(i - row):
            return false
    return true`,
    code: {
      cpp: `void solveNQueens(int row, int n, vector<int>& queens, vector<vector<string>>& res) {
    if (row == n) {
        vector<string> board(n, string(n, '.'));
        for (int i = 0; i < n; i++) board[i][queens[i]] = 'Q';
        res.push_back(board);
        return;
    }
    for (int col = 0; col < n; col++) {
        if (isValid(queens, row, col)) {
            queens[row] = col;
            solveNQueens(row + 1, n, queens, res);
        }
    }
}

bool isValid(const vector<int>& queens, int row, int col) {
    for (int i = 0; i < row; i++) {
        if (queens[i] == col || abs( queens[i] - col) == abs(i - row))
            return false;
    }
    return true;
}`,
      python: `def solveNQueens(n):
    def backtrack(row, queens):
        if row == n:
            res.append(queens[:])
            return
        for col in range(n):
            if is_valid(queens, row, col):
                queens.append(col)
                backtrack(row + 1, queens)
                queens.pop()
                
    def is_valid(queens, row, col):
        for r, c in enumerate(queens):
            if c == col or abs(r - row) == abs(c - col):
                return False
        return True
        
    res = []
    backtrack(0, [])
    return res`,
    },
    applications: [
      '约束满足问题（Constraint Satisfaction Problem）的经典模型',
      '回溯算法与递归思想的入门教学',
      '在很多复杂调度、排课等问题上的原理运用',
    ],
  },

}

export default BACKTRACKING_ALGORITHMS
