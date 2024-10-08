import React, { useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'
import { CellMeasurerCache } from 'react-virtualized'
import { useShallow } from 'zustand/react/shallow'

import { RedisResponseBuffer, RedisString } from 'uiSrc/interfaces'
import {
  bufferToString,
  createDeleteFieldHeader,
  createDeleteFieldMessage,
  formattingBuffer,
  sendEventTelemetry,
  TelemetryEvent,
  getMatchType,
  getColumnWidth,
  decompressingBuffer,
} from 'uiSrc/utils'
import {
  KeyTypes,
  helpTexts,
  NoResultsFoundText,
  OVER_RENDER_BUFFER_COUNT,
  SCAN_COUNT_DEFAULT,
  DEFAULT_SEARCH_MATCH,
} from 'uiSrc/constants'
import { PopoverDelete, VirtualTable } from 'uiSrc/components'
import { IColumnSearchState, ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { useContextInContext, useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import {
  deleteSetMembers,
  fetchSetMembers,
  fetchMoreSetMembers,
  useSetStore,
} from '../hooks/useSetStore'
import { GetSetMembersResponse } from '../hooks/interface'
import styles from './styles.module.scss'

const suffix = '_set'
const headerHeight = 60
const rowHeight = 43

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: rowHeight,
})

export interface Props {
  isFooterOpen: boolean
  onRemoveKey?: () => void
}

export const SetDetailsTable = (props: Props) => {
  const { isFooterOpen, onRemoveKey } = props

  const { databaseId, compressor } = useDatabasesStore((state) => ({
    databaseId: state.connectedDatabase?.id,
    compressor: state.connectedDatabase?.compressor ?? null,
  }))

  const viewFormatProp = useContextInContext((state) => state.browser.viewFormat)

  const { length, key } = useSelectedKeyStore(useShallow((state) => ({
    length: state.data?.length,
    key: state.data?.name as RedisString,
  })))

  const { nextCursor, loading, loadedMembers, total } = useSetStore((state) => ({
    loading: state.loading,
    nextCursor: state.data.nextCursor,
    total: state.data.total,
    loadedMembers: state.data?.members || [],
  }))

  const [match, setMatch] = useState(DEFAULT_SEARCH_MATCH)
  const [deleting, setDeleting] = useState('')
  const [width, setWidth] = useState(100)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [members, setMembers] = useState<any[]>(loadedMembers)
  const [viewFormat, setViewFormat] = useState(viewFormatProp)
  const [, forceUpdate] = useState({})

  const formattedLastIndexRef = useRef(OVER_RENDER_BUFFER_COUNT)

  useEffect(() => {
    setMembers(loadedMembers)

    if (loadedMembers.length < members.length) {
      formattedLastIndexRef.current = 0
    }

    if (viewFormat !== viewFormatProp) {
      setExpandedRows([])
      setViewFormat(viewFormatProp)

      clearCache()
    }
  }, [loadedMembers, viewFormatProp])

  const clearCache = () => setTimeout(() => {
    cellCache.clearAll()
    forceUpdate({})
  }, 0)

  const closePopover = () => {
    setDeleting('')
  }

  const showPopover = (member = '') => {
    setDeleting(`${member + suffix}`)
  }

  const onSuccessRemoved = (newTotal: number) => {
    newTotal === 0 && onRemoveKey?.()
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVED,
      eventData: {
        databaseId,
        keyType: KeyTypes.Set,
        numberOfRemoved: 1,
      },
    })
  }

  const handleDeleteMember = (member: string | RedisString = '') => {
    deleteSetMembers(key, [member], onSuccessRemoved)
    closePopover()
  }

  const handleRemoveIconClick = () => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVE_CLICKED,
      eventData: {
        databaseId,
        keyType: KeyTypes.Set,
      },
    })
  }

  const handleSearch = (search: IColumnSearchState[]) => {
    const fieldColumn = search.find((column) => column.id === 'name')
    if (!fieldColumn) { return }

    const { value: match } = fieldColumn
    const onSuccess = (data: GetSetMembersResponse) => {
      const matchValue = getMatchType(match)
      sendEventTelemetry({
        event: TelemetryEvent.TREE_VIEW_KEY_VALUE_FILTERED,
        eventData: {
          databaseId,
          keyType: KeyTypes.Set,
          match: matchValue,
          length: data.total,
        },
      })
    }
    setMatch(match)
    fetchSetMembers(key, 0, SCAN_COUNT_DEFAULT, match || DEFAULT_SEARCH_MATCH, onSuccess)
  }

  const handleRowToggleViewClick = (expanded: boolean, rowIndex: number) => {
    const treeViewEvent = expanded
      ? TelemetryEvent.TREE_VIEW_KEY_FIELD_VALUE_EXPANDED
      : TelemetryEvent.TREE_VIEW_KEY_FIELD_VALUE_COLLAPSED

    sendEventTelemetry({
      event: treeViewEvent,
      eventData: {
        keyType: KeyTypes.Set,
        databaseId,
        largestCellLength: members[rowIndex]?.length || 0,
      },
    })

    cellCache.clearAll()
  }

  const columns: ITableColumn[] = [
    {
      id: 'name',
      label: l10n.t('Member'),
      isSearchable: true,
      initialSearchValue: '',
      truncateText: true,
      className: cx('value-table-separate-border', styles.cellBody),
      headerClassName: cx('value-table-separate-border', styles.cellHeader),
      render: function Name(_name: string, memberItem: RedisString, expanded: boolean = false) {
        const { value: decompressedMemberItem } = decompressingBuffer(memberItem, compressor)
        const member = bufferToString(memberItem || '')
        // Better to cut the long string, because it could affect virtual scroll performance
        const { value } = formattingBuffer(decompressedMemberItem, viewFormatProp, { expanded })
        const cellContent = (value as string)?.substring?.(0, 200) ?? value

        return (
          <div className="max-w-full whitespace-break-spaces">
            <div className="flex" data-testid={`set-member-value-${member}`}>
              {!expanded && (
                <div className={cx('truncate', styles.tooltip)}>
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
      id: 'actions',
      label: '',
      relativeWidth: 60,
      minWidth: 60,
      maxWidth: 60,
      className: styles.actionCell,
      headerClassName: 'hidden',
      render: function Actions(_act: any, memberItem: RedisResponseBuffer) {
        const member = bufferToString(memberItem, viewFormat)
        return (
          <div className="value-table-actions">
            <PopoverDelete
              header={createDeleteFieldHeader(memberItem)}
              text={createDeleteFieldMessage(key ?? '')}
              item={member}
              itemRaw={memberItem}
              suffix={suffix}
              deleting={deleting}
              closePopover={closePopover}
              disabled={false}
              showPopover={showPopover}
              handleDeleteItem={handleDeleteMember}
              handleButtonClick={handleRemoveIconClick}
              testid={`set-remove-button-${member}`}
              appendInfo={length === 1 ? helpTexts.REMOVE_LAST_ELEMENT('Member') : null}
            />
          </div>
        )
      },
    },
  ]

  const loadMoreItems = () => {
    if (nextCursor !== 0) {
      fetchMoreSetMembers(
        key,
        nextCursor,
        SCAN_COUNT_DEFAULT,
        match || DEFAULT_SEARCH_MATCH,
      )
    }
  }

  return (
    <div
      data-testid="set-details"
      className={
        cx(
          'key-details-table',
          'set-members-container',
          styles.container,
          { footerOpened: isFooterOpen },
        )
      }
    >
      <VirtualTable
        hideProgress
        expandable
        autoHeight
        selectable={false}
        keyName={key}
        headerHeight={headerHeight}
        rowHeight={rowHeight}
        footerHeight={0}
        loadMoreItems={loadMoreItems}
        loading={loading}
        items={members}
        totalItemsCount={total}
        noItemsMessage={NoResultsFoundText}
        onWheel={closePopover}
        onSearch={handleSearch}
        columns={columns.map((column, i, arr) => ({
          ...column,
          width: getColumnWidth(i, width, arr),
        }))}
        onChangeWidth={setWidth}
        cellCache={cellCache}
        onRowToggleViewClick={handleRowToggleViewClick}
        expandedRows={expandedRows}
        setExpandedRows={setExpandedRows}
      />
    </div>
  )
}
