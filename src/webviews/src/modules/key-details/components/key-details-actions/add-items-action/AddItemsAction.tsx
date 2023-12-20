import React from 'react'
import cx from 'classnames'
import { VscDiffAdded } from 'react-icons/vsc'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'

import styles from '../styles.module.scss'

export interface Props {
  // width: number
  title: string
  openAddItemPanel: () => void
}

VscDiffAdded

const AddItemsAction = ({ title, openAddItemPanel }: Props) => (
  <div className={cx(styles.actionBtn)}>
    <VSCodeButton
      appearance="icon"
      className="absolute right-0 z-10"
      onClick={openAddItemPanel}
      aria-label={title}
      title={title}
    >
      <VscDiffAdded
        // className={cx(styles.nodeIcon, styles.nodeIconArrow)}
        data-testid="add-key-value-items-btn"
      />
    </VSCodeButton>
  </div>
)

export { AddItemsAction }
