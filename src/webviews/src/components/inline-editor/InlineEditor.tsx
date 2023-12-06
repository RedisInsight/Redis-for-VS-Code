import React, {
  MouseEvent,
  KeyboardEvent,
  Ref,
  memo,
  useEffect,
  useRef,
  useState,
} from 'react'
import { capitalize } from 'lodash'
import cx from 'classnames'
import { useDetectClickOutside } from 'react-detect-click-outside'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscCheck } from 'react-icons/vsc'

import { VSCodeToolkitEvent } from 'uiSrc/interfaces'
import { InputText } from 'uiSrc/components'
import styles from './styles.module.scss'

type Positions = 'top' | 'bottom' | 'left' | 'right' | 'inside'
type Design = 'default' | 'separate'

export interface Props {
  onDecline?: (event?: MouseEvent) => void
  onApply?: (value: string) => void
  onChange?: (value: string) => void
  fieldName?: string
  initialValue?: string
  placeholder?: string
  controlsPosition?: Positions
  controlsDesign?: Design
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
  controlsClassName?: string
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
    controlsPosition = 'bottom',
    controlsDesign = 'default',
    onDecline,
    onApply,
    onChange,
    fieldName,
    maxLength,
    children,
    expandable,
    isLoading,
    isInvalid,
    disableEmpty,
    disableByValidation,
    validation,
    declineOnUnmount = true,
    viewChildrenMode,
    isDisabled,
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
  const [value, setValue] = useState<string>(initialValue)
  const [isError, setIsError] = useState<boolean>(false)
  const [isActive, setIsActive] = useState(isActiveProp)
  const [isShowApprovePopover, setIsShowApprovePopover] = useState(false)

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

  useEffect(() =>
    // componentWillUnmount
    () => {
      declineOnUnmount && onDecline?.()
    },
  [])

  const handleInputValue: VSCodeToolkitEvent = (e) => {
    const target = e?.target as HTMLInputElement

    let newValue = target.value

    if (validation) {
      newValue = validation(newValue)
    }
    if (disableByValidation) {
      setIsError(disableByValidation(newValue))
    }

    // setValue(newValue)
    onChange?.(newValue)
  }

  const handleApplyClick = (event: MouseEvent | KeyboardEvent) => {
    if (approveByValidation && !approveByValidation?.(value)) {
      // setIsShowApprovePopover(true)
    } else {
      handleFormSubmit(event)
    }
  }

  const handleFocus = () => {
    setIsActive(true)
  }

  const handleOnEsc = (event: KeyboardEvent) => {
    if (event.code.toLowerCase() === 'escape' || event.keyCode === 27) {
      event.stopPropagation()
      setIsActive(false)
      onDecline?.()
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code.toLowerCase() === 'enter' || event.keyCode === 13) {
      event.stopPropagation()
      handleApplyClick(event)
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
      // <EuiOutsideClickDetector onOutsideClick={handleClickOutside}>
          <div ref={containerEl} className={styles.container}>
            {/* <EuiWindowEvent event="keydown" handler={handleOnEsc} /> */}
            {/* <EuiFocusTrap disabled={disableFocusTrap}> */}
            {/* <EuiForm
                  component="form"
                  className="relative"
                  onSubmit={handleFormSubmit}
                > */}
            <div ref={outsideClickRef}>
              {children || (
              <>
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
                    // onBlur={handleBlur}
                    // isLoading={isLoading}
                      // isInvalid={isInvalid}
                  data-testid="inline-item-editor"
                />
                {/* <VSCodeTextField
                    name={fieldName}
                    id={fieldName}
                    className={styles.field}
                    maxlength={maxLength}
                    placeholder={placeholder}
                    value={value}
                    onInput={handleInputValue}
                    onChange={handleChangeValue}
                    onblur={handleBlur}
                    // isLoading={isLoading}
                      // isInvalid={isInvalid}
                    data-testid="inline-item-editor"
                  /> */}
                {/* {expandable && (
                    <p className={styles.keyHiddenText}>{value}</p>
                  )} */}
              </>
              )}
            </div>
            <div
              className={cx(
                'InlineEditor__controls',
                styles.controls,
                styles[`controls${capitalize(controlsPosition)}`],
                styles[`controls${capitalize(controlsDesign)}`],
                controlsClassName,
                { flex: isActive },
              )}
            >
              {/* <EuiButtonIcon
                      iconType="cross"
                      color="primary"
                      aria-label="Cancel editing"
                      className={cx(styles.btn, styles.declineBtn)}
                      onClick={onDecline}
                      isDisabled={isLoading}
                      data-testid="cancel-btn"
                    /> */}
              {!approveByValidation && ApplyBtn}
              {/* {approveByValidation && (
                      <EuiPopover
                        anchorPosition="leftCenter"
                        isOpen={isShowApprovePopover}
                        closePopover={() => setIsShowApprovePopover(false)}
                        anchorClassName={styles.popoverAnchor}
                        panelClassName={cx(styles.popoverPanel)}
                        className={styles.popoverWrapper}
                        button={ApplyBtn}
                      >
                        <div className={styles.popover} data-testid="approve-popover">
                          <EuiText size="m">
                            {!!approveText?.title && (
                            <h4>
                              <b>{approveText?.title}</b>
                            </h4>
                            )}
                            <EuiText size="s" color="subdued" className={styles.approveText}>
                              {approveText?.text}
                            </EuiText>
                          </EuiText>
                          <div className={styles.popoverFooter}>
                            <EuiButton
                              fill
                              color="warning"
                              aria-label="Save"
                              className={cx(styles.btn, styles.saveBtn)}
                              isDisabled={isDisabledApply()}
                              onClick={handleFormSubmit}
                              data-testid="save-btn"
                            >
                              Save
                            </EuiButton>
                          </div>
                        </div>

                      </EuiPopover>
                    )} */}
            </div>
            {/* </EuiForm> */}
            {/* </EuiFocusTrap> */}
          </div>
      // </EuiOutsideClickDetector>
        )}
    </>
  )
})

export { InlineEditor }
