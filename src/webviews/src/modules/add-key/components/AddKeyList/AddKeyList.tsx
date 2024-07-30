import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'

import { KeyTypes, AddListFormConfig as config } from 'uiSrc/constants'
import { getRequiredFieldsText, stringToBuffer } from 'uiSrc/utils'
import { Maybe } from 'uiSrc/interfaces'
import { useKeysApi, useKeysInContext } from 'uiSrc/modules/keys-tree/hooks/useKeys'
import { InputText, Tooltip } from 'uiSrc/ui'
import { CreateListWithExpireDto } from 'uiSrc/modules/keys-tree/hooks/interface'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onClose: (isCancelled?: boolean, keyType?: KeyTypes) => void
}

export const AddKeyList = (props: Props) => {
  const { keyName = '', keyTTL, onClose } = props
  const [element, setElement] = useState<string>('')
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const keysApi = useKeysApi()
  const loading = useKeysInContext((state) => state.addKeyLoading)

  useEffect(() => {
    setIsFormValid(keyName.length > 0)
  }, [keyName])

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: CreateListWithExpireDto = {
      keyName: stringToBuffer(keyName),
      element: stringToBuffer(element),
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
        <InputText
          name="element"
          id="element"
          placeholder={config.element.placeholder}
          value={element}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setElement(e.target.value)}
          disabled={loading}
          data-testid="element"
        />
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
