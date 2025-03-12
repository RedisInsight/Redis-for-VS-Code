import React, { FC } from 'react'

import { OAuthJobs, OAuthSelectPlan, OAuthSsoDialog } from 'uiSrc/modules/oauth'
import { CommonAppSubscription } from 'uiSrc/modules'

export const OAuthPage: FC<any> = () => (
  <div>
    <OAuthJobs />
    <CommonAppSubscription />
    <OAuthSsoDialog />
    <OAuthSelectPlan />
  </div>
)
