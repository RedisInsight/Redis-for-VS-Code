import React, { useEffect, useRef } from 'react'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscTrash } from 'react-icons/vsc'
import Popup from 'reactjs-popup'
import * as l10n from '@vscode/l10n'
import cx from 'classnames'
import { PopupActions, PopupPosition } from 'reactjs-popup/dist/types'

import { RedisString } from 'uiSrc/interfaces'
import { DEFAULT_POPOVER_MAX_WIDTH } from 'uiSrc/constants'
import { RiButton } from 'uiSrc/ui'
import styles from './styles.module.scss'

export interface Props {
  header?: JSX.Element | string
  text: JSX.Element | string
  item?: string
  itemRaw?: RedisString
  suffix?: string
  deleting?: string
  approveTextBtn?: string
  triggerClassName?: string
  position?: PopupPosition
  closePopover?: () => void
  showPopover?: (item: string) => void
  disabled?: boolean
  handleDeleteItem?: (item: RedisString) => void
  handleButtonClick?: () => void
  appendInfo?: JSX.Element | string | null
  maxWidth?: number
  testid?: string
  triggerText?: string
}

const PopoverDelete = (props: Props) => {
  const {
    header,
    text,
    item,
    itemRaw,
    suffix = '',
    deleting = '',
    position = 'left center',
    closePopover,
    disabled,
    showPopover,
    handleDeleteItem,
    handleButtonClick,
    appendInfo,
    triggerClassName = '',
    approveTextBtn = l10n.t('Remove'),
    testid = '',
    maxWidth = DEFAULT_POPOVER_MAX_WIDTH,
    triggerText,
  } = props

  const ref = useRef<PopupActions>(null)

  useEffect(() => {
    if (item + suffix !== deleting) {
      ref.current?.close?.()
    }
  }, [deleting])

  return (
    <Popup
      key={item}
      ref={ref}
      nested={false}
      closeOnEscape
      closeOnDocumentClick
      repositionOnResize
      keepTooltipInside={false}
      position={position}
      onClose={() => closePopover?.()}
      onOpen={() => {
        showPopover?.(item!)
        handleButtonClick?.()
      }}
      trigger={(open) => (
        <RiButton
          disabled={disabled}
          className={cx(styles.trigger, triggerClassName, { '!flex': open })}
          aria-label="remove item"
          data-testid={testid ? `${testid}-trigger` : 'remove-trigger'}
        >
          {triggerText || <VscTrash />}
        </RiButton>
      )}
    >
      <div
        className={styles.popover}
        style={{ maxWidth: maxWidth < DEFAULT_POPOVER_MAX_WIDTH ? maxWidth : DEFAULT_POPOVER_MAX_WIDTH }}
      >
        <span>
          {!!header && (
          <h4>
            <b>{header}</b>
          </h4>
          )}
          <span>
            {text}
          </span>
          {appendInfo}
        </span>
        <div className={styles.popoverFooter}>
          <VSCodeButton
            className="bg-error focus:bg-error"
            onClick={() => handleDeleteItem?.((itemRaw || item)!)}
            data-testid={testid || 'remove'}
          >
            {approveTextBtn}
          </VSCodeButton>
        </div>
      </div>
    </Popup>
  )
}

export { PopoverDelete }
