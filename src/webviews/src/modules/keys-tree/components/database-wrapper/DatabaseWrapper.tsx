import React, { useEffect, useState } from 'react'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import cx from 'classnames'
import { VscChevronRight, VscChevronDown, VscTerminal, VscEdit } from 'react-icons/vsc'
import * as l10n from '@vscode/l10n'
import { useShallow } from 'zustand/react/shallow'

import { sessionStorageService, vscodeApi } from 'uiSrc/services'
import { POPOVER_WINDOW_BORDER_WIDTH, SelectedKeyActionType, StorageItem, VscodeMessageAction } from 'uiSrc/constants'
import {
  TelemetryEvent,
  formatLongName,
  getDbIndex,
  getRedisModulesSummary,
  sendEventTelemetry,
} from 'uiSrc/utils'
import { Database, checkConnectToDatabase, deleteDatabases, useSelectedKeyStore } from 'uiSrc/store'
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

  const lastRefreshTime = useKeysInContext((state) => state.data.lastRefreshTime)
  const { selectedKeyAction, setSelectedKeyAction, setSelectedKey } = useSelectedKeyStore(useShallow((state) => ({
    selectedKeyAction: state.action,
    setSelectedKeyAction: state.setSelectedKeyAction,
    setSelectedKey: state.processSelectedKeySuccess,
  })))

  const [showTree, setShowTree] = useState<boolean>(false)

  const keysApi = useKeysApi()

  useEffect(() => {
    const { type, key, keyType, database: databaseAction, newKey } = selectedKeyAction || {}
    const { id: databaseId } = databaseAction || {}

    if (!type || databaseId !== database.id) {
      return
    }

    switch (type) {
      case SelectedKeyActionType.Added:
        keysApi.addKeyIntoTree(key!, keyType!)
        setSelectedKey({ name: key! })
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

  const openCliClickHandle = () => {
    vscodeApi.postMessage({ action: VscodeMessageAction.AddCli, data: database })
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
      <div className={cx('flex justify-between flex-1 min-h-[22px] flex-row group')}>
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
        <div className="flex pr-3.5">
          {showTree && (
            <RefreshBtn
              lastRefreshTime={lastRefreshTime}
              position="left center"
              onClick={refreshHandle}
              triggerTestid="refresh-keys"
            />
          )}
          <VSCodeButton
            appearance="icon"
            onClick={editHandle}
            className={cx('hidden', 'group-hover:!flex', { '!flex': showTree })}
            data-testid="edit-database"
          >
            <VscEdit />
          </VSCodeButton>
          <PopoverDelete
            header={formatLongName(name, 50, 10, '...')}
            text={l10n.t('will be deleted from Redis for VS Code.')}
            item={id}
            maxWidth={window.innerWidth - POPOVER_WINDOW_BORDER_WIDTH}
            disabled={false}
            triggerClassName={cx('hidden h-[22px] group-hover:!flex', { '!flex': showTree })}
            handleDeleteItem={() => deleteDatabaseHandle()}
            handleButtonClick={() => clickDeleteDatabaseHandle()}
            testid={`delete-database-${id}`}
          />
          {showTree && (
            <VSCodeButton appearance="icon" onClick={openCliClickHandle} data-testid="terminal-button">
              <VscTerminal />
            </VSCodeButton>
          )}
        </div>
      </div>
      {showTree && children}
    </div>
  )
}
