import React, { useState, useEffect, useRef, MouseEvent } from 'react'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { cliSettingsSelector, closeAllCliConnections, deleteCli, selectCli } from 'uiSrc/modules/cli/slice/cli-settings'
import { AppDispatch } from 'uiSrc/store'

import { ConnectionHistory } from 'uiSrc/interfaces'
import { CliBodyWrapper } from './components/cli-body'
import { CliHistory } from './components/cli-history'
import styles from './styles.module.scss'

export interface Props {
  cliConnectionsHistory: ConnectionHistory[]
}

export const Cli = (props: Props) => {
  const { cliConnectionsHistory } = props
  const cliTableRef = useRef<HTMLTableElement>(null)

  const {
    activeCliId,
  } = useSelector(cliSettingsSelector)

  const dispatch = useDispatch<AppDispatch>()
  const [dragged, setDragged] = useState<boolean>(false)
  const [width, setWidth] = useState<number>(365)

  useEffect(() => () => {
    dispatch(closeAllCliConnections())
  }, [])

  const enableDragging = () => setDragged(true)
  const disableDragging = () => setDragged(false)
  const mouseMoveHandler = (e: MouseEvent) => {
    if (dragged) {
      const width = cliTableRef?.current?.offsetWidth as number - e.clientX
      setWidth(width < 250 ? 250 : width)
    }
  }

  const cliClickHandle = (item: ConnectionHistory) => {
    if (item.id !== activeCliId) {
      dispatch(selectCli(item.id))
    }
  }

  const cliDeleteHandle = (item: ConnectionHistory) => {
    dispatch(deleteCli(item.id))
  }

  return (
    <table
      ref={cliTableRef}
      className={cx('h-full', 'w-full', 'overflow-hidden', dragged ? styles.hoverless : null)}
      data-testid="panel-view-page"
    >
      <tbody>
        <tr onMouseMove={mouseMoveHandler} onMouseUp={disableDragging}>
          <td className="py-1 pl-5" style={{ minWidth: '250px' }}>
            <div className={styles.container} data-testid="cli">
              <div className={styles.main}>
                <CliBodyWrapper />
              </div>
            </div>
          </td>

          {cliConnectionsHistory?.length > 1 && (
            <td style={{ width }} data-testid="history-panel-view">
              <div className="flex h-full" style={{ width }}>
                <div
                  onMouseDown={enableDragging}
                  className={cx(styles.resizer, dragged ? styles.dragged : null)}
                  aria-label="resizer"
                  tabIndex={0}
                  role="treeitem"
                />
                <CliHistory
                  activeCliId={activeCliId}
                  cliConnectionsHistory={cliConnectionsHistory}
                  cliClickHandle={cliClickHandle}
                  cliDeleteHandle={cliDeleteHandle}
                />
              </div>
            </td>
          )}
        </tr>
      </tbody>
    </table>
  )
}
