import React from 'react'
import { mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import { Mock } from 'vitest'

import { SortOrder } from 'uiSrc/constants'
import * as utils from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import * as useContext from 'uiSrc/store/hooks/use-context/useContext'
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
const fnMock = vi.fn();
(vi.spyOn(useKeys, 'useKeysApi') as Mock).mockImplementation(() => ({
  getState: () => ({
    fetchPatternKeysAction: fnMock,
    setDatabaseId: fnMock,
  }),
}))
const setKeysTreeSortMock = vi.fn()
const resetKeysTreeMock = vi.fn();
(vi.spyOn(useContext, 'useContextApi') as Mock).mockImplementation(() => ({
  getState: () => ({
    setKeysTreeSort: setKeysTreeSortMock,
    resetKeysTree: resetKeysTreeMock,
  }),
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

    expect(useKeys.useKeysApi().getState().fetchPatternKeysAction).toBeCalled()
  })
  it('should call setKeysTreeSort and resetKeysTree actions after click on sorting icon', async () => {
    const { queryByTestId } = render(<DatabaseWrapper {...mockedProps} />)

    fireEvent.click(queryByTestId(`database-${mockDatabase.id}`)!)
    await waitForStack()

    fireEvent.click(queryByTestId('sort-keys')!)
    await waitForStack()

    expect(useContext.useContextApi().getState().setKeysTreeSort).toBeCalledWith(mockDatabase.id, SortOrder.DESC)
    expect(useContext.useContextApi().getState().resetKeysTree).toBeCalled()
    expect(utils.sendEventTelemetry).toBeCalledWith({
      event: 'TREE_VIEW_KEYS_SORTED',
      eventData: {
        databaseId: utils.getDatabaseId(),
        sorting: 'DESC',
      },
    })
  })
})
