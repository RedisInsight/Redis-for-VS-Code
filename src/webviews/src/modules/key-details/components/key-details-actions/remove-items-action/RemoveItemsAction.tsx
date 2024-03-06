import React from 'react'
import cx from 'classnames'
import { VscDiffRemoved } from 'react-icons/vsc'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'

import styles from '../styles.module.scss'

export interface Props {
  title: string
  openRemoveItemPanel: () => void
}

const RemoveItemsAction = ({ title, openRemoveItemPanel }: Props) => (
  <VSCodeButton
    appearance="icon"
    className={cx(styles.actionBtn, 'mt-[3px]')}
    onClick={openRemoveItemPanel}
    aria-label={title}
    title={title}
  >
    <VscDiffRemoved data-testid="remove-key-value-items-btn" />
  </VSCodeButton>
)

export { RemoveItemsAction }
