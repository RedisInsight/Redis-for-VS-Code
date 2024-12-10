import React from 'react'
import cx from 'classnames'

import { VscChevronDown, VscChevronRight } from 'react-icons/vsc'
import styles from './styles.module.scss'

export interface Props {
  open?: boolean
  display?: boolean
}

export const Chevron = ({ open = false, display = true }: Props) => {
  if (!display) return null

  return open ? (
    <VscChevronDown className={cx(styles.icon, styles.iconNested)} />
  ) : (
    <VscChevronRight className={cx(styles.icon, styles.iconNested)} />
  )
}
