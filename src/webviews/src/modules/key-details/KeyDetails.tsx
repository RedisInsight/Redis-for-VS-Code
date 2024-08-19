import React, { useEffect } from 'react'
import cx from 'classnames'
import { useShallow } from 'zustand/react/shallow'

import { KeyTypes, SelectedKeyActionType, VscodeMessageAction } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import { RedisString } from 'uiSrc/interfaces'
import { useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { vscodeApi } from 'uiSrc/services'
import { DynamicTypeDetails } from './components/dynamic-type-details'

import { useKeysApi } from '../keys-tree/hooks/useKeys'
import styles from './styles.module.scss'

export interface Props {}

const KeyDetails = () => {
  const { keyType, keyName, loading } = useSelectedKeyStore(useShallow((state) => ({
    keyType: state.data?.type || KeyTypes.String,
    keyName: state.data?.name,
    loading: state.loading,
  })))

  const database = useDatabasesStore((state) => state.connectedDatabase)
  const databaseId = database?.id

  const keysApi = useKeysApi()

  useEffect(() => {
    keysApi.setDatabaseId(window.ri?.database?.id || '')
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
      data: { type: SelectedKeyActionType.Removed, database: database!, keyInfo: { key: keyName } },
    })
  }

  const onEditKey = (key: RedisString, newKey: RedisString) => {
    vscodeApi.postMessage({
      action: VscodeMessageAction.EditKeyName,
      data: {
        type: SelectedKeyActionType.Renamed,
        database: database!,
        keyInfo: { key, newKey },
      },
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
