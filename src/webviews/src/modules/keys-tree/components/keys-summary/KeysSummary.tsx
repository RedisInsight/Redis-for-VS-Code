import React from 'react'
import * as l10n from '@vscode/l10n'
import cx from 'classnames'
import { isNull } from 'lodash'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { BiSortDown, BiSortUp } from 'react-icons/bi'
import { VscAdd } from 'react-icons/vsc'

import { TelemetryEvent, nullableNumberWithSpaces, numberWithSpaces, sendEventTelemetry } from 'uiSrc/utils'
import { vscodeApi } from 'uiSrc/services'
import { SortOrder, VscodeMessageAction } from 'uiSrc/constants'
import { Database, useContextApi, useContextInContext } from 'uiSrc/store'
import { Nullable } from 'uiSrc/interfaces'

import styles from './styles.module.scss'

export interface Props {
  database: Database
  nextCursor: string
  scanned: number
  resultsLength: number
  loading: boolean
  total: Nullable<number>
}

export const KeysSummary = (props: Props) => {
  const { loading, total, scanned, nextCursor, resultsLength, database } = props
  const sorting = useContextInContext((state) => state.dbConfig.treeViewSort)

  const scannedDisplay = resultsLength > scanned ? resultsLength : scanned
  const notAccurateScanned = total
    && scanned >= total
    && nextCursor
    && nextCursor !== '0'
    ? '~' : ''

  const contextApi = useContextApi()

  const isSortingASC = sorting === SortOrder.ASC

  const addKeyClickHandle = () => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_ADD_BUTTON_CLICKED,
      eventData: { databaseId: database.id },
    })
    vscodeApi.postMessage({ action: VscodeMessageAction.AddKey, data: database })
  }

  const changeSortHandle = () => {
    const newSorting = isSortingASC ? SortOrder.DESC : SortOrder.ASC

    contextApi.setKeysTreeSort(database.id, newSorting)
    contextApi.resetKeysTree()

    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEYS_SORTED,
      eventData: {
        databaseId: database.id,
        sorting: newSorting,
      },
    })
  }

  return (
    <div className="flex flex-row justify-between pl-6">
      <div className={styles.content} data-testid="keys-summary">
        {(!!total || isNull(total)) && !!scanned && (
        <span>
          (
          <span data-testid="keys-number-of-scanned">{notAccurateScanned}{numberWithSpaces(scannedDisplay)}</span>
          /
          <span data-testid="keys-total">{nullableNumberWithSpaces(total)}</span>
          )
          <span
            className={cx([styles.loading, { [styles.loadingShow]: loading }])}
          />
        </span>
        )}
      </div>
      {/* {loading && !total && !isNull(total) && (
        <div data-testid="scanning-text">
          {l10n.t('Scanning...')}
        </div>
      )} */}

      <div className="flex pr-4">
        <VSCodeButton
          appearance="icon"
          title={l10n.t('Sort by key names displayed')}
          onClick={changeSortHandle}
          data-testid="sort-keys"
        >
          {isSortingASC ? <BiSortDown /> : <BiSortUp />}
        </VSCodeButton>
        <VSCodeButton appearance="icon" onClick={addKeyClickHandle} data-testid="add-key-button">
          <VscAdd />
        </VSCodeButton>
      </div>
    </div>
  )
}