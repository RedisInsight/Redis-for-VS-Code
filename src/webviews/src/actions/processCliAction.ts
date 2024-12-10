import { CliAction } from 'uiSrc/interfaces'
import { addCli } from 'uiSrc/modules/cli/hooks/cli-settings/useCliSettingsThunks'
import { useDatabasesStore } from 'uiSrc/store'

export const processCliAction = (message: CliAction) => {
  const prevDatabaseId = useDatabasesStore.getState().connectedDatabase?.id
  const prevDatabaseIndex = useDatabasesStore.getState().connectedDatabase?.db
  const database = message?.data?.database
  const dbIndex = database?.db ?? 0

  if (prevDatabaseId! + prevDatabaseIndex === database?.id + dbIndex) {
    return
  }
  window.ri.database = database
  addCli()

  useDatabasesStore.getState().setConnectedDatabase(database)
}
