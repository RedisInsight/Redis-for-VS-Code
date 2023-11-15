import React, { FC } from 'react'
import { Cli } from 'uiSrc/modules/cli/Cli'

export const CliPage: FC<any> = () => (
  <div className="flex h-full w-full px-5 py-1 overflow-x-auto" data-testid="panel-view-page">
    <Cli />
  </div>
)
