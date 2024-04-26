import React from 'react'

import { ScanMore } from 'uiSrc/components'
import { SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants'
import { isDisableScanMore, isShowScanMore } from 'uiSrc/utils'
import { Database } from 'uiSrc/store'
import { KeysSummary } from '../keys-summary'
import { useKeysApi, useKeysInContext } from '../../hooks/useKeys'

export interface Props {
  database: Database
}

export const KeysTreeHeader = ({ database }: Props) => {
  const { loading, total, scanned, nextCursor, resultsLength } = useKeysInContext((state) => ({
    loading: state.loading,
    scanned: state.data.scanned,
    total: state.data.total,
    nextCursor: state.data.nextCursor,
    resultsLength: state.data.keys?.length,
  }))

  const keysApi = useKeysApi()

  const loadMoreItems = () => {
    keysApi.fetchMorePatternKeysAction(nextCursor, SCAN_TREE_COUNT_DEFAULT)
  }

  return (
    <>
      <KeysSummary
        database={database}
        loading={loading}
        scanned={scanned}
        total={total}
        nextCursor={nextCursor}
        resultsLength={resultsLength}
      />
      {isShowScanMore(scanned, total, nextCursor) && (
        <ScanMore
          disabled={loading || isDisableScanMore(scanned, total, nextCursor)}
          loadMoreItems={loadMoreItems}
        />
      )}
    </>
  )
}
