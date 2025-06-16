import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'testSrc/helpers'
import { EditEntireItemAction, Props } from './EditEntireItemAction'
import { JSONErrors } from '../../constants'

const mockedProps = mock<Props>()
const valueOfEntireItem = '"Sample string"'

describe('EditEntireItemAction', () => {
  it('renders correctly with provided props', () => {
    render(
      <EditEntireItemAction
        {...instance(mockedProps)}
        initialValue={valueOfEntireItem}
      />,
    )

    expect(screen.getByTestId('json-value')).toBeInTheDocument()
    expect(screen.getByTestId('json-value')).toHaveValue(valueOfEntireItem)
  })

  it('triggers handleUpdateValueFormSubmit when the form is submitted', () => {
    const handleUpdateValueFormSubmit = vi.fn()

    render(
      <EditEntireItemAction
        {...instance(mockedProps)}
        initialValue={valueOfEntireItem}
        onSubmit={handleUpdateValueFormSubmit}
      />,
    )

    fireEvent.submit(screen.getByTestId('json-entire-form'))
    expect(handleUpdateValueFormSubmit).toHaveBeenCalled()
  })

  it('should show error and not submit', () => {
    const handleUpdateValueFormSubmit = vi.fn()

    render(
      <EditEntireItemAction
        {...instance(mockedProps)}
        initialValue="xxxx"
        onSubmit={handleUpdateValueFormSubmit}
      />,
    )

    fireEvent.submit(screen.getByTestId('json-entire-form'))
    expect(screen.getByTestId('edit-json-error')).toHaveTextContent(
      JSONErrors.valueJSONFormat,
    )
    expect(handleUpdateValueFormSubmit).not.toHaveBeenCalled()
  })

  it('should call onCancel when clicking outside and shouldCloseOnOutsideClick is true', () => {
    const handleCancel = vi.fn()

    render(
      <div data-testid="outside">
        <EditEntireItemAction
          {...instance(mockedProps)}
          initialValue={valueOfEntireItem}
          onCancel={handleCancel}
          shouldCloseOnOutsideClick
        />
      </div>,
    )

    // Simulate outside click
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(handleCancel).toHaveBeenCalled()
  })

  it('should NOT call onCancel when clicking outside and shouldCloseOnOutsideClick is false', () => {
    const handleCancel = vi.fn()

    render(
      <div data-testid="outside">
        <EditEntireItemAction
          {...instance(mockedProps)}
          initialValue={valueOfEntireItem}
          onCancel={handleCancel}
          shouldCloseOnOutsideClick={false}
        />
      </div>,
    )

    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(handleCancel).not.toHaveBeenCalled()
  })
})
