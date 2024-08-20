import { VscodeMessageAction } from 'uiSrc/constants'
import { PostMessage } from 'uiSrc/interfaces'
import { useDatabasesStore } from 'uiSrc/store'

export const addKeyAction = (message: PostMessage) => {
  if (message.action !== VscodeMessageAction.AddKey) {
    return
  }
  window.ri.database = message?.data?.database
  useDatabasesStore.getState().setConnectedDatabase(message?.data?.database)
}
