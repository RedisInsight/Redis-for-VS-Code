import React, { FC } from 'react'
import { Outlet } from 'react-router-dom'
import { GlobalToasts } from 'uiSrc/components'

export const MainPage: FC = () => (
  <div className="block h-full w-full overflow-x-auto">
    <Outlet />
    <GlobalToasts />
  </div>
)
