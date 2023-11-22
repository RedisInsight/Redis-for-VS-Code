import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { KeyTypes } from 'uiSrc/constants'
import { render, screen, fireEvent, mockedStore, cleanup, act } from 'testSrc/helpers'
import { KeyDetailsHeaderProps, KeyDetailsHeader } from './KeyDetailsHeader'

const mockedProps = mock<KeyDetailsHeaderProps>()

const KEY_INPUT_TEST_ID = 'edit-key-input'
const KEY_BTN_TEST_ID = 'edit-key-btn'
const TTL_INPUT_TEST_ID = 'inline-item-editor'
const DELETE_KEY_BTN_TEST_ID = 'delete-key-btn'
const DELETE_KEY_CONFIRM_BTN_TEST_ID = 'delete-key-confirm-btn'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

// vi.mock('uiSrc/slices/browser/string', () => ({
//   ...(await vi.importActual('uiSrc/slices/browser/string'),
//   stringDataSelector: vi.fn().mockReturnValue({
//     value: {
//       type: 'Buffer',
//       data: [49, 50, 51, 52],
//     },
//   }),
// }))

// vi.mock('uiSrc/slices/browser/keys', () => ({
//   ...(await vi.importActual('uiSrc/slices/browser/keys'),
//   selectedKeyDataSelector: vi.fn().mockReturnValue({
//     name: {
//       type: 'Buffer',
//       data: [116, 101, 115, 116],
//     },
//     nameString: 'test',
//     length: 4,
//   }),
// }))

describe('KeyDetailsHeader', () => {
  global.navigator.clipboard = {
    writeText: vi.fn(),
  }

  it('should render', () => {
    expect(render(<KeyDetailsHeader {...mockedProps} />)).toBeTruthy()
  })

  it.todo('should change key properly', () => {
    render(<KeyDetailsHeader {...mockedProps} />)

    fireEvent.click(screen.getByTestId(KEY_BTN_TEST_ID))

    fireEvent.change(
      screen.getByTestId(KEY_INPUT_TEST_ID),
      { target: { value: 'key' } },
    )
    expect(screen.getByTestId(KEY_INPUT_TEST_ID)).toHaveValue('key')
  })

  it.todo('should be able to copy key', () => {
    render(<KeyDetailsHeader {...mockedProps} />)

    fireEvent.mouseOver(
      screen.getByTestId(KEY_BTN_TEST_ID),
    )

    fireEvent.mouseEnter(
      screen.getByTestId(KEY_BTN_TEST_ID),
    )

    expect(screen.getByLabelText(/Copy key name/i)).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText(/Copy key name/i))
  })

  it('should change ttl properly', async () => {
    render(<KeyDetailsHeader {...mockedProps} />)

    // fireEvent.click(screen.getByTestId('edit-ttl-btn'))

    await act(() => {
      fireEvent.input(
        screen.getByTestId(TTL_INPUT_TEST_ID),
        { target: { value: '100' } },
      )
    })

    expect(screen.getByTestId(TTL_INPUT_TEST_ID)).toHaveValue('100')
  })

  describe.todo('should call onRefresh', () => {
    test.each(Object.values(KeyTypes))('should call onRefresh for keyType: %s', (keyType) => {
      const component = render(<KeyDetailsHeader {...mockedProps} keyType={keyType} />)
      fireEvent.click(screen.getByTestId('refresh-key-btn'))
      expect(component).toBeTruthy()
    })
  })

  describe.todo('should call onDelete', () => {
    test.each(Object.values(KeyTypes))('should call onDelete for keyType: %s', (keyType) => {
      const onRemoveKeyMock = vi.fn()
      const component = render(<KeyDetailsHeader {...mockedProps} keyType={keyType} onRemoveKey={onRemoveKeyMock} />)
      fireEvent.click(screen.getByTestId(DELETE_KEY_BTN_TEST_ID))
      fireEvent.click(screen.getByTestId(DELETE_KEY_CONFIRM_BTN_TEST_ID))
      expect(component).toBeTruthy()

      // const expectedActions = [deleteSelectedKey()]
      // expect(store.getActions()).toEqual(expect.arrayContaining(expectedActions))
    })
  })
})
