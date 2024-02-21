import React, { FC } from 'react'
import { DatabasePanel } from 'uiSrc/modules'
import { useDatabasesStore } from 'uiSrc/store'

export const EditDatabasePage: FC<any> = () => {
  const database = useDatabasesStore((state) => state.editDatabase)

  return (
    <div className="flex h-full w-full p-4 overflow-x-auto flex-col" data-testid="panel-view-page">
      <DatabasePanel editMode editedDatabase={database} />
    </div>
  )
}
