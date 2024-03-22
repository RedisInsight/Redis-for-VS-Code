import React from 'react'
import { capitalize } from 'lodash'
import cx from 'classnames'
import * as l10n from '@vscode/l10n'
// import { DatabaseListModules } from 'uiSrc/components'
import { VscInfo } from 'react-icons/vsc'
import Popup from 'reactjs-popup'
import { ConnectionType, Nullable } from 'uiSrc/interfaces'
import { AdditionalRedisModule, Endpoint } from 'uiSrc/store'
import { DatabaseModules } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  connectionType?: ConnectionType
  nameFromProvider?: Nullable<string>
  nodes: Nullable<Endpoint[]>
  host: string
  port: string
  db: Nullable<number>
  modules: AdditionalRedisModule[]
  isFromCloud?: boolean
}

const DbInfo = (props: Props) => {
  const { connectionType, nameFromProvider, nodes = null, host, port, db, modules, isFromCloud } = props

  const AppendEndpoints = () => (
    <Popup
      position="top center"
      on={['hover']}
      trigger={<VscInfo />}
    >
      <span>{l10n.t('Host:port')}</span>
      <ul className={styles.endpointsList}>
        {nodes?.map(({ host: eHost, port: ePort }) => (
          <li key={host + port}>
            <div>{eHost}:{ePort};</div>
          </li>
        ))}
      </ul>
    </Popup>
  )

  return (
    <div className={styles.dbInfoGroup}>
      {!isFromCloud && (
        <div className="flex">
          <div>
            {l10n.t('Connection Type:')}
          </div>
          <div color="default" className={styles.dbInfoListValue} data-testid="connection-type">
            {capitalize(connectionType)}
          </div>
        </div>
      )}

      {nameFromProvider && (
        <div className="flex">
          <div>
            {l10n.t('Database Name from Provider:')}
          </div>
          <div color="default" className={styles.dbInfoListValue} data-testid="name-from-provider">
            {nameFromProvider}
          </div>
        </div>
      )}
      <div className="flex">
        <>
          {!!nodes?.length && <AppendEndpoints />}
          <div>
            {l10n.t('Host:')}
          </div>
          <div color="default" className={styles.dbInfoListValue} data-testid="db-info-host">
            {host}
          </div>
        </>
      </div>

      {!!db && (
        <div className="flex">
          <div>
            {l10n.t('Database Index:')}
          </div>
          <div color="default" className={styles.dbInfoListValue} data-testid="database-index">
            {db}
          </div>
        </div>
      )}

      {!!modules?.length && (
        <div className="flex items-center">
          <div>
            Modules:
          </div>
          <div className={cx(styles.dbInfoListValue, styles.dbInfoModules)}>
            <DatabaseModules modules={modules} />
          </div>
        </div>
      )}
    </div>
  )
}

export { DbInfo }
