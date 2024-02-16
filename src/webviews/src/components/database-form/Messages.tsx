import React from 'react'
import * as l10n from '@vscode/l10n'
import { APPLICATION_NAME } from 'uiSrc/constants'

import { Link } from 'uiSrc/ui'
import styles from './styles.module.scss'

const MessageStandalone = () => (
  <div className={styles.message} data-testid="summary">
    {l10n.t('You can manually add your Redis databases. Enter Host and Port of yourRedis database to add it to ')}
    {APPLICATION_NAME}
    . &nbsp;
    <Link
      color="text"
      href="https://docs.redis.com/latest/ri/using-redisinsight/add-instance/"
      className={styles.link}
      target="_blank"
    >
      {l10n.t('Learn more here.')}
    </Link>
  </div>
)

export {
  MessageStandalone,
}
