import React, { FC } from 'react'
import { KeyDetails } from 'uiSrc/modules'
import { useSelectedKeyStore } from 'uiSrc/store'

export const KeyDetailsPage: FC = () => {
  const selectedKey = useSelectedKeyStore((state) => state.data?.name)

  return (
    <div className="p-1 h-full" data-testid="key-details-page">
      <KeyDetails keyProp={selectedKey!} />
    </div>
  )
}
