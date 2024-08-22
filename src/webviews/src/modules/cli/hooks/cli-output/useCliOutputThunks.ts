import { AxiosError } from 'axios'

import { CommandExecutionStatus } from 'uiSrc/interfaces'
import { apiService } from 'uiSrc/services'
import { ApiEndpoints, CliOutputFormatterType, SelectCommand, ApiErrors, cliTexts, ConnectionSuccessOutputText, CommandMonitor, CommandPSubscribe, CommandSubscribe, CommandSSubscribe } from 'uiSrc/constants'
import {
  getApiErrorMessage,
  isStatusSuccessful,
  getUrl,
  getApiErrorName,
} from 'uiSrc/utils'
import { useCliOutputStore } from './useCliOutputStore'
import { useCliSettingsStore } from '../cli-settings/useCliSettingsStore'
import { updateCliClientAction } from '../cli-settings/useCliSettingsThunks'
import {
  cliParseTextResponseWithOffset,
  getDbIndexFromSelectQuery,
} from '../../utils'

// Asynchronous thunk action
export function sendCliCommandAction(
  command: string = '',
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  useCliOutputStore.setState(async (state) => {
    let cliClientUuid
    try {
      cliClientUuid = useCliSettingsStore.getState().cliClientUuid

      if (command === '') {
        onSuccessAction?.()
        return
      }

      state.sendCliCommand()

      const { data: { response, status: dataStatus }, status } = await apiService.post<any>(
        getUrl(ApiEndpoints.CLI, cliClientUuid, ApiEndpoints.SEND_COMMAND),
        { command, outputFormat: CliOutputFormatterType.Raw },
      )

      if (isStatusSuccessful(status)) {
        onSuccessAction?.()

        state.concatToOutput(cliParseTextResponseWithOffset(response, command, dataStatus))

        if (
          dataStatus === CommandExecutionStatus.Success
          && command.toLowerCase().startsWith(SelectCommand.toLowerCase())
        ) {
          try {
            const dbIndex = getDbIndexFromSelectQuery(command)
            state.setCliDbIndex(dbIndex)
          } catch (e) {
            // continue regardless of error
          }
        }
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      const errorName = getApiErrorName(error as AxiosError)
      state.sendCliCommandFailure(errorMessage)

      if (errorName === ApiErrors.ClientNotFound && cliClientUuid) {
        handleRecreateClient()
      } else {
        state.concatToOutput(
          cliParseTextResponseWithOffset(errorMessage, command, CommandExecutionStatus.Fail),
        )
      }
      onFailAction?.()
    } finally {
      state.sendCliCommandFinal()
    }
  })
}

// Asynchronous thunk action
export function sendCliClusterCommandAction(
  command: string = '',
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  useCliOutputStore.setState(async (state) => {
    let cliClientUuid
    try {
      const outputFormat = CliOutputFormatterType.Raw
      cliClientUuid = useCliSettingsStore.getState().cliClientUuid

      if (command === '') {
        onSuccessAction?.()
        return
      }

      state.sendCliCommand()

      const { data: { response, status: dataStatus }, status } = await apiService.post<any>(
        getUrl(
          ApiEndpoints.CLI,
          cliClientUuid,
          ApiEndpoints.SEND_CLUSTER_COMMAND,
        ),
        { command, outputFormat },
      )

      if (isStatusSuccessful(status)) {
        onSuccessAction?.()
        state.concatToOutput(cliParseTextResponseWithOffset(response, command, dataStatus))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      const errorName = getApiErrorName(error as AxiosError)
      state.sendCliCommandFailure(errorMessage)

      if (errorName === ApiErrors.ClientNotFound && cliClientUuid) {
        handleRecreateClient()
      } else {
        state.concatToOutput(cliParseTextResponseWithOffset(errorMessage, command, CommandExecutionStatus.Fail))
      }
      onFailAction?.()
    } finally {
      state.sendCliCommandFinal()
    }
  })
}

export function processUnsupportedCommand(
  command: string = '',
  unsupportedCommand: string = '',
  onSuccessAction?: () => void,
) {
  return useCliOutputStore.setState(async (state) => {
    // Due to requirements, the monitor command should not appear in the list of supported commands
    // That is why we exclude it here
    const excludeCommands = [
      CommandSubscribe.toLowerCase(),
      CommandMonitor.toLowerCase(),
      CommandPSubscribe.toLocaleLowerCase(),
      CommandSSubscribe.toLocaleLowerCase(),
    ]
    const unsupportedCommands = useCliSettingsStore.getState()
      .unsupportedCommands.filter((command: string) =>
        !excludeCommands.includes(command.toLowerCase()))

    state.concatToOutput(
      cliParseTextResponseWithOffset(
        cliTexts.CLI_UNSUPPORTED_COMMANDS(
          command.slice(0, unsupportedCommand.length),
          unsupportedCommands.join(', '),
        ),
        command,
        CommandExecutionStatus.Fail,
      ),
    )

    onSuccessAction?.()
  })
}

export function processUnrepeatableNumber(
  command: string = '',
  onSuccessAction?: () => void,
) {
  return useCliOutputStore.setState(async (state) => {
    state.concatToOutput(
      cliParseTextResponseWithOffset(
        cliTexts.REPEAT_COUNT_INVALID,
        command,
        CommandExecutionStatus.Fail,
      ),
    )

    onSuccessAction?.()
  })
}

function handleRecreateClient(command = ''): void {
  const { cliClientUuid } = useCliSettingsStore.getState()
  const { concatToOutput } = useCliOutputStore.getState()
  if (cliClientUuid) {
    concatToOutput(
      cliParseTextResponseWithOffset(cliTexts.CONNECTION_CLOSED, command, CommandExecutionStatus.Fail),
    )
    updateCliClientAction(
      cliClientUuid,
      () => concatToOutput(ConnectionSuccessOutputText),
      (message: string) => concatToOutput(
        cliParseTextResponseWithOffset(`${message}`, command, CommandExecutionStatus.Fail),
      ),
    )
  }
}
