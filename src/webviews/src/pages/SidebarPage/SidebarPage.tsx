import React, { FC } from 'react'
import { DatabaseWrapper, KeysTree, KeysTreeHeader } from 'uiSrc/modules'
import { KeysStoreProvider } from 'uiSrc/modules/keys-tree/hooks/useKeys'
import { ContextStoreProvider, useDatabasesStore } from 'uiSrc/store'

export const SidebarPage: FC<any> = () => {
  const databases = useDatabasesStore((state) => state.data)

  return (
    <div className="flex w-full flex-wrap flex-col min-h-full" data-testid="tree-view-page">
      {databases.map((database) => (
        <ContextStoreProvider key={database.id}>
          <KeysStoreProvider>
            <DatabaseWrapper database={database}>
              <KeysTreeHeader />
              <KeysTree />
            </DatabaseWrapper>
          </KeysStoreProvider>
        </ContextStoreProvider>
      ))}
    </div>
  )
}
