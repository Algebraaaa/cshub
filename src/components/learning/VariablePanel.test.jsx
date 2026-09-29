import { expect, test } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { StepProvider, useStepPublish } from '../../contexts/StepContext'
import VariablePanel from './VariablePanel'

const steps = [{
  i: 0,
  ids: Array.from({ length: 14 }, (_, index) => index),
  phase: 'inspect',
  reason: 'a long explanation that should stay on one card line',
}]

function PanelWithSteps() {
  useStepPublish(0, steps)
  return <VariablePanel />
}

test('long variables stay compact and can be expanded without losing their value', () => {
  render(<StepProvider><PanelWithSteps /></StepProvider>)

  const card = screen.getByRole('button', { name: '查看 ids 的更多内容' })
  expect(card.textContent).toContain('[0, 1, …] (14)')
  expect(card.querySelector('.truncate')).toBeTruthy()
  expect(screen.queryByRole('region', { name: 'ids 的变量详情' })).toBeNull()

  fireEvent.click(card)
  expect(card.getAttribute('aria-expanded')).toBe('true')
  expect(screen.getByRole('region', { name: 'ids 的变量详情' }).textContent).toContain('12, 13]')

  fireEvent.click(screen.getByRole('button', { name: '收起' }))
  expect(screen.queryByRole('region', { name: 'ids 的变量详情' })).toBeNull()

  const stringCard = screen.getByRole('button', { name: '查看 reason 的更多内容' })
  expect(stringCard.lastElementChild.classList.contains('truncate')).toBe(true)
  fireEvent.click(stringCard)
  expect(screen.getByRole('region', { name: 'reason 的变量详情' }).textContent).toContain('one card line')
})
