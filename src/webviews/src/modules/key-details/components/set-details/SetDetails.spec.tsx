import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'testSrc/helpers'
import { Props, SetDetails } from './SetDetails'

const mockedProps = mock<Props>()

describe('SetDetails', () => {
  it('should render', () => {
    expect(render(<SetDetails {...instance(mockedProps)} />)).toBeTruthy()
  })
  it('should render add members btn', () => {
    const { getByTestId } = render(<SetDetails {...instance(mockedProps)} />)

    expect(getByTestId('add-key-value-items-btn')).toBeInTheDocument()
  })
})
