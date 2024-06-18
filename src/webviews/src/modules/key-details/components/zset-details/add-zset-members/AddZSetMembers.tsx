import React, { ChangeEvent, FocusEvent, ReactElement, ReactNode, useEffect, useRef, useState } from 'react'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { toNumber } from 'lodash'
import Popup from 'reactjs-popup'
import cx from 'classnames'

import {
  addNewItem,
  handleItemChange,
  isNaNConvertedString,
  removeItem,
  setEmptyItemById,
  stringToBuffer,
  validateScoreNumber,
} from 'uiSrc/utils'
import { AddZsetFormConfig as config } from 'uiSrc/constants'
import { INITIAL_ZSET_MEMBER_STATE, IZsetMemberState } from 'uiSrc/modules/add-key'
import { useSelectedKeyStore } from 'uiSrc/store'
import { AddItemsActions } from 'uiSrc/components'
import { InputText } from 'uiSrc/ui'
import { useZSetStore } from '../hooks/useZSetStore'
import { AddMembersToZSetDto } from '../hooks/interface'

const SAVE_MEMBERS_TEST_ID = 'save-members-btn'

export interface Props {
  hideCancel?: boolean
  autoFocus?: boolean
  disabled?: boolean
  disabledSubmitText?: ReactNode
  submitText?: string
  containerClassName?: string
  closePanel?: (isCancelled?: boolean) => void
  onSubmitData: (data: AddMembersToZSetDto, onSuccess?: (data: AddMembersToZSetDto) => void) => void
}

const AddZSetMembers = (props: Props) => {
  const {
    hideCancel,
    disabled,
    disabledSubmitText,
    submitText,
    autoFocus = true,
    containerClassName = '',
    closePanel,
    onSubmitData,
  } = props
  const loading = useZSetStore((state) => state.loading)
  const selectedKey = useSelectedKeyStore((state) => state.data?.name ?? '')

  const lastAddedMemberName = useRef<HTMLInputElement>(null)
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const [members, setMembers] = useState<IZsetMemberState[]>([{ ...INITIAL_ZSET_MEMBER_STATE }])

  useEffect(() => {
    if (autoFocus || members.length > 1) {
      lastAddedMemberName.current?.focus()
    }
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

  const submitData = (): void => {
    const data = {
      keyName: selectedKey,
      members: members.map((item) => ({
        name: stringToBuffer(item.name),
        score: toNumber(item.score),
      })),
    }
    onSubmitData(data)
  }

  const handleScoreBlur = (item: IZsetMemberState) => {
    const { score } = item
    const newState = members.map((currentItem) => {
      if (currentItem.id !== item.id) {
        return currentItem
      }
      if (isNaNConvertedString(score)) {
        return {
          ...currentItem,
          score: '',
        }
      }
      if (score.length) {
        return {
          ...currentItem,
          score: toNumber(score).toString(),
        }
      }
      return currentItem
    })
    setMembers(newState)
  }

  const isClearDisabled = (item: IZsetMemberState): boolean =>
    members.length === 1 && !(item.name.length || item.score.length)

  const SubmitBtn: ReactElement = (
    <VSCodeButton
      appearance="primary"
      onClick={submitData}
      disabled={!!disabledSubmitText || !isFormValid || !!disabled}
      data-testid={SAVE_MEMBERS_TEST_ID}
    >
      {submitText || l10n.t('Save')}
    </VSCodeButton>
  )

  return (
    <>
      <div className={cx('key-footer-items-container', containerClassName)} data-testid="add-zset-field-panel">
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
                    data-testid={`member-name-${index}`}
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
                    onBlur={(e: FocusEvent<HTMLInputElement, HTMLButtonElement>) => {
                      handleScoreBlur(item)
                    }}
                    disabled={loading}
                    data-testid={`member-score-${index}`}
                  />
                </div>
                <AddItemsActions
                  id={item.id}
                  index={index}
                  length={members.length}
                  disabled={loading}
                  removeItem={(id) => setMembers(removeItem(members, id))}
                  addItem={() => setMembers(addNewItem(members, INITIAL_ZSET_MEMBER_STATE))}
                  addItemIsDisabled={members.some((item) => !item.score.length)}
                  clearIsDisabled={isClearDisabled(item)}
                  clearItemValues={(id) =>
                    setMembers(setEmptyItemById(members, id, {
                      ...item,
                      name: '',
                      score: '',
                    }))}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pr-4 pb-4">
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
          {!disabledSubmitText && SubmitBtn}
        </div>
      </div>
    </>
  )
}

export { AddZSetMembers }
