import React, { useRef, useState } from 'react'
import cx from 'classnames'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscCheck, VscChromeClose } from 'react-icons/vsc'
import useOnclickOutside from 'react-cool-onclickoutside'
import { GoAlert } from 'react-icons/go'

import { FieldMessage } from 'uiSrc/components'
import { Nullable } from 'uiSrc/interfaces'
import { Keys } from 'uiSrc/constants'

import { MonacoJson } from 'uiSrc/components/monaco-editor'
import { isValidJSON } from '../../utils'
import { JSONErrors } from '../../constants'

import styles from '../../styles.module.scss'

export interface Props {
  initialValue: string
  shouldCloseOnOutsideClick?: boolean
  onCancel?: () => void
  onSubmit: (value: string) => void
}

export const EditEntireItemAction = (props: Props) => {
  const {
    initialValue,
    onCancel,
    onSubmit,
    shouldCloseOnOutsideClick = true,
  } = props
  const [value, setValue] = useState<string>(initialValue)
  const [error, setError] = useState<Nullable<string>>(null)

  const handleClickOutside = () => shouldCloseOnOutsideClick && onCancel?.()

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const outsideClickRef = useOnclickOutside(handleClickOutside)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key?.toLowerCase() === Keys.ESCAPE) {
      e.stopPropagation()
      onCancel?.()
    }
  }

  const handleFormSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    if (!isValidJSON(value)) {
      setError(JSONErrors.valueJSONFormat)
      textareaRef.current?.focus()
      return
    }

    onSubmit(value)
  }

  return (
    <div className={styles.row}>
      <div className={styles.fullWidthContainer} ref={outsideClickRef}>
        <form
          onSubmit={handleFormSubmit}
          className="flex flex-col relative"
          data-testid="json-entire-form"
          onKeyDown={handleKeyDown}
        >
          <div className="grow">
            <div className={styles.editor}>
              <MonacoJson
                wrapperClassName={styles.editorWrapper}
                value={value}
                onChange={setValue}
                data-testid="json-value"
              />
            </div>
          </div>
          <div className={cx(styles.controls, styles.controlsBottom)}>
            <VSCodeButton
              appearance="icon"
              className={styles.declineBtn}
              onClick={onCancel}
              aria-label="Cancel add"
              data-testid="cancel-edit-btn"
            >
              <VscChromeClose />
            </VSCodeButton>

            <VSCodeButton
              appearance="icon"
              className={styles.applyBtn}
              onClick={() => handleFormSubmit()}
              aria-label="Apply"
              data-testid="apply-edit-btn"
            >
              <VscCheck />
            </VSCodeButton>
          </div>
        </form>
        {error && (
          <div
            className={cx(styles.errorMessage, styles.errorMessageForTextArea)}
          >
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
