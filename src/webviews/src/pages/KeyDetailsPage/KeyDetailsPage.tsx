import React, { FC } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { VscodeState } from 'uiSrc/constants'
import { Nullable, RedisString } from 'uiSrc/interfaces'
import { KeyDetails } from 'uiSrc/modules'
import { useSelectedKeyStore, useVSCodeState } from 'uiSrc/store'

export const KeyDetailsPage: FC = () => {
  const selectedKey = useSelectedKeyStore(useShallow((state) => state.data?.name))

  return (
    <div className="p-1" data-testid="key-details-page">
      <KeyDetails keyProp={selectedKey} />
    </div>
  )
}
