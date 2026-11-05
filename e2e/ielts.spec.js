// 雅思主线 E2E（无 key，全走模拟反馈）：
// 1) 阅读复盘从录入到讲解、入错题库；2) 听力错题带反思；3) 写作路径锁定/解锁。
import { test, expect } from '@playwright/test'

test('阅读复盘：录入 → 自动拆题 → 判题 → 模拟讲解 → 进错题库', async ({ page }) => {
  await page.goto('/ielts/reading')
  await page.getByRole('button', { name: '载入原创示例' }).click()
  await page.getByRole('button', { name: '自动拆题' }).click()

  await expect(page.getByLabel('第 2 题题型')).toHaveValue('tfng')

  await page.getByRole('button', { name: '开始确定性判题' }).click()
  await expect(page.getByText(/答对 1 \/ 4/)).toBeVisible()

  // 对填空错题（第 4 题）生成讲解；无 key → 醒目标注的模拟反馈
  await page.getByRole('button', { name: '生成讲解' }).nth(2).click()
  await expect(page.getByText('模拟反馈 · 非真实讲解').first()).toBeVisible()
  await expect(page.getByText('定位句（逐字来自原文）')).toBeVisible()

  await page.getByRole('button', { name: '生成本篇小结' }).click()
  await page.getByRole('button', { name: '把错题存入错题库' }).click()
  await expect(page.getByText('已存入错题库')).toBeVisible()

  await page.goto('/ielts/mistakes')
  await expect(page.getByText(/共 3 道错题/)).toBeVisible()
})

test('听力复盘：错题带“我的反思”进入错题库', async ({ page }) => {
  await page.goto('/ielts/listening')
  await page.getByRole('button', { name: '载入原创示例' }).click()
  await page.getByRole('button', { name: '自动拆题' }).click()
  await page.getByRole('button', { name: '开始确定性判题' }).click()

  const reflection = page.getByPlaceholder(/听成了 fifteen/).first()
  await reflection.fill('我听成了 fifteen，他改口说 sixteen 没反应过来')

  await page.getByRole('button', { name: '生成讲解' }).first().click()
  await expect(page.getByText('模拟反馈 · 非真实讲解').first()).toBeVisible()

  await page.getByRole('button', { name: '把错题存入错题库' }).click()
  await expect(page.getByText('已存入错题库')).toBeVisible()

  await page.goto('/ielts/mistakes')
  await expect(page.getByText('我听成了 fifteen')).toBeVisible()
})

test('写作训练：路径锁定，提交一步后解锁下一步', async ({ page }) => {
  await page.goto('/ielts/writing')

  await expect(page.getByRole('button', { name: /20 分钟小作文限时/ })).toBeDisabled()
  await expect(page.getByRole('button', { name: /60 分钟全套限时/ })).toBeDisabled()

  await page.getByPlaceholder('把你的写作贴在这里…').fill('The chart gives information about bus and train use in the city.')
  await page.getByRole('button', { name: '提交并获取反馈' }).click()
  await expect(page.getByText('模拟反馈 · 非真实模型反馈').first()).toBeVisible()

  await expect(page.getByRole('button', { name: /Task 1 overview/ })).toBeEnabled()
  await expect(page.getByRole('button', { name: /60 分钟全套限时/ })).toBeDisabled()
})

test('入口页与 /growth 入口在 375px 窄宽度可用', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/ielts')
  await expect(page.getByRole('link', { name: '阅读复盘', exact: true })).toBeVisible()
  await page.goto('/growth')
  await expect(page.getByRole('link', { name: /雅思复盘系统/ })).toBeVisible()
})
