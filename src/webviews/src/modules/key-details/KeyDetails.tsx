import React, { useEffect } from 'react'
import { isNull, isUndefined } from 'lodash'
import cx from 'classnames'
import { useShallow } from 'zustand/react/shallow'

import { useSelector } from 'react-redux'
import { KeyTypes, VscodeMessageAction } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import { Nullable, RedisString } from 'uiSrc/interfaces'
import { fetchKeyInfo, useSelectedKeyStore } from 'uiSrc/store'
import { connectedDatabaseSelector } from 'uiSrc/slices/connections/databases/databases.slice'
import { vscodeApi } from 'uiSrc/services'
import { DynamicTypeDetails } from './components/dynamic-type-details'

import styles from './styles.module.scss'

export interface Props {
  keyProp: Nullable<RedisString>
  // onCloseKey: () => void
  // onEditKey: (key: RedisString, newKey: RedisString) => void
  // onRemoveKey: () => void
  // totalKeys: number
  // keysLastRefreshTime: Nullable<number>
}

const KeyDetails = (props: Props) => {
  const {
    keyProp,
  } = props

  const { id: databaseId } = useSelector(connectedDatabaseSelector)

  const { loading, data } = useSelectedKeyStore(useShallow((state) => ({
    loading: state.loading,
    data: state.data,
  })))

  const isKeySelected = !isNull(data)
  const { type: keyType = KeyTypes.String, name: keyName, length: keyLength } = data ?? { }

  useEffect(() => {
    if (keyProp === null) {
      return
    }
    // Restore key details from context in future
    // (selectedKey.data?.name !== keyProp)
    fetchKeyInfo(keyProp)
  }, [])

  useEffect(() => {
    if (!isUndefined(keyName)) {
      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_KEY_VALUE_VIEWED,
        eventData: {
          keyType,
          databaseId,
          length: keyLength,
        },
      })
    }
  }, [keyName])

  const onCloseAddItemPanel = (isCancelled = false) => {
    if (isCancelled) {
      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_KEY_ADD_VALUE_CANCELLED,
        eventData: {
          databaseId,
          keyType,
        },
      })
    }
  }

  const onOpenAddItemPanel = () => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_ADD_VALUE_CLICKED,
      eventData: {
        databaseId,
        keyType,
      },
    })
  }

  const onRemoveKey = () => {
    vscodeApi.postMessage({ action: VscodeMessageAction.CloseKeyAndRefresh, data: { keyName } })
  }

  return (
    <div className={styles.container}>
      <div className={cx(styles.content, { [styles.contentActive]: data || loading })}>
        {/* {!isKeySelected && !loading && (
          <NoKeySelected
            keyProp={keyProp}
            totalKeys={totalKeys}
            keysLastRefreshTime={keysLastRefreshTime}
            error={error}
            onClosePanel={onCloseKey}
          />
        )} */}
        {/* {(!isKeySelected || !loading) && ( */}
        <DynamicTypeDetails
          {...props}
          onRemoveKey={onRemoveKey}
          keyType={keyType}
          onOpenAddItemPanel={onOpenAddItemPanel}
          onCloseAddItemPanel={onCloseAddItemPanel}
        />
        {/* )} */}
      </div>
    </div>
  )
}

export { KeyDetails }
