import React, { FC } from 'react'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscDiffAdded } from 'react-icons/vsc'

import { Tooltip } from 'uiSrc/ui'
import styles from './styles.module.scss'

export interface Props {
  loading: boolean
  disabled: boolean
  text?: string
  loadMoreItems?: (config: any) => void
}

// const WARNING_MESSAGE = 'Scanning additional keys may decrease performance and memory available.'

export const ScanMore: FC<Props> = ({
  disabled,
  loading,
  text,
  loadMoreItems,
}) => (
  <div className={styles.container}>
    <div className="sidebar-nesting-level" />
    <Tooltip content={(disabled && !loading) ? l10n.t('The entire database has been scanned.') : ''}>
      <VSCodeButton
        disabled={disabled || loading}
        data-testid="scan-more"
        className={styles.btn}
        onClick={loadMoreItems}
      >
        <VscDiffAdded className="mr-1" />
        <div className={styles.textContainer}>
          {l10n.t('Scan more')}
          {text && <div className={styles.text}>{text}</div>}
        </div>
      </VSCodeButton>
    </Tooltip>
  </div>
)
