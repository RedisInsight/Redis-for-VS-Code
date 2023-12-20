import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  MemoryRouter as Router,
} from 'react-router-dom'
import { Provider } from 'react-redux'

import { fetchKeyInfo, store } from 'uiSrc/store'
import { fetchPatternKeysAction, Config } from 'uiSrc/modules'
import { AppRoutes } from './Routes'
import { VscodeMessageAction, SCAN_TREE_COUNT_DEFAULT } from './constants'

import '../vscode.css'

// TODO: Type the incoming config data
// const config: any = {}
// const workspace = ''

const container = document.getElementById('root')
const root = createRoot(container!)

// if (root) {
//   workspace = root.getAttribute('data-workspace') || ''
// }

const rootEl = document.getElementById('root')

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('message', handleMessage)

  function handleMessage(event:any) {
    const message = event.data

    switch (message.action) {
      case VscodeMessageAction.SelectKey:
        const { data } = message
        fetchKeyInfo(data)
        break
      case VscodeMessageAction.RefreshTree:
        store.dispatch(fetchPatternKeysAction('0', SCAN_TREE_COUNT_DEFAULT))
        break
      default:
        break
    }
  }
})

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router initialEntries={[rootEl?.dataset.route || '']} initialIndex={0}>
        <Config />
        <AppRoutes />
      </Router>
    </Provider>
  </React.StrictMode>,
)
