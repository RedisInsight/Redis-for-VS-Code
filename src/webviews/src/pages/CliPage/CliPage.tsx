import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import { Cli } from 'uiSrc/modules/cli/Cli'
import { cliSettingsSelector } from 'uiSrc/modules/cli/slice/cli-settings'

export const CliPage: FC<any> = () => {
  const {
    cliConnectionsHistory,
  } = useSelector(cliSettingsSelector)

  return (
    <div className="block h-full w-full">
      <Cli cliConnectionsHistory={cliConnectionsHistory} />
    </div>
  )
}
