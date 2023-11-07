import React, { useEffect } from 'react'
import {
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom'

import App from 'uiSrc/App'
import { KeysTreePage, CliPage } from 'uiSrc/pages'

const rootEl = document.getElementById('root')

export const AppRoutes = () => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(`/${rootEl?.dataset.route}`, { replace: true })
  }, [])

  return (
    <Routes>
      <Route path="tree" element={<KeysTreePage />} />
      <Route path="cli" element={<CliPage />} />
      <Route path="view1" element={<App />} />
    </Routes>
  )
}
