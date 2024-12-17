import React from 'react'
import cx from 'classnames'
import { IconBaseProps } from 'react-icons/lib'

import DatabaseOfflineIconSvg from 'uiSrc/assets/database/database_icon_offline.svg?react'
import DatabaseActiveIconSvg from 'uiSrc/assets/database/database_icon_active.svg?react'

export interface Props extends IconBaseProps {
  open?: boolean
  hidden?: boolean
  className?: string
}

export const DatabaseIcon = ({ open = false, hidden = false, className = '', ...props }: Props) => {
  if (hidden) return null

  return open ? (
    <DatabaseActiveIconSvg
      {...props}
      className={cx('sidebar-icon', className)}
     />
  ) : (
    <DatabaseOfflineIconSvg
      {...props}
      className={cx('sidebar-icon', className)}
    />
  )
}
