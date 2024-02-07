import React from 'react'

import { ScanMore } from 'uiSrc/components'
import { SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants'
import { useKeysApi, useKeysInContext } from '../../hooks/useKeys'

export interface Props { }

export const KeysTreeHeader = () => {
  const loading = useKeysInContext((state) => state.loading)
  const total = useKeysInContext((state) => state.data.total)
  const scanned = useKeysInContext((state) => state.data.scanned)
  const nextCursor = useKeysInContext((state) => state.data.nextCursor)

  const keysApi = useKeysApi()

  const loadMoreItems = () => {
    keysApi.getState().fetchMorePatternKeysAction(nextCursor, SCAN_TREE_COUNT_DEFAULT)
  }

  return (
    <>
      <ScanMore
        loading={loading}
        totalItemsCount={total}
        scanned={scanned}
        loadMoreItems={loadMoreItems}
        nextCursor={nextCursor}
      />
    </>
  )
}
