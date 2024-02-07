import React from 'react'
import { capitalize } from 'lodash'

import { Nullable, ConnectionType } from 'uiSrc/interfaces'
import { SentinelMaster } from 'uiSrc/store'

import styles from '../styles.module.scss'

export interface Props {
  connectionType?: ConnectionType
  nameFromProvider?: Nullable<string>
  sentinelMaster?: SentinelMaster
}

const DbInfoSentinel = (props: Props) => {
  const { connectionType, nameFromProvider, sentinelMaster } = props
  // return (
  //   <EuiListGroup className={styles.dbInfoGroup} flush>
  //     <EuiListGroupItem
  //       label={(
  //         <div size="s">
  //           Connection Type:
  //           <div color="default" className={styles.dbInfoListValue}>
  //             {capitalize(connectionType)}
  //           </div>
  //         </div>
  //       )}
  //     />

  //     {sentinelMaster?.name && (
  //       <EuiListGroupItem
  //         label={(
  //           <div size="s">
  //             Primary Group Name:
  //             <div color="default" className={styles.dbInfoListValue}>
  //               {sentinelMaster?.name}
  //             </div>
  //           </div>
  //         )}
  //       />
  //     )}

  //     {nameFromProvider && (
  //       <EuiListGroupItem
  //         label={(
  //           <div size="s">
  //             Database Name from Provider:
  //             <div color="default" className={styles.dbInfoListValue}>
  //               {nameFromProvider}
  //             </div>
  //           </div>
  //         )}
  //       />
  //     )}
  //   </EuiListGroup>
  // )
}

export { DbInfoSentinel }
