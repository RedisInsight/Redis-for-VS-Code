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
import { AddItemsActions } from 'uiSrc/components'
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

  const [elements, setElements] = useState<string[]>([''])
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
        numberOfAdded: elements.length,
      },
    })
  }

  const addElement = () => {
    setElements([...elements, ''])
  }

  const removeElement = (index: number) => {
    setElements(elements.filter((_el, i) => i !== index))
  }

  const clearElement = (index: number) => {
    const newElements = [...elements]
    newElements[index] = ''
    setElements(newElements)
  }

  const handleElementChange = (value: string, index: number) => {
    const newElements = [...elements]
    newElements[index] = value
    setElements(newElements)
  }

  const isClearDisabled = (item:string) => elements.length === 1 && !item.length

  const submitData = (): void => {
    const data: PushElementToListDto = {
      keyName: selectedKey!,
      elements: elements.map((el) => stringToBuffer(el)),
      destination,
    }
    insertListElementsAction(data, onSuccessAdded)
  }

  return (
    <>
      <div className="key-footer-items-container">
        <div className="flex items-center mb-3">
          <div className="flex-column grow">
            <div className="w-1/3 mr-2 mb-3">
              <Select
                position="below"
                options={optionsDestinations}
                containerClassName={styles.select}
                itemClassName={styles.selectOption}
                idSelected={destination}
                onChange={(value) => setDestination(value as ListElementDestination)}
                testid="destination-select"
              />
            </div>
            {elements.map((item, index) => (
              <div key={index}>
                <div className="flex items-center mb-3">
                  <InputText
                    name={`element-${index}`}
                    id={`element-${index}`}
                    placeholder={config.element.placeholder}
                    value={item}
                    disabled={loading}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleElementChange(e.target.value, index)}
                    inputRef={index === elements.length - 1 ? elementInput : null}
                    data-testid={`element-${index}`}
                  />
                  <AddItemsActions
                    id={index}
                    index={index}
                    length={elements.length}
                    addItem={addElement}
                    removeItem={removeElement}
                    clearItemValues={clearElement}
                    clearIsDisabled={isClearDisabled(item)}
                    disabled={loading}
                  />
                </div>
              </div>
            ))}
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
