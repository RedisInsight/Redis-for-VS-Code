import React, { FC } from 'react'
import { VscodeState } from 'uiSrc/constants'
import { Nullable, RedisString } from 'uiSrc/interfaces'
import { KeyDetails } from 'uiSrc/modules'
import { useSelectedKeyStore, useVSCodeState } from 'uiSrc/store'

export const KeyDetailsPage: FC = () => {
  const selectedKey = useSelectedKeyStore((state) => state.data?.name)

  return (
    <div className="p-1" data-testid="key-details-page">
      <KeyDetails keyProp={selectedKey} />
      {/* <KeyDetails keyProp={{ type: 'Buffer', data: [49, 50, 51, 49, 50, 51, 49, 50, 51] }} /> */}
    </div>
  )
}
