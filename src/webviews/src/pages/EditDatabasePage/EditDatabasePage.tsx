import React, { FC, useEffect } from 'react'
import * as l10n from '@vscode/l10n'
import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react'
import { DatabasePanel } from 'uiSrc/modules'
import { fetchCerts, fetchEditedDatabase, useDatabasesStore } from 'uiSrc/store'

export const EditDatabasePage: FC<any> = () => {
  const database = useDatabasesStore((state) => state.editDatabase)

  useEffect(() => {
    const { database } = window.ri || {}
    fetchCerts(() => {
      fetchEditedDatabase(database!)
    })
  }, [])

  return (
    <div className="flex h-full w-full p-4 overflow-x-auto flex-col" data-testid="panel-view-page">
      <h1 className="text-2xl pt-4 pb-4">
        {l10n.t('Edit Redis database')}
      </h1>
      <VSCodeDivider className="divider" />
      <DatabasePanel editMode editedDatabase={database} />
    </div>
  )
}
