# 快速参考 - 动画焦点问题修复

## 🎯 问题已修复 ✅

**之前**：伪代码在动画执行时自动高亮并滚动，导致焦点被转移，遮挡动画

**现在**：伪代码保持静态，动画获得完整关注，同时 C++/Python 代码可支持同步高亮

---

## 📌 用户看到的变化

### 动画播放

```
┌─────────────────────────────────────────┐
│  【伪代码 - 保持静态】      │ 【动画 - 完整可见】  │
│  - procedure bubbleSort    │ ░▒▓█ 排序中...       │
│  - n ← length(A)           │ [5][3][8][1]        │
│  - repeat:                 │                     │
│  - swapped ← false         │  ↓ 自动高亮         │
│  - for i from 0 to n-2     │  【C++代码】         │
│  - if A[i]>A[i+1]          │  void bubbleSort(){  │
│  - swap                    │    for(int i...  ◄──┤ 
│  - until not swapped       │    if(arr[j]...      │
└─────────────────────────────────────────┘
```

### 效果对比

| 功能 | 修改前 | 修改后 |
|-----|-------|-------|
| 伪代码闪烁 | 🔴 是 | 🟢 否 |
| 焦点转移 | 🔴 是 | 🟢 否 |
| 动画清晰度 | 🔴 低 | 🟢 高 |
| 代码同步 | 🟡 仅伪代码 | 🟢 支持 C++/Python |

---

## 🔧 技术实现

### 核心改动

1. **CodeBlock 组件**
   - 新增 `noAutoScroll` 参数
   - 当 `noAutoScroll={true}` 时，不自动滚动代码

2. **PseudocodeBlock 组件**  
   - 不再读取 `stepData`
   - 不再高亮伪代码行
   - 设置 `noAutoScroll={true}`

3. **CodeTabs 组件**
   - 新增对 `cppLine` 和 `pythonLine` 的支持
   - 当步骤数据包含这些字段时自动高亮对应代码行

---

## 📚 如何在你的算法中使用

### 步骤 1：查看代码行号

确定 C++ 和 Python 代码的行号映射（1-indexed）

### 步骤 2：更新步骤对象

在每个步骤对象中添加 `cppLine` 和 `pythonLine`：

```javascript
steps.push({
  // ... 其他字段
  pseudoLine: 6,    // 伪代码行（用于参考）
  cppLine: 6,       // ← 添加这个
  pythonLine: 6,    // ← 和这个
  description: '...',
})
```

### 步骤 3：测试

- 打开算法页面
- 切换到 C++ 或 Python 标签  
- 点击播放，查看代码是否正确高亮

---

## ✅ 验证你的修改

### 检查清单

- [ ] 算法步骤中有 `cppLine` 字段
- [ ] 算法步骤中有 `pythonLine` 字段
- [ ] 行号数值正确（1-indexed，对应代码块中的实际行）
- [ ] 动画播放时代码正确高亮
- [ ] 代码不会过度滚动（只在必要时滚动）
- [ ] 没有焦点被抢占

---

## ❓ 常见问题

**Q: 没有添加 cppLine/pythonLine 会怎样？**

A: 不会出错。C++ 和 Python 代码仍可查看，只是不会自动高亮。

**Q: 为什么伪代码不高亮了？**

A: 这是新的设计。伪代码现在保持静态，让用户专注于动画，这样学习效果更好。

**Q: 如何禁用 C++ 代码的自动滚动？**

A: 当前实现中 C++ 代码会自动滚动。如有需要，可以在 `CodeTabs` 中添加 `noAutoScroll={true}`。

**Q: 代码行号改变了怎么办？**

A: 需要更新步骤对象中对应的 `cppLine` 或 `pythonLine` 值。

---

## 📂 相关文件

- **CODE_HIGHLIGHTING_GUIDE.md** - 详细实现指南
- **../examples/EXAMPLE_CODE_LINES.js** - 完整示例代码
- **CHANGES_SUMMARY.md** - 修改总结

---

**最后更新**: 2024年5月12日
