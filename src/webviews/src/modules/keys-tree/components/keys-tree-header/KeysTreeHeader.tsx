import React from 'react'

import { ScanMore } from 'uiSrc/components'
import { SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants'
import { isShowScanMore } from 'uiSrc/utils'
import { useKeysApi, useKeysInContext } from '../../hooks/useKeys'

export interface Props { }

export const KeysTreeHeader = () => {
  const loading = useKeysInContext((state) => state.loading)
  const total = useKeysInContext((state) => state.data.total)
  const scanned = useKeysInContext((state) => state.data.scanned)
  const nextCursor = useKeysInContext((state) => state.data.nextCursor)

  const keysApi = useKeysApi()

  const loadMoreItems = () => {
    keysApi.fetchMorePatternKeysAction(nextCursor, SCAN_TREE_COUNT_DEFAULT)
  }

  return isShowScanMore(scanned, total) && (
    <ScanMore
      loading={loading}
      loadMoreItems={loadMoreItems}
      nextCursor={nextCursor}
    />
  )
}
