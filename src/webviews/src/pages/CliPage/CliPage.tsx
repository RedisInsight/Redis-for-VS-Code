import React, { FC, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { StorageItem } from 'uiSrc/constants'
import { Cli } from 'uiSrc/modules/cli/Cli'
import { cliSettingsSelector } from 'uiSrc/modules/cli/slice/cli-settings'
import { localStorageService, sessionStorageService } from 'uiSrc/services'
import { useDatabasesStore } from 'uiSrc/store'

export const CliPage: FC<any> = () => {
  const {
    cliConnectionsHistory,
  } = useSelector(cliSettingsSelector)

  const setConnectedDatabase = useDatabasesStore((state) => state.setConnectedDatabase)

  useEffect(() => {
    const database = localStorageService.get(StorageItem.cliDatabase)
    sessionStorageService.set(StorageItem.databaseId, database.id)

    setConnectedDatabase(database)
  }, [])

  return (
    <div className="block h-full w-full">
      <Cli cliConnectionsHistory={cliConnectionsHistory} />
    </div>
  )
}
