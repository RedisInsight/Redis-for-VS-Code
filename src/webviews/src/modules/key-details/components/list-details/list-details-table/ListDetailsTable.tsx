import React, { useCallback, useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { get, isNull, isNumber, isString, isUndefined } from 'lodash'
import { CellMeasurerCache, Table } from 'react-virtualized'
import * as l10n from '@vscode/l10n'
import { useShallow } from 'zustand/react/shallow'

import {
  ITableColumn,
  IColumnSearchState,
  RelativeWidthSizes,
} from 'uiSrc/components/virtual-table/interfaces'
import { SCAN_COUNT_DEFAULT,
  KeyTypes,
  OVER_RENDER_BUFFER_COUNT,
  TableCellAlignment,
  TEXT_DISABLED_FORMATTER_EDITING,
  TEXT_UNPRINTABLE_CHARACTERS,
  TEXT_DISABLED_COMPRESSED_VALUE,
  NoResultsFoundText,
  TEXT_INVALID_VALUE,
} from 'uiSrc/constants'
import {
  bufferToString,
  formattingBuffer,
  isFormatEditable,
  isNonUnicodeFormatter,
  isEqualBuffers,
  stringToBuffer,
  stringToSerializedBufferFormat,
  validateListIndex,
  sendEventTelemetry,
  TelemetryEvent,
  getColumnWidth,
} from 'uiSrc/utils'
import { VirtualTable } from 'uiSrc/components'
// import { getColumnWidth } from 'uiSrc/components/virtual-grid'
// import { decompressingBuffer } from 'uiSrc/utils/decompressors'
import { useContextApi, useContextInContext, useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { Nullable } from 'uiSrc/interfaces'
import { EditableTextArea } from 'uiSrc/modules/key-details/shared'
import { fetchListElements, fetchListMoreElements, fetchSearchingListElement, updateListElementsAction, useListStore } from '../hooks/useListStore'
import { ListElement, SetListElementDto } from '../hooks/interface'
import styles from './styles.module.scss'

const headerHeight = 60
const rowHeight = 43
const footerHeight = 0
const initSearchingIndex = null

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: rowHeight,
})

export interface Props {
  isFooterOpen: boolean
}

const ListDetailsTable = (props: Props) => {
  const { isFooterOpen } = props

  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)
  const { [KeyTypes.List]: listSizes } = useContextInContext((state) => state.browser.keyDetailsSizes)

  const viewFormatProp = useContextInContext((state) => state.browser.viewFormat)

  const { key, lastRefreshTime, setRefreshDisabled } = useSelectedKeyStore(useShallow((state) => ({
    key: state.data?.name,
    lastRefreshTime: state.lastRefreshTime,
    setRefreshDisabled: state.setSelectedKeyRefreshDisabled,
  })))

  const { searchedIndex, loading, loadedElements, updateLoading, total } = useListStore((state) => ({
    loading: state.loading,
    searchedIndex: state.data.searchedIndex,
    total: state.data.total,
    loadedElements: state.data?.elements || [],
    updateLoading: state.updateValue.loading,
  }))

  const [elements, setElements] = useState<ListElement[]>([])
  const [width, setWidth] = useState(100)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [editingIndex, setEditingIndex] = useState<Nullable<number>>(null)
  const [viewFormat, setViewFormat] = useState(viewFormatProp)

  const formattedLastIndexRef = useRef(OVER_RENDER_BUFFER_COUNT)
  const tableRef: React.MutableRefObject<Nullable<Table>> = useRef(null)

  const contextApi = useContextApi()

  useEffect(() => {
    resetStates()
  }, [lastRefreshTime])

  useEffect(() => {
    setElements(loadedElements)

    if (loadedElements.length < elements.length) {
      formattedLastIndexRef.current = 0
    }

    if (viewFormat !== viewFormatProp) {
      resetStates()
    }
  }, [loadedElements, viewFormatProp])

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

  const handleEditElement = useCallback((
    index: number,
    editing: boolean,
  ) => {
    setEditingIndex(editing ? index : null)
    setRefreshDisabled(editing)

    clearCache(index)
  }, [cellCache, viewFormat])

  const handleApplyEditElement = (index = 0, value: string) => {
    const data: SetListElementDto = {
      keyName: key!,
      element: stringToSerializedBufferFormat(viewFormat, value),
      index,
    }
    updateListElementsAction(data, () => onElementEditedSuccess(index))
  }

  const onElementEditedSuccess = (elementIndex = 0) => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_EDITED,
      eventData: {
        databaseId,
        keyType: KeyTypes.List,
      },
    })
    handleEditElement(elementIndex, false)
  }

  const handleSearch = (search: IColumnSearchState[]) => {
    formattedLastIndexRef.current = 0
    const indexColumn = search.find((column) => column.id === 'index')
    const onSuccess = () => {
      resetExpandedCache()
      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_KEY_VALUE_FILTERED,
        eventData: {
          databaseId,
          keyType: KeyTypes.List,
          match: 'EXACT_VALUE_NAME',
        },
      })
    }

    if (!indexColumn?.value) {
      fetchListElements(key!, 0, SCAN_COUNT_DEFAULT)
      return
    }

    if (indexColumn) {
      const { value } = indexColumn
      fetchSearchingListElement(
        key!,
        value ? +value : initSearchingIndex,
        onSuccess,
      )
    }
  }

  const handleRowToggleViewClick = (expanded: boolean, rowIndex: number) => {
    const treeViewEvent = expanded
      ? TelemetryEvent.TREE_VIEW_KEY_FIELD_VALUE_EXPANDED
      : TelemetryEvent.TREE_VIEW_KEY_FIELD_VALUE_COLLAPSED

    sendEventTelemetry({
      event: treeViewEvent,
      eventData: {
        keyType: KeyTypes.List,
        databaseId,
        largestCellLength: get(elements, `elements[${rowIndex}].element.length`, 0),
      },
    })

    clearCache()
  }

  const onColResizeEnd = (sizes: RelativeWidthSizes) => {
    contextApi.updateKeyDetailsSizes({
      type: KeyTypes.List,
      sizes,
    })
  }

  const resetExpandedCache = () => {
    setTimeout(() => {
      setExpandedRows([])
      clearCache()
    }, 0)
  }

  const columns: ITableColumn[] = [
    {
      id: 'index',
      label: l10n.t('Index'),
      minWidth: 120,
      relativeWidth: listSizes?.index || 30,
      truncateText: true,
      isSearchable: true,
      isResizable: true,
      prependSearchName: l10n.t('Index:'),
      initialSearchValue: '',
      searchValidation: validateListIndex,
      headerClassName: 'value-table-separate-border',
      render: function Index(_name: string, { index }: ListElement) {
        // Better to cut the long string, because it could affect virtual scroll performance
        const cellContent = index?.toString().substring(0, 200)
        return (
          <div className="max-w-full whitespace-break-spaces">
            <div
              className="flex"
              data-testid={`list-index-value-${index}`}
            >
              {cellContent}
            </div>
          </div>
        )
      },
    },
    {
      id: 'element',
      label: l10n.t('Element'),
      minWidth: 150,
      truncateText: true,
      className: 'p-0',
      alignment: TableCellAlignment.Left,
      render: function Element(
        _element: string,
        { element: elementItem, index }: ListElement,
        expanded: boolean = false,
        rowIndex = 0,
      ) {
        // const { value: decompressedElementItem } = decompressingBuffer(elementItem, compressor)
        const decompressedElementItem = elementItem
        const element = bufferToString(elementItem)
        const { value: formattedValue, isValid } = formattingBuffer(decompressedElementItem, viewFormatProp, { expanded })

        const disabled = !isNonUnicodeFormatter(viewFormat, isValid)
        && !isEqualBuffers(elementItem, stringToBuffer(element))
        const isCompressed = false
        const isEditable = !isCompressed && isFormatEditable(viewFormat)
        const editTooltipContent = isCompressed ? TEXT_DISABLED_COMPRESSED_VALUE : TEXT_DISABLED_FORMATTER_EDITING

        return (
          <EditableTextArea
            initialValue={element}
            loading={updateLoading}
            disabled={disabled}
            editing={index === editingIndex}
            editBtnDisabled={!isEditable || updateLoading}
            disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
            onDecline={() => handleEditElement(index, false)}
            onApply={(value) => handleApplyEditElement(index, value)}
            approveText={TEXT_INVALID_VALUE}
            approveByValidation={(value) =>
              formattingBuffer(
                stringToSerializedBufferFormat(viewFormat, value),
                viewFormat,
              )?.isValid}
            onEdit={(isEditing) => handleEditElement(rowIndex, isEditing)}
            editToolTipContent={!isEditable ? editTooltipContent : null}
            onUpdateTextAreaHeight={() => clearCache(rowIndex)}
            field={rowIndex.toString()}
            testIdPrefix="list"
          >
            <div className="max-w-full whitespace-break-spaces">
              <div
                className="flex"
                data-testid={`list-element-value-${index}`}
              >
                {!expanded && (
                  <div className={cx('truncate', styles.tooltip)}>
                    {isString(formattedValue) ? formattedValue?.substring?.(0, 200) ?? formattedValue : formattedValue}
                  </div>
                )}
                {expanded && formattedValue}
              </div>
            </div>
          </EditableTextArea>
        )
      },
    },
  ]

  const loadMoreItems = ({ startIndex, stopIndex }: any) => {
    if (isNull(searchedIndex) || isUndefined(searchedIndex)) {
      fetchListMoreElements(key!, startIndex, stopIndex - startIndex + 1)
    }
  }

  return (
    <div
      data-testid="list-details"
      className={cx(
        'key-details-table',
        'list-elements-container',
        styles.container,
        {
          'footerOpened footerOpened--short': isFooterOpen,
        },
      )}
    >
      {/* {loading && (
        <EuiProgress
          color="primary"
          size="xs"
          position="absolute"
          data-testid="progress-key-list"
        />
      )} */}
      <VirtualTable
        autoHeight
        hideProgress
        expandable
        selectable={false}
        keyName={key}
        headerHeight={headerHeight}
        rowHeight={rowHeight}
        footerHeight={footerHeight}
        onChangeWidth={setWidth}
        tableRef={tableRef}
        columns={columns.map((column, i, arr) => ({
          ...column,
          width: getColumnWidth(i, width, arr),
        }))}
        loadMoreItems={loadMoreItems}
        loading={loading}
        items={elements}
        totalItemsCount={total}
        noItemsMessage={NoResultsFoundText}
        onSearch={handleSearch}
        cellCache={cellCache}
        onRowToggleViewClick={handleRowToggleViewClick}
        expandedRows={expandedRows}
        setExpandedRows={setExpandedRows}
        onColResizeEnd={onColResizeEnd}
      />
    </div>
  )
}

export { ListDetailsTable }
