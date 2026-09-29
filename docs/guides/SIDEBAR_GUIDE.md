# 可隐藏侧栏

顶栏的折叠按钮可隐藏左侧导航栏，为动画和代码腾出空间。合并自原
`SIDEBAR_QUICK_START.md`（用户向）与 `SIDEBAR_COLLAPSIBLE_FEATURE.md`（开发向）。

## 使用

折叠按钮位于顶栏最左侧，**仅桌面版显示**。点击隐藏/展开，300ms 平滑过渡，
悬停显示「隐藏侧栏」/「展开侧栏」提示。

手机屏幕（< 768px）不显示折叠按钮，沿用原有的抽屉模式（菜单按钮展开）。

侧栏状态在页面间导航时保持，但**刷新后重置为展开** —— 当前未做持久化。

## 布局阈值

并排/竖排的切换取决于窗口宽度，阈值随侧栏状态变化：

| 侧栏状态 | 窗口宽度 | 动画/代码 |
|---------|---------|----------|
| 展开 | ≥ 1100px | 并排 |
| 展开 | < 1100px | 竖排 |
| 折叠 | ≥ 900px | 并排 |
| 折叠 | < 900px | 竖排 |

> 注意：`docs/archive/` 下的旧文档写的是 1400/1100 与 1348/1648，均已过时，以本表为准。

## 实现

状态由 `src/layout/AppLayout.jsx` 持有，经 Outlet context 下发：

```jsx
const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

<div style={{ transition: 'all 0.3s ease', width: sidebarCollapsed ? 0 : 248, overflow: 'hidden' }}>
  <Sidebar />
</div>

<Outlet context={{ sidebarCollapsed }} />
```

`src/layout/TopBar.jsx` 接收 `sidebarCollapsed` 与 `onToggleSidebarCollapse`
两个 prop，后者为空时不渲染按钮（移动端即靠此隐藏）。

`src/components/learning/InteractiveVisualization.jsx` 消费该状态调整阈值：

```jsx
const outletContext = useOutletContext() || {}
const sidebarCollapsed = outletContext.sidebarCollapsed || false

useEffect(() => {
  const checkWidth = () => {
    const threshold = sidebarCollapsed ? 900 : 1100
    setIsNarrow(window.innerWidth < threshold)
  }
  checkWidth()
  window.addEventListener('resize', checkWidth)
  return () => window.removeEventListener('resize', checkWidth)
}, [sidebarCollapsed])
```

`src/pages/AlgorithmPage.jsx` 将非首页的 `maxWidth` 设为 `none` 并改用左右
padding，使内容区能吃满侧栏让出的空间。

## 常见问题

**侧栏没有立即消失？** 300ms 过渡动画，是设计行为。

**手机上找不到折叠按钮？** 正常，手机用抽屉模式。

**折叠了但还是竖排？** 窗口宽度不足 900px。

**刷新后侧栏又展开了？** 当前未持久化。如需记忆偏好，可在 `AppLayout.jsx` 中改为：

```jsx
const [sidebarCollapsed, setSidebarCollapsed] = useState(
  () => localStorage.getItem('sidebarCollapsed') === 'true'
)
useEffect(() => {
  localStorage.setItem('sidebarCollapsed', sidebarCollapsed)
}, [sidebarCollapsed])
```

## 待办

- 状态持久化（localStorage）
- 快捷键切换（如 Ctrl+\）
- 可配置过渡时长与侧栏宽度
