import React, { useEffect, useState } from 'react'
import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react'
import { KeyTypes, SelectedKeyActionType, VscodeMessageAction } from 'uiSrc/constants'

import { Maybe } from 'uiSrc/interfaces'
import { vscodeApi } from 'uiSrc/services'
import { useDatabasesStore } from 'uiSrc/store'
import { getGroupTypeDisplay, stringToBuffer } from 'uiSrc/utils'

import AddKeyCommonFields from './components/AddKeyCommonFields/AddKeyCommonFields'
import { ADD_KEY_TYPE_OPTIONS } from './constants/key-type-options'
import { AddKeyString } from './components/AddKeyString/AddKeyString'
import { AddKeyList } from './components/AddKeyList/AddKeyList'
import { AddKeyReJSON } from './components/AddKeyReJSON/AddKeyReJSON'
// import AddKeyStream from './AddKeyStream/AddKeyStream'
import { AddKeySet } from './components/AddKeySet/AddKeySet'
import { AddKeyHash } from './components/AddKeyHash/AddKeyHash'
import { AddKeyZSet } from './components/AddKeyZSet/AddKeyZSet'

import { useKeysApi, useKeysInContext } from '../keys-tree/hooks/useKeys'
import styles from './styles.module.scss'

export const AddKey = () => {
  const loading = useKeysInContext((state) => state.addKeyLoading)
  const keysApi = useKeysApi()
  const database = useDatabasesStore((state) => state.connectedDatabase)

  useEffect(
    () =>
      // componentWillUnmount
      () => {
        keysApi.resetAddKey()
      },
    [],
  )

  const options = ADD_KEY_TYPE_OPTIONS
  const [typeSelected, setTypeSelected] = useState<string>(options[0].value)
  const [keyName, setKeyName] = useState<string>('')
  const [keyTTL, setKeyTTL] = useState<Maybe<number>>(undefined)

  const onChangeType = (value: string) => {
    setTypeSelected(value)
  }

  const closeAddKeyPanel = (isCancelled?: boolean, keyType?: KeyTypes) => {
    if (isCancelled) {
      vscodeApi.postMessage({
        action: VscodeMessageAction.CloseAddKey,
        data: keyName,
      })
      return
    }

    vscodeApi.postMessage({
      action: VscodeMessageAction.CloseAddKeyAndRefresh,
      data: {
        type: SelectedKeyActionType.Added,
        database: database!,
        keyInfo: {
          keyType,
          keyString: keyName,
          key: stringToBuffer(keyName),
          displayedKeyType: getGroupTypeDisplay(keyType),
        },
      },
    })
  }

  const defaultFields = {
    keyName,
    keyTTL,
  }

  return (
    <div className={styles.page}>
      <AddKeyCommonFields
        typeSelected={typeSelected}
        onChangeType={onChangeType}
        options={options}
        loading={loading}
        keyName={keyName}
        setKeyName={setKeyName}
        keyTTL={keyTTL}
        setKeyTTL={setKeyTTL}
      />

      <VSCodeDivider className={styles.divider} />

      {typeSelected === KeyTypes.Hash && (
        <AddKeyHash onClose={closeAddKeyPanel} {...defaultFields} />
      )}
      {typeSelected === KeyTypes.ZSet && (
        <AddKeyZSet onClose={closeAddKeyPanel} {...defaultFields} />
      )}
      {typeSelected === KeyTypes.Set && (
        <AddKeySet onClose={closeAddKeyPanel} {...defaultFields} />
      )}
      {typeSelected === KeyTypes.String && (
        <AddKeyString onClose={closeAddKeyPanel} {...defaultFields} />
      )}
      {typeSelected === KeyTypes.List && (
        <AddKeyList onClose={closeAddKeyPanel} {...defaultFields} />
      )}
      {typeSelected === KeyTypes.ReJSON && (
        <AddKeyReJSON onClose={closeAddKeyPanel} {...defaultFields} />
      )}
      {/* {typeSelected === KeyTypes.Stream && (
            <AddKeyStream onCancel={closeAddKeyPanel} {...defaultFields} />
          )} */}
    </div>
  )
}
