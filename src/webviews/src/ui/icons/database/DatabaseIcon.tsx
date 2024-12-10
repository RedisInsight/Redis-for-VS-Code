import React from 'react'

import DatabaseOfflineIconSvg from 'uiSrc/assets/database/database_icon_offline.svg?react'
import DatabaseActiveIconSvg from 'uiSrc/assets/database/database_icon_active.svg?react'
import styles from './styles.module.scss'

export interface Props {
  open?: boolean
  display?: boolean
}

export const DatabaseIcon = ({ open = false, display = true }: Props) => {
  if (!display) return null

  return open ? (
    <DatabaseActiveIconSvg className={styles.icon} />
  ) : (
    <DatabaseOfflineIconSvg className={styles.icon} />
  )
}
