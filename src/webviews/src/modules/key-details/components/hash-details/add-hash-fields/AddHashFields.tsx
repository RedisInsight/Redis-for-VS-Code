import React, { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import Popup from 'reactjs-popup'
import cx from 'classnames'

import {
  stringToBuffer,
  setEmptyItemById,
  addNewItem,
  handleItemChange,
  removeItem,
} from 'uiSrc/utils'
import { AddItemsActions } from 'uiSrc/components'
import { useSelectedKeyStore } from 'uiSrc/store'
import { IHashFieldState, INITIAL_HASH_FIELD_STATE } from 'uiSrc/modules/add-key'
import { InputText } from 'uiSrc/ui'

import { AddFieldsToHashDto } from '../hooks/interface'
import { useHashStore } from '../hooks/useHashStore'

export interface Props {
  hideCancel?: boolean
  autoFocus?: boolean
  disabled?: boolean
  disabledSubmitText?: ReactNode
  submitText?: string
  containerClassName?: string
  closePanel?: (isCancelled?: boolean) => void
  onSubmitData: (data: AddFieldsToHashDto, onSuccess?: (data: AddFieldsToHashDto) => void) => void
}

const AddHashFields = (props: Props) => {
  const {
    hideCancel,
    disabled,
    disabledSubmitText,
    submitText,
    autoFocus = true,
    containerClassName,
    closePanel,
    onSubmitData,
  } = props

  const { loading, resetUpdateValue } = useHashStore((state) => ({
    loading: state.updateValue.loading,
    resetUpdateValue: state.resetUpdateValue,
  }))
  const selectedKey = useSelectedKeyStore((state) => state.data?.name ?? '')
  const [fields, setFields] = useState<IHashFieldState[]>([{ ...INITIAL_HASH_FIELD_STATE }])
  const lastAddedFieldName = useRef<HTMLInputElement>(null)

  useEffect(() =>
    // componentWillUnmount
    () => {
      resetUpdateValue()
    },
  [])

  useEffect(() => {
    if (autoFocus || fields.length > 1) {
      lastAddedFieldName.current?.focus()
    }
  }, [fields.length])

  const submitData = (): void => {
    const data: AddFieldsToHashDto = {
      keyName: selectedKey,
      fields: fields.map((item) => ({
        field: stringToBuffer(item.fieldName),
        value: stringToBuffer(item.fieldValue),
      })),
    }

    onSubmitData(data)
  }

  const isClearDisabled = (item: IHashFieldState): boolean =>
    fields.length === 1 && !(item.fieldName.length || item.fieldValue.length)

  const SubmitBtn = () => (
    <VSCodeButton
      appearance="primary"
      onClick={submitData}
      disabled={!!disabledSubmitText}
      data-testid="save-fields-btn"
    >
      {submitText || l10n.t('Save')}
    </VSCodeButton>
  )

  return (
    <>
      <div className={cx('key-footer-items-container', containerClassName)} data-testid="add-hash-field-panel">
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
                    disabled={loading || disabled}
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
                    disabled={loading || disabled}
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
                disabled={loading || disabled}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="pr-4 pb-4">
        <div className="flex justify-end">
          {!hideCancel && (
            <VSCodeButton
              appearance="secondary"
              onClick={() => closePanel?.(true)}
              className="mr-3"
              data-testid="cancel-fields-btn"
            >
              {l10n.t('Cancel')}
            </VSCodeButton>
          )}
          {disabledSubmitText && (
            <Popup
              keepTooltipInside
              on="hover"
              position="top center"
              trigger={SubmitBtn}
            >
              <div className="font-bold pb-1">{disabledSubmitText}</div>
            </Popup>
          )}
          {!disabledSubmitText && <SubmitBtn />}
        </div>
      </div>
    </>
  )
}

export { AddHashFields }
