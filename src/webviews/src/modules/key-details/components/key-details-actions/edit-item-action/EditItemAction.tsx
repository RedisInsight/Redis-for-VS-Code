import React from 'react'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscEdit } from 'react-icons/vsc'
import styles from '../styles.module.scss'

export interface Props {
  title: string
  isEditable: boolean
  tooltipContent?: string
  onEditItem: () => void
}

const EditItemAction = ({ title, isEditable, tooltipContent = '', onEditItem }: Props) => (
  <div className={styles.actionBtn}>
    <VSCodeButton
      appearance="icon"
      disabled={!isEditable}
      data-testid="scan-more"
      className="absolute right-0 z-10"
      onClick={onEditItem}
      aria-label={title}
      title={tooltipContent}
    >
      <VscEdit
        // className={cx(styles.nodeIcon, styles.nodeIconArrow)}
        data-testid="edit-key-value-btn"
      />
    </VSCodeButton>
  </div>
)

export { EditItemAction }
