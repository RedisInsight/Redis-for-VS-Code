import { VscodeMessageAction } from 'uiSrc/constants'
import { PostMessage } from 'uiSrc/interfaces'
import { fetchDatabases, useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'

export const refreshTreeAction = (message: PostMessage) => {
  if (message.action !== VscodeMessageAction.RefreshTree) {
    return
  }
  if (message.data?.keyInfo?.key) {
    useSelectedKeyStore.getState().setSelectedKeyAction(message.data)
  }

  fetchDatabases(() => {
    if (message.data.database?.id) {
      useDatabasesStore.getState().setDatabaseToList(message.data?.database!)
    }
  })
}
