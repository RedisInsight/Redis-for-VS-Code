import React, { FC } from 'react'
import { Outlet, useParams } from 'react-router-dom'

export const DatabasePage: FC = () => {
  const { databaseId } = useParams()
  return (
    <div className="block h-full w-full overflow-x-auto" data-testid={`database-${databaseId}-page`}>
      <Outlet />
    </div>
  )
}
