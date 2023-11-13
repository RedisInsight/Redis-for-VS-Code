import { AxiosError, AxiosResponseHeaders } from 'axios'
import { createSlice } from '@reduxjs/toolkit'

import { localStorageService } from 'uiSrc/services/storage'
import { CliOutputFormatterType, cliTexts, ConnectionSuccessOutputText, SelectCommand } from 'uiSrc/constants/cli'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, StorageItem, CommandMonitor, ApiErrors } from 'uiSrc/constants'
import {
  cliParseTextResponseWithOffset,
  cliParseTextResponseWithRedirect,
  getDbIndexFromSelectQuery,
} from 'uiSrc/utils/cliHelper'
import { getApiErrorMessage, getApiErrorName, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { cliUnsupportedCommandsSelector, updateCliClientAction } from 'uiSrc/slices/cli/cli-settings'

import { AppDispatch, RootState } from 'uiSrc/store'
import { CommandExecutionStatus, StateCliOutput } from 'uiSrc/interfaces'
// import { SendClusterCommandDto, SendClusterCommandResponse, SendCommandResponse } from 'apiSrc/modules/cli/dto/cli.dto'

// import { addErrorNotification } from '../app/notifications'

export const initialState: StateCliOutput = {
  data: [],
  loading: false,
  error: '',
  db: 0,
  commandHistory: localStorageService?.get(StorageItem.cliInputHistory) ?? [],
}

// A slice for recipes
const outputSlice = createSlice({
  name: 'output',
  initialState,
  reducers: {
    setOutputInitialState: () => initialState,

    // Concat text to Output
    concatToOutput: (state, { payload }: { payload: any[] }) => {
      state.data = state.data.concat(payload)
    },

    // Update Cli command History
    updateCliCommandHistory: (state, { payload }: { payload: string[] }) => {
      state.commandHistory = payload
    },

    // Send CLI command to API
    sendCliCommand: (state) => {
      state.loading = true
      state.error = ''
    },
    sendCliCommandSuccess: (state) => {
      state.loading = false

      state.error = ''
    },
    sendCliCommandFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    resetOutput: (state) => {
      state.data = []
      state.loading = false
    },
    resetOutputLoading: (state) => {
      state.loading = false
    },

    setCliDbIndex: (state, { payload }) => {
      state.db = payload
    },
  },
})

// Actions generated from the slice
export const {
  concatToOutput,
  setOutputInitialState,
  resetOutput,
  resetOutputLoading,
  updateCliCommandHistory,
  sendCliCommand,
  sendCliCommandSuccess,
  sendCliCommandFailure,
  setCliDbIndex,
} = outputSlice.actions

// A selector
export const outputSelector = (state: RootState) => state.cli.output

// The reducer
export default outputSlice.reducer

// Asynchronous thunk action
export function sendCliCommandAction(
  command: string = '',
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    let cliClientUuid
    try {
      const state = stateInit()
      cliClientUuid = state?.cli?.settings?.cliClientUuid
      const { id = '' } = state.connections?.instances?.connectedInstance

      if (command === '') {
        onSuccessAction?.()
        return
      }

      dispatch(sendCliCommand())

      const { data: { response, status: dataStatus }, status } = await apiService.post<any>(
        getUrl(id, ApiEndpoints.CLI, state.cli.settings?.cliClientUuid, ApiEndpoints.SEND_COMMAND),
        { command, outputFormat: CliOutputFormatterType.Raw },
      )

      if (isStatusSuccessful(status)) {
        onSuccessAction?.()
        dispatch(sendCliCommandSuccess())
        dispatch(concatToOutput(cliParseTextResponseWithOffset(response, command, dataStatus)))
        if (
          dataStatus === CommandExecutionStatus.Success
          && command.toLowerCase().startsWith(SelectCommand.toLowerCase())
        ) {
          try {
            const dbIndex = getDbIndexFromSelectQuery(command)
            dispatch(setCliDbIndex(dbIndex))
          } catch (e) {
            // continue regardless of error
          }
        }
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      const errorName = getApiErrorName(error as AxiosError)
      dispatch(sendCliCommandFailure(errorMessage))

      if (errorName === ApiErrors.ClientNotFound && cliClientUuid) {
        handleRecreateClient(dispatch, stateInit)
      } else {
        dispatch(
          concatToOutput(cliParseTextResponseWithOffset(errorMessage, command, CommandExecutionStatus.Fail)),
        )
      }
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function sendCliClusterCommandAction(
  command: string = '',
  options: any,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    let cliClientUuid
    try {
      const outputFormat = CliOutputFormatterType.Raw
      const state = stateInit()
      cliClientUuid = state?.cli?.settings?.cliClientUuid
      const { id = '' } = state.connections.instances?.connectedInstance

      if (command === '') {
        onSuccessAction?.()
        return
      }

      dispatch(sendCliCommand())

      const {
        data: [
          { response, status: dataStatus, node: nodeOptionsResponse },
        ] = [],
        status,
      } = await apiService.post<any[]>(
        getUrl(
          id,
          ApiEndpoints.CLI,
          state.cli.settings?.cliClientUuid,
          ApiEndpoints.SEND_CLUSTER_COMMAND,
        ),
        { ...options, command, outputFormat },
      )

      if (isStatusSuccessful(status)) {
        let isRedirected = false
        if (options.nodeOptions && nodeOptionsResponse) {
          const requestNodeAddress = `${options.nodeOptions.host}:${options.nodeOptions.port}`
          const responseNodeAddress = `${nodeOptionsResponse.host}:${nodeOptionsResponse.port}`
          isRedirected = requestNodeAddress !== responseNodeAddress
        }
        onSuccessAction?.()
        dispatch(sendCliCommandSuccess())
        const result = outputFormat === CliOutputFormatterType.Raw && isRedirected
          ? cliParseTextResponseWithRedirect(response, command, dataStatus, nodeOptionsResponse)
          : cliParseTextResponseWithOffset(response, command, dataStatus)

        dispatch(concatToOutput(result))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      const errorName = getApiErrorName(error as AxiosError)
      dispatch(sendCliCommandFailure(errorMessage))

      if (errorName === ApiErrors.ClientNotFound && cliClientUuid) {
        handleRecreateClient(dispatch, stateInit)
      } else {
        dispatch(
          concatToOutput(cliParseTextResponseWithOffset(errorMessage, command, CommandExecutionStatus.Fail)),
        )
      }
      onFailAction?.()
    }
  }
}

export function processUnsupportedCommand(
  command: string = '',
  unsupportedCommand: string = '',
  onSuccessAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    // Due to requirements, the monitor command should not appear in the list of supported commands
    // That is why we exclude it here
    const unsupportedCommands = cliUnsupportedCommandsSelector(state, [CommandMonitor.toLowerCase()])
    dispatch(
      concatToOutput(
        cliParseTextResponseWithOffset(
          cliTexts.CLI_UNSUPPORTED_COMMANDS(
            command.slice(0, unsupportedCommand.length),
            unsupportedCommands.join(', '),
          ),
          command,
          CommandExecutionStatus.Fail,
        ),
      ),
    )

    onSuccessAction?.()
  }
}

export function processUnrepeatableNumber(
  command: string = '',
  onSuccessAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(
      concatToOutput(
        cliParseTextResponseWithOffset(
          cliTexts.REPEAT_COUNT_INVALID,
          command,
          CommandExecutionStatus.Fail,
        ),
      ),
    )

    onSuccessAction?.()
  }
}

function handleRecreateClient(dispatch: AppDispatch, stateInit: () => RootState, command = ''): void {
  const state = stateInit()
  const { cliClientUuid } = state.cli.settings
  if (cliClientUuid) {
    dispatch(concatToOutput(
      cliParseTextResponseWithOffset(cliTexts.CONNECTION_CLOSED, command, CommandExecutionStatus.Fail),
    ))
    dispatch(updateCliClientAction(
      cliClientUuid,
      () => dispatch(concatToOutput(ConnectionSuccessOutputText)),
      (message: string) => dispatch(concatToOutput(
        cliParseTextResponseWithOffset(`${message}`, command, CommandExecutionStatus.Fail),
      )),
    ))
  }
}

// Asynchronous thunk action
export function fetchMonitorLog(
  logFileId: string = '',
  onSuccessAction?: (data: string, headers: AxiosResponseHeaders) => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(sendCliCommand())

    try {
      const { data, status, headers } = await apiService.get<string>(
        `${ApiEndpoints.PROFILER_LOGS}/${logFileId}`,
      )

      if (isStatusSuccessful(status)) {
        dispatch(sendCliCommandSuccess())
        onSuccessAction?.(data, headers as AxiosResponseHeaders)
      }
    } catch (err) {
      const error = err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      // dispatch(addErrorNotification(error))
      dispatch(sendCliCommandFailure(errorMessage))
    }
  }
}
