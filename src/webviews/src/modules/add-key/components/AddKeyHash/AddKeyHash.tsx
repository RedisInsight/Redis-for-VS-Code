import React from 'react'
import * as l10n from '@vscode/l10n'

import { getRequiredFieldsText, stringToBuffer } from 'uiSrc/utils'
import { Maybe } from 'uiSrc/interfaces'
import { KeyTypes } from 'uiSrc/constants'
import { useKeysApi, useKeysInContext } from 'uiSrc/modules/keys-tree/hooks/useKeys'
import { CreateHashWithExpireDto } from 'uiSrc/modules/keys-tree/hooks/interface'
import { AddHashFields } from 'uiSrc/modules/key-details/components/hash-details/add-hash-fields'
import { AddFieldsToHashDto } from 'uiSrc/modules/key-details/components/hash-details/hooks/interface'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onClose: (isCancelled?: boolean, keyType?: KeyTypes) => void
}

export const AddKeyHash = (props: Props) => {
  const { keyName = '', keyTTL, onClose } = props

  const keysApi = useKeysApi()
  const loading = useKeysInContext((state) => state.addKeyLoading)

  const submitData = ({ fields }: AddFieldsToHashDto): void => {
    const data: CreateHashWithExpireDto = {
      fields,
      keyName: stringToBuffer(keyName),
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    keysApi.addHashKey(data, () => onClose(false, KeyTypes.Hash))
  }

  const noKeyNameText = !keyName ? getRequiredFieldsText({ keyName: l10n.t('Key Name') }) : null

  return (
    <>
      <h3 className="font-bold uppercase">{l10n.t('Fields')}</h3>
      <AddHashFields
        hideCancel
        autoFocus={false}
        disabled={loading}
        disabledSubmitText={loading ? l10n.t('loading...') : noKeyNameText}
        submitText={l10n.t('Add Key')}
        containerClassName="pl-0 pt-3 h-full"
        onSubmitData={submitData}
      />
    </>
  )
}
