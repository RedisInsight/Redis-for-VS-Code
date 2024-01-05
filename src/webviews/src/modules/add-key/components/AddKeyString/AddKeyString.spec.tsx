import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'testSrc/helpers'
import AddKeyString, { Props } from './AddKeyString'

const mockedProps = mock<Props>()

vi.mock('../AddKeyFooter/AddKeyFooter', () => ({
  default: vi.fn(),
}))

describe('AddKeyString', () => {
  it('should render', () => {
    expect(render(<AddKeyString {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render text input', async () => {
    render(<AddKeyString {...instance(mockedProps)} />)
    const valueInput = screen.getByTestId('string-value')
    expect(valueInput).toBeInTheDocument()
  })

  it('should render disabled add key button with empty keyName', () => {
    render(<AddKeyString {...instance(mockedProps)} />)
    const button = screen.getByTestId('btn-add') as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })
})
