import { VscodeMessageAction } from 'uiSrc/constants'
import { PostMessage } from 'uiSrc/interfaces'
import { addCli } from 'uiSrc/modules/cli/hooks/cli-settings/useCliSettingsThunks'
import { useDatabasesStore } from 'uiSrc/store'

export const processCliAction = (message: PostMessage) => {
  if (
    message.action !== VscodeMessageAction.AddCli
    && message.action !== VscodeMessageAction.OpenCli) {
    return
  }

  const prevDatabaseId = useDatabasesStore.getState().connectedDatabase?.id
  const database = message?.data?.database

  if (prevDatabaseId === database?.id) {
    return
  }
  window.ri.database = database
  addCli()

  useDatabasesStore.getState().setConnectedDatabase(database)
}
