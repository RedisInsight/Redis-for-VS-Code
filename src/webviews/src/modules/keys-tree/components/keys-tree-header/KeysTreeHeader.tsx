import React from 'react'
import * as l10n from '@vscode/l10n'

import { ScanMore } from 'uiSrc/components'
import { SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants'
import { isDisableScanMore, isShowScanMore, numberWithSpaces } from 'uiSrc/utils'
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

  const scannedDisplay = resultsLength > scanned ? resultsLength : scanned
  const notAccurateScanned = total
    && scanned >= total
    && nextCursor
    && nextCursor !== '0'
    ? '~' : ''

  return (
    <>
      <KeysSummary
        database={database}
        loading={loading}
        scanned={scanned}
        total={total}
        resultsLength={resultsLength}
      />
      {isShowScanMore(scanned, total, nextCursor) && (
        <ScanMore
          loading={loading}
          disabled={isDisableScanMore(scanned, total, nextCursor)}
          loadMoreItems={loadMoreItems}
          text={l10n.t('({0}{1} Scanned)', notAccurateScanned, numberWithSpaces(scannedDisplay))}
        />
      )}
    </>
  )
}
