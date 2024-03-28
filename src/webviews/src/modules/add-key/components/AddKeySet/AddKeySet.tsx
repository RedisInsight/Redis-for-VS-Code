import React from 'react'
import * as l10n from '@vscode/l10n'

import { getRequiredFieldsText, stringToBuffer } from 'uiSrc/utils'
import { Maybe } from 'uiSrc/interfaces'
import { CreateSetWithExpireDto } from 'uiSrc/modules/keys-tree/hooks/interface'
import { useKeysApi, useKeysInContext } from 'uiSrc/modules/keys-tree/hooks/useKeys'
import { AddSetMembers } from 'uiSrc/modules/key-details/components/set-details/add-set-members'
import { AddMembersToSetDto } from 'uiSrc/modules/key-details/components/set-details/hooks/interface'
import { KeyTypes } from 'uiSrc/constants'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onClose: (isCancelled?: boolean, keyType?: KeyTypes) => void
}

const AddKeySet = (props: Props) => {
  const { keyName = '', keyTTL, onClose } = props
  const loading = useKeysInContext((state) => state.addKeyLoading)

  const keysApi = useKeysApi()

  const submitData = ({ members }: AddMembersToSetDto) => {
    const data: CreateSetWithExpireDto = {
      members,
      keyName: stringToBuffer(keyName),
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    keysApi.addSetKey(data, () => onClose(false, KeyTypes.Set))
  }

  const noKeyNameText = !keyName ? getRequiredFieldsText({ keyName: l10n.t('Key Name') }) : null

  return (
    <>
      <h3 className="font-bold uppercase">{l10n.t('Members')}</h3>
      <AddSetMembers
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

export { AddKeySet }
