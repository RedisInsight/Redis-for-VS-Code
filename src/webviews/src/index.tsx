import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  MemoryRouter as Router,
} from 'react-router-dom'
import { Provider } from 'react-redux'

import {
  fetchKeyInfo,
  store,
  resetZustand,
  useSelectedKeyStore,
  fetchEditedDatabase,
  Database,
  useDatabasesStore,
  fetchDatabases,
} from 'uiSrc/store'
import { Config } from 'uiSrc/modules'
import { AppRoutes } from 'uiSrc/Routes'
import { PostMessage } from 'uiSrc/interfaces'
import { isEqualBuffers } from 'uiSrc/utils'
import { StorageItem, VscodeMessageAction } from 'uiSrc/constants'
import { addCli } from 'uiSrc/modules/cli/slice/cli-settings'
import { localStorageService, sessionStorageService } from './services'
import { useAppInfoStore } from './store/hooks/use-app-info-store/useAppInfoStore'

import './styles/main.scss'
import '../vscode.css'

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('message', handleMessage)

  function handleMessage(event: MessageEvent<PostMessage>) {
    const message = event.data

    switch (message.action) {
      // Key details
      case VscodeMessageAction.SelectKey:
        const { key, databaseId } = message?.data
        const prevKey = useSelectedKeyStore.getState().data?.name

        if (isEqualBuffers(key, prevKey)) {
          return
        }
        sessionStorageService.set(StorageItem.databaseId, databaseId)
        resetZustand()
        fetchKeyInfo({ key }, true)
        break
      case VscodeMessageAction.AddKey:
        sessionStorageService.set(StorageItem.databaseId, message?.data?.id)
        useDatabasesStore.getState().setConnectedDatabase(message?.data as Database)
        break
      case VscodeMessageAction.ResetSelectedKey:
        useSelectedKeyStore.getState().resetSelectedKeyStore()
        break

      // Sidebar
      case VscodeMessageAction.RefreshTree:
        if (message.data?.key) {
          useSelectedKeyStore.getState().setSelectedKeyAction(message.data)
        } else {
          fetchDatabases()
        }
        break
      case VscodeMessageAction.EditDatabase:
        fetchEditedDatabase(message?.data as Database)
        break

      // Settings
      case VscodeMessageAction.UpdateSettings:
        useAppInfoStore.getState().updateUserConfigSettingsSuccess(message.data)
        break
      case VscodeMessageAction.UpdateSettingsDelimiter:
        useAppInfoStore.getState().setDelimiter(message.data)
        break

      // CLI
      case VscodeMessageAction.AddCli:
      case VscodeMessageAction.OpenCli:
        const database = message?.data as Database

        localStorageService.set(StorageItem.cliDatabase, database)
        sessionStorageService.set(StorageItem.databaseId, database.id)

        useDatabasesStore.getState().setConnectedDatabase(database)
        store.dispatch(addCli(database))

        break
      default:
        break
    }
  }

  return () => window.removeEventListener('message', handleMessage)
})

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router initialEntries={[container?.dataset.route || '']} initialIndex={0}>
        <Config />
        <AppRoutes />
      </Router>
    </Provider>
  </React.StrictMode>,
)
