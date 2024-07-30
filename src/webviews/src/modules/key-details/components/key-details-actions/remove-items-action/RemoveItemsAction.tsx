import React from 'react'
import cx from 'classnames'
import { VscDiffRemoved } from 'react-icons/vsc'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'

import { Tooltip } from 'uiSrc/ui'
import styles from '../styles.module.scss'

export interface Props {
  title: string
  openRemoveItemPanel: () => void
}

const RemoveItemsAction = ({ title, openRemoveItemPanel }: Props) => (
  <Tooltip content={title}>
    <VSCodeButton
      appearance="icon"
      className={cx(styles.actionBtn, 'mt-[1px]')}
      onClick={openRemoveItemPanel}
      aria-label={title}
    >
      <VscDiffRemoved data-testid="remove-key-value-items-btn" />
    </VSCodeButton>
  </Tooltip>
)

export { RemoveItemsAction }
