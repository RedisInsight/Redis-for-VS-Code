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

  it('should call setKeyName onChange KeyName', () => {
    const setKeyName = vi.fn()
    render(
      <AddKeyCommonFields
        {...instance(mockedProps)}
        setKeyName={setKeyName}
        options={options}
      />,
    )
    const keyInput = screen.getByTestId('key-input')

    fireEvent.input(
      keyInput,
      { target: { value: 123 } },
    )
    expect(setKeyName).toBeCalledTimes(1)
  })

  it('should call setKeyTTL onChange TTL', () => {
    const setKeyTTL = vi.fn()
    render(
      <AddKeyCommonFields
        {...instance(mockedProps)}
        setKeyTTL={setKeyTTL}
        options={options}
      />,
    )
    const ttlInput = screen.getByTestId('ttl-input')

    fireEvent.input(
      ttlInput as HTMLInputElement,
      { target: { value: 123 } },
    )
    expect(setKeyTTL).toBeCalledTimes(1)
  })

  it('should properly return TTL value with wrong data', () => {
    let ttlValue: number = 0
    const setKeyTTL = (value: number) => {
      ttlValue = value
    }
    render(
      <AddKeyCommonFields
        {...instance(mockedProps)}
        // @ts-ignore
        setKeyTTL={setKeyTTL}
        options={options}
      />,
    )
    const ttlInput = screen.getByTestId('ttl-input')

    fireEvent.input(
      ttlInput as HTMLInputElement,
      { target: { value: 'q123' } },
    )
    expect(ttlValue).toBe(123)
  })
})
