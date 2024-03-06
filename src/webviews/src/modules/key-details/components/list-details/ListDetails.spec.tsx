import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'testSrc/helpers'
import { Props, ListDetails } from './ListDetails'

const mockedProps = mock<Props>()

describe('ListDetails', () => {
  it('should render', () => {
    expect(render(<ListDetails {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render add elements btn', () => {
    const { getByTestId } = render(<ListDetails {...instance(mockedProps)} />)

    expect(getByTestId('add-key-value-items-btn')).toBeInTheDocument()
  })

  it('should render remove elements btn', () => {
    const { getByTestId } = render(<ListDetails {...instance(mockedProps)} />)

    expect(getByTestId('remove-key-value-items-btn')).toBeInTheDocument()
  })
})
