import React from 'react'
import { instance, mock } from 'ts-mockito'
import { HEAD_DESTINATION, TAIL_DESTINATION } from 'uiSrc/constants'
import { fireEvent, render, screen } from 'testSrc/helpers'
import { AddListElements, Props } from './AddListElements'

const mockedProps = mock<Props>()

describe('AddListElements', () => {
  it('should render', () => {
    expect(render(<AddListElements {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set elements input properly', () => {
    render(<AddListElements {...instance(mockedProps)} />)
    const elementsInput = screen.getByTestId('elements-input')
    fireEvent.change(
      elementsInput,
      { target: { value: '123' } },
    )
    expect(elementsInput).toHaveValue('123')
  })

  it('should render destination properly', async () => {
    render(<AddListElements {...instance(mockedProps)} />)

    expect(screen.queryByTestId(HEAD_DESTINATION)).toBeInTheDocument()
    expect(screen.queryByTestId(TAIL_DESTINATION)).toBeInTheDocument()
  })
})
