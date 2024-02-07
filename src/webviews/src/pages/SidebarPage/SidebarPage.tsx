import React, { FC, useEffect, useRef } from 'react'
import { DatabaseImperative, DatabaseWrapper, KeysTree, KeysTreeHeader } from 'uiSrc/modules'
import { KeysHandle } from 'uiSrc/modules/keys-tree/components/database-imperative/DatabaseImperative'
import { KeysStoreProvider } from 'uiSrc/modules/keys-tree/hooks/useKeys'
import { ContextStoreProvider, useDatabasesStore } from 'uiSrc/store'

export const SidebarPage: FC<any> = () => {
  const databases = useDatabasesStore((state) => state.data)
  const refs = useRef<Record<string, KeysHandle>>({})

  useEffect(() => {
    console.debug({ refs })

    // refs.current['06e7d670-fc3d-474a-beb4-4f12a358a0f0'].handleKeys?.()
  }, [refs.current])

  return (
    <div className="flex w-full flex-wrap flex-col min-h-full" data-testid="tree-view-page">
      {databases.map((database) => (
        <ContextStoreProvider key={database.id}>
          <KeysStoreProvider>
            <DatabaseImperative
              database={database}
              ref={(el: KeysHandle) => {
                refs.current[database.id] = el
              }}
            />
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
