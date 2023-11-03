import React from 'react'
import { createRoot } from 'react-dom/client'
import {
  MemoryRouter as Router,
} from 'react-router-dom'
import { Provider } from 'react-redux'

import { store } from 'uiSrc/store'
import { Config } from 'uiSrc/modules'
import { AppRoutes } from './Routes'

import '../vscode.css'

// TODO: Type the incoming config data
// const config: any = {}
// const workspace = ''

const container = document.getElementById('root')
const root = createRoot(container!)

// if (root) {
//   workspace = root.getAttribute('data-workspace') || ''
// }

window.addEventListener('message', (e) => {
  // Here's where you'd do stuff with the message
  // Maybe stick it into state management or something?
  const message = e.data
  console.debug(message)
})

const rootEl = document.getElementById('root')

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
