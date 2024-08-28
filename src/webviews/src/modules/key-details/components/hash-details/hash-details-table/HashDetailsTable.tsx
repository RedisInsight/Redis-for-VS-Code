import cx from 'classnames'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { CellMeasurerCache, Table } from 'react-virtualized'
import { useShallow } from 'zustand/react/shallow'
import * as l10n from '@vscode/l10n'
import { isNumber, isString, toNumber } from 'lodash'

import { PopoverDelete, VirtualTable } from 'uiSrc/components'
import {
  getColumnWidth,
  getMatchType,
  sendEventTelemetry,
  TelemetryEvent,
  bufferToString,
  createDeleteFieldHeader,
  createDeleteFieldMessage,
  formattingBuffer,
  isEqualBuffers,
  isFormatEditable,
  isNonUnicodeFormatter,
  stringToSerializedBufferFormat,
  stringToBuffer,
  validateTTLNumber,
  truncateNumberToDuration,
  decompressingBuffer,
} from 'uiSrc/utils'
import { StopPropagation } from 'uiSrc/components/virtual-table'
import {
  IColumnSearchState,
  ITableColumn,
  RelativeWidthSizes,
} from 'uiSrc/components/virtual-table/interfaces'
import {
  KeyTypes,
  OVER_RENDER_BUFFER_COUNT,
  TableCellAlignment,
  TEXT_DISABLED_FORMATTER_EDITING,
  TEXT_UNPRINTABLE_CHARACTERS,
  SCAN_COUNT_DEFAULT,
  helpTexts,
  NoResultsFoundText,
  DEFAULT_SEARCH_MATCH,
  TEXT_INVALID_VALUE,
} from 'uiSrc/constants'
import { Nullable, RedisString } from 'uiSrc/interfaces'
import { useContextApi, useContextInContext, useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { Tooltip } from 'uiSrc/ui'
import { EditableInput, EditableTextArea } from 'uiSrc/modules/key-details/shared'
import { AddFieldsToHashDto, GetHashFieldsResponse, HashField } from '../hooks/interface'

import {
  deleteHashFields,
  fetchHashFields,
  fetchHashMoreFields,
  updateHashFieldsAction,
  updateHashTTLAction,
  useHashStore,
} from '../hooks/useHashStore'

const suffix = '_hash'
const headerHeight = 60
const rowHeight = 43

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: rowHeight,
})

interface IHashField extends HashField {}

export interface Props {
  isExpireFieldsAvailable?: boolean
  isFooterOpen?: boolean
  onRemoveKey?: () => void
}

const HashDetailsTable = (props: Props) => {
  const { isExpireFieldsAvailable, onRemoveKey } = props

  const { databaseId, compressor } = useDatabasesStore((state) => ({
    databaseId: state.connectedDatabase?.id,
    compressor: state.connectedDatabase?.compressor ?? null,
  }))

  const viewFormatProp = useContextInContext((state) => state.browser.viewFormat)

  const { length, key, lastRefreshTime, setRefreshDisabled } = useSelectedKeyStore(useShallow((state) => ({
    length: state.data?.length,
    key: state.data?.name,
    lastRefreshTime: state.lastRefreshTime,
    setRefreshDisabled: state.setSelectedKeyRefreshDisabled,
  })))

  const { nextCursor, loading, loadedFields, updateLoading, total } = useHashStore((state) => ({
    loading: state.loading,
    nextCursor: state.data.nextCursor,
    total: state.data.total,
    loadedFields: state.data?.fields || [],
    updateLoading: state.updateValue.loading,
  }))

  const { [KeyTypes.Hash]: hashSizes } = useContextInContext((state) => state.browser.keyDetailsSizes)

  const [match, setMatch] = useState<Nullable<string>>(DEFAULT_SEARCH_MATCH)
  const [deleting, setDeleting] = useState('')
  const [fields, setFields] = useState<IHashField[]>([])
  const [editingIndex, setEditingIndex] = useState<Nullable<{ index: number, field: string }>>(null)
  const [width, setWidth] = useState(100)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [viewFormat, setViewFormat] = useState(viewFormatProp)

  const formattedLastIndexRef = useRef(OVER_RENDER_BUFFER_COUNT)
  const tableRef: React.MutableRefObject<Nullable<Table>> = useRef(null)

  const contextApi = useContextApi()

  useEffect(() => {
    resetStates()
  }, [lastRefreshTime])

  useEffect(() => {
    setFields(loadedFields)

    if (loadedFields?.length < fields.length) {
      formattedLastIndexRef.current = 0
    }

    if (viewFormat !== viewFormatProp) {
      resetStates()
    }
  }, [loadedFields, viewFormatProp])

  const resetStates = () => {
    setExpandedRows([])
    setViewFormat(viewFormatProp)
    setEditingIndex(null)
    setRefreshDisabled(false)

    clearCache()
  }

  const clearCache = (rowIndex?: number) => {
    if (isNumber(rowIndex)) {
      cellCache.clear(rowIndex, 1)
      tableRef.current?.recomputeRowHeights(rowIndex)
      return
    }

    cellCache.clearAll()
  }

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((field = '') => {
    setDeleting(`${field + suffix}`)
  }, [])

  const onSuccessRemoved = (newTotalValue: number) => {
    newTotalValue === 0 && onRemoveKey?.()
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVED,
      eventData: {
        databaseId,
        keyType: KeyTypes.Hash,
        numberOfRemoved: 1,
      },
    })
  }

  const handleDeleteField = (field: RedisString = '') => {
    deleteHashFields(key, [field], onSuccessRemoved)
    closePopover()
  }

  const handleEditField = useCallback((
    index: number,
    editing: boolean,
    field: string,
  ) => {
    setEditingIndex(editing ? { index, field } : null)
    setRefreshDisabled(editing)

    clearCache(index)
  }, [viewFormat])

  const handleApplyEditField = (field: RedisString = '', value: string, rowIndex: number) => {
    const data: AddFieldsToHashDto = {
      keyName: key!,
      fields: [{ field, value: stringToSerializedBufferFormat(viewFormat, value) }],
    }
    updateHashFieldsAction(data, false, () => onHashEditedSuccess(rowIndex))
  }

  const handleApplyEditExpire = (field: RedisString = '', expire: string, rowIndex: number) => {
    const data: AddFieldsToHashDto = {
      keyName: key!,
      fields: [{ field, expire: expire ? toNumber(expire) : -1 }],
    }

    updateHashTTLAction(data, false, (keyRemoved: boolean) => {
      keyRemoved && onRemoveKey?.()
      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_FIELD_TTL_EDITED,
        eventData: {
          databaseId,
        },
      })
      handleEditField(rowIndex, false, 'ttl')
    })
  }

  const onHashEditedSuccess = (rowIndex: number) => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_EDITED,
      eventData: {
        databaseId,
        keyType: KeyTypes.Hash,
      },
    })
    handleEditField(rowIndex, false, 'value')
  }

  const handleRemoveIconClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVE_CLICKED,
      eventData: {
        databaseId,
        keyType: KeyTypes.Hash,
      },
    })
  }

  const handleSearch = (search: IColumnSearchState[]) => {
    const fieldColumn = search.find((column) => column.id === 'field')
    if (fieldColumn) {
      const { value: match } = fieldColumn
      const onSuccess = (data: GetHashFieldsResponse) => {
        resetExpandedCache()
        const matchValue = getMatchType(match)
        sendEventTelemetry({
          event: TelemetryEvent.TREE_VIEW_KEY_VALUE_FILTERED,
          eventData: {
            databaseId,
            keyType: KeyTypes.Hash,
            match: matchValue,
            length: data.total,
          },
        })
      }
      setMatch(match)
      fetchHashFields(key!, 0, SCAN_COUNT_DEFAULT, match || DEFAULT_SEARCH_MATCH, onSuccess)
    }
  }

  const resetExpandedCache = () => {
    setTimeout(() => {
      setExpandedRows([])
      clearCache()
    }, 0)
  }

  const handleRowToggleViewClick = (expanded: boolean, rowIndex: number) => {
    const treeViewEvent = expanded
      ? TelemetryEvent.TREE_VIEW_KEY_FIELD_VALUE_EXPANDED
      : TelemetryEvent.TREE_VIEW_KEY_FIELD_VALUE_COLLAPSED

    sendEventTelemetry({
      event: treeViewEvent,
      eventData: {
        keyType: KeyTypes.Hash,
        databaseId,
        largestCellLength: Math.max(...Object.values(fields[rowIndex]).map((a) => a.toString().length)) || 0,
      },
    })

    cellCache.clearAll()
  }

  const loadMoreItems = () => {
    if (nextCursor !== 0) {
      fetchHashMoreFields(
        key as RedisString,
        nextCursor,
        SCAN_COUNT_DEFAULT,
        match || DEFAULT_SEARCH_MATCH,
      )
    }
  }

  const onColResizeEnd = (sizes: RelativeWidthSizes) => {
    contextApi.updateKeyDetailsSizes({
      type: KeyTypes.Hash,
      sizes,
    })
  }

  const columns: ITableColumn[] = [
    {
      id: 'field',
      label: l10n.t('Field'),
      isSearchable: true,
      isResizable: true,
      minWidth: 120,
      relativeWidth: hashSizes?.field || 40,
      initialSearchValue: '',
      truncateText: true,
      alignment: TableCellAlignment.Left,
      className: 'value-table-separate-border',
      headerClassName: 'value-table-separate-border',
      render: (_name: string, { field: fieldItem }: HashField, expanded?: boolean) => {
        const { value: decompressedItem } = decompressingBuffer(fieldItem, compressor)
        const field = bufferToString(fieldItem) || ''
        // Better to cut the long string, because it could affect virtual scroll performance
        const { value } = formattingBuffer(decompressedItem, viewFormatProp, { expanded, skipVector: true })

        return (
          <div className="max-w-full whitespace-break-spaces">
            <div className="flex" data-testid={`hash-field-${field}`}>
              {!expanded && (
                <div className={cx('truncate')}>
                  {isString(value) ? value?.substring?.(0, 200) ?? value : value}
                </div>
              )}
              {expanded && value}
            </div>
          </div>
        )
      },
    },
    {
      id: 'value',
      label: l10n.t('Value'),
      minWidth: 120,
      truncateText: true,
      alignment: TableCellAlignment.Left,
      className: 'p-0',
      render: function Value(
        _name: string,
        { field: fieldItem, value: valueItem }: IHashField,
        expanded?: boolean,
        rowIndex = 0,
      ) {
        const { value: decompressedFieldItem } = decompressingBuffer(fieldItem, compressor)
        const { value: decompressedValueItem } = decompressingBuffer(valueItem!, compressor)
        const value = bufferToString(valueItem)
        const field = bufferToString(decompressedFieldItem)
        // Better to cut the long string, because it could affect virtual scroll performance
        const { value: formattedValue, isValid } = formattingBuffer(decompressedValueItem!, viewFormatProp, { expanded })

        const disabled = !isNonUnicodeFormatter(viewFormat, isValid)
        && !isEqualBuffers(valueItem, stringToBuffer(value))
        const isEditable = isFormatEditable(viewFormat)
        const editTooltipContent = TEXT_DISABLED_FORMATTER_EDITING

        const isEditing = editingIndex?.field === 'value' && editingIndex?.index === rowIndex

        return (
          <EditableTextArea
            initialValue={value}
            loading={updateLoading}
            disabled={disabled}
            editing={isEditing}
            editBtnDisabled={!isEditable || updateLoading}
            disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
            onDecline={() => handleEditField(rowIndex, false, 'value')}
            onApply={(value) => handleApplyEditField(fieldItem, value, rowIndex)}
            approveText={TEXT_INVALID_VALUE}
            approveByValidation={(value) =>
              formattingBuffer(
                stringToSerializedBufferFormat(viewFormat, value),
                viewFormat,
              )?.isValid}
            onEdit={(isEditing) => handleEditField(rowIndex, isEditing, 'value')}
            editToolTipContent={!isEditable ? editTooltipContent : null}
            onUpdateTextAreaHeight={() => clearCache(rowIndex)}
            field={field}
            testIdPrefix="hash"
          >
            <div>
              {!expanded && (
                <div className="truncate">
                  <span>{(formattedValue as any)?.substring?.(0, 200) ?? formattedValue}</span>
                </div>
              )}
              {expanded && formattedValue}
            </div>
          </EditableTextArea>
        )
      },
    },
    {
      id: 'actions',
      label: '',
      headerClassName: 'value-table-header-actions',
      className: 'actions',
      absoluteWidth: 48,
      minWidth: 48,
      maxWidth: 48,
      render: function Actions(_act: any, { field: fieldItem }: HashField) {
        const field = bufferToString(fieldItem, viewFormat)

        return (
          <StopPropagation>
            <div className="value-table-actions">
              <PopoverDelete
                header={createDeleteFieldHeader(fieldItem as RedisString)}
                text={createDeleteFieldMessage(key ?? '')}
                item={field}
                itemRaw={fieldItem as RedisString}
                suffix={suffix}
                deleting={deleting}
                closePopover={closePopover}
                disabled={updateLoading}
                showPopover={showPopover}
                testid={`remove-hash-button-${field}`}
                handleDeleteItem={handleDeleteField}
                handleButtonClick={handleRemoveIconClick}
                appendInfo={length === 1 ? helpTexts.REMOVE_LAST_ELEMENT(l10n.t('Field')) : null}
              />
            </div>
          </StopPropagation>
        )
      },
    },
  ]

  if (isExpireFieldsAvailable) {
    columns.splice(2, 0, {
      id: 'ttl',
      label: l10n.t('TTL'),
      absoluteWidth: 140,
      minWidth: 140,
      truncateText: true,
      className: 'p-0',
      render: function TTL(
        _name: string,
        { field: fieldItem, expire }: IHashField,
        _expanded?: boolean,
        rowIndex = 0,
      ) {
        const field = bufferToString(fieldItem, viewFormat)
        const isEditing = editingIndex?.field === 'ttl' && editingIndex?.index === rowIndex

        return (
          <EditableInput
            initialValue={expire === -1 ? '' : expire?.toString()}
            placeholder={l10n.t('Enter TTL')}
            field={field}
            editing={isEditing}
            onEdit={(value: boolean) => handleEditField(rowIndex, value, 'ttl')}
            onDecline={() => handleEditField(rowIndex, false, 'ttl')}
            onApply={(value) => handleApplyEditExpire(fieldItem, value, rowIndex)}
            testIdPrefix="hash-ttl"
            validation={validateTTLNumber}
          >
            <div className="truncate">
              {expire === -1 ? l10n.t('No Limit') : (
                <Tooltip
                  title={l10n.t('Time to Live')}
                  position="left center"
                  content={truncateNumberToDuration(expire || 0)}
                >
                  <div>{expire}</div>
                </Tooltip>
              )}
            </div>
          </EditableInput>
        )
      },
    })
  }

  return (
    <>
      <div
        data-testid="hash-details"
        className={cx(
          'key-details-table',
          'hash-fields-container',
          'flex flex-1 flex-grow p-4',
        )}
      >
        <VirtualTable
          hideProgress
          expandable
          autoHeight
          tableRef={tableRef}
          keyName={key}
          headerHeight={headerHeight}
          rowHeight={rowHeight}
          onChangeWidth={setWidth}
          columns={columns.map((column, i, arr) => ({
            ...column,
            width: getColumnWidth(i, width, arr),
          }))}
          footerHeight={0}
          loadMoreItems={loadMoreItems}
          loading={loading}
          items={fields}
          totalItemsCount={total}
          noItemsMessage={NoResultsFoundText}
          onWheel={closePopover}
          onSearch={handleSearch}
          cellCache={cellCache}
          onRowToggleViewClick={handleRowToggleViewClick}
          expandedRows={expandedRows}
          setExpandedRows={setExpandedRows}
          onColResizeEnd={onColResizeEnd}
        />
      </div>
    </>
  )
}

export { HashDetailsTable }
