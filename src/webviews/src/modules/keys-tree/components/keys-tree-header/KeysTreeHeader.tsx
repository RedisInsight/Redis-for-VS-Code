import React, { useEffect, useState } from 'react'
import * as l10n from '@vscode/l10n'

import { ScanMore } from 'uiSrc/components'
import { SCAN_TREE_COUNT_DEFAULT, StorageItem } from 'uiSrc/constants'
import { isDisableScanMore, isShowScanMore, numberWithSpaces, sendEventTelemetry, TelemetryEvent } from 'uiSrc/utils'
import { Database } from 'uiSrc/store'
import { sessionStorageService } from 'uiSrc/services'
import { KeysSummary } from '../keys-summary'
import { useKeysApi, useKeysInContext } from '../../hooks/useKeys'

export interface Props {
  database: Database
  open?: boolean
  dbTotal?: number
  children: React.ReactNode
}

export const KeysTreeHeader = ({ database, open, dbTotal, children }: Props) => {
  const { id: dbId, db: dbIndex } = database
  const { loading, total, scanned, nextCursor, resultsLength } = useKeysInContext((state) => ({
    loading: state.loading,
    scanned: state.data.scanned,
    total: state.data.total,
    nextCursor: state.data.nextCursor,
    resultsLength: state.data.keys?.length,
  }))

  const showTreeInit = open || sessionStorageService.get(`${StorageItem.openTreeNode + dbId + dbIndex}`)
  const [showTree, setShowTree] = useState<boolean>(showTreeInit)

  const keysApi = useKeysApi()

  const loadMoreItems = () => {
    keysApi.fetchMorePatternKeysAction(nextCursor, SCAN_TREE_COUNT_DEFAULT)
  }

  useEffect(() => {
    keysApi.fetchPatternKeysAction()
  }, [dbTotal, total])

  useEffect(() => {
    if (showTree) {
      sendEventTelemetry({
        event: TelemetryEvent.BROWSER_DATABASE_INDEX_CHANGED,
        eventData: {
          databaseId: dbIndex,
        },
      })
    }
  }, [showTree])

  const handleToggleShowTree = (value?: boolean) => {
    const newShowTree = value ?? !showTree
    sessionStorageService.set(`${StorageItem.openTreeNode + dbId + dbIndex}`, newShowTree)

    setShowTree(newShowTree)
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
        total={showTree ? total : (dbTotal ?? null)}
        dbIndex={dbIndex}
        resultsLength={resultsLength}
        showTree={showTree}
        toggleShowTree={handleToggleShowTree}
      />
      {isShowScanMore(scanned, total, nextCursor) && showTree && (
        <ScanMore
          loading={loading}
          disabled={isDisableScanMore(scanned, total, nextCursor)}
          loadMoreItems={loadMoreItems}
          text={l10n.t('({0}{1} Scanned)', notAccurateScanned, numberWithSpaces(scannedDisplay))}
        />
      )}
      {showTree && children}
    </>
  )
}
