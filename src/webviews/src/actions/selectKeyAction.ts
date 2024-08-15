import { StorageItem, VscodeMessageAction } from 'uiSrc/constants'
import { PostMessage } from 'uiSrc/interfaces'
import { sessionStorageService } from 'uiSrc/services'
import { fetchKeyInfo, resetZustand, useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { TelemetryEvent, isEqualBuffers, sendEventTelemetry } from 'uiSrc/utils'

export const selectKeyAction = (message: PostMessage) => {
  if (message.action !== VscodeMessageAction.SelectKey) {
    return
  }

  const { key, database } = message?.data
  const prevKey = useSelectedKeyStore.getState().data?.name

  if (isEqualBuffers(key, prevKey)) {
    return
  }

  sessionStorageService.set(StorageItem.databaseId, database?.id)
  resetZustand()

  fetchKeyInfo({ key }, true, ({ type: keyType, length }) => {
    useDatabasesStore.getState().setConnectedDatabase(database)
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_VIEWED,
      eventData: {
        keyType,
        databaseId: database?.id,
        length,
      },
    })
  })
}
