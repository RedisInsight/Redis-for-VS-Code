import React from 'react'
import cx from 'classnames'
import { VscDiffAdded } from 'react-icons/vsc'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'

import { Tooltip } from 'uiSrc/ui'
import styles from '../styles.module.scss'

export interface Props {
  title: string
  openAddItemPanel: () => void
}

const AddItemsAction = ({ title, openAddItemPanel }: Props) => (
  <Tooltip content={title}>
    <VSCodeButton
      appearance="icon"
      className={cx(styles.actionBtn, 'mt-[1px]')}
      onClick={openAddItemPanel}
      aria-label={title}
    >
      <VscDiffAdded data-testid="add-key-value-items-btn" />
    </VSCodeButton>
  </Tooltip>
)

export { AddItemsAction }
