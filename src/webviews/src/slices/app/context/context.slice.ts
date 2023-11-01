import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { DEFAULT_DELIMITER, DEFAULT_TREE_SORTING, SortOrder, StorageItem } from 'uiSrc/constants'
import { RootState } from 'uiSrc/store'
import { setDBConfigStorageField } from 'uiSrc/services'
import { StateAppContext } from './interface'

export const initialState: StateAppContext = {
  contextInstanceId: '',
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
}

// A slice for recipes
const appContextSlice = createSlice({
  name: 'appContext',
  initialState,
  reducers: {
    // don't need to reset instanceId
    setAppContextInitialState: (state) => ({
      ...initialState,
      contextInstanceId: state.contextInstanceId,
    }),
    // set connected instance
    setAppContextConnectedInstanceId: (state, { payload }: PayloadAction<string>) => {
      state.contextInstanceId = payload
    },
    setDbConfig: (state, { payload }) => {
      state.dbConfig.treeViewDelimiter = payload?.treeViewDelimiter ?? DEFAULT_DELIMITER
      state.dbConfig.treeViewSort = payload?.treeViewSort ?? DEFAULT_TREE_SORTING
    },
    setKeysTreeDelimiter: (state, { payload }: PayloadAction<string>) => {
      state.dbConfig.treeViewDelimiter = payload
      setDBConfigStorageField(state.contextInstanceId, StorageItem.treeViewDelimiter, payload)
    },
    setKeysTreeSort: (state, { payload }: PayloadAction<SortOrder>) => {
      state.dbConfig.treeViewSort = payload
      setDBConfigStorageField(state.contextInstanceId, StorageItem.treeViewSort, payload)
    },
    setKeysTreeNodesOpen: (state, { payload }: PayloadAction<{ [key: string]: boolean }>) => {
      state.keys.tree.openNodes = payload
    },
    resetKeysTree: (state) => {
      state.keys.tree.selectedLeaf = null
      state.keys.tree.openNodes = {}
    },
  },
})

// Actions generated from the slice
export const {
  setAppContextInitialState,
  setAppContextConnectedInstanceId,
  setDbConfig,
  setKeysTreeDelimiter,
  resetKeysTree,
  setKeysTreeSort,
  setKeysTreeNodesOpen,
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

// The reducer
export default appContextSlice.reducer
