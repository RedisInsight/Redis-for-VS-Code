import React from 'react'
import { toNumber } from 'lodash'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'

import { VSCodeDropdown, VSCodeOption } from '@vscode/webview-ui-toolkit/react'
import { validateTTLNumberForAddKey } from 'uiSrc/utils'
import {
  AddCommonFieldsFormConfig as config,
} from 'uiSrc/constants'
import { Maybe } from 'uiSrc/interfaces'
import { InputText } from 'uiSrc/ui'

import styles from './styles.module.scss'

export interface Props {
  typeSelected: string
  onChangeType: (type: string) => void
  options: any
  loading: boolean
  keyName: string
  setKeyName: React.Dispatch<React.SetStateAction<string>>
  keyTTL: Maybe<number>
  setKeyTTL: React.Dispatch<React.SetStateAction<Maybe<number>>>
}

const AddKeyCommonFields = (props: Props) => {
  const {
    typeSelected,
    onChangeType = () => { },
    options,
    loading,
    keyName,
    setKeyName,
    keyTTL,
    setKeyTTL,
  } = props

  const handleTTLChange = (event: any) => {
    event.preventDefault()
    const target = event.currentTarget
    const value = validateTTLNumberForAddKey(target.value)
    if (value.toString().length) {
      setKeyTTL(toNumber(value))
    } else {
      setKeyTTL(undefined)
    }
  }

  const typeChangeHandle = (event: any): void => onChangeType(event.target.value)

  return (
    <div className={styles.wrapper}>
      <VSCodeDropdown
        className={cx(styles.inputField, styles.halfWidth, 'grow')}
        disabled={loading}
        value={typeSelected}
        onChange={typeChangeHandle}
        data-testid="select-key-type"
      >
        {options.map((option: { text: string, value: string }) => (
          <VSCodeOption
            key={option.value}
            value={option.value}
            className={styles.inputField__option}
          >
            {option.text}
          </VSCodeOption>
        ))}
      </VSCodeDropdown>
      <InputText
        className={cx(styles.inputField, styles.halfWidth, 'grow')}
        name={config.keyTTL.name}
        id={config.keyTTL.name}
        placeholder={l10n.t('TTL: No limit')}
        value={`${keyTTL ?? ''}`}
        onChange={handleTTLChange}
        disabled={loading}
        data-testid="ttl-input"
      />
      <InputText
        className={cx(styles.inputField, 'w-full')}
        name={config.keyName.name}
        id={config.keyName.name}
        value={keyName}
        placeholder={l10n.t('Key name*')}
        onChange={(e: any) =>
          setKeyName(e.target.value)}
        disabled={loading}
        data-testid="key-input"
      />
    </div>
  )
}

export default AddKeyCommonFields
