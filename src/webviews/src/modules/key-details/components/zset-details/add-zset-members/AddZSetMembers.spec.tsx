import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'testSrc/helpers'
import { AddZSetMembers, Props } from './AddZSetMembers'

const MEMBER_NAME = 'member-name'
const ADD_NEW_ITEM = 'add-new-item'

const mockedProps = mock<Props>()

describe('AddZSetMembers', () => {
  it('should render', () => {
    expect(render(<AddZSetMembers {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set member value properly', () => {
    render(<AddZSetMembers {...instance(mockedProps)} />)
    const memberInput = screen.getByTestId(MEMBER_NAME)
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

    expect(screen.getAllByTestId(MEMBER_NAME)).toHaveLength(2)
  })

  it('should remove one member input after add item & remove one', () => {
    render(<AddZSetMembers {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId(ADD_NEW_ITEM))

    expect(screen.getAllByTestId(MEMBER_NAME)).toHaveLength(2)

    const removeButtons = screen.getAllByTestId('remove-item')
    fireEvent.click(removeButtons[1])

    expect(screen.getAllByTestId(MEMBER_NAME)).toHaveLength(1)
  })

  it('should clear member after click clear button', () => {
    render(<AddZSetMembers {...instance(mockedProps)} />)
    const memberInput = screen.getByTestId(MEMBER_NAME)
    fireEvent.change(
      memberInput,
      { target: { value: 'member' } },
    )
    fireEvent.click(screen.getByLabelText(/clear item/i))

    expect(memberInput).toHaveValue('')
  })
})
