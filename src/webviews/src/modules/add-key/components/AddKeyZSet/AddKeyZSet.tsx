import React from 'react'
import * as l10n from '@vscode/l10n'

import { getRequiredFieldsText, stringToBuffer } from 'uiSrc/utils'
import { Maybe } from 'uiSrc/interfaces'
import { KeyTypes } from 'uiSrc/constants'
import { useKeysApi, useKeysInContext } from 'uiSrc/modules/keys-tree/hooks/useKeys'
import { CreateZSetWithExpireDto } from 'uiSrc/modules/keys-tree/hooks/interface'
import { AddMembersToZSetDto } from 'uiSrc/modules/key-details/components/zset-details/hooks/interface'
import { AddZSetMembers } from 'uiSrc/modules/key-details/components/zset-details/add-zset-members'
import { IZsetMemberState } from './constants'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onClose: (isCancelled?: boolean, keyType?: KeyTypes) => void
}

export const AddKeyZSet = (props: Props) => {
  const { keyName = '', keyTTL, onClose } = props

  const keysApi = useKeysApi()
  const loading = useKeysInContext((state) => state.addKeyLoading)

  const submitData = ({ members }: AddMembersToZSetDto): void => {
    const data: CreateZSetWithExpireDto = {
      members,
      keyName: stringToBuffer(keyName),
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    keysApi.addZSetKey(data, () => onClose(false, KeyTypes.ZSet))
  }

  const getDisabledSubmitText = (members: IZsetMemberState[]) => {
    const isScoreExists = members.every((member) => member.score?.toString().length)

    const noKeyNameText = getRequiredFieldsText({
      keyName: !keyName && l10n.t('Key Name'),
      score: !isScoreExists && l10n.t('Score'),
    }) || ''

    return loading ? l10n.t('loading...') : noKeyNameText
  }

  return (
    <>
      <h3 className="font-bold uppercase">{l10n.t('Members')}</h3>
      <AddZSetMembers
        hideCancel
        autoFocus={false}
        disabled={loading}
        getDisabledSubmitText={getDisabledSubmitText}
        submitText={l10n.t('Add Key')}
        containerClassName="pl-0 pt-3 h-full"
        onSubmitData={submitData}
      />
    </>
  )
}
