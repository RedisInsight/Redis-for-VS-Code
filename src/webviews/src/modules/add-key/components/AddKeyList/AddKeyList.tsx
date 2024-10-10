import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'

import { KeyTypes, AddListFormConfig as config } from 'uiSrc/constants'
import { getRequiredFieldsText, stringToBuffer } from 'uiSrc/utils'
import { Maybe } from 'uiSrc/interfaces'
import { useKeysApi, useKeysInContext } from 'uiSrc/modules/keys-tree/hooks/useKeys'
import { InputText, Tooltip } from 'uiSrc/ui'
import { CreateListWithExpireDto } from 'uiSrc/modules/keys-tree/hooks/interface'
import { AddItemsActions } from 'uiSrc/components'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onClose: (isCancelled?: boolean, keyType?: KeyTypes) => void
}

export const AddKeyList = (props: Props) => {
  const { keyName = '', keyTTL, onClose } = props
  const [elements, setElements] = useState<string[]>([''])
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const keysApi = useKeysApi()
  const loading = useKeysInContext((state) => state.addKeyLoading)

  useEffect(() => {
    setIsFormValid(keyName.length > 0)
  }, [keyName])

  const addElement = () => {
    setElements([...elements, ''])
  }

  const removeElement = (index: number) => {
    setElements(elements.filter((_el, i) => i !== index))
  }

  const clearElement = (index: number) => {
    const newElements = [...elements]
    newElements[index] = ''
    setElements(newElements)
  }

  const handleElementChange = (value: string, index: number) => {
    const newElements = [...elements]
    newElements[index] = value
    setElements(newElements)
  }

  const isClearDisabled = (item:string) => elements.length === 1 && !item.length

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: CreateListWithExpireDto = {
      keyName: stringToBuffer(keyName),
      elements: elements.map((el) => stringToBuffer(el)),
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    keysApi.addListKey(data, () => onClose(false, KeyTypes.List))
  }

  const noKeyNameText = !keyName ? getRequiredFieldsText({ keyName: l10n.t('Key Name') }) || '' : ''

  return (
    <>
      <form onSubmit={onFormSubmit} className="key-footer-items-container pl-0 h-full">
        <h3 className="font-bold uppercase pb-3">{l10n.t('Element')}</h3>
        {elements.map((item, index) => (
          <div key={index}>
            <div className="flex items-center mb-3">
              <InputText
                name={`element-${index}`}
                id={`element-${index}`}
                placeholder={config.element.placeholder}
                value={item}
                disabled={loading}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleElementChange(e.target.value, index)}
                data-testid={`element-${index}`}
              />
              <AddItemsActions
                id={index}
                index={index}
                length={elements.length}
                addItem={addElement}
                removeItem={removeElement}
                clearItemValues={clearElement}
                clearIsDisabled={isClearDisabled(item)}
                disabled={loading}
              />
            </div>
          </div>
        ))}
        <button type="submit" className="hidden">
          {l10n.t('Submit')}
        </button>
      </form>

      <div className="flex justify-end">
        <Tooltip content={loading ? l10n.t('loading...') : noKeyNameText}>
          <VSCodeButton
            onClick={submitData}
            disabled={!isFormValid || loading}
            data-testid="btn-add"
          >
            {l10n.t('Add Key')}
          </VSCodeButton>
        </Tooltip>
      </div>
    </>
  )
}
