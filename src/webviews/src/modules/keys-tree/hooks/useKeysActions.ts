import { StateCreator } from 'zustand'
import { isNull, remove } from 'lodash'

import { isEqualBuffers } from 'uiSrc/utils'
import { KeysStore, KeysActions } from './interface'

export const initialKeysState: KeysStore = {
  databaseId: null,
  deleting: false,
  loading: false,
  filter: null,
  search: '',
  isSearched: false,
  isFiltered: false,
  data: {
    total: 0,
    scanned: 0,
    nextCursor: '0',
    keys: [],
    shardsMeta: {},
    previousResultCount: 0,
    lastRefreshTime: null,
  },
  addKeyLoading: false,
}

export const createKeysActionsSlice: StateCreator<
KeysStore & KeysActions,
[],
[],
KeysStore & KeysActions
> = (set) => ({
  ...initialKeysState,
  // actions
  loadKeys: () => set({ loading: true }),
  loadKeysFinal: () => set({ loading: false }),

  loadKeysSuccess: (data) => set(() => ({
    data: {
      ...data,
      previousResultCount: data.keys?.length,
      lastRefreshTime: Date.now(),
    },
  })),

  loadMoreKeysSuccess: ({ total, scanned, nextCursor, keys, shardsMeta }) => set((state) => ({
    loading: false,
    data: {
      ...state.data,
      total,
      scanned,
      nextCursor,
      shardsMeta,
      previousResultCount: keys.length,
      keys: state.data.keys.concat(keys),
    },
  })),

  deleteKey: () => set({ deleting: true }),
  deleteKeyFinal: () => set({ deleting: false }),
  deleteKeyFromTree: (keyProp) => set((state) => {
    if (state.data?.keys.length === 0) {
      return state
    }
    remove(state.data?.keys, (key) => isEqualBuffers(key.name, keyProp))

    state.data.total = !isNull(state.data.total) ? state.data.total - 1 : null
    state.data.scanned -= 1

    return state
  }),

  // Add Key
  addKey: () => set({ loading: true }),
  addKeyFinal: () => set({ loading: false }),

  addKeySuccess: (data) => set((state) => ({
    data: {
      ...state.data,
      previousResultCount: data.keys?.length,
      lastRefreshTime: Date.now(),
    },
  })),

  addKeyToTree: (key, type) => set((state) => {
    state.data?.keys.unshift({ name: key, type })

    state.data = {
      ...state.data,
      total: isNull(state.data.total) ? null : state.data.total + 1,
      scanned: state.data.scanned + 1,
    }
    return state
  }),

  resetAddKey: () => set({ addKeyLoading: false }),

  setDatabaseId: (databaseId) => set({ databaseId }),
})
