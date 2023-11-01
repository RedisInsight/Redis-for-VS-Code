import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom'
import { Provider } from 'react-redux'

import App from 'uiSrc/App'
import { KeysTreePage } from 'uiSrc/pages'
import { store } from 'uiSrc/store'
import { Config } from 'uiSrc/modules'

import '../vscode.css'

// TODO: Type the incoming config data
// const config: any = {}
// const workspace = ''

const container = document.getElementById('root')
const root = createRoot(container!) // createRoot(container!) if you use TypeScript

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

function AppRoutes() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(`/${rootEl?.dataset.route}`, { replace: true })
  }, [])

  return (
    <Routes>
      <Route path="view1" element={<App />} />
      <Route path="view2" element={<KeysTreePage />} />
    </Routes>
  )
}

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
