import React, { useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'
import Popup from 'reactjs-popup'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscFilter } from 'react-icons/vsc'
import { PopupActions } from 'reactjs-popup/dist/types'
import { useShallow } from 'zustand/react/shallow'

import { InputText, Select, SelectOption } from 'uiSrc/ui'
import { DEFAULT_SEARCH_MATCH, KeyTypes, Keys, StorageItem } from 'uiSrc/constants'
import { sessionStorageService } from 'uiSrc/services'
import { ALL_KEY_TYPES_VALUE, FILTER_KEY_TYPE_OPTIONS } from './constants'
import { useKeysApi, useKeysInContext } from '../../hooks/useKeys'
import styles from './styles.module.scss'

export interface Props {
  loading: boolean
}
const sortOptions: SelectOption[] = FILTER_KEY_TYPE_OPTIONS

export const KeyTreeFilter = () => {
  const { filter, isSearched, isFiltered, searchInit, dbId, dbIndex, setFilterAndSearch } = useKeysInContext(useShallow((state) => ({
    isSearched: state.isSearched,
    isFiltered: state.isFiltered,
    dbId: state.databaseId,
    dbIndex: state.databaseIndex,
    filter: state.filter || ALL_KEY_TYPES_VALUE,
    searchInit: state.search === DEFAULT_SEARCH_MATCH ? '' : state.search,
    setFilterAndSearch: state.setFilterAndSearch,
  })))

  const [typeSelected, setTypeSelected] = useState<string>(filter)
  const [search, setSearch] = useState<string>(searchInit)
  const popupRef = useRef<PopupActions>(null)

  const { fetchPatternKeysAction } = useKeysApi()

  useEffect(() => {
    const settings = sessionStorageService.get(`${StorageItem.keysTreeFilter + dbId + dbIndex}`)

    if (settings) {
      setSearch(settings.search)
      onChangeType(settings.filter)

      handleApply(settings.filter, settings.search)
    }
  }, [])

  const closePopover = () => {
    popupRef.current?.close?.()
  }

  const handleCancel = () => {
    closePopover()
    setTypeSelected(filter)
    setSearch(searchInit)
  }

  const handleApply = (filterInit: string = typeSelected, searchInit: string = search) => {
    const filter = filterInit === ALL_KEY_TYPES_VALUE ? null : filterInit

    sessionStorageService.set(
      `${StorageItem.keysTreeFilter + dbId + dbIndex}`,
      { filter, search: searchInit },
    )

    setFilterAndSearch(filter as KeyTypes, searchInit)
    fetchPatternKeysAction()
    closePopover()
  }

  const onChangeType = (value: string) => {
    setTypeSelected(value)
  }

  const handleClear = () => {
    setTypeSelected(ALL_KEY_TYPES_VALUE)
    setSearch('')

    sessionStorageService.set(
      `${StorageItem.keysTreeFilter + dbId + dbIndex}`,
      undefined,
    )

    setFilterAndSearch(null, '')
    fetchPatternKeysAction()
    closePopover()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key.toLowerCase() === Keys.ENTER) {
      handleApply()
    }
  }

  return (
    <Popup
      ref={popupRef}
      closeOnEscape
      closeOnDocumentClick
      repositionOnResize
      keepTooltipInside={false}
      className="key-tree-filter-popup"
      position="bottom center"
      trigger={() => (
        <VSCodeButton
          appearance="icon"
          className={cx(styles.trigger, { 'text-primary': isSearched || isFiltered })}
          aria-label="trigger for filter popover"
          data-testid="key-tree-filter-trigger"
        >
          <VscFilter />
        </VSCodeButton>
      )}
    >
      <div className="flex flex-col text-vscode-icon-foreground">
        <div className={styles.row}>
          <span className={styles.title}>{l10n.t('Filters')}</span>
          <VSCodeButton
            data-testid="key-tree-filter-clear-btn"
            className={cx('empty-btn', 'ml-auto', styles.clearBtn)}
            onClick={handleClear}
          >
            {l10n.t('Clear')}
          </VSCodeButton>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>{l10n.t('Filter')}</div>
          <InputText
            placeholder={l10n.t('by key name or pattern')}
            value={search}
            onKeyDown={onKeyDown}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="tree view search input"
            data-testid="tree-view-search-input"
          />
        </div>
        <div className={styles.row}>
          <div className={styles.label}>
            {l10n.t('Key type')}
          </div>
          <Select
            options={sortOptions}
            idSelected={typeSelected}
            containerClassName="min-w-1 w-full"
            onChange={onChangeType}
            testid="tree-view-filter-select"
          />
        </div>
        <div className={styles.row}>
          <div className={styles.footer}>
            <VSCodeButton
              appearance="secondary"
              data-testid="key-tree-filter-cancel-btn"
              onClick={handleCancel}
            >
              {l10n.t('Cancel')}
            </VSCodeButton>
            <VSCodeButton
              appearance="primary"
              data-testid="key-tree-filter-apply-btn"
              onClick={() => handleApply()}
            >
              {l10n.t('Save')}
            </VSCodeButton>
          </div>
        </div>
      </div>
    </Popup>
  )
}
