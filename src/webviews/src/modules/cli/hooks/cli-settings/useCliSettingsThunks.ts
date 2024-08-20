import { AxiosError } from 'axios'

import { apiService, sessionStorageService } from 'uiSrc/services'
import {
  ApiEndpoints,
  cliTexts,
  ConnectionSuccessOutputText,
  StorageItem,
  InitOutputText,
} from 'uiSrc/constants'
import {
  getApiErrorMessage,
  isStatusSuccessful,
  getUrl,
  getDatabaseUrl,
} from 'uiSrc/utils'
import { Database, useDatabasesStore } from 'uiSrc/store'
import { useCliSettingsStore } from './useCliSettingsStore'
import { useCliOutputStore } from '../cli-output/useCliOutputStore'

// Asynchronous thunk action
export function createCliClientAction(
  database: Database,
  onSuccessAction?: () => void,
  onFailAction?: (message: string) => void,
) {
  return useCliSettingsStore.setState(async (state) => {
    const { data: outputData, concatToOutput, setCliDbIndex } = useCliOutputStore.getState()

    if (outputData.length) return
    const { host, port, db, id } = database
    state.processCliClient()
    concatToOutput(InitOutputText(host, port, db, !outputData.length))

    try {
      const { data, status } = await apiService.post<any>(
        getDatabaseUrl(id, ApiEndpoints.CLI),
      )

      if (isStatusSuccessful(status)) {
        sessionStorageService.set(StorageItem.cliClientUuid, data?.uuid)
        state.processCliClientSuccess(data?.uuid)
        concatToOutput(ConnectionSuccessOutputText)
        setCliDbIndex(db!!)

        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      state.processCliClientFailure(errorMessage)
      concatToOutput(cliTexts.CLI_ERROR_MESSAGE(errorMessage))
      onFailAction?.(errorMessage)
    } finally {
      state.processCliClientFinal()
    }
  })
}

// Asynchronous thunk action
export function updateCliClientAction(
  uuid: string,
  onSuccessAction?: () => void,
  onFailAction?: (message: string) => void,
) {
  return useCliSettingsStore.setState(async (state) => {
    state.processCliClient()

    try {
      const { data, status } = await apiService.patch<any>(
        getUrl(ApiEndpoints.CLI, uuid),
      )

      if (isStatusSuccessful(status)) {
        state.processCliClientSuccess(data?.uuid)

        useCliOutputStore.getState().setCliDbIndex(useDatabasesStore.getState().connectedDatabase?.db || 0)
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      state.processCliClientFailure(errorMessage)
      onFailAction?.(errorMessage)
    } finally {
      state.processCliClientFinal()
    }
  })
}

// Asynchronous thunk action
export function deleteCliClientAction(
  uuid: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return useCliSettingsStore.setState(async (state) => {
    state.processCliClient()

    try {
      const { status } = await apiService.delete<any>(
        getUrl(ApiEndpoints.CLI, uuid),
      )

      if (isStatusSuccessful(status)) {
        state.deleteCliClientSuccess()
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      state.processCliClientFailure(errorMessage)
      onFailAction?.()
    } finally {
      state.processCliClientFinal()
    }
  })
}

// Asynchronous thunk action
export function resetCliSettingsAction(
  onSuccessAction?: () => void,
) {
  return useCliSettingsStore.setState(async (state) => {
    const cliClientUuid = sessionStorageService.get(StorageItem.cliClientUuid) ?? ''

    state.resetCliSettings()
    cliClientUuid && deleteCliClientAction(cliClientUuid, onSuccessAction)
  })
}

// Asynchronous thunk action
export function fetchBlockingCliCommandsAction(
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return useCliSettingsStore.setState(async (state) => {
    state.processCliClient()

    try {
      const { data, status } = await apiService.get<string[]>(ApiEndpoints.CLI_BLOCKING_COMMANDS)

      if (isStatusSuccessful(status)) {
        state.getBlockingCommandsSuccess(data)
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      state.processCliClientFailure(errorMessage)
      onFailAction?.()
    }
  })
}

// Asynchronous thunk action
export function fetchUnsupportedCliCommandsAction(
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return useCliSettingsStore.setState(async (state) => {
    state.processCliClient()

    try {
      const { data, status } = await apiService.get<string[]>(
        ApiEndpoints.CLI_UNSUPPORTED_COMMANDS,
      )

      if (isStatusSuccessful(status)) {
        state.getUnsupportedCommandsSuccess(data)
        onSuccessAction?.()
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      state.processCliClientFailure(errorMessage)
      onFailAction?.()
    }
  })
}

// async thunk function
function updateCliHistory() {
  return useCliSettingsStore.setState(async (state) => {
    const instanceIndex = state.cliConnectionsHistory.findIndex(({ id }) => id === state.activeCliId)
    const historyCopy = [...state.cliConnectionsHistory]
    historyCopy[instanceIndex] = { ...historyCopy[instanceIndex], cliHistory: useCliOutputStore.getState().data }
    state.updateCliConnectionsHistory(historyCopy)
  })
}

// async thunk function
export function addCli() {
  updateCliHistory()
  useCliOutputStore.getState().resetOutput()
  useCliSettingsStore.getState().resetCliClientUuid()
}

// async thunk function
export function selectCli(
  uuid: string,
) {
  return useCliSettingsStore.setState(async (state) => {
    const history = state.cliConnectionsHistory.find(({ id }) => id === uuid)?.cliHistory
    updateCliHistory()
    state.setActiveCliId(uuid)
    useCliOutputStore.getState().setOutput(history as any[])
    state.processCliClientSuccess(uuid)
  })
}

// async thunk function
export function deleteCli(
  uuid: string,
) {
  return useCliSettingsStore.setState(async (state) => {
    const filteredHistory = state.cliConnectionsHistory.filter(({ id }) => id !== uuid)
    state.updateCliConnectionsHistory(filteredHistory)

    if (uuid === state.activeCliId) {
      deleteCliClientAction(
        uuid,
        async () => selectCli(filteredHistory[0].id),
      )
    } else {
      deleteCliClientAction(
        uuid,
        async () => state.processCliClientSuccess(state.activeCliId),
      )
    }
  })
}

export function closeAllCliConnections() {
  return useCliSettingsStore.setState(async (state) => {
    state.cliConnectionsHistory.forEach(({ id }) =>
      deleteCliClientAction(id))
    state.setActiveCliId('')
    state.updateCliConnectionsHistory([])
  })
}
