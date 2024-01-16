import React from 'react'

import { ScanMore } from 'uiSrc/components'
import { SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants'
import { fetchMorePatternKeysAction, useKeysStore } from '../../hooks/useKeys'

export interface Props { }

export const KeysTreeHeader = () => {
  const { loading, total, scanned, nextCursor } = useKeysStore((state) => ({
    loading: state.loading,
    total: state.data?.total,
    scanned: state.data?.scanned,
    nextCursor: state.data?.nextCursor,
  }))

  const loadMoreItems = () => {
    fetchMorePatternKeysAction(nextCursor, SCAN_TREE_COUNT_DEFAULT)
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
