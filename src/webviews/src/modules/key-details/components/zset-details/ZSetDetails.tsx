import React, { useState } from 'react'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'

import { KeyTypes } from 'uiSrc/constants'
import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/modules'
import { useSelectedKeyStore } from 'uiSrc/store'
import { ZSetDetailsTable } from './zset-details-table'
import { AddZSetMembers } from './add-zset-members'
import { AddItemsAction } from '../key-details-actions'

export interface Props extends KeyDetailsHeaderProps {
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: (isCancelled: boolean) => void
}

const ZSetDetails = (props: Props) => {
  const keyType = KeyTypes.ZSet
  const { onRemoveKey, onOpenAddItemPanel, onCloseAddItemPanel } = props

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)
  const loading = useSelectedKeyStore((state) => state.loading)

  const openAddItemPanel = () => {
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }

  const closeAddItemPanel = (isCancelled = false) => {
    setIsAddItemPanelOpen(false)
    onCloseAddItemPanel(isCancelled)
  }

  const Actions = () => (
    <AddItemsAction title={l10n.t('Add Members')} openAddItemPanel={openAddItemPanel} />
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
        {!loading && (
          <div className="flex flex-1 h-full">
            <ZSetDetailsTable isFooterOpen={isAddItemPanelOpen} onRemoveKey={onRemoveKey} />
          </div>
        )}
        {isAddItemPanelOpen && (
          <div className={cx('formFooterBar', 'contentActive')}>
            <AddZSetMembers closePanel={closeAddItemPanel} />
          </div>
        )}
      </div>
    </div>

  )
}

export { ZSetDetails }
