import React from 'react'
import cx from 'classnames'
import { useShallow } from 'zustand/react/shallow'
import * as l10n from '@vscode/l10n'

import { localStorageService } from 'uiSrc/services'
import { StorageItem } from 'uiSrc/constants'
import { Checkbox, CheckboxChangeEvent, Link } from 'uiSrc/ui'
import { enableUserAnalyticsAction } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'
import { useOAuthStore } from 'uiSrc/store'
import styles from './styles.module.scss'

export interface Props {
  size?: 's' | 'm'
}

const OAuthAgreement = (props: Props) => {
  const { size = 'm' } = props

  const { agreement, setAgreement } = useOAuthStore(useShallow((state) => ({
    agreement: state.agreement,
    setAgreement: state.setAgreement,
  })))

  const handleCheck = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      enableUserAnalyticsAction()
    }
    setAgreement(e.target.checked)
    localStorageService.set(StorageItem.OAuthAgreement, e.target.checked)
  }

  return (
    <div className={cx(styles.wrapper, { [styles.small]: size === 's' })}>
      <Checkbox
        id="ouath-agreement"
        name="agreement"
        labelText={l10n.t('By signing up, you acknowledge that you agree:')}
        checked={agreement}
        onChange={handleCheck}
        className={styles.agreement}
        data-testid="oauth-agreement-checkbox"
      />
      <ul className={styles.list}>
        <li className={styles.listItem}>
          {l10n.t('to our ')}
          <Link
            href="https://redis.io/legal/cloud-tos/?utm_source=redisinsight&utm_medium=main&utm_campaign=main"
            className={styles.link}
            target="_blank"
            data-testid="ouath-agreements-cloud-terms-of-service"
          >
            {l10n.t('Cloud Terms of Service')}
          </Link>
          {l10n.t(' and ')}
          <Link
            href="https://redis.io/legal/privacy-policy/?utm_source=redisinsight&utm_medium=main&utm_campaign=main"
            className={styles.link}
            target="_blank"
            data-testid="oauth-agreement-privacy-policy"
          >
            {l10n.t('Privacy Policy')}
          </Link>
        </li>
        <li className={styles.listItem}>
          {l10n.t('that Redis for VS Code will generate Redis Cloud API account and user keys, and store them locally on your machine')}
        </li>
        <li className={styles.listItem}>
          {l10n.t('that usage data will be enabled to help us understand and improve how Redis for VS Code features are used')}
        </li>
      </ul>
    </div>
  )
}

export default OAuthAgreement
