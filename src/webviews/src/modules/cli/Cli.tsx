import React, { AbstractView, useState, useEffect } from 'react'
import cx from 'classnames'
import {
  useDispatch,
  useSelector,
} from 'react-redux'
import { cliSettingsSelector, closeAllCliConnections } from 'uiSrc/modules/cli/slice/cli-settings'
import { AppDispatch } from 'uiSrc/store'

import { CliBodyWrapper } from './components/cli-body'
import { CliHistory } from './components/cli-history'
import styles from './styles.module.scss'

interface DragEvent extends React.MouseEvent {
  view: AbstractView & { outerWidth: number }
}

export const Cli = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [dragged, setDragged] = useState<boolean>(false)
  const [width, setWidth] = useState<number>(365)

  const {
    cliConnectionsHistory,
  } = useSelector(cliSettingsSelector)

  useEffect(() => () => {
    dispatch(closeAllCliConnections())
  }, [])

  const enableDragging = () => setDragged(true)
  const disableDragging = () => setDragged(false)
  const mouseMoveHandler = (e: React.MouseEvent) => {
    if (dragged) {
      const width = (e as DragEvent).view.outerWidth - e.clientX - 54
      setWidth(width < 250 ? 250 : width)
    }
  }

  return (
    <table className={cx('h-full', 'w-full', 'overflow-hidden', dragged ? styles.hoverless : null)} data-testid="panel-view-page">
      <tbody>
        <tr onMouseMove={mouseMoveHandler} onMouseUp={disableDragging}>
          <td className="py-1 pl-5" style={{ minWidth: '250px' }}>
            <div className={styles.container} data-testid="cli">
              <div className={styles.main}>
                <CliBodyWrapper />
              </div>
            </div>
          </td>
          {cliConnectionsHistory.length > 1 ? (
            <td style={{ width }}>
              <div className="flex h-full" style={{ width }}>
                <div
                  onMouseDown={enableDragging}
                  className={cx(styles.resizer, dragged ? styles.dragged : null)}
                  aria-label="resizer"
                  tabIndex={0}
                  role="treeitem"
                />
                <CliHistory />
              </div>
            </td>
          ) : null}
        </tr>
      </tbody>
    </table>
  )
}
