import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  MemoryRouter as Router,
} from 'react-router-dom'
import { Provider } from 'react-redux'

import { fetchKeyInfo, resetZustand, store, useSelectedKeyStore } from 'uiSrc/store'
import { Config } from 'uiSrc/modules'
import { AppRoutes } from 'uiSrc/Routes'
import { RedisString } from 'uiSrc/interfaces'
import { isEqualBuffers } from 'uiSrc/utils'
import { VscodeMessageAction } from 'uiSrc/constants'

import 'uiSrc/styles/main.scss'

import '../vscode.css'

// TODO: Type the incoming config data
// const config: any = {}
// const workspace = ''

const container = document.getElementById('root')
const root = createRoot(container!)
localStorage.setItem('apiPort', container?.dataset.apiPort as string)

// if (root) {
//   workspace = root.getAttribute('data-workspace') || ''
// }

// const rootEl = document.getElementById('root')

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('message', handleMessage)

  function handleMessage(event: any) {
    const message = event.data

    if (message.action === VscodeMessageAction.SelectKey) {
      const { data } = message as { data: RedisString }
      const prevKey = useSelectedKeyStore.getState().data?.name

      if (isEqualBuffers(data, prevKey)) {
        return
      }
      resetZustand()
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
