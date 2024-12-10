import React from 'react'
import cx from 'classnames'
import { VscChevronDown, VscChevronRight } from 'react-icons/vsc'
import { IconBaseProps } from 'react-icons/lib'

export interface Props extends IconBaseProps {
  open?: boolean
  hidden?: boolean
  className?: string
}

export const Chevron = ({ open = false, hidden = false, className = '', ...props }: Props) => {
  if (hidden) return null

  return open ? (
    <VscChevronDown
      {...props}
      className={cx('sidebar-icon', 'sidebar-icon-nested', className)}
    />
  ) : (
    <VscChevronRight
      {...props}
      className={cx('sidebar-icon', 'sidebar-icon-nested', className)}
    />
  )
}
