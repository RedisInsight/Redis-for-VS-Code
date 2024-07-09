import React, { FC, useEffect } from 'react'
import { StorageItem } from 'uiSrc/constants'
import { Cli } from 'uiSrc/modules/cli/Cli'
import { useCliSettingsStore } from 'uiSrc/modules/cli/hooks/cli-settings/useCliSettingsStore'
import { localStorageService, sessionStorageService } from 'uiSrc/services'
import { useDatabasesStore } from 'uiSrc/store'

export const CliPage: FC<any> = () => {
  const cliConnectionsHistory = useCliSettingsStore((state) => state.cliConnectionsHistory)

  const setConnectedDatabase = useDatabasesStore((state) => state.setConnectedDatabase)

  useEffect(() => {
    const database = localStorageService.get(StorageItem.cliDatabase)
    sessionStorageService.set(StorageItem.databaseId, database?.id)

    setConnectedDatabase(database)
  }, [])

  return (
    <div className="block h-full w-full">
      <Cli cliConnectionsHistory={cliConnectionsHistory} />
    </div>
  )
}
