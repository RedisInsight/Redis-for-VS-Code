import React, { FC, PropsWithChildren, useState } from 'react'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import cx from 'classnames'
import { VscChevronRight, VscChevronDown, VscDatabase, VscTerminal, VscAdd, VscRefresh } from 'react-icons/vsc'
import { BiSortDown, BiSortUp } from 'react-icons/bi'
import { useDispatch, useSelector } from 'react-redux'
import * as l10n from '@vscode/l10n'
import { vscodeApi } from 'uiSrc/services'
import { DEFAULT_TREE_SORTING, SortOrder, VscodeMessageAction } from 'uiSrc/constants'
import { appContextDbConfig, resetKeysTree, setKeysTreeSort } from 'uiSrc/slices/app/context/context.slice'
import { TelemetryEvent, getDatabaseId, sendEventTelemetry } from 'uiSrc/utils'

import { fetchPatternKeysAction } from '../../hooks/useKeys'
import styles from './styles.module.scss'

export const DatabaseWrapper: FC<any> = ({ children }: PropsWithChildren<any>) => {
  const { treeViewSort: sorting = DEFAULT_TREE_SORTING } = useSelector(appContextDbConfig)
  const [showTree, setShowTree] = useState<boolean>(true)

  const dispatch = useDispatch()

  const isSortingASC = sorting === SortOrder.ASC
  const showTreeToggle = () => setShowTree(!showTree)

  const addKeyClickHandle = () => {
    vscodeApi.postMessage({ action: VscodeMessageAction.AddKey })
  }

  const openCliClickHandle = () => {
    vscodeApi.postMessage({ action: VscodeMessageAction.OpenCli })
  }

  const changeSortHandle = () => {
    const newSorting = isSortingASC ? SortOrder.DESC : SortOrder.ASC

    dispatch(setKeysTreeSort(newSorting))
    dispatch(resetKeysTree())

    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEYS_SORTED,
      eventData: {
        databaseId: getDatabaseId(),
        sorting: newSorting,
      },
    })
  }

  const refreshHandle = () => {
    fetchPatternKeysAction()
  }

  return (
    <div className="w-full">
      <div className="flex justify-between pt-px">
        <div
          onClick={showTreeToggle}
          role="button"
          aria-hidden="true"
          className={styles.databaseNameWrapper}
        >
          {showTree && (<VscChevronDown className={cx(styles.icon, styles.iconNested)} />)}
          {!showTree && (<VscChevronRight className={cx(styles.icon, styles.iconNested)} />)}
          <VscDatabase className={styles.icon} />
          <span className={styles.databaseName}>
            Redis database
          </span>
        </div>
        <div className="flex pr-3.5">
          <VSCodeButton
            appearance="icon"
            title={l10n.t('Sort by key names displayed')}
            onClick={changeSortHandle}
            data-testid="sort-keys"
          >
            {isSortingASC ? <BiSortDown /> : <BiSortUp />}
          </VSCodeButton>
          <VSCodeButton appearance="icon" onClick={refreshHandle} data-testid="refresh-keys">
            <VscRefresh />
          </VSCodeButton>
          <VSCodeButton appearance="icon" onClick={addKeyClickHandle} data-testid="add-key-button">
            <VscAdd />
          </VSCodeButton>
          <VSCodeButton appearance="icon" onClick={openCliClickHandle} data-testid="terminal-button">
            <VscTerminal />
          </VSCodeButton>
        </div>
      </div>
      {showTree && children}
    </div>
  )
}
