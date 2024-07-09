import React, { useEffect } from 'react'
import { findIndex } from 'lodash'

import { ICommandArg } from 'uiSrc/constants'
import { generateArgsNames } from 'uiSrc/utils'

import { useCliSettingsStore } from 'uiSrc/modules/cli/hooks/cli-settings/useCliSettingsStore'
import styles from './styles.module.scss'

export interface Props {
  provider: string
  commandName: string
  wordsTyped: number
  arguments?: ICommandArg[]
}

export const CliAutocomplete = (props: Props) => {
  const { commandName = '', provider = '', arguments: args = [], wordsTyped } = props

  const { setMatchedCommand, clearSearchingCommand } = useCliSettingsStore((state) => ({
    setMatchedCommand: state.setMatchedCommand,
    clearSearchingCommand: state.clearSearchingCommand,
  }))

  useEffect(() => {
    setMatchedCommand(commandName)
    clearSearchingCommand()
  }, [commandName])

  useEffect(() => () => {
    setMatchedCommand('')
    clearSearchingCommand()
  }, [])

  let argsList: any[] | string = []
  let untypedArgs: any[] | string = []

  const getUntypedArgs = () => {
    const firstOptionalArgIndex = findIndex(argsList, (arg: string = '') =>
      arg.toString().includes('['))

    const isOnlyOptionalLeft = wordsTyped - commandName.split(' ').length >= firstOptionalArgIndex
      && firstOptionalArgIndex > -1

    if (isOnlyOptionalLeft) {
      return firstOptionalArgIndex
    }

    return wordsTyped - commandName.split(' ').length
  }

  if (args.length) {
    argsList = generateArgsNames(provider, args)

    untypedArgs = argsList.slice(getUntypedArgs()).join(' ')
    argsList = argsList.join(' ')
  }

  return (
    <>
      {!!args.length && argsList && untypedArgs && (
        <span className={styles.container} data-testid="cli-command-autocomplete">
          <span className={styles.params}>{untypedArgs}</span>
        </span>
      )}
    </>
  )
}
