import React, {
  MouseEvent,
  KeyboardEvent,
  Ref,
  memo,
  useEffect,
  useRef,
  useState,
} from 'react'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'
import { useDetectClickOutside } from 'react-detect-click-outside'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscCheck, VscError } from 'react-icons/vsc'
import { RxCross1 } from 'react-icons/rx'
import Popup from 'reactjs-popup'
import { capitalize } from 'lodash'
import { PopupActions } from 'reactjs-popup/dist/types'

import { VSCodeToolkitEvent } from 'uiSrc/interfaces'
import { InputText } from 'uiSrc/ui'
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
  isActive?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  isInvalid?: boolean
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
    isLoading,
    isInvalid,
    autoSelect,
    autoFocus,
    disableEmpty,
    disableByValidation,
    validation,
    declineOnUnmount = true,
    viewChildrenMode,
    isDisabled,
    controlsPosition = 'center',
    autoComplete = 'off',
    controlsClassName,
    disabledTooltipText,
    preventOutsideClick = false,
    disableFocusTrap = false,
    approveByValidation,
    approveText,
    isActive: isActiveProp,
  } = props

  const containerEl: Ref<HTMLDivElement> = useRef(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const popupRef = useRef<PopupActions>(null)
  const [value, setValue] = useState<string>(initialValue)
  const [isError, setIsError] = useState<boolean>(false)
  const [isActive, setIsActive] = useState(isActiveProp)

  const handleClickOutside = (event: any) => {
    if (preventOutsideClick) return
    if (!containerEl?.current?.contains(event.target)) {
      if (!isLoading) {
        setIsActive(false)
        onDecline?.(event)
      } else {
        event.stopPropagation()
        event.preventDefault()
      }
    }
  }

  const outsideClickRef = useDetectClickOutside({ onTriggered: handleClickOutside })

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

  const handleInputValue: VSCodeToolkitEvent = (e) => {
    const target = e?.target as HTMLInputElement

    let newValue = target.value

    if (validation) {
      newValue = validation(newValue)
      setValue(newValue)
    }
    if (disableByValidation) {
      setIsError(disableByValidation(newValue))
    }

    onChange?.(newValue)
  }

  const handleApplyClick = (event: MouseEvent | KeyboardEvent) => {
    if (approveByValidation && !approveByValidation?.(value)) {
      popupRef.current?.open()
    } else {
      handleFormSubmit(event)
      popupRef.current?.close()
    }
  }

  const handleFocus = () => {
    setIsActive(true)
  }

  // const handleOnEsc = (event: KeyboardEvent) => {
  //   if (event.code.toLowerCase() === 'escape' || event.keyCode === 27) {
  //     event.stopPropagation()
  //     setIsActive(false)
  //     onDecline?.()
  //   }
  // }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code.toLowerCase() === 'enter' || event.keyCode === 13) {
      event.stopPropagation()
      handleApplyClick(event)
    }

    if (event.code.toLowerCase() === 'escape' || event.keyCode === 27) {
      event.stopPropagation()
      setIsActive(false)
      onDecline?.()
    }
  }

  const handleFormSubmit = (event: MouseEvent | KeyboardEvent): void => {
    event.preventDefault()
    event.stopPropagation()
    setIsActive(false)
    onApply?.(value)
  }

  const isDisabledApply = (): boolean =>
    !!(isLoading || isError || isDisabled || (disableEmpty && !value.length))

  const ApplyBtn = (
    <VSCodeButton
      appearance="icon"
      disabled={isDisabledApply()}
      data-testid="apply-btn"
      onClick={handleApplyClick}
      aria-label="apply"
      className={styles.applyBtn}
      title={isDisabled ? `${disabledTooltipText?.title}\n${disabledTooltipText?.text}` : ''}
    >
      <VscCheck />
    </VSCodeButton>
  )

  return (
    <>
      {viewChildrenMode
        ? children : (
          <div ref={containerEl} className={styles.container}>
            <div ref={outsideClickRef} className="flex-1">
              {children || (
                <InputText
                  type="text"
                  name={fieldName}
                  id={fieldName}
                  className={styles.field}
                  maxLength={maxLength}
                  placeholder={placeholder}
                  value={value}
                  onFocus={handleFocus}
                  onInput={handleInputValue}
                  onKeyDown={handleKeyDown}
                  inputRef={inputRef}
                  data-testid="inline-item-editor"
                />
              )}
            </div>
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
                disabled={isLoading}
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
