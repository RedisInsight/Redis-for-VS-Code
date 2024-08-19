import React, { FC, useEffect } from 'react'
import { Cli } from 'uiSrc/modules/cli/Cli'
import { useCliSettingsStore } from 'uiSrc/modules/cli/hooks/cli-settings/useCliSettingsStore'
import { useDatabasesStore } from 'uiSrc/store'

export const CliPage: FC<any> = () => {
  const cliConnectionsHistory = useCliSettingsStore((state) => state.cliConnectionsHistory)

  const setConnectedDatabase = useDatabasesStore((state) => state.setConnectedDatabase)

  useEffect(() => {
    setConnectedDatabase(window.ri?.database!)
  }, [])

  return (
    <div className="block h-full w-full">
      <Cli cliConnectionsHistory={cliConnectionsHistory} />
    </div>
  )
}
