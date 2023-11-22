import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'testSrc/helpers'
import { Props, StringDetails } from './StringDetails'
import { useStringStore, initialState as initialStateInit } from './hooks/useStringStore'

const mockedProps = mock<Props>()
const EDIT_VALUE_BTN_TEST_ID = 'edit-key-value-btn'

beforeEach(() => {
  useStringStore.setState((initialStateInit))
})

describe('StringDetails', () => {
  it('should render', () => {
    expect(render(<StringDetails {...instance(mockedProps)} />)).toBeTruthy()
  })

  it.todo('should be able to change value (long string fully load)', () => {
    render(
      <StringDetails
        {...mockedProps}
      />,
    )

    const editValueBtn = screen.getByTestId(`${EDIT_VALUE_BTN_TEST_ID}`)
    expect(editValueBtn).toHaveProperty('disabled', false)
  })

  it.todo('should not be able to change value (long string not fully load)', () => {
    const initialState = {
      value: {
        type: 'Buffer',
        data: [49, 50, 51],
      },
    }

    useStringStore.setState((state) => ({ ...state, ...initialState }))
    // stringDataSelector.mockImplementation(stringDataSelectorMock)

    render(
      <StringDetails
        {...mockedProps}
      />,
    )

    const editValueBtn = screen.getByTestId(`${EDIT_VALUE_BTN_TEST_ID}`)
    expect(editValueBtn).toHaveProperty('disabled', true)
  })

  it.todo('"edit-key-value-btn" should render', () => {
    const { queryByTestId } = render(<StringDetails {...instance(mockedProps)} />)
    expect(queryByTestId('edit-key-value-btn')).toBeInTheDocument()
  })
})
