import React from 'react'
import { VscWarning } from 'react-icons/vsc'
import * as l10n from '@vscode/l10n'

import styles from 'uiSrc/components/popover-delete/styles.module.scss'

const tryFreeHref = 'https://redis.com/try-free/'

export const helpTexts = {
  REJSON_SHOULD_BE_LOADED: (
    <>
      {l10n.t('RedisJSON module should be loaded to add this key. Find ')}
      <a
        href="https://oss.redis.com/redisjson/"
        className="link-underline"
        target="_blank"
        rel="noreferrer"
      >
        {l10n.t('more information')}
      </a>
      {l10n.t(' about RedisJSON or create your ')}
      <a href={`${tryFreeHref}?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_redisjson`} className="underline hover:no-underline" target="_blank" rel="noreferrer">
        {l10n.t('free Redis database')}
      </a>
      {l10n.t(' with RedisJSON on Redis Cloud.')}
    </>
  ),
  REMOVE_LAST_ELEMENT: (fieldType: string) => (
    <div className={styles.appendInfo}>
      <VscWarning className="mr-1 mt-1" />
      <span>
        {l10n.t('If you remove the single {0}, the whole Key will be deleted.', fieldType)}
      </span>
    </div>
  ),
  REMOVING_MULTIPLE_ELEMENTS_NOT_SUPPORT: (
    <>
      {l10n.t('Removing multiple elements is available for Redis databases v. 6.2 or later. Update your Redis database or create a new ')}
      <a
        href={`${tryFreeHref}?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_redis_latest`}
        target="_blank"
        className="underline hover:no-underline"
        rel="noreferrer"
      >
        {l10n.t('free up-to-date')}
      </a>
      {l10n.t(' Redis database.')}
    </>
  ),
}
