import React, { FC, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { KeyDetails } from 'uiSrc/modules'
import { ContextStoreProvider, fetchDatabaseOverview, fetchKeyInfo, useSelectedKeyStore } from 'uiSrc/store'
import { KeysStoreProvider } from 'uiSrc/modules/keys-tree/hooks/useKeys'

export const KeyDetailsPage: FC = () => {
  const selectedKey = useSelectedKeyStore(useShallow((state) => state.data?.name))

  useEffect(() => {
    fetchKeyInfo({ key: { type: 'Buffer', data: [112, 97, 99, 107, 97, 103, 101, 46, 106, 115, 111, 110] } }, true)

    fetchDatabaseOverview()
  }, [])

  // useEffect(() => {
  //   fetchDatabaseOverview()
  // }, [selectedKey])

  return (
    <div className="h-full" data-testid="key-details-page">
      <KeysStoreProvider>
        <ContextStoreProvider>
          <KeyDetails />
        </ContextStoreProvider>
      </KeysStoreProvider>
    </div>
  )
}
