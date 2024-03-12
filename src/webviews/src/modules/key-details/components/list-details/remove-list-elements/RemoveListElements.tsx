import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { toNumber } from 'lodash'
import * as l10n from '@vscode/l10n'
import { useShallow } from 'zustand/react/shallow'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscInfo, VscWarning } from 'react-icons/vsc'
import Popup from 'reactjs-popup'

import {
  CommandsVersions,
  HEAD_DESTINATION,
  KeyTypes,
  ListElementDestination,
  TAIL_DESTINATION,
  AddListFormConfig as config,
  helpTexts,
} from 'uiSrc/constants'
import {
  TelemetryEvent,
  sendEventTelemetry,
  validateCountNumber,
  isVersionHigherOrEquals,
  formatNameShort,
  bufferToString,
} from 'uiSrc/utils'

import { useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { InputText, Select, SelectOption } from 'uiSrc/ui'
import { PopoverDelete } from 'uiSrc/components'
import { deleteListElementsAction } from '../hooks/useListStore'
import { DeleteListElementsDto } from '../hooks/interface'
import styles from '../styles.module.scss'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
  onRemoveKey?: () => void
}

const optionsDestinations: SelectOption[] = [
  {
    value: TAIL_DESTINATION,
    label: l10n.t('Remove from tail'),
    testid: TAIL_DESTINATION,
  },
  {
    value: HEAD_DESTINATION,
    label: l10n.t('Remove from head'),
    testid: HEAD_DESTINATION,
  },
]

const RemoveListElements = (props: Props) => {
  const { closePanel, onRemoveKey } = props

  const { databaseId, databaseVersion } = useDatabasesStore((state) => ({
    databaseId: state.connectedDatabase?.id,
    databaseVersion: state.databaseOverview?.version,
  }))
  const { selectedKey, length } = useSelectedKeyStore(useShallow((state) => ({
    selectedKey: state.data?.name,
    length: state.data?.length,
  })))

  const [count, setCount] = useState<string>('')
  const [destination, setDestination] = useState<ListElementDestination>(TAIL_DESTINATION)
  const [isFormValid, setIsFormValid] = useState<boolean>(true)
  const [canRemoveMultiple, setCanRemoveMultiple] = useState<boolean>(true)

  const countInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // ComponentDidMount
    countInput.current?.focus()
  }, [])

  useEffect(() => {
    setIsFormValid(toNumber(count) > 0)
  }, [count])

  useEffect(() => {
    if (
      !isVersionHigherOrEquals(
        databaseVersion,
        CommandsVersions.REMOVE_MULTIPLE_LIST_ELEMENTS.since,
      )
    ) {
      setCount('1')
      setCanRemoveMultiple(false)
    }
  }, [databaseVersion])

  const handleCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCount(validateCountNumber(e.target.value))
  }

  const showPopover = () => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVE_CLICKED,
      eventData: {
        databaseId,
        keyType: KeyTypes.List,
      },
    })
  }

  const onSuccessRemoved = (newTotal: number) => {
    if (newTotal <= 0) onRemoveKey?.()
    closePanel()
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVED,
      eventData: {
        databaseId,
        keyType: KeyTypes.List,
        numberOfRemoved: toNumber(count),
      },
    })
  }

  const submitData = (): void => {
    const data: DeleteListElementsDto = {
      keyName: selectedKey!,
      count: toNumber(count),
      destination,
    }
    deleteListElementsAction(data, onSuccessRemoved)
  }

  const InfoBoxPopover = () => (
    <Popup
      position="top center"
      on={['hover']}
      trigger={(
        <VSCodeButton
          autoFocus
          appearance="icon"
          className={styles.infoIcon}
          data-testid="info-tooltip-icon"
        >
          <VscInfo />
        </VSCodeButton>
      )}
    >
      <div className={styles.popover}>{helpTexts.REMOVING_MULTIPLE_ELEMENTS_NOT_SUPPORT}</div>
    </Popup>
  )

  return (
    <>
      <div className="key-footer-items-container">
        <div className="flex items-center mb-3">
          <div className="flex grow">
            <div className="w-1/3 mr-2">
              <Select
                options={optionsDestinations}
                containerClassName={styles.select}
                itemClassName={styles.selectOption}
                idSelected={destination}
                onChange={(value) => setDestination(value as ListElementDestination)}
                data-testid="destination-select"
              />
            </div>
            <div className="w-2/3 relative">
              <InputText
                name={config.count.name}
                id={config.count.name}
                maxLength={200}
                placeholder={config.count.placeholder}
                value={count}
                data-testid="count-input"
                autoComplete="off"
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleCountChange(e)}
                inputRef={countInput}
                disabled={!canRemoveMultiple}
                append={!canRemoveMultiple ? InfoBoxPopover() : undefined}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="pr-4 pb-4">
        <div className="flex justify-end">
          <div>
            <VSCodeButton
              appearance="secondary"
              onClick={() => closePanel(true)}
              className="mr-3"
              data-testid="cancel-fields-btn"
            >
              {l10n.t('Cancel')}
            </VSCodeButton>
          </div>
          <div>
            <PopoverDelete
              disabled={!isFormValid}
              header={l10n.t('{0} Element(s)', count)}
              showPopover={showPopover}
              triggerText={l10n.t('Remove')}
              testid="remove-elements-btn"
              handleDeleteItem={submitData}
              text={l10n.t(
                'will be removed from the {0} of {1}',
                destination.toLowerCase(),
                formatNameShort(bufferToString(selectedKey)),
              )}
              appendInfo={(!length || length <= +count) ? (
                <div className={styles.appendInfo}>
                  <VscWarning className="mr-1 mt-1" />
                  <span>{l10n.t('If you remove all Elements, the whole Key will be deleted.')}</span>
                </div>
              ) : null}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export { RemoveListElements }
