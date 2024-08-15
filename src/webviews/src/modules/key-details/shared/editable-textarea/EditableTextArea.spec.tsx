import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen, waitForStack } from 'testSrc/helpers'

import { EditableTextArea, Props } from './EditableTextArea'

const mockedProps = mock<Props>()
const Text = () => (<span data-testid="text">text</span>)

describe('EditableTextArea', () => {
  it('should render', () => {
    expect(render(
      <EditableTextArea
        {...mockedProps}
      >
        <Text />
      </EditableTextArea>,
    )).toBeTruthy()
  })

  it('should display editor', () => {
    render(
      <EditableTextArea
        {...mockedProps}
        editing
        field="field"
        testIdPrefix="item"
        onDecline={vi.fn()}
      >
        <Text />
      </EditableTextArea>,
    )

    expect(screen.getByTestId('item_value-editor-field')).toBeInTheDocument()
  })

  it('should call on apply', async () => {
    const onApply = vi.fn()
    render(
      <EditableTextArea
        {...mockedProps}
        editing
        field="field"
        testIdPrefix="item"
        onEdit={vi.fn()}
        onDecline={vi.fn()}
        onApply={onApply}
      >
        <Text />
      </EditableTextArea>,
    )

    fireEvent.input(screen.getByTestId('item_value-editor-field'), { target: { value: 'value' } })
    fireEvent.click(screen.getByTestId('apply-btn'))

    await waitForStack()

    expect(onApply).toBeCalledWith('value')
  })

  it('should call on decline', async () => {
    const onDecline = vi.fn()
    render(
      <EditableTextArea
        {...mockedProps}
        editing
        field="field"
        testIdPrefix="item"
        onEdit={vi.fn()}
        onDecline={onDecline}
      >
        <Text />
      </EditableTextArea>,
    )

    fireEvent.input(screen.getByTestId('item_value-editor-field'), { target: { value: 'value' } })
    fireEvent.click(screen.getByTestId('cancel-btn'))

    await waitForStack()

    expect(onDecline).toBeCalled()
  })
})
