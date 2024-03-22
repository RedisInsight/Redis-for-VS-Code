import React, { useEffect, useState } from 'react'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import cx from 'classnames'
import { VscChevronRight, VscChevronDown, VscTerminal, VscAdd, VscEdit } from 'react-icons/vsc'
import { BiSortDown, BiSortUp } from 'react-icons/bi'
import * as l10n from '@vscode/l10n'
import { useShallow } from 'zustand/react/shallow'

import { sessionStorageService, vscodeApi } from 'uiSrc/services'
import { POPOVER_WINDOW_BORDER_WIDTH, SelectedKeyActionType, SortOrder, StorageItem, VscodeMessageAction } from 'uiSrc/constants'
import {
  TelemetryEvent,
  formatLongName,
  getDatabaseId,
  getDbIndex,
  getRedisModulesSummary,
  sendEventTelemetry,
} from 'uiSrc/utils'
import { Database, checkConnectToDatabase, deleteDatabases, useContextApi, useContextInContext, useSelectedKeyStore } from 'uiSrc/store'
import DatabaseOfflineIconSvg from 'uiSrc/assets/database/database_icon_offline.svg?react'
import DatabaseActiveIconSvg from 'uiSrc/assets/database/database_icon_active.svg?react'
import { PopoverDelete } from 'uiSrc/components'
import { RefreshBtn } from 'uiSrc/ui'
import { useKeysApi, useKeysInContext } from '../../hooks/useKeys'

import styles from './styles.module.scss'

export interface Props {
  database: Database
  children: React.ReactNode
}

export const DatabaseWrapper = ({ children, database }: Props) => {
  const { id, name } = database
  const sorting = useContextInContext((state) => state.dbConfig.treeViewSort)

  const lastRefreshTime = useKeysInContext((state) => state.data.lastRefreshTime)
  const { selectedKeyAction, setSelectedKeyAction } = useSelectedKeyStore(useShallow((state) => ({
    selectedKeyAction: state.action,
    setSelectedKeyAction: state.setSelectedKeyAction,
  })))

  const [showTree, setShowTree] = useState<boolean>(false)

  const keysApi = useKeysApi()
  const contextApi = useContextApi()

  const isSortingASC = sorting === SortOrder.ASC

  useEffect(() => {
    const { type, key, keyType, databaseId, newKey } = selectedKeyAction || {}

    if (!type || databaseId !== database.id) {
      return
    }

    switch (type) {
      case SelectedKeyActionType.Added:
        keysApi.addKeyIntoTree(key!, keyType!)
        break
      case SelectedKeyActionType.Removed:
        keysApi.deleteKeyFromTree(key!)
        break
      case SelectedKeyActionType.Renamed:
        keysApi.editKeyName(key!, newKey!)
        break
      default:
        break
    }
    setSelectedKeyAction(null)
  }, [selectedKeyAction])

  const handleCheckConnectToDatabase = ({ id, provider, modules }: Database) => {
    if (showTree) {
      setShowTree(false)
      return
    }
    const modulesSummary = getRedisModulesSummary(modules)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE,
      eventData: {
        databaseId: id,
        provider,
        ...modulesSummary,
      },
    })

    checkConnectToDatabase(id, connectToInstance)
  }

  const connectToInstance = (id = '') => {
    keysApi.setDatabaseId(id)

    // todo: fix for cli first open
    sessionStorageService.set(StorageItem.databaseId, database.id)
    sessionStorageService.set(StorageItem.cliDatabase, database)
    // contextApi.setDatabaseId(id)
    setShowTree(!showTree)
  }

  const addKeyClickHandle = () => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_ADD_BUTTON_CLICKED,
      eventData: { databaseId: id },
    })
    vscodeApi.postMessage({ action: VscodeMessageAction.AddKey, data: database })
  }

  const openCliClickHandle = () => {
    vscodeApi.postMessage({ action: VscodeMessageAction.AddCli, data: database })
  }

  const changeSortHandle = () => {
    const newSorting = isSortingASC ? SortOrder.DESC : SortOrder.ASC

    contextApi.setKeysTreeSort(id, newSorting)
    contextApi.resetKeysTree()

    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEYS_SORTED,
      eventData: {
        databaseId: getDatabaseId(),
        sorting: newSorting,
      },
    })
  }

  const editHandle = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_EDIT_CLICKED,
      eventData: {
        databaseId: id,
      },
    })

    vscodeApi.postMessage({ action: VscodeMessageAction.EditDatabase, data: database })
  }

  const deleteDatabaseHandle = () => {
    deleteDatabases([database])
  }

  const clickDeleteDatabaseHandle = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_SINGLE_DATABASE_DELETE_CLICKED,
      eventData: {
        databaseId: id,
      },
    })
  }

  const refreshHandle = () => {
    keysApi.fetchPatternKeysAction()
  }

  return (
    <div className={cx('flex w-full flex-col')}>
      <div className={cx('flex justify-between pt-px flex-row flex-1 max-h-[22px]', { 'flex-col pr-3': !showTree })}>
        <div
          onClick={() => handleCheckConnectToDatabase(database)}
          role="button"
          aria-hidden="true"
          className={styles.databaseNameWrapper}
          data-testid={`database-${id}`}
        >
          {showTree && (<VscChevronDown className={cx(styles.icon, styles.iconNested)} />)}
          {showTree && (<DatabaseActiveIconSvg className={styles.icon} />)}
          {!showTree && (<VscChevronRight className={cx(styles.icon, styles.iconNested)} />)}
          {!showTree && (<DatabaseOfflineIconSvg className={styles.icon} />)}
          <div className={styles.databaseName}>
            <div className="truncate">{name}</div>
            <div>{getDbIndex(database.db)}</div>
          </div>
        </div>
        {showTree && (
          <div className="flex pr-3.5">
            <VSCodeButton
              appearance="icon"
              title={l10n.t('Sort by key names displayed')}
              onClick={changeSortHandle}
              data-testid="sort-keys"
            >
              {isSortingASC ? <BiSortDown /> : <BiSortUp />}
            </VSCodeButton>
            <RefreshBtn
              lastRefreshTime={lastRefreshTime}
              position="left center"
              onClick={refreshHandle}
              triggerTestid="refresh-keys"
            />
            <VSCodeButton appearance="icon" onClick={editHandle} data-testid="edit-database">
              <VscEdit />
            </VSCodeButton>
            <VSCodeButton appearance="icon" onClick={addKeyClickHandle} data-testid="add-key-button">
              <VscAdd />
            </VSCodeButton>
            <PopoverDelete
              header={formatLongName(name, 50, 10, '...')}
              text={l10n.t('will be deleted from RedisInsight.')}
              item={id}
              maxWidth={window.innerWidth - POPOVER_WINDOW_BORDER_WIDTH}
              disabled={false}
              handleDeleteItem={() => deleteDatabaseHandle()}
              handleButtonClick={() => clickDeleteDatabaseHandle()}
              testid={`delete-database-${id}`}
            />
            <VSCodeButton appearance="icon" onClick={openCliClickHandle} data-testid="terminal-button">
              <VscTerminal />
            </VSCodeButton>
          </div>
        )}
      </div>
      {showTree && children}
    </div>
  )
}
