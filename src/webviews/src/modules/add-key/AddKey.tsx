import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react'
import { KeyTypes, VscodeMessageAction } from 'uiSrc/constants'
// import HelpTexts from 'uiSrc/constants/help-texts'
import {
  addKeyStateSelector,
  resetAddKey,
} from 'uiSrc/slices/browser/keys.slice'
// import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  // isContainJSONModule,
  Maybe,
} from 'uiSrc/interfaces'
import { vscodeApi } from 'uiSrc/services'
import { AppDispatch } from 'uiSrc/store'
import AddKeyCommonFields from './components/AddKeyCommonFields/AddKeyCommonFields'

import { ADD_KEY_TYPE_OPTIONS } from './constants/key-type-options'
// import AddKeyHash from './AddKeyHash/AddKeyHash'
// import AddKeyZset from './AddKeyZset/AddKeyZset'
import AddKeyString from './components/AddKeyString/AddKeyString'
// import AddKeySet from './AddKeySet/AddKeySet'
// import AddKeyList from './AddKeyList/AddKeyList'
// import AddKeyReJSON from './AddKeyReJSON/AddKeyReJSON'
// import AddKeyStream from './AddKeyStream/AddKeyStream'

import styles from './styles.module.scss'

export const AddKey = () => {
  const dispatch = useDispatch<AppDispatch>()

  const { loading } = useSelector(addKeyStateSelector)
  // const { id: instanceId } = useSelector(connectedInstanceSelector)

  useEffect(
    () =>
      // componentWillUnmount
      () => {
        dispatch(resetAddKey())
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

  const closeAddKeyPanel = (isCancelled?: boolean) => {
    vscodeApi.postMessage({
      action: isCancelled ? VscodeMessageAction.CloseAddKey : VscodeMessageAction.CloseAddRefreshKey,
      data: keyName,
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
      {/* {typeSelected === KeyTypes.Set && (
            <AddKeySet onCancel={closeAddKeyPanel} {...defaultFields} />
          )} */}
      {typeSelected === KeyTypes.String && (
        <AddKeyString onCancel={closeAddKeyPanel} {...defaultFields} />
      )}
      {/* {typeSelected === KeyTypes.List && (
            <AddKeyList onCancel={closeAddKeyPanel} {...defaultFields} />
          )} */}
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
