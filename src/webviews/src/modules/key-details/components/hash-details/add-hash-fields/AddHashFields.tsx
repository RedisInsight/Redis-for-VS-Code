import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'

import { KeyTypes } from 'uiSrc/constants'
import {
  sendEventTelemetry,
  TelemetryEvent,
  stringToBuffer,
  setEmptyItemById,
  addNewItem,
  handleItemChange,
  removeItem,
} from 'uiSrc/utils'
import { AddItemsActions } from 'uiSrc/components'
import { connectedDatabaseSelector } from 'uiSrc/slices/connections/databases/databases.slice'
import { useSelectedKeyStore } from 'uiSrc/store'
import { IHashFieldState, INITIAL_HASH_FIELD_STATE } from 'uiSrc/modules/add-key'
import { InputText } from 'uiSrc/ui'

import { AddFieldsToHashDto } from '../hooks/interface'
import { updateHashFieldsAction, useHashStore } from '../hooks/useHashStore'

export interface Props {
  onCancel: (isCancelled?: boolean) => void;
}

const AddHashFields = (props: Props) => {
  const { onCancel } = props
  const { loading, resetUpdateValue } = useHashStore((state) => ({
    loading: state.updateValue.loading,
    resetUpdateValue: state.resetUpdateValue,
  }))
  const selectedKey = useSelectedKeyStore((state) => state.data?.name ?? '')
  const [fields, setFields] = useState<IHashFieldState[]>([{ ...INITIAL_HASH_FIELD_STATE }])
  const { id: databaseId } = useSelector(connectedDatabaseSelector)
  const lastAddedFieldName = useRef<HTMLInputElement>(null)

  useEffect(() =>
    // componentWillUnmount
    () => {
      resetUpdateValue()
    },
  [])

  useEffect(() => {
    lastAddedFieldName.current?.focus()
  }, [fields.length])

  const onSuccessAdded = () => {
    onCancel()
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_ADDED,
      eventData: {
        databaseId,
        keyType: KeyTypes.Hash,
        numberOfAdded: fields.length,
      },
    })
  }

  const submitData = (): void => {
    const data: AddFieldsToHashDto = {
      keyName: selectedKey,
      fields: fields.map((item) => ({
        field: stringToBuffer(item.fieldName),
        value: stringToBuffer(item.fieldValue),
      })),
    }
    updateHashFieldsAction(data, true, onSuccessAdded)
  }

  const isClearDisabled = (item: IHashFieldState): boolean =>
    fields.length === 1 && !(item.fieldName.length || item.fieldValue.length)

  return (
    <>
      <div className="pt-4 pl-10 pr-4 mb-12 overflow-auto max-h-[calc(100vh-212px)]" data-testid="add-hash-field-panel">
        {fields.map((item, index) => (
          <div key={item.id}>
            <div className="flex items-center mb-3">
              <div className="flex grow">
                <div className="w-1/2 mr-2">
                  <InputText
                    name={`fieldName-${item.id}`}
                    id={`fieldName-${item.id}`}
                    placeholder={l10n.t('Enter Field')}
                    value={item.fieldName}
                    disabled={loading}
                    className="h-11"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFields(handleItemChange(fields, 'fieldName', item.id, e.target.value))}
                    inputRef={index === fields.length - 1 ? lastAddedFieldName : null}
                    data-testid={`hash-field-${index}`}
                  />
                </div>
                <div className="w-1/2">
                  <InputText
                    name={`fieldValue-${item.id}`}
                    id={`fieldValue-${item.id}`}
                    placeholder={l10n.t('Enter Value')}
                    value={item.fieldValue}
                    disabled={loading}
                    className="h-11"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setFields(handleItemChange(fields, 'fieldValue', item.id, e.target.value))}
                    data-testid={`hash-value-${index}`}
                  />
                </div>
              </div>
              <AddItemsActions
                id={item.id}
                index={index}
                length={fields.length}
                addItem={() => setFields(addNewItem(fields, INITIAL_HASH_FIELD_STATE))}
                removeItem={(id) => setFields(removeItem(fields, id))}
                clearItemValues={(id) =>
                  setFields(setEmptyItemById(fields, id, {
                    ...item,
                    fieldName: '',
                    fieldValue: '',
                  }))}
                clearIsDisabled={isClearDisabled(item)}
                loading={loading}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="pr-4 pb-4">
        <div className="flex justify-end">
          <VSCodeButton
            appearance="secondary"
            onClick={() => onCancel(true)}
            className="mr-3"
            data-testid="cancel-fields-btn"
          >
            {l10n.t('Cancel')}
          </VSCodeButton>
          <VSCodeButton
            appearance="primary"
            onClick={submitData}
            disabled={loading}
            data-testid="save-fields-btn"
          >
            {l10n.t('Save')}
          </VSCodeButton>
        </div>
      </div>
    </>
  )
}

export { AddHashFields }
