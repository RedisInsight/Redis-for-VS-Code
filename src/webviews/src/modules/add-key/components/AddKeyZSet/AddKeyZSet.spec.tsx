import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'testSrc/helpers'
import { AddKeyZSet, Props } from './AddKeyZSet'

const MEMBER_SCORE = 'member-score'
const MEMBER_NAME = 'member-name'

const mockedProps = mock<Props>()

describe('AddKeyZSet', () => {
  it('should render', () => {
    expect(render(<AddKeyZSet {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set member name properly', () => {
    render(<AddKeyZSet {...instance(mockedProps)} />)
    const memberInput = screen.getByTestId(MEMBER_NAME)
    fireEvent.input(
      memberInput,
      { target: { value: 'member name' } },
    )
    expect(memberInput).toHaveValue('member name')
  })

  it('should set member score properly', () => {
    render(<AddKeyZSet {...instance(mockedProps)} />)
    const memberInput = screen.getByTestId(MEMBER_NAME)
    fireEvent.input(
      memberInput,
      { target: { value: '123' } },
    )
    expect(memberInput).toHaveValue('123')
  })

  it('should render add button', () => {
    render(<AddKeyZSet {...instance(mockedProps)} />)
    expect(screen.getByTestId('add-new-item')).toBeTruthy()
  })

  it('should render one more member name & score inputs after click add item', () => {
    render(<AddKeyZSet {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('add-new-item'))

    expect(screen.getAllByTestId(/^member-name/)).toHaveLength(2)
    expect(screen.getAllByTestId(/^member-score/)).toHaveLength(2)
  })

  it('should clear memberName & memberValue after click clear button', () => {
    render(<AddKeyZSet {...instance(mockedProps)} />)
    const memberInput = screen.getByTestId(MEMBER_SCORE)
    const scoreInput = screen.getByTestId(MEMBER_NAME)
    fireEvent.input(
      memberInput,
      { target: { value: 'name' } },
    )
    fireEvent.input(
      scoreInput,
      { target: { value: 'val' } },
    )
    fireEvent.click(screen.getByLabelText(/clear item/i))

    expect(memberInput).toHaveValue('')
    expect(scoreInput).toHaveValue('')
  })
})
