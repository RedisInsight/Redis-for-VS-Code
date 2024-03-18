import React, { FC, useEffect, useState } from 'react'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import cx from 'classnames'
import Popup from 'reactjs-popup'
import * as l10n from '@vscode/l10n'
import { PopupPosition } from 'reactjs-popup/dist/types'

import { VscRefresh } from 'react-icons/vsc'

import { Nullable } from 'uiSrc/interfaces'
import {
  DURATION_FIRST_REFRESH_TIME,
  NOW,
  TIMEOUT_TO_UPDATE_REFRESH_TIME,
  getLastRefreshDelta,
  getTextByRefreshTime,
} from './utils'

export interface Props {
  disabled?: boolean
  onClick: () => void
  position?: PopupPosition
  lastRefreshTime: Nullable<number>
  triggerTestid?: string
  triggerClassName?: string
}

export const RefreshBtn: FC<Props> = (props) => {
  const {
    disabled,
    lastRefreshTime,
    onClick,
    position = 'left center',
    triggerClassName = '',
    triggerTestid = 'refresh-btn',
  } = props
  let intervalText: NodeJS.Timeout

  const [refreshMessage, setRefreshMessage] = useState(NOW)

  useEffect(() => {
    const delta = getLastRefreshDelta(lastRefreshTime)
    updateLastRefresh()

    intervalText = setInterval(() => {
      if (document.hidden) return

      updateLastRefresh()
    }, delta < DURATION_FIRST_REFRESH_TIME ? DURATION_FIRST_REFRESH_TIME : TIMEOUT_TO_UPDATE_REFRESH_TIME)
    return () => clearInterval(intervalText)
  }, [lastRefreshTime])

  const updateLastRefresh = () => {
    const delta = getLastRefreshDelta(lastRefreshTime)
    const text = getTextByRefreshTime(delta, lastRefreshTime ?? 0)

    lastRefreshTime && setRefreshMessage(text)
  }

  const handleRefreshClick = () => {
    updateLastRefresh()
    onClick?.()
  }

  return (
    <Popup
      keepTooltipInside
      on="hover"
      position={position}
      onOpen={updateLastRefresh}
      trigger={(
        <VSCodeButton
          appearance="icon"
          disabled={disabled}
          className={cx(triggerClassName)}
          onClick={handleRefreshClick}
          aria-label="refresh button"
          data-testid={triggerTestid}
        >
          <VscRefresh />
        </VSCodeButton>
      )}
    >
      <div className="font-bold pb-1">{l10n.t('Last Refresh')}</div>
      {refreshMessage}
    </Popup>
  )
}
