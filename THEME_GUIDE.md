# CS Hub Theme Guide

本项目的 UI 风格可以概括为：深浅双主题的液态玻璃拟态、低饱和背景、紫粉品牌高光、信息密度适中的工具型界面。整体气质偏科技、学习平台、交互仪表盘，而不是营销页。

## 1. 核心风格

- **视觉关键词**：liquid glass、半透明层叠、柔和发光、浮动光晕、渐变品牌色、圆角工具面板。
- **主色倾向**：默认深色，背景接近黑紫；浅色主题为淡薰衣草灰。
- **品牌强调**：紫色到粉色渐变，少量加入蓝色、橙色、青绿色做学科区分。
- **组件密度**：按钮、标签、工具栏偏紧凑；Hero 和头图区域可以使用超大字号。
- **交互感觉**：轻微上浮、淡入、滑动、玻璃背景模糊，避免强烈弹跳和大面积硬阴影。

## 2. 颜色系统

### 深色主题

```css
:root,
[data-theme="dark"] {
  --bg: #06060e;
  --bg-elev: #0a0a16;

  --surface: rgba(255, 255, 255, 0.055);
  --surface-2: rgba(255, 255, 255, 0.09);
  --surface-3: rgba(255, 255, 255, 0.13);

  --border: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.18);

  --text-primary: #eeeeff;
  --text-secondary: #a0a4bc;
  --text-tertiary: #55596e;

  --accent: #9b6dff;
  --accent-light: #c4a3ff;
  --accent-dim: #7040e0;
  --accent-soft: rgba(155, 109, 255, 0.13);
  --accent-border: rgba(155, 109, 255, 0.4);
}
```

### 浅色主题

```css
[data-theme="light"] {
  --bg: #ededf8;
  --bg-elev: #f4f4fc;

  --surface: rgba(255, 255, 255, 0.62);
  --surface-2: rgba(255, 255, 255, 0.80);
  --surface-3: rgba(255, 255, 255, 0.95);

  --border: rgba(160, 155, 210, 0.28);
  --border-strong: rgba(140, 130, 200, 0.42);

  --text-primary: #0c0c1e;
  --text-secondary: #46466a;
  --text-tertiary: #9898b8;

  --accent: #7c3aed;
  --accent-light: #6d28d9;
  --accent-dim: #5b21b6;
  --accent-soft: rgba(124, 58, 237, 0.09);
  --accent-border: rgba(124, 58, 237, 0.3);
}
```

### 语义色

```css
--green: #34d399;  /* 成功、已完成 */
--blue: #60a5fa;   /* 信息、图算法、工具页 */
--yellow: #fbbf24; /* 中等难度、收藏 */
--red: #f87171;    /* 危险、暂停、高难度 */
--pink: #f472b6;   /* 进度渐变、品牌辅助色 */
```

复刻时不要只用紫色。紫色是品牌主轴，但页面需要蓝、粉、青绿、黄色作状态和分类色，才会接近本项目的层次。

## 3. 字体

项目使用 Google Fonts：

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..900;1,14..32,300..900&family=JetBrains+Mono:wght@400;500;600&family=Nunito:wght@400;600;700;800;900&display=swap");

:root {
  --font-sans: "Inter", system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace;
}
```

规则：

- 正文、导航、按钮使用 `Inter`，中文 fallback 为 `PingFang SC` / `Microsoft YaHei`。
- 代码、复杂度、步骤编号、快捷键、算法英文名使用 `JetBrains Mono`。
- 音乐相关页面额外使用 `Nunito`，更圆润、更轻松，不作为主站默认字体。
- 全局正文 `14px / 1.6`，小型工具文本常用 `11px`、`12.5px`、`13px`。
- 标题使用 700-900 字重，页面主标题可到 850/900。
- 全局 `letter-spacing: -0.01em`，标题 `-0.02em` 到 `-0.03em`，不要过度压字距。

## 4. 布局

### 应用骨架

- 根布局为纵向 flex：顶部固定悬浮导航 + 下方主内容。
- 主内容在算法页使用左侧 Sidebar，宽度约 `248px`。
- 页面背景保持透明，让全局光晕背景透出。
- 普通算法页：`padding: 0 48px 40px`，移动端收缩到 `18px` 左右。
- 首页使用 fullpage snap：每屏 `100vh`，通过 `translate3d` 做翻页。
- Guide / Learning 页面常使用满高滚动容器，内部最大宽度约 `1180px`。

### 背景系统

全局背景由 3 个固定定位的模糊光球组成：

```css
.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
}
```

深色主题光球更亮：紫、蓝、粉；浅色主题降低透明度，避免脏灰。光球使用 18-28 秒的缓慢漂移动画。

## 5. 玻璃拟态

这是本项目最重要的复刻点。

```css
:root {
  --glass-blur: blur(28px) saturate(200%);
}

[data-theme="dark"] {
  --glass-bg: rgba(255, 255, 255, 0.055);
  --glass-bg-mid: rgba(255, 255, 255, 0.085);
  --glass-bg-strong: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.11);
  --glass-border-strong: rgba(255, 255, 255, 0.22);
  --glass-shine: inset 0 1px 0 rgba(255, 255, 255, 0.13);
}

[data-theme="light"] {
  --glass-bg: rgba(255, 255, 255, 0.55);
  --glass-bg-mid: rgba(255, 255, 255, 0.72);
  --glass-bg-strong: rgba(255, 255, 255, 0.88);
  --glass-border: rgba(255, 255, 255, 0.85);
  --glass-border-strong: rgba(255, 255, 255, 1);
  --glass-shine: inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow), var(--glass-shine);
  border-radius: var(--r-lg);
}
```

复刻要点：

- 玻璃不是纯透明，需要 `background + backdrop-filter + border + inset shine` 同时存在。
- 深色主题要用非常低的白色透明度。
- 浅色主题要提高白色底和边框，否则玻璃层次不明显。
- 卡片内部再叠加小卡片时要克制，避免“卡片套卡片”的厚重感。

## 6. 圆角、阴影、间距

### 圆角

```css
--r-sm: 8px;
--r-md: 12px;
--r-lg: 16px;
--r-xl: 22px;
```

使用规则：

- 小按钮、输入框、列表项：`8px`
- 工具栏、普通按钮组：`12px`
- 面板、代码块、正文卡片：`16px`
- Hero 卡片、算法头部大面板：`22px` 到 `28px`
- 胶囊导航、头像、搜索框：`999px`

### 阴影

```css
--glass-shadow: 0 4px 32px rgba(0, 0, 0, 0.55),
                0 1px 0 rgba(255, 255, 255, 0.07) inset;
--glass-shadow-lg: 0 8px 56px rgba(0, 0, 0, 0.75),
                   0 1px 0 rgba(255, 255, 255, 0.1) inset;
--shadow-glow: 0 0 48px rgba(155, 109, 255, 0.22);
```

浅色主题的阴影改为淡紫灰：

```css
--shadow-lg: 0 12px 48px rgba(60, 50, 140, 0.15);
```

### 间距

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
```

常见用法：

- 按钮内部：`5px 13px`、`8px 12px`、`9px 14px`
- 工具栏：`8px 10px`，gap `6px`
- 普通卡片：`18px 20px` 或 `20px`
- 大型头部面板：`30px 32px`
- 页面 section 间距：`34px` 到 `36px`

## 7. 按钮

按钮分三类。

### 图标按钮

用于播放控制、主题切换、菜单、关闭等。

```css
.icon-btn {
  width: 33px;
  height: 33px;
  border-radius: var(--r-sm);
  background: var(--glass-bg-mid);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  box-shadow: var(--glass-shine);
  transition: all 0.15s;
}

.icon-btn:hover {
  color: var(--text-primary);
  border-color: var(--accent-border);
  background: var(--glass-bg-strong);
}
```

### 主按钮

用于播放、提交、主要 CTA。常见两种：

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 6px 18px rgba(168, 85, 247, 0.35);
}
```

或使用透明强调态：

```css
background: color-mix(in srgb, var(--accent) 18%, transparent);
border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
color: var(--accent);
box-shadow: var(--glass-shine), 0 0 16px var(--accent-soft);
```

### Ghost / Toolbar 按钮

用于筛选、预设切换、次级操作。

- 默认：`var(--glass-bg-mid)`、`var(--text-secondary)`
- 激活：`var(--accent-soft)`、`var(--accent-border)`、`var(--accent-light)`
- hover：背景升到 `var(--glass-bg-strong)`，文字升到 `var(--text-primary)`

## 8. 卡片和面板

### 普通内容卡片

```css
.glass-card {
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  background: var(--surface-2);
  padding: 20px;
  backdrop-filter: blur(28px) saturate(200%);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.10),
    inset 0 1px 1px rgba(255, 255, 255, 0.16);
}
```

### 算法头部大卡片

特点：

- 圆角大：`28px`
- padding 大：`30px 32px`
- 背景：`linear-gradient(135deg, var(--glass-bg-mid), var(--glass-bg))`
- 模糊强：`blur(42px) saturate(210%)`
- 内部有分类色径向光斑和超大半透明英文标记，如 `SORT`、`GRAPH`、`DP`

### 标签

```css
.tag {
  padding: 4px 10px;
  border-radius: 20px;
  background: var(--glass-bg-mid);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shine);
  font-size: 11px;
  font-weight: 750;
}
```

标签用于难度、稳定性、分类、状态，不要做成大按钮。

## 9. 导航栏

导航栏是项目的标志性组件：固定在顶部的 Dynamic Island。

关键参数：

- `position: fixed`
- `top: 12px`
- `height: 60px`
- `width: min(1240px, calc(100% - 32px))`
- `border-radius: 999px`
- `backdrop-filter: blur(40px) saturate(200%) brightness(1.04)`
- 内部水平 flex，gap `12px`

导航项：

- 图标 + 中文标签
- padding `8px 12px`
- 字号 `13.5px`
- 激活项文字更重，底部有 42px 宽的渐变指示条
- 指示条动画：`transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)`

搜索框：

- 胶囊形：`border-radius: 999px`
- 宽度约 `280px`
- 背景使用玻璃 token
- 内含搜索图标、placeholder、快捷键 kbd

Sidebar：

- 宽度 `248px`
- 背景 `var(--glass-bg)`
- `blur(24px) saturate(180%)`
- 右侧 inset 边线
- 列表项激活态：`accent-soft` 背景 + 左侧 `2px` 强调边

## 10. 动画效果

### 基础动画

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes paletteIn {
  from { opacity: 0; transform: translateY(-10px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes pop {
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
}
```

### 背景光球

- 18-28 秒循环。
- 只做 `translate`，不要快速缩放。
- 模糊半径大，移动幅度控制在 40-80px。

### Hero 动画

首页 Hero 使用：

- 字符逐个淡入上浮：`0.75s cubic-bezier(0.22, 1, 0.36, 1)`
- 主标题上浮 + 轻微持续漂浮
- 粒子点和算法 token 缓慢漂移
- 滚动箭头 `1.8s` 上下呼吸

### Hover 动效

常见规则：

- 卡片 hover：`translateY(-2px)`
- GitHub 按钮 hover：`translateY(-1px)` + 阴影加深
- 工具按钮 hover：背景加深、边框变品牌色
- 不使用大幅旋转、复杂弹性和强烈缩放。

### 减少动画

项目尊重 `prefers-reduced-motion: reduce`：关闭装饰性动画，保留必要的状态切换。

```css
@media (prefers-reduced-motion: reduce) {
  .bg-orb,
  .hero-char-pop,
  .hero-cshub-pop,
  .hero-subtitle-fade {
    animation: none !important;
  }
}
```

## 11. 如何在其他项目中复刻

1. 引入字体：`Inter` + `JetBrains Mono`，中文 fallback 使用系统字体。
2. 复制深浅两套 CSS variables，优先保留 `--bg`、`--surface-*`、`--text-*`、`--accent-*`、`--glass-*`、`--r-*`。
3. 在 app 根节点加全局 `.bg-orbs`，用 2-3 个模糊径向渐变光球做环境光。
4. 所有主要容器使用 `glass-panel` 模式：半透明背景、backdrop blur、细边框、inset shine。
5. 顶部导航做成悬浮胶囊，而不是普通矩形 navbar。
6. 页面主卡片控制在 `16px-28px` 圆角；列表项和按钮控制在 `8px-12px` 圆角。
7. 用 `accent-soft` 表示选中态，用 `accent-border` 表示 focus/hover 边框。
8. 标题和装饰可用紫粉渐变：`linear-gradient(90deg, #a855f7, #ec4899, #f59e0b)`。
9. 小型数据、快捷键、算法复杂度、步骤说明使用 monospace。
10. 动画只保留轻量效果：淡入、轻微上浮、指示条滑动、背景缓慢漂移。

## 12. 最小可迁移 CSS

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300..900&family=JetBrains+Mono:wght@400;500;600&display=swap");

:root {
  --bg: #06060e;
  --bg-elev: #0a0a16;
  --text-primary: #eeeeff;
  --text-secondary: #a0a4bc;
  --text-tertiary: #55596e;
  --accent: #9b6dff;
  --accent-light: #c4a3ff;
  --accent-soft: rgba(155, 109, 255, 0.13);
  --accent-border: rgba(155, 109, 255, 0.4);
  --glass-bg: rgba(255, 255, 255, 0.055);
  --glass-bg-mid: rgba(255, 255, 255, 0.085);
  --glass-bg-strong: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.11);
  --glass-shine: inset 0 1px 0 rgba(255, 255, 255, 0.13);
  --glass-blur: blur(28px) saturate(200%);
  --r-sm: 8px;
  --r-md: 12px;
  --r-lg: 16px;
  --r-xl: 22px;
  --font-sans: "Inter", system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  --font-mono: "JetBrains Mono", Consolas, monospace;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text-primary);
  font: 14px / 1.6 var(--font-sans);
  letter-spacing: -0.01em;
  -webkit-font-smoothing: antialiased;
}

.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.55), var(--glass-shine);
  border-radius: var(--r-lg);
}

.primary-gradient {
  background: linear-gradient(90deg, #a855f7, #ec4899, #f59e0b);
}

.toolbar-button {
  padding: 5px 13px;
  border-radius: var(--r-sm);
  background: var(--glass-bg-mid);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  font-size: 12.5px;
  font-weight: 600;
  transition: all 0.15s ease;
}

.toolbar-button:hover,
.toolbar-button.active {
  background: var(--accent-soft);
  border-color: var(--accent-border);
  color: var(--accent-light);
}
```

## 13. 风格检查清单

- 背景是否有深浅主题对应的环境光，而不是纯色背景。
- 卡片是否同时具备半透明背景、模糊、细边框和内高光。
- 主要强调色是否保持紫粉，但状态色是否足够多元。
- 按钮是否紧凑，hover 是否只做轻微上浮或颜色变化。
- 导航是否是悬浮胶囊，并带滑动激活指示。
- 文本层级是否清楚：主标题亮、正文次亮、辅助信息低亮。
- 代码、复杂度和快捷键是否使用 monospace。
- 动画是否慢、轻、可关闭。
