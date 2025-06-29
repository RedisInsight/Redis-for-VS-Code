import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent } from '@testing-library/react'
import { render, screen } from 'testSrc/helpers'

import { AddItem, Props } from './AddItem'
import { JSONErrors } from '../../constants'

const mockedProps = mock<Props>()

describe('AddItem', () => {
  it('should render', () => {
    expect(render(<AddItem {...mockedProps} />)).toBeTruthy()
  })

  it('should show error with invalid key', () => {
    render(<AddItem {...mockedProps} isPair onCancel={vi.fn} />)

    fireEvent.change(screen.getByTestId('json-key'), { target: { value: '"' } })
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(screen.getByTestId('edit-json-error')).toHaveTextContent(
      JSONErrors.keyCorrectSyntax,
    )
  })

  it('should show error with invalid value', () => {
    render(<AddItem {...mockedProps} onCancel={vi.fn} />)

    expect(screen.queryByTestId('json-key')).not.toBeInTheDocument()

    fireEvent.change(screen.getByTestId('json-value'), {
      target: { value: '"' },
    })
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(screen.getByTestId('edit-json-error')).toHaveTextContent(
      JSONErrors.valueJSONFormat,
    )
  })

  it('should submit with proper key and value', () => {
    const onSubmit = vi.fn()
    render(
      <AddItem {...mockedProps} isPair onCancel={vi.fn} onSubmit={onSubmit} />,
    )

    fireEvent.change(screen.getByTestId('json-key'), {
      target: { value: '"key"' },
    })
    fireEvent.change(screen.getByTestId('json-value'), {
      target: { value: '1' },
    })
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(onSubmit).toBeCalledWith({ key: '"key"', value: '1' })
  })

  it('should call onCancel when clicking outside if shouldCloseOnOutsideClick is true', () => {
    const onCancel = vi.fn()

    render(
      <div>
        <AddItem
          {...mockedProps}
          isPair
          onCancel={onCancel}
          shouldCloseOnOutsideClick
        />
        <div data-testid="outside" />
      </div>,
    )

    fireEvent.mouseDown(screen.getByTestId('outside'))
    fireEvent.mouseUp(screen.getByTestId('outside'))
    fireEvent.click(screen.getByTestId('outside'))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should NOT call onCancel when clicking outside if shouldCloseOnOutsideClick is false', () => {
    const onCancel = vi.fn()

    render(
      <div>
        <AddItem
          {...mockedProps}
          isPair
          onCancel={onCancel}
          shouldCloseOnOutsideClick={false}
        />
        <div data-testid="outside" />
      </div>,
    )

    fireEvent.mouseDown(screen.getByTestId('outside'))
    fireEvent.mouseUp(screen.getByTestId('outside'))
    fireEvent.click(screen.getByTestId('outside'))

    expect(onCancel).not.toHaveBeenCalled()
  })
})
