import React, { Ref, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Nullable } from 'uiSrc/interfaces'
import { scrollIntoView } from 'uiSrc/utils'
import { clearOutput, updateCliHistoryStorage } from 'uiSrc/modules/cli/utils/cliHelper'
import { isModifiedEvent } from 'uiSrc/services'
import { ClearCommand, CliKeys } from 'uiSrc/constants'
import { outputSelector } from 'uiSrc/modules/cli/slice/cli-output'
import { cliSettingsSelector } from 'uiSrc/modules/cli/slice/cli-settings'
import { CliInputWrapper } from 'uiSrc/modules/cli/components/cli-input'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/commands/redis-commands.slice'

import { AppDispatch } from 'uiSrc/store'
import styles from './styles.module.scss'

export interface Props {
  data: (string | JSX.Element)[];
  command: string;
  error: string;
  setCommand: (command: string) => void;
  onSubmit: () => void;
}

const commandTabPosInit = 0
const commandHistoryPosInit = -1
const TIME_FOR_DOUBLE_CLICK = 300

export const CliBody = (props: Props) => {
  const { data, command = '', error, setCommand, onSubmit } = props

  const [inputEl, setInputEl] = useState<Nullable<HTMLSpanElement>>(null)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [commandHistoryPos, setCommandHistoryPos] = useState<number>(commandHistoryPosInit)
  const [commandTabPos, setCommandTabPos] = useState<number>(commandTabPosInit)
  const [wordsTyped, setWordsTyped] = useState<number>(0)
  const [matchingCmds, setMatchingCmds] = useState<string[]>([])
  const { loading: settingsLoading } = useSelector(cliSettingsSelector)
  const { loading, commandHistory: commandHistoryStore } = useSelector(outputSelector)
  const { commandsArray } = useSelector(appRedisCommandsSelector)

  const timerClickRef = useRef<NodeJS.Timeout>()
  const scrollDivRef: Ref<HTMLDivElement> = useRef(null)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    inputEl?.focus()
    scrollIntoView(scrollDivRef?.current, {
      behavior: 'smooth',
      block: 'nearest',
      inline: 'end',
    })
  }, [command, data, inputEl, scrollDivRef])

  useEffect(() => {
    setCommandHistory(commandHistoryStore)
  }, [commandHistoryStore])

  useEffect(() => {
    if (command) {
      setWordsTyped(
        command.trim().match(/(?:'[^']*'|[^\s'"]|"[^"]*"|\[[^\]]*\])+/g)?.length ?? wordsTyped,
      )
    }
  }, [command])

  const onClearOutput = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    event.preventDefault()

    clearOutput(dispatch)
    setCommand('')
  }

  const onKeyDownEnter = (commandLine: string, event: React.KeyboardEvent<HTMLSpanElement>) => {
    event.preventDefault()

    setWordsTyped(0)
    setCommandHistoryPos(commandHistoryPosInit)
    updateCliHistoryStorage(commandLine, dispatch)

    if (commandLine === ClearCommand) {
      onClearOutput(event)
      return
    }

    onSubmit()
  }

  const onKeyDownArrowUp = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    event.preventDefault()
    const newPos = commandHistoryPos + 1
    if (newPos >= commandHistory.length) {
      return
    }

    setCommandFromHistory(newPos)
  }

  const onKeyDownArrowDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    const newPos = commandHistoryPos - 1

    if (commandHistoryPos === commandHistoryPosInit) {
      event.preventDefault()
      return
    }

    setCommandFromHistory(newPos)
  }

  const onKeyDownTab = (event: React.KeyboardEvent<HTMLSpanElement>, commandLine: string) => {
    event.preventDefault()

    const nextPos = commandTabPos === matchingCmds.length - 1 ? commandTabPosInit : commandTabPos + 1
    let matchingCmdsCurrent = matchingCmds

    if (commandTabPos === commandTabPosInit) {
      matchingCmdsCurrent = updateMatchingCmds(commandLine)
    }

    if (matchingCmdsCurrent.length > 1) {
      setCommand(matchingCmdsCurrent[nextPos])
      setCommandTabPos(nextPos)
    }
  }

  const onKeyDownShiftTab = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    event.preventDefault()

    let matchingCmdsCurrent = matchingCmds

    if (commandTabPos === commandTabPosInit) {
      matchingCmdsCurrent = updateMatchingCmds(command)
    }

    const nextPos = commandTabPos ? commandTabPos - 1 : matchingCmdsCurrent.length - 1

    if (!matchingCmdsCurrent.length) {
      return
    }

    if (matchingCmdsCurrent.length > 1) {
      setCommand(matchingCmdsCurrent[nextPos])
      setCommandTabPos(nextPos)
    }
  }

  const onKeyEsc = () => {
    document.getElementById('close-cli')?.focus()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    const commandLine = command?.trim()

    const isModifierKey = isModifiedEvent(event)

    if (event.shiftKey && event.key === CliKeys.TAB) return onKeyDownShiftTab(event)
    if (event.key === CliKeys.TAB) return onKeyDownTab(event, commandLine)

    // reset command tab position
    if (!event.shiftKey || (event.shiftKey && event.key !== 'Shift')) {
      setCommandTabPos(commandTabPosInit)
    }

    if (event.key === CliKeys.ENTER) return onKeyDownEnter(commandLine, event)
    if (event.key === CliKeys.ARROW_UP && !isModifierKey) return onKeyDownArrowUp(event)
    if (event.key === CliKeys.ARROW_DOWN && !isModifierKey) return onKeyDownArrowDown(event)
    if (event.key === CliKeys.ESCAPE) return onKeyEsc()

    if ((event.metaKey && event.key === 'k') || (event.ctrlKey && event.key === 'l')) {
      onClearOutput(event)
    }
    return undefined
  }

  const updateMatchingCmds = (command: string = '') => {
    const matchingCmdsCurrent = [
      command,
      ...commandsArray.filter((cmd: string) => cmd.startsWith(command.toUpperCase())),
    ]

    setMatchingCmds(matchingCmdsCurrent)

    return matchingCmdsCurrent
  }

  const setCommandFromHistory = (newPos: number) => {
    const newCommand = commandHistory[newPos] ?? ''

    setCommand(newCommand)
    setCommandHistoryPos(newPos)

    setTimeout(() => {
      inputEl?.focus()
    })
  }

  const onMouseUpOutput = () => {
    if (timerClickRef.current) {
      clearTimeout(timerClickRef.current)
      timerClickRef.current = undefined
      return
    }

    if (window.getSelection()?.toString()) {
      return
    }

    timerClickRef.current = setTimeout(() => {
      const isInputFocused = document.activeElement === inputEl

      if (!window.getSelection()?.toString() && !isInputFocused) {
        inputEl?.focus()
        document.execCommand('selectAll', false)
        document.getSelection()?.collapseToEnd()
        timerClickRef.current = undefined
      }
    }, TIME_FOR_DOUBLE_CLICK)
  }

  return (
    <div
      className="cli-container"
      onMouseUp={onMouseUpOutput}
      onKeyDown={() => { }}
      role="textbox"
      tabIndex={0}
    >
      <section className={styles.outputWrapper}>
        <div className={styles.output}>{data}</div>
        {!error && !(loading || settingsLoading) ? (
          <span style={{ paddingBottom: 5, paddingTop: 17 }}>
            <CliInputWrapper
              command={command}
              setCommand={setCommand}
              setInputEl={setInputEl}
              onKeyDown={onKeyDown}
              wordsTyped={wordsTyped}
            />
          </span>
        ) : (
          !error && <span>Executing command...</span>
        )}
        <div ref={scrollDivRef} />
      </section>
    </div>
  )
}
