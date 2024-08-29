import { VscodeMessageAction } from 'uiSrc/constants'
import { PostMessage } from 'uiSrc/interfaces'
import { useDatabasesStore } from 'uiSrc/store'

export const refreshKeyAction = (message: PostMessage) => {
  if (message.action !== VscodeMessageAction.RefreshKey) {
    return
  }

  if (message.data?.database?.id) {
    useDatabasesStore.getState().setConnectedDatabase(message.data.database)
  }
}
