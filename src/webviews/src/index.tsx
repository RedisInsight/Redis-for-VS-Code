import React from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter as Router } from 'react-router-dom'

import {
  useSelectedKeyStore,
  fetchEditedDatabase,
  fetchCerts,
  useDatabasesStore,
  useOAuthStore,
} from 'uiSrc/store'
import { Config } from 'uiSrc/modules'
import { AppRoutes } from 'uiSrc/Routes'
import { PostMessage, SelectKeyAction, SetDatabaseAction } from 'uiSrc/interfaces'
import { VscodeMessageAction } from 'uiSrc/constants'
import { migrateLocalStorageData } from 'uiSrc/services'
import { useAppInfoStore } from './store/hooks/use-app-info-store/useAppInfoStore'
import {
  processCliAction,
  setSelectedKeyAction,
  selectKeyAction,
  setDatabaseAction,
  refreshTreeAction,
  addDatabaseAction,
  processOauthCallback,
} from './actions'
import { MonacoLanguages } from './components'
import { CloudAuthResponse } from './modules/oauth/interfaces'

import './styles/main.scss'
import '../vscode.css'

migrateLocalStorageData()

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('message', handleMessage)

  function handleMessage(event: MessageEvent<PostMessage>) {
    const message = event.data

    switch (message.action) {
      // Key details
      case VscodeMessageAction.SelectKey:
        selectKeyAction(message as SelectKeyAction)
        break
      case VscodeMessageAction.ResetSelectedKey:
        useSelectedKeyStore.getState().resetSelectedKeyStore()
        break

      // Sidebar
      case VscodeMessageAction.CloseEula:
        useAppInfoStore.getState().setIsShowConcepts(false)
        break
      case VscodeMessageAction.SetDatabase:
        setDatabaseAction(message as SetDatabaseAction)
        break
      case VscodeMessageAction.SetSelectedKeyAction:
        setSelectedKeyAction(message)
        break
      case VscodeMessageAction.RefreshTree:
        refreshTreeAction(message)
        break
      case VscodeMessageAction.UpdateDatabaseInList:
        useDatabasesStore.getState().setDatabaseToList(message.data?.database!)
        break
      case VscodeMessageAction.AddDatabase:
        addDatabaseAction(message)
        break
      case VscodeMessageAction.EditDatabase:
        fetchCerts(() => {
          fetchEditedDatabase(message?.data?.database as SetDatabaseAction['data']['database'])
        })
        break

      // Settings
      case VscodeMessageAction.UpdateSettings:
        useAppInfoStore.getState().updateUserConfigSettingsSuccess(message.data)
        break
      case VscodeMessageAction.UpdateSettingsDelimiter:
        useAppInfoStore.getState().setDelimiters(message.data)
        break

      // CLI
      case VscodeMessageAction.AddCli:
        processCliAction(message)
        break

      // OAuth
      case VscodeMessageAction.OAuthCallback:
        processOauthCallback(message.data as CloudAuthResponse)
        break
      case VscodeMessageAction.OpenOAuthSsoDialog:
      case VscodeMessageAction.CloseOAuthSsoDialog:
        useOAuthStore.getState().setSSOFlow(message.data?.ssoFlow)
        useOAuthStore.getState().setSocialDialogState(message.data?.source)
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
  <>
    <MonacoLanguages />
    <Router initialEntries={[container?.dataset.route || '']} initialIndex={0}>
      <Config />
      <AppRoutes />
    </Router>
  </>,
)
