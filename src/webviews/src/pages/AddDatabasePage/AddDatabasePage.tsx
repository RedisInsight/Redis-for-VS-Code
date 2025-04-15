import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react'
import React, { FC, useEffect } from 'react'
import * as l10n from '@vscode/l10n'

import { CLOUD_ADS, OAuthSocialSource } from 'uiSrc/constants'
import { CommonAppSubscription, DatabasePanel } from 'uiSrc/modules'
import { OAuthCreateFreeDb, OAuthSsoDialog, OAuthJobs, OAuthSelectPlan } from 'uiSrc/modules/oauth'
import { fetchCerts } from 'uiSrc/store'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/utils'

export const AddDatabasePage: FC<any> = () => {
  useEffect(() => {
    fetchCerts()
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_CLICKED,
    })
  }, [])

  return (
    <div className="flex h-full w-full p-4 overflow-x-auto flex-col" data-testid="panel-view-page">
      <h1 className="text-2xl pt-4 pb-4">
        {l10n.t('Add Redis database')}
      </h1>
      <VSCodeDivider className="divider" />
      {CLOUD_ADS && (
        <>
          <OAuthJobs />
          <CommonAppSubscription />
          <OAuthSsoDialog />
          <OAuthCreateFreeDb source={OAuthSocialSource.AddDbForm} />
          <OAuthSelectPlan />
          <VSCodeDivider className="divider" />
        </>
      )}
      <DatabasePanel />
    </div>
  )
}
