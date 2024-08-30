import { SetDatabaseAction } from 'uiSrc/interfaces'
import { useDatabasesStore } from 'uiSrc/store'

export const setDatabaseAction = (message: SetDatabaseAction) => {
  if (message.data?.database?.id) {
    window.ri.database = message.data.database
    useDatabasesStore.getState().setConnectedDatabase(message.data.database)
  }
}
