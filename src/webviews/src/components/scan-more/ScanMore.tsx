import React, { FC } from 'react'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscDiffAdded } from 'react-icons/vsc'

import styles from './styles.module.scss'

export interface Props {
  disabled: boolean
  loadMoreItems?: (config: any) => void
}

// const WARNING_MESSAGE = 'Scanning additional keys may decrease performance and memory available.'

export const ScanMore: FC<Props> = ({
  disabled,
  loadMoreItems,
}) => (
  <div className={styles.container}>
    <div className="sidebar-nesting-level" />
    <VSCodeButton
      disabled={disabled}
      data-testid="scan-more"
      className={styles.btn}
      onClick={!disabled ? loadMoreItems : undefined}
      title={disabled ? l10n.t('The entire database has been scanned.') : ''}
    >
      <VscDiffAdded className="mr-1" />
      {l10n.t('Click to scan more')}
    </VSCodeButton>
  </div>
)
