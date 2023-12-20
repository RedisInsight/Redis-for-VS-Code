import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'testSrc/helpers'

import AddKeyCommonFields, { Props } from './AddKeyCommonFields'

const mockedProps = mock<Props>()
const options = ['one', 'two']

describe('AddKeyCommonFields', () => {
  it('should render', () => {
    expect(
      render(
        <AddKeyCommonFields
          {...instance(mockedProps)}
          options={options}
        />,
      ),
    ).toBeTruthy()
  })

  it('should render all input fields', () => {
    const setKeyName = vi.fn()
    render(
      <AddKeyCommonFields
        {...instance(mockedProps)}
        setKeyName={setKeyName}
        options={options}
      />,
    )
    const keyTypeSelector = screen.getByTestId('select-key-type')
    expect(keyTypeSelector).toBeInTheDocument()

    const ttlInput = screen.getByTestId('ttl-input')
    expect(ttlInput).toBeInTheDocument()

    const keyInput = screen.getByTestId('key-input')
    expect(keyInput).toBeInTheDocument()
  })
})
