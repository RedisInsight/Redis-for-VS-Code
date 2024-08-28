import React from 'react'
import * as l10n from '@vscode/l10n'

import { EXTERNAL_LINKS } from 'uiSrc/constants'
import { Link } from 'uiSrc/ui'
import styles from './styles.module.scss'

export const UnsupportedTypeDetails = () => (
  <div className={styles.container} data-testid="unsupported-type-details">
    <div className="flex items-center justify-center">
      <div className={styles.textWrapper}>
        <h3>{l10n.t('This data type is not currently supported.')}</h3>
        <div>
          {l10n.t('See our repository for the list of ')}
          <Link
            target="_blank"
            className="pl-0"
            href={EXTERNAL_LINKS.githubIssues}
            data-testid="unsupported-key-github-btn"
          >
            {l10n.t('supported data types.')}
          </Link>
        </div>
      </div>
    </div>
  </div>
)
