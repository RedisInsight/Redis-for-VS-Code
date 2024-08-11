import React, { useState } from 'react'
import cx from 'classnames'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscEdit } from 'react-icons/vsc'

import { StopPropagation } from 'uiSrc/components/virtual-table'
import { InlineEditor } from 'uiSrc/components'
import { Tooltip } from 'uiSrc/ui'
import styles from './styles.module.scss'

export interface Props {
  children: React.ReactNode
  initialValue?: string
  field?: string
  placeholder?: string
  editing: boolean
  editBtnDisabled?: boolean
  onEdit: (isEditing: boolean) => void
  validation?: (value: string) => string
  editToolTipContent?: React.ReactNode
  onDecline: (event?: React.MouseEvent) => void
  onApply: (value: string) => void
  testIdPrefix?: string
}

export const EditableInput = (props: Props) => {
  const {
    children,
    initialValue = '',
    field,
    placeholder,
    editing,
    editBtnDisabled: editDisabled,
    editToolTipContent,
    validation,
    onEdit,
    onDecline,
    onApply,
    testIdPrefix = '',
  } = props

  const [isHovering, setIsHovering] = useState(false)

  if (!editing) {
    return (
      <div
        className={styles.contentWrapper}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        data-testid={`${testIdPrefix}_content-value-${field}`}
      >
        <div className="max-w-full whitespace-break-spaces">
          <div className="flex">
            {children}
          </div>
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
    <StopPropagation>
      <div className={styles.inputWrapper}>
        <InlineEditor
          autoFocus
          initialValue={initialValue}
          inputClassName="h-[25px]"
          placeholder={placeholder}
          fieldName={field}
          expandable
          onDecline={(event) => {
            onDecline(event)
            onEdit?.(false)
          }}
          onApply={(value) => {
            onApply(value)
            onEdit?.(false)
          }}
          validation={validation}
        />
      </div>
    </StopPropagation>
  )
}
