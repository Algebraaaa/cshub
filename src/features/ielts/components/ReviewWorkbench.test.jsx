// 无 key 主流程：载入原创示例 → 拆题 → 确定性判题 → 模拟讲解 → 存错题库。
import { describe, test, expect, beforeEach } from 'vitest'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import ReviewWorkbench from './ReviewWorkbench.jsx'
import { listIeltsMistakes } from '../../../services/storage/mistakeStore.js'

beforeEach(() => localStorage.clear())

describe('ReviewWorkbench 无 key 流程', () => {
  test('阅读：示例录入 → 判题（含 TFNG 标签用错）→ 模拟讲解 → 存入错题库', async () => {
    render(<ReviewWorkbench module="reading" />)

    fireEvent.click(screen.getByRole('button', { name: '载入原创示例' }))
    fireEvent.click(screen.getByRole('button', { name: '自动拆题' }))

    expect(screen.getByLabelText('第 2 题题型').value).toBe('tfng')

    fireEvent.click(screen.getByRole('button', { name: '开始确定性判题' }))

    // 示例 4 题：第 1 题对，其余错
    expect(screen.getByText(/答对 1 \/ 4/)).toBeTruthy()
    expect(screen.queryByText('本篇没有错题。')).toBeNull()
    expect(screen.getAllByText('答案不一致').length).toBeGreaterThan(0)

    // 错题默认展开；对填空错题（#4，定位词在原文中）生成模拟讲解
    const explainButtons = screen.getAllByRole('button', { name: '生成讲解' })
    fireEvent.click(explainButtons[2])

    await waitFor(() => {
      expect(screen.getAllByText('模拟反馈 · 非真实讲解').length).toBeGreaterThan(0)
    })
    expect(screen.getByText('定位句（逐字来自原文）')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '把错题存入错题库' }))
    await waitFor(() => expect(screen.getByText('已存入错题库')).toBeTruthy())
    const mistakes = listIeltsMistakes()
    expect(mistakes.length).toBe(3)
    expect(mistakes.some((m) => m.questionType === 'tfng')).toBe(true)
  }, 15000)

  test('听力：反思文本可以保存到错题记录', async () => {
    render(<ReviewWorkbench module="listening" />)
    fireEvent.click(screen.getByRole('button', { name: '载入原创示例' }))
    fireEvent.click(screen.getByRole('button', { name: '自动拆题' }))
    fireEvent.click(screen.getByRole('button', { name: '开始确定性判题' }))

    const reflection = screen.getAllByPlaceholderText(/听成了 fifteen/)[0]
    fireEvent.change(reflection, { target: { value: '我听成了 fifteen，没注意他改口' } })
    fireEvent.click(screen.getByRole('button', { name: '把错题存入错题库' }))

    await waitFor(() => expect(screen.getByText('已存入错题库')).toBeTruthy())
    const withReflection = listIeltsMistakes().filter((m) => m.reflection)
    expect(withReflection.length).toBeGreaterThan(0)
    expect(withReflection[0].module).toBe('listening')
  }, 15000)
})
