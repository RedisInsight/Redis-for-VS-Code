import { cleanup } from '@testing-library/react'
import { cloneDeep } from 'lodash'
import { SpyInstance } from 'vitest'
import { stringToBuffer } from 'uiSrc/utils'
import { apiService } from 'uiSrc/services'
import { RootState } from 'uiSrc/store'
import { constants, initialStateDefault, mockedStore } from 'testSrc/helpers'
import reducer, {
  initialState,
  loadKeys,
  loadKeysSuccess,
  loadKeysFailure,
  loadMoreKeys,
  loadMoreKeysSuccess,
  loadMoreKeysFailure,
  keysSelector,
  fetchPatternKeysAction,
  fetchMorePatternKeysAction,
  fetchKeysMetadataTree,
} from '../keys.slice'
import { parseKeysListResponse } from '../../utils'
import { KeysStoreData } from '../interface'

let store: typeof mockedStore
let dateNow: SpyInstance<[], number>
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('keys slice', () => {
  beforeAll(() => {
    dateNow = vi.spyOn(Date, 'now').mockImplementation(() => constants.MOCK_TIMESTAMP)
  })

  afterAll(() => {
    dateNow.mockRestore()
  })
  describe('loadKeys', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadKeys())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('loadKeysSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data: any = {
        total: 249,
        nextCursor: '228',
        previousResultCount: 0,
        lastRefreshTime: 0,
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

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...data,
          lastRefreshTime: Date.now(),
          previousResultCount: data.keys.length,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadKeysSuccess({ data }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = {}

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...data,
          previousResultCount: data.keys?.length,
          lastRefreshTime: Date.now(),
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadKeysSuccess({ data }),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('loadKeysFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
        data: {
          ...initialState.data,
          keys: [],
          nextCursor: '0',
          total: 0,
          scanned: 0,
          shardsMeta: {},
          previousResultCount: 0,
        },
      }

      // Act
      const nextState = reducer(initialState, loadKeysFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreKeys', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
        error: '',
        data: {
          ...initialState.data,
          keys: [],
          nextCursor: '0',
          total: 0,
          scanned: 0,
          shardsMeta: {},
          previousResultCount: 0,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeys())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreKeysSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const data: any = {
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

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...data,
          previousResultCount: data.keys.length,
          lastRefreshTime: initialState.data.lastRefreshTime,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeysSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
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

      // Act
      const nextState = reducer(initialState, loadMoreKeysSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(initialState)
    })
  })

  describe('loadMoreKeysFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
        data: {
          ...initialState.data,
          keys: [],
          nextCursor: '0',
          total: 0,
          scanned: 0,
          shardsMeta: {},
          previousResultCount: 0,
        },
      }

      // Act
      const nextState = reducer(initialState, loadMoreKeysFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        browser: { keys: nextState },
      })
      expect(keysSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchPatternKeysAction', () => {
      it('call both loadKeys and loadKeysSuccess when fetch is successed', async () => {
        // Arrange
        const data = {
          total: 10,
          nextCursor: 20,
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
              cursor: 20,
              keys: [...data.keys],
            },
          ],
          status: 200,
        }

        apiService.post = vi.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchPatternKeysAction('0', 20))

        // Assert
        const expectedActions = [
          loadKeys(),
          loadKeysSuccess({
            data: parseKeysListResponse({}, responsePayload.data),
          }),
        ]
        expect(store.getActions()).toEqual(expectedActions)
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
        await store.dispatch<any>(fetchPatternKeysAction('0', 20))

        // Assert
        const expectedActions = [
          loadKeys(),
          loadKeysFailure(errorMessage),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchMoreKeys', () => {
      it('call both loadMoreKeys and loadMoreKeysSuccess when fetch is successed', async () => {
        // Arrange
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
              cursor: 20,
              keys: [...data.keys],
            },
          ],
          status: 200,
        }

        apiService.post = vi.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchMorePatternKeysAction('0', 20))

        // Assert
        const expectedActions = [
          loadMoreKeys(),
          loadMoreKeysSuccess(parseKeysListResponse({}, responsePayload.data)),
        ]
        expect(store.getActions()).toEqual(expectedActions)
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
        await store.dispatch<any>(fetchMorePatternKeysAction('0', 20))

        // Assert
        const expectedActions = [
          loadMoreKeys(),
          loadMoreKeysFailure(errorMessage),
        ]
        expect(store.getActions()).toEqual(expectedActions)
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
        await store.dispatch<any>(
          fetchKeysMetadataTree(
            data.map(({ name }, i) => ([i, name])) as any,
            null,
            controller.signal,
            onSuccessMock,
          ),
        )

        const state = store.getState() as RootState
        const databaseId = state.connections.databases.connectedDatabase.id
        // Assert
        expect(apiServiceMock).toBeCalledWith(
          `/databases/${databaseId}/keys/get-metadata`,
          { keys: data.map(({ name }) => (name)), type: undefined },
          { params: { encoding: 'buffer' }, signal: controller.signal },
        )

        expect(onSuccessMock).toBeCalledWith(data)
      })
    })
  })
})
