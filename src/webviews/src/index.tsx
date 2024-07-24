import React from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter as Router } from 'react-router-dom'

import {
  useSelectedKeyStore,
  fetchEditedDatabase,
  Database,
  fetchCerts,
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
import { MonacoLanguages } from './components'

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
      case VscodeMessageAction.CloseEula:
        useAppInfoStore.getState().setIsShowConcepts(false)
        break
      case VscodeMessageAction.RefreshTree:
        refreshTreeAction(message)
        break
      case VscodeMessageAction.EditDatabase:
        fetchCerts(() => {
          fetchEditedDatabase(message?.data as Database)
        })
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
