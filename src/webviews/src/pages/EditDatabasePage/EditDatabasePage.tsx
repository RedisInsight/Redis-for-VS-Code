import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import { DatabasePanel } from 'uiSrc/modules'
import { editDatabaseSelector } from 'uiSrc/slices/connections/databases/databases.slice'

export const EditDatabasePage: FC<any> = () => {
  const database = useSelector(editDatabaseSelector)

  return (
    <div className="flex h-full w-full p-4 overflow-x-auto flex-col" data-testid="panel-view-page">
      <DatabasePanel editMode editedDatabase={database} />
    </div>
  )
}
