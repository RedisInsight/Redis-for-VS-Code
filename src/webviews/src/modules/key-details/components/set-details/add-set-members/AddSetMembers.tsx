import React, { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react'
import * as l10n from '@vscode/l10n'
import cx from 'classnames'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import Popup from 'reactjs-popup'

import {
  addNewItem,
  handleItemChange,
  removeItem,
  setEmptyItemById,
  stringToBuffer,
} from 'uiSrc/utils'
import { AddSetFormConfig as config } from 'uiSrc/constants'
import { INITIAL_SET_MEMBER_STATE, ISetMemberState } from 'uiSrc/modules/add-key'
import { useSelectedKeyStore } from 'uiSrc/store'
import { AddItemsActions } from 'uiSrc/components'
import { InputText } from 'uiSrc/ui'
import { AddMembersToSetDto } from '../hooks/interface'

export interface Props {
  hideCancel?: boolean
  autoFocus?: boolean
  disabled?: boolean
  disabledSubmitText?: ReactNode
  submitText?: string
  containerClassName?: string
  closePanel?: (isCancelled?: boolean) => void
  onSubmitData: (data: AddMembersToSetDto, onSuccess?: (data: AddMembersToSetDto) => void) => void
}

const AddSetMembers = (props: Props) => {
  const {
    hideCancel,
    disabled,
    disabledSubmitText,
    submitText,
    autoFocus = true,
    containerClassName,
    closePanel,
    onSubmitData,
  } = props
  const selectedKey = useSelectedKeyStore((state) => state.data?.name ?? '')

  const lastAddedMemberName = useRef<HTMLInputElement>(null)
  const [members, setMembers] = useState<ISetMemberState[]>([{ ...INITIAL_SET_MEMBER_STATE }])

  useEffect(() => {
    if (autoFocus || members.length > 1) {
      lastAddedMemberName.current?.focus()
    }
  }, [members.length])

  const submitData = (): void => {
    const data = {
      keyName: selectedKey,
      members: members.map((item) => stringToBuffer(item.name)),
    }

    onSubmitData(data)
  }

  const isClearDisabled = (item: ISetMemberState): boolean => members.length === 1 && !item.name.length

  const SubmitBtn = () => (
    <VSCodeButton
      appearance="primary"
      onClick={submitData}
      disabled={!!disabledSubmitText}
      data-testid="save-members-btn"
    >
      {submitText || l10n.t('Save')}
    </VSCodeButton>
  )

  return (
    <>
      <div className={cx('key-footer-items-container', containerClassName)} data-testid="add-set-field-panel">
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
                    disabled={disabled}
                    data-testid={`member-name-${index}`}
                  />
                </div>
                <AddItemsActions
                  id={item.id}
                  index={index}
                  length={members.length}
                  disabled={disabled}
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

      <div className="flex justify-end">
        {!hideCancel && (
          <VSCodeButton
            appearance="secondary"
            onClick={() => closePanel?.(true)}
            className="mr-3"
            data-testid="cancel-members-btn"
          >
            {l10n.t('Cancel')}
          </VSCodeButton>
        )}
        {disabledSubmitText && (
          <Popup
            keepTooltipInside
            on="hover"
            position="top center"
            trigger={SubmitBtn}
          >
            <div className="font-bold pb-1">{disabledSubmitText}</div>
          </Popup>
        )}
        {!disabledSubmitText && <SubmitBtn />}

      </div>
    </>
  )
}

export { AddSetMembers }
