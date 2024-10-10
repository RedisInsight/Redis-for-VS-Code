import React from 'react'
import { instance, mock } from 'ts-mockito'
import { HEAD_DESTINATION, TAIL_DESTINATION } from 'uiSrc/constants'
import { fireEvent, render, screen } from 'testSrc/helpers'
import { AddListElements, Props } from './AddListElements'

const mockedProps = mock<Props>()
const elementFindingRegex = /^element-\d+$/

describe('AddListElements', () => {
  it('should render', () => {
    expect(render(<AddListElements {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set elements input properly', () => {
    render(<AddListElements {...instance(mockedProps)} />)
    const elementsInput = screen.getByTestId(elementFindingRegex)
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

  it('should render add button', () => {
    render(<AddListElements {...instance(mockedProps)} />)
    expect(screen.getByTestId('add-new-item')).toBeTruthy()
  })

  it('should render one more element input after click add item', () => {
    render(<AddListElements {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('add-new-item'))

    expect(screen.getAllByTestId(elementFindingRegex)).toHaveLength(2)
  })

  it('should clear the element after click clear button', () => {
    render(<AddListElements {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId('element-0')
    fireEvent.input(
      fieldName,
      { target: { value: 'name' } },
    )
    fireEvent.click(screen.getByLabelText(/clear item/i))

    expect(fieldName).toHaveValue('')
  })
})
