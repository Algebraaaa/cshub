import { describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import PlaygroundShell from './PlaygroundShell'
import { StepProvider } from '../../contexts/StepContext'

describe('PlaygroundShell step calculation', () => {
  test('reuses steps while navigating and recalculates after the input changes', () => {
    const derivePayload = vi.fn(state => ({ value: state.value }))
    const computeSteps = vi.fn(({ value }) => [
      { description: `start ${value}` },
      { description: `end ${value}` },
    ])

    render(
      <StepProvider>
        <PlaygroundShell
          initialState={{ value: 1 }}
          derivePayload={derivePayload}
          computeSteps={computeSteps}
          renderViz={({ current }) => <span>{current.description}</span>}
          extraToolbar={({ setState }) => (
            <button onClick={() => setState({ value: 2 })}>改变输入</button>
          )}
        />
      </StepProvider>
    )

    expect(computeSteps).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: '下一步' }))
    expect(screen.getAllByText('end 1').length).toBeGreaterThan(0)
    expect(derivePayload).toHaveBeenCalledTimes(1)
    expect(computeSteps).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: '改变输入' }))
    expect(computeSteps).toHaveBeenCalledTimes(2)
    expect(screen.getAllByText('end 2').length).toBeGreaterThan(0)
  })
})
