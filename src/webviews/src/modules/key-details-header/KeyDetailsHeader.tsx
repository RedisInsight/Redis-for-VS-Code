import React, { ReactElement } from 'react'
import { isUndefined } from 'lodash'
import AutoSizer from 'react-virtualized-auto-sizer'
import { VscDebugRestart } from 'react-icons/vsc'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { useShallow } from 'zustand/react/shallow'
import * as l10n from '@vscode/l10n'

// import { AutoRefresh } from 'uiSrc/components'
import {
  AllKeyTypes,
  KeyTypes,
} from 'uiSrc/constants'
import { RedisString } from 'uiSrc/interfaces'
import { editKeyTTL, refreshKeyInfo, useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { TelemetryEvent, formatLongName, getGroupTypeDisplay, sendEventTelemetry } from 'uiSrc/utils'
// import { KeyDetailsHeaderFormatter } from './components/key-details-header-formatter'
import { PopoverDelete } from 'uiSrc/components'
import { KeyDetailsHeaderName } from './components/key-details-header-name'
import { KeyDetailsHeaderTTL } from './components/key-details-header-ttl'
// import { KeyDetailsHeaderDelete } from './components/key-details-header-delete'
import { KeyDetailsHeaderSizeLength } from './components/key-details-header-size-length'

import { useKeysApi } from '../keys-tree/hooks/useKeys'
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
  const { data, refreshDisabled } = useSelectedKeyStore(useShallow((state) => ({
    data: state.data,
    refreshDisabled: state.refreshDisabled || state.loading,
  })))

  const { type = KeyTypes.String, name: keyBuffer, nameString: keyProp, length } = data ?? {}
  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)

  const keysApi = useKeysApi()

  const handleRefreshKey = () => {
    refreshKeyInfo(keyBuffer!)
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
    keysApi.deleteKeyAction(key, onRemoveKey)
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
                    disabled={refreshDisabled}
                    className={styles.actionBtn}
                    onClick={handleRefreshKey}
                    aria-label="refresh key"
                      // title={tooltipContent}
                    data-testid="refresh-key-btn"
                  >
                    <VscDebugRestart />
                  </VSCodeButton>
                  {!isUndefined(Actions) && <Actions width={width} />}
                  <PopoverDelete
                    item={keyProp!}
                    itemRaw={keyBuffer}
                    testid={`remove-key-${keyProp}`}
                    header={`${formatLongName(keyProp, 150)}`}
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
                    */}
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
