import React, { FC, useEffect } from 'react'
import { DatabasePanel } from 'uiSrc/modules'
import { fetchCerts, fetchEditedDatabase, useDatabasesStore } from 'uiSrc/store'

export const EditDatabasePage: FC<any> = () => {
  const database = useDatabasesStore((state) => state.editDatabase)

  useEffect(() => {
    const { database } = window.ri
    fetchCerts(() => {
      fetchEditedDatabase(database!)
    })
  }, [])

  return (
    <div className="flex h-full w-full p-4 overflow-x-auto flex-col" data-testid="panel-view-page">
      <DatabasePanel editMode editedDatabase={database} />
    </div>
  )
}
