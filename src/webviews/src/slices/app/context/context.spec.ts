import { cloneDeep } from 'lodash'
import { cleanup } from '@testing-library/react'
import { SortOrder } from 'uiSrc/constants'

import {
  initialStateDefault,
  mockedStore,
} from 'testSrc/helpers'
import reducer, {
  initialState,
  setAppContextInitialState,
  setAppContextConnectedDatabaseId,
  setKeysTreeSort,
  appContextSelector,
  setKeysTreeNodesOpen,
  resetKeysTree,
  appContextKeysTree,
  setKeysTreeDelimiter,
  appContextDbConfig,
  setDbConfig,
} from './context.slice'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('slices', () => {
  describe('setAppContextInitialState', () => {
    it('should properly set initial state', () => {
      const nextState = reducer(initialState, setAppContextInitialState())
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })
      expect(appContextSelector(rootState)).toEqual(initialState)
    })
  })

  describe('setAppContextConnectedDatabaseId', () => {
    it('should properly set id', () => {
      // Arrange
      const contextDatabaseId = '12312-3123'
      const state = {
        ...initialState,
        contextDatabaseId,
      }

      // Act
      const nextState = reducer(initialState, setAppContextConnectedDatabaseId(contextDatabaseId))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextSelector(rootState)).toEqual(state)
    })
  })

  describe('setBrowserTreeSort', () => {
    it('should properly set browser tree sorting', () => {
      // Arrange
      const sorting = SortOrder.DESC

      const state = {
        ...initialState.dbConfig,
        treeViewSort: sorting,
      }

      // Act
      const nextState = reducer(initialState, setKeysTreeSort(sorting))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextDbConfig(rootState)).toEqual(state)
    })
  })

  describe('setBrowserTreeNodesOpen', () => {
    it('should properly set open nodes in the tree', () => {
      // Arrange
      const openNodes = {
        '1o2313': true,
        eu12313: false,
      }
      const prevState = {
        ...initialState,
        keys: {
          ...initialState.keys,
          tree: {
            ...initialState.keys.tree,
            openNodes,
          },
        },
      }

      const state = {
        ...initialState.keys.tree,
        openNodes,
      }

      // Act
      const nextState = reducer(prevState, setKeysTreeNodesOpen(openNodes))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextKeysTree(rootState)).toEqual(state)
    })
  })

  describe('resetBrowserTree', () => {
    it('should properly set last page', () => {
      // Arrange
      const prevState = {
        ...initialState,
        keys: {
          ...initialState.keys,
          tree: {
            ...initialState.keys.tree,
            openNodes: {
              test: true,
            },
            selectedLeaf: 'test',
          },
        },
      }
      const state = {
        ...initialState.keys.tree,
        openNodes: {},
        selectedLeaf: null,
      }

      // Act
      const nextState = reducer(prevState, resetKeysTree())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextKeysTree(rootState)).toEqual(state)
    })
  })

  describe('setKeysTreeDelimiter', () => {
    it('should properly set browser tree delimiter', () => {
      // Arrange
      const delimiter = '_'

      const state = {
        ...initialState.dbConfig,
        treeViewDelimiter: delimiter,
      }

      // Act
      const nextState = reducer(initialState, setKeysTreeDelimiter(delimiter))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextDbConfig(rootState)).toEqual(state)
    })
  })

  describe('setDbConfig', () => {
    it('should properly set db config', () => {
      // Arrange
      const data = {
        treeViewDelimiter: ':-',
        treeViewSort: SortOrder.DESC,
      }

      const state = {
        ...initialState.dbConfig,
        ...data,
      }

      // Act
      const nextState = reducer(initialState, setDbConfig(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { context: nextState },
      })

      expect(appContextDbConfig(rootState)).toEqual(state)
    })
  })
})
