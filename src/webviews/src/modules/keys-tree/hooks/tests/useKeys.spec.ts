import { cleanup } from '@testing-library/react'
import { cloneDeep } from 'lodash'
import { Mock, SpyInstance } from 'vitest'
import { createStore } from 'zustand'
import * as utils from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import { constants, mockedStore, waitForStack } from 'testSrc/helpers'
import * as useKeys from '../useKeys'
import { KeysActions, KeysStore, KeysStoreData, KeysThunks } from '../interface'
import { createKeysActionsSlice, initialKeysState as initialStateInit } from '../useKeysActions'
import { createKeysThunksSlice } from '../useKeysThunks'

const { stringToBuffer } = utils
let store: typeof mockedStore
let dateNow: SpyInstance<[], number>
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

vi.spyOn(utils, 'sendEventTelemetry')
vi.spyOn(utils, 'showErrorMessage')
vi.spyOn(utils, 'showInformationMessage')

const fnMock = vi.fn();
(vi.spyOn(useKeys, 'useKeysApi') as Mock).mockImplementation(() => ({
  getState: () => ({
    fetchPatternKeysAction: fnMock,
    setDatabaseId: fnMock,
  }),
}))

const useKeysStore = createStore<KeysStore & KeysActions & KeysThunks>()((...a) => ({
  ...createKeysActionsSlice(...a),
  ...createKeysThunksSlice(...a),
}))

describe('useKeys', () => {
  beforeAll(() => {
    dateNow = vi.spyOn(Date, 'now').mockImplementation(() => constants.MOCK_TIMESTAMP)
  })

  afterAll(() => {
    dateNow.mockRestore()
  })
  it('loadKeys', () => {
    // Arrange
    const { loadKeys } = useKeysStore.getState()
    // Act
    loadKeys()
    // Assert
    expect(useKeysStore.getState().loading).toEqual(true)
  })

  it('loadKeysFinal', () => {
    // Arrange
    const initialState = { ...initialStateInit, loading: true } // Custom initial state
    useKeysStore.setState((state) => ({ ...state, ...initialState }))

    const { loadKeysFinal } = useKeysStore.getState()
    // Act
    loadKeysFinal()
    // Assert
    expect(useKeysStore.getState().loading).toEqual(false)
  })

  describe('loadKeysSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange
      const stateData = {
          ...constants.KEYS_LIST,
          lastRefreshTime: Date.now(),
          previousResultCount: constants.KEYS_LIST.keys.length,
      }

      // Act
      const { loadKeysSuccess } = useKeysStore.getState()
      loadKeysSuccess(constants.KEYS_LIST)

      // Assert
      expect(useKeysStore.getState().data).toEqual(stateData)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = {}

      const stateData= {
          ...data,
          previousResultCount: data.keys?.length,
          lastRefreshTime: Date.now(),
      }

      // Act
      const { loadKeysSuccess } = useKeysStore.getState()
      loadKeysSuccess(data)

      // Assert
      expect(useKeysStore.getState().data).toEqual(stateData)
    })
  })

  describe('loadMoreKeysSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange
      const data: KeysStoreData = {
        ...constants.KEYS_LIST,
        previousResultCount: 2,
        total: 0,
        nextCursor: '0',
        shardsMeta: {},
        scanned: 0,
        keys: [
          {
            name: stringToBuffer('bull:mail-queue:155'),
            type: 'hash',
            ttl: 2147474450,
            size: 3041,
          },
          {
            name: stringToBuffer('bull:mail-queue:223'),
            type: 'hash',
            ttl: -1,
            size: 3041,
          },
        ],
      }

      const initialState = { ...initialStateInit, data: constants.KEYS_LIST, loading: true } // Custom initial state
      useKeysStore.setState((state) => ({ ...state, ...initialState }))

      const stateData = {
        ...data,
        keys: initialState.data.keys.concat(data.keys),
      }

      // Act
      const { loadMoreKeysSuccess } = useKeysStore.getState()
      loadMoreKeysSuccess(data)

      // Assert
      expect(useKeysStore.getState().data).toEqual(stateData)

    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: KeysStoreData = {
        total: 0,
        nextCursor: '0',
        keys: [],
        scanned: 0,
        shardsMeta: {},
        previousResultCount: 0,
        lastRefreshTime: 0,
      }


      const initialState = { ...initialStateInit, data: constants.KEYS_LIST, loading: true } // Custom initial state
      useKeysStore.setState((state) => ({ ...state, ...initialState }))

      const stateData = {
        ...data,
        keys: initialState.data.keys.concat(data.keys),
      }

      // Act
      const { loadMoreKeysSuccess } = useKeysStore.getState()
      loadMoreKeysSuccess(data)

      // Assert
      expect(useKeysStore.getState().data).toEqual(stateData)
    })
  })

  it('deleteKey', () => {
    // Arrange
    const { deleteKey } = useKeysStore.getState()
    // Act
    deleteKey()
    // Assert
    expect(useKeysStore.getState().deleting).toEqual(true)
  })

  it('deleteKeyFinal', () => {
    // Arrange
    const initialState = { ...initialStateInit, deleting: true } // Custom initial state
    useKeysStore.setState((state) => ({ ...state, ...initialState }))

    const { deleteKeyFinal } = useKeysStore.getState()
    // Act
    deleteKeyFinal()
    // Assert
    expect(useKeysStore.getState().deleting).toEqual(false)
  })

  describe('thunks', () => {
    describe('fetchPatternKeysAction', () => {
      it('call both loadKeys and loadKeysSuccess when fetch is successed', async () => {
        const responsePayload = {
          data: [
            {
              total: constants.KEYS_LIST.total,
              scanned: constants.KEYS_LIST.scanned,
              cursor: constants.KEYS_LIST.nextCursor,
              keys: [...constants.KEYS_LIST.keys],
            },
          ],
          status: 200,
        }

        apiService.post = vi.fn().mockResolvedValue(responsePayload)

        // Act
        useKeysStore.getState().fetchPatternKeysAction()
        await waitForStack()

        const eventData = {
          event: 'TREE_VIEW_KEYS_SCANNED',
          eventData: {
            databaseId: utils.getDatabaseId(),
            databaseSize: 249,
            keyType: null,
            match: '*',
            numberOfKeysScanned: undefined,
            scanCount: 10000,
            source: 'manual',
          },
        }

        // Assert
        expect(utils.sendEventTelemetry).toBeCalledWith(eventData)
        expect(useKeysStore.getState().data.keys).toEqual(constants.KEYS_LIST.keys)
        expect(useKeysStore.getState().data.nextCursor).toEqual(constants.KEYS_LIST.nextCursor)
        expect(useKeysStore.getState().loading).toEqual(false)
      })

      it('failed to load keys', async () => {
        // Arrange
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = vi.fn().mockRejectedValue(responsePayload)

        // Act
        useKeysStore.getState().fetchPatternKeysAction()
        await waitForStack()

        // Assert
        expect(utils.showErrorMessage).toBeCalled()
        expect(useKeysStore.getState().loading).toEqual(false)
      })
    })

    describe('fetchMorePatternKeysAction', () => {
      it('call loadMoreKeysSuccess when fetch is successed', async () => {
        // Arrange
        const initialState = { ...initialStateInit, data: constants.KEYS_LIST } // Custom initial state
        useKeysStore.setState((state) => ({ ...state, ...initialState }))

        const data = {
          total: 0,
          nextCursor: '0',
          scanned: 20,
          shardsMeta: {},
          keys: [
            {
              name: stringToBuffer('bull:mail-queue:155'),
              type: 'hash',
              ttl: 2147474450,
              size: 3041,
            },
            {
              name: stringToBuffer('bull:mail-queue:223'),
              type: 'hash',
              ttl: -1,
              size: 3041,
            },
          ],
        }

        const responsePayload = {
          data: [
            {
              total: data.total,
              scanned: data.scanned,
              cursor: constants.KEYS_LIST.nextCursor,
              keys: [...data.keys],
            },
          ],
          status: 200,
        }

        apiService.post = vi.fn().mockResolvedValue(responsePayload)

        // Act
        useKeysStore.getState().fetchMorePatternKeysAction('1')
        await waitForStack()

        // Assert
        expect(useKeysStore.getState().data.keys).toEqual(constants.KEYS_LIST.keys.concat(data.keys))
        expect(useKeysStore.getState().data.nextCursor).toEqual(constants.KEYS_LIST.nextCursor)
        expect(useKeysStore.getState().loading).toEqual(false)
      })

      it('failed to fetch more keys', async () => {
        // Arrange
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = vi.fn().mockRejectedValue(responsePayload)

        // Act
        useKeysStore.getState().fetchPatternKeysAction()
        await waitForStack()

        // Assert
        expect(utils.showErrorMessage).toBeCalled()
        expect(useKeysStore.getState().loading).toEqual(false)
      })
    })

    describe('fetchKeysMetadataTree', () => {
      it('success to fetch keys metadata', async () => {
      // Arrange
        const data = [
          {
            name: stringToBuffer('key1'),
            type: 'hash',
            ttl: -1,
            size: 100,
            path: 0,
            length: 100,
          },
          {
            name: stringToBuffer('key2'),
            type: 'hash',
            ttl: -1,
            size: 150,
            path: 1,
            length: 100,
          },
          {
            name: stringToBuffer('key3'),
            type: 'hash',
            ttl: -1,
            size: 110,
            path: 2,
            length: 100,
          },
        ]
        const responsePayload = { data, status: 200 }

        const apiServiceMock = vi.fn().mockResolvedValue(responsePayload)
        const onSuccessMock = vi.fn()
        apiService.post = apiServiceMock
        const controller = new AbortController()

        // Act
        useKeysStore.getState().fetchKeysMetadataTree(
          data.map(({ name }, i) => ([i, name])) as any,
          null,
          controller.signal,
          onSuccessMock,
        )
        await waitForStack()

        // Assert
        expect(apiServiceMock).toBeCalledWith(
          `/databases/null/keys/get-metadata`,
          { keys: data.map(({ name }) => (name)), type: undefined },
          { params: { encoding: 'buffer' }, signal: controller.signal },
        )

        expect(onSuccessMock).toBeCalledWith(data)
      })
    })

    describe('deleteKeyAction', () => {
      it.todo('call both deleteKeyInList and showInformationMessage when delete is successed', async () => {
        const initialState = { ...initialStateInit, data: constants.KEYS_LIST } // Custom initial state
        useKeysStore.setState((state) => ({ ...state, ...initialState }))

        const responsePayload = { status: 200 }

        apiService.delete = vi.fn().mockResolvedValue(responsePayload)

        // Act
        useKeysStore.getState().deleteKeyAction(constants.KEY_NAME_1)
        await waitForStack()

        // Assert
        // expect(utils.showInformationMessage).toBeCalled()
        expect(useKeysStore.getState().data.total).toEqual(constants.KEYS_LIST.total - 1)
        expect(useKeysStore.getState().data.scanned).toEqual(constants.KEYS_LIST.scanned - 1)
        expect(useKeysStore.getState().deleting).toEqual(false)
      })

      it('failed to delete key', async () => {
        // Arrange
        const errorMessage = 'some error'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.delete = vi.fn().mockRejectedValue(responsePayload)

        // Act
        useKeysStore.getState().deleteKeyAction(constants.KEY_NAME_1)
        await waitForStack()

        // Assert
        expect(utils.showErrorMessage).toBeCalledWith(responsePayload.response.data.message)
        expect(useKeysStore.getState().deleting).toEqual(false)
      })
    })
  })
})
