import React from 'react'
import { mock } from 'ts-mockito'
import { Mock } from 'vitest'

import { KeyTypes, SelectedKeyActionType } from 'uiSrc/constants'
import * as utils from 'uiSrc/utils'
import { apiService, vscodeApi } from 'uiSrc/services'
import * as useContext from 'uiSrc/store/hooks/use-context/useContext'
import * as useSelectedKeyStore from 'uiSrc/store/hooks/use-selected-key-store/useSelectedKeyStore'
import { Database } from 'uiSrc/store'
import * as useDatabasesStore from 'uiSrc/store'
import { constants, fireEvent, render, waitForStack } from 'testSrc/helpers'
import { DatabaseWrapper, Props } from './DatabaseWrapper'
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
}))
const setKeysTreeSortMock = vi.fn()
const resetKeysTreeMock = vi.fn();
(vi.spyOn(useContext, 'useContextApi') as Mock).mockImplementation(() => ({
  setKeysTreeSort: setKeysTreeSortMock,
  resetKeysTree: resetKeysTreeMock,
}))

vi.spyOn(useDatabasesStore, 'fetchDatabaseOverviewById')

describe('DatabaseWrapper', () => {
  it('should render', () => {
    expect(render(<DatabaseWrapper {...mockedProps} />)).toBeTruthy()
  })

  it('should call fetchDatabaseOverviewById action after click on refresh icon', async () => {
    const { queryByTestId } = render(<DatabaseWrapper {...mockedProps} />)

    fireEvent.click(queryByTestId('refresh-databases')!)
    await waitForStack()

    expect(useDatabasesStore.fetchDatabaseOverviewById).toBeCalled()
  })

  it('should call fetchPatternKeysAction action after click on logical database refresh icon', async () => {
    const { queryByTestId } = render(<DatabaseWrapper {...mockedProps} />)

    fireEvent.click(queryByTestId(`database-${mockDatabase.id}`)!)
    await waitForStack()

    fireEvent.click(queryByTestId('refresh-keys-refresh-btn')!)
    await waitForStack()

    expect(useKeys.useKeysApi().fetchPatternKeysAction).toBeCalled()
  })

  it('should render logical databases', async () => {
    const { queryByTestId } = render(<DatabaseWrapper {...mockedProps} />)

    fireEvent.click(queryByTestId(`database-${mockDatabase.id}`)!)
    await waitForStack()

    expect(queryByTestId(`logical-database-${mockDatabase.id}-0`)!).toBeInTheDocument()
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

    it('should not call any mocks if database is not equal', async () => {
      render(<DatabaseWrapper {...mockedProps} database={{ id: '123123' } as Database} />)

      await waitForStack()

      expect(setSelectedKeyActionMock).not.toBeCalled()
      expect(deleteKeyFromTreeMock).not.toBeCalled()
      expect(addKeyIntoTreeMock).not.toBeCalled()
    })

    it('should not call any mocks if type is not defined', async () => {
      render(<DatabaseWrapper {...mockedProps} database={{ id: constants.DATABASE_ID } as Database} />)

      await waitForStack()

      expect(setSelectedKeyActionMock).not.toBeCalled()
      expect(deleteKeyFromTreeMock).not.toBeCalled()
      expect(addKeyIntoTreeMock).not.toBeCalled()
    })
  })
})
