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
} from 'uiSrc/slices/cli/cli-settings'
import {
  concatToOutput,
  outputSelector,
  sendCliCommandAction,
  sendCliClusterCommandAction,
  processUnsupportedCommand,
  processUnrepeatableNumber,
} from 'uiSrc/slices/cli/cli-output'
import {
  cliTexts,
  ConnectionType,
  CommandMonitor,
  CommandPSubscribe,
  CommandSubscribe,
  CommandHello3,
  // Pages
} from 'uiSrc/constants'
import { getCommandRepeat, isRepeatCountCorrect, sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import { ClusterNodeRole } from 'uiSrc/interfaces'
import { connectedInstanceSelector } from 'uiSrc/slices/connections/instances/instances.slice'
import { checkUnsupportedCommand, clearOutput, cliCommandOutput } from 'uiSrc/utils/cliHelper'
// import { showMonitor } from 'uiSrc/slices/cli/monitor'
// import { SendClusterCommandDto } from 'apiSrc/modules/cli/dto/cli.dto'

import CliBody from './CliBody'

import styles from './CliBody/styles.module.scss'

const INSTANCE_ID = 'e12bbb1d-eec6-4cee-b8c9-c34eb851fa83'

const CliBodyWrapper = () => {
  const [command, setCommand] = useState('')

  // const navigate = useNavigate()
  const dispatch = useDispatch()
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

  useEffect(() => {
    !cliClientUuid && dispatch(createCliClientAction(INSTANCE_ID, handleWorkbenchClick))
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
        databaseId: INSTANCE_ID,
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
      dispatch(concatToOutput(cliTexts.MONITOR_COMMAND_CLI(() => { dispatch(showMonitor()) })))
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
        databaseId: INSTANCE_ID,
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

export default CliBodyWrapper
