import React, { FC, useEffect } from 'react'
import { KeyDetails } from 'uiSrc/modules'
import {
  ContextStoreProvider,
  fetchDatabaseOverview,
  fetchKeyInfo,
  useDatabasesStore,
} from 'uiSrc/store'
import { KeysStoreProvider } from 'uiSrc/modules/keys-tree/hooks/useKeys'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'

export const KeyDetailsPage: FC = () => {
  useEffect(() => {
    const { database, keyInfo: { key } = {} } = window.ri

    if (!key || !database) {
      return
    }

    fetchKeyInfo({ key }, true, ({ type: keyType, length }) => {
      useDatabasesStore.getState().setConnectedDatabase(database!)
      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_KEY_VALUE_VIEWED,
        eventData: {
          keyType,
          databaseId: database?.id,
          length,
        },
      })
    })

    fetchDatabaseOverview()
  }, [])

  return (
    <div className="h-full" data-testid="key-details-page">
      <KeysStoreProvider>
        <ContextStoreProvider>
          <KeyDetails />
        </ContextStoreProvider>
      </KeysStoreProvider>
    </div>
  )
}
