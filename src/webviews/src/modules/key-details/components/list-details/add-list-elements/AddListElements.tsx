import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'

import {
  HEAD_DESTINATION,
  KeyTypes,
  ListElementDestination,
  TAIL_DESTINATION,
  AddListFormConfig as config,
} from 'uiSrc/constants'
import { TelemetryEvent, sendEventTelemetry, stringToBuffer } from 'uiSrc/utils'

import { useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { InputText, Select, SelectOption } from 'uiSrc/ui'
import { PushElementToListDto } from '../hooks/interface'
import { insertListElementsAction, useListStore } from '../hooks/useListStore'
import styles from '../styles.module.scss'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
}

const optionsDestinations: SelectOption[] = [
  {
    value: TAIL_DESTINATION,
    label: l10n.t('Push to tail'),
    testid: TAIL_DESTINATION,
  },
  {
    value: HEAD_DESTINATION,
    label: l10n.t('Push to head'),
    testid: HEAD_DESTINATION,
  },
]

const AddListElements = (props: Props) => {
  const { closePanel } = props

  const [element, setElement] = useState<string>('')
  const [destination, setDestination] = useState<ListElementDestination>(TAIL_DESTINATION)
  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)

  const selectedKey = useSelectedKeyStore((state) => state.data?.name)
  const loading = useListStore((state) => state.loading)

  const elementInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // ComponentDidMount
    elementInput.current?.focus()
  }, [])

  const onSuccessAdded = () => {
    closePanel()
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_ADDED,
      eventData: {
        databaseId,
        keyType: KeyTypes.List,
        numberOfAdded: 1,
      },
    })
  }

  const submitData = (): void => {
    const data: PushElementToListDto = {
      keyName: selectedKey!,
      element: stringToBuffer(element),
      destination,
    }
    insertListElementsAction(data, onSuccessAdded)
  }

  return (
    <>
      <div className="key-footer-items-container">
        <div className="flex items-center mb-3">
          <div className="flex grow">
            <div className="w-1/3 mr-2">
              <Select
                position="below"
                options={optionsDestinations}
                containerClassName={styles.select}
                itemClassName={styles.selectOption}
                idSelected={destination}
                onChange={(value) => setDestination(value as ListElementDestination)}
                data-testid="destination-select"
              />
            </div>
            <div className="w-2/3">
              <InputText
                name={config.element.name}
                id={config.element.name}
                placeholder={config.element.placeholder}
                value={element}
                autoComplete="off"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setElement(e.target.value)}
                data-testid="elements-input"
                inputRef={elementInput}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="pr-4 pb-4">
        <div className="flex justify-end">
          <VSCodeButton
            appearance="secondary"
            onClick={() => closePanel(true)}
            className="mr-3"
            data-testid="cancel-members-btn"
          >
            {l10n.t('Cancel')}
          </VSCodeButton>
          <VSCodeButton
            appearance="primary"
            onClick={submitData}
            disabled={loading}
            data-testid="save-elements-btn"
          >
            {l10n.t('Save')}
          </VSCodeButton>
        </div>
      </div>
    </>
  )
}

export { AddListElements }
