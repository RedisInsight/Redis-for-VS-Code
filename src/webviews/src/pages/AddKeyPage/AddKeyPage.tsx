import React, { FC } from 'react'
import { CLOUD_ADS } from 'uiSrc/constants'
import { AddKey } from 'uiSrc/modules'
import { KeysStoreProvider } from 'uiSrc/modules/keys-tree/hooks/useKeys'
import { OAuthSsoDialog } from 'uiSrc/modules/oauth'
import { ContextStoreProvider } from 'uiSrc/store'

export const AddKeyPage: FC<any> = () => (
  <div className="flex h-full w-full p-4 overflow-x-auto" data-testid="panel-view-page">
    <ContextStoreProvider>
      <KeysStoreProvider>
        <AddKey />
        {CLOUD_ADS && <OAuthSsoDialog />}
      </KeysStoreProvider>
    </ContextStoreProvider>
  </div>
)
