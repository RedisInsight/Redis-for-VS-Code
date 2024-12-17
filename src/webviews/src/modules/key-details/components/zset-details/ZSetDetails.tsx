import React, { ReactNode, useCallback, useState } from 'react'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'

import { KeyTypes } from 'uiSrc/constants'
import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/modules'
import { useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/utils'
import { ZSetDetailsTable } from './zset-details-table'
import { AddZSetMembers } from './add-zset-members'
import { AddMembersToZSetDto, ZSetMember } from './hooks/interface'
import { updateZSetMembersAction } from './hooks/useZSetStore'
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

  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)

  const openAddItemPanel = () => {
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }

  const closeAddItemPanel = (isCancelled = false) => {
    setIsAddItemPanelOpen(false)
    onCloseAddItemPanel(isCancelled)
  }

  const onSuccessAdded = (members: ZSetMember[]) => {
    closeAddItemPanel()
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_ADDED,
      eventData: {
        databaseId,
        keyType,
        numberOfAdded: members.length,
      },
    })
  }

  const addZSetMembers = (data: AddMembersToZSetDto) => {
    updateZSetMembersAction(data, true, () => onSuccessAdded(data.members))
  }

  const Actions = useCallback(({ children }: { children: ReactNode }) => ([
    children,
    <AddItemsAction key={1} title={l10n.t('Add Members')} openAddItemPanel={openAddItemPanel} />,
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
            <ZSetDetailsTable isFooterOpen={isAddItemPanelOpen} onRemoveKey={onRemoveKey} />
          </div>
        )}
        {isAddItemPanelOpen && (
          <div className={cx('formFooterBar', 'contentActive')}>
            <AddZSetMembers closePanel={closeAddItemPanel} onSubmitData={addZSetMembers} />
          </div>
        )}
      </div>
    </div>

  )
}

export { ZSetDetails }
