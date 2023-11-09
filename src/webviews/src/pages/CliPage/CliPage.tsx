import React, { FC } from 'react'
import Cli from 'uiSrc/components/cli/Cli/Cli'

export const CliPage: FC<any> = () => (
  <div className="flex h-full w-full px-5 py-1" data-testid="panel-view-page">
    <Cli />
  </div>
)
