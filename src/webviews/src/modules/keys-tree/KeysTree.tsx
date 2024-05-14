import React, { useEffect, useState } from 'react'
import * as l10n from '@vscode/l10n'
import cx from 'classnames'
import { isUndefined } from 'lodash'

import { KeyInfo, Nullable, RedisString } from 'uiSrc/interfaces'
import { AllKeyTypes, VscodeMessageAction } from 'uiSrc/constants'
import { TelemetryEvent, isShowScanMore, sendEventTelemetry } from 'uiSrc/utils'
import { NoKeysMessage } from 'uiSrc/components'
import { bufferToString, isEqualBuffers } from 'uiSrc/utils/formatters'
import { fetchKeyInfo, useContextApi, useContextInContext, useSelectedKeyStore } from 'uiSrc/store'
import { vscodeApi } from 'uiSrc/services'
import { useAppInfoStore } from 'uiSrc/store/hooks/use-app-info-store/useAppInfoStore'

import { constructKeysToTree } from './utils/constructKeysToTree'
import { VirtualTree } from './components/virtual-tree'
import { useKeysApi, useKeysInContext } from './hooks/useKeys'
import styles from './styles.module.scss'

const parseKeyNames = (keys: KeyInfo[] = []) =>
  keys.map((item) =>
    ({ ...item, nameString: item.nameString ?? bufferToString(item.name) }))

export const KeysTree = () => {
  const delimiter = useAppInfoStore((state) => state.delimiter)
  const openNodes = useContextInContext((state) => state.keys.tree.openNodes)
  const sorting = useContextInContext((state) => state.dbConfig.treeViewSort)

  const selectedKeyName = useSelectedKeyStore((state) => state.data?.nameString) || ''
  const selectedKey = useSelectedKeyStore((state) => state.data?.name) || null

  const keysState = useKeysInContext((state) => state.data)
  const loading = useKeysInContext((state) => state.loading)
  const databaseId = useKeysInContext((state) => state.databaseId) || ''

  const keysApi = useKeysApi()
  const contextApi = useContextApi()

  const [statusOpen, setStatusOpen] = useState(openNodes)
  const [constructingTree, setConstructingTree] = useState<boolean>(false)
  const [firstDataLoaded, setFirstDataLoaded] = useState<boolean>(!!keysState.keys?.length)
  const [items, setItems] = useState<KeyInfo[]>(parseKeyNames(keysState.keys ?? []))

  useEffect(() => {
    if (!firstDataLoaded) {
      keysApi.fetchPatternKeysAction()
    }
    openSelectedKey(selectedKeyName)
  }, [])

  useEffect(() => {
    setStatusOpen(openNodes)
  }, [openNodes])

  // open all parents for selected key
  const openSelectedKey = (selectedKeyName: Nullable<string> = '') => {
    if (selectedKeyName) {
      const parts = selectedKeyName.split(delimiter)
      const parents = parts.map((_, index) => parts.slice(0, index + 1).join(delimiter) + delimiter)

      // remove key name from parents
      parents.pop()

      parents.forEach((parent) => handleStatusOpen(parent, true))
    }
  }

  useEffect(() => {
    setItems(parseKeyNames(keysState.keys))

    if (keysState.keys?.length === 0) {
      updateSelectedKeys()
    }
  }, [keysState.keys])

  useEffect(() => {
    setFirstDataLoaded(true)
    setItems(parseKeyNames(keysState.keys))
  }, [sorting, delimiter, keysState.lastRefreshTime])

  useEffect(() => {
    openSelectedKey(selectedKeyName)
  }, [selectedKeyName])

  // select default leaf "Keys" after each change delimiter, filter or search
  const updateSelectedKeys = () => {
    contextApi.resetKeysTree()
    openSelectedKey(selectedKeyName)
  }

  const handleStatusOpen = (name: string, value: boolean) => {
    setStatusOpen((prevState) => {
      const newState = { ...prevState }
      // add or remove opened node
      if (!value) {
        delete newState[name]
      } else {
        newState[name] = value
      }

      contextApi.setKeysTreeNodesOpen(newState)
      return newState
    })
  }

  const handleStatusSelected = (name: RedisString, keyString: string, type: AllKeyTypes) => {
    if (isUndefined(type)) {
      return
    }
    fetchKeyInfo({ key: name, databaseId }, false, () => {
      vscodeApi.postMessage({
        action: VscodeMessageAction.SelectKey,
        data: { key: name, keyString, keyType: type, databaseId },
      })
    })
  }

  const handleDeleteLeaf = (key: RedisString) => {
    keysApi.deleteKeyAction(key, onLeafDeleted)
  }

  const onLeafDeleted = (key: RedisString) => {
    if (isEqualBuffers(key, selectedKey)) {
      vscodeApi.postMessage({
        action: VscodeMessageAction.CloseKey,
      })
    }
  }

  const handleDeleteClicked = (type: AllKeyTypes) => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_DELETE_CLICKED,
      eventData: {
        databaseId,
        keyType: type,
        source: 'keyList',
      },
    })
  }

  if (keysState.keys?.length === 0) {
    if (loading || !firstDataLoaded) {
      return <div className="px-8">{l10n.t('loading...')}</div>
    }

    return (
      <div className="pl-10">
        <NoKeysMessage total={keysState.total} />
      </div>
    )
  }

  return (
    <div
      className={cx(
        styles.content,
        { [styles.withScanMore]: isShowScanMore(keysState.scanned, keysState.total, keysState.nextCursor) },
      )}
      data-testid="key-tree"
    >
      <VirtualTree
        items={items}
        delimiter={delimiter}
        sorting={sorting}
        // deleting={deleting}
        statusSelected={selectedKeyName}
        statusOpen={statusOpen}
        loading={loading || constructingTree}
        // commonFilterType={commonFilterType}
        commonFilterType={null}
        setConstructingTree={setConstructingTree}
        webworkerFn={constructKeysToTree}
        onStatusSelected={handleStatusSelected}
        onStatusOpen={handleStatusOpen}
        onDeleteClicked={handleDeleteClicked}
        onDeleteLeaf={handleDeleteLeaf}
      />
    </div>
  )
}
