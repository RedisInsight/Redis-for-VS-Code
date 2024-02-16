import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'testSrc/helpers'
import { Props, ZSetDetails } from './ZSetDetails'

const mockedProps = mock<Props>()

describe('ZSetDetails', () => {
  it('should render', () => {
    expect(render(<ZSetDetails {...instance(mockedProps)} />)).toBeTruthy()
  })
  it('should render add members btn', () => {
    const { getByTestId } = render(<ZSetDetails {...instance(mockedProps)} />)

    expect(getByTestId('add-key-value-items-btn')).toBeInTheDocument()
  })
})
