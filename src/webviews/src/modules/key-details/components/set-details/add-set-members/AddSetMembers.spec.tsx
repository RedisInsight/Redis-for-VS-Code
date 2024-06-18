import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'testSrc/helpers'
import { AddSetMembers, Props } from './AddSetMembers'

const ADD_NEW_ITEM = 'add-new-item'
const CANCEL_BTN = 'cancel-members-btn'

const mockedProps = mock<Props>()

describe('AddSetMembers', () => {
  it('should render', () => {
    expect(render(<AddSetMembers {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set member value properly', () => {
    render(<AddSetMembers {...instance(mockedProps)} />)
    const memberInput = screen.getByTestId('member-name-0')
    fireEvent.change(
      memberInput,
      { target: { value: 'member name' } },
    )
    expect(memberInput).toHaveValue('member name')
  })

  it('should render add button', () => {
    render(<AddSetMembers {...instance(mockedProps)} />)
    expect(screen.getByTestId(ADD_NEW_ITEM)).toBeTruthy()
  })

  it('should render one more member input after click add item', () => {
    render(<AddSetMembers {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId(ADD_NEW_ITEM))

    expect(screen.getAllByTestId(/^member-name-/)).toHaveLength(2)
  })

  it('should remove one member input after add item & remove one', () => {
    render(<AddSetMembers {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId(ADD_NEW_ITEM))

    expect(screen.getAllByTestId(/^member-name-/)).toHaveLength(2)

    const removeButtons = screen.getAllByTestId('remove-item')
    fireEvent.click(removeButtons[1])

    expect(screen.getAllByTestId(/^member-name-/)).toHaveLength(1)
  })

  it('should clear member after click clear button', () => {
    render(<AddSetMembers {...instance(mockedProps)} />)
    const memberInput = screen.getByTestId('member-name-0')
    fireEvent.change(
      memberInput,
      { target: { value: 'member' } },
    )
    fireEvent.click(screen.getByLabelText(/clear item/i))

    expect(memberInput).toHaveValue('')
  })

  it('should not render cancel button for hideCancel prop', () => {
    const { queryByTestId } = render(<AddSetMembers {...instance(mockedProps)} hideCancel />)

    expect(queryByTestId(CANCEL_BTN)).not.toBeInTheDocument()
  })
})
