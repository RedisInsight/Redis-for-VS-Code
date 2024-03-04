import cx from 'classnames'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { CellMeasurerCache } from 'react-virtualized'
import { VscEdit } from 'react-icons/vsc'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { useShallow } from 'zustand/react/shallow'
import * as l10n from '@vscode/l10n'
import { get, isNumber, toNumber } from 'lodash'

import { InlineEditor, PopoverDelete, VirtualTable } from 'uiSrc/components'
import {
  getColumnWidth,
  getMatchType,
  sendEventTelemetry,
  TelemetryEvent,
  bufferToString,
  createDeleteFieldHeader,
  createDeleteFieldMessage,
  formatLongName,
  formattingBuffer,
  isEqualBuffers,
  validateScoreNumber,
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
  TEXT_FAILED_CONVENT_FORMATTER,
  SCAN_COUNT_DEFAULT,
  helpTexts,
  NoResultsFoundText,
  SortOrder,
  DEFAULT_SEARCH_MATCH,
} from 'uiSrc/constants'
import { Nullable, RedisString } from 'uiSrc/interfaces'
import { useContextApi, useContextInContext, useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'

import {
  deleteZSetMembers,
  fetchZSetMembers,
  fetchZSetMoreMembers,
  updateZSetMembersAction,
  useZSetStore,
} from '../hooks/useZSetStore'
import { AddMembersToZSetDto, ZSetMember, ZSetScanResponse } from '../hooks/interface'
import styles from './styles.module.scss'

const suffix = '_zset'
const headerHeight = 60
const rowHeight = 43

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: rowHeight,
})

interface IZsetMember extends ZSetMember {
  editing: boolean
}

export interface Props {
  isFooterOpen: boolean
  onRemoveKey?: () => void
}

const ZSetDetailsTable = (props: Props) => {
  const { isFooterOpen, onRemoveKey } = props

  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)

  const { viewFormatProp, length, key, setRefreshDisabled } = useSelectedKeyStore(useShallow((state) => ({
    viewFormatProp: state.viewFormat,
    length: state.data?.length,
    key: state.data?.name,
    setRefreshDisabled: state.setSelectedKeyRefreshDisabled,
  })))

  const { loading, searching, loadedMembers, updateLoading, total, nextCursor, resetMembers } = useZSetStore(useShallow((state) => ({
    loading: state.loading,
    searching: state.searching,
    total: state.data.total,
    nextCursor: state.data.nextCursor,
    loadedMembers: state.data.members || [],
    updateLoading: state.updateValue.loading,
    resetMembers: state.resetZSetMembersStore,
  })))

  const { [KeyTypes.ZSet]: ZSetSizes } = useContextInContext((state) => state.browser.keyDetailsSizes)

  const [match, setMatch] = useState<string>('')
  const [deleting, setDeleting] = useState('')
  const [members, setMembers] = useState<IZsetMember[]>([])
  const [sortedColumnName, setSortedColumnName] = useState('score')
  const [width, setWidth] = useState(100)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [viewFormat, setViewFormat] = useState(viewFormatProp)
  const [sortedColumnOrder, setSortedColumnOrder] = useState(SortOrder.ASC)
  const [editingIndex, setEditingIndex] = useState<Nullable<number>>(null)

  const contextApi = useContextApi()

  const formattedLastIndexRef = useRef(OVER_RENDER_BUFFER_COUNT)

  useEffect(() => {
    const newMembers = loadedMembers.map((item) => ({
      ...item,
      editing: false,
    }))

    setMembers(newMembers)

    if (loadedMembers.length < members.length) {
      formattedLastIndexRef.current = 0
    }

    if (viewFormat !== viewFormatProp) {
      setExpandedRows([])
      setViewFormat(viewFormatProp)
      setEditingIndex(null)
      setRefreshDisabled(false)

      cellCache.clearAll()
      setTimeout(() => {
        cellCache.clearAll()
      }, 0)
    }
  }, [loadedMembers, viewFormatProp])

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((member = '') => {
    setDeleting(`${member + suffix}`)
  }, [])

  const onSuccessRemoved = (newTotal: number) => {
    newTotal === 0 && onRemoveKey?.()
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVED,
      eventData: {
        databaseId,
        keyType: KeyTypes.ZSet,
        numberOfRemoved: 1,
      },
    })
  }

  const handleDeleteMember = (member: RedisString | string = '') => {
    deleteZSetMembers(key, [member], onSuccessRemoved)
    closePopover()
  }

  const handleEditMember = (rowIndex: Nullable<number> = null, name: RedisString, editing: boolean) => {
    setEditingIndex(editing ? rowIndex : null)
    setRefreshDisabled(editing)
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_EDITED,
      eventData: {
        databaseId,
        keyType: KeyTypes.ZSet,
      },
    })
    const newMemberState = members.map((item) => {
      if (isEqualBuffers(item.name, name)) {
        return { ...item, editing }
      }
      return item
    })
    setMembers(newMemberState)
    cellCache.clearAll()
  }

  const handleApplyEditScore = (rowIndex: number, name: RedisString, score: string = '') => {
    const data: AddMembersToZSetDto = {
      keyName: key!,
      members: [{
        name,
        score: toNumber(score),
      }],
    }
    updateZSetMembersAction(
      data,
      () => handleEditMember(rowIndex, name, false),
    )
  }

  const handleRemoveIconClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVE_CLICKED,
      eventData: {
        databaseId,
        keyType: KeyTypes.ZSet,
      },
    })
  }

  const handleSearch = (search: IColumnSearchState[]) => {
    const fieldColumn = search.find((column) => column.id === 'name')

    if (!fieldColumn) { return }

    const { value: match } = fieldColumn
    const onSuccess = (data: ZSetScanResponse) => {
      resetExpandedCache()
      if (match === '') {
        return
      }
      const matchValue = getMatchType(match)
      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_KEY_VALUE_FILTERED,
        eventData: {
          databaseId,
          keyType: KeyTypes.ZSet,
          match: matchValue,
          length: data.total,
        },
      })
    }
    setMatch(match)
    fetchZSetMembers(
      key!,
      0,
      SCAN_COUNT_DEFAULT,
      sortedColumnOrder,
      match || DEFAULT_SEARCH_MATCH,
      onSuccess,
    )
  }

  const handleRowToggleViewClick = (expanded: boolean, rowIndex: number) => {
    const treeViewEvent = expanded
      ? TelemetryEvent.TREE_VIEW_KEY_FIELD_VALUE_EXPANDED
      : TelemetryEvent.TREE_VIEW_KEY_FIELD_VALUE_COLLAPSED

    sendEventTelemetry({
      event: treeViewEvent,
      eventData: {
        keyType: KeyTypes.ZSet,
        databaseId,
        largestCellLength: get(members, `[${rowIndex}].name.length`, 0),
      },
    })

    cellCache.clearAll()
  }

  const onColResizeEnd = (sizes: RelativeWidthSizes) => {
    contextApi.updateKeyDetailsSizes({
      type: KeyTypes.ZSet,
      sizes,
    })
  }

  const columns:ITableColumn[] = [
    {
      id: 'name',
      label: 'Member',
      isSearchable: true,
      prependSearchName: 'Member:',
      initialSearchValue: '',
      truncateText: true,
      isResizable: true,
      minWidth: 140,
      relativeWidth: ZSetSizes?.name || 60,
      alignment: TableCellAlignment.Left,
      className: 'value-table-separate-border',
      headerClassName: 'value-table-separate-border',
      render: function Name(_name: string, { name: nameItem }: IZsetMember, expanded?: boolean) {
        // const { value: decompressedNameItem } = decompressingBuffer(nameItem, compressor)
        const decompressedNameItem = nameItem
        const name = bufferToString(nameItem)
        // const tooltipContent = formatLongName(name)
        const { value, isValid } = formattingBuffer(decompressedNameItem, viewFormat, { expanded })
        const cellContent = (value as string)?.substring?.(0, 200) ?? value
        const tooltipContent = `${isValid ? l10n.t('Member') : TEXT_FAILED_CONVENT_FORMATTER(viewFormatProp)}\n${formatLongName(name)}`

        return (
          <div className="max-w-full whitespace-break-spaces">
            <div
              className="flex"
              data-testid={`zset-member-value-${name}`}
            >
              {!expanded && (
                <div
                  title={tooltipContent}
                  className={cx(styles.tooltip, 'truncate')}
                >
                  {cellContent}
                </div>
              )}
              {expanded && value}
            </div>
          </div>
        )
      },
    },
    {
      id: 'score',
      label: 'Score',
      minWidth: 100,
      isSortable: true,
      truncateText: true,
      render: function Score(
        _name: string,
        { name: nameItem, score }: IZsetMember,
        expanded?: boolean,
        rowIndex = 0,
      ) {
        const cellContent = score.toString().substring(0, 200)
        const tooltipContent = formatLongName(score.toString())

        if (rowIndex === editingIndex) {
          return (
            <div className="key-details-edit">
              <StopPropagation>
                <InlineEditor
                  expandable
                  autoSelect
                  autoFocus
                  declineOnUnmount={false}
                  initialValue={score.toString()}
                  placeholder={l10n.t('Enter Score')}
                  fieldName="score"
                  onDecline={() => handleEditMember(rowIndex, nameItem, false)}
                  onApply={(value) => handleApplyEditScore(rowIndex, nameItem, value)}
                  validation={validateScoreNumber}
                />
              </StopPropagation>
            </div>
          )
        }
        return (
          <div className="max-w-full whitespace-break-spaces">
            <div
              className="flex"
              data-testid={`zset-score-value-${score}`}
            >
              {!expanded && (
                <div
                  title={`Score\n${tooltipContent}`}
                  className={cx(styles.tooltip, 'truncate')}
                >
                  {cellContent}
                </div>
              )}
              {expanded && score}
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
      minWidth: 85,
      maxWidth: 85,
      absoluteWidth: 85,
      render: function Actions(_act: any, { name: nameItem, score }: IZsetMember, _, rowIndex = 0) {
        const name = bufferToString(nameItem, viewFormat)
        if (rowIndex === editingIndex) {
          return null
        }
        return (
          <StopPropagation>
            <div className="value-table-actions">
              <VSCodeButton
                appearance="icon"
                disabled={updateLoading || !isNumber(score)}
                className="editFieldBtn"
                onClick={() => handleEditMember(rowIndex, nameItem, true)}
                data-testid={`zset-edit-button-${name}`}
                aria-label="Edit field"
                title={!isNumber(score) ? l10n.t('Use CLI to edit the score') : ''}
              >
                <VscEdit />
              </VSCodeButton>
              <PopoverDelete
                header={createDeleteFieldHeader(nameItem)}
                text={createDeleteFieldMessage(key ?? '')}
                item={name}
                itemRaw={nameItem}
                suffix={suffix}
                deleting={deleting}
                closePopover={closePopover}
                updateLoading={false}
                showPopover={showPopover}
                handleDeleteItem={handleDeleteMember}
                handleButtonClick={handleRemoveIconClick}
                testid={`zset-remove-button-${name}`}
                appendInfo={length === 1 ? helpTexts.REMOVE_LAST_ELEMENT(l10n.t('Member')) : null}
              />
            </div>
          </StopPropagation>
        )
      },
    },
  ]

  const onChangeSorting = (column: any, order: SortOrder) => {
    setSortedColumnName(column)
    setSortedColumnOrder(order)
    resetMembers()

    fetchZSetMembers(key!, 0, SCAN_COUNT_DEFAULT, order, match || DEFAULT_SEARCH_MATCH, resetExpandedCache)
  }

  const resetExpandedCache = () => {
    setTimeout(() => {
      setExpandedRows([])
      cellCache.clearAll()
    }, 0)
  }

  const loadMoreItems = ({ startIndex, stopIndex }: any) => {
    if (nextCursor !== 0) {
      fetchZSetMoreMembers(
        key!,
        startIndex,
        nextCursor || stopIndex - startIndex + 1,
        sortedColumnOrder,
        match || DEFAULT_SEARCH_MATCH,
      )
    }
  }

  const sortedColumn = {
    column: sortedColumnName,
    order: sortedColumnOrder,
  }

  return (
    <>
      <div
        data-testid="zset-details"
        className={cx(
          'key-details-table',
          'hash-fields-container',
          styles.container,
          { footerOpened: isFooterOpen },
        )}
      >
        {loading && (
          <span />
        )}
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
          searching={searching}
          items={members}
          sortedColumn={sortedColumn}
          onChangeSorting={onChangeSorting}
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

export { ZSetDetailsTable }
