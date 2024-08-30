import { fetchDatabases, useDatabasesStore } from 'uiSrc/store'

export const refreshTreeAction = (message: any) => {
  fetchDatabases(() => {
    if (message.data?.database?.id) {
      useDatabasesStore.getState().setDatabaseToList(message.data?.database!)
    }
  })
}
