import React from 'react'
import { APPLICATION_NAME } from 'uiSrc/constants'

import { Link } from 'uiSrc/ui'
import styles from './styles.module.scss'

const MessageStandalone = () => (
  <div className={styles.message} data-testid="summary">
    You can manually add your Redis databases. Enter Host and Port of your
    Redis database to add it to
    {' '}
    {APPLICATION_NAME}
    . &nbsp;
    <Link
      color="text"
      href="https://docs.redis.com/latest/ri/using-redisinsight/add-instance/"
      className={styles.link}
      target="_blank"
    >
      Learn more here.
    </Link>
  </div>
)

const MessageSentinel = () => (
  <div className={styles.message} data-testid="summary">
    You can automatically discover and add primary groups from your Redis
    Sentinel. Enter Host and Port of your Redis Sentinel to automatically
    discover your primary groups and add them to
    {' '}
    {APPLICATION_NAME}
    . &nbsp;
    <Link
      color="text"
      href="https://redis.io/docs/management/sentinel/"
      className={styles.link}
      target="_blank"
    >
      Learn more here.
    </Link>
  </div>
)

export {
  MessageStandalone,
  MessageSentinel,
}
