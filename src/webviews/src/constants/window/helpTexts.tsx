import React from 'react'
import { VscWarning } from 'react-icons/vsc'
import * as l10n from '@vscode/l10n'
import { Link } from 'react-router-dom'

import { getUtmExternalLink } from 'uiSrc/utils'
import { EXTERNAL_LINKS, UTM_CAMPAIGNS } from 'uiSrc/constants'
import styles from 'uiSrc/components/popover-delete/styles.module.scss'

export const helpTexts = {
  REJSON_SHOULD_BE_LOADED: (
    <>
      {l10n.t('RedisJSON module should be loaded to add this key. Find ')}
      <Link
        to={getUtmExternalLink(EXTERNAL_LINKS.jsonModule, { campaign: UTM_CAMPAIGNS.tutorials })}
        className="underline hover:no-underline"
        target="_blank"
        data-test-subj="no-json-module-info"
      >
        {l10n.t('more information')}
      </Link>
      {l10n.t(' about RedisJSON or create your ')}
      <Link
        to={getUtmExternalLink(EXTERNAL_LINKS.tryFree, { campaign: UTM_CAMPAIGNS.redisjson })}
        className="underline hover:no-underline"
        target="_blank"
        data-test-subj="no-json-module-try-free"
      >
        {l10n.t('free Redis database')}
      </Link>
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
      <Link
        to={getUtmExternalLink(EXTERNAL_LINKS.tryFree, { campaign: UTM_CAMPAIGNS.redisLatest })}
        className="underline hover:no-underline"
        target="_blank"
        data-test-subj="no-json-module-try-free"
      >
        {l10n.t('free up-to-date')}
      </Link>
      {l10n.t(' Redis database.')}
    </>
  ),
}
