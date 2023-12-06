import React, { FC, InputHTMLAttributes } from 'react'
import cx from 'classnames'

import styles from './styles.module.scss'

export const InputText: FC<InputHTMLAttributes<HTMLInputElement>> = (props) => {
  const { className } = props
  return (
    <input
      {...props}
      type="text"
      className={cx(styles.input, className)}
    />
  )
}
