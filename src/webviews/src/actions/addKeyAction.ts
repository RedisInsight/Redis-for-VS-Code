import { StorageItem, VscodeMessageAction } from 'uiSrc/constants'
import { PostMessage } from 'uiSrc/interfaces'
import { sessionStorageService } from 'uiSrc/services'
import { Database, useDatabasesStore } from 'uiSrc/store'

export const addKeyAction = (message: PostMessage) => {
  if (message.action !== VscodeMessageAction.AddKey) {
    return
  }
  sessionStorageService.set(StorageItem.databaseId, message?.data?.id)
  useDatabasesStore.getState().setConnectedDatabase(message?.data as Database)
}
