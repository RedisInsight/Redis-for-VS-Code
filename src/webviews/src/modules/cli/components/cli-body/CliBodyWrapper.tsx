import { decode } from 'html-entities'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useHotkeys } from 'react-hotkeys-hook'

import {
  cliSettingsSelector,
  createCliClientAction,
  setCliEnteringCommand,
  clearSearchingCommand,
  toggleCli,
  deleteCliClientAction,
  resetCliSettings,
} from 'uiSrc/modules/cli/slice/cli-settings'
import {
  concatToOutput,
  outputSelector,
  sendCliCommandAction,
  sendCliClusterCommandAction,
  processUnsupportedCommand,
  processUnrepeatableNumber,
  resetOutputLoading,
} from 'uiSrc/modules/cli/slice/cli-output'
import {
  cliTexts,
  ConnectionType,
  CommandMonitor,
  CommandPSubscribe,
  CommandSubscribe,
  CommandHello3,
  CONNECTED_INSTANCE_ID,
  // Pages
} from 'uiSrc/constants'
import { getCommandRepeat, isRepeatCountCorrect, sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import { ClusterNodeRole } from 'uiSrc/interfaces'
import { connectedInstanceSelector } from 'uiSrc/slices/connections/instances/instances.slice'
import { checkUnsupportedCommand, clearOutput, cliCommandOutput } from 'uiSrc/modules/cli/utils/cliHelper'
// import { showMonitor } from 'uiSrc/slices/cli/monitor'
// import { SendClusterCommandDto } from 'apiSrc/modules/cli/dto/cli.dto'

import { AppDispatch } from 'uiSrc/store'
import { CliBody } from './cli-body'

import styles from './cli-body/styles.module.scss'

export const CliBodyWrapper = () => {
  const [command, setCommand] = useState('')

  // const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { data = [] } = useSelector(outputSelector)
  const {
    errorClient: error,
    unsupportedCommands,
    isEnteringCommand,
    isSearching,
    matchedCommand,
    cliClientUuid,
  } = useSelector(cliSettingsSelector)
  const { host, port, connectionType } = useSelector(connectedInstanceSelector)
  const { db: currentDbIndex } = useSelector(outputSelector)

  const removeCliClient = () => {
    cliClientUuid && dispatch(deleteCliClientAction(CONNECTED_INSTANCE_ID, cliClientUuid))
    dispatch(resetCliSettings())
    dispatch(resetOutputLoading())
    sendEventTelemetry({
      event: TelemetryEvent.CLI_CLOSED,
      eventData: {
        databaseId: CONNECTED_INSTANCE_ID,
      },
    })
  }

  useEffect(() => {
    !cliClientUuid && dispatch(createCliClientAction(CONNECTED_INSTANCE_ID, handleWorkbenchClick))
    return () => {
      removeCliClient()
    }
  }, [])

  useEffect(() => {
    if (!isEnteringCommand) {
      dispatch(setCliEnteringCommand())
    }
    if (isSearching && matchedCommand) {
      dispatch(clearSearchingCommand())
    }
  }, [command])

  const handleClearOutput = () => {
    clearOutput(dispatch)
  }

  const handleWorkbenchClick = () => {
    dispatch(toggleCli())

    sendEventTelemetry({
      event: TelemetryEvent.CLI_WORKBENCH_LINK_CLICKED,
      eventData: {
        databaseId: CONNECTED_INSTANCE_ID,
      },
    })
  }

  const refHotkeys = useHotkeys<HTMLDivElement>('command+k,ctrl+l', handleClearOutput)

  const handleSubmit = () => {
    const [commandLine, countRepeat] = getCommandRepeat(decode(command).trim() || '')
    const unsupportedCommand = checkUnsupportedCommand(unsupportedCommands, commandLine)
    dispatch(concatToOutput(cliCommandOutput(decode(command), currentDbIndex)))

    if (!isRepeatCountCorrect(countRepeat)) {
      dispatch(processUnrepeatableNumber(commandLine, resetCommand))
      return
    }

    // Flow if MONITOR command was executed
    if (checkUnsupportedCommand([CommandMonitor.toLowerCase()], commandLine)) {
      dispatch(concatToOutput(cliTexts.MONITOR_COMMAND_CLI(() => {
        // dispatch(showMonitor())
      })))
      resetCommand()
      return
    }

    // Flow if PSUBSCRIBE command was executed
    if (checkUnsupportedCommand([CommandPSubscribe.toLowerCase()], commandLine)) {
      dispatch(concatToOutput(cliTexts.PSUBSCRIBE_COMMAND_CLI('')))
      resetCommand()
      return
    }

    // Flow if SUBSCRIBE command was executed
    if (checkUnsupportedCommand([CommandSubscribe.toLowerCase()], commandLine)) {
      dispatch(concatToOutput(cliTexts.SUBSCRIBE_COMMAND_CLI('')))
      resetCommand()
      return
    }

    // Flow if HELLO 3 command was executed
    if (checkUnsupportedCommand([CommandHello3.toLowerCase()], commandLine)) {
      dispatch(concatToOutput(cliTexts.HELLO3_COMMAND_CLI()))
      resetCommand()
      return
    }

    if (unsupportedCommand) {
      dispatch(processUnsupportedCommand(commandLine, unsupportedCommand, resetCommand))
      return
    }

    for (let i = 0; i < countRepeat; i++) {
      sendCommand(commandLine)
    }
  }

  const sendCommand = (command: string) => {
    sendEventTelemetry({
      event: TelemetryEvent.CLI_COMMAND_SUBMITTED,
      eventData: {
        databaseId: CONNECTED_INSTANCE_ID,
      },
    })
    if (connectionType !== ConnectionType.Cluster) {
      dispatch(sendCliCommandAction(command, resetCommand))
      return
    }

    const options: any = {
      command,
      nodeOptions: {
        host,
        port,
        enableRedirection: true,
      },
      role: ClusterNodeRole.All,
    }
    dispatch(sendCliClusterCommandAction(command, options, resetCommand))
  }

  const resetCommand = () => {
    setCommand('')
  }

  return (
    <section ref={refHotkeys} className={styles.section}>
      <CliBody
        data={data}
        command={command}
        error={error}
        setCommand={setCommand}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
