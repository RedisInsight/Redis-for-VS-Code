import React from 'react'
import { mock } from 'ts-mockito'
import { Mock } from 'vitest'

import { KeyTypes, SelectedKeyActionType } from 'uiSrc/constants'
import * as utils from 'uiSrc/utils'
import { apiService, vscodeApi } from 'uiSrc/services'
import * as useContext from 'uiSrc/store/hooks/use-context/useContext'
import * as useSelectedKeyStore from 'uiSrc/store/hooks/use-selected-key-store/useSelectedKeyStore'
import { Database } from 'uiSrc/store'
import { constants, fireEvent, render, waitForStack } from 'testSrc/helpers'
import { LogicalDatabaseWrapper, Props } from './LogicalDatabaseWrapper'
import * as useKeys from '../../hooks/useKeys'

const mockDatabase = constants.DATABASE
const mockedProps = {
  ...mock<Props>(<div />),
  database: mockDatabase,
}
beforeEach(() => {
  apiService.get = vi.fn().mockResolvedValue({ status: 200, data: {} })
})

vi.spyOn(utils, 'sendEventTelemetry')
vi.spyOn(vscodeApi, 'postMessage')

const fnMock = vi.fn()
const addKeyIntoTreeMock = vi.fn()
const deleteKeyFromTreeMock = vi.fn();
(vi.spyOn(useKeys, 'useKeysApi') as Mock).mockImplementation(() => ({
  fetchPatternKeysAction: fnMock,
  setDatabaseId: fnMock,
  setDatabaseIndex: fnMock,
  addKeyIntoTree: addKeyIntoTreeMock,
  deleteKeyFromTree: deleteKeyFromTreeMock,
}))
const setKeysTreeSortMock = vi.fn()
const resetKeysTreeMock = vi.fn();
(vi.spyOn(useContext, 'useContextApi') as Mock).mockImplementation(() => ({
  setKeysTreeSort: setKeysTreeSortMock,
  resetKeysTree: resetKeysTreeMock,
}))

describe('LogicalDatabaseWrapper', () => {
  it('should render', () => {
    expect(render(<LogicalDatabaseWrapper {...mockedProps} />)).toBeTruthy()
  })

  describe('selectedKeyAction', () => {
    const setSelectedKeyActionMock = vi.fn()
    const setSelectedKeyMock = vi.fn()
    const spySelectedKey = vi.spyOn(useSelectedKeyStore, 'useSelectedKeyStore') as Mock

    const selectedKeyAction = {
      type: SelectedKeyActionType.Removed,
      database: {
        id: constants.DATABASE_ID,
      },
      keyInfo: {
        key: constants.KEY_NAME_1,
        keyType: KeyTypes.Hash,
      },
    }

    spySelectedKey.mockImplementation(() => ({
      setSelectedKeyAction: setSelectedKeyActionMock,
      setSelectedKey: setSelectedKeyMock,
      selectedKeyAction,
    }))

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should call deleteKeyFromTree and setSelectedKeyAction action after if selected key action is Removed', async () => {
      render(<LogicalDatabaseWrapper {...mockedProps} database={{ id: constants.DATABASE_ID } as Database} />)

      await waitForStack()

      expect(setSelectedKeyActionMock).toBeCalledWith(null)
      expect(deleteKeyFromTreeMock).toBeCalledWith(constants.KEY_NAME_1)
    })

    it('should not call any mocks if database is not equal', async () => {
      render(<LogicalDatabaseWrapper {...mockedProps} database={{ id: '123123' } as Database} />)

      await waitForStack()

      expect(setSelectedKeyActionMock).not.toBeCalled()
      expect(deleteKeyFromTreeMock).not.toBeCalled()
      expect(addKeyIntoTreeMock).not.toBeCalled()
    })

    it('should not call any mocks if type is not defined', async () => {
      render(<LogicalDatabaseWrapper {...mockedProps} database={{ id: constants.DATABASE_ID } as Database} />)

      await waitForStack()

      expect(setSelectedKeyActionMock).not.toBeCalled()
      expect(deleteKeyFromTreeMock).not.toBeCalled()
      expect(addKeyIntoTreeMock).not.toBeCalled()
    })

    it('should call addKeyIntoTree action after if selected key action is Added', async () => {
      const spySelectedKey = vi.spyOn(useSelectedKeyStore, 'useSelectedKeyStore') as Mock

      const setSelectedKeyActionMock = vi.fn()
      const setSelectedKeyMock = vi.fn()

      spySelectedKey.mockImplementation(() => ({
        selectedKeyAction: {
          ...selectedKeyAction,
          type: SelectedKeyActionType.Added,
        },
        setSelectedKeyAction: setSelectedKeyActionMock,
        setSelectedKey: setSelectedKeyMock,
      }))

      render(<LogicalDatabaseWrapper {...mockedProps} database={{ id: constants.DATABASE_ID } as Database} />)

      expect(setSelectedKeyMock).toBeCalledWith({ name: constants.KEY_NAME_1 })
      expect(setSelectedKeyActionMock).toBeCalledWith(null)
      expect(deleteKeyFromTreeMock).not.toBeCalled()
      expect(addKeyIntoTreeMock).not.toBeCalled()
    })
  })
})
