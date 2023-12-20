import React, { useEffect, useRef } from 'react'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscTrash } from 'react-icons/vsc'
import Popup from 'reactjs-popup'
import { PopupActions } from 'reactjs-popup/dist/types'

import { RedisString } from 'uiSrc/interfaces'
import styles from './styles.module.scss'

export interface Props {
  header?: JSX.Element | string
  text: JSX.Element | string
  item: string
  itemRaw?: RedisString
  suffix: string
  deleting: string
  closePopover: () => void
  showPopover: (item: string) => void
  updateLoading: boolean
  handleDeleteItem: (item: RedisString | string) => void
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
    suffix,
    deleting,
    closePopover,
    updateLoading,
    showPopover,
    handleDeleteItem,
    handleButtonClick,
    appendInfo,
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
      position="left center"
      onClose={() => closePopover()}
      onOpen={() => {
        showPopover?.(item)
        handleButtonClick?.()
      }}
      trigger={(
        <VSCodeButton
          appearance="icon"
          disabled={updateLoading}
          aria-label="remove field"
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
            onClick={() => handleDeleteItem(itemRaw || item)}
            data-testid={testid || 'remove'}
          >
            Remove
          </VSCodeButton>
        </div>
      </div>
    </Popup>
  )
}

export { PopoverDelete }
