import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  MemoryRouter as Router,
} from 'react-router-dom'
import { Provider } from 'react-redux'

import {
  store,
  useSelectedKeyStore,
  fetchEditedDatabase,
  Database,
} from 'uiSrc/store'
import { Config } from 'uiSrc/modules'
import { AppRoutes } from 'uiSrc/Routes'
import { PostMessage } from 'uiSrc/interfaces'
import { VscodeMessageAction } from 'uiSrc/constants'
import { useAppInfoStore } from './store/hooks/use-app-info-store/useAppInfoStore'
import {
  addKeyAction,
  processCliAction,
  refreshTreeAction,
  selectKeyAction,
} from './actions'

import './styles/main.scss'
import '../vscode.css'

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('message', handleMessage)

  function handleMessage(event: MessageEvent<PostMessage>) {
    const message = event.data

    switch (message.action) {
      // Key details
      case VscodeMessageAction.SelectKey:
        selectKeyAction(message)
        break
      case VscodeMessageAction.AddKey:
        addKeyAction(message)
        break
      case VscodeMessageAction.ResetSelectedKey:
        useSelectedKeyStore.getState().resetSelectedKeyStore()
        break

      // Sidebar
      case VscodeMessageAction.RefreshTree:
        refreshTreeAction(message)
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
        processCliAction(message)
        break
      default:
        break
    }
  }
})

const container = document.getElementById('root')
window.apiPort = container?.dataset.apiPort as string
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
