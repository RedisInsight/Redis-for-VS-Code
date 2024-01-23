import React, { useEffect, useRef } from 'react'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscTrash } from 'react-icons/vsc'
import Popup from 'reactjs-popup'
import * as l10n from '@vscode/l10n'
import cx from 'classnames'
import { PopupActions, PopupPosition } from 'reactjs-popup/dist/types'

import { RedisString } from 'uiSrc/interfaces'
import styles from './styles.module.scss'

export interface Props {
  header?: JSX.Element | string
  text: JSX.Element | string
  item: string
  itemRaw?: RedisString
  suffix?: string
  deleting?: string
  approveTextBtn?: string
  triggerClassName?: string
  position?: PopupPosition
  closePopover?: () => void
  showPopover?: (item: string) => void
  updateLoading?: boolean
  handleDeleteItem?: (item: RedisString) => void
  handleButtonClick?: () => void
  appendInfo?: JSX.Element | string | null
  testid?: string
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
    updateLoading,
    showPopover,
    handleDeleteItem,
    handleButtonClick,
    appendInfo,
    triggerClassName = '',
    approveTextBtn = l10n.t('Remove'),
    testid = '',
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
      closeOnEscape
      closeOnDocumentClick
      repositionOnResize
      position={position}
      onClose={() => closePopover?.()}
      onOpen={() => {
        showPopover?.(item)
        handleButtonClick?.()
      }}
      trigger={(open) => (
        <VSCodeButton
          appearance="icon"
          disabled={updateLoading}
          className={cx(styles.trigger, triggerClassName, { '!block': open })}
          aria-label="remove item"
          data-testid={testid ? `${testid}-icon` : 'remove-icon'}
        >
          <VscTrash />
        </VSCodeButton>
      )}
    >
      <div className={styles.popover}>
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
            onClick={() => handleDeleteItem?.(itemRaw || item)}
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
