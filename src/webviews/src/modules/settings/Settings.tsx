import React, { KeyboardEventHandler, useState } from 'react'
import * as l10n from '@vscode/l10n'
import cx from 'classnames'
import { isEqual } from 'lodash'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscCheck } from 'react-icons/vsc'

import { Separator } from 'uiSrc/ui'
import { ConsentsPrivacy, MultiSelect, MultiSelectOption } from 'uiSrc/components'
import { DEFAULT_DELIMITER, VscodeMessageAction } from 'uiSrc/constants'
import { vscodeApi } from 'uiSrc/services'
import { useAppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import { TelemetryEvent, arrayToMultiSelect, multiSelectToArray, sendEventTelemetry } from 'uiSrc/utils'
import styles from './styles.module.scss'

const createOption = (label: string) => ({
  label,
  value: label,
})

export const Settings = () => {
  const delimitersProp = useAppInfoStore((state) => arrayToMultiSelect(state.delimiters))

  const setDelimitersAction = useAppInfoStore((state) => state.setDelimiters)

  const [inputValue, setInputValue] = useState<string>('')
  const [delimiters, setDelimiters] = useState<readonly MultiSelectOption[]>(delimitersProp)

  const handleApplyClick = () => {
    const delimitersInit = multiSelectToArray(delimiters)
    const delims = delimitersInit.length ? delimitersInit : [DEFAULT_DELIMITER]

    if (isEqual(delimitersProp, delimiters)) {
      return
    }

    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_DELIMITER_CHANGED,
      eventData: {
        from: multiSelectToArray(delimitersProp),
        to: delims,
      },
    })

    setDelimiters(arrayToMultiSelect(delims))
    setDelimitersAction(delims)

    vscodeApi.postMessage({ action: VscodeMessageAction.UpdateSettingsDelimiter, data: delims })
  }

  const setOption = () => {
    setDelimiters((prev) => [...prev, createOption(inputValue)])
    setInputValue('')
  }

  const handleKeyDown: KeyboardEventHandler = (event) => {
    if (!inputValue) return

    // eslint-disable-next-line default-case
    switch (event.key) {
      case 'Enter':
      case ' ':
        if (delimiters.find(({ value }) => value === inputValue)) {
          return
        }

        setOption()
        event.preventDefault()
    }
  }

  return (
    <div className="h-full p-4 overflow-auto">
      <header className="px-3 py-6">
        <h1 className="text-2xl">{l10n.t('Settings')}</h1>
      </header>
      <Separator />
      <main>
        <div className={styles.box}>
          <ConsentsPrivacy />
        </div>
        <div className={cx(styles.box, 'flex flex-row items-center max-sm:flex-col max-sm:items-start')}>
          <div className="flex flex-row items-stretch min-h-7">
            <div className="flex pr-3 font-medium items-center">{l10n.t('Delimiter')}</div>
            <MultiSelect
              value={delimiters}
              inputValue={inputValue}
              onChange={(newValue) => setDelimiters(newValue)}
              onInputChange={(newValue) => setInputValue(newValue)}
              containerClassName="w-[256px]"
              onKeyDown={handleKeyDown}
              placeholder=":"
              components={{ DropdownIndicator: null }}
              testid="select-multi-delimiters"
            />

            <VSCodeButton
              appearance="icon"
              data-testid="apply-delimiter-btn"
              onClick={handleApplyClick}
              aria-label="apply"
              className={styles.applyBtn}
            >
              <VscCheck />
            </VSCodeButton>

          </div>
        </div>
      </main>
    </div>
  )
}
