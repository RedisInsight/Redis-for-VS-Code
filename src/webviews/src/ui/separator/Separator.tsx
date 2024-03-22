import React, { FC } from 'react'
import cx from 'classnames'

import { capitalize } from 'lodash'
import styles from './styles.module.scss'

export interface Props {
  className?: string
  align?: 'horizontal' | 'vertical',
}

export const Separator: FC<Props> = (props) => {
  const {
    className,
    align = 'horizontal',
  } = props

  return (
    <div
      className={cx(
        styles.separator,
        styles[`separator${capitalize(align)}`],
        className,
      )}
    />
  )
}
