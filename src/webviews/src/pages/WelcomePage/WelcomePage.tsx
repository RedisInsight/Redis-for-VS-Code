import React, { FC } from 'react'
import * as l10n from '@vscode/l10n'
import { VscAdd } from 'react-icons/vsc'

import { Link, PromoLink, Separator, Spacer } from 'uiSrc/ui'
import { vscodeApi } from 'uiSrc/services'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import { OAuthSocialSource, VscodeMessageAction } from 'uiSrc/constants'
import { useAppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import DockerIcon from 'uiSrc/assets/database/docker.svg?react'
import GithubIcon from 'uiSrc/assets/database/github.svg?react'
import ShortLogoSvg from 'uiSrc/assets/database/database_icon_active.svg?react'
import LogoSvg from 'uiSrc/assets/logo.svg?react'

import styles from './styles.module.scss'

export const WelcomePage: FC = () => {
  const { contentCloud, contentDocker, contentGithub, contentRI } = useAppInfoStore((state) => ({
    contentCloud: state.createDbContent?.cloud_vscode,
    contentDocker: state.createDbContent?.docker,
    contentGithub: state.createDbContent?.github,
    contentRI: state.createDbContent?.redis_insight,
  }))
  const handleClickConnect = () => {
    vscodeApi.postMessage({ action: VscodeMessageAction.OpenAddDatabase })
  }

  const handleClickFree = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_FREE_DATABASE_CLICKED,
      eventData: {
        source: OAuthSocialSource.WelcomeScreen,
      },
    })
  }

  const handleClickDocker = () => {
    sendEventTelemetry({
      event: TelemetryEvent.BUILD_USING_DOCKER_CLICKED,
    })
  }

  return (
    <div className={styles.container} data-testid="welcome-page">
      <Spacer size="xl" />
      <div className="flex flex-row flex-grow-0 pb-4">
        <LogoSvg />
        <span className="pl-2 text-[26px]">{l10n.t('- Welcome')}</span>
      </div>
      <Separator />
      <div className="flex flex-col flex-grow">
        <Spacer size="m" />
        <h3>{l10n.t('About Redis for VS Code')}</h3>
        <span>{l10n.t('Take your productivity to the next level when developing with Redis or Redis Stack! Use Redis for VS Code to visualize and optimize Redis data.')}</span>
        <span>{l10n.t('A powerful desktop manager, Redis for VS Code provides an intuitive and efficient UI for Redis and Redis Stack and supports CLI interaction in a fully-featured desktop UI client.')}</span>
        <Spacer size="l" />
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.data}>
              <h3>{l10n.t('Start')}</h3>
              <Link
                className="flex items-center cursor-pointer hover:underline"
                onClick={handleClickConnect}
                data-testid="connect-database-btn"
                aria-label="Connect database"
              >
                <VscAdd className="inline-block mr-1" />
                {l10n.t('Connect your database')}
              </Link>
              <Spacer size="xl" />

              <h3>{l10n.t('Create new database')}</h3>
              {contentCloud && (
                <PromoLink Icon={ShortLogoSvg} onClick={handleClickFree} {...contentCloud} />
              )}
              {contentDocker && (
                <PromoLink Icon={DockerIcon} onClick={handleClickDocker} {...contentDocker} />
              )}
            </div>
          </div>
          <div className={styles.section}>
            <div className={styles.data}>
              <h3>{l10n.t('Recommended')}</h3>
              {contentGithub && (
                <PromoLink Icon={GithubIcon} {...contentGithub} />
              )}
              {contentRI && (
                <PromoLink Icon={ShortLogoSvg} {...contentRI} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
