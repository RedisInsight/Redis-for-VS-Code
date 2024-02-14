import React, {
  createContext,
  useContext,
  useRef,
  PropsWithChildren,
} from 'react'
import { createStore } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { useStoreWithEqualityFn } from 'zustand/traditional'

import { ExtractState, ZustandStore } from 'uiSrc/store'
import { DEFAULT_DELIMITER, DEFAULT_TREE_SORTING, KeyTypes, StorageItem } from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { AppContextStore, AppContextActions } from './interface'
import { createContextActions } from './useContextActions'

type StoreType = ZustandStore<AppContextStore & AppContextActions>

export const initialContextState: AppContextStore = {
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

const StoreContext = createContext<StoreType>(null!)
export const ContextStoreProvider = ({ children }: PropsWithChildren) => {
  const storeRef = useRef<StoreType>()
  if (!storeRef.current) {
    // the main useContextStore
    storeRef.current = createStore<AppContextStore & AppContextActions>()(immer(devtools((...a) => ({
      ...createContextActions(...a),
    }))))
  }
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  )
}

export function useContextInContext<U>(
  selector: (state: ExtractState<StoreType>) => U,
) {
  const store = useContext(StoreContext)
  if (!store) {
    console.error('Missing StoreProvider')
  }
  return useStoreWithEqualityFn(store, selector)
}
export const useContextApi = () =>
  useContext(StoreContext).getState()

export const useContextFullApi = () =>
  useContext(StoreContext)
