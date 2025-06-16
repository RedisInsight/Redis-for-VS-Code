import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { diff } from 'deep-diff'

import { useShallow } from 'zustand/react/shallow'
import { Spinner } from 'uiSrc/ui'

import ReJSONConfirmDialog from './RejsonConfirmDialog'
import { checkExistingPath } from '../utils/path'
import { RejsonDynamicTypes } from '../rejson-dynamic-types'
import { JSONObjectProps, ObjectTypes } from '../interfaces'
import { generatePath, getBrackets, wrapPath } from '../utils'
import {
  AddItem,
  AddItemFieldAction,
  EditEntireItemAction,
  EditItemFieldAction,
} from '../components'

import { useRejsonStore } from '../hooks/useRejsonStore'
import styles from '../styles.module.scss'

const defaultValue: [] = []

const JSONParse = (value: string) => JSON.parse(value)

const hasModifications = (oldObj: any, newObj: any) => {
  const differences = diff(oldObj, newObj)
  return differences?.some((d: any) => d.kind === 'E')
}

export const RejsonObject = React.memo((props: JSONObjectProps) => {
  const {
    type,
    parentPath,
    keyName,
    isDownloaded,
    expandedRows,
    leftPadding,
    selectedKey,
    cardinality = 0,
    handleSubmitRemoveKey,
    onClickRemoveKey,
    handleSubmitUpdateValue,
    onJsonKeyExpandAndCollapse,
    handleFetchVisualisationResults,
    handleAppendRejsonObjectItemAction,
    handleSetRejsonDataAction,
    path: currentFullPath,
    value: currentValue,
  } = props

  const [path] = useState<string>(
    currentFullPath || generatePath(parentPath, keyName),
  )
  const [value, setValue] = useState<any>(defaultValue)
  const [downloaded, setDownloaded] = useState<boolean>(isDownloaded)
  const [editEntireObject, setEditEntireObject] = useState<boolean>(false)
  const [valueOfEntireObject, setValueOfEntireObject] = useState<any>('')
  const [addNewKeyValuePair, setAddNewKeyValuePair] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState<boolean>(false)
  const [confirmDialogAction, setConfirmDialogAction] = useState<any>(() => {})

  const { fullValue } = useRejsonStore(
    useShallow((state) => ({
      fullValue: state.data.data,
    })),
  )

  useEffect(() => {
    if (!expandedRows?.has(path)) {
      setValue(defaultValue)
      return
    }

    if (isDownloaded) {
      setValue(currentValue)
      setIsExpanded(expandedRows?.has(path))
      return
    }

    fetchObject()
  }, [])

  const handleFormSubmit = ({
    key,
    value: updatedValue,
  }: {
    key?: string
    value: string
  }) => {
    if (type === ObjectTypes.Array) {
      handleAppendRejsonObjectItemAction(selectedKey, path, value)
      return
    }

    const updatedPath = wrapPath(key as string, path)
    const isKeyExisting = fullValue
      ? checkExistingPath(updatedPath || '', JSONParse(fullValue as string))
      : false

    if (isKeyExisting) {
      setConfirmDialogAction(() => () => {
        setIsConfirmVisible(false)
        setAddNewKeyValuePair(false)

        if (updatedPath) {
          handleSetRejsonDataAction(selectedKey, updatedPath, updatedValue)
        }
      })

      setIsConfirmVisible(true)
      return
    }

    setAddNewKeyValuePair(false)
    if (updatedPath) {
      handleSetRejsonDataAction(selectedKey, updatedPath, updatedValue)
    }
  }

  const handleUpdateValueFormSubmit = (updatedValue: string) => {
    if (hasModifications(value, JSONParse(updatedValue))) {
      setConfirmDialogAction(() => () => {
        setIsConfirmVisible(false)
        setEditEntireObject(false)
        handleSetRejsonDataAction(selectedKey, path, updatedValue as string)
      })

      setIsConfirmVisible(true)
      return
    }

    setEditEntireObject(false)
    handleSetRejsonDataAction(selectedKey, path, updatedValue as string)
  }

  const onClickEditEntireObject = async () => {
    const data = await handleFetchVisualisationResults(selectedKey, path, true)

    setEditEntireObject(true)
    setValueOfEntireObject(
      typeof data.data === 'object'
        ? JSON.stringify(
          data.data,
          (_key, value) =>
            (typeof value === 'bigint' ? value.toString() : value),
          4,
        )
        : data.data,
    )
  }

  const onClickExpandCollapse = (path: string) => {
    if (isExpanded) {
      onJsonKeyExpandAndCollapse(false, path)
      setIsExpanded(false)
      setValue(defaultValue)

      return
    }

    if (isDownloaded) {
      onJsonKeyExpandAndCollapse(true, path)
      setIsExpanded(true)
      setValue(currentValue)

      return
    }

    fetchObject()
  }

  const fetchObject = async () => {
    const spinnerDelay = setTimeout(() => setLoading(true), 300)

    try {
      const { data, downloaded } = await handleFetchVisualisationResults(
        selectedKey,
        path,
      )

      setValue(data)
      onJsonKeyExpandAndCollapse(true, path)
      setDownloaded(downloaded)
      clearTimeout(spinnerDelay)
      setLoading(false)
      setIsExpanded(true)
    } catch {
      clearTimeout(spinnerDelay)
      setIsExpanded(false)
    }
  }

  return (
    <>
      <div className={styles.row} key={keyName + parentPath}>
        <div className={styles.rowContainer}>
          <ReJSONConfirmDialog
            open={isConfirmVisible}
            onClose={() => setIsConfirmVisible(false)}
            onConfirm={confirmDialogAction}
          />
          <div
            className={styles.quotedKeyName}
            style={{ paddingLeft: `${leftPadding}em` }}
          >
            <span
              className={cx(styles.quoted, styles.keyName)}
              onClick={() => onClickExpandCollapse(path)}
              role="presentation"
            >
              {keyName}
            </span>
            <div className="flex items-start grow">:</div>
            {!isExpanded && !editEntireObject && (
              <div
                className={styles.defaultFontExpandArray}
                onClick={() => onClickExpandCollapse(path)}
                data-testid={`expand-${type === ObjectTypes.Array ? 'array' : 'object'}`}
                role="presentation"
              >
                {getBrackets(type, 'start')}
                {cardinality ? '...' : ''}
                {getBrackets(type, 'end')}
              </div>
            )}
            {isExpanded && !editEntireObject && (
              <span className={styles.defaultFontOpenIndex}>
                {getBrackets(type, 'start')}
              </span>
            )}
          </div>
          {!editEntireObject && !loading && (
            <EditItemFieldAction
              keyName={keyName.toString()}
              selectedKey={selectedKey}
              path={path}
              handleSubmitRemoveKey={handleSubmitRemoveKey}
              onClickEditEntireItem={onClickEditEntireObject}
            />
          )}
          {loading && (
            <div className={cx(styles.actionButtons, 'justify-end')}>
              <div className={styles.spinner}>
                <Spinner type="clip" />
              </div>
            </div>
          )}
        </div>
      </div>
      {editEntireObject ? (
        <EditEntireItemAction
          initialValue={valueOfEntireObject}
          onCancel={() => setEditEntireObject(false)}
          onSubmit={handleUpdateValueFormSubmit}
        />
      ) : (
        <RejsonDynamicTypes
          expandedRows={expandedRows}
          leftPadding={leftPadding}
          data={value}
          parentPath={path}
          selectedKey={selectedKey}
          isDownloaded={downloaded}
          onClickRemoveKey={onClickRemoveKey}
          onJsonKeyExpandAndCollapse={onJsonKeyExpandAndCollapse}
          handleSubmitUpdateValue={handleSubmitUpdateValue}
          handleFetchVisualisationResults={handleFetchVisualisationResults}
          handleAppendRejsonObjectItemAction={
            handleAppendRejsonObjectItemAction
          }
          handleSetRejsonDataAction={handleSetRejsonDataAction}
        />
      )}
      {addNewKeyValuePair && (
        <AddItem
          isPair={type === ObjectTypes.Object}
          onCancel={() => setAddNewKeyValuePair(false)}
          onSubmit={handleFormSubmit}
          leftPadding={leftPadding}
          shouldCloseOnOutsideClick={false}
        />
      )}
      {isExpanded && !editEntireObject && (
        <AddItemFieldAction
          leftPadding={leftPadding}
          type={type}
          onClickSetKVPair={() => {
            setAddNewKeyValuePair(true)
          }}
        />
      )}
    </>
  )
})
