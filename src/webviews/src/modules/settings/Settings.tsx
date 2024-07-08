import React, { useState } from 'react'
import * as l10n from '@vscode/l10n'
import cx from 'classnames'

import { Separator } from 'uiSrc/ui'
import { InlineEditor, ConsentsPrivacy } from 'uiSrc/components'
import { DEFAULT_DELIMITER, MAX_DELIMITER_LENGTH, VscodeMessageAction } from 'uiSrc/constants'
import { vscodeApi } from 'uiSrc/services'
import { useAppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/utils'
import styles from './styles.module.scss'

export const Settings = () => {
  const delimiterProp = useAppInfoStore((state) => state.delimiter)
  const setDelimiterAction = useAppInfoStore((state) => state.setDelimiter)

  const [delimiter, setDelimiter] = useState(delimiterProp)

  const onApplyDelimiter = (valueInit: string) => {
    const value = valueInit || DEFAULT_DELIMITER
    setDelimiter(value)
    setDelimiterAction(value)

    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_DELIMITER_CHANGED,
      eventData: {
        from: delimiterProp,
        to: value || DEFAULT_DELIMITER,
      },
    })

    vscodeApi.postMessage({ action: VscodeMessageAction.UpdateSettingsDelimiter, data: value })
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
          <div className="flex flex-row items-center h-7">
            <div className="h-full w-[50px]">
              <InlineEditor
                initialValue={delimiter}
                placeholder={DEFAULT_DELIMITER}
                maxLength={MAX_DELIMITER_LENGTH}
                onChange={setDelimiter}
                onApply={onApplyDelimiter}
                onDecline={() => setDelimiter(delimiterProp)}
                inlineTestId="input-delimiter"
              />
            </div>
            <span className="pl-[50px] font-medium">{l10n.t('Delimiter to separate namespaces')}</span>
          </div>
          {/* <div className="flex flex-row items-center h-7">
            <Separator align="vertical" className="mx-9 max-sm:hidden" />
            <Checkbox
              disabled
              labelText={l10n.t('Open Key Details in a New Window')}
            />
          </div> */}
        </div>
      </main>
    </div>
  )
}
