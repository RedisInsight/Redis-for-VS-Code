import React, { useEffect } from 'react'
import {
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom'

import {
  SidebarPage,
  CliPage,
  MainPage,
  AddKeyPage,
  KeyDetailsPage,
  NotFoundPage,
  AddDatabasePage,
  EditDatabasePage,
  SettingsPage,
  EulaPage,
  WelcomePage,
} from 'uiSrc/pages'

import { OAuthSsoDialog } from './modules/oauth'

const rootEl = document.getElementById('root')

export const AppRoutes = () => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(`/${rootEl?.dataset.route}`, { replace: true })
  }, [])

  return (
    <Routes>
      <Route path="sidebar" element={<SidebarPage />} />
      <Route path="cli" element={<CliPage />} />
      <Route path="main" element={<MainPage />}>
        <Route path="key" element={<KeyDetailsPage />} />
        <Route path="add_key" element={<AddKeyPage />} />
        <Route path="add_database" element={<AddDatabasePage />} />
        <Route path="edit_database" element={<EditDatabasePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="eula" element={<EulaPage />} />
        <Route path="welcome" element={<WelcomePage />} />
        <Route path="oauth_sso_dialog" element={<OAuthSsoDialog />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
