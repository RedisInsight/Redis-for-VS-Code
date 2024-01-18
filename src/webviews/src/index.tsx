import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  MemoryRouter as Router,
} from 'react-router-dom'
import { Provider } from 'react-redux'

import { fetchKeyInfo, store, resetZustand, useSelectedKeyStore } from 'uiSrc/store'
import { Config } from 'uiSrc/modules'
import { AppRoutes } from 'uiSrc/Routes'
import { RedisString } from 'uiSrc/interfaces'
import { isEqualBuffers } from 'uiSrc/utils'
import { VscodeMessageAction } from 'uiSrc/constants'
import { addCli } from 'uiSrc/modules/cli/slice/cli-settings'
import { fetchPatternKeysAction } from './modules/keys-tree/hooks/useKeys'
import { Database } from './slices/connections/databases/interface'
import { fetchEditedDatabaseAction, setEditDatabase } from './slices/connections/databases/databases.slice'

import './styles/main.scss'
import '../vscode.css'

// TODO: Type the incoming config data
// const config: any = {}
// const workspace = ''

const container = document.getElementById('root')
const root = createRoot(container!)

// if (root) {
//   workspace = root.getAttribute('data-workspace') || ''
// }

// const rootEl = document.getElementById('root')

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('message', handleMessage)

  function handleMessage(event: any) {
    const message = event.data

    switch (message.action) {
      case VscodeMessageAction.SelectKey:
        const { data } = message as { data: RedisString }
        const prevKey = useSelectedKeyStore.getState().data?.name

        if (isEqualBuffers(data, prevKey)) {
          return
        }
        resetZustand()
        fetchKeyInfo(data)
        break
      case VscodeMessageAction.RefreshTree:
        fetchPatternKeysAction()
        break
      case VscodeMessageAction.EditDatabase:
        const { data: database } = message as { data: Database }
        store.dispatch(fetchEditedDatabaseAction(database))
        break
      default:
        break
    }
    if (message.action === VscodeMessageAction.AddCli) {
      // TODO: change logic after DB connection will be implemented
      store.dispatch(addCli())
    }
  }
})

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
