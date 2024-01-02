import React from 'react'
import cx from 'classnames'
import {
  useDispatch,
  useSelector,
} from 'react-redux'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import { VscTerminal, VscTrash } from 'react-icons/vsc'
import { AppDispatch } from 'uiSrc/store'
import { cliSettingsSelector, selectCli, deleteCli } from 'uiSrc/modules/cli/slice/cli-settings'
import { ConnectionHistory } from 'uiSrc/interfaces'
import styles from './styles.module.scss'

export const CliHistory = () => {
  const dispatch = useDispatch<AppDispatch>()
  const {
    activeCliId,
    cliConnectionsHistory,
  } = useSelector(cliSettingsSelector)

  const isActive = (id: string): boolean => activeCliId === id

  const cliClickHandle = (item: ConnectionHistory) => {
    if (item.id !== activeCliId) {
      dispatch(selectCli(item.id))
    }
  }

  const handleDelete = (item: ConnectionHistory) => {
    dispatch(deleteCli(item.id))
  }

  return (
    <div className="flex w-full h-full" style={{ flexDirection: 'column' }}>
      {cliConnectionsHistory?.map((item) => (
        <div
          className={cx(
            styles.cliItem,
            isActive(item.id) ? styles.active : null,
          )}
          onClick={() => cliClickHandle(item)}
          tabIndex={0}
          onKeyDown={() => { }}
          role="button"
          key={item.id}
        >
          <VscTerminal />
          <span>{`${item.host}:${item.port}`}</span>
          <VSCodeButton
            appearance="icon"
            onClick={() => handleDelete(item)}
            aria-label="Delete cli"
            data-testid="delete-button"
          >
            <VscTrash />
          </VSCodeButton>
        </div>
      ))}
    </div>
  )
}
