import React, { FormEvent, useState, useEffect, ChangeEvent, useRef, Ref } from 'react'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import Popup from 'reactjs-popup'

import { getRequiredFieldsText, stringToBuffer } from 'uiSrc/utils'
import { Maybe, RedisString } from 'uiSrc/interfaces'
import { TextArea } from 'uiSrc/ui'
import { SetStringWithExpire } from 'uiSrc/modules/keys-tree/hooks/interface'
import { useKeysApi, useKeysInContext } from 'uiSrc/modules/keys-tree/hooks/useKeys'
import { KeyTypes } from 'uiSrc/constants'

import styles from './styles.module.scss'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onClose: (isCancelled?: boolean, keyType?: KeyTypes) => void
}

const AddKeyString = (props: Props) => {
  const { keyName = '', keyTTL, onClose } = props
  const keysApi = useKeysApi()
  const loading = useKeysInContext((state) => state.addKeyLoading)

  const [value, setValue] = useState<string>('')
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)

  useEffect(() => {
    setIsFormValid(keyName.length > 0)
  }, [keyName, value])

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: SetStringWithExpire = {
      keyName: stringToBuffer(keyName) as RedisString,
      value: stringToBuffer(value) as RedisString,
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    keysApi.addStringKey(data, () => onClose(false, KeyTypes.String))
  }

  const SubmitBtn = () => (
    <VSCodeButton
      onClick={submitData}
      disabled={!isFormValid || loading}
      data-testid="btn-add"
    >
      {l10n.t('Add Key')}
    </VSCodeButton>
  )

  const disabledSubmitText = !keyName
    ? getRequiredFieldsText({ keyName: l10n.t('Key Name') })
    : (loading ? l10n.t('loading...') : null)

  return (
    <form onSubmit={onFormSubmit}>
      <section className={styles.formWrapper}>
        <h4>{l10n.t('value')}</h4>
        <section className={styles.stringEditorWrapper}>
          <section className={styles.stringEditor}>
            <TextArea
              name="value"
              id="value"
              placeholder={l10n.t('Enter Value')}
              value={value}
              onInput={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setValue(e.target.value)
              }}
              disabled={loading}
              spellCheck={false}
              data-testid="string-value"
              inputRef={textAreaRef}
            />
            <button type="submit" style={{ display: 'none' }}>
              Submit
            </button>
          </section>
          <section className={styles.controls}>
            <VSCodeButton
              appearance="secondary"
              onClick={() => onClose(true)}
            >
              {l10n.t('Cancel')}
            </VSCodeButton>
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
          </section>
        </section>
      </section>
    </form>
  )
}

export default AddKeyString
