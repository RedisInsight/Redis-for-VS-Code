import React, { useState } from 'react'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscAdd } from 'react-icons/vsc'

import { RedisString } from 'uiSrc/interfaces'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/utils'
import { useKeysInContext } from 'uiSrc/modules/keys-tree/hooks/useKeys'
import { getBrackets, isRealArray, isRealObject, wrapPath } from '../utils'
import { BaseProps, ObjectTypes } from '../interfaces'
import { RejsonDynamicTypes } from '../rejson-dynamic-types'
import { AddItem } from '../components'
import {
  appendReJSONArrayItemAction,
  fetchVisualisationResults,
  removeReJSONKeyAction,
  setReJSONDataAction,
} from '../hooks/useRejsonStore'

import styles from '../styles.module.scss'

export const RejsonDetails = (props: BaseProps) => {
  const {
    data,
    selectedKey,
    length,
    dataType,
    parentPath,
    isDownloaded,
    onJsonKeyExpandAndCollapse,
    expandedRows,
  } = props

  const [addRootKVPair, setAddRootKVPair] = useState<boolean>(false)

  const databaseId = useKeysInContext((state) => state.databaseId)

  const handleFetchVisualisationResults = async (keyName: RedisString, path: string, forceRetrieve = false) =>
    fetchVisualisationResults(keyName, path, forceRetrieve)

  const handleAppendRejsonArrayItemAction = (keyName: RedisString, path: string, data: string) => {
    appendReJSONArrayItemAction(keyName, path, data, length, (keyLevel) => {
      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_JSON_PROPERTY_ADDED,
        eventData: {
          databaseId,
          keyLevel,
        },
      })
    })
  }

  const handleSetRejsonDataAction = (keyName: RedisString, path: string, data: string) => {
    setReJSONDataAction(keyName, path, data, length, (keyLevel) => {
      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_JSON_PROPERTY_ADDED,
        eventData: {
          databaseId,
          keyLevel,
        },
      })
    })
  }

  const handleFormSubmit = ({ key, value }: { key?: string, value: string }) => {
    setAddRootKVPair(false)
    if (isRealArray(data, dataType)) {
      handleAppendRejsonArrayItemAction(selectedKey, '.', value)
      return
    }

    const updatedPath = wrapPath(key as string)
    if (updatedPath) {
      handleSetRejsonDataAction(selectedKey, updatedPath, value)
    }
  }

  const onClickRemoveKey = (path: string, keyName: string) => {
    removeReJSONKeyAction(selectedKey, path || '.', keyName, length, (keyLevel) => {
      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_JSON_PROPERTY_DELETED,
        eventData: {
          databaseId,
          keyLevel,
        },
      })
    })
  }

  const onClickSetRootKVPair = () => {
    setAddRootKVPair(!addRootKVPair)
  }

  const isObject = isRealObject(data, dataType)
  const isArray = isRealArray(data, dataType)

  return (
    <div className={styles.jsonData} id="jsonData" data-testid="json-data">
      <>
        {(isObject || isArray) && (
          <div className={styles.row}>
            <span>{getBrackets(isObject ? ObjectTypes.Object : ObjectTypes.Array, 'start')}</span>
          </div>
        )}
        <RejsonDynamicTypes
          data={data}
          parentPath={parentPath}
          selectedKey={selectedKey}
          isDownloaded={isDownloaded}
          expandedRows={expandedRows}
          onClickRemoveKey={onClickRemoveKey}
          onJsonKeyExpandAndCollapse={onJsonKeyExpandAndCollapse}
          handleAppendRejsonObjectItemAction={handleAppendRejsonArrayItemAction}
          handleSetRejsonDataAction={handleSetRejsonDataAction}
          handleFetchVisualisationResults={handleFetchVisualisationResults}
        />
        {addRootKVPair && (
          <AddItem
            isPair={isObject}
            onCancel={() => setAddRootKVPair(false)}
            onSubmit={handleFormSubmit}
          />
        )}
        {(isObject || isArray) && (
          <div className={styles.row}>
            <span>{getBrackets(isObject ? ObjectTypes.Object : ObjectTypes.Array, 'end')}</span>
            {!addRootKVPair && (
              <VSCodeButton
                appearance="icon"
                className={styles.buttonStyle}
                onClick={onClickSetRootKVPair}
                aria-label="Add field"
                data-testid={isObject ? 'add-object-btn' : 'add-array-btn'}
              >
                <VscAdd />
              </VSCodeButton>
            )}
          </div>
        )}
      </>
    </div>
  )
}
