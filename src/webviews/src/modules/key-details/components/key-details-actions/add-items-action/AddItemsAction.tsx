import React from 'react'
import cx from 'classnames'
import { VscDiffAdded } from 'react-icons/vsc'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'

import styles from '../styles.module.scss'

export interface Props {
  title: string
  openAddItemPanel: () => void
}

const AddItemsAction = ({ title, openAddItemPanel }: Props) => (
  <VSCodeButton
    appearance="icon"
    className={cx(styles.actionBtn, 'mt-[3px]')}
    onClick={openAddItemPanel}
    aria-label={title}
    title={title}
  >
    <VscDiffAdded data-testid="add-key-value-items-btn" />
  </VSCodeButton>
)

export { AddItemsAction }
