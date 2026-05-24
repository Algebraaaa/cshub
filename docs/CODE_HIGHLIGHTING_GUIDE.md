# 代码行高亮同步指南

## 概述

从本次更新开始，系统支持以下改进：

1. **伪代码不再自动同步**：伪代码保持静态显示，不会在动画执行时闪烁和抢占焦点
2. **C++/Python代码支持动画同步**：可以通过在步骤数据中添加代码行号来实现代码与动画的同步高亮

## 问题修复说明

### 之前的问题
- 伪代码会逐行执行并自动滚动到视图
- 当伪代码行变化时，焦点转移到伪代码区域，遮挡了动画

### 解决方案
- **伪代码**：现在保持静态，允许用户查看完整的伪代码逻辑而不被打扰
- **C++/Python代码**：新增对代码行号同步的支持

## 如何在算法中添加代码行高亮

### 步骤 1：映射C++代码行号

首先，在你的算法实现文件顶部添加C++代码行号的映射注释：

```javascript
// C++ code line mapping (1-indexed):
// Line 2: for (int i = 0; i < n - 1; i++)
// Line 3:     bool swapped = false;
// Line 4:     for (int j = 0; j < n - i - 1; j++)
// Line 5:         if (arr[j] > arr[j + 1])
// Line 6:             swap(arr[j], arr[j + 1]);
// Line 7:             swapped = true;
// Line 10:     if (!swapped) break;
```

### 步骤 2：在步骤对象中添加 `cppLine` 和 `pythonLine`

修改步骤对象，添加代码行号：

```javascript
steps.push({
  array: [...arr],
  comparing: [j, j + 1],
  swapped: [],
  sorted: [...sortedIndices],
  pseudoLine: 6,           // 伪代码第6行（原有，现在不使用）
  cppLine: 5,              // C++代码第5行
  pythonLine: 5,           // Python代码第5行
  description: `比较 arr[${j}]=${arr[j]} 与 arr[${j+1}]=${arr[j+1]}`,
})
```

### 步骤 3：使用 `codeLines` 对象（可选）

如果需要支持多种语言或动态映射，可以使用 `codeLines` 对象：

```javascript
steps.push({
  array: [...arr],
  comparing: [j, j + 1],
  swapped: [],
  sorted: [...sortedIndices],
  pseudoLine: 6,
  codeLines: {
    cpp: 5,
    python: 5,
    // 可以添加其他语言
  },
  description: `比较 arr[${j}]=${arr[j]} 与 arr[${j+1}]=${arr[j+1]}`,
})
```

## 代码行号查找方式

对于标准代码块，按照以下规则计数（1-indexed）：

### C++ 示例
```cpp
void bubbleSort(vector<int>& arr) {           // 1
    int n = arr.size();                       // 2
    for (int i = 0; i < n - 1; i++) {        // 3
        bool swapped = false;                 // 4
        for (int j = 0; j < n - i - 1; j++) { // 5
            if (arr[j] > arr[j + 1]) {       // 6
                swap(arr[j], arr[j + 1]);    // 7
                swapped = true;              // 8
            }
        }
        if (!swapped) break;                 // 9
    }
}
```

### Python 示例
```python
def bubble_sort(arr):                    # 1
    n = len(arr)                        # 2
    for i in range(n - 1):              # 3
        swapped = False                 # 4
        for j in range(n - i - 1):      # 5
            if arr[j] > arr[j + 1]:     # 6
                arr[j], arr[j + 1] = arr[j + 1], arr[j]  # 7
                swapped = True          # 8
        if not swapped:                 # 9
            break                       # 10
    return arr
```

## 使用场景

### 完整同步（推荐）
- 算法步骤既有伪代码行号，也有C++/Python行号
- 用户可以同时看到伪代码逻辑和具体实现
- 伪代码保持静态，C++/Python代码与动画同步

### 仅伪代码行号（当前实现）
- 如果步骤对象中没有 `cppLine` 或 `pythonLine` 字段
- C++/Python代码不会自动高亮，但仍可静态查看
- 伪代码也保持静态显示

### 逐步迁移
- 可以逐个算法添加 `cppLine` 和 `pythonLine` 支持
- 不添加的算法继续正常工作，无需修改

## 代码修改位置

### 关键文件
- `src/components/learning/CodeBlock.jsx` - 添加了 `noAutoScroll` 参数
- `src/pages/AlgorithmPage.jsx` - 修改了 `PseudocodeBlock` 和 `CodeTabs`
- `src/contexts/StepContext.jsx` - 无需修改，仍然传递步骤数据

### 扩展建议
如果要为所有算法添加代码行号支持，建议：

1. 创建一个映射文件定义每个算法的代码行号
2. 或者直接在步骤对象中内联 `cppLine`/`pythonLine`
3. 定期更新C++/Python代码时同步更新行号

## 测试建议

1. 打开任何算法页面，验证伪代码保持静态
2. 点击播放按钮执行动画
3. 动画应该正常显示，不被代码框抢占焦点
4. 切换到C++/Python标签，如果算法支持行号映射，应该看到代码行高亮

## 常见问题

**Q: 我的算法还没有 cppLine/pythonLine，会出错吗？**

A: 不会。系统向后兼容，没有这些字段的算法继续正常工作，只是C++/Python代码不会高亮。

**Q: 如何判断是否需要添加代码行号？**

A: 查看步骤对象，如果只有 `pseudoLine`，可以考虑添加 `cppLine` 和 `pythonLine` 来提升学习体验。

**Q: 代码行号改变了怎么办？**

A: 当C++/Python代码更新后，需要重新映射行号。建议保持代码简洁，减少不必要的改动。
