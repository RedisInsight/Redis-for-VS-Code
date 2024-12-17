import React, { PropsWithChildren, useCallback, useState } from 'react'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'

import { KeyTypes } from 'uiSrc/constants'
import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/modules'
import { useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/utils'
import { RedisString } from 'uiSrc/interfaces'
import { SetDetailsTable } from './set-details-table'
import { AddSetMembers } from './add-set-members'
import { addSetMembersAction, useSetStore } from './hooks/useSetStore'
import { AddMembersToSetDto } from './hooks/interface'
import { AddItemsAction } from '../key-details-actions'

export interface Props extends KeyDetailsHeaderProps {
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: (isCancelled: boolean) => void
}

export const SetDetails = (props: Props) => {
  const keyType = KeyTypes.Hash
  const { onRemoveKey, onOpenAddItemPanel, onCloseAddItemPanel } = props

  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)
  const loading = useSelectedKeyStore((state) => state.loading)
  const loadingSet = useSetStore((state) => state.loading)

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)

  const openAddItemPanel = () => {
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }

  const closeAddItemPanel = (isCancelled = false) => {
    setIsAddItemPanelOpen(false)
    onCloseAddItemPanel(isCancelled)
  }

  const onSuccessAdded = (members: RedisString[]) => {
    closeAddItemPanel()
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_ADDED,
      eventData: {
        databaseId,
        keyType: KeyTypes.Set,
        numberOfAdded: members.length,
      },
    })
  }

  const addSetMembers = (data: AddMembersToSetDto) => {
    addSetMembersAction(data, () => onSuccessAdded(data.members))
  }

  const Actions = useCallback(({ children }: PropsWithChildren) => ([
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
            <SetDetailsTable isFooterOpen={isAddItemPanelOpen} onRemoveKey={onRemoveKey} />
          </div>
        )}
        {isAddItemPanelOpen && (
          <div className={cx('formFooterBar', 'contentActive')}>
            <AddSetMembers
              disabled={loadingSet}
              closePanel={closeAddItemPanel}
              onSubmitData={addSetMembers}
            />
          </div>
        )}
      </div>
    </div>
  )
}
