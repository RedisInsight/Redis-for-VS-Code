import React, { FC } from 'react'

import { OAuthSocialSource } from 'uiSrc/constants'
import { OAuthCreateFreeDb, OAuthJobs, OAuthSelectPlan, OAuthSsoDialog } from 'uiSrc/modules/oauth'
import { CommonAppSubscription, DatabasePanel } from 'uiSrc/modules'

export const OAuthPage: FC<any> = () => (
  <div>
    {/* TODO [DA]: Remove components unneeded for the OAuth flow */}
    <OAuthJobs />
    <CommonAppSubscription />
    <OAuthSsoDialog />
    <OAuthCreateFreeDb source={OAuthSocialSource.AddDbForm} />
    <DatabasePanel />
    <OAuthSelectPlan />
  </div>
)
