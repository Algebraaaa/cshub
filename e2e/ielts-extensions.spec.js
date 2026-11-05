// 扩展 2/3/4 的端到端：整套报告、间隔复习、模型日志（无 key）。
import { test, expect } from '@playwright/test'

test('一套阅读复盘后：今日复习出现错题，整套报告显示部分 1/3，可生成 Markdown', async ({ page }) => {
  await page.goto('/ielts/reading')
  await page.getByRole('button', { name: '载入原创示例' }).click()
  await page.getByRole('button', { name: '自动拆题' }).click()
  await page.getByRole('button', { name: '开始确定性判题' }).click()
  await page.getByRole('button', { name: '把错题存入错题库' }).click()
  await expect(page.getByText('已存入错题库')).toBeVisible()

  await page.goto('/ielts')
  await expect(page.getByText('今日复习', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: /错题 [1-9]/ })).toBeVisible()

  await page.goto('/ielts/mistakes')
  await expect(page.getByText('今日错题复习')).toBeVisible()
  await page.getByRole('button', { name: '正常' }).first().click()

  await page.goto('/ielts/sets')
  await expect(page.getByText(/部分 1\/3/)).toBeVisible()
  await expect(page.getByText('城市蜜蜂')).toBeVisible()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出 Markdown' }).first().click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/\.md$/)
})

test('收藏词块进入间隔复习，替换库展示到期自评', async ({ page }) => {
  await page.goto('/ielts/vocab')
  await page.getByRole('button', { name: '收藏', exact: true }).first().click()
  await page.getByRole('button', { name: '★ 收藏' }).click()
  await expect(page.getByText('今天到期').first()).toBeVisible()
  await expect(page.getByRole('button', { name: '简单' })).toBeVisible()
})
