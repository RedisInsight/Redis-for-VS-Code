import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'testSrc/helpers'
import { AddKeyList, Props } from './AddKeyList'

const mockedProps = mock<Props>()
const elementFindingRegex = /^element-\d+$/

describe('AddKeyList', () => {
  it('should render', () => {
    expect(render(<AddKeyList {...instance(mockedProps)} />)).toBeTruthy()
  })
  it('should set value properly', () => {
    render(<AddKeyList {...instance(mockedProps)} />)
    const valueInput = screen.getByTestId(elementFindingRegex)
    const value = 'list list list list list list '
    fireEvent.change(valueInput, { target: { value } })
    expect(valueInput).toHaveValue(value)
  })

  it('should render disabled add key button with empty keyName', () => {
    render(<AddKeyList {...instance(mockedProps)} />)
    const button = screen.getByTestId('btn-add') as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('should not be disabled add key with proper values', () => {
    render(<AddKeyList {...instance(mockedProps)} keyName="name" />)
    const button = screen.getByTestId('btn-add') as HTMLButtonElement
    expect(button.disabled).toBe(false)
  })

  it('should render add button', () => {
    render(<AddKeyList {...instance(mockedProps)} />)
    expect(screen.getByTestId('add-new-item')).toBeTruthy()
  })

  it('should render one more element input after click add item', () => {
    render(<AddKeyList {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('add-new-item'))

    expect(screen.getAllByTestId(elementFindingRegex)).toHaveLength(2)
  })

  it('should clear the element after click clear button', () => {
    render(<AddKeyList {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId('element-0')
    fireEvent.input(
      fieldName,
      { target: { value: 'name' } },
    )
    fireEvent.click(screen.getByLabelText(/clear item/i))

    expect(fieldName).toHaveValue('')
  })
})
