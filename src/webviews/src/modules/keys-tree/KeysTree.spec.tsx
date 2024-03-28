import { cloneDeep } from 'lodash'
import React from 'react'
import { cleanup, fireEvent } from '@testing-library/react'

import { stringToBuffer } from 'uiSrc/utils'
import { KeyTypes, VscodeMessageAction } from 'uiSrc/constants'
import { useContextApi, useSelectedKeyStore } from 'uiSrc/store'
import * as storeContext from 'uiSrc/store'
import { apiService, vscodeApi } from 'uiSrc/services'
import * as useCommonHooks from 'uiSrc/hooks'
import * as utils from 'uiSrc/utils'
import { mockedStore, render, waitForStack } from 'testSrc/helpers'
import { KeysTree } from './KeysTree'
import { KeysStoreData } from './hooks/interface'
import * as useKeys from './hooks/useKeys'

vi.spyOn(storeContext, 'useContextApi')
vi.spyOn(vscodeApi, 'postMessage')
vi.spyOn(utils, 'showInformationMessage')
vi.spyOn(useKeys, 'useKeysInContext').mockImplementation(() => propsMock.keysState)
vi.spyOn(useCommonHooks, 'useDisposableWebworker').mockImplementation(() => ({
  run: vi.fn(),
  result: mockWebWorkerResult,
  error: null,
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const leafRootFullName = 'test'
const folderFullName = 'car:'
const leaf1FullName = 'car:110'
const leaf2FullName = 'car:210'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const propsMock = {
  keysState: {
    keys: [
      {
        name: leaf1FullName,
        type: 'hash',
        ttl: -1,
        size: 100,
        length: 100,
      },
      {
        name: leaf2FullName,
        type: 'hash',
        ttl: -1,
        size: 150,
        length: 100,
      },
      {
        name: leafRootFullName,
        type: 'hash',
        ttl: -1,
        size: 110,
        length: 100,
      },
    ],
    nextCursor: '0',
    total: 3,
    scanned: 5,
    shardsMeta: {},
    previousResultCount: 1,
    lastRefreshTime: 3,
  } as KeysStoreData,
  loading: false,
  deleting: false,
  commonFilterType: null,
  selectKey: vi.fn(),
  loadMoreItems: vi.fn(),
  onDelete: vi.fn(),
  onAddKeyPanel: vi.fn(),
  onBulkActionsPanel: vi.fn(),
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockWebWorkerResult = [{
  children: [{
    children: [],
    fullName: leaf1FullName,
    nameString: leaf1FullName,
    id: '0.0',
    keyApproximate: 0.01,
    keyCount: 1,
    name: '110',
    type: KeyTypes.String,
    isLeaf: true,
    nameBuffer: stringToBuffer(leaf1FullName),
  }, {
    children: [],
    fullName: leaf2FullName,
    nameString: leaf2FullName,
    id: '0.1',
    keyApproximate: 0.01,
    keyCount: 1,
    name: '110',
    type: KeyTypes.Hash,
    isLeaf: true,
    nameBuffer: stringToBuffer(leaf2FullName),
  }],
  fullName: folderFullName,
  nameString: folderFullName,
  id: '0',
  keyApproximate: 47.18,
  keyCount: 4718,
  name: 'car',
},
{
  children: [],
  fullName: leafRootFullName,
  id: '1',
  keyApproximate: 0.01,
  keyCount: 1,
  type: KeyTypes.Stream,
  isLeaf: true,
  name: 'test',
  nameBuffer: stringToBuffer(leafRootFullName),
}]

// vi.mock('./hooks/useKeys', async () => ({
//   ...(await vi.importActual<object>('./hooks/useKeys')),
//   useKeysInContext: () => propsMock.keysState,
// }))

// vi.mock('uiSrc/telemetry', async () => ({
//   ...(await vi.importActual<object>('uiSrc/telemetry')),
//   sendEventTelemetry: vi.fn(),
// }))

describe('KeysTree', () => {
  it('should be rendered', () => {
    expect(render(<KeysTree />)).toBeTruthy()
  })

  it('should call onDelete', async () => {
    const deletedKey = leaf2FullName
    useSelectedKeyStore.setState((state) => ({ ...state, data: { name: stringToBuffer(deletedKey) } }))

    apiService.delete = vi.fn().mockResolvedValue({ status: 200 })
    const { getByTestId } = render(<KeysTree />)

    // open parent folder
    fireEvent.click(getByTestId(`node-item_${folderFullName}`))

    // click on the leaf
    fireEvent.click(getByTestId(`remove-key-${deletedKey}-trigger`))
    fireEvent.click(getByTestId(`remove-key-${deletedKey}`))
    await waitForStack()

    expect(utils.showInformationMessage).toBeCalledWith(`${deletedKey} has been deleted.`)
    expect(vscodeApi.postMessage).toBeCalledWith({ action: VscodeMessageAction.CloseKey })
  })

  describe.skip('select a node', () => {
    it('"setKeysTreeNodesOpen" to be called after click on folder', () => {
      const { getByTestId } = render(<KeysTree />)

      // set open state
      fireEvent.click(getByTestId(`node-item_${folderFullName}`))

      const expectedActions = [
        useContextApi().setKeysTreeNodesOpen({ [folderFullName]: true }),
      ]

      expect(store.getActions()).toEqual(expect.arrayContaining(expectedActions))
    })

    it('"selectKey" to be called after click on leaf', async () => {
      // const onSelectedKeyMock = vi.fn()
      const { getByTestId } = render(<KeysTree />)

      // open parent folder
      fireEvent.click(getByTestId(`node-item_${folderFullName}`))

      // click on the leaf
      fireEvent.click(getByTestId(`node-item_${leaf2FullName}`))

      // expect(onSelectedKeyMock).toBeCalled()
    })

    // todo
    // it('selected key from key list should be opened and selected in the tree', async () => {
    //   const selectedKeyDataSelectorMock = vi.fn().mockReturnValue({
    //     name: stringToBuffer(leaf2FullName),
    //     nameString: leaf2FullName,
    //   });

    //   (selectedKeyDataSelector as Mock).mockImplementation(selectedKeyDataSelectorMock)

    //   const { getByTestId } = render(<KeysTree />)

    //   expect(getByTestId(`node-item_${leaf2FullName}`)).toBeInTheDocument()
    // })
  })
})
