import React, { PropsWithChildren, useState } from 'react'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'

import { CommandsVersions, KeyTypes } from 'uiSrc/constants'
import { KeyDetailsHeader, KeyDetailsHeaderProps } from 'uiSrc/modules'
import { useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { TelemetryEvent, isVersionHigherOrEquals, sendEventTelemetry } from 'uiSrc/utils'
import { Checkbox } from 'uiSrc/ui'
import { HashDetailsTable } from './hash-details-table'
import { AddHashFields } from './add-hash-fields'
import { AddFieldsToHashDto, HashField } from './hooks/interface'
import { updateHashFieldsAction } from './hooks/useHashStore'
import { AddItemsAction } from '../key-details-actions'

export interface Props extends KeyDetailsHeaderProps {
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: (isCancelled: boolean) => void
}

const HashDetails = (props: Props) => {
  const keyType = KeyTypes.Hash
  const { onRemoveKey, onOpenAddItemPanel, onCloseAddItemPanel } = props

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)
  const [showTtl, setShowTtl] = useState<boolean>(true)

  const loading = useSelectedKeyStore((state) => state.loading)

  const { databaseId, databaseVersion } = useDatabasesStore((state) => ({
    databaseId: state.connectedDatabase?.id,
    databaseVersion: state.databaseOverview?.version,
  }))

  const isExpireFieldsAvailable = isVersionHigherOrEquals(databaseVersion, CommandsVersions.HASH_FIELD_TTL.since)

  const openAddItemPanel = () => {
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }

  const closeAddItemPanel = (isCancelled = false) => {
    setIsAddItemPanelOpen(false)
    onCloseAddItemPanel(isCancelled)
  }

  const onSuccessAdded = (fields: HashField[]) => {
    closeAddItemPanel()
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_ADDED,
      eventData: {
        databaseId,
        keyType,
        numberOfAdded: fields.length,
      },
    })
  }

  const addHashFields = (data: AddFieldsToHashDto) => {
    updateHashFieldsAction(data, true, () => onSuccessAdded(data.fields))
  }

  const handleSelectShow = (show: boolean) => {
    setShowTtl(show)

    sendEventTelemetry({
      event: TelemetryEvent.SHOW_HASH_TTL_CLICKED,
      eventData: {
        databaseId,
        action: show ? 'show' : 'hide',
      },
    })
  }

  const Actions = ({ children }: PropsWithChildren) => ([
    isExpireFieldsAvailable && (
      <Checkbox
        checked={showTtl}
        containerClassName="mr-2"
        data-testid="show-ttl-column-checkbox"
        onChange={(e) => handleSelectShow(e.target.checked)}
        labelText={l10n.t('Show TTL per row')}
      />
    ),
    children,
    <AddItemsAction title={l10n.t('Add Fields')} openAddItemPanel={openAddItemPanel} />,
  ])

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
            <HashDetailsTable
              isExpireFieldsAvailable={isExpireFieldsAvailable && showTtl}
              isFooterOpen={isAddItemPanelOpen}
              onRemoveKey={onRemoveKey}
            />
          </div>
        )}
        {isAddItemPanelOpen && (
          <div className={cx('formFooterBar', 'contentActive')}>
            <AddHashFields
              isExpireFieldsAvailable={isExpireFieldsAvailable && showTtl}
              closePanel={closeAddItemPanel}
              onSubmitData={addHashFields}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export { HashDetails }
