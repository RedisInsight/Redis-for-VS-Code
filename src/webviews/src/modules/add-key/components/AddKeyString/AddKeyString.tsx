import React, { FormEvent, useState, useEffect, ChangeEvent, useRef, Ref } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as l10n from '@vscode/l10n'

import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { stringToBuffer } from 'uiSrc/utils'
import { Maybe, RedisResponseBuffer } from 'uiSrc/interfaces'

import { addKeyStateSelector, addStringKey } from 'uiSrc/slices/browser/keys.slice'

import { SetStringWithExpire } from 'uiSrc/slices/browser/interface'
import { TextArea } from 'uiSrc/components'

import { AppDispatch } from 'uiSrc/store'
import styles from './styles.module.scss'

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
}

const AddKeyString = (props: Props) => {
  const { keyName = '', keyTTL, onCancel } = props
  const { loading } = useSelector(addKeyStateSelector)
  const [value, setValue] = useState<string>('')
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)

  const dispatch = useDispatch<AppDispatch>()

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
      keyName: stringToBuffer(keyName) as RedisResponseBuffer,
      value: stringToBuffer(value) as RedisResponseBuffer,
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addStringKey(data, onCancel))
  }

  const getTooltip = (): string => {
    const keyValid = keyName.length > 0
    const valueValid = value.length > 0
    const invalidFieldsCount = Number(!keyValid)
    const invalidFieldsString = `${!keyValid ? l10n.t('Key Name') : ''}`
    if (!keyValid || !valueValid) {
      return `${l10n.t('Enter a value for required fields')} (${invalidFieldsCount}):\n${invalidFieldsString}`
    } return ''
  }

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
              onClick={() => onCancel(true)}
            >
              {l10n.t('Cancel')}
            </VSCodeButton>
            <VSCodeButton
              onClick={submitData}
              disabled={!isFormValid || loading}
              title={getTooltip()}
              data-testid="btn-add"
            >
              {l10n.t('Add Key')}
            </VSCodeButton>
          </section>
        </section>
      </section>
    </form>
  )
}

export default AddKeyString
