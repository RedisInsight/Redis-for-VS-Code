import React from 'react'

import { ScanMore } from 'uiSrc/components'
import { SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants'
import { isDisableScanMore, isShowScanMore } from 'uiSrc/utils'
import { useKeysApi, useKeysInContext } from '../../hooks/useKeys'

export interface Props { }

export const KeysTreeHeader = () => {
  const { loading, total, scanned, nextCursor } = useKeysInContext((state) => ({
    loading: state.loading,
    scanned: state.data.scanned,
    total: state.data.total,
    nextCursor: state.data.nextCursor,
  }))

  const keysApi = useKeysApi()

  const loadMoreItems = () => {
    keysApi.fetchMorePatternKeysAction(nextCursor, SCAN_TREE_COUNT_DEFAULT)
  }

  if (!isShowScanMore(scanned, total, nextCursor)) {
    return null
  }

  return (
    <ScanMore
      disabled={loading || isDisableScanMore(scanned, total, nextCursor)}
      loadMoreItems={loadMoreItems}
    />
  )
}
