import React, { useState } from 'react'
import { VscEdit } from 'react-icons/vsc'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'

import { PopoverDelete } from 'uiSrc/components'
import { bufferToString, createDeleteFieldHeader, createDeleteFieldMessage } from 'uiSrc/utils'
import { RedisString } from 'uiSrc/interfaces'
import styles from '../../styles.module.scss'

export interface Props {
  keyName: string
  selectedKey: RedisString
  path: string
  handleSubmitRemoveKey: (path: string, jsonKeyName: string) => void
  onClickEditEntireItem: () => void
  ['data-testid']?: string
}

export const EditItemFieldAction = ({
  keyName,
  selectedKey,
  path,
  handleSubmitRemoveKey,
  onClickEditEntireItem,
  'data-testid': testId = 'edit-json-field',
}: Props) => {
  const [deleting, setDeleting] = useState<string>('')

  return (
    <div className={styles.actionButtons}>
      <VSCodeButton
        appearance="icon"
        className={styles.jsonButtonStyle}
        onClick={onClickEditEntireItem}
        aria-label="Edit field"
        data-testid={testId}
      >
        <VscEdit />
      </VSCodeButton>
      <PopoverDelete
        header={createDeleteFieldHeader(keyName)}
        text={createDeleteFieldMessage(bufferToString(selectedKey))}
        item={keyName}
        deleting={deleting}
        closePopover={() => setDeleting('')}
        showPopover={setDeleting}
        handleDeleteItem={() => handleSubmitRemoveKey(path, keyName)}
        testid="remove-json-field"
      />
    </div>
  )
}
