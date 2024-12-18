import React, { useEffect, useState } from 'react'
import * as l10n from '@vscode/l10n'
import Popover from 'reactjs-popup'
import cx from 'classnames'
import { VscChevronDown, VscRefresh } from 'react-icons/vsc'

import {
  MIN_REFRESH_RATE,
  StorageItem,
} from 'uiSrc/constants'
import {
  errorValidateRefreshRateNumber,
  validateRefreshRateNumber,
} from 'uiSrc/utils'
import { InlineEditor } from 'uiSrc/components'
import { localStorageService } from 'uiSrc/services'
import { Nullable } from 'uiSrc/interfaces'
import { Checkbox, RiButton, Tooltip } from 'uiSrc/ui'
import {
  getTextByRefreshTime,
  DEFAULT_REFRESH_RATE,
  DURATION_FIRST_REFRESH_TIME,
  MINUTE,
  NOW,
} from './utils'

import styles from './styles.module.scss'

export interface Props {
  postfix: string
  loading: boolean
  displayText?: boolean
  lastRefreshTime: Nullable<number>
  testid?: string
  containerClassName?: string
  turnOffAutoRefresh?: boolean
  onRefresh: (enableAutoRefresh: boolean) => void
  onRefreshClicked?: () => void
  onEnableAutoRefresh?: (enableAutoRefresh: boolean, refreshRate: string) => void
  onChangeAutoRefreshRate?: (enableAutoRefresh: boolean, refreshRate: string) => void
  disabled?: boolean
  enableAutoRefreshDefault?: boolean
}

const TIMEOUT_TO_UPDATE_REFRESH_TIME = 1_000 * MINUTE // once a minute

const AutoRefresh = React.memo(({
  postfix,
  loading,
  displayText = true,
  lastRefreshTime,
  containerClassName = '',
  testid = '',
  turnOffAutoRefresh,
  onRefresh,
  onRefreshClicked,
  onEnableAutoRefresh,
  onChangeAutoRefreshRate,
  disabled,
  enableAutoRefreshDefault = false,
}: Props) => {
  let intervalText: NodeJS.Timeout
  let intervalRefresh: NodeJS.Timeout

  const [refreshMessage, setRefreshMessage] = useState(NOW)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [refreshRate, setRefreshRate] = useState<string>('')
  const [refreshRateMessage, setRefreshRateMessage] = useState<string>('')
  const [enableAutoRefresh, setEnableAutoRefresh] = useState(enableAutoRefreshDefault)

  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen) => !isPopoverOpen)
  const closePopover = () => {
    setEnableAutoRefresh(enableAutoRefresh)
    setIsPopoverOpen(false)
  }

  useEffect(() => {
    const refreshRateStorage = localStorageService.get(StorageItem.autoRefreshRate + postfix)
      || DEFAULT_REFRESH_RATE

    setRefreshRate(refreshRateStorage)
  }, [postfix])

  useEffect(() => {
    if (turnOffAutoRefresh && enableAutoRefresh) {
      setEnableAutoRefresh(false)
      clearInterval(intervalRefresh)
    }
  }, [turnOffAutoRefresh])

  // update refresh label text
  useEffect(() => {
    const delta = getLastRefreshDelta(lastRefreshTime)
    updateLastRefresh()

    intervalText = setInterval(() => {
      if (document.hidden) return

      updateLastRefresh()
    }, delta < DURATION_FIRST_REFRESH_TIME ? DURATION_FIRST_REFRESH_TIME : TIMEOUT_TO_UPDATE_REFRESH_TIME)
    return () => clearInterval(intervalText)
  }, [lastRefreshTime])

  // refresh interval
  useEffect(() => {
    updateLastRefresh()

    if (enableAutoRefresh && !loading && !disabled) {
      intervalRefresh = setInterval(() => {
        if (document.hidden) return

        handleRefresh()
      }, +refreshRate * 1_000)
    } else {
      clearInterval(intervalRefresh)
    }

    if (enableAutoRefresh) {
      updateAutoRefreshText(refreshRate)
    }

    return () => clearInterval(intervalRefresh)
  }, [enableAutoRefresh, refreshRate, loading, disabled, lastRefreshTime])

  const getLastRefreshDelta = (time:Nullable<number>) => (Date.now() - (time || 0)) / 1_000

  const getDataTestid = (suffix: string) => (testid ? `${testid}-${suffix}` : suffix)

  const updateLastRefresh = () => {
    const delta = getLastRefreshDelta(lastRefreshTime)
    const text = getTextByRefreshTime(delta, lastRefreshTime ?? 0)

    lastRefreshTime && setRefreshMessage(text)
  }

  const updateAutoRefreshText = (refreshRate: string) => {
    enableAutoRefresh && setRefreshRateMessage(
      // more than 1 minute
      +refreshRate > MINUTE ? `${Math.floor(+refreshRate / MINUTE)} min` : `${refreshRate} s`,
    )
  }

  const handleApplyAutoRefreshRate = (initValue: string) => {
    const value = +initValue >= MIN_REFRESH_RATE ? initValue : `${MIN_REFRESH_RATE}`
    setRefreshRate(value)
    localStorageService.set(StorageItem.autoRefreshRate + postfix, value)
    onChangeAutoRefreshRate?.(enableAutoRefresh, value)
  }

  const handleRefresh = () => {
    onRefresh(enableAutoRefresh)
  }

  const handleRefreshClick = () => {
    handleRefresh()
    onRefreshClicked?.()
  }

  const onChangeEnableAutoRefresh = (value: boolean) => {
    setEnableAutoRefresh(value)

    onEnableAutoRefresh?.(value, refreshRate)
  }

  return (
    <div className={cx(
      styles.container,
      containerClassName,
      {
        [styles.enable]: !disabled && enableAutoRefresh,
        'opacity-70': disabled,
      },
    )}>
      <span className={styles.summary}>
        {displayText && (
          <span data-testid={getDataTestid('refresh-message-label')}>{enableAutoRefresh ? l10n.t('Auto refresh:') : l10n.t('Last refresh:')}</span>
        )}
        {displayText && (<span className={cx('refresh-message-time', styles.time, { [styles.disabled]: disabled })} data-testid={getDataTestid('refresh-message')}>
          {` ${enableAutoRefresh ? refreshRateMessage : refreshMessage}`}
        </span>)}
      </span>

      <Tooltip
        title={l10n.t('Last Refresh')}
        position="bottom center"
        className={styles.tooltip}
        content={refreshMessage}
      >
        <RiButton
          disabled={loading || disabled}
          onClick={handleRefreshClick}
          onMouseEnter={updateLastRefresh}
          className={cx('auto-refresh-btn', styles.btn, { [styles.rolling]: !disabled && enableAutoRefresh })}
          aria-labelledby={getDataTestid('refresh-btn')?.replaceAll?.('-', ' ')}
          data-testid={getDataTestid('refresh-btn')}
        >
          <VscRefresh />
        </RiButton>
      </Tooltip>

      <Popover
        closeOnEscape
        closeOnDocumentClick
        repositionOnResize
        keepTooltipInside={false}
        open={isPopoverOpen}
        position="bottom right"
        className="popover-auto-refresh"
        onClose={closePopover}
        trigger={(
          <RiButton
            disabled={disabled}
            aria-label="Auto-refresh config popover"
            className={cx(styles.anchorBtn, styles.anchorWrapper, { [styles.anchorBtnOpen]: isPopoverOpen })}
            onClick={onButtonClick}
            data-testid={getDataTestid('auto-refresh-config-btn')}
        >
            <VscChevronDown />
          </RiButton>
        )}
      >
        <div className={styles.switch}>
          <Checkbox
            checked={enableAutoRefresh}
            onChange={(e) => onChangeEnableAutoRefresh(e.target.checked)}
            data-testid={getDataTestid('auto-refresh-switch')}
            className={styles.switchOption}
            labelText={l10n.t('Auto Refresh')}
          />
        </div>
        <div className={styles.inputContainer}>
          <div className={styles.inputLabel}>Refresh rate:</div>
          <div className={styles.input} data-testid={getDataTestid('auto-refresh-rate-input')}>
            <InlineEditor
              initialValue={refreshRate}
              fieldName="refreshRate"
              placeholder={DEFAULT_REFRESH_RATE}
              loading={loading}
              validation={validateRefreshRateNumber}
              disableByValidation={errorValidateRefreshRateNumber}
              onApply={(value) => handleApplyAutoRefreshRate(value)}
            />
          </div>
        </div>
      </Popover>
    </div>
  )
})

export { AutoRefresh }
