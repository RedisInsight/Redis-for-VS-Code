import cx from 'classnames'
import React, { ChangeEvent, Ref, useCallback, useEffect, useRef, useState } from 'react'
import { CellMeasurerCache } from 'react-virtualized'
import AutoSizer from 'react-virtualized-auto-sizer'
import { VscEdit } from 'react-icons/vsc'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { useShallow } from 'zustand/react/shallow'
import * as l10n from '@vscode/l10n'
import { isString } from 'lodash'

import { InlineEditor, PopoverDelete, VirtualTable } from 'uiSrc/components'
import {
  getColumnWidth,
  getMatchType,
  sendEventTelemetry,
  TelemetryEvent,
  bufferToSerializedFormat,
  bufferToString,
  createDeleteFieldHeader,
  createDeleteFieldMessage,
  formatLongName,
  formattingBuffer,
  isEqualBuffers,
  isFormatEditable,
  isNonUnicodeFormatter,
  stringToSerializedBufferFormat,
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
  TEXT_DISABLED_COMPRESSED_VALUE,
  TEXT_DISABLED_FORMATTER_EDITING,
  TEXT_FAILED_CONVENT_FORMATTER,
  TEXT_UNPRINTABLE_CHARACTERS,
  SCAN_COUNT_DEFAULT,
  helpTexts,
  NoResultsFoundText,
  DEFAULT_SEARCH_MATCH,
} from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils/formatters/bufferFormatters'
import { Nullable, RedisString } from 'uiSrc/interfaces'
import { useContextApi, useContextInContext, useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { TextArea } from 'uiSrc/ui'
import { AddFieldsToHashDto, GetHashFieldsResponse, HashField } from '../hooks/interface'

import {
  deleteHashFields,
  fetchHashFields,
  fetchHashMoreFields,
  updateHashFieldsAction,
  useHashStore,
} from '../hooks/useHashStore'
import styles from './styles.module.scss'

const suffix = '_hash'
const headerHeight = 60
const rowHeight = 43

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: rowHeight,
})

interface IHashField extends HashField {}

export interface Props {
  isFooterOpen: boolean
  onRemoveKey?: () => void
}

const HashDetailsTable = (props: Props) => {
  const { isFooterOpen, onRemoveKey } = props

  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)

  const { viewFormatProp, length, key } = useSelectedKeyStore(useShallow((state) => ({
    viewFormatProp: state.viewFormat,
    length: state.data?.length,
    key: state.data?.name,
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
  const [editingIndex, setEditingIndex] = useState<Nullable<number>>(null)
  const [width, setWidth] = useState(100)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [viewFormat, setViewFormat] = useState(viewFormatProp)
  const [areaValue, setAreaValue] = useState<string>('')
  const [, forceUpdate] = useState({})

  const formattedLastIndexRef = useRef(OVER_RENDER_BUFFER_COUNT)
  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)

  const contextApi = useContextApi()

  useEffect(() => {
    setFields(loadedFields)

    if (loadedFields?.length < fields.length) {
      formattedLastIndexRef.current = 0
    }

    if (viewFormat !== viewFormatProp) {
      setExpandedRows([])
      setViewFormat(viewFormatProp)
      setEditingIndex(null)

      clearCache()
    }
  }, [loadedFields, viewFormatProp])

  const clearCache = () => setTimeout(() => {
    cellCache.clearAll()
    forceUpdate({})
  }, 0)

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
    rowIndex: Nullable<number> = null,
    editing: boolean,
    valueItem?: RedisString,
  ) => {
    setEditingIndex(editing ? rowIndex : null)

    if (editing) {
      const value = bufferToSerializedFormat(viewFormat, valueItem, 4)
      setAreaValue(value)

      setTimeout(() => {
        textAreaRef?.current?.focus()
      }, 0)
    }

    // hack to update scrollbar padding
    clearCache()
    setTimeout(() => {
      clearCache()
    }, 0)
  }, [viewFormat])

  const handleApplyEditField = (field: RedisString = '') => {
    const data: AddFieldsToHashDto = {
      keyName: key!,
      fields: [{ field, value: stringToSerializedBufferFormat(viewFormat, areaValue) }],
    }
    updateHashFieldsAction(data, false, () => onHashEditedSuccess(field))
  }

  const onHashEditedSuccess = (fieldName: RedisString = '') => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_EDITED,
      eventData: {
        databaseId,
        keyType: KeyTypes.Hash,
      },
    })
    handleEditField(fieldName, false)
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
      cellCache.clearAll()
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

  const updateTextAreaHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '0px'
      textAreaRef.current.style.height = `${textAreaRef.current?.scrollHeight || 0}px`
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
      label: 'FIELD',
      isSearchable: true,
      isResizable: true,
      minWidth: 120,
      relativeWidth: hashSizes?.field || 40,
      prependSearchName: 'Field:',
      initialSearchValue: '',
      truncateText: true,
      alignment: TableCellAlignment.Left,
      className: 'value-table-separate-border',
      headerClassName: 'value-table-separate-border',
      render: (_name: string, { field: fieldItem }: HashField, expanded?: boolean) => {
        // const { value: decompressedItem } = decompressingBuffer(fieldItem, compressor)
        const decompressedItem = fieldItem
        const field = bufferToString(fieldItem) || ''
        // Better to cut the long string, because it could affect virtual scroll performance
        const { value, isValid } = formattingBuffer(decompressedItem, viewFormatProp, { expanded })
        const tooltipContent = `${isValid ? l10n.t('Field') : TEXT_FAILED_CONVENT_FORMATTER(viewFormatProp)}\n${formatLongName(field)}`

        return (
          <div className="max-w-full whitespace-break-spaces">
            <div className="flex" data-testid={`hash-field-${field}`}>
              {!expanded && (
                <div
                  title={tooltipContent}
                  className={cx('truncate', styles.tooltip)}
                >
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
      label: 'VALUE',
      minWidth: 120,
      truncateText: true,
      alignment: TableCellAlignment.Left,
      render: function Value(
        _name: string,
        { field: fieldItem, value: valueItem }: IHashField,
        expanded?: boolean,
        rowIndex = 0,
      ) {
        // const { value: decompressedFieldItem } = decompressingBuffer(fieldItem, compressor)
        // const { value: decompressedValueItem } = decompressingBuffer(valueItem, compressor)
        const decompressedFieldItem = fieldItem
        const decompressedValueItem = valueItem
        const value = bufferToString(valueItem)
        const field = bufferToString(decompressedFieldItem)
        // Better to cut the long string, because it could affect virtual scroll performance
        const { value: formattedValue, isValid } = formattingBuffer(decompressedValueItem, viewFormatProp, { expanded })
        const tooltipContent = `${isValid ? 'Value' : TEXT_FAILED_CONVENT_FORMATTER(viewFormatProp)}\n${formatLongName(value)}`

        if (rowIndex === editingIndex) {
          const disabled = !isNonUnicodeFormatter(viewFormat, isValid)
            && !isEqualBuffers(valueItem, stringToBuffer(value))

          setTimeout(() => cellCache.clear(rowIndex, 1), 0)
          updateTextAreaHeight()

          return (
            <AutoSizer disableHeight onResize={() => setTimeout(updateTextAreaHeight, 0)}>
              {({ width }) => (
                <div style={{ width: width + 117 }} className={styles.textareaContainer}>
                  <StopPropagation>
                    <InlineEditor
                      expandable
                      preventOutsideClick
                      disableFocusTrap
                      isActive
                      declineOnUnmount={false}
                      initialValue={value}
                      placeholder="Enter Value"
                      fieldName="fieldValue"
                      controlsPosition="bottom"
                      isLoading={updateLoading}
                      isDisabled={disabled}
                      disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
                      controlsClassName={styles.textAreaControls}
                      onDecline={() => handleEditField(rowIndex, false)}
                      onApply={() => handleApplyEditField(fieldItem)}
                      // approveText={TEXT_INVALID_VALUE}
                      // approveByValidation={() =>
                      //   formattingBuffer(
                      //     stringToSerializedBufferFormat(viewFormat, areaValue),
                      //     viewFormat,
                      //   )?.isValid}
                    >
                      <TextArea
                        name="value"
                        id="value"
                        placeholder="Enter Value"
                        value={areaValue}
                        onInput={(e: ChangeEvent<HTMLTextAreaElement>) => {
                          cellCache.clearAll()
                          setAreaValue(e.target.value)
                          updateTextAreaHeight()
                        }}
                        disabled={updateLoading}
                        className={cx(styles.textArea, { [styles.areaWarning]: disabled })}
                        spellCheck={false}
                        data-testid="hash-value-editor"
                        style={{ height: textAreaRef.current?.scrollHeight || 0 }}
                        inputRef={textAreaRef}
                      />
                    </InlineEditor>
                  </StopPropagation>
                </div>
              )}
            </AutoSizer>
          )
        }
        return (
          <div className="max-w-full whitespace-break-spaces">
            <div
              className="flex"
              data-testid={`hash-field-value-${field}`}
            >
              {!expanded && (
                <div
                  title={tooltipContent}
                  className={cx('truncate', styles.tooltip)}
                >
                  {isString(formattedValue) ? formattedValue?.substring?.(0, 200) ?? formattedValue : formattedValue}
                </div>
              )}
              {expanded && formattedValue}
            </div>
          </div>
        )
      },
    },
    {
      id: 'actions',
      label: '',
      headerClassName: 'value-table-header-actions',
      className: 'actions',
      absoluteWidth: 84,
      minWidth: 84,
      maxWidth: 84,
      render: function Actions(_act: any, { field: fieldItem, value: valueItem }: HashField, _, rowIndex?: number) {
        const field = bufferToString(fieldItem, viewFormat)
        const isCompressed = false
        // const { isCompressed } = decompressingBuffer(valueItem, compressor)
        const isEditable = !isCompressed && isFormatEditable(viewFormat)
        const tooltipContent = isCompressed ? TEXT_DISABLED_COMPRESSED_VALUE : TEXT_DISABLED_FORMATTER_EDITING

        if (rowIndex === editingIndex) {
          return null
        }

        return (
          <StopPropagation>
            <div className="value-table-actions">
              <div
                className="flex items-center"
                title={!isEditable ? tooltipContent : ''}
                data-testid="hash-edit-tooltip"
              >
                <VSCodeButton
                  appearance="icon"
                  disabled={updateLoading || !isEditable}
                  className="editFieldBtn"
                  onClick={() => handleEditField(rowIndex, true, valueItem)}
                  data-testid={`edit-hash-button-${field}`}
                  aria-label="Edit field"
                >
                  <VscEdit />
                </VSCodeButton>
              </div>
              <PopoverDelete
                header={createDeleteFieldHeader(fieldItem as RedisString)}
                text={createDeleteFieldMessage(key ?? '')}
                item={field}
                itemRaw={fieldItem as RedisString}
                suffix={suffix}
                deleting={deleting}
                closePopover={closePopover}
                updateLoading={updateLoading}
                showPopover={showPopover}
                testid={`remove-hash-button-${field}`}
                handleDeleteItem={handleDeleteField}
                handleButtonClick={handleRemoveIconClick}
                appendInfo={length === 1 ? helpTexts.REMOVE_LAST_ELEMENT('Field') : null}
              />
            </div>
          </StopPropagation>
        )
      },
    },
  ]

  return (
    <>
      <div
        data-testid="hash-details"
        className={cx(
          'key-details-table',
          'hash-fields-container',
          styles.container,
          { footerOpened: isFooterOpen },
        )}
      >
        <VirtualTable
          hideProgress
          expandable
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
