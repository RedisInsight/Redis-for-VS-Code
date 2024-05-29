import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { GoAlert } from 'react-icons/go'
import { isNull, isString } from 'lodash'

import { InlineEditor, PopoverDelete, FieldMessage } from 'uiSrc/components'
import { TelemetryEvent, bufferToString, createDeleteFieldHeader, createDeleteFieldMessage, sendEventTelemetry } from 'uiSrc/utils'
import { Nullable } from 'uiSrc/interfaces'
import { useKeysInContext } from 'uiSrc/modules/keys-tree/hooks/useKeys'

import { JSONScalarValue, JSONScalarProps } from '../interfaces'
import { generatePath, getClassNameByValue, validateRejsonValue } from '../utils'
import { setReJSONDataAction } from '../hooks/useRejsonStore'

import styles from '../styles.module.scss'
import '../styles.scss'

export const RejsonScalar = (props: JSONScalarProps) => {
  const {
    keyName = '',
    value,
    isRoot,
    parentPath,
    leftPadding,
    selectedKey,
    path: currentFullPath,
    handleSubmitRemoveKey,
  } = props
  const [changedValue, setChangedValue] = useState<any>('')
  const [path] = useState<string>(currentFullPath || generatePath(parentPath, keyName))
  const [error, setError] = useState<Nullable<string>>(null)
  const [editing, setEditing] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<string>('')

  const databaseId = useKeysInContext((state) => state.databaseId)

  useEffect(() => {
    setChangedValue(isString(value) ? `"${value}"` : isNull(value) ? 'null' : value)
  }, [value])

  const onDeclineChanges = () => {
    setEditing(false)
    setError(null)
  }

  const onApplyValue = (value: JSONScalarValue) => {
    const error = validateRejsonValue(value)
    if (error) {
      setError(error)
      return
    }

    setReJSONDataAction(selectedKey, path, String(value), undefined, (isEditMode, keyLevel) => {
      setEditing(false)
      sendEventTelemetry({
        event: isEditMode ? TelemetryEvent.TREE_VIEW_JSON_PROPERTY_EDITED : TelemetryEvent.TREE_VIEW_JSON_PROPERTY_ADDED,
        eventData: {
          databaseId,
          keyLevel,
        },
      })
    })
  }

  return (
    <>
      {isRoot ? (<p className={getClassNameByValue(value)}>{`${changedValue}`}</p>) : (
        <div className={styles.row}>
          <div className={styles.rowContainer}>
            <div className="flex items-start grow">
              <span
                className={cx(styles.quoted, styles.keyName)}
                style={{ paddingLeft: `${leftPadding}em` }}
              >
                {keyName}
              </span>
              <div className="inline-block pl-1">:</div>
              {editing ? (
                <div className="jsonItemEditor">
                  <InlineEditor
                    autoFocus
                    initialValue={changedValue}
                    placeholder="Enter JSON value"
                    fieldName="stringValue"
                    expandable
                    invalid={!!error}
                    onDecline={onDeclineChanges}
                    onChange={() => setError('')}
                    onApply={(value) => onApplyValue(value)}
                  />
                  {!!error && (
                    <div className={cx(styles.errorMessage)}>
                      <FieldMessage
                        scrollViewOnAppear
                        Icon={<GoAlert />}
                        testID="edit-json-error"
                      >
                        {error}
                      </FieldMessage>
                    </div>
                  )}
                </div>
              ) : (
                <span
                  className={cx(
                    styles.jsonValue,
                    getClassNameByValue(value),
                    'grow',
                  )}
                  onClick={(e) => {
                    setEditing(true)

                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  data-testid="json-scalar-value"
                  role="presentation"
                >
                  {String(changedValue)}
                </span>
              )}
            </div>
            <div className={styles.deleteBtn}>
              <PopoverDelete
                header={createDeleteFieldHeader(keyName.toString())}
                text={createDeleteFieldMessage(bufferToString(selectedKey))}
                item={keyName.toString()}
                suffix="scalar"
                deleting={deleting}
                closePopover={() => setDeleting('')}
                showPopover={(item) => setDeleting(`${item}scalar`)}
                handleDeleteItem={() => handleSubmitRemoveKey(path, keyName.toString())}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
