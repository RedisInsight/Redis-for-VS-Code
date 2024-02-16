import React, { useState } from 'react'
import cx from 'classnames'

import { KeyTypes } from 'uiSrc/constants'

import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/modules/key-details-header'
import { useSelectedKeyStore } from 'uiSrc/store'
import { ListDetailsTable } from './list-details-table'

// import { AddItemsAction, RemoveItemsAction } from '../key-details-actions'
import { AddItemsAction } from '../key-details-actions'
import styles from './styles.module.scss'

export interface Props extends KeyDetailsHeaderProps {
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: (isCancelled: boolean) => void
}

const ListDetails = (props: Props) => {
  const keyType = KeyTypes.List
  const { onOpenAddItemPanel, onCloseAddItemPanel } = props
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

  const Actions = () => (
    <>
      <AddItemsAction title="Add Elements" openAddItemPanel={openAddItemPanel} />
      {/* <RemoveItemsAction title="Remove Elements" openRemoveItemPanel={openRemoveItemPanel} /> */}
    </>
  )

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader
        {...props}
        key="key-details-header"
        keyType={keyType}
        // Actions={Actions}
      />
      <div className="key-details-body" key="key-details-body">
        {!loading && (
          <div className="flex flex-1 h-full">
            <ListDetailsTable isFooterOpen={isAddItemPanelOpen} />
          </div>
        )}
        {isAddItemPanelOpen && (
          <div className={cx('formFooterBar', 'contentActive')}>
            {/* <AddListElements onCancel={closeAddItemPanel} /> */}
          </div>
        )}
        {isRemoveItemPanelOpen && (
          <div className={cx('formFooterBar', styles.contentActive)}>
            {/* <RemoveListElements onCancel={closeRemoveItemPanel} onRemoveKey={onRemoveKey} /> */}
          </div>
        )}
      </div>
    </div>

  )
}

export { ListDetails }
