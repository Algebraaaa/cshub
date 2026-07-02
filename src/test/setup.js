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
