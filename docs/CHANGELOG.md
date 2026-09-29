# 功能变更记录

本文件合并了原先分散在 `docs/reports/` 下的 7 份一次性交付总结。原文件保留在
`docs/archive/`，仅作历史快照，**不要当作当前真相阅读** —— 其中的阈值数字和
代码行号写法均已过时（详见每条目下的「与当前实现的差异」）。

当前行为以源码为准；使用方法见 `docs/guides/CODE_HIGHLIGHTING_GUIDE.md` 与
`docs/guides/SIDEBAR_GUIDE.md`。

---

## 可隐藏侧栏

左侧导航栏可折叠，主内容区随之扩展，动画/代码的并排阈值动态调整。

**改动文件**

| 文件 | 内容 |
|-----|------|
| `src/layout/AppLayout.jsx` | 新增 `sidebarCollapsed` 状态，侧栏容器 300ms 宽度过渡，经 Outlet context 下发 |
| `src/layout/TopBar.jsx` | 新增折叠按钮（仅桌面版），图标随状态切换，含 title/aria-label |
| `src/components/learning/InteractiveVisualization.jsx` | 经 `useOutletContext` 读取侧栏状态，动态调整并排阈值 |
| `src/pages/AlgorithmPage.jsx` | 非首页 `maxWidth` 改为 `none`，改用左右 padding |

**关键实现**

```jsx
// AppLayout：状态与过渡
const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
<div style={{ transition: 'all 0.3s ease', width: sidebarCollapsed ? 0 : 248, overflow: 'hidden' }}>
  <Sidebar />
</div>
<Outlet context={{ sidebarCollapsed }} />
```

**与当前实现的差异 ⚠️**

归档文档中的并排阈值（1400 / 1100、以及 1348 / 1648）**全部已过时**。
`src/components/learning/InteractiveVisualization.jsx` 当前实际使用：

```js
const threshold = sidebarCollapsed ? 900 : 1100
setIsNarrow(window.innerWidth < threshold)
```

即：侧栏展开时 <1100px 竖排，折叠时 <900px 竖排。归档里的 1348/1648 是把窗口
宽度与内容区宽度混算得出的，从来就不对。

**未落实的「后续建议」**：状态持久化（localStorage）、快捷键 Ctrl+\ —— 归档文档
标注为「推荐」，目前均未实现，刷新页面侧栏仍回到展开态。

---

## 动画与代码并排显示 + 代码行同步高亮

起因是伪代码逐行高亮时调用 `scrollIntoView()` 抢占焦点，导致动画被遮挡。

**第一阶段：伪代码焦点修复**

| 文件 | 内容 |
|-----|------|
| `src/components/learning/CodeBlock.jsx` | 新增 `noAutoScroll` 参数，为 true 时跳过 `scrollIntoView()` |
| `src/pages/AlgorithmPage.jsx` | `PseudocodeBlock` 不再订阅 stepData，改为静态显示 |

`noAutoScroll` 参数至今仍在 `CodeBlock.jsx` 中有效。

**第二阶段：并排布局与代码同步**

| 文件 | 内容 |
|-----|------|
| `src/components/learning/InteractiveVisualization.jsx` | 新建：Grid 并排布局、语言切换、代码块 sticky、响应式竖排、手动布局切换按钮 |
| `src/pages/AlgorithmPage.jsx` | 集成新布局，新增 `VIZ_WITH_CODE` 集合控制哪些可视化类型显示并排代码 |
| `src/algorithms/sorting/bubbleSort.js` | 补充代码行号映射 |
| `src/algorithms/sorting/insertionSort.js` | 补充代码行号映射 |
| `src/algorithms/sorting/selectionSort.js` | 补充代码行号映射 |

图/树类可视化不启用并排代码（需要更大绘制空间）。

**与当前实现的差异 ⚠️**

归档文档反复教的写法 —— 在步骤对象里手写 `cppLine` / `pythonLine` —— **已被取代**。
`bubbleSort.js` 中现在 `cppLine` 出现次数为 0，改用 builder API：

```js
.line({ cpp: 11, py: 9, pseudo: 9 })
```

行号解析统一走 `src/utils/stepProtocol.js` 的 `getStepCodeLine()`，其回退链为
`cppLine/pythonLine/javaLine` → `codeLines[lang]` → `codeLine` → `line` → `pseudoLine`。
因此旧的 `cppLine` 写法仍能工作（属兼容回退），但不是现在的推荐方式。

此外新增了 `src/components/learning/codeLineInference.js`，可在无显式行号时
按步骤描述文本启发式推断代码行 —— 归档文档成文时该文件尚不存在。

**未落实的「后续建议」**：为 heapSort / countingSort / shellSort 补充行号映射、
自动化行号校验工具、Java/Go 等更多语言。

---

## 归档索引

| 归档文件 | 原用途 |
|---------|-------|
| `docs/archive/CHANGES_SUMMARY.md` | 第一阶段修改总结 |
| `docs/archive/COMPLETION_SUMMARY.md` | 第一阶段完成报告 |
| `docs/archive/SIDE_BY_SIDE_IMPLEMENTATION.md` | 第二阶段详细说明 |
| `docs/archive/FINAL_IMPLEMENTATION_SUMMARY.md` | 第二阶段最终总结 |
| `docs/archive/DELIVERY_CHECKLIST.md` | 两阶段合并交付清单 |
| `docs/archive/CODE_CHANGES_LOG.md` | 侧栏功能逐行 diff 记录 |
| `docs/archive/SIDEBAR_COMPLETION_SUMMARY.md` | 侧栏功能交付总结 |
