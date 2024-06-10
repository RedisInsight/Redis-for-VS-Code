import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'testSrc/helpers'
import { AddKeyHash, Props } from './AddKeyHash'

const mockedProps = mock<Props>()

describe('AddKeyHash', () => {
  it('should render', () => {
    expect(render(<AddKeyHash {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set field name properly', () => {
    render(<AddKeyHash {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId('hash-field-0')
    fireEvent.input(
      fieldName,
      { target: { value: 'field name' } },
    )
    expect(fieldName).toHaveValue('field name')
  })

  it('should set field value properly', () => {
    render(<AddKeyHash {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId('hash-value-0')
    fireEvent.input(
      fieldName,
      { target: { value: '123' } },
    )
    expect(fieldName).toHaveValue('123')
  })

  it('should render add button', () => {
    render(<AddKeyHash {...instance(mockedProps)} />)
    expect(screen.getByTestId('add-new-item')).toBeTruthy()
  })

  it('should render one more field name & value inputs after click add item', () => {
    render(<AddKeyHash {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('add-new-item'))

    expect(screen.getAllByTestId(/^hash-field-/)).toHaveLength(2)
    expect(screen.getAllByTestId(/^hash-value-/)).toHaveLength(2)
  })

  it('should clear fieldName & fieldValue after click clear button', () => {
    render(<AddKeyHash {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId('hash-field-0')
    const fieldValue = screen.getByTestId('hash-value-0')
    fireEvent.input(
      fieldName,
      { target: { value: 'name' } },
    )
    fireEvent.input(
      fieldValue,
      { target: { value: 'val' } },
    )
    fireEvent.click(screen.getByLabelText(/clear item/i))

    expect(fieldName).toHaveValue('')
    expect(fieldValue).toHaveValue('')
  })
})
