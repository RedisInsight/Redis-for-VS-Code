import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import React from 'react'
import * as l10n from '@vscode/l10n'
import { VscDiffAdded, VscTrash } from 'react-icons/vsc'
import cx from 'classnames'
import { Tooltip } from 'uiSrc/ui'

export interface Props {
  id: number
  length: number
  index: number
  disabled?: boolean
  removeItem: (id: number) => void
  addItem: () => void
  anchorClassName?: string
  clearItemValues?: (id: number) => void
  clearIsDisabled?: boolean
  addItemIsDisabled?: boolean
  'data-testid'?: string
}

const AddItemsActions = (props: Props) => {
  const {
    id,
    length,
    disabled,
    removeItem,
    index,
    addItem,
    anchorClassName,
    clearItemValues,
    clearIsDisabled,
    addItemIsDisabled,
    'data-testid': dataTestId,
  } = props

  const handleClick = () => {
    if (length !== 1) {
      removeItem(id)
    } else {
      clearItemValues?.(id)
    }
  }

  return (
    <div className="flex items-center flex-row action-buttons h-11 w-20 pl-1">
      {!clearIsDisabled && (
        <Tooltip content={length === 1 ? l10n.t('Clear') : l10n.t('Remove')}>
          <VSCodeButton
            appearance="icon"
            disabled={disabled}
            data-testid="remove-item"
            onClick={handleClick}
            aria-label={length === 1 ? 'Clear Item' : 'Remove Item'}
            className={cx('ml-3', anchorClassName)}
          >
            <VscTrash />
          </VSCodeButton>
        </Tooltip>
      )}
      {(index === length - 1) && (
        <Tooltip content={l10n.t('Add')}>
          <VSCodeButton
            appearance="icon"
            disabled={disabled || addItemIsDisabled}
            data-testid={dataTestId || 'add-new-item'}
            onClick={addItem}
            aria-label="Add new item"
            className={cx('ml-3', anchorClassName)}
          >
            <VscDiffAdded />
          </VSCodeButton>
        </Tooltip>
      )}
    </div>
  )
}

export { AddItemsActions }
