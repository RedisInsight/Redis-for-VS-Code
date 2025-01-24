import React from 'react'
import * as l10n from '@vscode/l10n'
import { VscCheck } from 'react-icons/vsc'
import RedisLogo from 'uiSrc/assets/logo.svg?react'
import { OAUTH_ADVANTAGES_ITEMS } from './constants'

import styles from './styles.module.scss'

const OAuthAdvantages = () => (
  <div className={styles.container} data-testid="oauth-advantages">
    <RedisLogo className={styles.logo} />
    <div>
      <h3 className={styles.title}>{l10n.t('Cloud')}</h3>
    </div>
    <div className={styles.advantages}>
      {OAUTH_ADVANTAGES_ITEMS.map(({ title }) => (
        <div className={styles.advantage} key={title?.toString()}>
          <VscCheck className={styles.advantageIcon} />
          <div className={styles.advantageTitle} color="subdued">{title}</div>
        </div>
      ))}
    </div>
  </div>
)

export default OAuthAdvantages
