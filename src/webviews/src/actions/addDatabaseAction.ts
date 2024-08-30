import { useDatabasesStore } from 'uiSrc/store'

export const addDatabaseAction = (message: any) => {
  if (message.data?.database?.id) {
    useDatabasesStore.getState().addDatabaseToList(message.data?.database!)
  }
}
