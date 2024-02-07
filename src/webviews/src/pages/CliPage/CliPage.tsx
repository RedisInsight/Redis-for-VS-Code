import React, { FC, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { StorageItem } from 'uiSrc/constants'
import { Cli } from 'uiSrc/modules/cli/Cli'
import { addCli, cliSettingsSelector } from 'uiSrc/modules/cli/slice/cli-settings'
import { localStorageService, sessionStorageService } from 'uiSrc/services'
import { AppDispatch, useDatabasesStore } from 'uiSrc/store'

export const CliPage: FC<any> = () => {
  const {
    cliConnectionsHistory,
  } = useSelector(cliSettingsSelector)

  const setConnectedDatabase = useDatabasesStore((state) => state.setConnectedDatabase)

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const database = localStorageService.get(StorageItem.cliDatabase)
    sessionStorageService.set(StorageItem.databaseId, database.id)

    setConnectedDatabase(database)

    // dispatch(addCli(database))
  }, [])

  // useEffect(() => {
  //   console.log({ searchParams })

  //   const database = sessionStorageService.get(StorageItem.database)
  //   console.log({ database })

  //   setConnectedDatabase(database)

  //   dispatch(addCli(database))
  // }, [searchParams])

  return (
    <div className="block h-full w-full">
      <Cli cliConnectionsHistory={cliConnectionsHistory} />
    </div>
  )
}
