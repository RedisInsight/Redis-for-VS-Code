import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  MemoryRouter as Router,
} from 'react-router-dom'
import { Provider } from 'react-redux'

import { fetchKeyInfo, store, useSelectedKeyStore } from 'uiSrc/store'
import { Config } from 'uiSrc/modules'
import { AppRoutes } from 'uiSrc/Routes'
import { VscodeMessageAction } from 'uiSrc/constants'

import 'uiSrc/styles/main.scss'
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

  function handleMessage(event:any) {
    const message = event.data

    if (message.action === VscodeMessageAction.SelectKey) {
      const { data } = message
      fetchKeyInfo(data)
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
