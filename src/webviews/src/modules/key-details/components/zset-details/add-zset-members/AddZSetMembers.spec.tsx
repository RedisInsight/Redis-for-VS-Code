import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'testSrc/helpers'
import { AddZSetMembers, Props } from './AddZSetMembers'

const ADD_NEW_ITEM = 'add-new-item'

const mockedProps = mock<Props>()

describe('AddZSetMembers', () => {
  it('should render', () => {
    expect(render(<AddZSetMembers {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set member value properly', () => {
    render(<AddZSetMembers {...instance(mockedProps)} />)
    const memberInput = screen.getByTestId('member-name-0')
    fireEvent.change(
      memberInput,
      { target: { value: 'member name' } },
    )
    expect(memberInput).toHaveValue('member name')
  })

  it('should render add button', () => {
    render(<AddZSetMembers {...instance(mockedProps)} />)
    expect(screen.getByTestId(ADD_NEW_ITEM)).toBeTruthy()
  })

  it('should render one more member input after click add item', () => {
    render(<AddZSetMembers {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId(ADD_NEW_ITEM))

    expect(screen.getAllByTestId(/^member-name-/)).toHaveLength(2)
  })

  it('should remove one member input after add item & remove one', () => {
    render(<AddZSetMembers {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId(ADD_NEW_ITEM))

    expect(screen.getAllByTestId(/^member-name-/)).toHaveLength(2)

    const removeButtons = screen.getAllByTestId('remove-item')
    fireEvent.click(removeButtons[1])

    expect(screen.getAllByTestId(/^member-name-/)).toHaveLength(1)
  })

  it('should clear member and score after click clear button', () => {
    render(<AddZSetMembers {...instance(mockedProps)} />)
    const memberInput = screen.getByTestId('member-name-0')
    const scoreInput = screen.getByTestId('member-score-0')
    fireEvent.change(
      memberInput,
      { target: { value: 'member' } },
    )
    fireEvent.change(
      scoreInput,
      { target: { value: '1' } },
    )
    fireEvent.click(screen.getByLabelText(/clear item/i))

    expect(memberInput).toHaveValue('')
    expect(scoreInput).toHaveValue('')
  })

  it('should set by blur score value properly if input wrong value', () => {
    render(<AddZSetMembers {...instance(mockedProps)} />)
    const scoreInput = screen.getByTestId('member-score-0')
    fireEvent.change(
      scoreInput,
      { target: { value: '.1' } },
    )
    fireEvent.focusOut(
      scoreInput,
    )
    expect(scoreInput).toHaveValue('0.1')
  })

  it('add new item should be disabled if no score', () => {
    render(<AddZSetMembers {...instance(mockedProps)} />)
    const memberInput = screen.getByTestId('member-name-0')
    fireEvent.change(
      memberInput,
      { target: { value: 'member' } },
    )
    expect((screen.getByTestId(ADD_NEW_ITEM) as HTMLButtonElement).disabled).toEqual(true)
  })
})
