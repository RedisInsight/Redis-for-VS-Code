import React, { useState } from 'react'
import cx from 'classnames'

import { KeyTypes } from 'uiSrc/constants'
import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/modules'
import { HashDetailsTable } from './hash-details-table'
// import { AddHashFields } from './add-hash-fields'
import { AddItemsAction } from '../key-details-actions'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const HashDetails = (props: Props) => {
  const keyType = KeyTypes.Hash
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
    <AddItemsAction title="Add Fields" openAddItemPanel={openAddItemPanel} />
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
          <HashDetailsTable isFooterOpen={isAddItemPanelOpen} onRemoveKey={onRemoveKey} />
        </div>
        {isAddItemPanelOpen && (
          <div className={cx('formFooterBar', 'contentActive')}>
            {/* <AddHashFields onCancel={closeAddItemPanel} /> */}
          </div>
        )}
      </div>
    </div>
  )
}

export { HashDetails }
