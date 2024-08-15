import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen, waitForStack } from 'testSrc/helpers'

import { EditableInput, Props } from './EditableInput'

const mockedProps = mock<Props>()
const Text = () => (<span data-testid="text">text</span>)

describe('EditableInput', () => {
  it('should render', () => {
    expect(render(<EditableInput {...mockedProps}><Text /></EditableInput>)).toBeTruthy()
  })

  it('should display editor', () => {
    render(
      <EditableInput
        {...mockedProps}
        editing
        field="field"
        testIdPrefix="item"
        onDecline={vi.fn()}
      >
        <Text />
      </EditableInput>,
    )

    expect(screen.getByTestId('inline-item-editor')).toBeInTheDocument()
  })

  it('should call on apply', async () => {
    const onApply = vi.fn()
    render(
      <EditableInput
        {...mockedProps}
        editing
        field="field"
        testIdPrefix="item"
        onEdit={vi.fn()}
        onDecline={vi.fn()}
        onApply={onApply}
      >
        <Text />
      </EditableInput>,
    )

    fireEvent.input(screen.getByTestId('inline-item-editor'), { target: { value: 'value' } })
    fireEvent.click(screen.getByTestId('apply-btn'))

    await waitForStack()

    expect(onApply).toBeCalledWith('value')
  })

  it('should call on decline', async () => {
    const onDecline = vi.fn()
    render(
      <EditableInput
        {...mockedProps}
        editing
        field="field"
        testIdPrefix="item"
        onEdit={vi.fn()}
        onDecline={onDecline}
      >
        <Text />
      </EditableInput>,
    )

    fireEvent.input(screen.getByTestId('inline-item-editor'), { target: { value: 'value' } })
    fireEvent.click(screen.getByTestId('cancel-btn'))

    await waitForStack()

    expect(onDecline).toBeCalled()
  })
})
