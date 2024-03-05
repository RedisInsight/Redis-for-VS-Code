import React from 'react'
import cx from 'classnames'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscEdit } from 'react-icons/vsc'
import styles from '../styles.module.scss'

export interface Props {
  title: string
  isEditable: boolean
  onEditItem: () => void
}

const EditItemAction = ({ title, isEditable, onEditItem }: Props) => (
  <VSCodeButton
    appearance="icon"
    disabled={!isEditable}
    className={cx(styles.actionBtn)}
    onClick={onEditItem}
    title={title}
    aria-label={title}
    data-testid="edit-key-value-btn"
  >
    <VscEdit />
  </VSCodeButton>
)

export { EditItemAction }
