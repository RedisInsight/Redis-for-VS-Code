import React, { FC, InputHTMLAttributes } from 'react'
import cx from 'classnames'
import { omit } from 'lodash'

import styles from './styles.module.scss'

export interface Props extends InputHTMLAttributes<HTMLInputElement> {
  inputRef?: React.Ref<HTMLInputElement>;
}

export const InputText: FC<Props> = (props) => {
  const { className, inputRef } = props
  return (
    <input
      {...omit(props, 'inputRef')}
      type="text"
      ref={inputRef}
      className={cx(styles.input, className)}
    />
  )
}
