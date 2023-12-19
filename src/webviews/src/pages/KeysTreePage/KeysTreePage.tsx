import React, { FC } from 'react'
import { DatabaseWrapper, KeysTree, KeysTreeHeader } from 'uiSrc/modules'

export const KeysTreePage: FC<any> = () => (
  <div className="flex h-full w-full" data-testid="tree-view-page">
    <DatabaseWrapper>
      <KeysTreeHeader />
      <KeysTree />
    </DatabaseWrapper>
  </div>
)
