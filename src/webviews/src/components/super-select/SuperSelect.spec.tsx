import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render, constants, fireEvent, waitFor } from 'testSrc/helpers'
import { SuperSelect, Props } from './SuperSelect'

const mockedProps = mock<Props>()
const testIdMock = 'my-select-component'

describe('SuperSelect', () => {
  it('should render', async () => {
    expect(render(
      <SuperSelect {...instance(mockedProps)} options={constants.SUPER_SELECT_OPTIONS} />),
    ).toBeTruthy()
  })

  it('should call onChange when the first option is selected', async () => {
    const mockedOnChange = vi.fn()
    const mockedLabel = constants.SUPER_SELECT_OPTIONS?.[0].label ?? ''
    const mockedValue = constants.SUPER_SELECT_OPTIONS?.[0].value ?? ''

    const { getByText, queryByTestId } = render(<SuperSelect
      options={constants.SUPER_SELECT_OPTIONS}
      onChange={mockedOnChange}
      testid={testIdMock}
    />)

    const mySelectComponent = queryByTestId('my-select-component')

    expect(mySelectComponent).toBeDefined()
    expect(mySelectComponent).not.toBeNull()
    expect(mockedOnChange).toHaveBeenCalledTimes(0)

    fireEvent.keyDown(mySelectComponent?.firstChild!, { key: 'ArrowDown' })
    await waitFor(() => getByText(mockedLabel))
    fireEvent.click(getByText(mockedLabel))

    expect(mockedOnChange).toHaveBeenCalledTimes(1)
    expect(mockedOnChange).toHaveBeenCalledWith(
      { label: mockedLabel, value: mockedValue },
      { action: 'select-option', name: undefined, option: undefined })
  })
})
