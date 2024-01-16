import { cloneDeep } from 'lodash'

import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/constants'
import {
  cleanup,
  constants,
  initialStateDefault,
  mockedStore,
} from 'testSrc/helpers'

import reducer, {
  initialState,
  getServerInfo,
  getServerInfoSuccess,
  getServerInfoFailure,
  appInfoSelector, fetchServerInfo,
} from './info.slice'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('info slice', () => {
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

  describe('getServerInfo', () => {
    it('should properly set loading', () => {
      // Arrange
      const loading = true
      const state = {
        ...initialState,
        loading,
      }

      // Act
      const nextState = reducer(initialState, getServerInfo())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { info: nextState },
      })

      expect(appInfoSelector(rootState)).toEqual(state)
    })
  })

  describe('getServerInfoSuccess', () => {
    it('should properly set state after success', () => {
      const state = {
        ...initialState,
        loading: false,
        server: constants.APP_INFO_DATA_MOCK,
      }

      // Act
      const nextState = reducer(initialState, getServerInfoSuccess(constants.APP_INFO_DATA_MOCK))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { info: nextState },
      })

      expect(appInfoSelector(rootState)).toEqual(state)
    })
  })

  describe('getServerInfoFailure', () => {
    it('should properly set error', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, getServerInfoFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { info: nextState },
      })

      expect(appInfoSelector(rootState)).toEqual(state)
    })
  })

  // thunks
  describe('fetchServerInfo', () => {
    it.todo('succeed to fetch server info', async () => {
      // Act
      await store.dispatch<any>(fetchServerInfo(vi.fn()))

      // Assert
      const expectedActions = [
        getServerInfo(),
        getServerInfoSuccess(constants.APP_INFO_DATA_MOCK),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it.todo('failed to fetch server info', async () => {
      // Act
      await store.dispatch<any>(fetchServerInfo(vi.fn(), vi.fn()))

      // Assert
      const expectedActions = [
        getServerInfo(),
        getServerInfoFailure(DEFAULT_ERROR_MESSAGE),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })
})
