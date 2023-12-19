import React, { FC, PropsWithChildren, useState } from 'react'
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import cx from 'classnames'
import { VscChevronRight, VscChevronDown, VscDatabase, VscTerminal, VscAdd } from 'react-icons/vsc'
import { vscodeApi } from 'uiSrc/services'
import { VscodeMessageAction } from 'uiSrc/constants'

import styles from './styles.module.scss'

export const DatabaseWrapper: FC<any> = ({ children }: PropsWithChildren<any>) => {
  const [showTree, setShowTree] = useState<boolean>(true)

  const showTreeToggle = () => setShowTree(!showTree)

  const addKeyClickHandle = () => {
    vscodeApi.postMessage({ action: VscodeMessageAction.AddKey })
  }

  const openCliClickHandle = () => {
    vscodeApi.postMessage({ action: VscodeMessageAction.OpenCli })
  }

  return (
    <div className="w-full">
      <div className="flex justify-between pt-px">
        <div
          onClick={showTreeToggle}
          role="button"
          aria-hidden="true"
          className={styles.databaseNameWrapper}
        >
          {showTree ? <VscChevronDown className={cx(styles.icon, styles.iconNested)} /> : (
            <VscChevronRight
              className={cx(styles.icon, styles.iconNested)}
            />
          )}
          <VscDatabase className={styles.icon} />
          <span className={styles.databaseName}>
            Redis database
          </span>
        </div>
        <div className="flex pr-3.5">
          <VSCodeButton appearance="icon" onClick={addKeyClickHandle}>
            <VscAdd />
          </VSCodeButton>
          <VSCodeButton appearance="icon" onClick={openCliClickHandle}>
            <VscTerminal />
          </VSCodeButton>
        </div>
      </div>
      {showTree && children}
    </div>
  )
}
