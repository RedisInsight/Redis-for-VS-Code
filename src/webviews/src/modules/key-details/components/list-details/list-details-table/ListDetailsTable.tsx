import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { get, isNull, isString, isUndefined } from 'lodash'
import { CellMeasurerCache } from 'react-virtualized'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useShallow } from 'zustand/react/shallow'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscEdit } from 'react-icons/vsc'

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
  bufferToSerializedFormat,
  bufferToString,
  formatLongName,
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
import { VirtualTable, InlineEditor } from 'uiSrc/components'
import { TextArea } from 'uiSrc/ui'
import { StopPropagation } from 'uiSrc/components/virtual-table'
// import { getColumnWidth } from 'uiSrc/components/virtual-grid'
// import { decompressingBuffer } from 'uiSrc/utils/decompressors'

import { useContextApi, useContextInContext, useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'

import { Nullable, RedisString } from 'uiSrc/interfaces'
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

  const { viewFormatProp, key, lastRefreshTime, setRefreshDisabled } = useSelectedKeyStore(useShallow((state) => ({
    viewFormatProp: state.viewFormat,
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
  const [areaValue, setAreaValue] = useState<string>('')
  const [, forceUpdate] = useState({})

  const formattedLastIndexRef = useRef(OVER_RENDER_BUFFER_COUNT)
  const textAreaRef: React.Ref<HTMLTextAreaElement> = useRef(null)

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

  const clearCache = () => setTimeout(() => {
    cellCache.clearAll()
    forceUpdate({})
  }, 0)

  const handleEditElement = useCallback((
    index: Nullable<number> = null,
    editing: boolean,
    valueItem?: RedisString,
  ) => {
    setEditingIndex(editing ? index : null)
    setRefreshDisabled(editing)

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
  }, [cellCache, viewFormat])

  const handleApplyEditElement = (index = 0) => {
    const data: SetListElementDto = {
      keyName: key!,
      element: stringToSerializedBufferFormat(viewFormat, areaValue),
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

    cellCache.clearAll()
  }

  const updateTextAreaHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '0px'
      textAreaRef.current.style.height = `${textAreaRef.current?.scrollHeight || 0}px`
    }
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
      cellCache.clearAll()
    }, 0)
  }

  const columns: ITableColumn[] = [
    {
      id: 'index',
      label: 'Index',
      minWidth: 120,
      relativeWidth: listSizes?.index || 30,
      truncateText: true,
      isSearchable: true,
      isResizable: true,
      prependSearchName: 'Index:',
      initialSearchValue: '',
      searchValidation: validateListIndex,
      className: 'value-table-separate-border',
      headerClassName: 'value-table-separate-border',
      render: function Index(_name: string, { index }: ListElement) {
        // Better to cut the long string, because it could affect virtual scroll performance

        const cellContent = index?.toString().substring(0, 200)
        const tooltipContent = formatLongName(index?.toString())
        return (
          <div className="max-w-full whitespace-break-spaces">
            <div
              className="flex"
              data-testid={`list-index-value-${index}`}
            >
              <div
                title={tooltipContent}
                className={cx(styles.tooltip, 'truncate')}
              >
                {cellContent}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      id: 'element',
      label: 'Element',
      minWidth: 150,
      truncateText: true,
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
        const tooltipContent = formatLongName(element)
        const { value: formattedValue, isValid } = formattingBuffer(decompressedElementItem, viewFormatProp, { expanded })

        if (index === editingIndex) {
          const disabled = !isNonUnicodeFormatter(viewFormat, isValid)
            && !isEqualBuffers(elementItem, stringToBuffer(element))

          setTimeout(() => cellCache.clear(rowIndex, 1), 0)

          return (
            <AutoSizer disableHeight onResize={() => setTimeout(updateTextAreaHeight, 0)}>
              {({ width }) => (
                <div style={{ width: width + 90 }} className={styles.textareaContainer}>
                  <StopPropagation>
                    <InlineEditor
                      expandable
                      preventOutsideClick
                      disableFocusTrap
                      isActive
                      declineOnUnmount={false}
                      initialValue={element}
                      placeholder="Enter Element"
                      fieldName="elementValue"
                      controlsPosition="bottom"
                      isLoading={updateLoading}
                      isDisabled={disabled}
                      disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
                      controlsClassName={styles.textAreaControls}
                      onDecline={() => handleEditElement(index, false)}
                      onApply={() => handleApplyEditElement(index)}
                      approveText={TEXT_INVALID_VALUE}
                      approveByValidation={() =>
                        formattingBuffer(
                          stringToSerializedBufferFormat(viewFormat, areaValue),
                          viewFormat,
                        )?.isValid}
                    >
                      <TextArea
                        name="value"
                        id="value"
                        placeholder="Enter Element"
                        value={areaValue}
                        onInput={(e: ChangeEvent<HTMLTextAreaElement>) => {
                          cellCache.clearAll()
                          setAreaValue(e.target.value)
                          updateTextAreaHeight()
                        }}
                        disabled={updateLoading}
                        className={cx(styles.textArea, { [styles.areaWarning]: disabled })}
                        spellCheck={false}
                        data-testid="element-value-editor"
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
              data-testid={`list-element-value-${index}`}
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
      minWidth: 60,
      maxWidth: 60,
      absoluteWidth: 60,
      render: function Actions(_element: any, { index, element }: ListElement) {
        // const { isCompressed } = decompressingBuffer(element, compressor)
        const isCompressed = false
        const isEditable = !isCompressed && isFormatEditable(viewFormat)
        const tooltipContent = isCompressed ? TEXT_DISABLED_COMPRESSED_VALUE : TEXT_DISABLED_FORMATTER_EDITING
        return (
          <StopPropagation>
            <div className="value-table-actions" title={!isEditable ? tooltipContent : ''}>
              {index !== editingIndex && (
                <VSCodeButton
                  appearance="icon"
                  disabled={updateLoading || !isEditable}
                  className="editFieldBtn"
                  onClick={() => handleEditElement(index, true, element)}
                  data-testid={`edit-list-button-${index}`}
                  aria-label="Edit field"
                >
                  <VscEdit />
                </VSCodeButton>
              )}
            </div>
          </StopPropagation>
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
        hideProgress
        expandable
        selectable={false}
        keyName={key}
        headerHeight={headerHeight}
        rowHeight={rowHeight}
        footerHeight={footerHeight}
        onChangeWidth={setWidth}
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
