import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as l10n from '@vscode/l10n'

import { useParams } from 'react-router-dom'
import {
  appContextKeysTree,
  resetKeysTree,
  appContextDbConfig,
  setKeysTreeNodesOpen,
} from 'uiSrc/slices/app/context/context.slice'
import { Nullable, RedisResponseBuffer, RedisString } from 'uiSrc/interfaces'
import { KeyTypes, ModulesKeyTypes, SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/utils'
import { NoKeysMessage } from 'uiSrc/components'
import { bufferToString } from 'uiSrc/utils/formatters'
import { AppDispatch } from 'uiSrc/store'

import { KeyInfo } from './slice/interface'
import { fetchPatternKeysAction, keysDataSelector, keysSelector, selectedKeyDataSelector } from './slice/keys.slice'
import { constructKeysToTree } from './utils/constructKeysToTree'
import VirtualTree from './components/virtual-tree'
import styles from './styles.module.scss'

export interface Props {}

const parseKeyNames = (keys: KeyInfo[]) =>
  keys.map((item) =>
    ({ ...item, nameString: item.nameString ?? bufferToString(item.name) }))

export const KeysTree = () => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const { loading } = useSelector(keysSelector)
  const keysState = useSelector(keysDataSelector)
  const { openNodes } = useSelector(appContextKeysTree)
  const { treeViewDelimiter: delimiter = '', treeViewSort: sorting } = useSelector(appContextDbConfig)
  const { nameString: selectedKeyName = null } = useSelector(selectedKeyDataSelector) ?? {}

  const [statusOpen, setStatusOpen] = useState(openNodes)
  const [constructingTree, setConstructingTree] = useState<boolean>(false)
  const [firstDataLoaded, setFirstDataLoaded] = useState<boolean>(!!keysState.keys.length)
  const [items, setItems] = useState<KeyInfo[]>(parseKeyNames(keysState.keys ?? []))

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchPatternKeysAction('0', SCAN_TREE_COUNT_DEFAULT))
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
    dispatch(resetKeysTree())
    openSelectedKey(selectedKeyName)
  }

  const handleStatusOpen = (name: string, value:boolean) => {
    setStatusOpen((prevState) => {
      const newState = { ...prevState }
      // add or remove opened node
      if (!value) {
        delete newState[name]
      } else {
        newState[name] = value
      }

      dispatch(setKeysTreeNodesOpen(newState))
      return newState
    })
  }

  const handleStatusSelected = (name: RedisString) => {
    // selectKey({ rowData: { name } })
    console.debug('handleStatusSelected', { name })
  }

  const handleDeleteLeaf = (key: RedisResponseBuffer) => {
    console.debug('handleDeleteLeaf', { key })

    // dispatch(deleteKeyAction(key, () => {
    //   onDelete(key)
    // }))
  }

  const handleDeleteClicked = (type: KeyTypes | ModulesKeyTypes) => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_DELETE_CLICKED,
      eventData: {
        databaseId: instanceId,
        keyType: type,
        source: 'keyList',
      },
    })
  }

  if (keysState.keys.length === 0) {
    if (loading || !firstDataLoaded) {
      return <div className="m-auto">{l10n.t('loading...')}</div>
    }

    return (
      <div className="m-auto">
        <NoKeysMessage
          total={keysState.total}
        />
      </div>
    )
  }

  return (
    <div className={styles.content}>
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
