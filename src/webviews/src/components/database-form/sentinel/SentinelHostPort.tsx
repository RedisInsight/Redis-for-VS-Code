import React from 'react'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import * as l10n from '@vscode/l10n'
import { VscCopy } from 'react-icons/vsc'

import styles from '../styles.module.scss'

export interface Props {
  host: string
  port: string
}

const SentinelHostPort = (props: Props) => {
  const { host, port } = props

  const handleCopy = (text = '') => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className={styles.sentinelCollapsedField}>
      {l10n.t('Host:Port:')}
      <div className={styles.hostPort}>
        <div>{`${host}:${port}`}</div>
        <VSCodeButton
          appearance="icon"
          onClick={() => handleCopy(`${host}:${port}`)}
          aria-label="Copy host:port"
          className={styles.copyHostPortBtn}
          title={l10n.t('Copy')}
        >
          <VscCopy />
        </VSCodeButton>
      </div>
    </div>
  )
}

export { SentinelHostPort }
