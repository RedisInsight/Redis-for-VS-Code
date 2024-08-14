import React, { PropsWithChildren, useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import * as l10n from '@vscode/l10n'

import {
  KeyTypes,
  STRING_MAX_LENGTH,
  TEXT_DISABLED_COMPRESSED_VALUE,
  TEXT_DISABLED_FORMATTER_EDITING,
  TEXT_DISABLED_STRING_EDITING,
} from 'uiSrc/constants'

import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/modules'
import { TelemetryEvent, isFormatEditable, isFullStringLoaded, sendEventTelemetry } from 'uiSrc/utils'
import { IFetchKeyArgs, RedisString } from 'uiSrc/interfaces'
import { useContextInContext, useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { StringDetailsValue } from './string-details-value'
import { fetchString, useStringStore } from './hooks/useStringStore'
import { EditItemAction } from '../key-details-actions'

export interface Props extends KeyDetailsHeaderProps {}

const StringDetails = (props: Props) => {
  const { onRemoveKey } = props
  const keyType = KeyTypes.String

  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)

  const { keyValue, isStringCompressed, resetStringStore } = useStringStore(useShallow((state) => ({
    keyValue: state.data.value,
    isStringCompressed: state.isCompressed,
    resetStringStore: state.resetStringStore,
  })))

  const { loading, length, setRefreshDisabled } = useSelectedKeyStore(useShallow((state) => ({
    loading: state.loading,
    length: state.data?.length,
    setRefreshDisabled: state.setSelectedKeyRefreshDisabled,
  })))

  const viewFormat = useContextInContext((state) => state.browser.viewFormat)

  const isEditable = !isStringCompressed && isFormatEditable(viewFormat)
  const isStringEditable = isFullStringLoaded(keyValue?.data?.length, length)
  const noEditableText = isStringCompressed ? TEXT_DISABLED_COMPRESSED_VALUE : TEXT_DISABLED_FORMATTER_EDITING
  const editToolTip = !isEditable
    ? noEditableText
    : (!isStringEditable ? TEXT_DISABLED_STRING_EDITING : l10n.t('Edit value'))

  const [editItem, setEditItem] = useState<boolean>(false)

  useEffect(() => {
    setEditItem(false)
  }, [viewFormat])

  const handleRefreshKey = (key?: RedisString, args?: IFetchKeyArgs) => {
    fetchString(key, { end: args?.end || STRING_MAX_LENGTH })
  }

  const handleRemoveKey = () => {
    resetStringStore()
    onRemoveKey?.()
  }

  const handleUpdated = () => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_EDITED,
      eventData: {
        databaseId,
        keyType: KeyTypes.String,
      },
    })
  }

  const handleDownloaded = () => {
    sendEventTelemetry({
      event: TelemetryEvent.STRING_DOWNLOAD_VALUE_CLICKED,
      eventData: {
        databaseId,
        length,
      },
    })
  }

  const handleLoadAll = () => {
    sendEventTelemetry({
      event: TelemetryEvent.STRING_LOAD_ALL_CLICKED,
      eventData: {
        databaseId,
        length,
      },
    })
  }

  const Actions = ({ children }: PropsWithChildren) => ([
    children,
    <EditItemAction
      title={editToolTip}
      isEditable={isStringEditable && isEditable}
      onEditItem={() => {
        setRefreshDisabled(!editItem)
        setEditItem(!editItem)
      }}
    />,
  ])

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader
        {...props}
        key="key-details-header"
        keyType={keyType}
        onRemoveKey={handleRemoveKey}
        Actions={Actions}
      />
      <div className="key-details-body" key="key-details-body">
        {!loading && (
          <div className="flex flex-col h-full">
            <StringDetailsValue
              isEditItem={editItem}
              setIsEdit={(isEdit: boolean) => {
                setEditItem(isEdit)
                setRefreshDisabled(isEdit)
              }}
              onRefresh={handleRefreshKey}
              onUpdated={handleUpdated}
              onDownloaded={handleDownloaded}
              onLoadAll={handleLoadAll}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export { StringDetails }
