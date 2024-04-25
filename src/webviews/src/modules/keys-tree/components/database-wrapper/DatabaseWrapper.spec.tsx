import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { Mock } from 'vitest'

import { KeyTypes, SelectedKeyActionType } from 'uiSrc/constants'
import * as utils from 'uiSrc/utils'
import { apiService, vscodeApi } from 'uiSrc/services'
import * as useContext from 'uiSrc/store/hooks/use-context/useContext'
import * as useSelectedKeyStore from 'uiSrc/store/hooks/use-selected-key-store/useSelectedKeyStore'
import { DATABASE_ID_MOCK } from 'uiSrc/modules/cli/slice/tests/cli-settings.spec'
import { Database } from 'uiSrc/store'
import { cleanup, constants, fireEvent, mockedStore, render, waitForStack } from 'testSrc/helpers'
import { DatabaseWrapper, Props } from './DatabaseWrapper'
import * as useKeys from '../../hooks/useKeys'

const mockDatabase = constants.DATABASE
const mockedProps = {
  ...mock<Props>(<div />),
  database: mockDatabase,
}
let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()

  apiService.get = vi.fn().mockResolvedValue({ status: 200 })
})

vi.spyOn(utils, 'sendEventTelemetry')
vi.spyOn(vscodeApi, 'postMessage')

const fnMock = vi.fn()
const addKeyIntoTreeMock = vi.fn()
const deleteKeyFromTreeMock = vi.fn();
(vi.spyOn(useKeys, 'useKeysApi') as Mock).mockImplementation(() => ({
  fetchPatternKeysAction: fnMock,
  setDatabaseId: fnMock,
  addKeyIntoTree: addKeyIntoTreeMock,
  deleteKeyFromTree: deleteKeyFromTreeMock,
}))
const setKeysTreeSortMock = vi.fn()
const resetKeysTreeMock = vi.fn();
(vi.spyOn(useContext, 'useContextApi') as Mock).mockImplementation(() => ({
  setKeysTreeSort: setKeysTreeSortMock,
  resetKeysTree: resetKeysTreeMock,
}))

describe('DatabaseWrapper', () => {
  it('should render', () => {
    expect(render(<DatabaseWrapper {...mockedProps} />)).toBeTruthy()
  })

  it('should call fetchPatternKeysAction action after click on refresh icon', async () => {
    const { queryByTestId } = render(<DatabaseWrapper {...mockedProps} />)

    fireEvent.click(queryByTestId(`database-${mockDatabase.id}`)!)
    await waitForStack()

    fireEvent.click(queryByTestId('refresh-keys')!)
    await waitForStack()

    expect(useKeys.useKeysApi().fetchPatternKeysAction).toBeCalled()
  })

  describe('selectedKeyAction', () => {
    const setSelectedKeyActionMock = vi.fn()
    const spySelectedKey = vi.spyOn(useSelectedKeyStore, 'useSelectedKeyStore') as Mock

    const selectedKeyAction = {
      databaseId: DATABASE_ID_MOCK,
      key: constants.KEY_NAME_1,
      keyType: KeyTypes.Hash,
      type: SelectedKeyActionType.Removed,
    }

    spySelectedKey.mockImplementation(() => ({
      setSelectedKeyAction: setSelectedKeyActionMock,
      selectedKeyAction,
    }))

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should call deleteKeyFromTree and setSelectedKeyAction action after if selected key action is Removed', async () => {
      render(<DatabaseWrapper {...mockedProps} database={{ id: DATABASE_ID_MOCK } as Database} />)

      await waitForStack()

      expect(setSelectedKeyActionMock).toBeCalledWith(null)
      expect(deleteKeyFromTreeMock).toBeCalledWith(constants.KEY_NAME_1)
    })

    it('should not call any mocks if database is not equal', async () => {
      render(<DatabaseWrapper {...mockedProps} database={{ id: '123123' } as Database} />)

      await waitForStack()

      expect(setSelectedKeyActionMock).not.toBeCalled()
      expect(deleteKeyFromTreeMock).not.toBeCalled()
      expect(addKeyIntoTreeMock).not.toBeCalled()
    })

    it('should not call any mocks if type is not defined', async () => {
      render(<DatabaseWrapper {...mockedProps} database={{ id: DATABASE_ID_MOCK } as Database} />)

      await waitForStack()

      expect(setSelectedKeyActionMock).not.toBeCalled()
      expect(deleteKeyFromTreeMock).not.toBeCalled()
      expect(addKeyIntoTreeMock).not.toBeCalled()
    })

    it('should call addKeyIntoTree action after if selected key action is Added', async () => {
      const spySelectedKey = vi.spyOn(useSelectedKeyStore, 'useSelectedKeyStore') as Mock

      spySelectedKey.mockImplementation(() => ({
        selectedKeyAction: {
          ...selectedKeyAction,
          type: null,
        },
      }))

      render(<DatabaseWrapper {...mockedProps} database={{ id: DATABASE_ID_MOCK } as Database} />)

      expect(setSelectedKeyActionMock).not.toBeCalled()
      expect(deleteKeyFromTreeMock).not.toBeCalled()
      expect(addKeyIntoTreeMock).not.toBeCalled()
    })
  })
})
