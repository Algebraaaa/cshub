import { test, expect } from '@playwright/test'

// 关键用户流程 E2E（自检维度 4）。模拟真人从头点到尾、跨页、跨刷新——
// 这是单测/jsdom 冒烟覆盖不到的一层（真实浏览器、真实路由、真实持久化）。

test('首页加载且渲染出学科入口', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/CS Hub/)
  // 首页应有若干可点击链接（学科/导航）
  await expect(page.locator('a').first()).toBeVisible()
})

test('算法页可单步：点"下一步"后步骤描述变化', async ({ page }) => {
  await page.goto('/algo/bubblesort')
  const next = page.getByRole('button', { name: '下一步' }).first()
  await expect(next).toBeVisible()

  // STEP 徽标后面那段描述
  const stepBadge = page.locator('span', { hasText: /^STEP$/ }).first()
  const desc = stepBadge.locator('xpath=following-sibling::span[1]')
  const before = (await desc.textContent())?.trim()

  await next.click()
  await next.click()
  await expect(desc).not.toHaveText(before || '')
})

test('主题切换：点按钮后 data-theme 翻转', async ({ page }) => {
  await page.goto('/algo/bubblesort')
  const themeBtn = page.locator('button[title="切换深色"], button[title="切换浅色"]').first()
  await expect(themeBtn).toBeVisible()

  const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
  // 顶栏按钮是 fixed 定位 + 动画，Playwright 会判定"在视口外"；这里测的是翻转
  // 行为而非物理可点性，直接触发 DOM click 更稳。
  await themeBtn.evaluate((el) => el.click())
  await expect
    .poll(() => page.evaluate(() => document.documentElement.getAttribute('data-theme')))
    .not.toBe(before)
})

test('收藏持久化：收藏后刷新仍是已收藏 + 写进 localStorage', async ({ page }) => {
  await page.goto('/algo/bubblesort')

  const favBtn = page.getByRole('button', { name: /收藏/ }).first()
  await expect(favBtn).toBeVisible()

  // 若已是"已收藏"（历史状态），先取消，回到干净起点
  if ((await favBtn.textContent())?.includes('已收藏')) {
    await favBtn.click()
    await expect(favBtn).toHaveText(/^收藏|收藏$/)
  }

  await favBtn.click()
  await expect(favBtn).toContainText('已收藏')

  // 落库
  const fav = await page.evaluate(() => localStorage.getItem('algoviz-favorites'))
  expect(fav).toContain('bubblesort')

  // 刷新后仍保持
  await page.reload()
  const favAfter = page.getByRole('button', { name: /收藏/ }).first()
  await expect(favAfter).toContainText('已收藏')
})
