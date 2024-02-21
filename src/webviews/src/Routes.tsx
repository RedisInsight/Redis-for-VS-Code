import React, { useEffect } from 'react'
import {
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom'

import {
  SidebarPage,
  CliPage,
  DatabasePage,
  AddKeyPage,
  KeyDetailsPage,
  NotFoundPage,
  AddDatabasePage,
  EditDatabasePage,
} from 'uiSrc/pages'

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
      <Route path="main" element={<DatabasePage />}>
        <Route path="key" element={<KeyDetailsPage />} />
        <Route path="add_key" element={<AddKeyPage />} />
        <Route path="add_database" element={<AddDatabasePage />} />
        <Route path="edit_database" element={<EditDatabasePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
