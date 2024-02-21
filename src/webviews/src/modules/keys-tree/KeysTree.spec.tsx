import { cloneDeep } from 'lodash'
import React from 'react'
import { cleanup, fireEvent } from '@testing-library/react'
import { Mock } from 'vitest'

import { stringToBuffer } from 'uiSrc/utils'
import { KeyTypes } from 'uiSrc/constants'
import { setKeysTreeNodesOpen } from 'uiSrc/slices/app/context/context.slice'
import { mockedStore, render } from 'testSrc/helpers'
import { KeysTree } from './KeysTree'
import { KeysStoreData } from './hooks/interface'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const propsMock = {
  keysState: {
    keys: [
      {
        name: 'key1',
        type: 'hash',
        ttl: -1,
        size: 100,
        length: 100,
      },
      {
        name: 'key2',
        type: 'hash',
        ttl: -1,
        size: 150,
        length: 100,
      },
      {
        name: 'key3',
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

const leafRootFullName = 'test'
const folderFullName = 'car:'
const leaf1FullName = 'car:110'
const leaf2FullName = 'car:210'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockWebWorkerResult = [{
  children: [{
    children: [],
    fullName: leaf1FullName,
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
    id: '0.1',
    keyApproximate: 0.01,
    keyCount: 1,
    name: '110',
    type: KeyTypes.Hash,
    isLeaf: true,
    nameBuffer: stringToBuffer(leaf2FullName),
  }],
  fullName: folderFullName,
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

// vi.mock('uiSrc/services', () => ({
//   ...(await vi.importActual<object>('uiSrc/services')),
//   useDisposableWebworker: () => ({ result: mockWebWorkerResult, run: vi.fn() }),
// }))

// vi.mock('uiSrc/telemetry', async () => ({
//   ...(await vi.importActual<object>('uiSrc/telemetry')),
//   sendEventTelemetry: vi.fn(),
// }))

describe('KeysTree', () => {
  it('should be rendered', () => {
    expect(render(<KeysTree />)).toBeTruthy()
  })

  describe.skip('select a node', () => {
    it('"setKeysTreeNodesOpen" to be called after click on folder', () => {
      const { getByTestId } = render(<KeysTree />)

      // set open state
      fireEvent.click(getByTestId(`node-item_${folderFullName}`))

      const expectedActions = [
        setKeysTreeNodesOpen({ [folderFullName]: true }),
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
