import { createStore } from 'zustand'
import * as modules from 'uiSrc/modules'
import { SortOrder } from 'uiSrc/constants'
import { constants } from 'testSrc/helpers'
import {
  initialContextState as initialStateInit,
} from './useContext'
import { AppContextActions, AppContextStore } from './interface'
import { createContextActions } from './useContextActions'

vi.spyOn(modules, 'fetchString')

const useContextStore = createStore<AppContextStore & AppContextActions>()((...a) => ({
  ...createContextActions(...a),
}))

beforeEach(() => {
  useContextStore.setState(initialStateInit)
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useContextStore', () => {
  describe('setKeysTreeSort', () => {
    it('should properly set browser tree sorting', () => {
      // Arrange
      const sorting = SortOrder.DESC
      expect(useContextStore.getState().dbConfig.treeViewSort).toEqual(SortOrder.ASC)
      useContextStore.getState().setKeysTreeSort(constants.DATABASE_ID, sorting)

      expect(useContextStore.getState().dbConfig.treeViewSort).toEqual(sorting)
    })
  })

  describe('setKeysTreeNodesOpen', () => {
    it('should properly set open nodes in the tree', () => {
      // Arrange
      const openNodes = {
        '1o2313': true,
        eu12313: false,
      }

      expect(useContextStore.getState().keys.tree.openNodes).toEqual({})
      useContextStore.getState().setKeysTreeNodesOpen(openNodes)

      expect(useContextStore.getState().keys.tree.openNodes).toEqual(openNodes)
    })
  })

  describe('resetKeysTree', () => {
    it('should properly set last page', () => {
      // Arrange
      const openNodes = {
        test: true,
      }
      const selectedLeaf = 'test'

      useContextStore.setState((state) => ({
        ...state,
        keys: {
          ...state.keys,
          tree: {
            openNodes, selectedLeaf,
          },
        },
      }))
      useContextStore.getState().resetKeysTree()

      expect(useContextStore.getState().keys.tree.selectedLeaf).toEqual(null)
      expect(useContextStore.getState().keys.tree.openNodes).toEqual({})
    })
  })
})
