import React, { ReactElement } from 'react'
import { isUndefined } from 'lodash'
import { useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'
import { VscClose, VscDebugRestart } from 'react-icons/vsc'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { useShallow } from 'zustand/react/shallow'
import * as l10n from '@vscode/l10n'

// import { AutoRefresh } from 'uiSrc/components'
import {
  AllKeyTypes,
  KeyTypes,
} from 'uiSrc/constants'
import { RedisString } from 'uiSrc/interfaces'
import { editKeyTTL, refreshKeyInfo, useSelectedKeyStore } from 'uiSrc/store'
import { TelemetryEvent, bufferToString, formatLongName, getGroupTypeDisplay, sendEventTelemetry } from 'uiSrc/utils'
import { connectedDatabaseSelector } from 'uiSrc/slices/connections/databases/databases.slice'
// import { KeyDetailsHeaderFormatter } from './components/key-details-header-formatter'
import { PopoverDelete } from 'uiSrc/components'
import { KeyDetailsHeaderName } from './components/key-details-header-name'
import { KeyDetailsHeaderTTL } from './components/key-details-header-ttl'
// import { KeyDetailsHeaderDelete } from './components/key-details-header-delete'
import { KeyDetailsHeaderSizeLength } from './components/key-details-header-size-length'
import { KeyRowType } from '../keys-tree/components/key-row-type'
import { deleteKeyAction } from '../keys-tree/hooks/useKeys'

import styles from './styles.module.scss'

export interface KeyDetailsHeaderProps {
  keyType: AllKeyTypes
  onCloseKey?: (key?: RedisString) => void
  onRemoveKey?: () => void
  onEditKey?: (key: RedisString, newKey: RedisString, onFailure?: () => void) => void
  Actions?: (props: { width: number }) => ReactElement
}

const KeyDetailsHeader = ({
  onCloseKey,
  onRemoveKey,
  onEditKey,
  keyType,
  Actions,
}: KeyDetailsHeaderProps) => {
  const { loading, data } = useSelectedKeyStore(useShallow((state) => ({
    loading: state.loading,
    data: state.data,
  })))

  const { type = KeyTypes.String, name: keyBuffer, nameString: keyProp, length } = data ?? {}
  const { id: databaseId } = useSelector(connectedDatabaseSelector)

  const handleRefreshKey = () => {
    refreshKeyInfo(keyBuffer!)
    // dispatch(refreshKey(keyBuffer!, type))
  }

  const handleEditTTL = (key: RedisString, ttl: number) => {
    editKeyTTL(key, ttl, onEditKeyTTLSuccess)
  }

  const onEditKeyTTLSuccess = (ttl: number, prevTTL?: number) => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_TTL_CHANGED,
      eventData: {
        databaseId,
        ttl: ttl >= 0 ? ttl : -1,
        previousTTL: prevTTL,
      },
    })
  }
  const handleEditKey = (oldKey: RedisString, newKey: RedisString, onFailure?: () => void) => {
    // dispatch(editKey(oldKey, newKey, () => onEditKey(oldKey, newKey), onFailure))
  }

  const handleDeleteKey = (key: RedisString) => {
    deleteKeyAction(key, onRemoveKey)
  }

  const handleDeleteKeyClicked = () => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_DELETE_CLICKED,
      eventData: {
        databaseId,
        keyType: type,
        source: 'keyValue',
      },
    })
  }

  const handleEnableAutoRefresh = (enableAutoRefresh: boolean, refreshRate: string) => {
    const treeViewEvent = enableAutoRefresh
      ? TelemetryEvent.TREE_VIEW_KEY_DETAILS_AUTO_REFRESH_ENABLED
      : TelemetryEvent.TREE_VIEW_KEY_DETAILS_AUTO_REFRESH_DISABLED
    sendEventTelemetry({
      event: treeViewEvent,
      eventData: {
        length,
        databaseId,
        keyType: type,
        refreshRate: +refreshRate,
      },
    })
  }

  const handleChangeAutoRefreshRate = (enableAutoRefresh: boolean, refreshRate: string) => {
    if (enableAutoRefresh) {
      handleEnableAutoRefresh(enableAutoRefresh, refreshRate)
    }
  }

  return (
    <div className={`key-details-header ${styles.container}`} data-testid="key-details-header">
      {/* {loading && (
        <div>
          {l10n.t('loading...')}
        </div>
      )} */}
      {/* {!loading && ( */}
      <AutoSizer disableHeight>
        {({ width = 0 }) => (
          <div style={{ width }}>
            <div className={styles.keyFlexGroup}>
              <div>
                {getGroupTypeDisplay(type)}
              </div>
              <KeyDetailsHeaderName onEditKey={handleEditKey} />
              {/* <div className={styles.closeBtnContainer} title="Close">
                  <VSCodeButton
                    aria-label="Close key"
                    className={styles.closeBtn}
                    onClick={() => onCloseKey(keyProp)}
                  >
                    <VscClose
                        // className={cx(styles.nodeIcon, styles.nodeIconArrow)}
                      data-testid="close-key-btn"
                    />
                  </VSCodeButton>
                </div> */}
            </div>
            <div className={styles.groupSecondLine}>
              <KeyDetailsHeaderSizeLength width={width} />
              <KeyDetailsHeaderTTL onEditTTL={handleEditTTL} />
              <div className="flex ml-auto">
                <div className={styles.subtitleActionBtns}>
                  <VSCodeButton
                    appearance="icon"
                    disabled={loading}
                    className={styles.actionBtn}
                    onClick={handleRefreshKey}
                    aria-label="refresh key"
                      // title={tooltipContent}
                    data-testid="refresh-key-btn"
                  >
                    <VscDebugRestart />
                  </VSCodeButton>
                  <PopoverDelete
                    item={keyProp!}
                    itemRaw={keyBuffer}
                    testid={`remove-key-${keyProp}`}
                    header={`${formatLongName(keyProp)}`}
                    text={`${l10n.t(' will be deleted.')}`}
                    approveTextBtn={l10n.t('Delete')}
                    triggerClassName="group-hover:block"
                    handleDeleteItem={handleDeleteKey}
                    handleButtonClick={handleDeleteKeyClicked}
                  />
                  {/* <AutoRefresh
                      postfix={type}
                      loading={loading}
                      lastRefreshTime={lastRefreshTime}
                      displayText={width > HIDE_LAST_REFRESH}
                      containerClassName={styles.actionBtn}
                      onRefresh={handleRefreshKey}
                      onEnableAutoRefresh={handleEnableAutoRefresh}
                      onChangeAutoRefreshRate={handleChangeAutoRefreshRate}
                      testid="refresh-key-btn"
                    /> */}
                  {/* {Object.values(KeyTypes).includes(keyType as KeyTypes) && (
                      <KeyDetailsHeaderFormatter width={width} />
                    )}
                    {!isUndefined(Actions) && <Actions width={width} />}
                    <KeyDetailsHeaderDelete onDelete={handleDeleteKey} /> */}
                </div>
              </div>
            </div>
          </div>
        )}
      </AutoSizer>
      {/* )} */}
    </div>
  )
}

export { KeyDetailsHeader }
