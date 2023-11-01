import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ScanMore } from 'uiSrc/components'
import { SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants'
import { fetchMorePatternKeysAction, keysDataSelector, keysSelector } from 'uiSrc/modules/keys-tree'
import { AppDispatch } from 'uiSrc/store'

export interface Props {}

export const KeysTreeHeader = () => {
  const { loading } = useSelector(keysSelector)
  const { total, scanned, nextCursor } = useSelector(keysDataSelector)

  const dispatch = useDispatch<AppDispatch>()

  const loadMoreItems = () => {
    dispatch(fetchMorePatternKeysAction(nextCursor, SCAN_TREE_COUNT_DEFAULT))
  }

  return (
    <ScanMore
      loading={loading}
      totalItemsCount={total}
      scanned={scanned}
      loadMoreItems={loadMoreItems}
      nextCursor={nextCursor}
    />
  )
}
