import React from 'react'
import { instance, mock } from 'ts-mockito'

import { fireEvent, render, waitFor } from 'testSrc/helpers'
import { RadioGroup, Props, RadioGroupOption } from './RadioGroup'

const mockedProps = mock<Props>()

describe('RadioGroup', () => {
  it('should render', async () => {
    expect(render(<RadioGroup {...instance(mockedProps)} options={[]} />)).toBeTruthy()
  })
  it('should render options', async () => {
    const onChangeMock = vi.fn()
    const options: RadioGroupOption[] = [{
      id: 'value',
      labelText: 'label',
      testid: 'testid',
    }, {
      id: 'value2',
      labelText: 'label2',
      testid: 'testid2',
    }]
    const { queryByTestId } = render(
      <RadioGroup {...instance(mockedProps)} options={options} onChange={onChangeMock} testid="testid_radio" />,
    )

    await waitFor(() => {
      fireEvent.click(queryByTestId('testid2')!)
    })
    expect(onChangeMock).toBeCalledWith('value2')
    expect(queryByTestId('testid2')).toBeInTheDocument()
  })
})
