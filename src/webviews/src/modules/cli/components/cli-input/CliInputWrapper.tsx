import { isUndefined } from 'lodash'
import React from 'react'
import { getCommandRepeat } from 'uiSrc/utils'
import { CommandProvider } from 'uiSrc/constants'
import { useAppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import { CliAutocomplete } from './cli-autocomplete'

import { CliInput } from './cli-input'
import { useCliOutputStore } from '../../hooks/cli-output/useCliOutputStore'

export interface Props {
  command: string
  wordsTyped: number
  setInputEl: Function
  setCommand: (command: string) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLSpanElement>) => void
}

export const CliInputWrapper = (props: Props) => {
  const { command = '', wordsTyped, setInputEl, setCommand, onKeyDown } = props

  const db = useCliOutputStore((state) => state.db)
  const ALL_REDIS_COMMANDS = useAppInfoStore((state) => state.commandsSpec)

  const [commandLine, repeatCommand] = getCommandRepeat(command || '')
  const [firstCommand, secondCommand] = commandLine.split(' ')
  const firstCommandMatch = firstCommand.toUpperCase()
  const secondCommandMatch = `${firstCommandMatch} ${secondCommand ? secondCommand.toUpperCase() : null}`

  const matchedCmd = ALL_REDIS_COMMANDS[secondCommandMatch] || ALL_REDIS_COMMANDS[firstCommandMatch]
  const provider = matchedCmd?.provider || CommandProvider.Unknown
  const commandName = !isUndefined(ALL_REDIS_COMMANDS[secondCommandMatch])
    ? `${firstCommand} ${secondCommand}`
    : firstCommand

  return (
    <>
      <CliInput
        command={command}
        setInputEl={setInputEl}
        setCommand={setCommand}
        onKeyDown={onKeyDown}
        dbIndex={db}
      />
      {matchedCmd && (
        <CliAutocomplete
          provider={provider}
          commandName={commandName}
          wordsTyped={repeatCommand === 1 ? wordsTyped : wordsTyped - 1}
          {...matchedCmd}
        />
      )}
    </>
  )
}
