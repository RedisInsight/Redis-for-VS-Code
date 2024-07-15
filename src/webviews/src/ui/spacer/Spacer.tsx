import React, { FC } from 'react'
import cx from 'classnames'
import { lowerCase } from 'lodash'

import styles from './styles.module.scss'

export interface Props {
  className?: string
  size?: 'xl' | 's' | 'm' | 'l' | 'xs' | 'xxs',
}

export const Spacer: FC<Props> = (props) => {
  const {
    className,
    size = 'm',
  } = props

  return (
    <div
      className={cx(
        styles.spacer,
        styles[`spacer_${lowerCase(size)}`],
        className,
      )}
    />
  )
}
