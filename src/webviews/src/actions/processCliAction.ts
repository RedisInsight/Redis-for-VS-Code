import { StorageItem, VscodeMessageAction } from 'uiSrc/constants'
import { PostMessage } from 'uiSrc/interfaces'
import { addCli } from 'uiSrc/modules/cli/hooks/cli-settings/useCliSettingsThunks'
import { localStorageService, sessionStorageService } from 'uiSrc/services'
import { Database, useDatabasesStore } from 'uiSrc/store'

export const processCliAction = (message: PostMessage) => {
  if (
    message.action !== VscodeMessageAction.AddCli
    && message.action !== VscodeMessageAction.OpenCli) {
    return
  }

  const database = message?.data as Database

  localStorageService.set(StorageItem.cliDatabase, database)
  sessionStorageService.set(StorageItem.databaseId, database.id)

  useDatabasesStore.getState().setConnectedDatabase(database)
  addCli(database)
}
