import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import { DatabasePanel } from 'uiSrc/modules'
import { editDatabaseSelector } from 'uiSrc/slices/connections/databases/databases.slice'

export const EditDatabasePage: FC<any> = () => {
  const database = useSelector(editDatabaseSelector)

  // const db = {
  //   timeout: 30000,
  //   id: '06e7d670-fc3d-474a-beb4-4f12a358a0f0',
  //   host: '127.0.0.1',
  //   port: 6379,
  //   name: 'loccalhostu oeu',
  //   db: null,
  //   connectionType: 'STANDALONE',
  //   provider: 'LOCALHOST',
  //   lastConnection: '2024-01-16T19:53:32.472Z',
  //   modules: [],
  //   new: false,
  //   cloudDetails: null,
  //   version: '7.0.12',
  //   isRediStack: false,
  // }

  return (
    <div className="flex h-full w-full p-4 overflow-x-auto flex-col" data-testid="panel-view-page">
      <DatabasePanel editMode editedDatabase={database} />
    </div>
  )
}
