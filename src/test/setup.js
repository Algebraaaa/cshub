// Vitest 共享 setup
// jsdom 未实现 window.matchMedia；useMediaQuery 系列 hook 需要一个
// 静态 stub（matches 恒为 false → 测试统一按桌面视口渲染）。
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}

// jsdom 缺失的浏览器 API polyfill —— 真实浏览器都有。
// 不补的话，任何"单步走"触及滚动/尺寸观察的组件会在测试里抛错，
// 使冒烟测试无法覆盖到真正的交互路径（radix 负数崩溃 bug 当初就
// 因为测试从没走到那一步而漏网）。
if (typeof Element !== 'undefined') {
  if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {}
  if (!Element.prototype.scrollTo) Element.prototype.scrollTo = () => {}
}
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
