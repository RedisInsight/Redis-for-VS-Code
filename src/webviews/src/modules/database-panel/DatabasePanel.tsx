import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react'
import * as l10n from '@vscode/l10n'

import { DatabaseType, Nullable } from 'uiSrc/interfaces'
import { AddDbType } from 'uiSrc/constants'
import { ManualConnection } from 'uiSrc/modules'
import { Database } from 'uiSrc/store'
import { DatabaseConnections } from './database-connections'

import styles from './styles.module.scss'

export interface Props {
  editMode?: boolean
  initConnectionType?: AddDbType
  initialValues?: Nullable<Record<string, any>>
  editedDatabase?: Nullable<Database>
  onAliasEdited?: (value: string) => void
}

const DatabasePanel = React.memo((props: Props) => {
  const {
    editMode = false,
    initConnectionType = AddDbType.manual,
  } = props

  const [typeSelected, setTypeSelected] = useState<DatabaseType>(
    DatabaseType.RedisCloudPro,
  )
  const [connectionType, setConnectionType] = useState<AddDbType>(initConnectionType)

  // const { credentials: clusterCredentials } = useSelector(clusterSelector)
  // const { credentials: cloudCredentials } = useSelector(cloudSelector)
  // const { data: sentinelMasters } = useSelector(sentinelSelector)
  // const { action, dbConnection } = useSelector(appRedirectionSelector)

  useEffect(() => {
    if (editMode) {
      setConnectionType(AddDbType.manual)
    }
  }, [editMode])

  // useEffect(() =>
  //   // ComponentWillUnmount
  //   () => {
  //     if (connectionType === AddDbType.manual) return

  //     switch (typeSelected) {
  //       case DatabaseType.Sentinel: {
  //         dispatch(resetDataRedisCloud())
  //         dispatch(resetDataRedisCluster())
  //         break
  //       }
  //       case DatabaseType.RedisCloudPro: {
  //         dispatch(resetDataRedisCluster())
  //         dispatch(resetDataSentinel())
  //         break
  //       }
  //       case DatabaseType.RedisEnterpriseCluster: {
  //         dispatch(resetDataRedisCloud())
  //         dispatch(resetDataSentinel())
  //         break
  //       }
  //       default:
  //         break
  //     }
  //   }, [typeSelected])

  // const typesFormStage: RadioGroupOption[] = [
  //   {
  //     id: DatabaseType.RedisCloudPro,
  //     labelText: DatabaseType.RedisCloudPro,
  //     testid: 'radio-btn-cloud-pro',
  //   },
  //   {
  //     id: DatabaseType.RedisEnterpriseCluster,
  //     labelText: DatabaseType.RedisEnterpriseCluster,
  //     testid: 'radio-btn-enterprise-cluster',
  //   },
  //   {
  //     id: DatabaseType.Sentinel,
  //     labelText: DatabaseType.Sentinel,
  //     testid: 'radio-btn-sentinel',
  //   },
  // ]

  const changeConnectionType = (connectionType: AddDbType) => {
    // dispatch(setUrlHandlingInitialState())
    setConnectionType(connectionType)
  }

  const Form = () => (
    <>
      {connectionType === AddDbType.manual && (
        <ManualConnection {...props} />
      )}
      {/* {connectionType === AddDbType.auto && (
        <>
          {typeSelected === DatabaseType.Sentinel && (
            <SentinelConnectionWrapper {...props} />
          )}
          {typeSelected === DatabaseType.RedisEnterpriseCluster && (
            <ClusterConnectionFormWrapper {...props} />
          )}
          {typeSelected === DatabaseType.RedisCloudPro && (
            <CloudConnectionFormWrapper {...props} />
          )}
        </>
      )} */}
    </>
  )

  return (
    <>
      <div className={cx('relative', styles.container, { addDbWrapper: !editMode })}>
        <div
          className={cx(styles.content)}
          style={{ height: editMode ? 'calc(100vh - 194px)' : 'calc(100vh - 162px)' }}
        >
          {!editMode && (
          <>
            <DatabaseConnections
              {...{ connectionType, changeConnectionType }}
            />
            {/* {connectionType === AddDbType.auto && <Databaseypes />} */}
          </>
          )}
          {Form()}
        </div>
      </div>
      <div id="footerDatabaseForm" className="flex mt-6 w-[660px] justify-end" />
    </>
  )
})

export { DatabasePanel }
