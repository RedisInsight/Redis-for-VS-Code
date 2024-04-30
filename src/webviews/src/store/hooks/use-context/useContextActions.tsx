import { StateCreator } from 'zustand'

import { initialContextState } from 'uiSrc/store'
import { StorageItem } from 'uiSrc/constants'
import { localStorageService, setDBConfigStorageField } from 'uiSrc/services'
import { AppContextStore, AppContextActions } from './interface'

export const createContextActions: StateCreator<
AppContextStore & AppContextActions,
[],
[],
AppContextStore & AppContextActions
> = (set) => ({
  ...initialContextState,

  // actions
  setKeysTreeSort: (databaseId, sort) => set((state) => {
    state.dbConfig.treeViewSort = sort
    setDBConfigStorageField(databaseId, StorageItem.treeViewSort, sort)

    return state
  }),
  setKeysTreeNodesOpen: (nodes) => set((state) => {
    state.keys.tree.openNodes = nodes
    return state
  }),
  resetKeysTree: () => set((state) => {
    state.keys.tree.selectedLeaf = null
    state.keys.tree.openNodes = {}
    return state
  }),
  updateKeyDetailsSizes: ({ type, sizes }) => set((state) => {
    state.browser.keyDetailsSizes[type] = sizes
    localStorageService?.set(StorageItem.keyDetailSizes, state.browser.keyDetailsSizes)
    return state
  }),

  setViewFormat: (viewFormat) => set((state) => {
    state.browser.viewFormat = viewFormat
    localStorageService?.set(StorageItem.viewFormat, viewFormat)
    return state
  }),
})
