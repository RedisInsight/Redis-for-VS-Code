import { create } from 'zustand'

import { immer } from 'zustand/middleware/immer'
import { devtools } from 'zustand/middleware'
import { CliSettingsStore, CliSettingsActions } from '../interface'

export const initialCliSettingsState: CliSettingsStore = {
  isMinimizedHelper: false,
  isShowHelper: false,
  isShowCli: false,
  loading: false,
  errorClient: '',
  cliClientUuid: '',
  matchedCommand: '',
  searchedCommand: '',
  searchingCommand: '',
  searchingCommandFilter: '',
  isEnteringCommand: false,
  isSearching: false,
  unsupportedCommands: [],
  blockingCommands: [],
  activeCliId: '',
  cliConnectionsHistory: [],
}

export const useCliSettingsStore = create<CliSettingsStore & CliSettingsActions>()(immer(devtools((set) => ({
  ...initialCliSettingsState,
  // actions
  setMatchedCommand: (matchedCommand: string) => set({ matchedCommand, isSearching: false }),
  setCliEnteringCommand: () => set({ isEnteringCommand: true }),
  setSearchedCommand: (searchedCommand: string) => set({ searchedCommand, isSearching: false }),

  processCliClient: () => set({ loading: true }),
  processCliClientSuccess: (cliClientUuid: string) => set({ cliClientUuid, errorClient: '' }),
  processCliClientFailure: (errorClient: string) => set({ errorClient }),
  processCliClientFinal: () => set({ loading: false }),

  deleteCliClientSuccess: () => set({ loading: false, cliClientUuid: '' }),

  getUnsupportedCommandsSuccess: (data) => set({ loading: false, unsupportedCommands: data.map((command) => command.toLowerCase()) }),
  getBlockingCommandsSuccess: (data) => set({ loading: false, blockingCommands: data.map((command) => command.toLowerCase()) }),

  resetCliClientUuid: () => set({ cliClientUuid: '' }),
  resetCliSettings: () => set({ loading: false, cliClientUuid: '' }),
  goBackFromCommand: () => set({
    isSearching: true, matchedCommand: '', searchedCommand: '',
  }),

  clearSearchingCommand: () => set({
    searchingCommand: '', searchedCommand: '', isSearching: false, searchingCommandFilter: '',
  }),

  setActiveCliId: (activeCliId: string) => set({ activeCliId }),

  addCliConnectionsHistory: (data) => set((state) => ({ cliConnectionsHistory: state.cliConnectionsHistory.concat({ ...data }) })),
  updateCliConnectionsHistory: (cliConnectionsHistory) => set({ cliConnectionsHistory }),
  removeFromCliConnectionsHistory: ({ id: historyId }) => set((state) => ({ cliConnectionsHistory: state.cliConnectionsHistory.filter(
    ({ id }) => id !== historyId,
  ) })),
}))))
