import React, { PropsWithChildren, useCallback, useState } from 'react'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'

import { KeyTypes } from 'uiSrc/constants'
import { useSelectedKeyStore } from 'uiSrc/store'
import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/modules/key-details-header'

import { ListDetailsTable } from './list-details-table'
import { AddListElements } from './add-list-elements'
import { RemoveListElements } from './remove-list-elements'
import { AddItemsAction, RemoveItemsAction } from '../key-details-actions'

export interface Props extends KeyDetailsHeaderProps {
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: (isCancelled: boolean) => void
}

const ListDetails = (props: Props) => {
  const keyType = KeyTypes.List
  const { onOpenAddItemPanel, onCloseAddItemPanel, onRemoveKey } = props
  const loading = useSelectedKeyStore((state) => state.loading)

  const [isRemoveItemPanelOpen, setIsRemoveItemPanelOpen] = useState<boolean>(false)
  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)

  const openAddItemPanel = () => {
    setIsRemoveItemPanelOpen(false)
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }

  const closeAddItemPanel = (isCancelled = false) => {
    setIsAddItemPanelOpen(false)
    onCloseAddItemPanel(isCancelled)
  }

  const closeRemoveItemPanel = () => {
    setIsRemoveItemPanelOpen(false)
  }

  const openRemoveItemPanel = () => {
    setIsAddItemPanelOpen(false)
    setIsRemoveItemPanelOpen(true)
  }

  const Actions = useCallback(({ children }: PropsWithChildren) => ([
    children,
    <AddItemsAction key={1} title={l10n.t('Add Elements')} openAddItemPanel={openAddItemPanel} />,
    <RemoveItemsAction key={2} title={l10n.t('Remove Elements')} openRemoveItemPanel={openRemoveItemPanel} />,
  ]), [])

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader
        {...props}
        key="key-details-header"
        keyType={keyType}
        Actions={Actions}
      />
      <div className="key-details-body" key="key-details-body">
        {!loading && (
          <div className="flex flex-1 h-full">
            <ListDetailsTable isFooterOpen={isAddItemPanelOpen || isRemoveItemPanelOpen} />
          </div>
        )}
        {isAddItemPanelOpen && (
          <div className={cx('formFooterBar', 'contentActive')}>
            <AddListElements closePanel={closeAddItemPanel} />
          </div>
        )}
        {isRemoveItemPanelOpen && (
          <div className={cx('formFooterBar', 'contentActive')}>
            <RemoveListElements closePanel={closeRemoveItemPanel} onRemoveKey={onRemoveKey} />
          </div>
        )}
      </div>
    </div>

  )
}

export { ListDetails }
