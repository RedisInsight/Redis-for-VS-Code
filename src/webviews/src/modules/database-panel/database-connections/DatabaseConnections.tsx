import React from 'react'
import cx from 'classnames'

import { AddDbType } from 'uiSrc/constants'

export interface Props {
  connectionType: AddDbType,
  changeConnectionType: (connectionType: AddDbType) => void,
}

// TODO: will needed for autodiscovery connections
const DatabaseConnections = React.memo((props: Props) => {
  const { connectionType, changeConnectionType } = props

  // const AddDatabaseManually = () => (
  //   <div className={cx(styles.connectionTypeTitle, { [styles.connectionTypeTitleFullWidth]: isFullWidth })}>
  //     Add Database Manually
  //   </div>
  // )

  // const AutoDiscoverDatabase = () => (
  //   <div className={cx(styles.connectionTypeTitle, { [styles.connectionTypeTitleFullWidth]: isFullWidth })}>
  //     Autodiscover Databases
  //   </div>
  // )

  // const getProperManualImage = () => {
  //   if (theme === Theme.Dark) {
  //     return connectionType === AddDbType.manual ? ActiveManualSvg : NotActiveManualSvg
  //   }
  //   return connectionType === AddDbType.manual ? LightActiveManualSvg : LightNotActiveManualSvg
  // }

  // const getProperAutoImage = () => {
  //   if (theme === Theme.Dark) {
  //     return connectionType === AddDbType.auto ? ActiveAutoSvg : NotActiveAutoSvg
  //   }
  //   return connectionType === AddDbType.auto ? LightActiveAutoSvg : LightNotActiveAutoSvg
  // }

  return (
    <div>
      {/* <div>
        <div
          className={
            cx(
              styles.connectionType,
              connectionType === AddDbType.manual ? styles.selectedConnectionType : '',
            )
          }
          onClick={() => changeConnectionType(AddDbType.manual)}
          grow={1}
          data-testid="add-manual"
        >
          <div
            alignItems="center"
            gutterSize="m"
            direction={isFullWidth ? 'row' : 'column'}
          >
            <div grow={false}>
              <div gutterSize="m" alignItems="center">
                <div grow={false}>
                  <EuiIcon
                    className={styles.connectionIcon}
                    type={getProperManualImage()}
                  />
                </div>
                {!isFullWidth && (
                  <div>
                    <AddDatabaseManually />
                  </div>
                )}
              </div>
            </div>
            <div>
              {isFullWidth && (<AddDatabaseManually />)}
              <div
                color="subdued"
                size="s"
                className={cx({ [styles.descriptionNotFullWidth]: !isFullWidth })}
              >
                Use Host and Port to connect to your Redis Database
              </div>
            </div>
          </div>
        </div>
        <div
          className={
            cx(
              styles.connectionType,
              connectionType === AddDbType.auto ? styles.selectedConnectionType : '',
            )
          }
          onClick={() => changeConnectionType(AddDbType.auto)}
          grow={1}
          data-testid="add-auto"
        >
          <div
            alignItems="center"
            gutterSize="m"
            direction={isFullWidth ? 'row' : 'column'}
          >
            <div grow={false}>
              <div gutterSize="m" alignItems="center">
                <div grow={false}>
                  <EuiIcon
                    className={styles.connectionIcon}
                    type={getProperAutoImage()}
                  />
                </div>
                {!isFullWidth && (
                  <div>
                    <AutoDiscoverDatabase />
                  </div>
                )}
              </div>
            </div>
            <div>
              {isFullWidth && (<AutoDiscoverDatabase />)}
              <div
                color="subdued"
                size="s"
                className={cx({ [styles.descriptionNotFullWidth]: !isFullWidth })}
              >
                Use discovery tools to automatically discover and add your Redis Databases
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  )
})

export { DatabaseConnections }
