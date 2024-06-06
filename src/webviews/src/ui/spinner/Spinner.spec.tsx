import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'testSrc/helpers'
import { Props, Spinner } from './Spinner'

const mockedProps = mock<Props>()
const barId = 'bar-spinner'
const beatId = 'beat-spinner'

describe('Spinner', () => {
  it('should render', () => {
    expect(render(<Spinner {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should render bar spinner', async () => {
    const { queryByTestId } = render(<Spinner type="bar" />)

    expect(queryByTestId(barId)).toBeInTheDocument()
  })

  it('should render beat spinner', async () => {
    const { queryByTestId } = render(<Spinner type="beat" />)

    expect(queryByTestId(beatId)).toBeInTheDocument()
  })
  it('should render bar spinner by default', async () => {
    const { queryByTestId } = render(<Spinner />)

    expect(queryByTestId(barId)).toBeInTheDocument()
  })
})
