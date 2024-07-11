import { decode } from 'html-entities'
import React, { useEffect, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import { useShallow } from 'zustand/react/shallow'
import {
  cliTexts,
  ConnectionType,
  CommandMonitor,
  CommandPSubscribe,
  CommandSubscribe,
  CommandHello3,
  CommandSSubscribe,
  // Pages
} from 'uiSrc/constants'
import { getCommandRepeat, isRepeatCountCorrect, sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import { ClusterNodeRole } from 'uiSrc/interfaces'
import { checkUnsupportedCommand, clearOutput, cliCommandOutput } from 'uiSrc/modules/cli/utils/cliHelper'
import { useDatabasesStore } from 'uiSrc/store'

import { CliBody } from './cli-body'

import styles from './cli-body/styles.module.scss'
import { useCliOutputStore } from '../../hooks/cli-output/useCliOutputStore'
import { useCliSettingsStore } from '../../hooks/cli-settings/useCliSettingsStore'
import { createCliClientAction, deleteCliClientAction } from '../../hooks/cli-settings/useCliSettingsThunks'
import { processUnrepeatableNumber, processUnsupportedCommand, sendCliClusterCommandAction, sendCliCommandAction } from '../../hooks/cli-output/useCliOutputThunks'

export const CliBodyWrapper = () => {
  const [command, setCommand] = useState('')

  const {
    error,
    unsupportedCommands,
    cliClientUuid,
    resetCliSettings,
  } = useCliSettingsStore((state) => ({
    error: state.errorClient,
    unsupportedCommands: state.unsupportedCommands,
    cliClientUuid: state.cliClientUuid,
    resetCliSettings: state.resetCliSettings,
  }))
  const database = useDatabasesStore(useShallow((state) => state.connectedDatabase))
  const { id, host, port, connectionType } = database || {}

  const data = useCliOutputStore((state) => state.data || [])

  const currentDbIndex = useCliOutputStore((state) => state.db)
  const sendCliCommandFinal = useCliOutputStore((state) => state.sendCliCommandFinal)
  const concatToOutput = useCliOutputStore((state) => state.concatToOutput)

  const removeCliClient = () => {
    cliClientUuid && deleteCliClientAction(cliClientUuid)
    resetCliSettings()
    sendCliCommandFinal()
    sendEventTelemetry({
      event: TelemetryEvent.CLI_CLOSED,
      eventData: {
        databaseId: id,
      },
    })
  }

  useEffect(() => {
    !cliClientUuid && host && createCliClientAction(database!)
    return () => {
      removeCliClient()
    }
  }, [database])

  const handleClearOutput = () => {
    clearOutput()
  }

  const refHotkeys = useHotkeys<HTMLDivElement>('command+k,ctrl+l', handleClearOutput)

  const handleSubmit = () => {
    const [commandLine, countRepeat] = getCommandRepeat(decode(command).trim() || '')

    const unsupportedCommand = checkUnsupportedCommand(unsupportedCommands, commandLine)
    concatToOutput(cliCommandOutput(decode(command), currentDbIndex))

    if (!isRepeatCountCorrect(countRepeat)) {
      processUnrepeatableNumber(commandLine, resetCommand)
      return
    }

    // Flow if MONITOR command was executed
    if (checkUnsupportedCommand([CommandMonitor.toLowerCase()], commandLine)) {
      concatToOutput(cliTexts.MONITOR_COMMAND_CLI())
      resetCommand()
      return
    }

    // Flow if PSUBSCRIBE command was executed
    if (checkUnsupportedCommand([CommandPSubscribe.toLowerCase()], commandLine)) {
      concatToOutput(cliTexts.PSUBSCRIBE_COMMAND_CLI())
      resetCommand()
      return
    }

    // Flow if SUBSCRIBE command was executed
    if (checkUnsupportedCommand([CommandSubscribe.toLowerCase()], commandLine)) {
      concatToOutput(cliTexts.SUBSCRIBE_COMMAND_CLI())
      resetCommand()
      return
    }

    // Flow if SSUBSCRIBE command was executed
    if (checkUnsupportedCommand([CommandSSubscribe.toLowerCase()], commandLine)) {
      concatToOutput(cliTexts.SSUBSCRIBE_COMMAND_CLI())
      resetCommand()
      return
    }

    // Flow if HELLO 3 command was executed
    if (checkUnsupportedCommand([CommandHello3.toLowerCase()], commandLine)) {
      concatToOutput(cliTexts.HELLO3_COMMAND_CLI())
      resetCommand()
      return
    }

    if (unsupportedCommand) {
      processUnsupportedCommand(commandLine, unsupportedCommand, resetCommand)
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
        databaseId: id,
      },
    })
    if (connectionType !== ConnectionType.Cluster) {
      sendCliCommandAction(command, resetCommand)
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
    sendCliClusterCommandAction(command, options, resetCommand)
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
