import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { DEFAULT_DELIMITER, DEFAULT_TREE_SORTING, KeyTypes, SortOrder, StorageItem } from 'uiSrc/constants'
import { RootState } from 'uiSrc/store'
import { localStorageService, setDBConfigStorageField } from 'uiSrc/services'
import { RelativeWidthSizes } from 'uiSrc/components/virtual-table/interfaces'
import { OpenNodes, StateAppContext } from './interface'

export const initialState: StateAppContext = {
  contextDatabaseId: '',
  lastPage: '',
  dbConfig: {
    treeViewDelimiter: DEFAULT_DELIMITER,
    treeViewSort: DEFAULT_TREE_SORTING,
  },
  keys: {
    tree: {
      delimiter: DEFAULT_DELIMITER,
      openNodes: {},
      selectedLeaf: null,
    },
  },
  browser: {
    keyDetailsSizes: {
      [KeyTypes.Hash]: localStorageService?.get(StorageItem.keyDetailSizes)?.hash ?? null,
      [KeyTypes.List]: localStorageService?.get(StorageItem.keyDetailSizes)?.list ?? null,
      [KeyTypes.ZSet]: localStorageService?.get(StorageItem.keyDetailSizes)?.zset ?? null,
    },
  },
}

// A slice for recipes
const appContextSlice = createSlice({
  name: 'appContext',
  initialState,
  reducers: {
    // don't need to reset databaseId
    setAppContextInitialState: (state) => ({
      ...initialState,
      contextDatabaseId: state.contextDatabaseId,
    }),
    // set connected database
    setAppContextConnectedDatabaseId: (state, { payload }: PayloadAction<string>) => {
      state.contextDatabaseId = payload
    },
    setDbConfig: (state, { payload }) => {
      state.dbConfig.treeViewDelimiter = payload?.treeViewDelimiter ?? DEFAULT_DELIMITER
      state.dbConfig.treeViewSort = payload?.treeViewSort ?? DEFAULT_TREE_SORTING
    },
    setKeysTreeDelimiter: (state, { payload }: PayloadAction<string>) => {
      state.dbConfig.treeViewDelimiter = payload
      setDBConfigStorageField(state.contextDatabaseId, StorageItem.treeViewDelimiter, payload)
    },
    setKeysTreeSort: (state, { payload }: PayloadAction<SortOrder>) => {
      state.dbConfig.treeViewSort = payload
      setDBConfigStorageField(state.contextDatabaseId, StorageItem.treeViewSort, payload)
    },
    setKeysTreeNodesOpen: (state, { payload }: PayloadAction<OpenNodes>) => {
      state.keys.tree.openNodes = payload
    },
    resetKeysTree: (state) => {
      state.keys.tree.selectedLeaf = null
      state.keys.tree.openNodes = {}
    },
    updateKeyDetailsSizes: (
      state,
      { payload: { type, sizes } }: PayloadAction<{ type: KeyTypes, sizes: RelativeWidthSizes }>,
    ) => {
      state.browser.keyDetailsSizes[type] = sizes
      localStorageService?.set(StorageItem.keyDetailSizes, state.browser.keyDetailsSizes)
    },
  },
})

// Actions generated from the slice
export const {
  setAppContextInitialState,
  setAppContextConnectedDatabaseId,
  setDbConfig,
  setKeysTreeDelimiter,
  resetKeysTree,
  setKeysTreeSort,
  setKeysTreeNodesOpen,
  updateKeyDetailsSizes,
} = appContextSlice.actions

// Selectors
export const appContextSelector = (state: RootState) =>
  state.app.context
export const appContextDbConfig = (state: RootState) =>
  state.app.context.dbConfig
export const appContextKeys = (state: RootState) =>
  state.app.context.keys
export const appContextKeysTree = (state: RootState) =>
  state.app.context.keys.tree
export const appContextBrowserKeyDetails = (state: RootState) =>
  state.app.context.browser.keyDetailsSizes

// The reducer
export default appContextSlice.reducer
