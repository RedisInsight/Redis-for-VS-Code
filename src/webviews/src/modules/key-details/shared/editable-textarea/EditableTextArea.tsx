import React, { ChangeEvent, Ref, useEffect, useRef, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import cx from 'classnames'
import { VscEdit } from 'react-icons/vsc'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import * as l10n from '@vscode/l10n'

import { StopPropagation } from 'uiSrc/components/virtual-table'
import { InlineEditor } from 'uiSrc/components'
import { TextArea, Tooltip } from 'uiSrc/ui'

import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
  initialValue?: string
  field?: string
  editing: boolean
  loading?: boolean
  disabled?: boolean
  invalid?: boolean
  editBtnDisabled?: boolean
  disabledTooltipText?: { title: string, text: string }
  approveText?: { title: string, text: string }
  editToolTipContent?: React.ReactNode
  approveByValidation?: (value: string) => boolean
  onEdit: (isEditing: boolean) => void
  onUpdateTextAreaHeight?: () => void
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onDecline: (event?: React.MouseEvent) => void
  onApply: (value: string) => void
  testIdPrefix?: string
}

export const EditableTextArea = (props: Props) => {
  const {
    children,
    initialValue = '',
    field = '',
    editing,
    editBtnDisabled: editDisabled,
    loading,
    disabled,
    invalid,
    disabledTooltipText,
    approveText,
    editToolTipContent,
    approveByValidation = () => true,
    onEdit,
    onUpdateTextAreaHeight,
    onChange,
    onDecline,
    onApply,
    testIdPrefix = '',
  } = props

  const [value, setValue] = useState('')
  const [isHovering, setIsHovering] = useState(false)
  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (editing) {
      updateTextAreaHeight()
      setTimeout(() => textAreaRef?.current?.focus(), 0)
    }
  }, [editing])

  const updateTextAreaHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '0px'
      textAreaRef.current.style.height = `${textAreaRef.current?.scrollHeight || 0}px`
      onUpdateTextAreaHeight?.()
    }
  }

  const handleOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    updateTextAreaHeight()
    onChange?.(e)
  }

  if (!editing) {
    return (
      <div
        className={styles.contentWrapper}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        data-testid={`${testIdPrefix}_content-value-${field}`}
      >
        <div className="max-w-full whitespace-break-spaces">
          {children}
        </div>
        {isHovering && (
          <Tooltip
            content={editToolTipContent}
            data-testid={`${testIdPrefix}_edit-tooltip-${field}`}
          >
            <VSCodeButton
              appearance="icon"
              aria-label="Edit field"
              className={cx('editFieldBtn', styles.editBtnAnchor)}
              color="primary"
              disabled={editDisabled}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onEdit?.(true)
                setIsHovering(false)
              }}
              data-testid={`${testIdPrefix}_edit-btn-${field}`}
            >
              <VscEdit />
            </VSCodeButton>
          </Tooltip>
        )}
      </div>
    )
  }

  return (
    <AutoSizer disableHeight onResize={() => setTimeout(updateTextAreaHeight, 0)}>
      {({ width }) => (
        <div style={{ width: width + 28 }} className={styles.textareaContainer}>
          <StopPropagation>
            <InlineEditor
              active
              expandable
              preventOutsideClick
              disableFocusTrap
              declineOnUnmount={false}
              initialValue={initialValue}
              controlsPosition="bottom"
              fieldName="fieldValue"
              loading={loading}
              disabled={disabled}
              invalid={invalid}
              disabledTooltipText={disabledTooltipText}
              controlsClassName={styles.textAreaControls}
              onDecline={(event) => {
                onDecline(event)
                setValue(initialValue)
                onEdit(false)
              }}
              onApply={() => {
                onApply(value)
                setValue(initialValue)
                onEdit(false)
              }}
              approveText={approveText}
              approveByValidation={() => approveByValidation?.(value)}
            >
              <TextArea
                name="value"
                id="value"
                autoFocus
                placeholder={l10n.t('Enter Value')}
                value={value}
                onChange={handleOnChange}
                disabled={loading}
                inputRef={textAreaRef}
                className={cx(styles.textArea, { [styles.areaWarning]: disabled })}
                spellCheck={false}
                style={{ height: textAreaRef.current?.scrollHeight || 0 }}
                data-testid={`${testIdPrefix}_value-editor-${field}`}
              />
            </InlineEditor>
          </StopPropagation>
        </div>
      )}
    </AutoSizer>
  )
}
