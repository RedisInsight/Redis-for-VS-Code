import { SelectKeyAction } from 'uiSrc/interfaces'
import {
  fetchDatabaseOverview,
  fetchKeyInfo,
  setInitialStateByType,
  useDatabasesStore,
  useSelectedKeyStore,
} from 'uiSrc/store'
import { TelemetryEvent, isEqualBuffers, sendEventTelemetry } from 'uiSrc/utils'

export const selectKeyAction = (message: SelectKeyAction) => {
  const { keyInfo, database } = message?.data
  const { key } = keyInfo || {}
  const prevKey = useSelectedKeyStore.getState().data?.name
  const prevDatabaseId = useDatabasesStore.getState().connectedDatabase?.id

  const isTheSameKey = prevDatabaseId === database?.id && isEqualBuffers(prevKey, key)

  if (isTheSameKey || !prevKey) {
    return
  }

  window.ri.database = database

  fetchKeyInfo({ key }, true, ({ type: keyType, length }) => {
    setInitialStateByType(keyType!)
    fetchDatabaseOverview()
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
