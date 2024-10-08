import React from 'react'
import cx from 'classnames'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscTerminal, VscTrash } from 'react-icons/vsc'
import { ConnectionHistory } from 'uiSrc/interfaces'
import styles from './styles.module.scss'

export interface Props {
  activeCliId: string
  cliConnectionsHistory: ConnectionHistory[]
  cliClickHandle: (item: ConnectionHistory) => void
  cliDeleteHandle: (item: ConnectionHistory) => void
}

export const CliHistory = (props: Props) => {
  const { activeCliId, cliConnectionsHistory, cliClickHandle, cliDeleteHandle } = props

  const isActive = (id: string): boolean => activeCliId === id

  return (
    <div className={styles.historyWrapper}>
      <div className="flex w-full" style={{ flexDirection: 'column' }}>
        {cliConnectionsHistory?.map((item) => (
          <div
            className={cx(
              styles.cliItem,
              isActive(item.id) ? styles.active : null,
            )}
            key={item.id}
          >
            <button type="button" onClick={() => cliClickHandle(item)} data-testid={`cli-select-row-${item.id}`}>
              <VscTerminal />
              <span>{item.name}</span>
            </button>
            <VSCodeButton
              appearance="icon"
              onClick={() => cliDeleteHandle(item)}
              aria-label="Delete cli"
              data-testid={`cli-delete-button-${item.id}`}
            >
              <VscTrash />
            </VSCodeButton>
          </div>
        ))}
      </div>
    </div>
  )
}
