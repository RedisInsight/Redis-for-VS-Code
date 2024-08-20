import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import React, { FC } from 'react'

import { VscodeMessageAction } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/interfaces'
import { vscodeApi } from 'uiSrc/services'
import { Database } from 'uiSrc/store'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import { Tooltip } from 'uiSrc/ui'

import styles from './styles.module.scss'

export interface Props {
  total: Nullable<number>
  database: Database
}

export const NoKeysMessage: FC<Props> = (props) => {
  const {
    total,
    database,
  } = props

  const handleAddKey = () => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_ADD_BUTTON_CLICKED,
      eventData: { databaseId: database.id },
    })
    vscodeApi.postMessage({ action: VscodeMessageAction.AddKey, data: { database } })
  }

  // TODO: will be implemented in the future
  // const { selectedIndex, isSearched: redisearchIsSearched } = useSelector(redisearchSelector)
  // const { isSearched: patternIsSearched, isFiltered, searchMode } = useSelector(keysSelector)

  // if (searchMode === SearchMode.Redisearch) {
  //   if (!selectedIndex) {
  //     return NoSelectedIndexText
  //   }

  //   if (total === 0) {
  //     return NoResultsFoundText
  //   }

  //   if (redisearchIsSearched) {
  //     return scanned < total ? NoResultsFoundText : FullScanNoResultsFoundText
  //   }
  // }

  if (total === 0) {
    return (
      <div className="flex justify-between">
        <div>{l10n.t('Keys are the foundation of Redis.')}</div>
        <Tooltip content={l10n.t('Add key')}>
          <VSCodeButton
            appearance="primary"
            data-testid="add-key-from-tree"
            className={styles.addKey}
            onClick={handleAddKey}
          >
            {l10n.t('Add key')}
          </VSCodeButton>
        </Tooltip>
      </div>
    )
  }

  // if (patternIsSearched) {
  //   return scanned < total ? ScanNoResultsFoundText : FullScanNoResultsFoundText
  // }

  // if (isFiltered && scanned < total) {
  //   return ScanNoResultsFoundText
  // }

  return l10n.t('No results found.')
}
