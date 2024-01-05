import React, { FC } from 'react'
import { AddKey } from 'uiSrc/modules'

export const AddKeyPage: FC<any> = () => (
  <div className="flex h-full w-full p-4 overflow-x-auto" data-testid="panel-view-page">
    <AddKey />
  </div>
)
