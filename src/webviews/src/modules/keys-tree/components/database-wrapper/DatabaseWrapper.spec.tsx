import React, { PropsWithChildren } from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'

import { SortOrder } from 'uiSrc/constants'
import * as utils from 'uiSrc/utils'
import { resetKeysTree, setKeysTreeSort } from 'uiSrc/slices/app/context/context.slice'
import { cleanup, fireEvent, mockedStore, render, waitForStack } from 'testSrc/helpers'
import { DatabaseWrapper } from './DatabaseWrapper'
import * as useKeys from '../../hooks/useKeys'

const mockedProps = mock<PropsWithChildren>(<div />)
let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

vi.spyOn(utils, 'sendEventTelemetry')
vi.spyOn(useKeys, 'fetchPatternKeysAction')

describe('DatabaseWrapper', () => {
  it('should render', () => {
    expect(render(<DatabaseWrapper {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call fetchPatternKeysAction action after click on refresh icon', async () => {
    const { queryByTestId } = render(<DatabaseWrapper {...instance(mockedProps)} />)

    fireEvent.click(queryByTestId('refresh-keys')!)
    await waitForStack()

    expect(useKeys.fetchPatternKeysAction).toBeCalled()
  })
  it('should call setKeysTreeSort and resetKeysTree actions after click on sorting icon', async () => {
    const { queryByTestId } = render(<DatabaseWrapper {...instance(mockedProps)} />)

    fireEvent.click(queryByTestId('sort-keys')!)
    await waitForStack()

    const expectedActions = [setKeysTreeSort(SortOrder.DESC), resetKeysTree()]
    expect(store.getActions()).toEqual(expectedActions)
    expect(utils.sendEventTelemetry).toBeCalledWith({
      event: 'TREE_VIEW_KEYS_SORTED',
      eventData: {
        databaseId: utils.getDatabaseId(),
        sorting: 'DESC',
      },
    })
  })
})
