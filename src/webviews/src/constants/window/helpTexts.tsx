import React from 'react'
import { VscWarning } from 'react-icons/vsc'

import styles from 'uiSrc/components/popover-delete/styles.module.scss'

const tryFreeHref = 'https://redis.com/try-free/'

export const helpTexts = {
  REJSON_SHOULD_BE_LOADED: (
    <>
      RedisJSON module should be loaded to add this key. Find&nbsp;
      <a
        href="https://oss.redis.com/redisjson/"
        className="link-underline"
        target="_blank"
        rel="noreferrer"
      >
        more information
      </a>
      &nbsp;
      about RedisJSON or create your&nbsp;
      <a href={`${tryFreeHref}?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_redisjson`} className="link-underline" target="_blank" rel="noreferrer">
        free Redis database
      </a>
      &nbsp;
      with RedisJSON on Redis Cloud.
    </>
  ),
  REMOVE_LAST_ELEMENT: (fieldType: string) => (
    <div className={styles.appendInfo}>
      <VscWarning className="mr-1 mt-1" />
      <span>
        If you remove the single
        {' '}
        {fieldType}
        , the whole Key will be deleted.
      </span>
    </div>
  ),
  REMOVING_MULTIPLE_ELEMENTS_NOT_SUPPORT: (
    <>
      Removing multiple elements is available for Redis databases v. 6.2 or
      later. Update your Redis database or create a new&nbsp;
      <a
        href={`${tryFreeHref}?utm_source=redis&utm_medium=app&utm_campaign=redisinsight_redis_latest`}
        target="_blank"
        className="link-underline"
        rel="noreferrer"
      >
        free up-to-date
      </a>
      &nbsp;Redis database.
    </>
  ),
}
