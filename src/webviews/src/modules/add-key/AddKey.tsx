import React, { useEffect, useState } from 'react'
import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react'
import { KeyTypes, SelectedKeyActionType, VscodeMessageAction } from 'uiSrc/constants'
// import HelpTexts from 'uiSrc/constants/help-texts'

// import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  // isContainJSONModule,
  Maybe,
} from 'uiSrc/interfaces'
import { vscodeApi } from 'uiSrc/services'
import { useDatabasesStore } from 'uiSrc/store'
import { stringToBuffer } from 'uiSrc/utils'
import AddKeyCommonFields from './components/AddKeyCommonFields/AddKeyCommonFields'

import { ADD_KEY_TYPE_OPTIONS } from './constants/key-type-options'
// import AddKeyHash from './AddKeyHash/AddKeyHash'
// import AddKeyZset from './AddKeyZset/AddKeyZset'
import { AddKeyString } from './components/AddKeyString/AddKeyString'
import { AddKeyList } from './components/AddKeyList/AddKeyList'
// import AddKeyReJSON from './AddKeyReJSON/AddKeyReJSON'
// import AddKeyStream from './AddKeyStream/AddKeyStream'
import { AddKeySet } from './components/AddKeySet/AddKeySet'

import { useKeysApi, useKeysInContext } from '../keys-tree/hooks/useKeys'
import styles from './styles.module.scss'

export const AddKey = () => {
  const loading = useKeysInContext((state) => state.addKeyLoading)
  const keysApi = useKeysApi()
  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)

  // const { id: instanceId } = useSelector(connectedInstanceSelector)

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
        key: stringToBuffer(keyName),
        keyString: keyName,
        keyType,
        databaseId: databaseId!,
        type: SelectedKeyActionType.Added,
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

      {/* {typeSelected === KeyTypes.Hash && (
            <AddKeyHash onCancel={closeAddKeyPanel} {...defaultFields} />
          )} */}
      {/* {typeSelected === KeyTypes.ZSet && (
            <AddKeyZset onCancel={closeAddKeyPanel} {...defaultFields} />
          )} */}
      {typeSelected === KeyTypes.Set && (
        <AddKeySet onClose={closeAddKeyPanel} {...defaultFields} />
      )}
      {typeSelected === KeyTypes.String && (
        <AddKeyString onClose={closeAddKeyPanel} {...defaultFields} />
      )}
      {typeSelected === KeyTypes.List && (
        <AddKeyList onClose={closeAddKeyPanel} {...defaultFields} />
      )}
      {/* {typeSelected === KeyTypes.ReJSON && (
            <>
              {!isContainJSONModule(modules) && (
                <span className={styles.helpText} data-testid="json-not-loaded-text">
                  HelpTexts.REJSON_SHOULD_BE_LOADED}
                </span>
              )}
              <AddKeyReJSON onCancel={closeAddKeyPanel} {...defaultFields} />
            </>
          )} */}
      {/* {typeSelected === KeyTypes.Stream && (
            <AddKeyStream onCancel={closeAddKeyPanel} {...defaultFields} />
          )} */}
    </div>
  )
}
