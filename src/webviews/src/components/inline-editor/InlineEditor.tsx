import React, {
  MouseEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
  memo,
} from 'react'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscCheck, VscError } from 'react-icons/vsc'
import { RxCross1 } from 'react-icons/rx'
import Popup from 'reactjs-popup'
import { capitalize } from 'lodash'
import { PopupActions } from 'reactjs-popup/dist/types'
import useOnclickOutside from 'react-cool-onclickoutside'

import { VSCodeToolkitEvent } from 'uiSrc/interfaces'
import { InputText, Tooltip } from 'uiSrc/ui'
import styles from './styles.module.scss'

export interface Props {
  onDecline?: (event?: MouseEvent) => void
  onApply?: (value: string) => void
  onChange?: (value: string) => void
  fieldName?: string
  initialValue?: string
  placeholder?: string
  maxLength?: number
  expandable?: boolean
  active?: boolean
  loading?: boolean
  disabled?: boolean
  invalid?: boolean
  disableEmpty?: boolean
  disableByValidation?: (value: string) => boolean
  children?: React.ReactElement
  validation?: (value: string) => string
  declineOnUnmount?: boolean
  viewChildrenMode?: boolean
  autoComplete?: string
  autoSelect?: boolean
  autoFocus?: boolean
  controlsClassName?: string
  controlsPosition?: 'center' | 'bottom'
  disabledTooltipText?: { title: string, text: string }
  preventOutsideClick?: boolean
  disableFocusTrap?: boolean
  approveByValidation?: (value: string) => boolean
  approveText?: { title: string, text: string }
  inputClassName?: string
  inlineTestId?: string
}

const InlineEditor = memo((props: Props) => {
  const {
    initialValue = '',
    placeholder = '',
    onDecline,
    onApply,
    onChange,
    fieldName,
    maxLength,
    children,
    expandable,
    loading,
    invalid,
    autoSelect,
    autoFocus,
    disableEmpty,
    disableByValidation,
    validation,
    declineOnUnmount = true,
    viewChildrenMode,
    disabled,
    controlsPosition = 'center',
    autoComplete = 'off',
    controlsClassName,
    disabledTooltipText,
    preventOutsideClick = false,
    disableFocusTrap = false,
    approveByValidation,
    approveText,
    active: activeProp,
    inputClassName,
    inlineTestId = 'inline-item-editor',
  } = props

  const inputRef = useRef<HTMLInputElement>(null)
  const popupRef = useRef<PopupActions>(null)
  const [value, setValue] = useState<string>(initialValue)
  const [isError, setIsError] = useState<boolean>(false)
  const [isActive, setIsActive] = useState(activeProp)

  const handleClickOutside = (event: any) => {
    if (preventOutsideClick) return
    if (!loading) {
      onDecline?.(event)
    } else {
      event.stopPropagation()
      event.preventDefault()
    }
  }

  const outsideClickRef = useOnclickOutside(handleClickOutside)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    autoFocus && inputRef?.current?.focus()
    autoSelect && inputRef?.current?.select()
    return () => {
      declineOnUnmount && onDecline?.()
    }
  }, [])

  useEffect(() => {
    invalid && inputRef?.current?.focus()
  }, [invalid])

  const handleInputValue: VSCodeToolkitEvent = (e) => {
    const target = e?.target as HTMLInputElement

    let newValue = target.value

    if (validation) {
      newValue = validation(newValue)
    }
    if (disableByValidation) {
      setIsError(disableByValidation(newValue))
    }

    setValue(newValue)
    onChange?.(newValue)
  }

  const handleApplyClick = (event: MouseEvent | KeyboardEvent) => {
    if (approveByValidation && !approveByValidation?.(value)) {
      popupRef.current?.open()
      inputRef.current?.focus()
    } else {
      handleFormSubmit(event)
      popupRef.current?.close()
    }
  }

  const handleFocus = () => {
    setIsActive(true)
  }

  const handleBlur = () => {
    setIsActive(false)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code.toLowerCase() === 'enter' || event.keyCode === 13) {
      event.stopPropagation()
      handleApplyClick(event)
    }

    if (event.code.toLowerCase() === 'escape' || event.keyCode === 27) {
      event.stopPropagation()
      onDecline?.()
    }
  }

  const handleFormSubmit = (event: MouseEvent | KeyboardEvent): void => {
    event.preventDefault()
    event.stopPropagation()
    onApply?.(value)
  }

  const isDisabledApply = (): boolean =>
    !!(loading || isError || disabled || (disableEmpty && !value.length))

  const ApplyBtn = (
    <Tooltip
      title={disabled ? disabledTooltipText?.title : ''}
      content={disabled ? disabledTooltipText?.text : ''}
    >
      <VSCodeButton
        appearance="icon"
        disabled={isDisabledApply()}
        data-testid="apply-btn"
        onClick={handleApplyClick}
        aria-label="apply"
        className={styles.applyBtn}
      >
        <VscCheck />
      </VSCodeButton>
    </Tooltip>
  )

  return (
    <>
      {viewChildrenMode
        ? children : (
          <div ref={outsideClickRef} className={styles.container}>
            {children || (
              <InputText
                type="text"
                name={fieldName}
                id={fieldName}
                invalid={invalid}
                className={cx(styles.field, inputClassName)}
                maxLength={maxLength}
                placeholder={placeholder}
                value={value}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onInput={handleInputValue}
                onKeyDown={handleKeyDown}
                inputRef={inputRef}
                data-testid={inlineTestId}
              />
            )}
            <div
              className={cx(
                styles.controls,
                styles[`controls${capitalize(controlsPosition)}`],
                controlsClassName,
                { flex: isActive },
              )}
            >
              <VSCodeButton
                appearance="icon"
                aria-label="Cancel editing"
                className={cx(
                  styles.btn,
                  styles.declineBtn,
                )}
                onClick={(event) => {
                  setIsActive(false)
                  onDecline?.(event)
                }}
                disabled={loading}
                data-testid="cancel-btn"
              >
                { controlsPosition === 'bottom' ? <RxCross1 /> : <VscError />}
              </VSCodeButton>

              {ApplyBtn}
              {approveByValidation && (
                <Popup
                  closeOnEscape
                  closeOnDocumentClick
                  repositionOnResize
                  ref={popupRef}
                  position="left center"
                  trigger={<div />}
                >
                  <div className={styles.popover} data-testid="approve-popover">
                    <div>
                      {!!approveText?.title && (
                      <h4>
                        <b>{approveText?.title}</b>
                      </h4>
                      )}
                      <div className={styles.approveText}>
                        {approveText?.text}
                      </div>
                    </div>
                    <div className={styles.popoverFooter}>
                      <VSCodeButton
                        appearance="primary"
                        disabled={isDisabledApply()}
                        data-testid="save-btn"
                        className={cx(styles.btn, styles.saveBtn)}
                        onClick={handleFormSubmit}
                      >
                        {l10n.t('Save')}
                      </VSCodeButton>
                    </div>
                  </div>
                </Popup>
              )}
            </div>
          </div>
        )}
    </>
  )
})

export { InlineEditor }
