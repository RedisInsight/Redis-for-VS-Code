import { cloneDeep } from 'lodash'

import { apiService } from 'uiSrc/services'
import { checkRediStack } from 'uiSrc/utils'
import { ConnectionType } from 'uiSrc/constants'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'testSrc/helpers'

import reducer, {
  initialState,
  databasesSelector,
  processDatabase,
  loadDatabasesSuccess,
  loadDatabasesFailure,
  fetchDatabasesAction,
} from './databases.slice'

let store: typeof mockedStore
let databases: any[]

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()

  databases = [
    {
      id: 'e37cc441-a4f2-402c-8bdb-fc2413cbbaff',
      host: 'localhost',
      port: 6379,
      name: 'localhost',
      username: null,
      password: null,
      connectionType: ConnectionType.Standalone,
      nameFromProvider: null,
      modules: [],
      lastConnection: new Date('2021-04-22T09:03:56.917Z'),
    },
    {
      id: 'a0db1bc8-a353-4c43-a856-b72f4811d2d4',
      host: 'localhost',
      port: 12000,
      name: 'oea123123',
      username: null,
      password: null,
      connectionType: ConnectionType.Standalone,
      nameFromProvider: null,
      modules: [],
      tls: {
        verifyServerCert: true,
        caCertId: '70b95d32-c19d-4311-bb24-e684af12cf15',
        clientCertPairId: '70b95d32-c19d-4311-b23b24-e684af12cf15',
      },
    },
    {
      id: 'b83a3932-e95f-4f09-9d8a-55079f400186',
      host: 'localhost',
      port: 5005,
      name: 'sentinel',
      username: null,
      password: null,
      connectionType: ConnectionType.Sentinel,
      nameFromProvider: null,
      lastConnection: new Date('2021-04-22T18:40:44.031Z'),
      modules: [],
      endpoints: [
        {
          host: 'localhost',
          port: 5005,
        },
        {
          host: '127.0.0.1',
          port: 5006,
        },
      ],
      sentinelMaster: {
        name: 'mymaster',
      },
    },
  ]
})

describe('databases slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {} as any)

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  describe('loadDatabases', () => {
    it('should properly set loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, processDatabase())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          databases: nextState,
        },
      })
      expect(databasesSelector(rootState)).toEqual(state)
    })
  })

  describe('loadDatabasesSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: true,
        data: checkRediStack(databases),
      }

      // Act
      const databaseState = reducer(initialState, processDatabase())
      const nextState = reducer(initialState, loadDatabasesSuccess(databases))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          databases: { ...databaseState, data: nextState.data },
        },
      })
      expect(databasesSelector(rootState)).toEqual(state)
    })

    it('should properly set the state with empty data', () => {
      // Arrange
      const data: any = []

      const state = {
        ...initialState,
        loading: false,
        data,
      }

      // Act
      const nextState = reducer(initialState, loadDatabasesSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          databases: nextState,
        },
      })
      expect(databasesSelector(rootState)).toEqual(state)
    })
  })

  describe('loadDatabasesFailure', () => {
    it('should properly set the error', () => {
      // Arrange
      const data = 'some error'
      const state = {
        ...initialState,
        loading: false,
        error: data,
        data: [],
      }

      // Act
      const nextState = reducer(initialState, loadDatabasesFailure(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        connections: {
          databases: nextState,
        },
      })
      expect(databasesSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchDatabases', () => {
      it('call both fetchDatabases and loadDatabasesSuccess when fetch is successed', async () => {
        // Arrange
        const responsePayload = { data: databases, status: 200 }

        apiService.get = vi.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchDatabasesAction())

        // Assert
        const expectedActions = [
          processDatabase(),
          loadDatabasesSuccess(responsePayload.data),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })

      it('call both fetchDatabases and loadDatabasesFailure when fetch is fail', async () => {
        // Arrange
        const errorMessage = 'Could not connect to aoeu:123, please check the connection details.'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = vi.fn().mockRejectedValueOnce(responsePayload)

        // Act
        await store.dispatch<any>(fetchDatabasesAction())

        // Assert
        const expectedActions = [
          processDatabase(),
          loadDatabasesFailure(responsePayload.response.data.message),
        ]
        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
