import cx from 'classnames'
import { isNull } from 'lodash'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useShallow } from 'zustand/react/shallow'

// import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import {
  AddCommonFieldsFormConfig,
  KeyTypes,
  TEXT_UNPRINTABLE_CHARACTERS,
} from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/interfaces'
import {
  TelemetryEvent,
  formatLongName,
  isEqualBuffers,
  replaceSpaces,
  sendEventTelemetry,
  stringToBuffer,
} from 'uiSrc/utils'
import { useSelectedKeyStore } from 'uiSrc/store'
import { connectedDatabaseSelector } from 'uiSrc/slices/connections/databases/databases.slice'
import { InlineEditor } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  onEditKey: (key: RedisResponseBuffer, newKey: RedisResponseBuffer, onFailure?: () => void) => void
}

const KeyDetailsHeaderName = ({ onEditKey }: Props) => {
  const { id: databaseId } = useSelector(connectedDatabaseSelector)
  const { loading, data } = useSelectedKeyStore(useShallow((state) => ({
    loading: state.loading,
    data: state.data,
  })))

  const { type = KeyTypes.String, name: keyBuffer, nameString: keyProp, ttl: ttlProp } = data ?? {}
  const tooltipContent = formatLongName(keyProp || '')

  const [key, setKey] = useState(keyProp)
  const [keyIsEditing, setKeyIsEditing] = useState(false)
  const [keyIsEditable, setKeyIsEditable] = useState(true)

  useEffect(() => {
    setKey(keyProp)
    setKeyIsEditable(isEqualBuffers(keyBuffer as RedisResponseBuffer, stringToBuffer(keyProp || '')))
  }, [keyProp, ttlProp, keyBuffer])

  const onClickKey = () => {
    setKeyIsEditing(true)
  }

  const onChangeKey = ({ currentTarget: { value } }: ChangeEvent<HTMLInputElement>) => {
    keyIsEditing && setKey(value)
  }

  const applyEditKey = () => {
    setKeyIsEditing(false)

    const newKeyBuffer = stringToBuffer(key || '')

    if (keyBuffer && !isEqualBuffers(keyBuffer as RedisResponseBuffer, newKeyBuffer) && !isNull(keyProp)) {
      onEditKey(keyBuffer as RedisResponseBuffer, newKeyBuffer, () => setKey(keyProp))
    }
  }

  const cancelEditKey = (event?: React.MouseEvent) => {
    // const { id } = event?.target as HTMLElement || {}
    // if (id === COPY_KEY_NAME_ICON) {
    //   return
    // }
    setKey(keyProp)
    setKeyIsEditing(false)

    event?.stopPropagation()
  }

  const handleCopy = (
    event: any,
    text = '',
    keyInputIsEditing: boolean,
    keyNameInputRef: React.RefObject<HTMLInputElement>,
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
    <div
      className={cx(
        styles.keyFlexItem, // TODO with styles.keyFlexItemEditing
      )}
      data-testid="edit-key-btn"
    >
      {(keyIsEditing) && (
        <div className={styles.classNameGridComponent}>
          <div className={styles.flexItemKeyInput}>
            <div
              title={`Key Name\n${tooltipContent}`}
              className={styles.toolTipAnchorKey}
            >
              <InlineEditor
                onApply={() => applyEditKey()}
                isDisabled={!keyIsEditable}
                disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
                onDecline={(event) => cancelEditKey(event)}
                isLoading={loading}
                declineOnUnmount={false}
                placeholder={AddCommonFieldsFormConfig?.keyName?.placeholder}
              />
              <p className={styles.keyHiddenText}>{key}</p>
            </div>
          </div>
        </div>
      )}
      <div className={cx(styles.key, { [styles.hidden]: keyIsEditing })} data-testid="key-name-text">
        <b className="truncate" title={`Key Name\n${tooltipContent}`}>
          {replaceSpaces(keyProp?.substring(0, 200))}
        </b>
      </div>
    </div>

  )
}

export { KeyDetailsHeaderName }
