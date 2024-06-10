import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'testSrc/helpers'
import { AddKeyList, Props } from './AddKeyList'

const mockedProps = mock<Props>()

describe('AddKeyList', () => {
  it('should render', () => {
    expect(render(<AddKeyList {...instance(mockedProps)} />)).toBeTruthy()
  })
  it('should set value properly', () => {
    render(<AddKeyList {...instance(mockedProps)} />)
    const valueInput = screen.getByTestId('element')
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
})
