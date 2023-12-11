import React, { useState } from 'react'
import cx from 'classnames'

import { KeyTypes } from 'uiSrc/constants'
import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/modules'
import { ZSetDetailsTable } from './zset-details-table'
// import AddZsetMembers from './add-zset-members/AddZsetMembers'
import { AddItemsAction } from '../key-details-actions'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const ZSetDetails = (props: Props) => {
  const keyType = KeyTypes.ZSet
  const { onRemoveKey, onOpenAddItemPanel, onCloseAddItemPanel } = props

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)

  const openAddItemPanel = () => {
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }

  const closeAddItemPanel = () => {
    setIsAddItemPanelOpen(false)
    onCloseAddItemPanel()
  }

  const Actions = () => (
    <AddItemsAction title="Add Members" openAddItemPanel={openAddItemPanel} />
  )

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader
        {...props}
        key="key-details-header"
        keyType={keyType}
        Actions={Actions}
      />
      <div className="key-details-body" key="key-details-body">
        <div className="flex flex-1 h-full">
          <ZSetDetailsTable isFooterOpen={isAddItemPanelOpen} onRemoveKey={onRemoveKey} />
        </div>
        {isAddItemPanelOpen && (
          <div className={cx('formFooterBar', 'contentActive')}>
            {/* <AddZsetMembers onCancel={closeAddItemPanel} /> */}
          </div>
        )}
      </div>
    </div>

  )
}

export { ZSetDetails }
