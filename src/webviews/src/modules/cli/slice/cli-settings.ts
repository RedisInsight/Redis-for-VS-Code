import { createSlice } from '@reduxjs/toolkit'

import { AxiosError } from 'axios'
import { find } from 'lodash'
import { apiService, sessionStorageService } from 'uiSrc/services'
import { ApiEndpoints, StorageItem, cliTexts, ConnectionSuccessOutputText, InitOutputText } from 'uiSrc/constants'
import { getApiErrorMessage, getUrl, getDatabaseUrl, isStatusSuccessful } from 'uiSrc/utils'
import { AppDispatch, RootState, Database, useDatabasesStore } from 'uiSrc/store'
import { ConnectionHistory, StateCliSettings } from 'uiSrc/interfaces'
import { outputSelector, setOutput, concatToOutput, setCliDbIndex, resetOutput } from './cli-output'
// import { CreateCliClientResponse, DeleteClientResponse } from 'apiSrc/modules/cli/dto/cli.dto'

export const initialState: StateCliSettings = {
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

// A slice for recipes
const cliSettingsSlice = createSlice({
  name: 'cliSettings',
  initialState,
  reducers: {
    setCliSettingsInitialState: () => initialState,
    // collapse / uncollapse CLI
    openCli: (state) => {
      state.isShowCli = true
    },

    openCliHelper: (state) => {
      state.isShowHelper = true
    },
    // collapse / uncollapse CLI Helper
    toggleCliHelper: (state) => {
      state.isShowHelper = !state.isShowHelper
      state.isMinimizedHelper = !state.isMinimizedHelper
    },
    // hide / unhide CLI Helper
    toggleHideCliHelper: (state) => {
      state.isMinimizedHelper = !state.isMinimizedHelper
    },

    setMatchedCommand: (state, { payload }: { payload: string }) => {
      state.matchedCommand = payload
      state.isSearching = false
    },

    setCliEnteringCommand: (state) => {
      state.isEnteringCommand = true
    },

    setSearchedCommand: (state, { payload }: { payload: string }) => {
      state.searchedCommand = payload
      state.isSearching = false
    },

    setSearchingCommand: (state, { payload }: { payload: string }) => {
      state.searchingCommand = payload
      state.isSearching = true
      state.isEnteringCommand = false
    },

    setSearchingCommandFilter: (state, { payload }: { payload: string }) => {
      state.searchingCommandFilter = payload
      state.isSearching = true
      state.isEnteringCommand = false
    },

    clearSearchingCommand: (state) => {
      state.searchingCommand = ''
      state.searchedCommand = ''
      state.searchingCommandFilter = ''
      state.isSearching = false
    },

    // create, update, delete CLI Client
    processCliClient: (state) => {
      state.loading = true
    },
    processCliClientSuccess: (state, { payload }: { payload: string }) => {
      state.loading = false
      state.cliClientUuid = payload

      state.errorClient = ''
    },
    processCliClientFailure: (state, { payload }) => {
      state.loading = false
      state.errorClient = payload
    },

    deleteCliClientSuccess: (state) => {
      state.loading = false
      state.cliClientUuid = ''
    },

    getUnsupportedCommandsSuccess: (state, { payload }: { payload: string[] }) => {
      state.loading = false
      state.unsupportedCommands = payload.map((command) => command.toLowerCase())
    },

    getBlockingCommandsSuccess: (state, { payload }: { payload: string[] }) => {
      state.loading = false
      state.blockingCommands = payload.map((command) => command.toLowerCase())
    },

    // reset cli client uuid
    resetCliClientUuid: (state) => {
      state.cliClientUuid = ''
    },

    // reset to collapse CLI
    resetCliSettings: (state) => {
      state.isShowCli = false
      state.cliClientUuid = ''
      state.loading = false
    },

    // reset to collapse CLI Helper
    resetCliHelperSettings: (state) => {
      state.isShowHelper = false
      state.isSearching = false
      state.isEnteringCommand = false
      state.isMinimizedHelper = false
      state.matchedCommand = ''
      state.searchingCommand = ''
      state.searchedCommand = ''
      state.searchingCommandFilter = ''
    },

    goBackFromCommand: (state) => {
      state.matchedCommand = ''
      state.searchedCommand = ''
      state.isSearching = true
    },

    setActiveCliId: (state, { payload }: { payload: string }) => {
      state.activeCliId = payload
    },

    addCliConnectionsHistory: (state, { payload }: { payload: ConnectionHistory }) => {
      state.cliConnectionsHistory = state.cliConnectionsHistory.concat({ ...payload })
    },

    updateCliConnectionsHistory: (state, { payload }: { payload: ConnectionHistory[] }) => {
      state.cliConnectionsHistory = payload
    },

    removeFromCliConnectionsHistory: (state, { payload }: { payload: ConnectionHistory }) => {
      state.cliConnectionsHistory = state.cliConnectionsHistory.filter(
        ({ id }) => id !== payload.id,
      )
    },
  },
})

// Actions generated from the slice
export const {
  setCliSettingsInitialState,
  openCli,
  openCliHelper,
  toggleCliHelper,
  toggleHideCliHelper,
  setMatchedCommand,
  setSearchedCommand,
  setSearchingCommand,
  setSearchingCommandFilter,
  clearSearchingCommand,
  setCliEnteringCommand,
  processCliClient,
  processCliClientSuccess,
  processCliClientFailure,
  deleteCliClientSuccess,
  resetCliClientUuid,
  resetCliSettings,
  resetCliHelperSettings,
  getUnsupportedCommandsSuccess,
  getBlockingCommandsSuccess,
  goBackFromCommand,
  setActiveCliId,
  addCliConnectionsHistory,
  updateCliConnectionsHistory,
  removeFromCliConnectionsHistory,
} = cliSettingsSlice.actions

// A selector
export const cliSettingsSelector = (state: RootState) => state.cli.settings
export const cliUnsupportedCommandsSelector = (state: RootState, exclude: string[] = []): string[] =>
  state.cli.settings.unsupportedCommands.filter((command: string) => !exclude.includes(command.toLowerCase()))

// The reducer
export default cliSettingsSlice.reducer

// Asynchronous thunk action
const checkCliHistory = (id: string, database: Database) => async (dispatch: AppDispatch, stateInit: () => RootState) => {
  const state = stateInit()
  const matchedInstanceInHistory = find(state.cli.settings.cliConnectionsHistory, { id })
  // Check if incomming connection is new
  if (!matchedInstanceInHistory) {
    const { name, host, port } = database
    const connectionInstance = { id, name: name || `${host}:${port}`, cliHistory: [] }
    dispatch(addCliConnectionsHistory(connectionInstance))
    dispatch(setActiveCliId(id))
    // Check if connection is already selected
  } else if (state.cli.settings.activeCliId !== id) {
    dispatch(setActiveCliId(id))
  }
}

// Asynchronous thunk action
export function createCliClientAction(
  database: Database,
  onSuccessAction?: () => void,
  onFailAction?: (message: string) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    if (state.cli.output.data.length) return
    const { host, port, db, id } = database
    const { data = [] } = outputSelector?.(state) ?? {}
    dispatch(processCliClient())
    dispatch(concatToOutput(InitOutputText(host, port, db, !data.length)))

    try {
      const { data, status } = await apiService.post<any>(
        getDatabaseUrl(id, ApiEndpoints.CLI),
      )

      if (isStatusSuccessful(status)) {
        sessionStorageService.set(StorageItem.cliClientUuid, data?.uuid)
        // dispatch(checkCliHistory(data?.uuid, database))
        dispatch(processCliClientSuccess(data?.uuid))
        dispatch(concatToOutput(ConnectionSuccessOutputText))
        dispatch(setCliDbIndex(db))

        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(processCliClientFailure(errorMessage))
      dispatch(concatToOutput(cliTexts.CLI_ERROR_MESSAGE(errorMessage)))
      onFailAction?.(errorMessage)
    }
  }
}

// Asynchronous thunk action
export function updateCliClientAction(
  uuid: string,
  onSuccessAction?: () => void,
  onFailAction?: (message: string) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(processCliClient())

    try {
      const state = stateInit()
      const { data, status } = await apiService.patch<any>(
        getUrl(ApiEndpoints.CLI, uuid),
      )

      if (isStatusSuccessful(status)) {
        dispatch(processCliClientSuccess(data?.uuid))
        dispatch(setCliDbIndex(state.connections?.databases?.connectedDatabase?.db || 0))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(processCliClientFailure(errorMessage))
      onFailAction?.(errorMessage)
    }
  }
}

// Asynchronous thunk action
export function deleteCliClientAction(
  uuid: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(processCliClient())

    try {
      const { status } = await apiService.delete<any>(
        getUrl(ApiEndpoints.CLI, uuid),
      )

      if (isStatusSuccessful(status)) {
        dispatch(deleteCliClientSuccess())
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(processCliClientFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function resetCliSettingsAction(
  onSuccessAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    const cliClientUuid = sessionStorageService.get(StorageItem.cliClientUuid) ?? ''

    dispatch(resetCliSettings())
    cliClientUuid && dispatch(deleteCliClientAction(cliClientUuid, onSuccessAction))
  }
}

// Asynchronous thunk action
export function fetchBlockingCliCommandsAction(
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(processCliClient())

    try {
      const { data, status } = await apiService.get<string[]>(ApiEndpoints.CLI_BLOCKING_COMMANDS)

      if (isStatusSuccessful(status)) {
        dispatch(getBlockingCommandsSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(processCliClientFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function fetchUnsupportedCliCommandsAction(
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(processCliClient())

    try {
      const { data, status } = await apiService.get<string[]>(
        ApiEndpoints.CLI_UNSUPPORTED_COMMANDS,
      )

      if (isStatusSuccessful(status)) {
        dispatch(getUnsupportedCommandsSuccess(data))
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(processCliClientFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// async thunk function
function updateCliHistory() {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    const instanceIndex = state.cli.settings.cliConnectionsHistory.findIndex(({ id }) => id === state.cli.settings.activeCliId)
    const historyCopy = [...state.cli.settings.cliConnectionsHistory]
    historyCopy[instanceIndex] = { ...historyCopy[instanceIndex], cliHistory: state.cli.output.data }
    dispatch(updateCliConnectionsHistory(historyCopy))
  }
}

// async thunk function
export function addCli(database: Database) {
  return async (dispatch: AppDispatch) => {
    dispatch(updateCliHistory())
    dispatch(resetOutput())
    dispatch(createCliClientAction(database))
  }
}

// async thunk function
export function selectCli(
  uuid: string,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    const history = state.cli.settings.cliConnectionsHistory.find(({ id }) => id === uuid)?.cliHistory
    dispatch(updateCliHistory())
    dispatch(setActiveCliId(uuid))
    dispatch(setOutput(history as any[]))
    dispatch(processCliClientSuccess(uuid))
  }
}

// async thunk function
export function deleteCli(
  uuid: string,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()

    const filteredHistory = state.cli.settings.cliConnectionsHistory.filter(({ id }) => id !== uuid)
    dispatch(updateCliConnectionsHistory(filteredHistory))

    if (uuid === state.cli.settings.activeCliId) {
      dispatch(deleteCliClientAction(
        uuid,
        async () => dispatch(selectCli(filteredHistory[0].id)),
      ))
    } else {
      dispatch(deleteCliClientAction(
        uuid,
        async () => dispatch(processCliClientSuccess(state.cli.settings.activeCliId)),
      ))
    }
  }
}

export function closeAllCliConnections() {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    state.cli.settings.cliConnectionsHistory.forEach(({ id }) =>
      dispatch(deleteCliClientAction(id)))
    dispatch(setActiveCliId(''))
    dispatch(updateCliConnectionsHistory([]))
  }
}
