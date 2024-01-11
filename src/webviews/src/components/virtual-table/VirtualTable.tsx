import cx from 'classnames'
import { findIndex, isNumber, sumBy, xor } from 'lodash'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  CellMeasurer,
  CellMeasurerCache,
  Column,
  IndexRange,
  InfiniteLoader,
  RowMouseEventHandlerParams,
  Table,
  TableCellProps,
} from 'react-virtualized'
import { VscArrowDown, VscArrowUp } from 'react-icons/vsc'
import { SortOrder, SCAN_COUNT_DEFAULT } from 'uiSrc/constants'

import { isEqualBuffers } from 'uiSrc/utils'
import { Maybe, Nullable } from 'uiSrc/interfaces'
import { TableColumnSearch } from './components/table-column-search/TableColumnSearch'
import { TableColumnSearchTrigger } from './components/table-column-search-trigger/TableColumnSearchTrigger'
import {
  ColumnWidthSizes,
  IColumnSearchState,
  IProps,
  ITableColumn,
  ResizableState,
} from './interfaces'

import styles from './styles.module.scss'

// this is needed to align content when scrollbar appears
const TABLE_OUTSIDE_WIDTH = 24

const VirtualTable = (props: IProps) => {
  const {
    selectable = false,
    expandable = false,
    headerHeight = 44,
    rowHeight = 40,
    threshold = 100,
    totalItemsCount = 0,
    onRowClick = () => { },
    onSearch = () => { },
    onChangeSorting = () => { },
    onRowToggleViewClick = () => { },
    sortedColumn = null,
    selectedKey = null,
    noItemsMessage = 'No keys to display.',
    searching,
    loading,
    columns,
    items,
    disableScroll,
    onWheel,
    keyName,
    loadMoreItems,
    setScrollTopPosition = () => { },
    scrollTopProp = 0,
    tableWidth = 0,
    hideProgress,
    onChangeWidth = () => { },
    expandedRows = [],
    setExpandedRows = () => { },
    onRowsRendered: onRowsRenderedProps,
    cellCache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: rowHeight,
    }),
    onColResizeEnd,
  } = props
  let selectTimer: number = 0
  const selectTimerDelay = 300
  let preventSelect = false

  const scrollTopRef = useRef<number>(0)
  const resizeColRef = useRef<ResizableState>({ column: null, active: false, x: 0 })

  const [selectedRowIndex, setSelectedRowIndex] = useState<Nullable<number>>(null)
  const [search, setSearch] = useState<IColumnSearchState[]>([])
  const [width, setWidth] = useState<number>(100)
  const [height, setHeight] = useState<number>(100)
  const [forceScrollTop, setForceScrollTop] = useState<Maybe<number>>(scrollTopProp)
  const [columnWidthSizes, setColumnWidthSizes] = useState<Nullable<ColumnWidthSizes>>(null)
  const [isColResizing, setIsColResizing] = useState(false)
  const [, forceUpdate] = useState({})

  const [minWidthAllCols, setMinWidthAllCols] = useState<number>(0)

  useEffect(() => {
    const searchableFields: ITableColumn[] = columns.filter(
      (column: ITableColumn) => column.isSearchable,
    )
    searchableFields.forEach((column) => {
      setSearch([
        ...search,
        {
          id: column.id,
          value: column.initialSearchValue ?? '',
          initialSearchValue: column.initialSearchValue ?? '',
          isOpened: !!column.staySearchAlwaysOpen || !!column.isSearchOpen,
          staySearchAlwaysOpen: !!column.staySearchAlwaysOpen,
          prependSearchName: column.prependSearchName ?? '',
          searchValidation: column.searchValidation,
        },
      ])
    })

    return () => {
      setScrollTopPosition(scrollTopRef.current)
      setExpandedRows([])
      cellCache?.clearAll()
    }
  }, [])

  useEffect(() => {
    setMinWidthAllCols(sumBy(columns, ((col) => col?.minWidth || 0)))
  }, [columns])

  useEffect(() => {
    if (forceScrollTop !== undefined) {
      setForceScrollTop(undefined)
    }
  }, [forceScrollTop])

  useEffect(() => {
    const selectedRowIndex = selectedKey ? findIndex(items, ({ name }) => isEqualBuffers(name, selectedKey.name)) : null
    setSelectedRowIndex(isNumber(selectedRowIndex) && selectedRowIndex > -1 ? selectedRowIndex : null)
  }, [selectedKey, items])

  useEffect(() => {
    setExpandedRows([])
    cellCache?.clearAll()
  }, [totalItemsCount])

  const onResize = ({ width = 0, height = 0 }: Size): void => {
    setHeight(height)
    setWidth(Math.floor(width))
    onChangeWidth?.(width)

    if (!columnWidthSizes) {
      // init width sizes
      setColumnWidthSizes(
        columns
          .filter((col) => col.isResizable)
          .reduce((prev, next) => {
            const propAbsWidth = next.absoluteWidth && isNumber(next.absoluteWidth) ? next.absoluteWidth : 0
            return {
              ...prev,
              [next.id]: next.relativeWidth
                ? getWidthOfColumn(next.id, next.relativeWidth, width, true)
                : getWidthOfColumn(next.id, propAbsWidth, width),
            }
          }, {}),
      )
    }

    if (columnWidthSizes) {
      setColumnWidthSizes((colWidthSizesPrev) => {
        const newSizes: ColumnWidthSizes = {}
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const col in colWidthSizesPrev) {
          newSizes[col] = getWidthOfColumn(col, colWidthSizesPrev[col].relative, width, true)
        }
        return newSizes
      })
    }

    cellCache?.clearAll()
  }

  const clearSelectTimeout = (timer: number = 0) => {
    clearTimeout(timer || selectTimer)
    preventSelect = true
  }

  const clearCache = () => setTimeout(() => {
    cellCache.clearAll()
    forceUpdate({})
  }, 0)

  const getWidthOfColumn = (colId: string, colWidth: number, width: number, isRelative = false) => {
    let newColWidth = isRelative ? (colWidth / 100) * width : colWidth

    const currentColumn = columns.find((col) => col.id === colId)
    const maxWidthFromTable = width - (minWidthAllCols - (currentColumn?.minWidth || 0)) - TABLE_OUTSIDE_WIDTH
    const maxWidth = currentColumn?.maxWidth || maxWidthFromTable
    const minWidth = (currentColumn?.minWidth || 60)

    if (newColWidth > maxWidth) newColWidth = maxWidth
    if (newColWidth < minWidth) newColWidth = minWidth

    const newAbsWidth = Math.floor(newColWidth)
    return {
      abs: newAbsWidth,
      relative: (newAbsWidth / width) * 100,
    }
  }

  const onRowSelect = (data: RowMouseEventHandlerParams) => {
    const isRowSelectable = checkIfRowSelectable(data.rowData)

    onRowClick(data)
    if (isRowSelectable && selectable) {
      setSelectedRowIndex(data.index)
    }

    if (isRowSelectable && expandable) {
      selectTimer = window.setTimeout(() => {
        const textSelected = window.getSelection()?.toString()
        if (!preventSelect && !textSelected) {
          setExpandedRows(xor(expandedRows, [data.index]))
          onRowToggleViewClick?.(expandedRows.indexOf(data.index) === -1, data.index)

          clearCache()
          setTimeout(() => { clearCache() }, 0)
        }
        preventSelect = false
      }, selectTimerDelay, cellCache)

      if (data.event?.detail === 3) {
        clearSelectTimeout(selectTimer)
        preventSelect = false
      }

      cellCache.clearAll()
    }
  }

  const onScroll = useCallback(({ scrollTop }: { scrollTop: number }) => {
    scrollTopRef.current = scrollTop
  }, [scrollTopRef])

  const onDragColumn = (e: React.MouseEvent) => {
    const { column, x, active } = resizeColRef.current
    if (active && column) {
      const diffX = x - e.clientX
      setColumnWidthSizes((prev) => {
        if (!prev) return null

        resizeColRef.current.x = e.clientX
        return ({
          ...prev,
          [column]: getWidthOfColumn(column, prev[column].abs - diffX, width),
        })
      })

      cellCache?.clearAll()
    }
  }

  const onDragColumnStart = (e: React.MouseEvent, column: ITableColumn) => {
    resizeColRef.current = {
      column: column.id,
      active: true,
      x: e.clientX,
    }
    setIsColResizing(true)
  }

  const onDragColumnEnd = () => {
    if (resizeColRef.current.active) {
      resizeColRef.current = {
        active: false,
        column: null,
        x: 0,
      }
      setIsColResizing(false)
      cellCache?.clearAll()

      if (columnWidthSizes) {
        onColResizeEnd?.(
          Object.keys(columnWidthSizes)
            .reduce((prev, next) => ({
              ...prev,
              [next]: columnWidthSizes[next].relative,
            }), {}),
        )
      }
    }
  }

  const checkIfRowSelectable = (rowData: any) => !!rowData

  const cellRenderer = ({ cellData, columnIndex, rowData, rowIndex, parent, dataKey }: TableCellProps) => {
    const column = columns[columnIndex]
    if (column.render) {
      return (
        <CellMeasurer
          cache={cellCache}
          columnIndex={columnIndex}
          rowIndex={rowIndex}
          parent={parent}
          key={rowIndex + columnIndex + dataKey}
        >
          <div
            className={styles.tableRowCell}
            style={{ justifyContent: column.alignment, wordBreak: 'break-word' }}
            role="presentation"
          >
            {column?.render?.(cellData, rowData, expandedRows.indexOf(rowIndex) !== -1, rowIndex)}
          </div>
        </CellMeasurer>
      )
    }
    return (
      <CellMeasurer
        cache={cellCache}
        columnIndex={columnIndex}
        rowIndex={rowIndex}
        parent={parent}
        key={rowIndex + columnIndex + dataKey}
      >
        <div className={styles.tableRowCell} style={{ justifyContent: column.alignment, whiteSpace: 'normal' }}>
          <div className="max-w-full">
            <div className={cx('flex', { truncate: column.truncateText })}>
              {cellData}
            </div>
          </div>
        </div>
      </CellMeasurer>
    )
  }

  const changeSorting = (column: any) => {
    if (!sortedColumn || !sortedColumn.column || sortedColumn.column !== column) {
      onChangeSorting(column, SortOrder.DESC)
      return
    }
    onChangeSorting(
      column,
      sortedColumn.order === SortOrder.DESC ? SortOrder.ASC : SortOrder.DESC,
    )
  }

  const headerRenderer = ({ columnIndex, cellClass = '' }: any) => {
    const column = columns[columnIndex]
    const isColumnSorted = sortedColumn && sortedColumn.column === column.id

    return (
      <div
        className="flex flex-row fluid relative"
        style={{ justifyContent: column.alignment }}
      >
        {column.isSortable && !searching && (
          <div className={styles.headerCell} style={{ justifyContent: column.alignment }}>
            <button
              type="button"
              onClick={() => changeSorting(column.id)}
              className={cx(
                cellClass,
                styles.headerButton,
                isColumnSorted ? styles.headerButtonSorted : null,
              )}
              data-testid="sort-button"
              style={{ justifyContent: column.alignment }}
            >
              <span className={cellClass}>{column.label}</span>
            </button>
          </div>
        )}
        {(!column.isSortable || (column.isSortable && searching)) && (
          <div className={cx(styles.headerCell, cellClass, 'relative')} style={{ flex: '1' }}>
            <div
              style={{
                justifyContent: column.alignment,
                textAlign: column.textAlignment,
                flex: '1',
              }}
            >
              <span className={cellClass}>{column.label}</span>
            </div>
            {column.isSearchable && searchRenderer(column)}
          </div>
        )}
        {isColumnSorted && !searching && (
          <div className={styles.headerCell} style={{ paddingLeft: 0 }}>
            <button
              type="button"
              onClick={() => changeSorting(column.id)}
              className={cx(
                styles.headerButton,
                isColumnSorted ? styles.headerButtonSorted : null,
              )}
              data-testid="header-sorting-button"
            >
              {sortedColumn?.order === SortOrder.DESC
                ? <VscArrowDown />
                : <VscArrowUp />}
              {/* <EuiIcon
                style={{ marginLeft: '4px' }}
                type={sortedColumn?.order === SortOrder.DESC ? 'sortDown' : 'sortUp'}
              /> */}
            </button>
          </div>
        )}
        {column.isResizable && (
          <div
            className={styles.resizeTrigger}
            onMouseDown={(e) => onDragColumnStart(e, column)}
            data-testid={`resize-trigger-${column.id}`}
            role="presentation"
          />
        )}
      </div>
    )
  }

  const noRowsRenderer = () => (
    <>
      {noItemsMessage && (
        <div className={styles.placeholder}>
          <div className="align-middle">
            <div>{loading ? 'loading...' : noItemsMessage}</div>
          </div>
        </div>
      )}
    </>
  )

  const loadMoreRows = async (params: IndexRange): Promise<any> => {
    const { startIndex, stopIndex } = params

    // We do not load more results for first load
    if (forceScrollTop !== undefined) return

    if (!loading) {
      loadMoreItems?.({ keyName, startIndex, stopIndex })
    }
  }

  const isRowLoaded = ({ index }: any) => !!items[index]

  const handleColumnSearchVisibility = (columnId: string, isOpened: boolean) => {
    const newSearch = search.map((column) => {
      if (column.id === columnId) {
        return {
          ...column,
          isOpened,
        }
      }
      return column
    })
    setSearch(newSearch)
  }

  const handleColumnSearchApply = (columnId: string, value: string) => {
    const newState = search.map((column) => {
      if (column.id === columnId) {
        return {
          ...column,
          isOpened: !!value,
          value,
        }
      }
      return column
    })
    cellCache.clearAll()
    setExpandedRows([])

    setSearch(newState)
    onSearch?.(newState)
  }

  const searchRenderer = (column: ITableColumn) => {
    const columnSearchState = search.find((columnState) => columnState.id === column.id)
    if (!columnSearchState) {
      return null
    }
    if (columnSearchState.staySearchAlwaysOpen) {
      return (
        <TableColumnSearch
          appliedValue={columnSearchState.value}
          fieldName={columnSearchState.id}
          onApply={(value) => handleColumnSearchApply(column.id, value)}
          prependSearchName={columnSearchState.prependSearchName}
          searchValidation={columnSearchState.searchValidation}
        />
      )
    }
    return (
      <TableColumnSearchTrigger
        appliedValue={columnSearchState.value}
        initialValue={columnSearchState.initialSearchValue}
        fieldName={columnSearchState.id}
        onApply={(value) => handleColumnSearchApply(column.id, value)}
        isOpen={columnSearchState.isOpened}
        handleOpenState={(isOpen) => handleColumnSearchVisibility(column.id, isOpen)}
        searchValidation={columnSearchState.searchValidation}
      />
    )
  }

  return (
    <AutoSizer onResize={onResize}>
      {({ width, height }) => (
        <div
          className={cx(styles.container, { [styles.isResizing]: isColResizing })}
          style={{ width, height }}
          onWheel={onWheel}
          onMouseMove={onDragColumn}
          onMouseUp={onDragColumnEnd}
          onMouseLeave={onDragColumnEnd}
          role="presentation"
          data-testid="virtual-table-container"
        >
          {loading && !hideProgress && (
            <span />
          )}
          <InfiniteLoader
            isRowLoaded={isRowLoaded}
            minimumBatchSize={SCAN_COUNT_DEFAULT}
            threshold={threshold}
            loadMoreRows={loadMoreRows}
            rowCount={totalItemsCount || undefined}
          >
            {({ onRowsRendered, registerChild }) => (
              <Table
                onRowClick={onRowSelect}
                onRowDoubleClick={() => clearSelectTimeout()}
                estimatedRowSize={rowHeight}
                ref={registerChild}
                headerHeight={headerHeight}
                rowHeight={cellCache.rowHeight}
                width={tableWidth > width ? tableWidth : width}
                noRowsRenderer={noRowsRenderer}
                height={height}
                className={styles.table}
                gridClassName={cx(styles.customScroll, styles.grid, {
                  [styles.disableScroll]: disableScroll,
                })}
                rowClassName={({ index }) =>
                  cx([
                    styles.tableRow,
                    {
                      'table-row-selected': selectedRowIndex === index,
                      [styles.tableRowEven]: index % 2 === 0,
                    },
                  ])}
                headerClassName={styles.headerColumn}
                rowCount={items.length}
                rowGetter={({ index }) => items[index]}
                onScroll={onScroll}
                scrollTop={forceScrollTop}
                deferredMeasurementCache={cellCache}
                onRowsRendered={(props) => {
                  onRowsRendered(props)
                  onRowsRenderedProps?.(props)
                }}
              >
                {columns.map((column: ITableColumn, index: number) => (
                  <Column
                    minWidth={column.minWidth}
                    maxWidth={column.maxWidth}
                    label={column.label}
                    dataKey={column.id}
                    width={columnWidthSizes?.[column.id]?.abs || (
                      column.absoluteWidth || column.relativeWidth ? column.relativeWidth ?? 0 : 20
                    )}
                    flexGrow={!column.absoluteWidth && !column.relativeWidth ? 1 : 0}
                    headerRenderer={(headerProps) =>
                      headerRenderer({
                        ...headerProps,
                        columnIndex: index,
                        cellClass: column.headerCellClassName,
                      })}
                    cellRenderer={cellRenderer}
                    headerClassName={column.headerClassName ?? ''}
                    className={cx(styles.tableRowColumn, column.className ?? '')}
                    key={column.id}
                  />
                ))}
              </Table>
            )}
          </InfiniteLoader>
        </div>
      )}
    </AutoSizer>
  )
}

export { VirtualTable }
