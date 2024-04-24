import React, { FC } from 'react'
import * as l10n from '@vscode/l10n'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscDiffAdded } from 'react-icons/vsc'

import styles from './styles.module.scss'

export interface Props {
  loading: boolean
  nextCursor?: string
  loadMoreItems?: (config: any) => void
}

// const WARNING_MESSAGE = 'Scanning additional keys may decrease performance and memory available.'

export const ScanMore: FC<Props> = ({
  loading,
  nextCursor,
  loadMoreItems,
}) => (
  <VSCodeButton
    disabled={loading || nextCursor === '0'}
    data-testid="scan-more"
    className={styles.btn}
    onClick={loadMoreItems}
  >
    <VscDiffAdded className="mr-2" />
    {l10n.t('Click to scan more')}
  </VSCodeButton>
)
