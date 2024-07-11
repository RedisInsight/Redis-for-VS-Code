import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import { create } from 'zustand'

import { localStorageService } from 'uiSrc/services'
import { StorageItem } from 'uiSrc/constants'
import { CliOutputStore, CliOutputActions } from '../interface'

export const initialCliOutputState: CliOutputStore = {
  data: [],
  loading: false,
  error: '',
  db: 0,
  commandHistory: [],
}

export const useCliOutputStore = create<CliOutputStore & CliOutputActions>()(immer(devtools((set) => ({
  ...initialCliOutputState,
  // actions
  setInitialState: () => set({
    commandHistory: localStorageService?.get(StorageItem.cliInputHistory) ?? [],
  }),
  sendCliCommand: () => set({ loading: true }),
  sendCliCommandFailure: (error) => set({ error, loading: false }),
  sendCliCommandFinal: () => set({ loading: false }),

  setOutput: (data) => set({ data }),
  concatToOutput: (data) => set((state) => ({
    data: state.data.concat(data),
  })),

  updateCliCommandHistory: (commandHistory) => set(() => ({ commandHistory })),

  resetOutput: () => set({ data: [], loading: false }),

  setCliDbIndex: (db) => set({ db }),
}))))
