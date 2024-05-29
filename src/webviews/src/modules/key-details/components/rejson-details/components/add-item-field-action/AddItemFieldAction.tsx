import React from 'react'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscAdd } from 'react-icons/vsc'

import { getBrackets } from '../../utils'
import styles from '../../styles.module.scss'

export interface Props {
  leftPadding: number
  type: string
  onClickSetKVPair: () => void
}

export const AddItemFieldAction = ({
  leftPadding,
  type,
  onClickSetKVPair,
}: Props) => (
  <div
    className={styles.row}
    style={{ paddingLeft: `${leftPadding}em` }}
  >
    <span className={styles.defaultFont}>{getBrackets(type, 'end')}</span>
    <VSCodeButton
      appearance="icon"
      className={styles.jsonButtonStyle}
      onClick={onClickSetKVPair}
      aria-label="Add field"
      data-testid="add-field-btn"
    >
      <VscAdd />
    </VSCodeButton>
  </div>
)
