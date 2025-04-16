import React, { FC } from 'react'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import * as l10n from '@vscode/l10n'

import { PromoLink } from 'uiSrc/ui'
import { vscodeApi } from 'uiSrc/services'
import { CLOUD_ADS, OAuthSocialSource, VscodeMessageAction } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import { useAppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import DockerIcon from 'uiSrc/assets/database/docker.svg?react'
import NoDatabasesIcon from 'uiSrc/assets/database/no_databases.svg?react'
import LogoSvg from 'uiSrc/assets/database/database_icon_active.svg?react'

export interface Props {
  disabled: boolean
  text?: string
  loadMoreItems?: (config: any) => void
}

export const NoDatabases: FC = () => {
  const { contentCloud, contentDocker } = useAppInfoStore((state) => ({
    contentCloud: state.createDbContent?.cloud_vscode,
    contentDocker: state.createDbContent?.docker,
  }))

  const handleClickConnect = () => {
    vscodeApi.postMessage({ action: VscodeMessageAction.OpenAddDatabase })
  }

  const handleClickFree = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
      eventData: {
        source: OAuthSocialSource.DatabasesList,
      },
    })
  }

  const handleClickDocker = () => {
    sendEventTelemetry({
      event: TelemetryEvent.BUILD_USING_DOCKER_CLICKED,
    })
  }

  return (
    <div className="flex flex-col flex-grow justify-between p-3 pt-20" data-testid="no-databases-page">
      <div className="flex flex-col items-center pb-1">
        <NoDatabasesIcon />
        <div className="pt-10 pb-2">{l10n.t('No databases added')}</div>
        <h2 className="text-[24px] leading-[24px] w-[95%] text-center">
          {l10n.t('Add your first database to get started')}
        </h2>
        <VSCodeButton
          appearance="primary"
          className="mt-10"
          onClick={handleClickConnect}
          data-testid="connect-database-btn"
          aria-label="Connect database"
        >
          {l10n.t('+ Connect database')}
        </VSCodeButton>
      </div>
      <div className="flex flex-col">
        <h2 className="pb-3 text-[24px]">
          {l10n.t('Links')}
        </h2>
        {CLOUD_ADS && contentCloud && (
          <PromoLink Icon={LogoSvg} onClick={handleClickFree} {...contentCloud} />
        )}
        {contentDocker && (
          <PromoLink Icon={DockerIcon} onClick={handleClickDocker} {...contentDocker} />
        )}
      </div>
    </div>
  )
}
