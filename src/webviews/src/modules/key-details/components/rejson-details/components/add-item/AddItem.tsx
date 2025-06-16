import React, { useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscCheck, VscChromeClose } from 'react-icons/vsc'
import useOnclickOutside from 'react-cool-onclickoutside'
import { GoAlert } from 'react-icons/go'

import { FieldMessage } from 'uiSrc/components'
import { Nullable } from 'uiSrc/interfaces'
import { Keys } from 'uiSrc/constants'
import { InputText } from 'uiSrc/ui'

import { isValidJSON, isValidKey } from '../../utils'
import { JSONErrors } from '../../constants'

import styles from '../../styles.module.scss'

export interface Props {
  isPair: boolean
  onCancel: () => void
  onSubmit: (pair: { key?: string; value: string }) => void
  leftPadding?: number
  shouldCloseOnOutsideClick?: boolean
}

export const AddItem = (props: Props) => {
  const {
    isPair,
    leftPadding = 0,
    onCancel,
    onSubmit,
    shouldCloseOnOutsideClick = true,
  } = props

  const [key, setKey] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [error, setError] = useState<Nullable<string>>(null)

  const handleClickOutside = () => shouldCloseOnOutsideClick && onCancel?.()

  const inputRef = useRef<HTMLInputElement>(null)

  const outsideClickRef = useOnclickOutside(handleClickOutside)

  useEffect(() => {
    setError(null)
  }, [key, value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key?.toLowerCase() === Keys.ESCAPE) {
      e.stopPropagation()
      onCancel?.()
    }
  }

  const handleFormSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    if (isPair && !isValidKey(key)) {
      setError(JSONErrors.keyCorrectSyntax)
      inputRef.current?.focus()
      return
    }

    if (!isValidJSON(value)) {
      setError(JSONErrors.valueJSONFormat)
      inputRef.current?.focus()
      return
    }

    onSubmit({ key, value })
  }

  return (
    <div
      className={cx(styles.row, 'flex flex-row')}
      style={{ paddingLeft: `${leftPadding}em` }}
    >
      <div ref={outsideClickRef}>
        <form
          onSubmit={handleFormSubmit}
          data-testid="form"
          className="flex relative h-[26px] items-center pl-3"
          onKeyDown={handleKeyDown}
        >
          {isPair && (
            <span className="inline grow">
              <InputText
                autoFocus
                name="newRootKey"
                inputRef={inputRef}
                value={key}
                invalid={!!error}
                placeholder={l10n.t('Enter JSON key')}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setKey(e.target.value)
                }
                data-testid="json-key"
              />
            </span>
          )}
          <span className="inline grow">
            <InputText
              autoFocus={!isPair}
              name="newValue"
              value={value}
              placeholder={l10n.t('Enter JSON value')}
              invalid={!!error}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setValue(e.target.value)
              }
              data-testid="json-value"
            />
          </span>
          <div className={cx(styles.controls)}>
            <VSCodeButton
              appearance="icon"
              className={styles.declineBtn}
              onClick={() => onCancel?.()}
              aria-label="Cancel editing"
            >
              <VscChromeClose />
            </VSCodeButton>
            <VSCodeButton
              appearance="icon"
              className={styles.applyBtn}
              onClick={() => handleFormSubmit()}
              aria-label="Apply"
              data-testid="apply-btn"
            >
              <VscCheck />
            </VSCodeButton>
          </div>
        </form>
        {!!error && (
          <div className={cx(styles.errorMessage)}>
            <FieldMessage
              scrollViewOnAppear
              Icon={<GoAlert />}
              testID="edit-json-error"
            >
              {error}
            </FieldMessage>
          </div>
        )}
      </div>
    </div>
  )
}
