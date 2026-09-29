# 代码行高亮同步

动画播放时，右侧代码块自动高亮当前步骤对应的代码行。合并自原
`CODE_HIGHLIGHTING_GUIDE.md`、`QUICK_START.md`、`QUICK_REFERENCE.md`。

## 用户视角

在支持并排显示的算法页（如冒泡排序、插入排序、选择排序）：

- 左侧动画，右侧代码，代码块 sticky 跟随滚动
- 点击播放，代码行随步骤自动高亮；拖动进度条同样实时跟随
- 点击 C++ / Python 标签切换语言，高亮行号相应变化
- 窄屏自动竖排，也可点按钮手动切换布局

**伪代码保持静态、不高亮**，这是刻意设计：早期版本伪代码逐行 `scrollIntoView()`
会抢占焦点、遮挡动画。由 `CodeBlock` 的 `noAutoScroll` 参数控制。

图、树、字符串类算法不显示并排代码 —— 可视化本身需要更大空间。

## 为算法添加行号映射

**当前推荐写法**是 step builder 的 `.line()`：

```js
.line({ cpp: 11, py: 9, pseudo: 9 })
```

参考 `src/algorithms/sorting/bubbleSort.js` 的实际用法。行号一律 **1-indexed**，
对应代码块中的实际行。

习惯做法是在算法文件顶部写一段映射注释，便于代码变动时同步维护：

```js
// C++ code line mapping (1-indexed):
// Line 3: for (int i = 0; i < n - 1; i++)
// Line 4: bool swapped = false;
```

## 行号解析顺序

统一由 `src/utils/stepProtocol.js` 的 `getStepCodeLine(step, lang)` 处理，
按以下优先级回退：

1. `step.cppLine` / `step.pythonLine` / `step.javaLine`（显式，legacy）
2. `step.codeLines[lang]`
3. `step.codeLine`
4. `step.line`
5. `step.pseudoLine`

传 `{ explicitOnly: true }` 可只取前两级。

> 旧文档教的 `steps.push({ cppLine: 6, pythonLine: 6 })` 因第 1 级回退仍然有效，
> 但仓库内已无算法这样写，新代码请用 `.line()`。

若步骤没有任何显式行号，`src/components/learning/codeLineInference.js` 会依据步骤
描述文本做启发式推断（比较、交换、初始化等关键词匹配代码 token），因此未标注行号
的算法通常也能得到近似高亮。

## 排查

**代码行不高亮** —— 确认步骤是否带行号、行号是否 1-indexed 且对应实际行、
控制台有无报错。完全没有显式行号时走的是启发式推断，不保证精确。

**没有显示并排代码** —— 检查该可视化类型是否在 `src/pages/AlgorithmPage.jsx`
的 `VIZ_WITH_CODE` 集合中，以及算法是否有 `code` 字段；再确认窗口宽度是否达到
阈值（见 `docs/guides/SIDEBAR_GUIDE.md`）。

**代码改了行号就错了** —— 行号是硬编码的，修改 C++/Python 代码后需同步更新
`.line()` 的值。目前没有自动校验工具。

## 相关文件

- `src/components/learning/CodeBlock.jsx` — 渲染与高亮，`noAutoScroll` 参数
- `src/components/learning/InteractiveVisualization.jsx` — 并排布局与语言切换
- `src/components/learning/codeLineInference.js` — 启发式行号推断
- `src/utils/stepProtocol.js` — `getStepCodeLine()` 解析
- `docs/examples/EXAMPLE_CODE_LINES.js` — 参考示例（使用 legacy 写法）
