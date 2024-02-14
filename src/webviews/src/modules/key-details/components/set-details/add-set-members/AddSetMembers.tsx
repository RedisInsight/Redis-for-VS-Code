import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'

import {
  TelemetryEvent,
  addNewItem,
  handleItemChange,
  removeItem,
  sendEventTelemetry,
  setEmptyItemById,
  stringToBuffer,
} from 'uiSrc/utils'
import { AddSetFormConfig as config, KeyTypes } from 'uiSrc/constants'
import { INITIAL_SET_MEMBER_STATE, ISetMemberState } from 'uiSrc/modules/add-key'
import { useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { AddItemsActions } from 'uiSrc/components'
import { InputText } from 'uiSrc/ui'
import { addSetMembersAction, useSetStore } from '../hooks/useSetStore'

export interface Props {
  onCancel: (isCancelled?: boolean) => void;
}

const AddSetMembers = (props: Props) => {
  const { onCancel } = props
  const loading = useSetStore((state) => state.loading)
  const selectedKey = useSelectedKeyStore((state) => state.data?.name ?? '')
  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)

  const lastAddedMemberName = useRef<HTMLInputElement>(null)
  const [members, setMembers] = useState<ISetMemberState[]>([{ ...INITIAL_SET_MEMBER_STATE }])

  useEffect(() => {
    lastAddedMemberName.current?.focus()
  }, [members.length])

  const onSuccessAdded = () => {
    onCancel()
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_ADDED,
      eventData: {
        databaseId,
        keyType: KeyTypes.Set,
        numberOfAdded: members.length,
      },
    })
  }

  const submitData = (): void => {
    const data = {
      keyName: selectedKey,
      members: members.map((item) => stringToBuffer(item.name)),
    }

    addSetMembersAction(data, onSuccessAdded)
  }

  const isClearDisabled = (item: ISetMemberState): boolean => members.length === 1 && !item.name.length

  return (
    <>
      <div className="key-add-items-container" data-testid="add-set-field-panel">
        {members.map((item, index) => (
          <div key={item.id}>
            <div className="flex items-center mb-3">
              <div className="flex grow">
                <div className="w-full mr-2">
                  <InputText
                    name={`member-${item.id}`}
                    id={`member-${item.id}`}
                    placeholder={config.member.placeholder}
                    value={item.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setMembers(handleItemChange(members, 'name', item.id, e.target.value))}
                    inputRef={index === members.length - 1 ? lastAddedMemberName : null}
                    disabled={loading}
                    data-testid="member-name"
                  />
                </div>
                <AddItemsActions
                  id={item.id}
                  index={index}
                  length={members.length}
                  loading={loading}
                  removeItem={(id) => setMembers(removeItem(members, id))}
                  addItem={() => setMembers(addNewItem(members, INITIAL_SET_MEMBER_STATE))}
                  clearIsDisabled={isClearDisabled(item)}
                  clearItemValues={(id) =>
                    setMembers(setEmptyItemById(members, id, {
                      ...item,
                      name: '',
                    }))}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pr-4 pb-4">
        <div className="flex justify-end">
          <VSCodeButton
            appearance="secondary"
            onClick={() => onCancel(true)}
            className="mr-3"
            data-testid="cancel-members-btn"
          >
            {l10n.t('Cancel')}
          </VSCodeButton>
          <VSCodeButton
            appearance="primary"
            onClick={submitData}
            disabled={loading}
            data-testid="save-members-btn"
          >
            {l10n.t('Save')}
          </VSCodeButton>
        </div>
      </div>
    </>
  )
}

export { AddSetMembers }
