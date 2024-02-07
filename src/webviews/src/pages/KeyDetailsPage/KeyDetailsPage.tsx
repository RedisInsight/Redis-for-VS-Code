import React, { FC } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { KeyDetails } from 'uiSrc/modules'
import { ContextStoreProvider, useSelectedKeyStore } from 'uiSrc/store'

export const KeyDetailsPage: FC = () => {
  const selectedKey = useSelectedKeyStore(useShallow((state) => state.data?.name))

  return (
    <div className="h-full" data-testid="key-details-page">
      <ContextStoreProvider>
        <KeyDetails keyProp={selectedKey!} />
      </ContextStoreProvider>
    </div>
  )
}
