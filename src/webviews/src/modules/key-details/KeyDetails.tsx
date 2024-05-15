import React, { useEffect } from 'react'
import cx from 'classnames'
import { useShallow } from 'zustand/react/shallow'

import { KeyTypes, SelectedKeyActionType, StorageItem, VscodeMessageAction } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import { Nullable, RedisString } from 'uiSrc/interfaces'
import { useSelectedKeyStore } from 'uiSrc/store'
import { sessionStorageService, vscodeApi } from 'uiSrc/services'
import { DynamicTypeDetails } from './components/dynamic-type-details'

import { useKeysApi, useKeysInContext } from '../keys-tree/hooks/useKeys'
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

  const { keyType, keyName, loading } = useSelectedKeyStore(useShallow((state) => ({
    keyType: state.data?.type || KeyTypes.String,
    keyName: state.data?.name,
    loading: state.loading,
  })))
  const databaseId = useKeysInContext((state) => state.databaseId)

  const keysApi = useKeysApi()

  useEffect(() => {
    keysApi.setDatabaseId(sessionStorageService.get(StorageItem.databaseId))
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
    vscodeApi.postMessage({
      action: VscodeMessageAction.CloseKeyAndRefresh,
      data: { key: keyName, type: SelectedKeyActionType.Removed, databaseId: databaseId! },
    })
  }

  const onEditKey = (key: RedisString, newKey: RedisString) => {
    vscodeApi.postMessage({
      action: VscodeMessageAction.EditKeyName,
      data: { key, newKey, type: SelectedKeyActionType.Renamed, databaseId: databaseId! },
    })
  }

  return (
    <div className={styles.container}>
      <div className={cx(styles.content, { [styles.contentActive]: keyName || loading })}>
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
          onEditKey={onEditKey}
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
