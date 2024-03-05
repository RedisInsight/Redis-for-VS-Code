import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { Mock } from 'vitest'
import { KeyTypes } from 'uiSrc/constants'
import { useSelectedKeyStore, initialCertsState as initialSelectedKeyState } from 'uiSrc/store'
import { bufferToString } from 'uiSrc/utils'
import { render, screen, fireEvent, mockedStore, cleanup, waitFor, constants } from 'testSrc/helpers'
import { KeyDetailsHeaderProps, KeyDetailsHeader } from './KeyDetailsHeader'
import * as useKeys from '../keys-tree/hooks/useKeys'

const mockedProps = mock<KeyDetailsHeaderProps>()

const KEY_INPUT_TEST_ID = 'edit-key-input'
const KEY_BTN_TEST_ID = 'edit-key-btn'
const TTL_INPUT_TEST_ID = 'inline-item-editor'
const KEY_COPY_TEST_ID = 'copy-name-button'
const REFRESH_TEST_ID = 'refresh-key-btn'
const supportedKeyTypes = [
  KeyTypes.Hash,
  KeyTypes.List,
  KeyTypes.ZSet,
  KeyTypes.String,
  KeyTypes.Set,
]

const deleteKeyActionMock = vi.fn();
(vi.spyOn(useKeys, 'useKeysApi') as Mock).mockImplementation(() => ({
  deleteKeyAction: deleteKeyActionMock,
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  useSelectedKeyStore.setState(initialSelectedKeyState)
})

describe('KeyDetailsHeader', () => {
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

  it('should be able to copy key', () => {
    render(<KeyDetailsHeader {...mockedProps} />)

    expect(screen.getByTestId(KEY_COPY_TEST_ID)).toBeInTheDocument()
  })

  it('should change ttl properly', async () => {
    render(<KeyDetailsHeader {...mockedProps} />)

    // fireEvent.click(screen.getByTestId('edit-ttl-btn'))

    await waitFor(() => {
      fireEvent.input(
        screen.getByTestId(TTL_INPUT_TEST_ID),
        { target: { value: '100' } },
      )
    })

    expect(screen.getByTestId(TTL_INPUT_TEST_ID)).toHaveValue('100')
  })

  describe('should call onRefresh', () => {
    test.each(supportedKeyTypes)('should call onRefresh for keyType: %s', (keyType) => {
      const component = render(<KeyDetailsHeader {...mockedProps} keyType={keyType} />)
      fireEvent.click(screen.getByTestId(REFRESH_TEST_ID))
      expect(component).toBeTruthy()
    })
  })

  describe('should call onDelete', async () => {
    test.each(supportedKeyTypes)('should call onDelete for keyType: %s', (keyType) => {
      const nameString = bufferToString(constants.KEY_INFO.name)

      useSelectedKeyStore.setState(() => ({ ...initialSelectedKeyState, data: { ...constants.KEY_INFO, type: keyType, nameString } }))

      const component = render(<KeyDetailsHeader {...mockedProps} keyType={keyType} />)
      expect(component).toBeTruthy()
      fireEvent.click(screen.getByTestId(`remove-key-${nameString}-icon`))
      fireEvent.click(screen.getByTestId(`remove-key-${nameString}`))
      expect(useKeys.useKeysApi().deleteKeyAction).toBeCalled()
    })
  })

  it('refresh btn should be disabled for refreshDisabled state', () => {
    useSelectedKeyStore.setState(() => ({ ...initialSelectedKeyState, refreshDisabled: true }))

    render(<KeyDetailsHeader {...mockedProps} />)

    expect(screen.getByTestId(REFRESH_TEST_ID)?.lastChild).toBeDisabled()
  })
})
