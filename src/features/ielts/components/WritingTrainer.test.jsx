// 写作路径锁定/解锁：未完成前置步骤时表单不出现；提交反馈后解锁下一步。
import { describe, test, expect, beforeEach } from 'vitest'
import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import WritingTrainer from './WritingTrainer.jsx'

beforeEach(() => localStorage.clear())

describe('写作训练路径', () => {
  test('初始只有 t1/t2 开头与 translation 可进，mock 项锁定', () => {
    render(<WritingTrainer />)
    expect(screen.getByText(/20 分钟小作文限时/).closest('button').disabled).toBe(true)
    expect(screen.getByText(/60 分钟全套限时/).closest('button').disabled).toBe(true)
    // 默认选中 t1-intro：有提交框
    expect(screen.getByPlaceholderText('把你的写作贴在这里…')).toBeTruthy()
  })

  test('t1-intro 提交拿到（模拟）反馈后，t1-overview 解锁', async () => {
    render(<WritingTrainer />)
    fireEvent.change(screen.getByPlaceholderText('把你的写作贴在这里…'), {
      target: { value: 'The chart gives information about three modes of transport.' },
    })
    fireEvent.click(screen.getByRole('button', { name: '提交并获取反馈' }))
    await waitFor(() => expect(screen.getAllByText(/模拟反馈/).length).toBeGreaterThan(0))

    const overviewBtn = screen.getByText(/Task 1 overview/).closest('button')
    expect(overviewBtn.disabled).toBe(false)
    fireEvent.click(overviewBtn)
    expect(screen.getByText('至少提交一次并拿到反馈后解锁下一步')).toBeTruthy()
  }, 15000)
})
