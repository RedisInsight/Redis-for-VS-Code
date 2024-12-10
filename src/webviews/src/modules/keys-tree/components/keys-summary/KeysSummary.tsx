import React from 'react'
import * as l10n from '@vscode/l10n'
import cx from 'classnames'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { BiSortDown, BiSortUp } from 'react-icons/bi'
import { VscAdd, VscDatabase, VscTerminal } from 'react-icons/vsc'
import { isUndefined } from 'lodash'

import { TelemetryEvent, nullableNumberWithSpaces, numberWithSpaces, sendEventTelemetry } from 'uiSrc/utils'
import { vscodeApi } from 'uiSrc/services'
import { SortOrder, VscodeMessageAction } from 'uiSrc/constants'
import { checkDatabaseIndexAction, Database, useContextApi, useContextInContext } from 'uiSrc/store'
import { Maybe, Nullable } from 'uiSrc/interfaces'
import { Chevron, RefreshBtn, Tooltip } from 'uiSrc/ui'

import { KeyTreeFilter } from '../keys-tree-filter'
import { useKeysApi, useKeysInContext } from '../../hooks/useKeys'
import styles from './styles.module.scss'

export interface Props {
  database: Database
  scanned: number
  resultsLength: number
  loading: boolean
  total: Nullable<number>
  showTree: boolean
  dbIndex: Maybe<number>
  toggleShowTree: (value?: boolean) => void
}

export const KeysSummary = (props: Props) => {
  const { loading, total, scanned, resultsLength, database, showTree, dbIndex, toggleShowTree } = props
  const sorting = useContextInContext((state) => state.dbConfig.treeViewSort)
  const lastRefreshTime = useKeysInContext((state) => state.data.lastRefreshTime)

  const isMultiDbIndex = !isUndefined(dbIndex)
  const contextApi = useContextApi()
  const keysApi = useKeysApi()

  const isSortingASC = sorting === SortOrder.ASC

  const addKeyClickHandle = () => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_ADD_BUTTON_CLICKED,
      eventData: { databaseId: database.id },
    })
    vscodeApi.postMessage({
      action: VscodeMessageAction.AddKey,
      data: { database: { ...database, db: dbIndex } },
    })
  }

  const changeSortHandle = () => {
    const newSorting = isSortingASC ? SortOrder.DESC : SortOrder.ASC

    contextApi.setKeysTreeSort(database.id, newSorting)

    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEYS_SORTED,
      eventData: {
        databaseId: database.id,
        sorting: newSorting,
      },
    })
  }

  const handleToggleShowTree = () => {
    if (!isMultiDbIndex) {
      return
    }
    if (!showTree) {
      checkDatabaseIndexAction(database.id, dbIndex, () => toggleShowTree())
      return
    }
    toggleShowTree()
  }

  const openCliClickHandle = () => {
    vscodeApi.postMessage({
      action: VscodeMessageAction.AddCli,
      data: { database: { ...database, db: dbIndex } },
    })
  }

  const refreshHandle = () => {
    keysApi.fetchPatternKeysAction()
  }

  const DbIndex = () => {
    if (!isMultiDbIndex) return null
    return (
      <>
        <VscDatabase />
        <span className="px-1">{dbIndex}</span>
      </>
    )
  }

  const Summary = () => {
    if (!showTree) {
      return (
        <span>
          {'('}
          <span data-testid="keys-total">{nullableNumberWithSpaces(total)}</span>
          {')'}
        </span>
      )
    }

    return (
      <span>
        {'('}
        <span data-testid="keys-number-of-results">{numberWithSpaces(resultsLength)}</span>
        {' / '}
        <span data-testid="keys-total">{nullableNumberWithSpaces(total)}</span>
        {')'}
        <span
          className={cx(styles.loading, { [styles.loadingShow]: loading })}
        />
      </span>
    )
  }

  return (
    <div className={cx(styles.container, 'group')}>
      <div
        className={cx(styles.content, { 'cursor-pointer pl-0': isMultiDbIndex })}
        onClick={handleToggleShowTree}
        data-testid="keys-summary"
      >
        {<Chevron open={showTree} hidden={!isMultiDbIndex} />}
        {<DbIndex />}
        {<Summary />}
      </div>
      {/* {loading && !total && !isNull(total) && (
        <div data-testid="scanning-text">
          {l10n.t('Scanning...')}
        </div>
      )} */}

      <div className={cx('hidden', 'pr-3.5', 'group-hover:!flex', { '!flex': showTree })}>
        <Tooltip
          keepTooltipInside={false}
          content={l10n.t('Sort by key names displayed')}
          position="bottom right"
        >
          <VSCodeButton
            appearance="icon"
            onClick={changeSortHandle}
            data-testid="sort-keys"
          >
            {isSortingASC ? <BiSortDown /> : <BiSortUp />}
          </VSCodeButton>
        </Tooltip>
        <KeyTreeFilter />
        <VSCodeButton appearance="icon" onClick={addKeyClickHandle} data-testid="add-key-button">
          <VscAdd />
        </VSCodeButton>
        <RefreshBtn
          lastRefreshTime={lastRefreshTime}
          position="left center"
          onClick={refreshHandle}
          triggerTestid="refresh-keys"
        />
        <VSCodeButton appearance="icon" onClick={openCliClickHandle} data-testid="terminal-button">
          <VscTerminal />
        </VSCodeButton>
      </div>
    </div>
  )
}
