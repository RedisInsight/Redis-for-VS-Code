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
          {l10n.t('We are constantly working to launch support for more data types. If you have any ideas or suggestions, please ')}

          <Link
            target="_blank"
            href={EXTERNAL_LINKS.githubIssues}
            data-testid="unsupported-key-github-btn"
          >
            {l10n.t('contact us.')}
          </Link>
        </div>
      </div>
    </div>
  </div>
)
