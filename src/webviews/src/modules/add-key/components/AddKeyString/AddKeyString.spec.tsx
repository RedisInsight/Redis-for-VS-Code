import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'testSrc/helpers'
import AddKeyString, { Props } from './AddKeyString'

const mockedProps = mock<Props>()

vi.mock('../AddKeyFooter/AddKeyFooter', () => ({
  __esModule: true,
  namedExport: vi.fn(),
  default: vi.fn(),
}))

describe('AddKeyString', () => {
  it('should render', () => {
    expect(render(<AddKeyString {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set value properly', () => {
    render(<AddKeyString {...instance(mockedProps)} />)
    const valueInput = screen.getByTestId('string-value')
    const value = 'string stringstringstringstringstring stringstring string'
    fireEvent.change(
      valueInput,
      { target: { value } },
    )
    expect(valueInput).toHaveValue(value)
  })

  it('should render disabled add key button with empty keyName', () => {
    const { container } = render(<AddKeyString {...instance(mockedProps)} />)
    expect(container.querySelector('.btn-add')).toBeDisabled()
  })

  it('should not be disabled add key with proper values', () => {
    const { container } = render(<AddKeyString {...instance(mockedProps)} keyName="name" />)
    expect(container.querySelector('.btn-add')).not.toBeDisabled()
  })
})
