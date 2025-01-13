import React from 'react'
import * as l10n from '@vscode/l10n'

import { EXTERNAL_LINKS } from 'uiSrc/constants'
import { Link } from 'uiSrc/ui'
import styles from './styles.module.scss'

export const UnsupportedTypeDetails = () => (
  <div className={styles.container} data-testid="unsupported-type-details">
    <div className="flex items-center justify-center">
      <div className={styles.textWrapper}>
        <h3>{l10n.t('This key type is not currently supported.')}</h3>
        <div>
          {l10n.t('See')}{' '}
          <Link
            target="_blank"
            className="p-0"
            href={EXTERNAL_LINKS.githubRepo}
            data-testid="unsupported-key-github-btn"
          >
            {l10n.t('our repository')}
          </Link>{' '}
          {l10n.t('for the list of supported data types.')}
        </div>
      </div>
    </div>
  </div>
)
