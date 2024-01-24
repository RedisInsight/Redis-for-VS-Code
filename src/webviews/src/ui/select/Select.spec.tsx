import React from 'react'
import { instance, mock } from 'ts-mockito'

import { fireEvent, render, waitFor } from 'testSrc/helpers'
import { Select, Props, SelectOption } from './Select'

const mockedProps = mock<Props>()

describe('Select', () => {
  it('should render', async () => {
    expect(render(<Select {...instance(mockedProps)} options={[]} />)).toBeTruthy()
  })
  it('should render options', async () => {
    const onChangeMock = vi.fn()
    const options: SelectOption[] = [{
      value: 'value',
      label: 'label',
      testid: 'testid',
    }]
    const { queryByTestId } = render(
      <Select {...instance(mockedProps)} options={options} onChange={onChangeMock} testid="testid_select" />,
    )

    await waitFor(() => {
      fireEvent.click(queryByTestId('testid_select')!)
      fireEvent.click(queryByTestId('testid')!)
    })
    expect(onChangeMock).toBeCalledWith('value')
    expect(queryByTestId('testid')).toBeInTheDocument()
  })
})
