import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { toNumber } from 'lodash'

import {
  TelemetryEvent,
  addNewItem,
  handleItemChange,
  isNaNConvertedString,
  removeItem,
  sendEventTelemetry,
  setEmptyItemById,
  stringToBuffer,
  validateScoreNumber,
} from 'uiSrc/utils'
import { AddZsetFormConfig as config, KeyTypes } from 'uiSrc/constants'
import { INITIAL_ZSET_MEMBER_STATE, IZsetMemberState } from 'uiSrc/modules/add-key'
import { useDatabasesStore, useSelectedKeyStore } from 'uiSrc/store'
import { AddItemsActions } from 'uiSrc/components'
import { InputText } from 'uiSrc/ui'
import { addZSetMembersAction, useZSetStore } from '../hooks/useZSetStore'

export interface Props {
  closePanel: (isCancelled?: boolean) => void
}

const AddZSetMembers = (props: Props) => {
  const { closePanel } = props
  const loading = useZSetStore((state) => state.loading)
  const selectedKey = useSelectedKeyStore((state) => state.data?.name ?? '')
  const databaseId = useDatabasesStore((state) => state.connectedDatabase?.id)

  const lastAddedMemberName = useRef<HTMLInputElement>(null)
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [members, setMembers] = useState<IZsetMemberState[]>([{ ...INITIAL_ZSET_MEMBER_STATE }])

  useEffect(() => {
    lastAddedMemberName.current?.focus()
  }, [members.length])

  useEffect(() => {
    members.every((member) => {
      if (!member.score?.toString().length) {
        setIsFormValid(false)
        return false
      }

      if (!isNaNConvertedString(member.score)) {
        setIsFormValid(true)
        return true
      }

      setIsFormValid(false)
      return false
    })
  }, [members])

  const validateScore = (value: any) => {
    const validatedValue = validateScoreNumber(value)
    return validatedValue.toString().length ? validatedValue : ''
  }

  const onSuccessAdded = () => {
    closePanel()
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_VALUE_ADDED,
      eventData: {
        databaseId,
        keyType: KeyTypes.ZSet,
        numberOfAdded: members.length,
      },
    })
  }

  const submitData = (): void => {
    const data = {
      keyName: selectedKey,
      members: members.map((item) => ({
        name: stringToBuffer(item.name),
        score: toNumber(item.score),
      })),
    }
    addZSetMembersAction(data, onSuccessAdded)
  }

  const isClearDisabled = (item: IZsetMemberState): boolean => members.length === 1 && !item.name.length

  return (
    <>
      <div className="key-footer-items-container" data-testid="add-zset-field-panel">
        {members.map((item, index) => (
          <div key={item.id}>
            <div className="flex items-center mb-3">
              <div className="flex grow">
                <div className="w-1/2 mr-2">
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
                <div className="w-1/2 mr-2">
                  <InputText
                    name={`score-${item.id}`}
                    id={`score-${item.id}`}
                    placeholder={config.score.placeholder}
                    value={item.score}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setMembers(handleItemChange(members, 'score', item.id, validateScore(e.target.value)))}
                    inputRef={index === members.length - 1 ? lastAddedMemberName : null}
                    disabled={loading}
                    data-testid="member-score"
                  />
                </div>
                <AddItemsActions
                  id={item.id}
                  index={index}
                  length={members.length}
                  disabled={loading}
                  removeItem={(id) => setMembers(removeItem(members, id))}
                  addItem={() => setMembers(addNewItem(members, INITIAL_ZSET_MEMBER_STATE))}
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
            onClick={() => closePanel(true)}
            className="mr-3"
            data-testid="cancel-members-btn"
          >
            {l10n.t('Cancel')}
          </VSCodeButton>
          <VSCodeButton
            appearance="primary"
            onClick={submitData}
            disabled={loading || !isFormValid}
            data-testid="save-members-btn"
          >
            {l10n.t('Save')}
          </VSCodeButton>
        </div>
      </div>
    </>
  )
}

export { AddZSetMembers }
