// StepController 边界验收：total=1 / 单步钳制
import { describe, test, expect } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'
import StepController, { useStepController } from './StepController'

function Harness({ steps }) {
  const ctrl = useStepController(steps)
  return (
    <StepController
      total={steps.length}
      ctrl={ctrl}
      description={steps[ctrl.step]?.description}
    />
  )
}

describe('StepController 边界', () => {
  test('total=1 时 tick 不出现 NaN 定位', () => {
    const { container, getByText } = render(
      <Harness steps={[{ description: '唯一一步' }]} />
    )
    expect(getByText('唯一一步')).toBeTruthy()
    const broken = [...container.querySelectorAll('div')]
      .filter(el => /NaN/.test(el.style.left || ''))
    expect(broken).toEqual([])
  })

  test('最后一步继续点「下一步」不越界', async () => {
    const steps = [{ description: 's1' }, { description: 's2' }]
    const { getByText, getByRole } = render(<Harness steps={steps} />)
    const next = getByRole('button', { name: '下一步' })
    await act(async () => { fireEvent.click(next) })
    expect(getByText('s2')).toBeTruthy()
    await act(async () => { fireEvent.click(next) })   // 已在末尾
    expect(getByText('s2')).toBeTruthy()
    expect(getByText('2')).toBeTruthy()
  })

  test('第一步点「上一步」不越界', async () => {
    const steps = [{ description: 's1' }, { description: 's2' }]
    const { getByText, getByRole } = render(<Harness steps={steps} />)
    await act(async () => { fireEvent.click(getByRole('button', { name: '上一步' })) })
    expect(getByText('s1')).toBeTruthy()
  })
})
