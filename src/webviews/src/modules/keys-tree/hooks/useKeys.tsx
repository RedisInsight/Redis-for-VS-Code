import React, {
  createContext,
  useContext,
  useRef,
  PropsWithChildren,
} from 'react'
import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import { createStore } from 'zustand'
import { useStoreWithEqualityFn } from 'zustand/traditional'

import { ExtractState, ZustandStore } from 'uiSrc/store'
import { KeysStore, KeysActions, KeysThunks } from './interface'
import { createKeysActionsSlice } from './useKeysActions'
import { createKeysThunksSlice } from './useKeysThunks'

type StoreType = ZustandStore<KeysStore & KeysActions & KeysThunks>

const StoreContext = createContext<StoreType>(null!)
export const KeysStoreProvider = ({ children }: PropsWithChildren) => {
  const storeRef = useRef<StoreType>()
  if (!storeRef.current) {
    // the main useKeysStore
    storeRef.current = createStore<KeysStore & KeysActions & KeysThunks>()(immer(devtools((...a) => ({
      ...createKeysActionsSlice(...a),
      ...createKeysThunksSlice(...a),
    }))))
  }
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  )
}

export function useKeysInContext<U>(
  selector: (state: ExtractState<StoreType>) => U,
) {
  const store = useContext(StoreContext)
  if (!store) {
    console.error('Missing StoreProvider')
  }
  return useStoreWithEqualityFn(store, selector)
}
export const useKeysApi = () =>
  useContext(StoreContext)
