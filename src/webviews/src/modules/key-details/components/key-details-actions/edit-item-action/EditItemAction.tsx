import React from 'react'
import cx from 'classnames'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscEdit } from 'react-icons/vsc'
import { Tooltip } from 'uiSrc/ui'
import styles from '../styles.module.scss'

export interface Props {
  title: string
  isEditable: boolean
  onEditItem: () => void
}

const EditItemAction = ({ title, isEditable, onEditItem }: Props) => (
  <Tooltip content={title}>
    <VSCodeButton
      appearance="icon"
      disabled={!isEditable}
      className={cx(styles.actionBtn)}
      onClick={onEditItem}
      aria-label={title}
      data-testid="edit-key-value-btn"
    >
      <VscEdit />
    </VSCodeButton>
  </Tooltip>
)

export { EditItemAction }
