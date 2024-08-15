import { isNull } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscCopy } from 'react-icons/vsc'

import {
  AddCommonFieldsFormConfig,
  KeyTypes,
  TEXT_UNPRINTABLE_CHARACTERS,
} from 'uiSrc/constants'
import { RedisString } from 'uiSrc/interfaces'
import {
  TelemetryEvent,
  formatLongName,
  isEqualBuffers,
  replaceSpaces,
  sendEventTelemetry,
  stringToBuffer,
} from 'uiSrc/utils'
import { useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { InlineEditor } from 'uiSrc/components'
import { Tooltip } from 'uiSrc/ui'
import styles from './styles.module.scss'

export interface Props {
  onEditKey: (key: RedisString, newKey: RedisString, onFailure?: () => void) => void
}

const KeyDetailsHeaderName = ({ onEditKey }: Props) => {
  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)
  const { loading, data } = useSelectedKeyStore(useShallow((state) => ({
    loading: state.loading,
    data: state.data,
  })))

  const { type = KeyTypes.String, name: keyBuffer, nameString: keyProp, ttl: ttlProp } = data ?? {}
  const tooltipContent = formatLongName(keyProp || '')

  const [key, setKey] = useState(keyProp)
  const [keyIsEditable, setKeyIsEditable] = useState(true)

  useEffect(() => {
    setKey(keyProp)
    setKeyIsEditable(isEqualBuffers(keyBuffer, stringToBuffer(keyProp || '')))
  }, [keyProp, ttlProp, keyBuffer])

  const applyEditKey = () => {
    const newKeyBuffer = stringToBuffer(key || '')

    if (keyBuffer && !isEqualBuffers(keyBuffer, newKeyBuffer) && !isNull(keyProp)) {
      onEditKey(keyBuffer, newKeyBuffer, () => setKey(keyProp))
    }
  }

  const cancelEditKey = (event?: React.MouseEvent) => {
    // const { id } = event?.target as HTMLElement || {}
    // if (id === COPY_KEY_NAME_ICON) {
    //   return
    // }
    setKey(keyProp)

    event?.stopPropagation()
  }

  const handleCopy = (
    event: any,
    text = '',
    keyInputIsEditing?: boolean,
    keyNameInputRef?: React.RefObject<HTMLInputElement>,
  ) => {
    navigator.clipboard.writeText(text)

    if (keyInputIsEditing) {
      keyNameInputRef?.current?.focus()
    }

    event.stopPropagation()

    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_COPIED,
      eventData: {
        databaseId,
        keyType: type,
      },
    })
  }

  return (
    <div className={styles.container}>
      <div className="flex relative">
        <Tooltip
          title={l10n.t('Key Name')}
          content={tooltipContent}
          position="bottom center"
          mouseEnterDelay={300}
        >
          <div className="w-full flex-row h-[30px] pl-2">
            <InlineEditor
              initialValue={key}
              onChange={setKey}
              onApply={() => applyEditKey()}
              disabled={!keyIsEditable}
              disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
              onDecline={(event) => cancelEditKey(event)}
              loading={loading}
              inputClassName="pr-6"
              placeholder={AddCommonFieldsFormConfig?.keyName?.placeholder}
              inlineTestId="edit-key-input"
            />
            <p className={styles.keyHiddenText}>{key}</p>
          </div>
        </Tooltip>
      </div>

      <VSCodeButton
        appearance="icon"
        disabled={loading}
        className={styles.copyBtn}
        data-testid="copy-name-button"
        onClick={(e) => handleCopy(e, replaceSpaces(keyProp?.substring(0, 200)))}
        aria-label="Copy Name"
      >
        <VscCopy />
      </VSCodeButton>
    </div>

  )
}

export { KeyDetailsHeaderName }
