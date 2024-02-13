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
import { RedisString } from 'uiSrc/interfaces'
import { isEqualBuffers } from 'uiSrc/utils'
import { StorageItem, VscodeMessageAction } from 'uiSrc/constants'
import { addCli } from 'uiSrc/modules/cli/slice/cli-settings'
import { localStorageService, sessionStorageService } from './services'

import './styles/main.scss'
import '../vscode.css'

// TODO: Type the incoming config data
// const config: any = {}
// const workspace = ''

// if (root) {
//   workspace = root.getAttribute('data-workspace') || ''
// }

// const rootEl = document.getElementById('root')

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('message', handleMessage)

  function handleMessage(event: any) {
    const message = event.data
    console.debug(message.action)

    switch (message.action) {
      case VscodeMessageAction.SelectKey:
        const { key, databaseId } = message?.data as { key: RedisString, databaseId: string }
        const prevKey = useSelectedKeyStore.getState().data?.name

        if (isEqualBuffers(key, prevKey)) {
          return
        }
        sessionStorageService.set(StorageItem.databaseId, databaseId)
        resetZustand()
        fetchKeyInfo({ key }, true)
        break
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
      case VscodeMessageAction.AddKey:
        sessionStorageService.set(StorageItem.databaseId, message?.data?.id)
        useDatabasesStore.getState().setConnectedDatabase(message?.data as Database)
        break
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
})

const container = document.getElementById('root')
localStorage.setItem('apiPort', container?.dataset.apiPort as string)
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
